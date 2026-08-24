"use client";

import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";
import { SUCCESS_COLOR, DESTRUCTIVE_COLOR } from "./colors";

export function MonthlyCashFlowChart({
  data,
  currency,
}: {
  data: { label: string; net: number }[];
  currency: string;
}) {
  const { t } = useTranslation();

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} width={56} />
        <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
        <Bar dataKey="net" name={t.dashboard.monthlyCashFlowChart.net} radius={[4, 4, 0, 0]}>
          {data.map((d, i) => (
            <Cell key={i} fill={d.net >= 0 ? SUCCESS_COLOR : DESTRUCTIVE_COLOR} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
