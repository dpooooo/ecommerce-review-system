import { readFile } from "fs/promises";
import { PrismaClient } from "@prisma/client";
import { deriveShopMetric, cleanNumber } from "@/lib/analysis/standardize/cleaner";
import { guessFieldMapping } from "@/lib/analysis/standardize/fieldMapping";
import { parseBuffer } from "@/lib/upload/parser";

type Mapping = Array<{ originalField: string; standardField: string }>;

function applyMapping(rows: Array<Record<string, unknown>>, mapping: Mapping) {
  const usableMapping = mapping.filter((item) => item.standardField);
  return rows.map((row) => {
    const next: Record<string, unknown> = {};
    usableMapping.forEach((item) => {
      next[item.standardField] = row[item.originalField];
    });
    return next;
  });
}

function asText(value: unknown, fallback = "") {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function metricDate(row: Record<string, unknown>, batch: { periodEnd: Date }) {
  const periodEnd = asText(row.periodEnd);
  if (!periodEnd) return batch.periodEnd;

  const date = new Date(`${periodEnd}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? batch.periodEnd : date;
}

export async function importUploadedFile(params: {
  prisma: PrismaClient;
  batch: { id: string; shopId: string; periodEnd: Date };
  file: { storedPath: string; originalName: string; reportType: string };
  mapping?: Mapping;
}) {
  const bytes = await readFile(params.file.storedPath);
  const parsed = parseBuffer(bytes, params.file.originalName);
  if (parsed.error) {
    throw new Error(parsed.error);
  }

  const mapping = params.mapping?.length ? params.mapping : guessFieldMapping(parsed.rawColumns);
  const rows = applyMapping(parsed.rawData, mapping);

  if (params.file.reportType === "shop") {
    await params.prisma.shopMetric.createMany({
      data: rows.map((row) => ({
        shopId: params.batch.shopId,
        batchId: params.batch.id,
        date: metricDate(row, params.batch),
        ...deriveShopMetric(row)
      }))
    });
    return { importedRows: rows.length, target: "ShopMetric" };
  }

  if (params.file.reportType === "product") {
    const grouped = new Map<string, Record<string, number | string>>();
    rows.forEach((row) => {
      const productId = asText(row.productId);
      const productName = asText(row.productName);
      if (!productId || ["合计", "总计"].includes(productName)) return;
      const date = metricDate(row, params.batch);
      const groupKey = `${date.toISOString()}::${productId}`;
      const current = grouped.get(groupKey) || { productId, productName, date: date.toISOString(), traffic: 0, gmv: 0, orders: 0, refundAmount: 0, stock: 0, searchImpressions: 0 };
      current.traffic = Number(current.traffic) + cleanNumber(row.traffic);
      current.gmv = Number(current.gmv) + cleanNumber(row.gmv);
      current.orders = Number(current.orders) + cleanNumber(row.orders);
      current.refundAmount = Number(current.refundAmount) + cleanNumber(row.refundAmount);
      current.stock = Number(current.stock) + cleanNumber(row.stock);
      current.searchImpressions = Number(current.searchImpressions) + cleanNumber(row.searchImpressions);
      grouped.set(groupKey, current);
    });
    const data = [...grouped.values()].map((row) => {
      const gmv = Number(row.gmv);
      const orders = Number(row.orders);
      const traffic = Number(row.traffic);
      const refundAmount = Number(row.refundAmount);
      return {
        shopId: params.batch.shopId,
        batchId: params.batch.id,
        date: new Date(String(row.date)),
        productId: String(row.productId),
        productName: String(row.productName),
        traffic,
        gmv,
        gsv: gmv - refundAmount,
        orders,
        conversionRate: traffic ? orders / traffic : 0,
        aov: orders ? gmv / orders : 0,
        refundAmount,
        refundRate: gmv ? refundAmount / gmv : 0,
        stock: Number(row.stock),
        searchImpressions: Number(row.searchImpressions)
      };
    });
    if (data.length) await params.prisma.productMetric.createMany({ data });
    return { importedRows: data.length, target: "ProductMetric" };
  }

  if (params.file.reportType === "promotion") {
    await params.prisma.promotionMetric.createMany({
      data: rows.map((row) => {
        const spend = cleanNumber(row.spend);
        const impressions = cleanNumber(row.impressions);
        const clicks = cleanNumber(row.clicks);
        const promoGmv = cleanNumber(row.promoGmv);
        return {
          shopId: params.batch.shopId,
          batchId: params.batch.id,
          date: metricDate(row, params.batch),
          spend,
          impressions,
          clicks,
          ctr: cleanNumber(row.ctr, true) || (impressions ? clicks / impressions : 0),
          cpc: cleanNumber(row.cpc) || (clicks ? spend / clicks : 0),
          traffic: cleanNumber(row.traffic),
          orders: cleanNumber(row.orders),
          promoGmv,
          roi: cleanNumber(row.roi) || (spend ? promoGmv / spend : 0)
        };
      })
    });
    return { importedRows: rows.length, target: "PromotionMetric" };
  }

  if (params.file.reportType === "traffic_source") {
    await params.prisma.trafficSourceMetric.createMany({
      data: rows.map((row) => {
        const visitors = cleanNumber(row.visitors);
        const buyers = cleanNumber(row.buyers);
        const revenue = cleanNumber(row.revenue);
        return {
          shopId: params.batch.shopId,
          batchId: params.batch.id,
          date: metricDate(row, params.batch),
          channel: asText(row.channel, "未命名渠道"),
          source1: asText(row.source1) || null,
          source2: asText(row.source2) || null,
          source3: asText(row.source3) || null,
          visitors,
          buyers,
          conversionRate: cleanNumber(row.conversionRate, true) || (visitors ? buyers / visitors : 0),
          revenue,
          uvValue: cleanNumber(row.uvValue) || (visitors ? revenue / visitors : 0)
        };
      })
    });
    return { importedRows: rows.length, target: "TrafficSourceMetric" };
  }

  if (params.file.reportType === "user_profile") {
    await params.prisma.userProfileMetric.createMany({
      data: rows.map((row) => {
        const visitors = cleanNumber(row.visitors);
        const buyers = cleanNumber(row.buyers);
        const gmv = cleanNumber(row.gmv);
        const orders = cleanNumber(row.orders) || buyers;
        return {
          shopId: params.batch.shopId,
          batchId: params.batch.id,
          date: metricDate(row, params.batch),
          userType: asText(row.userType, "未分类用户"),
          dimension: asText(row.dimension, "默认维度"),
          dimensionValue: asText(row.dimensionValue, "未分类"),
          visitors,
          buyers,
          orders,
          gmv,
          aov: cleanNumber(row.aov) || (orders ? gmv / orders : 0),
          conversionRate: cleanNumber(row.conversionRate, true) || (visitors ? buyers / visitors : 0)
        };
      })
    });
    return { importedRows: rows.length, target: "UserProfileMetric" };
  }

  if (params.file.reportType === "promotion_plan") {
    await params.prisma.promotionPlanMetric.createMany({
      data: rows.map((row) => {
        const spend = cleanNumber(row.spend);
        const revenue = cleanNumber(row.revenue);
        const impressions = cleanNumber(row.impressions);
        const clicks = cleanNumber(row.clicks);
        return {
          shopId: params.batch.shopId,
          batchId: params.batch.id,
          date: metricDate(row, params.batch),
          planId: asText(row.planId, crypto.randomUUID()),
          planName: asText(row.planName, "未命名计划"),
          spend,
          revenue,
          orders: cleanNumber(row.orders),
          roi: cleanNumber(row.roi) || (spend ? revenue / spend : 0),
          conversionRate: cleanNumber(row.conversionRate, true),
          impressions,
          clicks,
          ctr: cleanNumber(row.ctr, true) || (impressions ? clicks / impressions : 0),
          cpc: cleanNumber(row.cpc) || (clicks ? spend / clicks : 0)
        };
      })
    });
    return { importedRows: rows.length, target: "PromotionPlanMetric" };
  }

  if (params.file.reportType === "promotion_audience") {
    await params.prisma.promotionAudienceMetric.createMany({
      data: rows.map((row) => {
        const spend = cleanNumber(row.spend);
        const revenue = cleanNumber(row.revenue);
        const impressions = cleanNumber(row.impressions);
        const clicks = cleanNumber(row.clicks);
        return {
          shopId: params.batch.shopId,
          batchId: params.batch.id,
          date: metricDate(row, params.batch),
          planId: asText(row.planId, "unknown-plan"),
          unitId: asText(row.unitId, "unknown-unit"),
          audienceId: asText(row.audienceId, crypto.randomUUID()),
          audienceName: asText(row.audienceName, "未命名人群"),
          spend,
          revenue,
          orders: cleanNumber(row.orders),
          roi: cleanNumber(row.roi) || (spend ? revenue / spend : 0),
          conversionRate: cleanNumber(row.conversionRate, true),
          impressions,
          clicks,
          ctr: cleanNumber(row.ctr, true) || (impressions ? clicks / impressions : 0),
          cpc: cleanNumber(row.cpc) || (clicks ? spend / clicks : 0)
        };
      })
    });
    return { importedRows: rows.length, target: "PromotionAudienceMetric" };
  }

  throw new Error(`暂不支持的报表类型：${params.file.reportType}`);
}
