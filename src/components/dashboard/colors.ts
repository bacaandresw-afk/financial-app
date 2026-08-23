// Chart colors mirror the app's CSS variable palette (see src/app/globals.css)
// but are hardcoded as hsl() literals since recharts fill/stroke props are
// safest as concrete color strings rather than var() references.
export const SUCCESS_COLOR = "hsl(142, 71%, 35%)";
export const DESTRUCTIVE_COLOR = "hsl(0, 72%, 51%)";
export const PRIMARY_COLOR = "hsl(221, 83%, 53%)";

// Qualitative palette for multi-slice pies / multi-series bars. Cycles with
// modulo when there are more categories than colors.
export const CHART_PALETTE = [
  "hsl(221, 83%, 53%)",
  "hsl(142, 71%, 35%)",
  "hsl(280, 65%, 55%)",
  "hsl(35, 90%, 50%)",
  "hsl(0, 72%, 51%)",
  "hsl(190, 70%, 42%)",
  "hsl(330, 70%, 55%)",
  "hsl(50, 85%, 40%)",
];

export function paletteColor(index: number): string {
  return CHART_PALETTE[index % CHART_PALETTE.length];
}
