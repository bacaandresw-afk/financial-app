"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Pencil, Trash2, Check, X } from "lucide-react";
import { updateExpenseCategory, deleteExpenseCategory, type ActionState } from "@/actions/expenses";
import { Input, FieldError } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/language-context";

const initialState: ActionState = { error: null };

export function CategoryRow({
  category,
}: {
  category: { id: string; name: string; color: string | null; expenseCount: number };
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateExpenseCategory,
    initialState,
  );
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteExpenseCategory,
    initialState,
  );
  const prevUpdatePending = useRef(updatePending);

  useEffect(() => {
    if (prevUpdatePending.current && !updatePending && !updateState.error) {
      setEditing(false);
    }
    prevUpdatePending.current = updatePending;
  }, [updatePending, updateState.error]);

  return (
    <div className="py-3 px-4 border-b border-border last:border-b-0">
      {editing ? (
        <form action={updateFormAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={category.id} />
          <input
            name="color"
            type="color"
            defaultValue={category.color ?? "#6366f1"}
            className="h-9 w-11 rounded-md border border-border bg-card p-1 shrink-0"
          />
          <Input name="name" defaultValue={category.name} required className="h-9 flex-1" autoFocus />
          <button
            type="submit"
            disabled={updatePending}
            aria-label={t.common.save}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-success hover:bg-accent shrink-0"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setEditing(false)}
            aria-label={t.common.cancel}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:bg-accent shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </form>
      ) : (
        <div className="flex items-center gap-3">
          <div
            className="h-3 w-3 rounded-full shrink-0"
            style={{ backgroundColor: category.color ?? "hsl(var(--muted-foreground))" }}
            aria-hidden
          />
          <p className="flex-1 font-medium truncate">{category.name}</p>
          <span className="text-xs text-muted-foreground shrink-0">
            {category.expenseCount}{" "}
            {category.expenseCount === 1
              ? t.expenses.categoryRow.expenseSingular
              : t.expenses.categoryRow.expensePlural}
          </span>
          <button
            type="button"
            onClick={() => setEditing(true)}
            aria-label={t.expenses.categoryRow.renameCategory}
            className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent shrink-0"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <form
            action={deleteFormAction}
            onSubmit={(e) => {
              if (!confirm(t.expenses.categoryRow.deleteConfirm.replace("{name}", category.name))) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={category.id} />
            <button
              type="submit"
              disabled={deletePending}
              aria-label={t.expenses.categoryRow.deleteCategory}
              className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-destructive hover:bg-accent shrink-0"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}
      <FieldError>{updateState.error}</FieldError>
      <FieldError>{deleteState.error}</FieldError>
    </div>
  );
}
