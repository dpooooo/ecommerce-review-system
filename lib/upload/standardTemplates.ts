export type StandardTemplateDefinition = {
  reportType: string;
  name: string;
  description: string;
  columns: Array<{
    field: string;
    label: string;
    required?: boolean;
    example: string | number;
  }>;
};

const periodColumns = [
  { field: "periodStart", label: "统计开始日期", required: true, example: "2026-03-01" },
  { field: "periodEnd", label: "统计结束日期", required: true, example: "2026-03-31" }
];

export const standardTemplates: StandardTemplateDefinition[] = [
  {
    reportType: "shop",
    name: "店铺经营数据模板",
    description: "一行代表一个店铺在一个统计周期内的经营汇总。",
    columns: [
      ...periodColumns,
      { field: "traffic", label: "访客数", required: true, example: 118000 },
      { field: "gmv", label: "GMV", required: true, example: 690000 },
      { field: "gsv", label: "GSV", example: 620000 },
      { field: "orders", label: "订单数", required: true, example: 6254 },
      { field: "conversionRate", label: "转化率", example: 0.053 },
      { field: "aov", label: "客单价", example: 110.33 },
      { field: "refundAmount", label: "退款金额", example: 70000 },
      { field: "refundRate", label: "退款率", example: 0.1014 }
    ]
  },
  {
    reportType: "product",
    name: "商品数据模板",
    description: "一行代表一个商品在一个统计周期内的表现。",
    columns: [
      ...periodColumns,
      { field: "productId", label: "商品ID", required: true, example: "SKU001" },
      { field: "productName", label: "商品名称", required: true, example: "核心商品01" },
      { field: "traffic", label: "访客数", example: 4625 },
      { field: "gmv", label: "GMV", required: true, example: 22619.52 },
      { field: "gsv", label: "GSV", example: 21714.74 },
      { field: "orders", label: "订单数", example: 238 },
      { field: "conversionRate", label: "转化率", example: 0.0515 },
      { field: "aov", label: "客单价", example: 95.04 },
      { field: "refundAmount", label: "退款金额", example: 904.78 },
      { field: "refundRate", label: "退款率", example: 0.04 },
      { field: "stock", label: "库存", example: 121 },
      { field: "searchImpressions", label: "搜索曝光数", example: 92500 }
    ]
  },
  {
    reportType: "promotion",
    name: "推广汇总数据模板",
    description: "一行代表一个店铺在一个统计周期内的推广汇总。",
    columns: [
      ...periodColumns,
      { field: "spend", label: "花费", required: true, example: 44800.92 },
      { field: "impressions", label: "展现数", example: 450399 },
      { field: "clicks", label: "点击数", example: 13174 },
      { field: "ctr", label: "点击率", example: 0.0292 },
      { field: "cpc", label: "平均点击成本", example: 3.4 },
      { field: "promoGmv", label: "推广成交金额", required: true, example: 342506.6 },
      { field: "orders", label: "订单数", example: 172 },
      { field: "traffic", label: "广告访客数", example: 6622 },
      { field: "roi", label: "ROI", example: 7.65 }
    ]
  },
  {
    reportType: "promotion_plan",
    name: "推广计划数据模板",
    description: "一行代表一个推广计划在一个统计周期内的表现。",
    columns: [
      ...periodColumns,
      { field: "planId", label: "计划ID", required: true, example: "4027044735" },
      { field: "planName", label: "推广计划", required: true, example: "店铺收割" },
      { field: "spend", label: "花费", example: 4470.34 },
      { field: "revenue", label: "总订单金额", example: 49672.2 },
      { field: "orders", label: "总订单数", example: 25 },
      { field: "roi", label: "ROI", example: 11.11 },
      { field: "conversionRate", label: "转化率", example: 0.0234 },
      { field: "impressions", label: "展现数", example: 25489 },
      { field: "clicks", label: "点击数", example: 1069 },
      { field: "ctr", label: "点击率", example: 0.0419 },
      { field: "cpc", label: "平均点击成本", example: 4.18 }
    ]
  },
  {
    reportType: "promotion_audience",
    name: "推广人群数据模板",
    description: "一行代表一个推广人群在一个统计周期内的表现。",
    columns: [
      ...periodColumns,
      { field: "planId", label: "计划ID", required: true, example: "4039970959" },
      { field: "unitId", label: "单元ID", required: true, example: "4040388508" },
      { field: "audienceId", label: "人群ID", required: true, example: "4039656033" },
      { field: "audienceName", label: "人群名称", required: true, example: "广告再营销人群" },
      { field: "spend", label: "花费", example: 102.1 },
      { field: "revenue", label: "总订单金额", example: 0 },
      { field: "orders", label: "总订单数", example: 0 },
      { field: "roi", label: "ROI", example: 0 },
      { field: "conversionRate", label: "转化率", example: 0 },
      { field: "impressions", label: "展现数", example: 1461 },
      { field: "clicks", label: "点击数", example: 88 },
      { field: "ctr", label: "点击率", example: 0.0602 },
      { field: "cpc", label: "平均点击成本", example: 1.16 }
    ]
  },
  {
    reportType: "traffic_source",
    name: "流量来源数据模板",
    description: "一行代表一个流量渠道在一个统计周期内的表现。",
    columns: [
      ...periodColumns,
      { field: "channel", label: "流量渠道", required: true, example: "搜索流量" },
      { field: "source1", label: "一级来源", example: "站内免费" },
      { field: "source2", label: "二级来源", example: "搜索" },
      { field: "source3", label: "三级来源", example: "自然搜索" },
      { field: "visitors", label: "访客数", example: 12000 },
      { field: "buyers", label: "买家数", example: 360 },
      { field: "conversionRate", label: "转化率", example: 0.03 },
      { field: "revenue", label: "成交金额", example: 180000 },
      { field: "uvValue", label: "UV价值", example: 15 }
    ]
  },
  {
    reportType: "user_profile",
    name: "用户画像数据模板",
    description: "一行代表一个用户画像维度值在一个统计周期内的表现。",
    columns: [
      ...periodColumns,
      { field: "userType", label: "用户类型", required: true, example: "成交用户" },
      { field: "dimension", label: "画像维度", required: true, example: "年龄" },
      { field: "dimensionValue", label: "画像值", required: true, example: "25-34岁" },
      { field: "visitors", label: "访客数", example: 3000 },
      { field: "buyers", label: "买家数", example: 150 },
      { field: "orders", label: "订单数", example: 180 },
      { field: "gmv", label: "GMV", example: 90000 },
      { field: "aov", label: "客单价", example: 500 },
      { field: "conversionRate", label: "转化率", example: 0.05 }
    ]
  }
];

