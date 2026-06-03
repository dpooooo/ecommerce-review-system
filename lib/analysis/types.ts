export type MetricSnapshot = {
  traffic: number;
  gmv: number;
  gsv: number;
  orders: number;
  conversionRate: number;
  aov: number;
  refundAmount: number;
  refundRate: number;
  spend?: number;
  roi?: number;
};

export type MetricComparison = {
  key: string;
  name: string;
  current: number;
  previous: number;
  delta: number;
  changeRate: number | null;
  displayChange: string;
  trend: "up" | "down" | "flat";
};

export type ReportSchema = {
  reportId: string;
  title: string;
  shop: { id: string; name: string; platform: string };
  period: {
    current: { start: string; end: string };
    previous: { start: string; end: string };
  };
  executiveSummary: {
    status: "normal" | "warning" | "risk";
    gmvSentence: string;
    gsvSentence: string;
    topReasons: string[];
    topActions: string[];
  };
  metrics: MetricComparison[];
  modules: Array<{
    key: string;
    title: string;
    summary: string;
    cards?: Array<Record<string, unknown>>;
    charts?: Array<Record<string, unknown>>;
    tables?: Array<Record<string, unknown>>;
    actions?: string[];
  }>;
  anomalies: Array<Record<string, unknown>>;
  actionItems: Array<Record<string, unknown>>;
};
