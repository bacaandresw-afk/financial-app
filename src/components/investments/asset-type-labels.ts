import { ASSET_TYPES } from "@/lib/validations";

export const ASSET_TYPE_LABELS: Record<(typeof ASSET_TYPES)[number], string> = {
  STOCK: "Stock",
  ETF: "ETF",
  BOND: "Bond",
  CEDEAR: "CEDEAR",
  CRYPTO: "Crypto",
  MUTUAL_FUND: "Mutual fund",
  FIXED_INCOME: "Fixed income",
  OTHER: "Other",
};
