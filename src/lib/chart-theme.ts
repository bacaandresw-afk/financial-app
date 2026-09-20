"use client";

import { useTheme } from "@/components/theme/theme-provider";

export type ChartTheme = {
  grid: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
};

const LIGHT_CHART_THEME: ChartTheme = {
  grid: "hsl(214, 20%, 90%)",
  axis: "hsl(215, 15%, 45%)",
  tooltipBg: "hsl(0, 0%, 100%)",
  tooltipBorder: "hsl(214, 20%, 90%)",
  tooltipText: "hsl(222, 20%, 15%)",
};

const DARK_CHART_THEME: ChartTheme = {
  grid: "hsl(0, 0%, 20%)",
  axis: "hsl(0, 0%, 65%)",
  tooltipBg: "hsl(0, 0%, 12%)",
  tooltipBorder: "hsl(0, 0%, 22%)",
  tooltipText: "hsl(0, 0%, 95%)",
};

// Recharts styling props (CartesianGrid stroke, axis tick fill, Tooltip
// contentStyle) need literal color strings — they can't read Tailwind dark:
// classes or CSS vars the way regular DOM elements can — so chart chrome
// needs to react to the resolved theme explicitly.
export function useChartTheme(): ChartTheme {
  const { resolvedTheme } = useTheme();
  return resolvedTheme === "dark" ? DARK_CHART_THEME : LIGHT_CHART_THEME;
}
