import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { CURRENCIES } from "@/lib/validations";
import { formatCurrency, formatPercent } from "@/lib/utils";
import { computeAssetPerformance, type TransactionInput } from "@/lib/portfolio";
import { CurrencyToggle } from "@/components/investments-dashboard/currency-toggle";
import { StatCard } from "@/components/investments-dashboard/stat-card";
import { ChartCard } from "@/components/investments-dashboard/chart-card";
import { EmptyState } from "@/components/investments-dashboard/empty-state";
import { AllocationPieChart } from "@/components/investments-dashboard/allocation-pie-chart";
import { PerformanceBarChart } from "@/components/investments-dashboard/performance-bar-chart";
import { aggregateByName, assetTypeLabel } from "@/components/investments-dashboard/aggregate";

type CurrencyCode = (typeof CURRENCIES)[number];

type SearchParams = { currency?: string };

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function resolveCurrency(userId: string, requested?: string): Promise<CurrencyCode> {
  if (requested === "ARS" || requested === "USD") return requested;

  const assetCounts = await prisma.asset.groupBy({
    by: ["currency"],
    where: { userId },
    _count: { _all: true },
  });
  const countFor = (currency: CurrencyCode) =>
    assetCounts.find((c) => c.currency === currency)?._count._all ?? 0;

  return countFor("USD") > countFor("ARS") ? "USD" : "ARS";
}

type BrokerAgg = { brokerId: string; brokerName: string; invested: number; currentValue: number; gain: number };

export default async function InvestmentsDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const currency = await resolveCurrency(user.id, first(sp.currency));

  const assets = await prisma.asset.findMany({
    where: { userId: user.id, currency },
    include: {
      transactions: {
        include: { broker: true },
        orderBy: { date: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  // Per-asset performance, using the average-cost math from lib/portfolio.
  const assetPerf = assets.map((asset) => {
    const txs: TransactionInput[] = asset.transactions.map((t) => ({
      type: t.type,
      date: t.date,
      quantity: Number(t.quantity),
      pricePerUnit: Number(t.pricePerUnit),
      totalAmount: Number(t.totalAmount),
    }));
    const currentPrice = asset.currentPricePerUnit != null ? Number(asset.currentPricePerUnit) : null;
    const perf = computeAssetPerformance(txs, currentPrice);
    return {
      id: asset.id,
      name: asset.name,
      type: asset.type,
      currentPrice,
      perf,
      transactions: asset.transactions,
    };
  });

  // Portfolio-level totals. When an asset has no current price, its
  // unrealized gain/current value are unknown, so we fall back to cost
  // basis (current value) and realized gain only (total gain) for that
  // asset's contribution to the totals.
  let totalInvested = 0;
  let totalCurrentValue = 0;
  let totalGain = 0;
  for (const { perf } of assetPerf) {
    totalInvested += perf.totalBuyCost;
    totalCurrentValue += perf.currentValue ?? perf.costBasisRemaining;
    totalGain += perf.totalGain ?? perf.realizedGain;
  }
  const overallReturnPct = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

  // Performance by asset, for the bar chart.
  const performanceByAsset = assetPerf
    .map((a) => ({ name: a.name, gain: a.perf.totalGain ?? a.perf.realizedGain }))
    .sort((a, b) => b.gain - a.gain);

  // Performance by broker: each asset's transactions are partitioned by the
  // broker they were executed through, and computeAssetPerformance is run
  // independently on each broker's slice (its own average cost basis,
  // valued at the asset's current price). This is simpler than
  // proportionally splitting a single asset-level number, and gives
  // sensible per-broker figures even when the same asset was bought through
  // multiple brokers.
  const brokerMap = new Map<string, BrokerAgg>();
  for (const asset of assetPerf) {
    const price = asset.currentPrice;

    const byBroker = new Map<string, TransactionInput[]>();
    const brokerNames = new Map<string, string>();
    for (const t of asset.transactions) {
      const list = byBroker.get(t.brokerId) ?? [];
      list.push({
        type: t.type,
        date: t.date,
        quantity: Number(t.quantity),
        pricePerUnit: Number(t.pricePerUnit),
        totalAmount: Number(t.totalAmount),
      });
      byBroker.set(t.brokerId, list);
      brokerNames.set(t.brokerId, t.broker.name);
    }

    for (const [brokerId, txs] of byBroker) {
      const perf = computeAssetPerformance(txs, price);
      const agg = brokerMap.get(brokerId) ?? {
        brokerId,
        brokerName: brokerNames.get(brokerId)!,
        invested: 0,
        currentValue: 0,
        gain: 0,
      };
      agg.invested += perf.totalBuyCost;
      agg.currentValue += perf.currentValue ?? perf.costBasisRemaining;
      agg.gain += perf.totalGain ?? perf.realizedGain;
      brokerMap.set(brokerId, agg);
    }
  }
  const brokerAggs = [...brokerMap.values()].sort((a, b) => b.gain - a.gain);
  const performanceByBroker = brokerAggs.map((b) => ({ name: b.brokerName, gain: b.gain }));

  // Allocation by asset type / broker, using current value (or cost basis
  // when no current price is set) — never mixing currencies.
  const allocationByType = aggregateByName(
    assetPerf.map((a) => ({
      name: assetTypeLabel(a.type),
      value: a.perf.currentValue ?? a.perf.costBasisRemaining,
    })),
  );
  const allocationByBroker = aggregateByName(
    brokerAggs.map((b) => ({ name: b.brokerName, value: b.currentValue })),
  );

  const hasAnyAssets = assets.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Investments dashboard</h1>
        <CurrencyToggle currency={currency} />
      </div>

      {!hasAnyAssets ? (
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          No {currency} assets yet. Add an asset and some transactions to see your portfolio
          performance here.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard label="Total invested capital" value={formatCurrency(totalInvested, currency)} />
            <StatCard label="Current portfolio value" value={formatCurrency(totalCurrentValue, currency)} />
            <StatCard
              label="Total profit / loss"
              value={formatCurrency(totalGain, currency)}
              valueClassName={totalGain >= 0 ? "text-success" : "text-destructive"}
            />
            <StatCard
              label="Overall return"
              value={formatPercent(overallReturnPct)}
              valueClassName={overallReturnPct >= 0 ? "text-success" : "text-destructive"}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <ChartCard title="Performance by asset">
              {performanceByAsset.length > 0 ? (
                <PerformanceBarChart data={performanceByAsset} currency={currency} />
              ) : (
                <EmptyState message="No assets to show yet." />
              )}
            </ChartCard>

            <ChartCard title="Performance by broker">
              {performanceByBroker.length > 0 ? (
                <PerformanceBarChart data={performanceByBroker} currency={currency} />
              ) : (
                <EmptyState message="No broker transactions to show yet." />
              )}
            </ChartCard>

            <ChartCard title="Allocation by asset type">
              {allocationByType.length > 0 ? (
                <AllocationPieChart data={allocationByType} currency={currency} />
              ) : (
                <EmptyState message="No valued holdings to show yet." />
              )}
            </ChartCard>

            <ChartCard title="Allocation by broker">
              {allocationByBroker.length > 0 ? (
                <AllocationPieChart data={allocationByBroker} currency={currency} />
              ) : (
                <EmptyState message="No valued holdings to show yet." />
              )}
            </ChartCard>
          </div>
        </>
      )}
    </div>
  );
}
