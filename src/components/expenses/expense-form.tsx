"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createExpense, updateExpense, type ActionState } from "@/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label, FieldError } from "@/components/ui/input";
import { CURRENCIES } from "@/lib/validations";
import { todayDateInputValue, formatDate } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/language-context";

const initialState: ActionState = { error: null };

type CategoryOption = { id: string; name: string };

type ExistingExpense = {
  id: string;
  amount: number;
  currency: string;
  date: string | Date;
  categoryId: string;
  description: string | null;
  receipt: { signedUrl: string } | null;
};

export function ExpenseForm({
  categories,
  expense,
}: {
  categories: CategoryOption[];
  expense?: ExistingExpense;
}) {
  const isEdit = Boolean(expense);
  const action = isEdit ? updateExpense : createExpense;
  const [state, formAction, pending] = useActionState(action, initialState);
  const [removeReceipt, setRemoveReceipt] = useState(false);
  const { t } = useTranslation();

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
        <p className="font-medium">{t.expenses.form.needCategoryTitle}</p>
        <p className="text-sm text-muted-foreground">
          {t.expenses.form.needCategoryDesc}
        </p>
        <Link href="/expenses/categories">
          <Button type="button">{t.expenses.createCategory}</Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {isEdit && expense && <input type="hidden" name="id" value={expense.id} />}

      <div className="space-y-1.5">
        <Label htmlFor="amount">{t.common.amount}</Label>
        <div className="flex gap-2">
          <Select
            name="currency"
            defaultValue={expense?.currency ?? "ARS"}
            className="w-24 shrink-0"
            aria-label={t.expenses.form.currencyAriaLabel}
          >
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
          <Input
            id="amount"
            name="amount"
            type="number"
            inputMode="decimal"
            step="0.01"
            min="0"
            placeholder={t.expenses.form.amountPlaceholder}
            required
            autoFocus={!isEdit}
            defaultValue={expense?.amount ?? ""}
            className="text-2xl h-14 font-semibold"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date">{t.common.date}</Label>
        <Input
          id="date"
          name="date"
          type="date"
          required
          defaultValue={
            expense ? formatDate(expense.date) : todayDateInputValue()
          }
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="categoryId">{t.common.category}</Label>
        <Select id="categoryId" name="categoryId" required defaultValue={expense?.categoryId ?? ""}>
          <option value="" disabled>
            {t.expenses.form.selectCategory}
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">{t.expenses.form.descriptionLabel}</Label>
        <Textarea
          id="description"
          name="description"
          placeholder={t.expenses.form.descriptionPlaceholder}
          defaultValue={expense?.description ?? ""}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="receipt">{t.expenses.form.receiptLabel}</Label>

        {isEdit && expense?.receipt && !removeReceipt && (
          <div className="flex items-center gap-3 rounded-lg border border-border p-2">
            <Image
              src={expense.receipt.signedUrl}
              alt={t.expenses.form.currentReceipt}
              width={56}
              height={56}
              className="h-14 w-14 rounded-md object-cover"
              unoptimized
            />
            <div className="flex-1 text-sm text-muted-foreground">{t.expenses.form.currentReceipt}</div>
            <button
              type="button"
              onClick={() => setRemoveReceipt(true)}
              className="text-sm font-medium text-destructive"
            >
              {t.expenses.form.remove}
            </button>
          </div>
        )}

        {isEdit && removeReceipt && (
          <input type="hidden" name="removeReceipt" value="1" />
        )}

        <Input
          id="receipt"
          name="receipt"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          capture="environment"
        />
        <p className="text-xs text-muted-foreground">
          {isEdit && expense?.receipt && !removeReceipt
            ? t.expenses.form.replaceReceiptHint
            : t.expenses.form.receiptHint}
        </p>
      </div>

      <FieldError>{state.error}</FieldError>

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? t.common.saving : isEdit ? t.expenses.form.saveChanges : t.expenses.addExpense}
      </Button>
    </form>
  );
}
