"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { CURRENCIES } from "@/lib/validations";

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
    <div className="inline-flex rounded-lg border border-border bg-card p-1 shrink-0">
      {CURRENCIES.map((opt) => (
        <button
          key={opt}
          type="button"
          onClick={() => setCurrency(opt)}
          aria-pressed={currency === opt}
          className={cn(
            "px-4 h-9 rounded-md text-sm font-medium transition-colors",
            currency === opt
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-accent",
          )}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}
