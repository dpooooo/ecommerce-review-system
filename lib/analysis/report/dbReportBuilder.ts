import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { buildReportSchema } from "@/lib/analysis/report/reportBuilder";
import { safeRate } from "@/lib/format";
import type { MetricSnapshot, ReportSchema } from "@/lib/analysis/types";

function toDate(value: string | null | undefined, fallback: Date) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : date;
}

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function emptyMetric(): MetricSnapshot {
  return {
    traffic: 0,
    gmv: 0,
    gsv: 0,
    orders: 0,
    conversionRate: 0,
    aov: 0,
    refundAmount: 0,
    refundRate: 0,
    spend: 0,
    roi: 0
  };
}

function summarizeShopMetrics(rows: Array<{ traffic: number; gmv: number; gsv: number; orders: number; refundAmount: number }>): MetricSnapshot {
  const metric = rows.reduce(
    (sum, row) => ({
      traffic: sum.traffic + row.traffic,
      gmv: sum.gmv + row.gmv,
      gsv: sum.gsv + row.gsv,
      orders: sum.orders + row.orders,
      refundAmount: sum.refundAmount + row.refundAmount
    }),
    { traffic: 0, gmv: 0, gsv: 0, orders: 0, refundAmount: 0 }
  );
  return {
    ...metric,
    conversionRate: safeRate(metric.orders, metric.traffic),
    aov: safeRate(metric.gmv, metric.orders),
    refundRate: safeRate(metric.refundAmount, metric.gmv),
    spend: 0,
    roi: 0
  };
}

async function promotionSummary(shopId: string, start: Date, end: Date) {
  const rows = await prisma.promotionMetric.findMany({ where: { shopId, date: { gte: start, lte: end } } });
  const spend = rows.reduce((sum, row) => sum + row.spend, 0);
  const promoGmv = rows.reduce((sum, row) => sum + row.promoGmv, 0);
  return { spend, roi: safeRate(promoGmv, spend) };
}

