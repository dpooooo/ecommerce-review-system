type ProductRow = Record<string, number | string>;

type ProductMetric = {
  productId: string;
  productName: string;
  traffic: number;
  gmv: number;
  gsv: number;
  orders: number;
  conversionRate: number;
  aov: number;
  refundAmount: number;
  refundRate: number;
  previousGmv: number;
  previousTraffic: number;
  previousConversionRate: number;
  gmvChange: number;
  gmvShare: number;
  rank: number;
  tag: string;
  issueType: string;
  reason: string;
  action: string;
};

function toNumber(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

function productKey(item: ProductRow) {
  return String(item.productId || item.productName || "unknown");
}

function aggregateProducts(rows: ProductRow[]) {
  const map = new Map<string, ProductMetric>();
  for (const row of rows) {
    const key = productKey(row);
    const current = map.get(key) || {
      productId: String(row.productId || key),
      productName: String(row.productName || row.productId || "未命名商品"),
      traffic: 0,
      gmv: 0,
      gsv: 0,
      orders: 0,
      conversionRate: 0,
      aov: 0,
      refundAmount: 0,
      refundRate: 0,
      previousGmv: 0,
      previousTraffic: 0,
      previousConversionRate: 0,
      gmvChange: 0,
      gmvShare: 0,
      rank: 0,
      tag: "",
      issueType: "",
      reason: "",
      action: ""
    };
    current.traffic += toNumber(row.traffic);
    current.gmv += toNumber(row.gmv);
    current.gsv += toNumber(row.gsv);
    current.orders += toNumber(row.orders);
    current.refundAmount += toNumber(row.refundAmount);
    map.set(key, current);
  }

  return [...map.values()].map((item) => ({
    ...item,
    conversionRate: item.traffic ? item.orders / item.traffic : 0,
    aov: item.orders ? item.gmv / item.orders : 0,
    refundRate: item.gmv ? item.refundAmount / item.gmv : 0
  }));
}

function classifyProduct(item: ProductMetric, isMainProduct: boolean) {
  const growing = item.gmvChange > 0;
  if (isMainProduct && growing) return "明星商品";
  if (isMainProduct && !growing) return "现金牛商品";
  if (!isMainProduct && growing) return "潜力商品";
  return "问题商品";
}

function issueType(item: ProductMetric, avgConversion: number) {
  if (item.refundRate >= 0.15) return "退款风险";
  if (item.gmvChange < 0 && item.traffic < item.previousTraffic) return "流量/成交下滑";
  if (item.conversionRate < avgConversion * 0.7) return "转化偏弱";
  if (item.gmvChange > 0) return "优秀商品";
  return "观察商品";
}

function issueReason(item: ProductMetric, type: string) {
  if (type === "退款风险") return "退款率偏高，需关注质量、尺码、发货或描述一致性。";
  if (type === "流量/成交下滑") return "GMV下滑且流量减少，需检查搜索、推荐或投放资源位。";
  if (type === "转化偏弱") return "转化率低于商品均值，需检查主图、价格、评价和促销承接。";
  if (type === "优秀商品") return "成交表现较好，可继续观察库存、评价和投放承接。";
  return "当前表现未触发高优先级风险，建议保持观察。";
}

function actionSuggestion(tag: string, issue: string) {
  if (tag === "明星商品") return "继续加资源，保障库存和投放承接。";
  if (tag === "现金牛商品") return "守住基本盘，重点排查退款、价格和流量下滑。";
  if (tag === "潜力商品") return "小预算测试放量，验证能否进入主推池。";
  if (issue === "退款风险") return "优先处理售后原因，排查质量、尺码、发货和描述一致性。";
  return "减少资源占用，优先处理退款和转化问题。";
}

export function productAnalysis(products: ProductRow[], previousProducts: ProductRow[] = []) {
  const currentProducts = aggregateProducts(products).sort((a, b) => b.gmv - a.gmv);
  const previousMap = new Map(aggregateProducts(previousProducts).map((item) => [item.productId || item.productName, item]));
  const totalGmv = currentProducts.reduce((sum, item) => sum + item.gmv, 0);
  const avgTraffic = currentProducts.reduce((sum, item) => sum + item.traffic, 0) / Math.max(currentProducts.length, 1);
  const avgConversion = currentProducts.reduce((sum, item) => sum + item.conversionRate, 0) / Math.max(currentProducts.length, 1);
  const mainCount = Math.min(Math.max(5, Math.ceil(currentProducts.length * 0.2)), Math.max(currentProducts.length, 1));

  const enrichedProducts = currentProducts.map((item, index) => {
    const previous = previousMap.get(item.productId) || previousMap.get(item.productName);
    const previousGmv = previous?.gmv || 0;
    const previousTraffic = previous?.traffic || 0;
    const previousConversionRate = previous?.conversionRate || 0;
    const rank = index + 1;
    const isMainProduct = rank <= mainCount || item.gmv >= totalGmv / Math.max(currentProducts.length, 1);
    const tag = classifyProduct({ ...item, previousGmv, previousTraffic, previousConversionRate, gmvChange: item.gmv - previousGmv }, isMainProduct);
    const next: ProductMetric = {
      ...item,
      previousGmv,
      previousTraffic,
      previousConversionRate,
      gmvChange: item.gmv - previousGmv,
      gmvShare: totalGmv ? item.gmv / totalGmv : 0,
      rank,
      tag,
      issueType: "",
      reason: "",
      action: ""
    };
    next.issueType = issueType(next, avgConversion);
    next.reason = issueReason(next, next.issueType);
    next.action = actionSuggestion(next.tag, next.issueType);
    return next;
  });

  const quadrants = [
    { key: "star", name: "明星商品", advice: "GMV排名靠前且仍在增长，继续加资源并保障库存。" },
    { key: "cashCow", name: "现金牛商品", advice: "GMV排名靠前但增长不足，守住基本盘并排查退款和流量下滑。" },
    { key: "potential", name: "潜力商品", advice: "非主力商品但增长较好，适合小预算测试放量。" },
    { key: "problem", name: "问题商品", advice: "非主力且增长不足，控制资源占用并优先治理问题。" }
  ].map((quadrant) => {
    const rows = enrichedProducts.filter((item) => {
      if (quadrant.key === "star") return item.tag === "明星商品";
      if (quadrant.key === "cashCow") return item.tag === "现金牛商品";
      if (quadrant.key === "potential") return item.tag === "潜力商品";
      return item.tag === "问题商品";
    });
    return {
      ...quadrant,
      count: rows.length,
      gmv: rows.reduce((sum, item) => sum + item.gmv, 0),
      gmvChange: rows.reduce((sum, item) => sum + item.gmvChange, 0),
      samples: rows.slice(0, 3).map((item) => item.productName)
    };
  });

  const topProducts = enrichedProducts.slice(0, 10);
  const riskProducts = enrichedProducts
    .filter((item) => item.issueType === "退款风险" || item.issueType === "流量/成交下滑" || item.issueType === "转化偏弱" || item.gmvChange < 0)
    .sort((a, b) => Math.abs(b.gmvChange) + b.refundAmount - (Math.abs(a.gmvChange) + a.refundAmount))
    .slice(0, 8);
  const anomalies = riskProducts.slice(0, 10).map((item) => ({
    priority: item.issueType === "退款风险" && item.gmvShare > 0.1 ? "P0" : item.gmvChange < 0 ? "P1" : "P2",
    title: `${item.productName} 经营异常`,
    reason: item.reason,
    suggestion: item.action,
    relatedMetric: "gmv/refundRate/conversionRate",
    relatedObject: item.productName,
    impact: Math.abs(item.gmvChange || item.refundAmount)
  }));

  const top5Share = enrichedProducts.slice(0, 5).reduce((sum, item) => sum + item.gmv, 0) / Math.max(totalGmv, 1);

  return {
    topProducts,
    productRows: enrichedProducts.slice(0, 20),
    riskProducts,
    anomalies,
    quadrants,
    summary: {
      totalProducts: enrichedProducts.length,
      top5Share,
      mainThreshold: topProducts[topProducts.length - 1]?.gmv || 0,
      riskCount: riskProducts.length,
      avgTraffic,
      avgConversion
    }
  };
}
