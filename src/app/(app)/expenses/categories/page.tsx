import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryForm } from "@/components/expenses/category-form";
import { CategoryRow } from "@/components/expenses/category-row";

export default async function ExpenseCategoriesPage() {
  const user = await requireUser();

  const categories = await prisma.expenseCategory.findMany({
    where: { userId: user.id },
    include: { _count: { select: { expenses: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/expenses"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to expenses
        </Link>
        <h1 className="text-2xl font-semibold mt-2">Expense categories</h1>
      </div>

      <Card>
        <CardContent>
          <CategoryForm />
        </CardContent>
      </Card>

      <Card className="overflow-hidden">
        {categories.length === 0 ? (
          <CardContent>
            <p className="text-sm text-muted-foreground text-center py-6">
              No categories yet. Add your first one above.
            </p>
          </CardContent>
        ) : (
          categories.map((category) => (
            <CategoryRow
              key={category.id}
              category={{
                id: category.id,
                name: category.name,
                color: category.color,
                expenseCount: category._count.expenses,
              }}
            />
          ))
        )}
      </Card>
    </div>
  );
}
