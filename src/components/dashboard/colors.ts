// Chart colors mirror the app's CSS variable palette (see src/app/globals.css)
// but are hardcoded as hsl() literals since recharts fill/stroke props are
// safest as concrete color strings rather than var() references.
export const SUCCESS_COLOR = "hsl(142, 71%, 35%)";
export const DESTRUCTIVE_COLOR = "hsl(0, 72%, 51%)";
export const PRIMARY_COLOR = "hsl(35, 90%, 55%)";

// Qualitative palette for multi-slice pies / multi-series bars, led by the
// app's amber accent. Cycles with modulo when there are more categories than
// colors.
export const CHART_PALETTE = [
  "hsl(35, 90%, 55%)",
  "hsl(190, 65%, 45%)",
  "hsl(0, 72%, 60%)",
  "hsl(265, 60%, 62%)",
  "hsl(150, 45%, 45%)",
  "hsl(200, 80%, 60%)",
  "hsl(340, 65%, 60%)",
  "hsl(60, 55%, 45%)",
];

export function paletteColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}
