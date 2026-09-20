"use client";

import Link from "next/link";
import { LogOut, Settings } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useTranslation } from "@/lib/i18n/language-context";

export function MobileHeader() {
  const { t } = useTranslation();

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-card border-b border-border">
      <span className="text-lg font-semibold">Finance</span>
      <div className="flex items-center gap-1 -mr-2">
        <Link
          href="/settings"
          aria-label={t.nav.settings}
          className="p-2 text-muted-foreground hover:text-foreground"
        >
          <Settings className="h-5 w-5" />
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            aria-label={t.nav.logOut}
            className="p-2 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </form>
      </div>
    </header>
  );
}
