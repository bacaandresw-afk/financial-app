"use client";

import { useActionState } from "react";
import { Trash2 } from "lucide-react";
import { deleteExpense, type ActionState } from "@/actions/expenses";
import { useTranslation } from "@/lib/i18n/language-context";

const initialState: ActionState = { error: null };

export function DeleteExpenseButton({ id }: { id: string }) {
  const [state, formAction, pending] = useActionState(deleteExpense, initialState);
  const { t } = useTranslation();

  return (
    <form
      action={formAction}
      onSubmit={(e) => {
        if (!confirm(t.expenses.deleteButton.confirm)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="id" value={id} />
      <button
        type="submit"
        disabled={pending}
        aria-label={t.expenses.deleteButton.ariaLabel}
        className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-accent transition-colors disabled:opacity-50"
      >
        <Trash2 className="h-4 w-4" />
      </button>
      {state.error && <p className="text-xs text-destructive mt-1">{state.error}</p>}
    </form>
  );
}
