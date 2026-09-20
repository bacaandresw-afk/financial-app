import { LineChart, PieChart, Landmark, Layers, Bitcoin, Coins, PiggyBank, Boxes, type LucideIcon } from "lucide-react";
import { ASSET_TYPES } from "@/lib/validations";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function getAssetTypeLabels(
  t: Dictionary["investments"],
): Record<(typeof ASSET_TYPES)[number], string> {
  return t.assetTypes;
}

const ASSET_TYPE_ICONS: Record<(typeof ASSET_TYPES)[number], LucideIcon> = {
  STOCK: LineChart,
  ETF: PieChart,
  BOND: Landmark,
  CEDEAR: Layers,
  CRYPTO: Bitcoin,
  MUTUAL_FUND: Coins,
  FIXED_INCOME: PiggyBank,
  OTHER: Boxes,
};

export function getAssetTypeIcon(type: (typeof ASSET_TYPES)[number]): LucideIcon {
  return ASSET_TYPE_ICONS[type];
}
