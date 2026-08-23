"use client";

import { useActionState, useEffect, useRef } from "react";
import { createIncomeCategory, type IncomeActionState } from "@/actions/income";
import { Button } from "@/components/ui/button";
import { Input, Label, FieldError } from "@/components/ui/input";

const initialState: IncomeActionState = { error: null };

export function AddCategoryForm() {
  const [state, formAction, pending] = useActionState(createIncomeCategory, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!pending && !state.error) {
      formRef.current?.reset();
    }
  }, [pending, state.error]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2">
      <div className="flex items-end gap-3">
        <div className="flex-1 space-y-1.5">
          <Label htmlFor="new-category-name">New category</Label>
          <Input id="new-category-name" name="name" type="text" placeholder="e.g. Bonus" required />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "Adding…" : "Add category"}
        </Button>
      </div>
      <FieldError>{state.error}</FieldError>
    </form>
  );
}
