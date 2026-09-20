"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTranslation } from "@/lib/i18n/language-context";
import { SegmentedControl } from "@/components/ui/segmented-control";
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
    <SegmentedControl
      value={granularity}
      onChange={setGranularity}
      aria-label={t.dashboard.granularity.label}
      className="shrink-0"
      options={CASH_FLOW_GRANULARITIES.map((opt) => ({ value: opt, label: labels[opt] }))}
    />
  );
}
