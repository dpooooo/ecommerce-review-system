export function buildActionItems(anomalies: Array<Record<string, unknown>>) {
  return anomalies.slice(0, 5).map((item, index) => ({
    priority: item.priority || "P1",
    title: index === 0 ? "优先处理高退款商品" : String(item.title || "经营异常处理"),
    action: String(item.suggestion || "确认异常来源并制定运营动作"),
    targetMetric: String(item.relatedMetric || "GMV/GSV"),
    estimatedImpact: index === 0 ? "预计减少 5%-8% 退款侵蚀" : "预计改善核心经营效率",
    owner: index === 0 ? "售后负责人" : "运营负责人",
    status: "未开始",
    sourceEvidence: item
  }));
}
