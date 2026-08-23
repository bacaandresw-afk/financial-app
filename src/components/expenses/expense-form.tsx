"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createExpense, updateExpense, type ActionState } from "@/actions/expenses";
import { Button } from "@/components/ui/button";
import { Input, Textarea, Select, Label, FieldError } from "@/components/ui/input";
import { CURRENCIES } from "@/lib/validations";
import { todayDateInputValue, formatDate } from "@/lib/utils";

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

  if (categories.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-center space-y-3">
        <p className="font-medium">You need a category first</p>
        <p className="text-sm text-muted-foreground">
          Create at least one expense category before logging an expense.
        </p>
        <Link href="/expenses/categories">
          <Button type="button">Create a category</Button>
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-5">
      {isEdit && expense && <input type="hidden" name="id" value={expense.id} />}

      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount</Label>
        <div className="flex gap-2">
          <Select
            name="currency"
            defaultValue={expense?.currency ?? "ARS"}
            className="w-24 shrink-0"
            aria-label="Currency"
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
            placeholder="0.00"
            required
            autoFocus={!isEdit}
            defaultValue={expense?.amount ?? ""}
            className="text-2xl h-14 font-semibold"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="date">Date</Label>
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
        <Label htmlFor="categoryId">Category</Label>
        <Select id="categoryId" name="categoryId" required defaultValue={expense?.categoryId ?? ""}>
          <option value="" disabled>
            Select a category
          </option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="What was this for?"
          defaultValue={expense?.description ?? ""}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="receipt">Receipt photo (optional)</Label>

        {isEdit && expense?.receipt && !removeReceipt && (
          <div className="flex items-center gap-3 rounded-lg border border-border p-2">
            <Image
              src={expense.receipt.signedUrl}
              alt="Current receipt"
              width={56}
              height={56}
              className="h-14 w-14 rounded-md object-cover"
              unoptimized
            />
            <div className="flex-1 text-sm text-muted-foreground">Current receipt</div>
            <button
              type="button"
              onClick={() => setRemoveReceipt(true)}
              className="text-sm font-medium text-destructive"
            >
              Remove
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
            ? "Choosing a new photo replaces the current receipt."
            : "JPEG, PNG or WEBP, up to 8MB."}
        </p>
      </div>

      <FieldError>{state.error}</FieldError>

      <Button type="submit" className="w-full" size="lg" disabled={pending}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Add expense"}
      </Button>
    </form>
  );
}
