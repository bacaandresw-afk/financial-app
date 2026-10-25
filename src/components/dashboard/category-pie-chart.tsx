"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { formatCurrency, formatCurrencyCompact } from "@/lib/utils";
import { useChartTheme } from "@/lib/chart-theme";
import { useTranslation } from "@/lib/i18n/language-context";
import { paletteColor, OTHER_COLOR } from "./colors";
import { toPieSlices, type NamedTotal, type PieSlice } from "./aggregate";

const TOP_CATEGORIES = 5;
// Slices at or above these shares get a label inside the wedge; smaller
// wedges only fit the percentage (or nothing) and rely on the legend.
const FULL_LABEL_MIN_PERCENT = 10;
const PERCENT_LABEL_MIN_PERCENT = 4;

const RADIAN = Math.PI / 180;

function sliceColor(slice: PieSlice, index: number): string {
  return slice.isOther ? OTHER_COLOR : paletteColor(index);
}

export function CategoryPieChart({ data, currency }: { data: NamedTotal[]; currency: string }) {
  const { t } = useTranslation();
  const chartTheme = useChartTheme();
  const slices = toPieSlices(data, TOP_CATEGORIES, t.dashboard.pie.otherCategories);

  function renderInsideLabel(props: {
    cx: number;
    cy: number;
    midAngle: number;
    innerRadius: number;
    outerRadius: number;
    index: number;
  }) {
    const slice = slices[props.index];
    if (slice.percent < PERCENT_LABEL_MIN_PERCENT) return null;
    const radius = props.innerRadius + (props.outerRadius - props.innerRadius) * 0.6;
    const x = props.cx + radius * Math.cos(-props.midAngle * RADIAN);
    const y = props.cy + radius * Math.sin(-props.midAngle * RADIAN);
    const showAmount = slice.percent >= FULL_LABEL_MIN_PERCENT;
    const textProps = {
      x,
      y,
      textAnchor: "middle" as const,
      fill: "#fff",
      stroke: "rgba(0,0,0,0.55)",
      strokeWidth: 3,
      paintOrder: "stroke",
      fontWeight: 600,
    };
    return (
      <text {...textProps} fontSize={12}>
        <tspan x={x} dy={showAmount ? "-0.3em" : "0.35em"}>
          {Math.round(slice.percent)}%
        </tspan>
        {showAmount ? (
          <tspan x={x} dy="1.2em" fontSize={11}>
            {formatCurrencyCompact(slice.value, currency)}
          </tspan>
        ) : null}
      </text>
    );
  }

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={slices}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="95%"
            stroke={chartTheme.tooltipBg}
            strokeWidth={2}
            labelLine={false}
            label={renderInsideLabel}
            isAnimationActive={false}
          >
            {slices.map((slice, i) => (
              <Cell key={slice.name} fill={sliceColor(slice, i)} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string, item) => [
              `${formatCurrency(value, currency)} (${(item.payload as PieSlice).percent.toFixed(1)}%)`,
              name,
            ]}
            contentStyle={{
              backgroundColor: chartTheme.tooltipBg,
              border: `1px solid ${chartTheme.tooltipBorder}`,
              borderRadius: 12,
              color: chartTheme.tooltipText,
            }}
            itemStyle={{ color: chartTheme.tooltipText }}
            labelStyle={{ color: chartTheme.tooltipText }}
          />
        </PieChart>
      </ResponsiveContainer>

      <ul className="space-y-1.5 text-sm">
        {slices.map((slice, i) => (
          <li key={slice.name} className="flex items-center gap-2 min-w-0">
            <span
              className="h-3 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: sliceColor(slice, i) }}
            />
            <span className="truncate text-muted-foreground">{slice.name}</span>
            <span className="ml-auto shrink-0 tabular-nums">
              {slice.percent.toFixed(1)}% · {formatCurrency(slice.value, currency)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
