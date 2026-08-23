import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeAssetPerformance } from "@/lib/portfolio";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { HoldingCard, type HoldingCardData } from "@/components/investments/holding-card";

export default async function InvestmentsPage() {
  const user = await requireUser();

  const assets = await prisma.asset.findMany({
    where: { userId: user.id },
    include: { transactions: true },
    orderBy: { name: "asc" },
  });

  const assetsWithPerformance = assets.map((asset) => ({
    asset,
    performance: computeAssetPerformance(
      asset.transactions.map((t) => ({
        type: t.type,
        date: t.date,
        quantity: Number(t.quantity),
        pricePerUnit: Number(t.pricePerUnit),
        totalAmount: Number(t.totalAmount),
      })),
      asset.currentPricePerUnit != null ? Number(asset.currentPricePerUnit) : null,
    ),
  }));

  const holdings: HoldingCardData[] = assetsWithPerformance.map(({ asset, performance }) => ({
    id: asset.id,
    name: asset.name,
    type: asset.type,
    currency: asset.currency,
    quantityHeld: performance.quantityHeld,
    currentValue: performance.currentValue,
    totalGain: performance.totalGain,
    simpleReturnPct: performance.simpleReturnPct,
    annualizedReturnPct: performance.annualizedReturnPct,
  }));

  // Combined totals, grouped per currency — an ARS holding and a USD
  // holding are never added together.
  type CurrencyTotals = { invested: number; currentValue: number; pl: number; missingPrice: boolean };
  const totalsByCurrency = new Map<string, CurrencyTotals>();

  for (const { asset, performance } of assetsWithPerformance) {
    const totals = totalsByCurrency.get(asset.currency) ?? {
      invested: 0,
      currentValue: 0,
      pl: 0,
      missingPrice: false,
    };
    totals.invested += performance.costBasisRemaining;
    if (performance.currentValue != null) {
      totals.currentValue += performance.currentValue;
    } else if (performance.quantityHeld > 0) {
      totals.missingPrice = true;
    }
    if (performance.totalGain != null) {
      totals.pl += performance.totalGain;
    } else {
      totals.pl += performance.realizedGain;
    }
    totalsByCurrency.set(asset.currency, totals);
  }

  const hasHoldings = holdings.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">Investments</h1>
          <p className="text-sm text-muted-foreground">
            Track your brokers, assets, and buy/sell transactions.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/investments/brokers">
            <Button variant="outline">Manage brokers</Button>
          </Link>
          <Link href="/investments/dashboard">
            <Button variant="secondary">View dashboard</Button>
          </Link>
          <Link href="/investments/new">
            <Button>Add investment</Button>
          </Link>
        </div>
      </div>

      {totalsByCurrency.size > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from(totalsByCurrency.entries()).map(([currency, totals]) => (
            <Card key={currency}>
              <CardHeader>
                <CardTitle>Summary ({currency})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <SummaryRow label="Total invested" value={formatCurrency(totals.invested, currency)} />
                <SummaryRow
                  label="Current value"
                  value={
                    totals.currentValue > 0 || !totals.missingPrice
                      ? formatCurrency(totals.currentValue, currency)
                      : "—"
                  }
                  hint={totals.missingPrice ? "Some assets are missing a current price" : undefined}
                />
                <SummaryRow
                  label="Total P/L"
                  value={formatCurrency(totals.pl, currency)}
                  valueClassName={totals.pl >= 0 ? "text-success" : "text-destructive"}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {hasHoldings ? (
        <div className="space-y-3">
          {holdings.map((holding) => (
            <HoldingCard key={holding.id} holding={holding} />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-10 text-center space-y-3">
            <p className="text-muted-foreground">
              You haven&apos;t added any investments yet.
            </p>
            <Link href="/investments/new">
              <Button>Add your first investment</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  valueClassName,
  hint,
}: {
  label: string;
  value: string;
  valueClassName?: string;
  hint?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className={`font-medium ${valueClassName ?? ""}`}>{value}</span>
      </div>
      {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
    </div>
  );
}
