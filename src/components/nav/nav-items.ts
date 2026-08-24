import { LayoutDashboard, Receipt, Wallet, TrendingUp, Settings } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/expenses", labelKey: "expenses", icon: Receipt },
  { href: "/income", labelKey: "income", icon: Wallet },
  { href: "/investments", labelKey: "investments", icon: TrendingUp },
  { href: "/settings", labelKey: "settings", icon: Settings },
] as const;
