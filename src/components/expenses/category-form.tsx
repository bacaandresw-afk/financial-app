"use client";

import { useActionState, useRef, useEffect } from "react";
import { createExpenseCategory, type ActionState } from "@/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

const initialState: ActionState = { error: null };

export function CategoryForm() {
  const [state, formAction, pending] = useActionState(createExpenseCategory, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const prevPending = useRef(pending);

  useEffect(() => {
    if (prevPending.current && !pending && !state.error) {
      formRef.current?.reset();
    }
    prevPending.current = pending;
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="new-category-name">New category</Label>
        <Input id="new-category-name" name="name" placeholder="e.g. Pets" required className="w-48" />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="new-category-color">Color</Label>
        <input
          id="new-category-color"
          name="color"
          type="color"
          defaultValue="#6366f1"
          className="h-11 w-14 rounded-lg border border-border bg-card p-1"
        />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Adding…" : "Add category"}
      </Button>
      <div className="basis-full">
        <FieldError>{state.error}</FieldError>
      </div>
    </form>
  );
}
