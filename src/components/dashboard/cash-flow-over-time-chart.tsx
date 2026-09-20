"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";
import { useChartTheme } from "@/lib/chart-theme";
import { SUCCESS_COLOR, DESTRUCTIVE_COLOR } from "./colors";
import type { TimeBucket } from "./aggregate";

export function CashFlowOverTimeChart({ data, currency }: { data: TimeBucket[]; currency: string }) {
  const { t } = useTranslation();
  const chartTheme = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartTheme.grid} />
        <XAxis dataKey="label" tick={{ fontSize: 11, fill: chartTheme.axis }} interval="preserveStartEnd" />
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
        <Legend wrapperStyle={{ fontSize: 12, color: chartTheme.axis }} />
        <Bar dataKey="income" name={t.dashboard.cashFlowChart.income} fill={SUCCESS_COLOR} radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name={t.dashboard.cashFlowChart.expenses} fill={DESTRUCTIVE_COLOR} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
