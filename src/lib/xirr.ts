/**
 * XIRR: the money-weighted annualized return for a series of dated cash
 * flows. This is the correct metric here (rather than a flat CAGR) because
 * an asset can be built from several purchases/sales on different dates —
 * XIRR is the discount rate that makes the net present value of every cash
 * flow, including the current holding value as a final flow, equal to zero.
 * For a single lump-sum purchase it reduces to the same result as CAGR.
 */
export type CashFlow = {
  date: Date;
  amount: number; // negative = money out (purchase), positive = money in (sale / current value)
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const MAX_ITERATIONS = 100;
const TOLERANCE = 1e-7;

function npv(rate: number, flows: CashFlow[], t0: number): number {
  return flows.reduce((sum, f) => {
    const years = (f.date.getTime() - t0) / MS_PER_DAY / 365;
    return sum + f.amount / Math.pow(1 + rate, years);
  }, 0);
}

function npvDerivative(rate: number, flows: CashFlow[], t0: number): number {
  return flows.reduce((sum, f) => {
    const years = (f.date.getTime() - t0) / MS_PER_DAY / 365;
    if (years === 0) return sum;
    return sum - (years * f.amount) / Math.pow(1 + rate, years + 1);
  }, 0);
}

/**
 * Returns the annualized rate as a decimal (0.15 = 15%/year), or null when
 * it can't be computed (fewer than 2 flows, all same sign, or no convergence).
 */
export function xirr(flows: CashFlow[]): number | null {
  const usable = flows.filter((f) => f.amount !== 0);
  if (usable.length < 2) return null;

  const hasPositive = usable.some((f) => f.amount > 0);
  const hasNegative = usable.some((f) => f.amount < 0);
  if (!hasPositive || !hasNegative) return null;

  const t0 = Math.min(...usable.map((f) => f.date.getTime()));

  let rate = 0.1;
  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const value = npv(rate, usable, t0);
    const derivative = npvDerivative(rate, usable, t0);
    if (Math.abs(derivative) < 1e-12) break;

    const nextRate = rate - value / derivative;
    if (!Number.isFinite(nextRate) || nextRate <= -1) break;

    if (Math.abs(nextRate - rate) < TOLERANCE) return nextRate;
    rate = nextRate;
  }

  // Newton's method didn't converge (can happen with unusual cash-flow
  // patterns) — fall back to bisection over a wide, sane range.
  let low = -0.9999;
  let high = 10;
  let lowValue = npv(low, usable, t0);
  const highValue = npv(high, usable, t0);
  if (Number.isNaN(lowValue) || Number.isNaN(highValue) || lowValue * highValue > 0) {
    return null;
  }

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    const mid = (low + high) / 2;
    const midValue = npv(mid, usable, t0);
    if (Math.abs(midValue) < TOLERANCE) return mid;
    if (lowValue * midValue < 0) {
      high = mid;
    } else {
      low = mid;
      lowValue = midValue;
    }
  }

  return (low + high) / 2;
}
