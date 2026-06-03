const aliases: Record<string, string[]> = {
  traffic: ["访客数", "流量", "UV", "访问人数"],
  gmv: ["GMV", "成交金额", "支付金额", "销售额"],
  gsv: ["GSV", "实收金额", "净销售额"],
  orders: ["订单数", "成交订单数", "支付订单数"],
  conversionRate: ["转化率", "支付转化率", "成交转化率"],
  aov: ["客单价", "平均客单价"],
  refundAmount: ["退款金额", "售后金额"],
  refundRate: ["退款率", "售后率"],
  spend: ["推广花费", "消耗", "花费"],
  roi: ["ROI", "投入产出比"],
  productId: ["商品ID", "商品编码", "sku_id"],
  productName: ["商品名称", "商品名", "SKU名称"]
};

export function guessFieldMapping(columns: string[]) {
  return columns.map((column) => {
    const standardField = Object.entries(aliases).find(([, names]) =>
      names.some((name) => name.toLowerCase() === column.toLowerCase())
    )?.[0];
    return { originalField: column, standardField: standardField || "" };
  });
}
