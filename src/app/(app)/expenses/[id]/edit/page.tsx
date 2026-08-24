import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getReceiptSignedUrl } from "@/lib/storage";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { getLanguage } from "@/lib/i18n/language";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function EditExpensePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await requireUser();
  const t = getDictionary(await getLanguage());

  const [expense, categories] = await Promise.all([
    prisma.expense.findFirst({
      where: { id, userId: user.id },
      include: { receipt: true },
    }),
    prisma.expenseCategory.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!expense) notFound();

  let receiptSignedUrl: string | null = null;
  if (expense.receipt) {
    try {
      receiptSignedUrl = await getReceiptSignedUrl(expense.receipt.storagePath);
    } catch {
      receiptSignedUrl = null;
    }
  }

  return (
    <div className="max-w-md mx-auto space-y-6">
      <div>
        <Link
          href="/expenses"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          {t.expenses.backToExpenses}
        </Link>
        <h1 className="text-2xl font-semibold mt-2">{t.expenses.editPage.title}</h1>
      </div>

      <ExpenseForm
        categories={categories}
        expense={{
          id: expense.id,
          amount: Number(expense.amount),
          currency: expense.currency,
          date: expense.date,
          categoryId: expense.categoryId,
          description: expense.description,
          receipt: receiptSignedUrl ? { signedUrl: receiptSignedUrl } : null,
        }}
      />
    </div>
  );
}
