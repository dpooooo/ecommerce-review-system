export function formatMoney(value: number) {
  if (Math.abs(value) >= 10000) return `${(value / 10000).toFixed(1)}万`;
  return `¥${value.toLocaleString("zh-CN", { maximumFractionDigits: 0 })}`;
}

export function formatNumber(value: number) {
  return value.toLocaleString("zh-CN", { maximumFractionDigits: 0 });
}

export function formatPercent(value: number) {
  return `${(value * 100).toFixed(2)}%`;
}

export function safeRate(numerator: number, denominator: number) {
  return denominator === 0 ? 0 : numerator / denominator;
}
