import { gmvAttribution } from "@/lib/analysis/attribution/gmvAttribution";
import type { MetricSnapshot } from "@/lib/analysis/types";

export function gsvAttribution(current: MetricSnapshot, previous: MetricSnapshot) {
  const gmvFactors = gmvAttribution(current, previous);
  const refundDelta = current.refundAmount - previous.refundAmount;
  return [
    {
      factor: "gmv_growth",
      name: "成交增长贡献",
      contribution: current.gmv - previous.gmv,
      direction: current.gmv >= previous.gmv ? "拉动" : "拖累",
      children: gmvFactors
    },
    {
      factor: "refund",
      name: "退款影响",
      contribution: -refundDelta,
      direction: refundDelta > 0 ? "拖累" : "拉动"
    },
    {
      factor: "gsv_net",
      name: "GSV 净变化",
      contribution: current.gsv - previous.gsv,
      direction: current.gsv >= previous.gsv ? "拉动" : "拖累"
    }
  ];
}
