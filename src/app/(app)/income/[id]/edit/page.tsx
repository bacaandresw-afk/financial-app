import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IncomeForm } from "@/components/income/income-form";

export default async function EditIncomePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;

  const [income, categories] = await Promise.all([
    prisma.income.findFirst({
      where: { id, userId: user.id },
      select: {
        id: true,
        amount: true,
        currency: true,
        date: true,
        categoryId: true,
        description: true,
        source: true,
      },
    }),
    prisma.incomeCategory.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
  ]);

  if (!income) {
    notFound();
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit income</h1>
        <p className="text-muted-foreground mt-1">Update this income entry</p>
      </div>
      <IncomeForm
        mode="edit"
        categories={categories}
        defaultValues={{
          id: income.id,
          amount: Number(income.amount),
          currency: income.currency,
          date: income.date.toISOString().slice(0, 10),
          categoryId: income.categoryId,
          description: income.description,
          source: income.source,
        }}
      />
    </div>
  );
}
