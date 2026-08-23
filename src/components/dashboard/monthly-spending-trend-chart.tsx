"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { DESTRUCTIVE_COLOR } from "./colors";

export function MonthlySpendingTrendChart({
  data,
  currency,
}: {
  data: { label: string; expense: number }[];
  currency: string;
}) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} width={56} />
        <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
        <Line
          type="monotone"
          dataKey="expense"
          name="Expenses"
          stroke={DESTRUCTIVE_COLOR}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
