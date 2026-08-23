"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select, Input, Label } from "@/components/ui/input";
import { PERIOD_LABELS } from "@/lib/date-range";
import type { Period } from "@/lib/validations";

const PERIOD_OPTIONS = Object.keys(PERIOD_LABELS) as Period[];

type Category = { id: string; name: string };

export function IncomeFilters({
  categories,
  period,
  categoryId,
  from,
  to,
}: {
  categories: Category[];
  period: Period;
  categoryId: string;
  from: string;
  to: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(updates: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="period-filter">Period</Label>
        <Select
          id="period-filter"
          value={period}
          onChange={(event) => {
            const value = event.target.value as Period;
            if (value === "custom") {
              updateParams({ period: value });
            } else {
              updateParams({ period: value, from: null, to: null });
            }
          }}
          className="w-44"
        >
          {PERIOD_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {PERIOD_LABELS[option]}
            </option>
          ))}
        </Select>
      </div>

      {period === "custom" ? (
        <>
          <div className="space-y-1.5">
            <Label htmlFor="from-filter">From</Label>
            <Input
              id="from-filter"
              type="date"
              defaultValue={from}
              onChange={(event) => updateParams({ from: event.target.value })}
              className="w-40"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="to-filter">To</Label>
            <Input
              id="to-filter"
              type="date"
              defaultValue={to}
              onChange={(event) => updateParams({ to: event.target.value })}
              className="w-40"
            />
          </div>
        </>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="category-filter">Category</Label>
        <Select
          id="category-filter"
          value={categoryId}
          onChange={(event) => updateParams({ categoryId: event.target.value || null })}
          className="w-44"
        >
          <option value="">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>
    </div>
  );
}
