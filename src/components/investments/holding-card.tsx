import Link from "next/link";
import { ASSET_TYPES } from "@/lib/validations";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { getAssetTypeLabels } from "./asset-type-labels";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export type HoldingCardData = {
  id: string;
  name: string;
  type: (typeof ASSET_TYPES)[number];
  currency: string;
  quantityHeld: number;
  currentValue: number | null;
  totalGain: number | null;
  simpleReturnPct: number | null;
  annualizedReturnPct: number | null;
};

export function HoldingCard({
  holding,
  t,
}: {
  holding: HoldingCardData;
  t: Dictionary["investments"];
}) {
  const ASSET_TYPE_LABELS = getAssetTypeLabels(t);
  const gainClass =
    holding.totalGain == null
      ? "text-muted-foreground"
      : holding.totalGain >= 0
        ? "text-success"
        : "text-destructive";

  return (
    <Link
      href={`/investments/${holding.id}`}
      className="block rounded-xl border border-border bg-card p-4 sm:p-5 hover:border-primary/50 transition-colors"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium">{holding.name}</p>
          <p className="text-xs text-muted-foreground">
            {ASSET_TYPE_LABELS[holding.type]} · {holding.currency} · {holding.quantityHeld}{" "}
            {t.holdingCard.held}
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium">
            {holding.currentValue != null
              ? formatCurrency(holding.currentValue, holding.currency)
              : "—"}
          </p>
          <p className={`text-xs ${gainClass}`}>
            {holding.totalGain != null
              ? formatCurrency(holding.totalGain, holding.currency)
              : t.holdingCard.setPrice}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          {t.holdingCard.totalReturn}:{" "}
          <span className={gainClass}>
            {holding.simpleReturnPct != null ? formatPercent(holding.simpleReturnPct) : "—"}
          </span>
        </span>
        <span>
          {t.holdingCard.annualized}:{" "}
          <span className={gainClass}>
            {holding.annualizedReturnPct != null
              ? formatPercent(holding.annualizedReturnPct)
              : "—"}
          </span>
        </span>
      </div>
    </Link>
  );
}
