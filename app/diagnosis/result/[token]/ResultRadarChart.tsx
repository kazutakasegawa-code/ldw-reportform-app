"use client";

import { PolarAngleAxis, PolarGrid, PolarRadiusAxis, Radar, RadarChart, ResponsiveContainer } from "recharts";

type ChartItem = {
  domain: string;
  score: number;
};

export default function ResultRadarChart({ data }: { data: ChartItem[] }) {
  return (
    <div className="h-[320px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data} outerRadius="72%">
          <PolarGrid stroke="#cbd5e1" />
          <PolarAngleAxis dataKey="domain" tick={{ fill: "#0f172a", fontSize: 12, fontWeight: 700 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} ticks={[0, 20, 40, 60, 80, 100]} tick={{ fill: "#64748b", fontSize: 10 }} />
          <Radar name="スコア" dataKey="score" stroke="#d69e00" fill="#f5c842" fillOpacity={0.42} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
