"use client";

import { useActionState, useMemo, useState } from "react";
import { createTransaction, updateTransaction, type ActionState } from "@/actions/investments";
import { TRANSACTION_TYPES } from "@/lib/validations";
import { formatCurrency, todayDateInputValue } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea, FieldError } from "@/components/ui/input";
import { useTranslation } from "@/lib/i18n/language-context";

const initialState: ActionState = { error: null };

export type TransactionFormValues = {
  id?: string;
  brokerId: string;
  type: (typeof TRANSACTION_TYPES)[number];
  date: string; // yyyy-mm-dd
  quantity: number;
  pricePerUnit: number;
  notes: string | null;
};

export function TransactionForm({
  assetId,
  currency,
  brokers,
  defaultValues,
  onCancel,
}: {
  assetId: string;
  currency: string;
  brokers: { id: string; name: string }[];
  defaultValues?: TransactionFormValues;
  onCancel?: () => void;
}) {
  const { t } = useTranslation();
  const isEdit = Boolean(defaultValues?.id);
  const action = isEdit ? updateTransaction : createTransaction;
  const [state, formAction, pending] = useActionState(action, initialState);

  const [quantity, setQuantity] = useState(
    defaultValues ? String(defaultValues.quantity) : "",
  );
  const [pricePerUnit, setPricePerUnit] = useState(
    defaultValues ? String(defaultValues.pricePerUnit) : "",
  );

  const total = useMemo(() => {
    const q = Number(quantity);
    const p = Number(pricePerUnit);
    if (!Number.isFinite(q) || !Number.isFinite(p)) return null;
    return q * p;
  }, [quantity, pricePerUnit]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="assetId" value={assetId} />
      {defaultValues?.id && <input type="hidden" name="id" value={defaultValues.id} />}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor={`type-${assetId}`}>{t.investments.transactionForm.type}</Label>
          <Select
            id={`type-${assetId}`}
            name="type"
            required
            defaultValue={defaultValues?.type ?? "BUY"}
          >
            {TRANSACTION_TYPES.map((type) => (
              <option key={type} value={type}>
                {t.investments.transactionTypes[type]}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`brokerId-${assetId}`}>{t.investments.transactionForm.broker}</Label>
          <Select
            id={`brokerId-${assetId}`}
            name="brokerId"
            required
            defaultValue={defaultValues?.brokerId ?? brokers[0]?.id}
          >
            {brokers.map((broker) => (
              <option key={broker.id} value={broker.id}>
                {broker.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`date-${assetId}`}>{t.common.date}</Label>
          <Input
            id={`date-${assetId}`}
            name="date"
            type="date"
            required
            defaultValue={defaultValues?.date ?? todayDateInputValue()}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`quantity-${assetId}`}>{t.investments.transactionForm.quantity}</Label>
          <Input
            id={`quantity-${assetId}`}
            name="quantity"
            type="number"
            step="any"
            min="0"
            required
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor={`pricePerUnit-${assetId}`}>
            {t.investments.transactionForm.pricePerUnit}
          </Label>
          <Input
            id={`pricePerUnit-${assetId}`}
            name="pricePerUnit"
            type="number"
            step="any"
            min="0"
            required
            value={pricePerUnit}
            onChange={(e) => setPricePerUnit(e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label>{t.investments.transactionForm.total}</Label>
          <div className="h-11 flex items-center px-3 rounded-lg border border-border bg-muted text-sm font-medium">
            {total != null ? formatCurrency(total, currency) : "—"}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={`notes-${assetId}`}>{t.investments.transactionForm.notesOptional}</Label>
        <Textarea id={`notes-${assetId}`} name="notes" defaultValue={defaultValues?.notes ?? ""} />
      </div>

      <FieldError>{state.error}</FieldError>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending
            ? t.investments.transactionForm.saving
            : isEdit
              ? t.investments.transactionForm.saveChanges
              : t.investments.transactionForm.addTransaction}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            {t.common.cancel}
          </Button>
        )}
      </div>
    </form>
  );
}
