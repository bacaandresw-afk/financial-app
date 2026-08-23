import Link from "next/link";
import { Plus } from "lucide-react";

/** Floating quick-add button, mobile only — the fastest path to logging an expense. */
export function Fab({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="md:hidden fixed z-40 right-4 bottom-[calc(4.5rem+env(safe-area-inset-bottom))] h-14 w-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center active:scale-95 transition-transform"
    >
      <Plus className="h-6 w-6" />
    </Link>
  );
}
