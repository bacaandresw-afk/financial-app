"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./nav-items";
import { logoutAction } from "@/actions/auth";

export function SideNav({ userName }: { userName: string | null }) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:fixed md:inset-y-0 border-r border-border bg-card">
      <div className="px-5 py-6">
        <span className="text-lg font-semibold">Finance</span>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-accent",
              )}
            >
              <Icon className="h-4.5 w-4.5" />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <div className="px-3 py-2 text-sm text-muted-foreground truncate">{userName}</div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
          >
            <LogOut className="h-4.5 w-4.5" />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}
