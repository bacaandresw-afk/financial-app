"use client";

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { formatCurrency } from "@/lib/utils";
import { paletteColor } from "./colors";
import type { NamedTotal } from "./aggregate";

export function AllocationPieChart({ data, currency }: { data: NamedTotal[]; currency: string }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={(entry) => entry.name}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={paletteColor(i)} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value, currency)} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
