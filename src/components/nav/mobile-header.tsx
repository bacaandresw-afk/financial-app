"use client";

import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";
import { useTranslation } from "@/lib/i18n/language-context";

export function MobileHeader() {
  const { t } = useTranslation();

  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-card border-b border-border">
      <span className="text-lg font-semibold">Finance</span>
      <form action={logoutAction}>
        <button
          type="submit"
          aria-label={t.nav.logOut}
          className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </form>
    </header>
  );
}
