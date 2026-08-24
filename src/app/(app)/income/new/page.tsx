import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { IncomeForm } from "@/components/income/income-form";
import { getLanguage } from "@/lib/i18n/language";
import { getDictionary } from "@/lib/i18n/dictionaries";

export default async function NewIncomePage() {
  const user = await requireUser();
  const t = getDictionary(await getLanguage());

  const categories = await prisma.incomeCategory.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t.income.addIncome}</h1>
        <p className="text-muted-foreground mt-1">{t.income.newPage.subtitle}</p>
      </div>
      <IncomeForm mode="create" categories={categories} />
    </div>
  );
}
