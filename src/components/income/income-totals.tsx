"use client";

import { formatCurrency } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";

export function IncomeTotals({ totals }: { totals: Record<string, number> }) {
  const { t } = useTranslation();
  const currencies = Object.keys(totals).sort();

  if (currencies.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className="text-sm text-muted-foreground">{t.income.totals.label}</span>
      <span className="font-semibold">
        {currencies.map((currency) => formatCurrency(totals[currency], currency)).join(" · ")}
      </span>
    </div>
  );
}
