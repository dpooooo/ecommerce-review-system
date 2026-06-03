import { guessFieldMapping } from "@/lib/analysis/standardize/fieldMapping";

const reportTypeSignals: Record<string, string[]> = {
  product: ["productId", "productName", "stock", "searchImpressions"],
  promotion_audience: ["audienceId", "audienceName", "unitId"],
  promotion_plan: ["planId", "planName", "spend", "revenue"],
  traffic_source: ["channel", "source1", "source2", "source3", "visitors", "uvValue"],
  user_profile: ["userType", "dimension", "dimensionValue"],
  promotion: ["spend", "impressions", "clicks", "ctr", "cpc", "promoGmv", "roi"],
  shop: ["traffic", "gmv", "gsv", "orders", "conversionRate", "aov", "refundAmount", "refundRate"]
};

export function detectReportType(columns: string[]) {
  const mappedFields = new Set(
    guessFieldMapping(columns)
      .map((item) => item.standardField)
      .filter(Boolean)
  );
  const ranked = Object.entries(reportTypeSignals)
    .map(([reportType, signals]) => ({
      reportType,
      score: signals.filter((field) => mappedFields.has(field)).length
    }))
    .sort((a, b) => b.score - a.score);
  return ranked[0]?.score ? ranked[0].reportType : "shop";
}

export function detectReportTypeWithConfidence(columns: string[]) {
  const mappedFields = new Set(
    guessFieldMapping(columns)
      .map((item) => item.standardField)
      .filter(Boolean)
  );
  const ranked = Object.entries(reportTypeSignals)
    .map(([reportType, signals]) => ({
      reportType,
      score: signals.filter((field) => mappedFields.has(field)).length,
      maxScore: signals.length
    }))
    .sort((a, b) => b.score - a.score);
  const winner = ranked[0];
  if (!winner?.score) {
    return { reportType: "shop", confidence: 0, matchedFields: 0 };
  }
  return {
    reportType: winner.reportType,
    confidence: winner.score / winner.maxScore,
    matchedFields: winner.score
  };
}
