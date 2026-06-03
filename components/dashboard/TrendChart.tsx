"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

export function TrendChart({ data }: { data: Array<{ date: string; gmv: number; gsv: number }> }) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data}>
          <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
          <YAxis stroke="#94a3b8" fontSize={12} />
          <Tooltip />
          <Line type="monotone" dataKey="gmv" name="GMV" stroke="#2563eb" strokeWidth={3} dot={false} />
          <Line type="monotone" dataKey="gsv" name="GSV" stroke="#16a34a" strokeWidth={3} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
