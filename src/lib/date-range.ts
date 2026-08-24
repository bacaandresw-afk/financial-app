import {
  startOfMonth,
  endOfMonth,
  subMonths,
  startOfYear,
  endOfYear,
  startOfDay,
  endOfDay,
} from "date-fns";
import type { Period } from "@/lib/validations";

export type DateRange = { from: Date; to: Date };

export function getPeriodRange(
  period: Period,
  custom?: { from?: string; to?: string },
): DateRange {
  const now = new Date();

  switch (period) {
    case "this_month":
      return { from: startOfMonth(now), to: endOfMonth(now) };
    case "last_month": {
      const prev = subMonths(now, 1);
      return { from: startOfMonth(prev), to: endOfMonth(prev) };
    }
    case "last_3_months":
      return { from: startOfDay(subMonths(now, 3)), to: endOfDay(now) };
    case "last_6_months":
      return { from: startOfDay(subMonths(now, 6)), to: endOfDay(now) };
    case "this_year":
      return { from: startOfYear(now), to: endOfYear(now) };
    case "custom":
      return {
        from: custom?.from ? startOfDay(new Date(custom.from)) : startOfMonth(now),
        to: custom?.to ? endOfDay(new Date(custom.to)) : endOfDay(now),
      };
    default:
      return { from: startOfMonth(now), to: endOfMonth(now) };
  }
}

