"use client";

import { useTranslation } from "@/lib/i18n/language-context";
import { setLanguageAction } from "@/actions/settings";
import type { Language } from "@/lib/i18n/dictionaries";
import { segmentedControlClasses, segmentedItemClasses } from "@/components/ui/segmented-control";

const OPTIONS: { value: Language; labelKey: "english" | "spanish" }[] = [
  { value: "en", labelKey: "english" },
  { value: "es", labelKey: "spanish" },
];

export function LanguageSwitcher() {
  const { lang, t } = useTranslation();

  return (
    <div className={segmentedControlClasses}>
      {OPTIONS.map(({ value, labelKey }) => (
        <form key={value} action={setLanguageAction}>
          <input type="hidden" name="lang" value={value} />
          <button type="submit" className={segmentedItemClasses(lang === value)}>
            {t.settings[labelKey]}
          </button>
        </form>
      ))}
    </div>
  );
}
