import { xirr, type CashFlow } from "@/lib/xirr";

export type TransactionInput = {
  type: "BUY" | "SELL";
  date: Date;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
};

export type HoldingSummary = {
  quantityHeld: number;
  avgCostPerUnit: number;
  costBasisRemaining: number; // cost basis of the units still held
  totalBuyCost: number; // gross cost of every buy, all-time
  totalBuyQuantity: number;
  totalSellQuantity: number;
  realizedProceeds: number; // gross proceeds of every sell, all-time
  realizedCostBasis: number; // cost basis of the units that were sold
};

/**
 * Reduces a raw transaction list to a holding using the average-cost method:
 * every unit of a given asset shares the same cost basis, regardless of
 * which specific purchase lot it came from. This is simpler than FIFO/LIFO
 * lot tracking and is what most brokers show for tax-agnostic reporting.
 */
export function summarizeHolding(transactions: TransactionInput[]): HoldingSummary {
  let totalBuyCost = 0;
  let totalBuyQuantity = 0;
  let totalSellQuantity = 0;
  let realizedProceeds = 0;

  for (const t of transactions) {
    if (t.type === "BUY") {
      totalBuyCost += t.totalAmount;
      totalBuyQuantity += t.quantity;
    } else {
      totalSellQuantity += t.quantity;
      realizedProceeds += t.totalAmount;
    }
  }

  const avgCostPerUnit = totalBuyQuantity > 0 ? totalBuyCost / totalBuyQuantity : 0;
  const quantityHeld = totalBuyQuantity - totalSellQuantity;
  const realizedCostBasis = avgCostPerUnit * totalSellQuantity;
  const costBasisRemaining = avgCostPerUnit * quantityHeld;

  return {
    quantityHeld,
    avgCostPerUnit,
    costBasisRemaining,
    totalBuyCost,
    totalBuyQuantity,
    totalSellQuantity,
    realizedProceeds,
    realizedCostBasis,
  };
}

export type AssetPerformance = HoldingSummary & {
  currentValue: number | null; // null when no current price has been set
  unrealizedGain: number | null;
  realizedGain: number;
  totalGain: number | null;
  simpleReturnPct: number | null; // (totalGain / totalBuyCost) * 100
  annualizedReturnPct: number | null; // XIRR, as a percentage
};

export function computeAssetPerformance(
  transactions: TransactionInput[],
  currentPricePerUnit: number | null,
): AssetPerformance {
  const holding = summarizeHolding(transactions);
  const realizedGain = holding.realizedProceeds - holding.realizedCostBasis;

  const currentValue =
    currentPricePerUnit != null ? holding.quantityHeld * currentPricePerUnit : null;
  const unrealizedGain = currentValue != null ? currentValue - holding.costBasisRemaining : null;
  const totalGain = unrealizedGain != null ? unrealizedGain + realizedGain : null;
  const simpleReturnPct =
    totalGain != null && holding.totalBuyCost > 0 ? (totalGain / holding.totalBuyCost) * 100 : null;

  const cashFlows: CashFlow[] = transactions.map((t) => ({
    date: t.date,
    amount: t.type === "BUY" ? -t.totalAmount : t.totalAmount,
  }));
  if (currentValue != null && holding.quantityHeld > 0) {
    cashFlows.push({ date: new Date(), amount: currentValue });
  }
  const annualizedRate = xirr(cashFlows);

  return {
    ...holding,
    currentValue,
    unrealizedGain,
    realizedGain,
    totalGain,
    simpleReturnPct,
    annualizedReturnPct: annualizedRate != null ? annualizedRate * 100 : null,
  };
}
