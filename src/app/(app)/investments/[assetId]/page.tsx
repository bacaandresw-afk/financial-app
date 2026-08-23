import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { computeAssetPerformance } from "@/lib/portfolio";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CurrentPriceForm } from "@/components/investments/current-price-form";
import { AddTransactionSection } from "@/components/investments/add-transaction-section";
import { TransactionList, type TransactionRow } from "@/components/investments/transaction-list";
import { DeleteAssetButton } from "@/components/investments/delete-asset-button";
import { ASSET_TYPE_LABELS } from "@/components/investments/asset-type-labels";

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ assetId: string }>;
}) {
  const { assetId } = await params;
  const user = await requireUser();

  const asset = await prisma.asset.findFirst({
    where: { id: assetId, userId: user.id },
    include: {
      transactions: {
        include: { broker: true },
        orderBy: { date: "desc" },
      },
    },
  });

  if (!asset) notFound();

  const brokers = await prisma.broker.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  const performance = computeAssetPerformance(
    asset.transactions.map((t) => ({
      type: t.type,
      date: t.date,
      quantity: Number(t.quantity),
      pricePerUnit: Number(t.pricePerUnit),
      totalAmount: Number(t.totalAmount),
    })),
    asset.currentPricePerUnit != null ? Number(asset.currentPricePerUnit) : null,
  );

  const transactionRows: TransactionRow[] = asset.transactions.map((t) => ({
    id: t.id,
    date: t.date.toISOString().slice(0, 10),
    type: t.type,
    brokerId: t.brokerId,
    brokerName: t.broker.name,
    quantity: Number(t.quantity),
    pricePerUnit: Number(t.pricePerUnit),
    totalAmount: Number(t.totalAmount),
    notes: t.notes,
  }));

  const gainClass =
    performance.totalGain == null
      ? "text-muted-foreground"
      : performance.totalGain >= 0
        ? "text-success"
        : "text-destructive";

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/investments"
          className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1 mb-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to investments
        </Link>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">{asset.name}</h1>
            <p className="text-sm text-muted-foreground">
              {ASSET_TYPE_LABELS[asset.type]} · {asset.currency} · {performance.quantityHeld} held
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href={`/investments/${asset.id}/edit`}>
              <Button variant="outline">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
            <DeleteAssetButton assetId={asset.id} assetName={asset.name} />
          </div>
        </div>
        {asset.notes && <p className="text-sm text-muted-foreground mt-2">{asset.notes}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Current price</CardTitle>
        </CardHeader>
        <CardContent>
          <CurrentPriceForm
            assetId={asset.id}
            currentPricePerUnit={
              asset.currentPricePerUnit != null ? Number(asset.currentPricePerUnit) : null
            }
            currentPriceUpdatedAt={asset.currentPriceUpdatedAt}
            currency={asset.currency}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Stat label="Invested (cost basis)" value={formatCurrency(performance.costBasisRemaining, asset.currency)} />
            <Stat
              label="Current value"
              value={
                performance.currentValue != null
                  ? formatCurrency(performance.currentValue, asset.currency)
                  : "Set a current price to see performance"
              }
            />
            <Stat
              label="Realized gain"
              value={formatCurrency(performance.realizedGain, asset.currency)}
              valueClassName={performance.realizedGain >= 0 ? "text-success" : "text-destructive"}
            />
            <Stat
              label="Unrealized gain"
              value={
                performance.unrealizedGain != null
                  ? formatCurrency(performance.unrealizedGain, asset.currency)
                  : "—"
              }
              valueClassName={
                performance.unrealizedGain == null
                  ? undefined
                  : performance.unrealizedGain >= 0
                    ? "text-success"
                    : "text-destructive"
              }
            />
            <Stat
              label="Total gain"
              value={
                performance.totalGain != null
                  ? formatCurrency(performance.totalGain, asset.currency)
                  : "—"
              }
              valueClassName={gainClass}
            />
            <Stat
              label="Total return"
              value={
                performance.simpleReturnPct != null ? formatPercent(performance.simpleReturnPct) : "—"
              }
              valueClassName={gainClass}
            />
            <Stat
              label="Annualized return"
              value={
                performance.annualizedReturnPct != null
                  ? formatPercent(performance.annualizedReturnPct)
                  : "—"
              }
              valueClassName={gainClass}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <AddTransactionSection assetId={asset.id} currency={asset.currency} brokers={brokers} />
          <TransactionList
            assetId={asset.id}
            currency={asset.currency}
            brokers={brokers}
            transactions={transactionRows}
          />
        </CardContent>
      </Card>
    </div>
  );
}

function Stat({
  label,
  value,
  valueClassName,
}: {
  label: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-lg font-semibold ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}
