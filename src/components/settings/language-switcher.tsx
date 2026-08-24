"use client";

import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";
import { setLanguageAction } from "@/actions/settings";
import type { Language } from "@/lib/i18n/dictionaries";

const OPTIONS: { value: Language; labelKey: "english" | "spanish" }[] = [
  { value: "en", labelKey: "english" },
  { value: "es", labelKey: "spanish" },
];

export function LanguageSwitcher() {
  const { lang, t } = useTranslation();

  return (
    <div className="inline-flex rounded-lg border border-border bg-muted p-1">
      {OPTIONS.map(({ value, labelKey }) => (
        <form key={value} action={setLanguageAction}>
          <input type="hidden" name="lang" value={value} />
          <button
            type="submit"
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              lang === value
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            {t.settings[labelKey]}
          </button>
        </form>
      ))}
    </div>
  );
}
