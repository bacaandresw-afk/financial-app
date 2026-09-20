import {
  ShoppingCart,
  Bus,
  Utensils,
  Zap,
  Home,
  HeartPulse,
  Clapperboard,
  Wallet,
  Laptop,
  Briefcase,
  TrendingUp,
  PiggyBank,
  Tag,
  type LucideIcon,
} from "lucide-react";

// Keyword -> icon, checked as a case-insensitive substring of the category
// name. Covers the app's seeded EN defaults (see src/actions/auth.ts) plus
// common ES equivalents a user might type; anything unmatched falls back to
// a monogram letter in getCategoryIcon's caller.
const KEYWORD_ICONS: [string, LucideIcon][] = [
  ["grocer", ShoppingCart],
  ["supermercado", ShoppingCart],
  ["mercado", ShoppingCart],
  ["transport", Bus],
  ["transporte", Bus],
  ["dining", Utensils],
  ["restaurant", Utensils],
  ["comida", Utensils],
  ["utilit", Zap],
  ["servicio", Zap],
  ["housing", Home],
  ["rent", Home],
  ["alquiler", Home],
  ["vivienda", Home],
  ["health", HeartPulse],
  ["salud", HeartPulse],
  ["entertainment", Clapperboard],
  ["entretenimiento", Clapperboard],
  ["salary", Wallet],
  ["salario", Wallet],
  ["sueldo", Wallet],
  ["freelance", Laptop],
  ["business", Briefcase],
  ["negocio", Briefcase],
  ["investment", TrendingUp],
  ["inversi", TrendingUp],
];

export function getCategoryIcon(name: string): LucideIcon {
  const lower = name.toLowerCase();
  for (const [keyword, icon] of KEYWORD_ICONS) {
    if (lower.includes(keyword)) return icon;
  }
  return Tag;
}

// Deterministic HSL derived from the category name, used when there's no
// stored color (e.g. IncomeCategory has no `color` column).
export function hashColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i);
    hash |= 0;
  }
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 45%)`;
}

export function getCategoryColor(category: { name: string; color?: string | null }): string {
  return category.color ?? hashColor(category.name);
}

export function CategoryIcon({
  name,
  color,
  className,
}: {
  name: string;
  color: string;
  className?: string;
}) {
  const Icon = getCategoryIcon(name);
  return (
    <div
      className={className ?? "h-10 w-10 rounded-2xl flex items-center justify-center shrink-0"}
      style={{ backgroundColor: color }}
      aria-hidden
    >
      <Icon className="h-5 w-5 text-white" />
    </div>
  );
}
