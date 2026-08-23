export type NamedTotal = { name: string; value: number };

/** Sums `value` per name, dropping non-positive totals (pies can't show them). */
export function aggregateByName(items: { name: string; value: number }[]): NamedTotal[] {
  const totals = new Map<string, number>();
  for (const item of items) {
    if (item.value <= 0) continue;
    totals.set(item.name, (totals.get(item.name) ?? 0) + item.value);
  }
  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

const ASSET_TYPE_LABELS: Record<string, string> = {
  STOCK: "Stocks",
  ETF: "ETFs",
  BOND: "Bonds",
  CEDEAR: "CEDEARs",
  CRYPTO: "Crypto",
  MUTUAL_FUND: "Mutual funds",
  FIXED_INCOME: "Fixed income",
  OTHER: "Other",
};

export function assetTypeLabel(type: string): string {
  return ASSET_TYPE_LABELS[type] ?? type;
}
