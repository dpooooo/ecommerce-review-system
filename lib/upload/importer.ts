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
  const dataDate = asText(row.date);
  if (dataDate) {
    const date = new Date(`${dataDate}T00:00:00Z`);
    if (!Number.isNaN(date.getTime())) return date;
  }

  const month = asText(row.month);
  if (/^\d{4}-\d{2}$/.test(month)) {
    const [year, monthNumber] = month.split("-").map(Number);
    return new Date(Date.UTC(year, monthNumber, 0));
  }

  const periodEnd = asText(row.periodEnd);
  if (!periodEnd) return batch.periodEnd;

  const date = new Date(`${periodEnd}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? batch.periodEnd : date;
}

function valueOrFallback(value: unknown, fallback: number, percent = false) {
  const parsed = cleanNumber(value, percent);
  return parsed || fallback;
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
      if (!productId || ["鍚堣", "鎬昏"].includes(productName)) return;
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

  if (params.file.reportType === "promotion_plan") {
    await params.prisma.promotionPlanMetric.createMany({
      data: rows.map((row) => {
        const spend = cleanNumber(row.spend);
        const directOrders = cleanNumber(row.directOrders);
        const directRevenue = cleanNumber(row.directRevenue);
        const indirectOrders = cleanNumber(row.indirectOrders);
        const indirectRevenue = cleanNumber(row.indirectRevenue);
        const orders = valueOrFallback(row.orders, directOrders + indirectOrders);
        const revenue = valueOrFallback(row.revenue, directRevenue + indirectRevenue);
        const impressions = cleanNumber(row.impressions);
        const clicks = cleanNumber(row.clicks);
        const addCarts = cleanNumber(row.addCarts);
        return {
          shopId: params.batch.shopId,
          batchId: params.batch.id,
          date: metricDate(row, params.batch),
          planId: asText(row.planId, crypto.randomUUID()),
          planName: asText(row.planName, "未命名计划"),
          spend,
          revenue,
          orders,
          roi: valueOrFallback(row.roi, spend ? revenue / spend : 0),
          conversionRate: cleanNumber(row.conversionRate, true),
          impressions,
          clicks,
          ctr: cleanNumber(row.ctr, true) || (impressions ? clicks / impressions : 0),
          cpm: valueOrFallback(row.cpm, impressions ? (spend / impressions) * 1000 : 0),
          cpc: valueOrFallback(row.cpc, clicks ? spend / clicks : 0),
          directOrders,
          directRevenue,
          indirectOrders,
          indirectRevenue,
          addCarts,
          addCartRate: valueOrFallback(row.addCartRate, clicks ? addCarts / clicks : 0, true),
          orderCost: valueOrFallback(row.orderCost, orders ? spend / orders : 0),
          newCustomerOrders: cleanNumber(row.newCustomerOrders),
          adVisitors: cleanNumber(row.adVisitors)
        };
      })
    });
    return { importedRows: rows.length, target: "PromotionPlanMetric" };
  }

  if (params.file.reportType === "promotion_audience") {
    await params.prisma.promotionAudienceMetric.createMany({
      data: rows.map((row) => {
        const spend = cleanNumber(row.spend);
        const directOrders = cleanNumber(row.directOrders);
        const directRevenue = cleanNumber(row.directRevenue);
        const indirectOrders = cleanNumber(row.indirectOrders);
        const indirectRevenue = cleanNumber(row.indirectRevenue);
        const orders = valueOrFallback(row.orders, directOrders + indirectOrders);
        const revenue = valueOrFallback(row.revenue, directRevenue + indirectRevenue);
        const impressions = cleanNumber(row.impressions);
        const clicks = cleanNumber(row.clicks);
        const addCarts = cleanNumber(row.addCarts);
        return {
          shopId: params.batch.shopId,
          batchId: params.batch.id,
          date: metricDate(row, params.batch),
          planId: asText(row.planId, "unknown-plan"),
          planName: asText(row.planName),
          unitId: asText(row.unitId, "unknown-unit"),
          unitName: asText(row.unitName),
          audienceId: asText(row.audienceId, crypto.randomUUID()),
          audienceName: asText(row.audienceName, "未命名人群"),
          spend,
          revenue,
          orders,
          roi: valueOrFallback(row.roi, spend ? revenue / spend : 0),
          conversionRate: cleanNumber(row.conversionRate, true),
          impressions,
          clicks,
          ctr: cleanNumber(row.ctr, true) || (impressions ? clicks / impressions : 0),
          cpm: valueOrFallback(row.cpm, impressions ? (spend / impressions) * 1000 : 0),
          cpc: valueOrFallback(row.cpc, clicks ? spend / clicks : 0),
          directOrders,
          directRevenue,
          indirectOrders,
          indirectRevenue,
          addCarts,
          addCartRate: valueOrFallback(row.addCartRate, clicks ? addCarts / clicks : 0, true),
          orderCost: valueOrFallback(row.orderCost, orders ? spend / orders : 0)
        };
      })
    });
    return { importedRows: rows.length, target: "PromotionAudienceMetric" };
  }
  throw new Error(`鏆備笉鏀寔鐨勬姤琛ㄧ被鍨嬶細${params.file.reportType}`);
}