export function getStandardTemplate(reportType: string) {
  return standardTemplates.find((template) => template.reportType === reportType);
}

export function standardTemplateMapping(reportType: string) {
  const template = getStandardTemplate(reportType);
  return template?.columns.map((column) => ({ originalField: column.label, standardField: column.field })) || [];
}

export function detectStandardTemplate(columns: string[]) {
  const columnSet = new Set(columns.map((column) => column.trim()));
  const matches = standardTemplates
    .map((template) => {
      const required = template.columns.filter((column) => column.required);
      const matchedRequired = required.filter((column) => columnSet.has(column.label));
      const matchedAll = template.columns.filter((column) => columnSet.has(column.label));
      return {
        template,
        matchedRequired: matchedRequired.length,
        requiredCount: required.length,
        matchedAll: matchedAll.length
      };
    })
    .filter((match) => match.matchedRequired === match.requiredCount)
    .sort((a, b) => b.matchedAll - a.matchedAll);

  return matches[0]?.template;
}

export function validateStandardTemplateRows(
  template: StandardTemplateDefinition,
  rows: Array<Record<string, unknown>>
) {
  const errors: string[] = [];
  if (!rows.length) errors.push("模板中没有可导入的数据行。");

  const requiredColumns = template.columns.filter((column) => column.required);
  requiredColumns.forEach((column) => {
    const missingRow = rows.findIndex((row) => String(row[column.label] ?? "").trim() === "");
    if (missingRow >= 0) errors.push(`第 ${missingRow + 2} 行缺少必填字段“${column.label}”。`);
  });

  const validPeriods = rows.flatMap((row, index) => {
    const periodStart = String(row["统计开始日期"] ?? "").trim();
    const periodEnd = String(row["统计结束日期"] ?? "").trim();
    const rowNumber = index + 2;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(periodStart)) {
      errors.push(`第 ${rowNumber} 行的统计开始日期必须使用 YYYY-MM-DD 格式。`);
      return [];
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(periodEnd)) {
      errors.push(`第 ${rowNumber} 行的统计结束日期必须使用 YYYY-MM-DD 格式。`);
      return [];
    }

    const startDate = new Date(`${periodStart}T00:00:00Z`);
    const endDate = new Date(`${periodEnd}T00:00:00Z`);
    if (Number.isNaN(startDate.getTime())) errors.push(`第 ${rowNumber} 行的统计开始日期不是有效日期。`);
    if (Number.isNaN(endDate.getTime())) errors.push(`第 ${rowNumber} 行的统计结束日期不是有效日期。`);
    if (!Number.isNaN(startDate.getTime()) && !Number.isNaN(endDate.getTime()) && startDate > endDate) {
      errors.push(`第 ${rowNumber} 行的统计开始日期不能晚于统计结束日期。`);
    }
    return Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())
      ? []
      : [{ periodStart, periodEnd, startDate, endDate }];
  });

  const periodStart = validPeriods.length
    ? validPeriods.reduce((earliest, item) => item.startDate < earliest.startDate ? item : earliest).periodStart
    : "";
  const periodEnd = validPeriods.length
    ? validPeriods.reduce((latest, item) => item.endDate > latest.endDate ? item : latest).periodEnd
    : "";

  return { errors, periodStart, periodEnd };
}
