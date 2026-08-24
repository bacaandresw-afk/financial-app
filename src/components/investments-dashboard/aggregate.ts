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

/**
 * Looks up a translated label for an asset type. `labels` is the caller's
 * translated map (e.g. `t.investmentsDashboard.assetTypes`) so this stays a
 * plain, i18n-agnostic helper — falls back to the raw type if unmapped.
 */
export function assetTypeLabel(type: string, labels: Record<string, string>): string {
  return labels[type] ?? type;
}
