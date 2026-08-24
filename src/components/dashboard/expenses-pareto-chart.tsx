"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";
import { PRIMARY_COLOR, DESTRUCTIVE_COLOR } from "./colors";
import { toParetoSeries, type NamedTotal } from "./aggregate";

// Category names are user data and can get long — truncate on the axis so
// the chart stays readable when there are many categories, similar in spirit
// to the `interval="preserveStartEnd"` treatment used on other charts here.
function truncateLabel(name: string): string {
  return name.length > 14 ? `${name.slice(0, 13)}…` : name;
}

export function ExpensesParetoChart({ data, currency }: { data: NamedTotal[]; currency: string }) {
  const { t } = useTranslation();
  const series = toParetoSeries(data);

  const amountLabel = t.dashboard.pareto.amount;
  const cumulativeLabel = t.dashboard.pareto.cumulativeShare;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 32 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          tickFormatter={truncateLabel}
          angle={-35}
          textAnchor="end"
          interval={0}
          height={56}
        />
        <YAxis
          yAxisId="left"
          tick={{ fontSize: 11 }}
          width={64}
          tickFormatter={(value: number) => formatCurrency(value, currency)}
        />
        <YAxis
          yAxisId="right"
          orientation="right"
          domain={[0, 100]}
          tick={{ fontSize: 11 }}
          width={40}
          tickFormatter={(value: number) => `${value}%`}
        />
        <Tooltip
          formatter={(value: number, name: string) =>
            name === cumulativeLabel
              ? [`${value.toFixed(1)}%`, name]
              : [formatCurrency(value, currency), name]
          }
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <ReferenceLine
          yAxisId="right"
          y={80}
          stroke={DESTRUCTIVE_COLOR}
          strokeDasharray="4 4"
          label={{ value: t.dashboard.pareto.threshold, fontSize: 11, position: "insideTopRight" }}
        />
        <Bar yAxisId="left" dataKey="value" name={amountLabel} fill={PRIMARY_COLOR} radius={[4, 4, 0, 0]} />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="cumulativePct"
          name={cumulativeLabel}
          stroke={DESTRUCTIVE_COLOR}
          strokeWidth={2}
          dot={{ r: 3 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
