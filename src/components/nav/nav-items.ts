import { LayoutDashboard, Receipt, Wallet, TrendingUp, Settings } from "lucide-react";

export const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/expenses", label: "Expenses", icon: Receipt },
  { href: "/income", label: "Income", icon: Wallet },
  { href: "/investments", label: "Investments", icon: TrendingUp },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;
