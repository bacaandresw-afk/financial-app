"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { SUCCESS_COLOR, DESTRUCTIVE_COLOR } from "./colors";
import type { TimeBucket } from "./aggregate";

export function CashFlowOverTimeChart({ data, currency }: { data: TimeBucket[]; currency: string }) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 11 }} width={56} />
        <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="income" name="Income" fill={SUCCESS_COLOR} radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" name="Expenses" fill={DESTRUCTIVE_COLOR} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
