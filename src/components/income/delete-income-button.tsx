"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteIncome, type IncomeActionState } from "@/actions/income";
import { useTranslation } from "@/lib/i18n/language-context";

const initialState: IncomeActionState = { error: null };

export function DeleteIncomeButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(deleteIncome, initialState);
  const { t } = useTranslation();

  return (
    <form
      action={formAction}
      onSubmit={(event) => {
        if (!window.confirm(t.income.deleteButton.confirm)) {
          event.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        aria-label={t.income.deleteButton.ariaLabel}
        title={t.common.delete}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-destructive transition-colors disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {state.error ? <p className="text-xs text-destructive mt-1">{state.error}</p> : null}
    </form>
  );
}
