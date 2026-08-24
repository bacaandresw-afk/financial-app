"use client";

import { createContext, useContext, useMemo } from "react";
import { getDictionary, type Dictionary, type Language } from "./dictionaries";

type LanguageContextValue = {
  lang: Language;
  t: Dictionary;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

/**
 * `lang` comes from the server (cookie-backed, see src/lib/i18n/language.ts)
 * and is passed down as a prop rather than tracked in client state — the
 * language switcher works by calling a Server Action that updates the
 * cookie and revalidates the root layout, so this component simply re-renders
 * with a fresh `lang` prop rather than managing its own state.
 */
export function LanguageProvider({
  lang,
  children,
}: {
  lang: Language;
  children: React.ReactNode;
}) {
  const value = useMemo(() => ({ lang, t: getDictionary(lang) }), [lang]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useTranslation(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useTranslation must be used within LanguageProvider");
  return ctx;
}
