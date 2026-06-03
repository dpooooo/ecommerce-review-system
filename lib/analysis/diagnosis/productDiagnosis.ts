export function productAnalysis(products: Array<Record<string, number | string>>) {
  const avgTraffic = products.reduce((sum, item) => sum + Number(item.traffic || 0), 0) / Math.max(products.length, 1);
  const avgConversion = products.reduce((sum, item) => sum + Number(item.conversionRate || 0), 0) / Math.max(products.length, 1);
  const topProducts = [...products].sort((a, b) => Number(b.gmv || 0) - Number(a.gmv || 0)).slice(0, 10);
  const anomalies = products
    .filter((item) => Number(item.refundRate || 0) > 0.15 || Number(item.conversionRate || 0) < avgConversion * 0.7)
    .map((item) => ({
      priority: Number(item.refundRate || 0) > 0.18 ? "P0" : "P1",
      title: `${item.productName} 经营异常`,
      reason: Number(item.refundRate || 0) > 0.15 ? "退款率偏高" : "转化率低于均值",
      relatedMetric: "refundRate/conversionRate",
      relatedObject: item.productName
    }));
  const quadrants = [
    { key: "highTrafficHighConversion", name: "高流量高转化", advice: "核心放量款，保持投放与库存稳定" },
    { key: "highTrafficLowConversion", name: "高流量低转化", advice: "重点优化款，优先调整卖点、价格和评价承接" },
    { key: "lowTrafficHighConversion", name: "低流量高转化", advice: "潜力加推款，适合追加曝光" },
    { key: "lowTrafficLowConversion", name: "低流量低转化", advice: "观察或淘汰款，控制资源占用" }
  ].map((q) => ({ ...q, count: 0, samples: [] as string[] }));

  products.forEach((item) => {
    const highTraffic = Number(item.traffic || 0) >= avgTraffic;
    const highConversion = Number(item.conversionRate || 0) >= avgConversion;
    const index = highTraffic && highConversion ? 0 : highTraffic ? 1 : highConversion ? 2 : 3;
    quadrants[index].count += 1;
    quadrants[index].samples.push(String(item.productName));
  });

  return { topProducts, anomalies, quadrants };
}
