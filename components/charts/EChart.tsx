"use client";

import { useEffect, useRef } from "react";
import type { EChartsOption } from "echarts";

export function EChart({
  option,
  className = "h-72 w-full"
}: {
  option: EChartsOption;
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let chart: import("echarts").ECharts | undefined;
    let observer: ResizeObserver | undefined;
    let disposed = false;

    import("echarts").then((echarts) => {
      if (!containerRef.current || disposed) return;
      chart = echarts.init(containerRef.current, undefined, { renderer: "canvas" });
      chart.setOption(option, true);
      observer = new ResizeObserver(() => chart?.resize());
      observer.observe(containerRef.current);
    });

    return () => {
      disposed = true;
      observer?.disconnect();
      chart?.dispose();
    };
  }, [option]);

  return <div ref={containerRef} className={className} />;
}
