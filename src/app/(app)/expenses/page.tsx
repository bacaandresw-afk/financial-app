import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FilterBar } from "@/components/expenses/filter-bar";
import { ExpenseRow, type ExpenseRowData } from "@/components/expenses/expense-row";

function currentMonthValue(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/** Parses a "YYYY-MM" value into a [start, exclusiveEnd) UTC date range,
 * matching how @db.Date columns store plain dates. */
function monthToRange(month: string): { gte: Date; lt: Date } | null {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) return null;
  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  return {
    gte: new Date(Date.UTC(year, monthIndex, 1)),
    lt: new Date(Date.UTC(year, monthIndex + 1, 1)),
  };
}

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; categoryId?: string }>;
}) {
  const user = await requireUser();
  const params = await searchParams;

  const month = params.month ?? currentMonthValue();
  const categoryId = params.categoryId ?? "all";
  const range = month === "all" ? null : monthToRange(month);

  const [categories, totalCategoryCount, expenses] = await Promise.all([
    prisma.expenseCategory.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.expenseCategory.count({ where: { userId: user.id } }),
    prisma.expense.findMany({
      where: {
        userId: user.id,
        ...(range ? { date: range } : {}),
        ...(categoryId !== "all" ? { categoryId } : {}),
      },
      include: {
        category: { select: { name: true, color: true } },
        receipt: { select: { storagePath: true } },
      },
      orderBy: { date: "desc" },
    }),
  ]);

  const rows: ExpenseRowData[] = expenses.map((e) => ({
    id: e.id,
    amount: Number(e.amount),
    currency: e.currency,
    date: e.date,
    description: e.description,
    category: e.category,
    receipt: e.receipt,
  }));

  // Never sum across currencies — group totals per currency instead.
  const totalsByCurrency = rows.reduce<Record<string, number>>((acc, row) => {
    acc[row.currency] = (acc[row.currency] ?? 0) + row.amount;
    return acc;
  }, {});
  const currencyTotals = Object.entries(totalsByCurrency);

  const isFiltered = month !== "all" || categoryId !== "all";
  const hasAnyCategories = totalCategoryCount > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="text-2xl font-semibold">Expenses</h1>
        <Link href="/expenses/new">
          <Button>
            <Plus className="h-4 w-4" />
            Add expense
          </Button>
        </Link>
      </div>

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <FilterBar categories={categories} month={month} categoryId={categoryId} />

        {currencyTotals.length > 0 && (
          <div className="text-sm text-muted-foreground">
            Total:{" "}
            {currencyTotals
              .map(([currency, amount]) => formatCurrency(amount, currency))
              .join(" · ")}
          </div>
        )}
      </div>

      <Card className="overflow-hidden">
        {rows.length === 0 ? (
          <CardContent>
            {!hasAnyCategories ? (
              <div className="text-center py-8 space-y-3">
                <p className="font-medium">Let&apos;s set up your first category</p>
                <p className="text-sm text-muted-foreground">
                  You need at least one expense category before you can log an expense.
                </p>
                <Link href="/expenses/categories">
                  <Button type="button">Create a category</Button>
                </Link>
              </div>
            ) : isFiltered ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No expenses match these filters.
              </p>
            ) : (
              <div className="text-center py-8 space-y-3">
                <p className="font-medium">No expenses yet</p>
                <p className="text-sm text-muted-foreground">
                  Log your first expense to start tracking your spending.
                </p>
                <Link href="/expenses/new">
                  <Button type="button">Add expense</Button>
                </Link>
              </div>
            )}
          </CardContent>
        ) : (
          rows.map((expense) => <ExpenseRow key={expense.id} expense={expense} />)
        )}
      </Card>

      <div className="text-center">
        <Link href="/expenses/categories" className="text-sm text-muted-foreground hover:text-foreground">
          Manage categories
        </Link>
      </div>
    </div>
  );
}
