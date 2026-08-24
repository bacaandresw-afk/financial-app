"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Select } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/language-context";
import type { Language } from "@/lib/i18n/dictionaries";

type CategoryOption = { id: string; name: string };

function monthOptions(lang: Language, count = 12): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  const locale = lang === "es" ? "es-AR" : "en-US";
  for (let i = 0; i < count; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const value = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = d.toLocaleDateString(locale, { month: "long", year: "numeric" });
    options.push({ value, label });
  }
  return options;
}

export function FilterBar({
  categories,
  month,
  categoryId,
}: {
  categories: CategoryOption[];
  month: string;
  categoryId: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t, lang } = useTranslation();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Select
        aria-label={t.expenses.filter.filterByMonth}
        value={month}
        onChange={(e) => updateParam("month", e.target.value)}
        className="w-auto"
      >
        <option value="all">{t.expenses.filter.allTime}</option>
        {monthOptions(lang).map((m) => (
          <option key={m.value} value={m.value}>
            {m.label}
          </option>
        ))}
      </Select>

      <Select
        aria-label={t.expenses.filter.filterByCategory}
        value={categoryId}
        onChange={(e) => updateParam("categoryId", e.target.value)}
        className="w-auto"
      >
        <option value="all">{t.expenses.filter.allCategories}</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
