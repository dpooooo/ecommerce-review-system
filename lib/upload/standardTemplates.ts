export type TimeGrain = "daily" | "monthly" | "period";

export type StandardTemplateDefinition = {
  reportType: string;
  timeGrain: TimeGrain;
  name: string;
  description: string;
  columns: Array<{
    field: string;
    label: string;
    required?: boolean;
    example: string | number;
  }>;
};

const grainLabels: Record<TimeGrain, string> = {
  daily: "日数据",
  monthly: "月数据",
  period: "周期汇总"
};

const timeColumns: Record<TimeGrain, StandardTemplateDefinition["columns"]> = {
  daily: [{ field: "date", label: "时间", required: true, example: "2026-05-01" }],
  monthly: [{ field: "month", label: "统计月份", required: true, example: "2026-05" }],
  period: [
    { field: "periodStart", label: "统计开始日期", required: true, example: "2026-05-01" },
    { field: "periodEnd", label: "统计结束日期", required: true, example: "2026-05-31" }
  ]
};

const metricColumnsByReportType: Record<string, StandardTemplateDefinition["columns"]> = {
  shop: [
    { field: "traffic", label: "访客数", required: true, example: 118000 },
    { field: "gmv", label: "GMV", required: true, example: 690000 },
    { field: "gsv", label: "GSV", example: 620000 },
    { field: "orders", label: "订单数", required: true, example: 6254 },
    { field: "conversionRate", label: "转化率", example: 0.053 },
    { field: "aov", label: "客单价", example: 110.33 },
    { field: "refundAmount", label: "退款金额", example: 70000 },
    { field: "refundRate", label: "退款率", example: 0.1014 }
  ],
  product: [
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
  ],
  promotion: [
    { field: "spend", label: "花费", required: true, example: 44800.92 },
    { field: "impressions", label: "展现数", example: 450399 },
    { field: "clicks", label: "点击数", example: 13174 },
    { field: "ctr", label: "点击率", example: 0.0292 },
    { field: "cpc", label: "平均点击成本", example: 3.4 },
    { field: "promoGmv", label: "推广成交金额", required: true, example: 342506.6 },
    { field: "orders", label: "订单数", example: 172 },
    { field: "traffic", label: "广告访客数", example: 6622 },
    { field: "roi", label: "ROI", example: 7.65 }
  ],
  promotion_plan: [
    { field: "planId", label: "计划ID", required: true, example: "4027044735" },
    { field: "planName", label: "推广计划", required: true, example: "店铺收割" },
    { field: "impressions", label: "展现数", example: 25489 },
    { field: "clicks", label: "点击数", example: 1069 },
    { field: "ctr", label: "点击率", example: 0.0419 },
    { field: "spend", label: "花费", required: true, example: 4470.34 },
    { field: "cpm", label: "千次展现成本", example: 175.38 },
    { field: "cpc", label: "平均点击成本", example: 4.18 },
    { field: "directOrders", label: "直接订单行", example: 12 },
    { field: "directRevenue", label: "直接订单金额", example: 22800.8 },
    { field: "indirectOrders", label: "间接订单行", example: 13 },
    { field: "indirectRevenue", label: "间接订单金额", example: 26871.4 },
    { field: "orders", label: "总订单行", example: 25 },
    { field: "revenue", label: "总订单金额", required: true, example: 49672.2 },
    { field: "addCarts", label: "总加购数", example: 310 },
    { field: "addCartRate", label: "加购率", example: 0.2899 },
    { field: "conversionRate", label: "转化率", example: 0.0234 },
    { field: "orderCost", label: "平均订单成本", example: 178.81 },
    { field: "roi", label: "投产比", required: true, example: 11.11 },
    { field: "newCustomerOrders", label: "下单新客数", example: 8 },
    { field: "adVisitors", label: "广告访客数", example: 980 }
  ],
  promotion_audience: [
    { field: "planId", label: "计划ID", required: true, example: "4039970959" },
    { field: "planName", label: "推广计划", example: "店铺收割" },
    { field: "unitId", label: "单元ID", required: true, example: "4040388508" },
    { field: "unitName", label: "推广单元", example: "核心拉新单元" },
    { field: "audienceId", label: "人群ID", required: true, example: "4039656033" },
    { field: "audienceName", label: "人群名称", required: true, example: "广告再营销人群" },
    { field: "impressions", label: "展现数", example: 1461 },
    { field: "clicks", label: "点击数", example: 88 },
    { field: "ctr", label: "点击率", example: 0.0602 },
    { field: "spend", label: "花费", required: true, example: 102.1 },
    { field: "cpm", label: "千次展现成本", example: 69.88 },
    { field: "cpc", label: "平均点击成本", example: 1.16 },
    { field: "directOrders", label: "直接订单行", example: 0 },
    { field: "directRevenue", label: "直接订单金额", example: 0 },
    { field: "indirectOrders", label: "间接订单行", example: 0 },
    { field: "indirectRevenue", label: "间接订单金额", example: 0 },
    { field: "orders", label: "总订单行", example: 0 },
    { field: "revenue", label: "总订单金额", required: true, example: 0 },
    { field: "addCarts", label: "总加购数", example: 12 },
    { field: "addCartRate", label: "加购率", example: 0.1364 },
    { field: "conversionRate", label: "转化率", example: 0 },
    { field: "orderCost", label: "平均订单成本", example: 0 },
    { field: "roi", label: "投产比", required: true, example: 0 }
  ]
};

