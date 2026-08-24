"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { LANGUAGES, type Language } from "@/lib/i18n/dictionaries";
import { LANGUAGE_COOKIE } from "@/lib/i18n/language";

export async function setLanguageAction(formData: FormData): Promise<void> {
  const lang = formData.get("lang");
  if (typeof lang !== "string" || !LANGUAGES.includes(lang as Language)) return;

  const cookieStore = await cookies();
  cookieStore.set(LANGUAGE_COOKIE, lang, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
}
