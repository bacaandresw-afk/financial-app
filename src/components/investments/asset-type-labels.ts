import { ASSET_TYPES } from "@/lib/validations";
import type { Dictionary } from "@/lib/i18n/dictionaries";

export function getAssetTypeLabels(
  t: Dictionary["investments"],
): Record<(typeof ASSET_TYPES)[number], string> {
  return t.assetTypes;
}
