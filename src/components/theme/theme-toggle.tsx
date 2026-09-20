"use client";

import { Sun, Moon, Monitor } from "lucide-react";
import { useTranslation } from "@/lib/i18n/language-context";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { useTheme, type Theme } from "./theme-provider";

const OPTIONS: { value: Theme; labelKey: "themeLight" | "themeDark" | "themeSystem"; icon: typeof Sun }[] = [
  { value: "light", labelKey: "themeLight", icon: Sun },
  { value: "dark", labelKey: "themeDark", icon: Moon },
  { value: "system", labelKey: "themeSystem", icon: Monitor },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  return (
    <SegmentedControl
      value={theme}
      onChange={setTheme}
      options={OPTIONS.map(({ value, labelKey, icon }) => ({
        value,
        label: t.settings[labelKey],
        icon,
      }))}
    />
  );
}
