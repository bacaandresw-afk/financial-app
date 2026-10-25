"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";

export function IncludeUsdToggle({ checked }: { checked: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useTranslation();

  function toggle() {
    const params = new URLSearchParams(searchParams.toString());
    if (checked) params.delete("includeUsd");
    else params.set("includeUsd", "1");
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={toggle}
      className="inline-flex items-center gap-2.5 text-sm font-medium"
    >
      <span
        className={cn(
          "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
          checked ? "border-primary" : "border-muted-foreground",
        )}
      >
        <span className={cn("h-2.5 w-2.5 rounded-full transition-colors", checked ? "bg-primary" : "bg-transparent")} />
      </span>
      {t.dashboard.usdIncome.toggleLabel}
    </button>
  );
}
