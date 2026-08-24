import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ExpenseForm } from "@/components/expenses/expense-form";
import { getLanguage } from "@/lib/i18n/language";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function NewExpensePage() {
  const user = await requireUser();
  const t = getDictionary(await getLanguage());

  const categories = await prisma.expenseCategory.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

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
        <h1 className="text-2xl font-semibold mt-2">{t.expenses.addExpense}</h1>
      </div>

      <ExpenseForm categories={categories} />
    </div>
  );
}
