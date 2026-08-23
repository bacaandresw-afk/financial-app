import Link from "next/link";
import { Pencil } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ReceiptThumbnail } from "./receipt-thumbnail";
import { DeleteExpenseButton } from "./delete-expense-button";

export type ExpenseRowData = {
  id: string;
  amount: number;
  currency: string;
  date: Date;
  description: string | null;
  category: { name: string; color: string | null };
  receipt: { storagePath: string } | null;
};

export function ExpenseRow({ expense }: { expense: ExpenseRowData }) {
  return (
    <div className="flex items-center gap-3 py-3 px-4 border-b border-border last:border-b-0">
      <div
        className="h-2 w-2 rounded-full shrink-0"
        style={{ backgroundColor: expense.category.color ?? "hsl(var(--muted-foreground))" }}
        aria-hidden
      />

      {expense.receipt ? (
        <ReceiptThumbnail storagePath={expense.receipt.storagePath} />
      ) : null}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">{expense.category.name}</p>
          <span className="text-xs text-muted-foreground shrink-0">
            {formatDate(expense.date)}
          </span>
        </div>
        {expense.description && (
          <p className="text-sm text-muted-foreground truncate">{expense.description}</p>
        )}
      </div>

      <p className="font-semibold shrink-0">{formatCurrency(expense.amount, expense.currency)}</p>

      <div className="flex items-center gap-1 shrink-0">
        <Link
          href={`/expenses/${expense.id}/edit`}
          aria-label="Edit expense"
          className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Pencil className="h-4 w-4" />
        </Link>
        <DeleteExpenseButton id={expense.id} />
      </div>
    </div>
  );
}
