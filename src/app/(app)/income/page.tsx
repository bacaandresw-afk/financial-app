import Link from "next/link";
import { Plus, Settings2 } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getPeriodRange } from "@/lib/date-range";
import { periodSchema, type Period } from "@/lib/validations";
import { IncomeFilters } from "@/components/income/income-filters";
import { IncomeList } from "@/components/income/income-list";
import { IncomeTotals } from "@/components/income/income-totals";
import { getLanguage } from "@/lib/i18n/language";
import { getDictionary } from "@/lib/i18n/dictionaries";

type SearchParams = {
  period?: string;
  categoryId?: string;
  from?: string;
  to?: string;
};

export default async function IncomePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const t = getDictionary(await getLanguage());
  const sp = await searchParams;

  const parsedPeriod = periodSchema.safeParse(sp.period);
  const period: Period = parsedPeriod.success ? parsedPeriod.data : "this_month";
  const categoryId = sp.categoryId ?? "";

  const { from, to } = getPeriodRange(period, { from: sp.from, to: sp.to });

  const [incomes, categories, totalCount] = await Promise.all([
    prisma.income.findMany({
      where: {
        userId: user.id,
        date: { gte: from, lte: to },
        ...(categoryId ? { categoryId } : {}),
      },
      include: { category: { select: { id: true, name: true } } },
      orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    }),
    prisma.incomeCategory.findMany({
      where: { userId: user.id },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.income.count({ where: { userId: user.id } }),
  ]);

  const items = incomes.map((income) => ({
    id: income.id,
    amount: Number(income.amount),
    currency: income.currency,
    date: income.date,
    description: income.description,
    source: income.source,
    category: income.category,
  }));

  const totals = items.reduce<Record<string, number>>((acc, item) => {
    acc[item.currency] = (acc[item.currency] ?? 0) + item.amount;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">{t.income.title}</h1>
          <p className="text-muted-foreground mt-1">{t.income.subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/income/categories"
            className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors h-11 px-4 text-sm border border-border bg-transparent hover:bg-accent"
          >
            <Settings2 className="h-4 w-4" />
            {t.income.categoriesLink}
          </Link>
          <Link
            href="/income/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors h-11 px-4 text-sm bg-primary text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t.income.addIncome}
          </Link>
        </div>
      </div>

      <IncomeFilters
        categories={categories}
        period={period}
        categoryId={categoryId}
        from={sp.from ?? ""}
        to={sp.to ?? ""}
      />

      <IncomeTotals totals={totals} />

      {totalCount === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center space-y-3">
          <p className="text-muted-foreground">{t.income.emptyState.noneYet}</p>
          <Link
            href="/income/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors h-11 px-4 text-sm bg-primary text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            {t.income.emptyState.addFirst}
          </Link>
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-xl border border-border bg-card p-10 text-center">
          <p className="text-muted-foreground">{t.income.emptyState.noMatch}</p>
        </div>
      ) : (
        <IncomeList incomes={items} />
      )}
    </div>
  );
}
