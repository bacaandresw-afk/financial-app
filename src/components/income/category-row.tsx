"use client";

import { useActionState, useState } from "react";
import { Pencil, Trash2, X } from "lucide-react";
import {
  updateIncomeCategory,
  deleteIncomeCategory,
  type IncomeActionState,
} from "@/actions/income";
import { Button } from "@/components/ui/button";
import { Input, FieldError } from "@/components/ui/input";

const initialState: IncomeActionState = { error: null };

export function CategoryRow({ id, name }: { id: string; name: string }) {
  const [editing, setEditing] = useState(false);
  const [renameState, renameAction, renamePending] = useActionState(updateIncomeCategory, initialState);
  const [deleteState, deleteAction, deletePending] = useActionState(deleteIncomeCategory, initialState);

  if (editing) {
    return (
      <li className="p-4 sm:px-5 space-y-2">
        <form action={renameAction} className="flex items-center gap-2">
          <input type="hidden" name="id" value={id} />
          <Input name="name" type="text" defaultValue={name} autoFocus required className="flex-1" />
          <Button type="submit" size="sm" disabled={renamePending}>
            {renamePending ? "Saving…" : "Save"}
          </Button>
          <Button type="button" size="sm" variant="outline" onClick={() => setEditing(false)}>
            <X className="h-4 w-4" />
          </Button>
        </form>
        <FieldError>{renameState.error}</FieldError>
      </li>
    );
  }

  return (
    <li className="p-4 sm:px-5 space-y-1">
      <div className="flex items-center gap-3">
        <span className="flex-1 min-w-0 truncate">{name}</span>
        <button
          type="button"
          aria-label="Rename category"
          title="Rename"
          onClick={() => setEditing(true)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </button>
        <form
          action={deleteAction}
          onSubmit={(event) => {
            if (!window.confirm(`Delete category "${name}"?`)) {
              event.preventDefault();
            }
          }}
        >
          <input type="hidden" name="id" value={id} />
          <button
            type="submit"
            disabled={deletePending}
            aria-label="Delete category"
            title="Delete"
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent hover:text-destructive transition-colors disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </form>
      </div>
      <FieldError>{deleteState.error}</FieldError>
    </li>
  );
}