export async function buildReportFromDb(params: {
  userId: string;
  shopId?: string;
  currentStart?: string;
  currentEnd?: string;
  previousStart?: string;
  previousEnd?: string;
  persist?: boolean;
}): Promise<ReportSchema> {
  const now = new Date();
  const defaultCurrentEnd = now;
  const defaultCurrentStart = new Date(now);
  defaultCurrentStart.setDate(now.getDate() - 30);
  const defaultPreviousEnd = new Date(defaultCurrentStart);
  defaultPreviousEnd.setDate(defaultPreviousEnd.getDate() - 1);
  const defaultPreviousStart = new Date(defaultPreviousEnd);
  defaultPreviousStart.setDate(defaultPreviousEnd.getDate() - 30);

  const shop = params.shopId
    ? await prisma.shop.findFirst({ where: { id: params.shopId, userId: params.userId } })
    : await prisma.shop.findFirst({ where: { userId: params.userId }, orderBy: { createdAt: "asc" } });

  if (!shop) {
    return buildReportSchema();
  }

  const currentStart = toDate(params.currentStart, defaultCurrentStart);
  const currentEnd = toDate(params.currentEnd, defaultCurrentEnd);
  const previousStart = toDate(params.previousStart, defaultPreviousStart);
  const previousEnd = toDate(params.previousEnd, defaultPreviousEnd);

  const [currentShopRows, previousShopRows, products, promotionPlans, trafficSources, userProfiles, currentPromotion, previousPromotion] = await Promise.all([
    prisma.shopMetric.findMany({ where: { shopId: shop.id, date: { gte: currentStart, lte: currentEnd } }, orderBy: { date: "asc" } }),
    prisma.shopMetric.findMany({ where: { shopId: shop.id, date: { gte: previousStart, lte: previousEnd } }, orderBy: { date: "asc" } }),
    prisma.productMetric.findMany({ where: { shopId: shop.id, date: { gte: currentStart, lte: currentEnd } } }),
    prisma.promotionPlanMetric.findMany({ where: { shopId: shop.id, date: { gte: currentStart, lte: currentEnd } } }),
    prisma.trafficSourceMetric.findMany({ where: { shopId: shop.id, date: { gte: currentStart, lte: currentEnd } } }),
    prisma.userProfileMetric.findMany({ where: { shopId: shop.id, date: { gte: currentStart, lte: currentEnd } } }),
    promotionSummary(shop.id, currentStart, currentEnd),
    promotionSummary(shop.id, previousStart, previousEnd)
  ]);

  const current = currentShopRows.length ? summarizeShopMetrics(currentShopRows) : emptyMetric();
  const previous = previousShopRows.length ? summarizeShopMetrics(previousShopRows) : emptyMetric();
  current.spend = currentPromotion.spend;
  current.roi = currentPromotion.roi;
  previous.spend = previousPromotion.spend;
  previous.roi = previousPromotion.roi;

  const report = buildReportSchema({
    reportId: crypto.randomUUID(),
    shop: { id: shop.id, name: shop.name, platform: shop.platform },
    current,
    previous,
    products: products.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      traffic: item.traffic,
      gmv: item.gmv,
      gsv: item.gsv,
      orders: item.orders,
      conversionRate: item.conversionRate,
      aov: item.aov,
      refundAmount: item.refundAmount,
      refundRate: item.refundRate,
      stock: item.stock,
      searchImpressions: item.searchImpressions
    })),
    promotionPlans: promotionPlans.map((item) => ({
      planId: item.planId,
      planName: item.planName,
      spend: item.spend,
      revenue: item.revenue,
      orders: item.orders,
      roi: item.roi,
      conversionRate: item.conversionRate,
      impressions: item.impressions,
      clicks: item.clicks,
      ctr: item.ctr,
      cpc: item.cpc
    })),
    trafficSources: trafficSources.map((item) => ({
      channel: item.channel,
      source1: item.source1 || "",
      source2: item.source2 || "",
      source3: item.source3 || "",
      visitors: item.visitors,
      buyers: item.buyers,
      conversionRate: item.conversionRate,
      revenue: item.revenue,
      uvValue: item.uvValue
    })),
    userProfiles: userProfiles.map((item) => ({
      userType: item.userType,
      dimension: item.dimension,
      dimensionValue: item.dimensionValue,
      visitors: item.visitors,
      buyers: item.buyers,
      orders: item.orders,
      gmv: item.gmv,
      aov: item.aov,
      conversionRate: item.conversionRate
    })),
    trendData: currentShopRows.map((item) => ({
      date: `${item.date.getMonth() + 1}-${String(item.date.getDate()).padStart(2, "0")}`,
      gmv: item.gmv / 10000,
      gsv: item.gsv / 10000
    })),
    period: {
      current: { start: isoDate(currentStart), end: isoDate(currentEnd) },
      previous: { start: isoDate(previousStart), end: isoDate(previousEnd) }
    }
  });

  if (params.persist) {
    const saved = await prisma.analysisReport.create({
      data: {
        userId: params.userId,
        shopId: shop.id,
        title: report.title,
        currentStart,
        currentEnd,
        previousStart,
        previousEnd,
        summaryJson: report.executiveSummary as Prisma.InputJsonValue,
        reportJson: report as unknown as Prisma.InputJsonValue
      }
    });
    await prisma.actionItem.createMany({
      data: report.actionItems.map((item) => ({
        reportId: saved.id,
        shopId: shop.id,
        priority: String(item.priority),
        title: String(item.title),
        action: String(item.action),
        targetMetric: String(item.targetMetric),
        estimatedImpact: String(item.estimatedImpact),
        owner: String(item.owner || "运营负责人"),
        status: String(item.status || "未开始"),
        sourceType: "analysis_report",
        sourceId: saved.id,
        sourceEvidence: (item.sourceEvidence || {}) as Prisma.InputJsonValue
      }))
    });
    report.reportId = saved.id;
  }

  return report;
}
