"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { DeleteIncomeButton } from "@/components/income/delete-income-button";
import { useTranslation } from "@/lib/i18n/language-context";

export type IncomeListItem = {
  id: string;
  amount: number;
  currency: string;
  date: Date;
  description: string | null;
  source: string | null;
  category: { id: string; name: string };
};

export function IncomeList({ incomes }: { incomes: IncomeListItem[] }) {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden divide-y divide-border">
      {incomes.map((income) => (
        <div
          key={income.id}
          className="flex items-center gap-3 p-4 sm:px-5"
        >
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="font-medium">{formatCurrency(income.amount, income.currency)}</span>
              <span className="text-sm text-muted-foreground">{income.category.name}</span>
            </div>
            <div className="mt-0.5 text-sm text-muted-foreground truncate">
              {formatDate(income.date)}
              {income.source ? ` · ${income.source}` : ""}
              {income.description ? ` · ${income.description}` : ""}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Link
              href={`/income/${income.id}/edit`}
              aria-label={t.income.list.editAriaLabel}
              title={t.common.edit}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <DeleteIncomeButton id={income.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
