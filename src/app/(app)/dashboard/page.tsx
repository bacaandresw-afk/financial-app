import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getPeriodRange } from "@/lib/date-range";
import { periodSchema, CURRENCIES, type Period } from "@/lib/validations";
import { formatCurrency } from "@/lib/utils";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { CurrencyToggle } from "@/components/dashboard/currency-toggle";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { CashFlowOverTimeChart } from "@/components/dashboard/cash-flow-over-time-chart";
import { MonthlyCashFlowChart } from "@/components/dashboard/monthly-cash-flow-chart";
import { MonthlySpendingTrendChart } from "@/components/dashboard/monthly-spending-trend-chart";
import { aggregateByCategory, bucketCashFlow, spansMultipleMonths } from "@/components/dashboard/aggregate";

type CurrencyCode = (typeof CURRENCIES)[number];

type SearchParams = {
  period?: string;
  from?: string;
  to?: string;
  currency?: string;
};

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

async function resolveCurrency(userId: string, requested?: string): Promise<CurrencyCode> {
  if (requested === "ARS" || requested === "USD") return requested;

  const [expenseCounts, incomeCounts] = await Promise.all([
    prisma.expense.groupBy({ by: ["currency"], where: { userId }, _count: { _all: true } }),
    prisma.income.groupBy({ by: ["currency"], where: { userId }, _count: { _all: true } }),
  ]);

  const countFor = (currency: CurrencyCode) =>
    (expenseCounts.find((c) => c.currency === currency)?._count._all ?? 0) +
    (incomeCounts.find((c) => c.currency === currency)?._count._all ?? 0);

  return countFor("USD") > countFor("ARS") ? "USD" : "ARS";
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const user = await requireUser();
  const sp = await searchParams;

  const periodParsed = periodSchema.safeParse(first(sp.period));
  const period: Period = periodParsed.success ? periodParsed.data : "this_month";
  const fromParam = first(sp.from);
  const toParam = first(sp.to);
  const { from, to } = getPeriodRange(period, { from: fromParam, to: toParam });

  const currency = await resolveCurrency(user.id, first(sp.currency));

  const [expenseRows, incomeRows] = await Promise.all([
    prisma.expense.findMany({
      where: { userId: user.id, currency, date: { gte: from, lte: to } },
      include: { category: true },
      orderBy: { date: "asc" },
    }),
    prisma.income.findMany({
      where: { userId: user.id, currency, date: { gte: from, lte: to } },
      include: { category: true },
      orderBy: { date: "asc" },
    }),
  ]);

  const expenses = expenseRows.map((e) => ({
    amount: Number(e.amount),
    date: e.date,
    category: { name: e.category.name },
  }));
  const incomes = incomeRows.map((i) => ({
    amount: Number(i.amount),
    date: i.date,
    category: { name: i.category.name },
  }));

  const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netCashFlow = totalIncome - totalExpenses;
  const expenseCount = expenses.length;
  const averageExpense = expenseCount > 0 ? totalExpenses / expenseCount : 0;

  const expensesByCategory = aggregateByCategory(expenses);
  const incomeByCategory = aggregateByCategory(incomes);

  const monthSpanning = spansMultipleMonths(from, to);
  const granularity = monthSpanning ? "month" : "day";
  const buckets = bucketCashFlow(expenses, incomes, from, to, granularity);
  const monthlyBuckets = monthSpanning ? buckets : [];
  const monthlyNet = monthlyBuckets.map((b) => ({ label: b.label, net: b.income - b.expense }));
  const monthlySpending = monthlyBuckets.map((b) => ({ label: b.label, expense: b.expense }));

  const hasAnyData = expenses.length > 0 || incomes.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <CurrencyToggle currency={currency} />
      </div>

      <PeriodSelector period={period} from={fromParam} to={toParam} />

      {!hasAnyData ? (
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          No expenses or income recorded in {currency} for this period yet. Add some to see your
          dashboard come to life.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total income" value={formatCurrency(totalIncome, currency)} valueClassName="text-success" />
        <StatCard
          label="Total expenses"
          value={formatCurrency(totalExpenses, currency)}
          valueClassName="text-destructive"
        />
        <StatCard
          label="Net cash flow"
          value={formatCurrency(netCashFlow, currency)}
          valueClassName={netCashFlow >= 0 ? "text-success" : "text-destructive"}
        />
        <StatCard label="Number of expenses" value={expenseCount.toString()} />
        <StatCard label="Average expense" value={formatCurrency(averageExpense, currency)} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChartCard title="Expenses by category">
          {expensesByCategory.length > 0 ? (
            <CategoryPieChart data={expensesByCategory} currency={currency} />
          ) : (
            <EmptyState message={`No expenses in ${currency} for this period.`} />
          )}
        </ChartCard>

        <ChartCard title="Income by category">
          {incomeByCategory.length > 0 ? (
            <CategoryPieChart data={incomeByCategory} currency={currency} />
          ) : (
            <EmptyState message={`No income in ${currency} for this period.`} />
          )}
        </ChartCard>

        <ChartCard title="Income vs expenses over time" className="md:col-span-2">
          {buckets.some((b) => b.income > 0 || b.expense > 0) ? (
            <CashFlowOverTimeChart data={buckets} currency={currency} />
          ) : (
            <EmptyState message={`No activity in ${currency} for this period.`} />
          )}
        </ChartCard>

        <ChartCard title="Monthly cash flow">
          {monthSpanning ? (
            monthlyNet.length > 0 ? (
              <MonthlyCashFlowChart data={monthlyNet} currency={currency} />
            ) : (
              <EmptyState message={`No activity in ${currency} for this period.`} />
            )
          ) : (
            <EmptyState message="Select a period spanning 2 or more months to see monthly cash flow." />
          )}
        </ChartCard>

        <ChartCard title="Monthly spending trend">
          {monthSpanning ? (
            monthlySpending.length > 0 ? (
              <MonthlySpendingTrendChart data={monthlySpending} currency={currency} />
            ) : (
              <EmptyState message={`No expenses in ${currency} for this period.`} />
            )
          ) : (
            <EmptyState message="Select a period spanning 2 or more months to see the spending trend." />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
