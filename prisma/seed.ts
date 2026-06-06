import { Prisma, PrismaClient } from "@prisma/client";
import { hashPassword } from "../lib/auth/password";
import { buildReportSchema } from "../lib/analysis/report/reportBuilder";
import { currentShopMetrics, previousShopMetrics, productMetrics, promotionPlans } from "../lib/demo-data";

const prisma = new PrismaClient();

function shopMetricData(metrics: typeof currentShopMetrics) {
  const { spend: _spend, roi: _roi, ...shopMetric } = metrics;
  return shopMetric;
}

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@example.com" },
    update: {},
    create: {
      name: "管理员",
      email: "admin@example.com",
      passwordHash: await hashPassword("123456"),
      role: "admin"
    }
  });

  const shops = await Promise.all(
    [
      { name: "天猫旗舰店", platform: "TMALL", shopCode: "tmall-demo" },
      { name: "京东自营店", platform: "JD", shopCode: "jd-demo" },
      { name: "抖音官方店", platform: "DOUYIN", shopCode: "douyin-demo" }
    ].map((shop) =>
      prisma.shop.upsert({
        where: { id: `${shop.platform.toLowerCase()}-shop` },
        update: shop,
        create: { id: `${shop.platform.toLowerCase()}-shop`, userId: admin.id, ...shop }
      })
    )
  );

  await prisma.fieldMapping.createMany({
    data: [
      { platform: "TMALL", reportType: "shop", originalField: "访客数", standardField: "traffic" },
      { platform: "TMALL", reportType: "shop", originalField: "GMV", standardField: "gmv" },
      { platform: "TMALL", reportType: "shop", originalField: "GSV", standardField: "gsv" },
      { platform: "TMALL", reportType: "shop", originalField: "订单数", standardField: "orders" },
      { platform: "TMALL", reportType: "shop", originalField: "退款金额", standardField: "refundAmount" },
      { platform: "TMALL", reportType: "product", originalField: "商品ID", standardField: "productId" },
      { platform: "TMALL", reportType: "product", originalField: "商品名称", standardField: "productName" },
      { platform: "TMALL", reportType: "promotion", originalField: "推广花费", standardField: "spend" },
      { platform: "TMALL", reportType: "promotion", originalField: "推广成交", standardField: "promoGmv" },
      { platform: "TMALL", reportType: "promotion", originalField: "ROI", standardField: "roi" }
    ],
    skipDuplicates: true
  });

  const shop = shops[0];
  const currentBatch = await prisma.uploadBatch.create({
    data: {
      userId: admin.id,
      shopId: shop.id,
      platform: shop.platform,
      periodType: "current",
      periodStart: new Date("2024-05-01"),
      periodEnd: new Date("2024-05-31"),
      status: "imported"
    }
  });
  const previousBatch = await prisma.uploadBatch.create({
    data: {
      userId: admin.id,
      shopId: shop.id,
      platform: shop.platform,
      periodType: "previous",
      periodStart: new Date("2024-04-01"),
      periodEnd: new Date("2024-04-30"),
      status: "imported"
    }
  });

  await prisma.shopMetric.createMany({
    data: [
      { shopId: shop.id, batchId: currentBatch.id, date: new Date("2024-05-31"), ...shopMetricData(currentShopMetrics) },
      { shopId: shop.id, batchId: previousBatch.id, date: new Date("2024-04-30"), ...shopMetricData(previousShopMetrics) }
    ]
  });

  await prisma.productMetric.createMany({
    data: productMetrics.map((item) => ({
      shopId: shop.id,
      batchId: currentBatch.id,
      date: new Date("2024-05-31"),
      stock: 1000,
      searchImpressions: item.traffic * 2,
      ...item
    }))
  });

  await prisma.promotionPlanMetric.createMany({
    data: promotionPlans.map((item) => ({
      shopId: shop.id,
      batchId: currentBatch.id,
      date: new Date("2024-05-31"),
      impressions: 120000,
      clicks: Math.round(120000 * item.ctr),
      conversionRate: item.orders / Math.max(1, Math.round(120000 * item.ctr)),
      ...item
    }))
  });

  const report = buildReportSchema({ shop: { id: shop.id, name: shop.name, platform: shop.platform } });
  const savedReport = await prisma.analysisReport.create({
    data: {
      userId: admin.id,
      shopId: shop.id,
      title: report.title,
      currentStart: new Date(report.period.current.start),
      currentEnd: new Date(report.period.current.end),
      previousStart: new Date(report.period.previous.start),
      previousEnd: new Date(report.period.previous.end),
      summaryJson: report.executiveSummary as Prisma.InputJsonValue,
      reportJson: report as unknown as Prisma.InputJsonValue
    }
  });

  await prisma.actionItem.createMany({
    data: report.actionItems.map((item) => ({
      reportId: savedReport.id,
      shopId: shop.id,
      priority: String(item.priority),
      title: String(item.title),
      action: String(item.action),
      targetMetric: String(item.targetMetric),
      estimatedImpact: String(item.estimatedImpact),
      owner: String(item.owner || "运营负责人"),
      status: String(item.status || "未开始"),
      sourceType: "analysis",
      sourceId: savedReport.id,
      sourceEvidence: (item.sourceEvidence || {}) as Prisma.InputJsonValue
    }))
  });

  console.log("Seed completed. admin@example.com / 123456");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
