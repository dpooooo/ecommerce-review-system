export function cleanNumber(value: unknown, isPercent = false) {
  if (value === null || value === undefined || value === "" || value === "-" || value === "--") return 0;
  const text = String(value).replace(/[¥￥,\s]/g, "");
  const percent = text.endsWith("%");
  const number = Number(text.replace("%", ""));
  if (!Number.isFinite(number)) return 0;
  return percent || isPercent ? number / 100 : number;
}

export function deriveShopMetric(row: Record<string, unknown>) {
  const traffic = cleanNumber(row.traffic);
  const gmv = cleanNumber(row.gmv);
  const orders = cleanNumber(row.orders);
  const refundAmount = cleanNumber(row.refundAmount);
  return {
    traffic,
    gmv,
    orders,
    refundAmount,
    conversionRate: cleanNumber(row.conversionRate, true) || (traffic ? orders / traffic : 0),
    aov: cleanNumber(row.aov) || (orders ? gmv / orders : 0),
    gsv: cleanNumber(row.gsv) || gmv - refundAmount,
    refundRate: cleanNumber(row.refundRate, true) || (gmv ? refundAmount / gmv : 0)
  };
}
