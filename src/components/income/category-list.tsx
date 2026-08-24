"use client";

import { CategoryRow } from "@/components/income/category-row";
import { useTranslation } from "@/lib/i18n/language-context";

export function CategoryList({ categories }: { categories: { id: string; name: string }[] }) {
  const { t } = useTranslation();

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
        {t.income.categoryList.empty}
      </div>
    );
  }

  return (
    <ul className="rounded-xl border border-border bg-card divide-y divide-border">
      {categories.map((category) => (
        <CategoryRow key={category.id} id={category.id} name={category.name} />
      ))}
    </ul>
  );
}
