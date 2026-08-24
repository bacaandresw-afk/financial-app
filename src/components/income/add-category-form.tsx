"use client";

import { useActionState, useEffect, useRef } from "react";
import { createIncomeCategory, type IncomeActionState } from "@/actions/income";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/language-context";

const initialState: IncomeActionState = { error: null };

export function AddCategoryForm() {
  const [state, formAction, pending] = useActionState(createIncomeCategory, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="new-category-name">{t.income.categoryForm.newCategoryLabel}</Label>
          <Input
            id="new-category-name"
            name="name"
            type="text"
            placeholder={t.income.categoryForm.namePlaceholder}
            required
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? t.income.categoryForm.adding : t.income.categoryForm.addCategory}
        </Button>
      </div>
      <FieldError>{state.error}</FieldError>
    </form>
  );
}
