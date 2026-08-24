import "server-only";

import { cookies } from "next/headers";
import { LANGUAGES, type Language } from "./dictionaries";

export const LANGUAGE_COOKIE = "lang";

export async function getLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const value = cookieStore.get(LANGUAGE_COOKIE)?.value;
  return LANGUAGES.includes(value as Language) ? (value as Language) : "en";
}
