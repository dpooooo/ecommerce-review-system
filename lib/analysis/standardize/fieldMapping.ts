const aliases: Record<string, string[]> = {
  traffic: ["访客数", "流量", "UV", "访问人数", "访客", "访问量"],
  gmv: ["GMV", "成交金额", "支付金额", "销售额"],
  gsv: ["GSV", "实收金额", "净销售额"],
  orders: ["订单数", "成交订单数", "支付订单数"],
  conversionRate: ["转化率", "支付转化率", "成交转化率"],
  aov: ["客单价", "平均客单价"],
  refundAmount: ["退款金额", "售后金额"],
  refundRate: ["退款率", "售后率"],
  spend: ["推广花费", "消耗", "花费"],
  impressions: ["展现", "展现量", "曝光", "曝光量", "展示数"],
  clicks: ["点击", "点击量", "点击数"],
  ctr: ["CTR", "点击率"],
  cpc: ["CPC", "平均点击花费"],
  promoGmv: ["推广成交", "推广成交金额", "广告成交", "广告成交金额"],
  roi: ["ROI", "投入产出比"],
  productId: ["商品ID", "商品编码", "sku_id", "SKU ID", "货品编码"],
  productName: ["商品名称", "商品名", "SKU名称", "货品名称"],
  stock: ["库存", "可售库存"],
  searchImpressions: ["搜索曝光", "搜索曝光量", "搜索展现"],
  channel: ["渠道", "流量渠道", "流量来源"],
  source1: ["一级来源", "来源1"],
  source2: ["二级来源", "来源2"],
  source3: ["三级来源", "来源3"],
  visitors: ["访客数", "访客", "UV"],
  buyers: ["买家数", "成交人数", "购买人数"],
  revenue: ["成交金额", "收入", "销售额"],
  uvValue: ["UV价值", "UV 价值", "访客价值"],
  userType: ["用户类型", "客群类型"],
  dimension: ["维度", "画像维度"],
  dimensionValue: ["维度值", "画像值", "标签值"],
  planId: ["计划ID", "推广计划ID", "planId"],
  planName: ["计划名称", "推广计划", "推广计划名称"],
  unitId: ["单元ID", "推广单元ID"],
  audienceId: ["人群ID", "定向人群ID"],
  audienceName: ["人群名称", "定向人群"]
};

export function guessFieldMapping(columns: string[]) {
  return columns.map((column) => {
    const standardField = Object.entries(aliases).find(([, names]) =>
      names.some((name) => name.toLowerCase() === column.toLowerCase())
    )?.[0];
    return { originalField: column, standardField: standardField || "" };
  });
}
