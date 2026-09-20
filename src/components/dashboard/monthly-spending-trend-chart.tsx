"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";
import { useChartTheme } from "@/lib/chart-theme";
import { DESTRUCTIVE_COLOR } from "./colors";

export function MonthlySpendingTrendChart({
  data,
  currency,
}: {
  data: { label: string; expense: number }[];
  currency: string;
}) {
  const { t } = useTranslation();
  const chartTheme = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartTheme.axis }} />
        <YAxis tick={{ fontSize: 11, fill: chartTheme.axis }} width={56} />
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
        <Line
          type="monotone"
          dataKey="expense"
          name={t.dashboard.monthlySpendingChart.expenses}
          stroke={DESTRUCTIVE_COLOR}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
