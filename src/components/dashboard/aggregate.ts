import {
  eachDayOfInterval,
  eachWeekOfInterval,
  eachMonthOfInterval,
  eachYearOfInterval,
  startOfWeek,
  format,
  differenceInCalendarMonths,
} from "date-fns";

export type NamedTotal = { name: string; value: number };

/** Sums `amount` per category name. Input amounts must already be plain numbers. */
export function aggregateByCategory<T extends { amount: number; category: { name: string } }>(
  items: T[],
): NamedTotal[] {
  const totals = new Map<string, number>();
  for (const item of items) {
    totals.set(item.category.name, (totals.get(item.category.name) ?? 0) + item.amount);
  }
  return [...totals.entries()]
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

export type PieSlice = NamedTotal & { percent: number; isOther: boolean };

/**
 * Keeps the `topN` largest categories and folds the rest into a single
 * "other" slice. Expects descending-sorted input (`aggregateByCategory`).
 */
export function toPieSlices(data: NamedTotal[], topN: number, otherLabel: string): PieSlice[] {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  const pct = (v: number) => (total > 0 ? (v / total) * 100 : 0);
  const top = data.slice(0, topN).map((d) => ({ ...d, percent: pct(d.value), isOther: false }));
  const rest = data.slice(topN);
  if (rest.length === 0) return top;
  const otherValue = rest.reduce((sum, d) => sum + d.value, 0);
  return [...top, { name: otherLabel, value: otherValue, percent: pct(otherValue), isOther: true }];
}

/** True when the range crosses at least one calendar-month boundary. */
export function spansMultipleMonths(from: Date, to: Date): boolean {
  return differenceInCalendarMonths(to, from) >= 1;
}

export type TimeBucket = { label: string; income: number; expense: number };

export const CASH_FLOW_GRANULARITIES = ["day", "week", "month", "year"] as const;
export type CashFlowGranularity = (typeof CASH_FLOW_GRANULARITIES)[number];

/** Parses a raw searchParam value into a valid granularity, defaulting to "month". */
export function parseCashFlowGranularity(value: string | undefined): CashFlowGranularity {
  return (CASH_FLOW_GRANULARITIES as readonly string[]).includes(value ?? "")
    ? (value as CashFlowGranularity)
    : "month";
}

/**
 * Buckets expenses/incomes into day, week, month, or year buckets spanning
 * the whole [from, to] range (including empty buckets, so charts don't skip
 * gaps).
 */
export function bucketCashFlow(
  expenses: { amount: number; date: Date }[],
  incomes: { amount: number; date: Date }[],
  from: Date,
  to: Date,
  granularity: CashFlowGranularity,
): TimeBucket[] {
  const points = (() => {
    switch (granularity) {
      case "year":
        return eachYearOfInterval({ start: from, end: to });
      case "month":
        return eachMonthOfInterval({ start: from, end: to });
      case "week":
        return eachWeekOfInterval({ start: from, end: to }, { weekStartsOn: 1 });
      case "day":
      default:
        return eachDayOfInterval({ start: from, end: to });
    }
  })();

  // For week granularity, any date (a raw transaction date or one of the
  // week-start `points`) must be normalized to its Monday-start week before
  // formatting, so transactions land in the same bucket as their week's key.
  const keyOf = (d: Date) => {
    switch (granularity) {
      case "year":
        return format(d, "yyyy");
      case "month":
        return format(d, "yyyy-MM");
      case "week":
        return format(startOfWeek(d, { weekStartsOn: 1 }), "yyyy-MM-dd");
      case "day":
      default:
        return format(d, "yyyy-MM-dd");
    }
  };
  const labelOf = (d: Date) => {
    switch (granularity) {
      case "year":
        return format(d, "yyyy");
      case "month":
        return format(d, "MMM yyyy");
      case "week":
        return format(d, "MMM d");
      case "day":
      default:
        return format(d, "MMM d");
    }
  };

  const map = new Map<string, { income: number; expense: number }>();
  for (const p of points) map.set(keyOf(p), { income: 0, expense: 0 });

  for (const e of expenses) {
    const bucket = map.get(keyOf(e.date));
    if (bucket) bucket.expense += e.amount;
  }
  for (const i of incomes) {
    const bucket = map.get(keyOf(i.date));
    if (bucket) bucket.income += i.amount;
  }

  return points.map((p) => {
    const bucket = map.get(keyOf(p))!;
    return { label: labelOf(p), income: bucket.income, expense: bucket.expense };
  });
}
