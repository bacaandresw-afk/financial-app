import { eachDayOfInterval, eachMonthOfInterval, format, differenceInCalendarMonths } from "date-fns";

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

/** True when the range crosses at least one calendar-month boundary. */
export function spansMultipleMonths(from: Date, to: Date): boolean {
  return differenceInCalendarMonths(to, from) >= 1;
}

export type TimeBucket = { label: string; income: number; expense: number };

/**
 * Buckets expenses/incomes into day or month buckets spanning the whole
 * [from, to] range (including empty buckets, so charts don't skip gaps).
 */
export function bucketCashFlow(
  expenses: { amount: number; date: Date }[],
  incomes: { amount: number; date: Date }[],
  from: Date,
  to: Date,
  granularity: "day" | "month",
): TimeBucket[] {
  const points =
    granularity === "month"
      ? eachMonthOfInterval({ start: from, end: to })
      : eachDayOfInterval({ start: from, end: to });

  const keyOf = (d: Date) => (granularity === "month" ? format(d, "yyyy-MM") : format(d, "yyyy-MM-dd"));
  const labelOf = (d: Date) => (granularity === "month" ? format(d, "MMM yyyy") : format(d, "MMM d"));

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
