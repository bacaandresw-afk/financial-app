"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { useTranslation } from "@/lib/i18n/language-context";

// Settings lives in the mobile header (gear icon) instead of the bottom bar
// so the bar has exactly 4 tabs, leaving the 3rd/center slot for the FAB.
const BOTTOM_NAV_ITEMS = NAV_ITEMS.filter((item) => item.labelKey !== "settings");

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const [left, right] = [BOTTOM_NAV_ITEMS.slice(0, 2), BOTTOM_NAV_ITEMS.slice(2)];

  function renderItem({ href, labelKey, icon: Icon }: (typeof BOTTOM_NAV_ITEMS)[number]) {
    const active = pathname === href || pathname.startsWith(href + "/");
    return (
      <li key={href} className="flex-1">
        <Link
          href={href}
          className={cn(
            "mx-1.5 flex flex-col items-center justify-center gap-1 rounded-2xl py-2.5 text-xs transition-colors",
            active ? "bg-primary/10 text-primary" : "text-muted-foreground",
          )}
        >
          <Icon className="h-5 w-5" strokeWidth={active ? 2.5 : 2} />
          {t.nav[labelKey]}
        </Link>
      </li>
    );
  }

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border pb-[env(safe-area-inset-bottom)]">
      <ul className="flex items-center py-1">
        {left.map(renderItem)}
        <li className="w-16 shrink-0" aria-hidden />
        {right.map(renderItem)}
      </ul>
    </nav>
  );
}
