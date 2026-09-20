"use client";

import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";
import { useChartTheme } from "@/lib/chart-theme";
import { SUCCESS_COLOR, DESTRUCTIVE_COLOR } from "./colors";

export type PerformancePoint = { name: string; gain: number };

/** Bar chart of gain/loss per asset or broker, colored green/red by sign. */
export function PerformanceBarChart({ data, currency }: { data: PerformancePoint[]; currency: string }) {
  const { t } = useTranslation();
  const chartTheme = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height={Math.min(400, Math.max(220, data.length * 40))}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={chartTheme.grid} />
        <XAxis type="number" tick={{ fontSize: 11, fill: chartTheme.axis }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: chartTheme.axis }} width={100} />
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
        <Bar dataKey="gain" name={t.investmentsDashboard.performanceChart.gainLoss} radius={[0, 4, 4, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.gain >= 0 ? SUCCESS_COLOR : DESTRUCTIVE_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
