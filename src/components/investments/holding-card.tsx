import Link from "next/link";
import { ASSET_TYPES } from "@/lib/validations";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { ASSET_TYPE_LABELS } from "./asset-type-labels";

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

export function HoldingCard({ holding }: { holding: HoldingCardData }) {
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
            {ASSET_TYPE_LABELS[holding.type]} · {holding.currency} · {holding.quantityHeld} held
          </p>
        </div>
        <div className="text-right">
          <p className="font-medium">
            {holding.currentValue != null
              ? formatCurrency(holding.currentValue, holding.currency)
              : "—"}
          </p>
          <p className={`text-xs ${gainClass}`}>
            {holding.totalGain != null ? formatCurrency(holding.totalGain, holding.currency) : "Set a current price"}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
        <span>
          Total return:{" "}
          <span className={gainClass}>
            {holding.simpleReturnPct != null ? formatPercent(holding.simpleReturnPct) : "—"}
          </span>
        </span>
        <span>
          Annualized:{" "}
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
