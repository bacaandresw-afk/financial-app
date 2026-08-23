"use client";

import type { ChangeEvent } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Select, Input, Label } from "@/components/ui/input";
import { PERIOD_LABELS } from "@/lib/date-range";
import type { Period } from "@/lib/validations";

const PERIOD_OPTIONS: Period[] = [
  "this_month",
  "last_month",
  "last_3_months",
  "last_6_months",
  "this_year",
  "custom",
];

export function PeriodSelector({
  period,
  from,
  to,
}: {
  period: Period;
  from?: string;
  to?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParams(next: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value) params.set(key, value);
      else params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  function handlePeriodChange(e: ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value as Period;
    if (value === "custom") {
      updateParams({ period: value });
    } else {
      updateParams({ period: value, from: undefined, to: undefined });
    }
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <Label htmlFor="period-select" className="sr-only">
          Period
        </Label>
        <Select id="period-select" value={period} onChange={handlePeriodChange} className="w-auto">
          {PERIOD_OPTIONS.map((p) => (
            <option key={p} value={p}>
              {PERIOD_LABELS[p]}
            </option>
          ))}
        </Select>
      </div>
      {period === "custom" ? (
        <>
          <div>
            <Label htmlFor="from-date" className="sr-only">
              From
            </Label>
            <Input
              id="from-date"
              type="date"
              defaultValue={from ?? ""}
              onChange={(e) => updateParams({ from: e.target.value || undefined })}
              className="w-auto"
            />
          </div>
          <div>
            <Label htmlFor="to-date" className="sr-only">
              To
            </Label>
            <Input
              id="to-date"
              type="date"
              defaultValue={to ?? ""}
              onChange={(e) => updateParams({ to: e.target.value || undefined })}
              className="w-auto"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}
