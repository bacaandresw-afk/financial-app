"use client";

import { useActionState } from "react";
import Link from "next/link";
import { createIncome, updateIncome, type IncomeActionState } from "@/actions/income";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { CURRENCIES } from "@/lib/validations";
import { todayDateInputValue } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";

const initialState: IncomeActionState = { error: null };

type Category = { id: string; name: string };

type IncomeFormValues = {
  id?: string;
  amount?: number;
  currency?: string;
  date?: string;
  categoryId?: string;
  description?: string | null;
  source?: string | null;
};

export function IncomeForm({
  mode,
  categories,
  defaultValues,
}: {
  mode: "create" | "edit";
  categories: Category[];
  defaultValues?: IncomeFormValues;
}) {
  const action = mode === "create" ? createIncome : updateIncome;
  const [state, formAction, pending] = useActionState(action, initialState);
  const { t } = useTranslation();

  if (categories.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-5 text-sm text-muted-foreground space-y-3">
        <p>{t.income.form.needCategory}</p>
        <Link href="/income/categories" className="text-primary font-medium">
          {t.income.createCategory}
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {mode === "edit" && defaultValues?.id ? (
        <input type="hidden" name="id" value={defaultValues.id} />
      ) : null}

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label htmlFor="amount">{t.common.amount}</Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            inputMode="decimal"
            defaultValue={defaultValues?.amount}
            required
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="currency">{t.common.currency}</Label>
          <Select id="currency" name="currency" defaultValue={defaultValues?.currency ?? "ARS"}>
            {CURRENCIES.map((currency) => (
              <option key={currency} value={currency}>
                {currency}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date">{t.common.date}</Label>
        <Input
          id="date"
          name="date"
          type="date"
          defaultValue={defaultValues?.date ?? todayDateInputValue()}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="categoryId">{t.common.category}</Label>
        <Select id="categoryId" name="categoryId" defaultValue={defaultValues?.categoryId ?? ""} required>
          <option value="" disabled>
            {t.income.form.selectCategory}
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="source">{t.income.form.sourceLabel}</Label>
        <Input
          id="source"
          name="source"
          type="text"
          placeholder={t.income.form.sourcePlaceholder}
          defaultValue={defaultValues?.source ?? ""}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">{t.income.form.descriptionLabel}</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={defaultValues?.description ?? ""}
        />
      </div>

      <FieldError>{state.error}</FieldError>

      <div className="flex gap-3">
        <Button type="submit" disabled={pending} className="flex-1">
          {pending ? t.common.saving : mode === "create" ? t.income.addIncome : t.income.form.saveChanges}
        </Button>
        <Link
          href="/income"
          className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors h-11 px-4 text-sm border border-border bg-transparent hover:bg-accent"
        >
          {t.common.cancel}
        </Link>
      </div>
    </form>
  );
}
