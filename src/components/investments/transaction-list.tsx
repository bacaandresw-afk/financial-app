"use client";

import { useActionState, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { deleteTransaction, type ActionState } from "@/actions/investments";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/input";
import { TransactionForm, type TransactionFormValues } from "./transaction-form";
import { useTranslation } from "@/lib/i18n/language-context";

const initialState: ActionState = { error: null };

export type TransactionRow = {
  id: string;
  date: string; // yyyy-mm-dd
  type: "BUY" | "SELL";
  brokerId: string;
  brokerName: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  notes: string | null;
};

export function TransactionList({
  assetId,
  currency,
  brokers,
  transactions,
}: {
  assetId: string;
  currency: string;
  brokers: { id: string; name: string }[];
  transactions: TransactionRow[];
}) {
  const { t } = useTranslation();
  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground">{t.investments.transactionList.empty}</p>;
  }

  return (
    <div className="space-y-3">
      {transactions.map((t) => (
        <TransactionRowItem
          key={t.id}
          assetId={assetId}
          currency={currency}
          brokers={brokers}
          transaction={t}
        />
      ))}
    </div>
  );
}

function TransactionRowItem({
  assetId,
  currency,
  brokers,
  transaction,
}: {
  assetId: string;
  currency: string;
  brokers: { id: string; name: string }[];
  transaction: TransactionRow;
}) {
  const { t } = useTranslation();
  const [editing, setEditing] = useState(false);
  const [deleteState, deleteFormAction, deletePending] = useActionState(
    deleteTransaction,
    initialState,
  );

  if (editing) {
    const defaultValues: TransactionFormValues = {
      id: transaction.id,
      brokerId: transaction.brokerId,
      type: transaction.type,
      date: transaction.date,
      quantity: transaction.quantity,
      pricePerUnit: transaction.pricePerUnit,
      notes: transaction.notes,
    };
    return (
      <div className="rounded-lg border border-border p-4 bg-muted/40">
        <TransactionForm
          assetId={assetId}
          currency={currency}
          brokers={brokers}
          defaultValues={defaultValues}
          onCancel={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <span
            className={
              transaction.type === "BUY"
                ? "text-xs font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success"
                : "text-xs font-semibold px-2 py-0.5 rounded-full bg-destructive/10 text-destructive"
            }
          >
            {t.investments.transactionTypes[transaction.type]}
          </span>
          <span className="text-sm">{formatDate(transaction.date)}</span>
          <span className="text-sm text-muted-foreground">{transaction.brokerName}</span>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span>
            {transaction.quantity} @ {formatCurrency(transaction.pricePerUnit, currency)}
          </span>
          <span className="font-medium">{formatCurrency(transaction.totalAmount, currency)}</span>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setEditing(true)}
              aria-label={t.investments.transactionList.edit}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <form action={deleteFormAction}>
              <input type="hidden" name="id" value={transaction.id} />
              <input type="hidden" name="assetId" value={assetId} />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                disabled={deletePending}
                aria-label={t.investments.transactionList.delete}
                onClick={(e) => {
                  if (!confirm(t.investments.transactionList.confirmDelete)) e.preventDefault();
                }}
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </form>
          </div>
        </div>
      </div>
      {transaction.notes && (
        <p className="text-sm text-muted-foreground mt-2">{transaction.notes}</p>
      )}
      <FieldError>{deleteState.error}</FieldError>
    </div>
  );
}