export const reportTimeGrains: Record<string, TimeGrain[]> = {
  shop: ["daily", "monthly", "period"],
  product: ["daily", "monthly", "period"],
  promotion: ["daily", "monthly", "period"],
  promotion_plan: ["daily", "monthly", "period"],
  promotion_audience: ["daily", "monthly", "period"]
};

const reportNames: Record<string, string> = {
  shop: "店铺经营数据",
  product: "商品数据",
  promotion: "推广汇总数据",
  promotion_plan: "推广计划数据",
  promotion_audience: "推广人群数据"
};

export const standardTemplates: StandardTemplateDefinition[] = Object.entries(metricColumnsByReportType).flatMap(
  ([reportType, metricColumns]) =>
    reportTimeGrains[reportType].map((timeGrain) => ({
      reportType,
      timeGrain,
      name: `${reportNames[reportType]}${grainLabels[timeGrain]}模板`,
      description: `${grainLabels[timeGrain]}：${timeGrain === "daily" ? "一行代表一天" : timeGrain === "monthly" ? "一行代表一个自然月" : "一行代表一个自定义统计周期"}的${reportNames[reportType]}。`,
      columns: [...timeColumns[timeGrain], ...metricColumns]
    }))
);

function parseDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function monthRange(value: string) {
  if (!/^\d{4}-\d{2}$/.test(value)) return null;
  const [year, month] = value.split("-").map(Number);
  const startDate = new Date(Date.UTC(year, month - 1, 1));
  const endDate = new Date(Date.UTC(year, month, 0));
  return { periodStart: valueOfDate(startDate), periodEnd: valueOfDate(endDate), startDate, endDate };
}

function valueOfDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getDefaultTimeGrain(reportType: string): TimeGrain {
  return reportTimeGrains[reportType]?.[0] || "period";
}

export function isTimeGrain(value: unknown): value is TimeGrain {
  return value === "daily" || value === "monthly" || value === "period";
}

export function getStandardTemplate(reportType: string, timeGrain: TimeGrain = getDefaultTimeGrain(reportType)) {
  return standardTemplates.find((template) => template.reportType === reportType && template.timeGrain === timeGrain);
}

export function standardTemplateMapping(reportType: string, timeGrain?: string) {
  const template = getStandardTemplate(reportType, isTimeGrain(timeGrain) ? timeGrain : getDefaultTimeGrain(reportType));
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
    const rowNumber = index + 2;
    if (template.timeGrain === "daily") {
      const value = String(row["时间"] ?? row["数据日期"] ?? "").trim();
      const date = parseDate(value);
      if (!date) {
        errors.push(`第 ${rowNumber} 行的数据日期必须使用 YYYY-MM-DD 格式。`);
        return [];
      }
      return [{ periodStart: value, periodEnd: value, startDate: date, endDate: date }];
    }

    if (template.timeGrain === "monthly") {
      const value = String(row["统计月份"] ?? "").trim();
      const range = monthRange(value);
      if (!range) {
        errors.push(`第 ${rowNumber} 行的统计月份必须使用 YYYY-MM 格式。`);
        return [];
      }
      return [range];
    }

    const periodStart = String(row["统计开始日期"] ?? "").trim();
    const periodEnd = String(row["统计结束日期"] ?? "").trim();
    const startDate = parseDate(periodStart);
    const endDate = parseDate(periodEnd);
    if (!startDate) errors.push(`第 ${rowNumber} 行的统计开始日期必须使用 YYYY-MM-DD 格式。`);
    if (!endDate) errors.push(`第 ${rowNumber} 行的统计结束日期必须使用 YYYY-MM-DD 格式。`);
    if (startDate && endDate && startDate > endDate) {
      errors.push(`第 ${rowNumber} 行的统计开始日期不能晚于统计结束日期。`);
    }
    return startDate && endDate ? [{ periodStart, periodEnd, startDate, endDate }] : [];
  });

  const periodStart = validPeriods.length
    ? validPeriods.reduce((earliest, item) => (item.startDate < earliest.startDate ? item : earliest)).periodStart
    : "";
  const periodEnd = validPeriods.length
    ? validPeriods.reduce((latest, item) => (item.endDate > latest.endDate ? item : latest)).periodEnd
    : "";

  return { errors, periodStart, periodEnd, timeGrain: template.timeGrain };
}
