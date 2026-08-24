"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Plus, Receipt, Wallet, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";

const ACTIONS = [
  { href: "/expenses/new", labelKey: "addExpense", icon: Receipt },
  { href: "/income/new", labelKey: "addIncome", icon: Wallet },
  { href: "/investments/new", labelKey: "addInvestment", icon: TrendingUp },
] as const;

/** Floating quick-add button, mobile only — expands into Expense/Income/Investment shortcuts. */
export function Fab() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <div
      ref={containerRef}
      className="md:hidden fixed z-40 right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))]"
    >
      {open && (
        <>
          <div className="fixed inset-0 -z-10 bg-black/20" aria-hidden="true" />
          <ul className="flex flex-col items-end gap-3 mb-3">
            {ACTIONS.map(({ href, labelKey, icon: Icon }) => (
              <li key={href} className="flex items-center gap-2">
                <span className="rounded-md bg-card border border-border px-2.5 py-1 text-sm font-medium shadow-sm">
                  {t.nav[labelKey]}
                </span>
                <Link
                  href={href}
                  onClick={() => setOpen(false)}
                  aria-label={t.nav[labelKey]}
                  className="h-12 w-12 rounded-full bg-card border border-border shadow-md flex items-center justify-center active:scale-95 transition-transform"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t.nav.quickAdd}
        aria-expanded={open}
        className={cn(
          "h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform",
        )}
      >
        <Plus className={cn("h-6 w-6 transition-transform", open && "rotate-45")} />
      </button>
    </div>
  );
}
