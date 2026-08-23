import { LogOut } from "lucide-react";
import { logoutAction } from "@/actions/auth";

export function MobileHeader() {
  return (
    <header className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-card border-b border-border">
      <span className="text-lg font-semibold">Finance</span>
      <form action={logoutAction}>
        <button
          type="submit"
          aria-label="Log out"
          className="p-2 -mr-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-5 w-5" />
        </button>
      </form>
    </header>
  );
}
