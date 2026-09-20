"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useChartTheme } from "@/lib/chart-theme";
import { paletteColor } from "./colors";
import type { NamedTotal } from "./aggregate";

export function AllocationPieChart({ data, currency }: { data: NamedTotal[]; currency: string }) {
  const chartTheme = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={55}
          outerRadius={80}
          paddingAngle={2}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={paletteColor(i)} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => formatCurrency(value, currency)}
          contentStyle={{
            backgroundColor: chartTheme.tooltipBg,
            border: `1px solid ${chartTheme.tooltipBorder}`,
            borderRadius: 12,
            color: chartTheme.tooltipText,
          }}
          labelStyle={{ color: chartTheme.tooltipText }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: chartTheme.axis }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
