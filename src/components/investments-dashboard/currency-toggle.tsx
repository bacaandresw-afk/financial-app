"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { CURRENCIES } from "@/lib/validations";
import { SegmentedControl } from "@/components/ui/segmented-control";

export function CurrencyToggle({ currency }: { currency: (typeof CURRENCIES)[number] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function setCurrency(next: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("currency", next);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <SegmentedControl
      value={currency}
      onChange={setCurrency}
      className="shrink-0"
      options={CURRENCIES.map((opt) => ({ value: opt, label: opt }))}
    />
  );
}
