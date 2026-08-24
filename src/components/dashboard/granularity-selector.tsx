"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";
import { CASH_FLOW_GRANULARITIES, type CashFlowGranularity } from "./aggregate";

export function GranularitySelector({ granularity }: { granularity: CashFlowGranularity }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  function setGranularity(next: CashFlowGranularity) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("granularity", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  const labels: Record<CashFlowGranularity, string> = {
    day: t.dashboard.granularity.day,
    week: t.dashboard.granularity.week,
    month: t.dashboard.granularity.month,
    year: t.dashboard.granularity.year,
  };

  return (
    <div
      className="inline-flex rounded-lg border border-border bg-card p-1 shrink-0"
      role="group"
      aria-label={t.dashboard.granularity.label}
    >
      {CASH_FLOW_GRANULARITIES.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => setGranularity(opt)}
          aria-pressed={granularity === opt}
          className={cn(
            "px-3 h-9 rounded-md text-sm font-medium transition-colors",
            granularity === opt
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent",
          )}
        >
          {labels[opt]}
        </button>
      ))}
    </div>
  );
}
