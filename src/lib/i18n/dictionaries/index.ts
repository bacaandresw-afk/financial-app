import { en } from "./en";
import { es } from "./es";

export type Language = "en" | "es";
export type Dictionary = typeof en;

// Type-only check: if `es` is missing a key `en` has, this line fails to
// compile. Keeps both dictionaries in sync as they grow.
const _esShapeCheck: Dictionary = es;
void _esShapeCheck;

const dictionaries: Record<Language, Dictionary> = { en, es };

export function getDictionary(lang: Language): Dictionary {
  return dictionaries[lang];
}

export const LANGUAGES: Language[] = ["en", "es"];
