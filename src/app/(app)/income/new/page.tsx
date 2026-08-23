import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IncomeForm } from "@/components/income/income-form";

export default async function NewIncomePage() {
  const user = await requireUser();

  const categories = await prisma.incomeCategory.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Add income</h1>
        <p className="text-muted-foreground mt-1">Log a new income entry</p>
      </div>
      <IncomeForm mode="create" categories={categories} />
    </div>
  );
}
