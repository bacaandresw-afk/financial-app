import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { getPeriodRange } from "@/lib/date-range";
import { periodSchema, CURRENCIES, type Period } from "@/lib/validations";
import { formatCurrency } from "@/lib/utils";
import { getLanguage } from "@/lib/i18n/language";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { PeriodSelector } from "@/components/dashboard/period-selector";
import { CurrencyToggle } from "@/components/dashboard/currency-toggle";
import { GranularitySelector } from "@/components/dashboard/granularity-selector";
import { StatCard } from "@/components/dashboard/stat-card";
import { ChartCard } from "@/components/dashboard/chart-card";
import { EmptyState } from "@/components/dashboard/empty-state";
import { CategoryPieChart } from "@/components/dashboard/category-pie-chart";
import { ExpensesParetoChart } from "@/components/dashboard/expenses-pareto-chart";
import { CashFlowOverTimeChart } from "@/components/dashboard/cash-flow-over-time-chart";
import { MonthlyCashFlowChart } from "@/components/dashboard/monthly-cash-flow-chart";
import { MonthlySpendingTrendChart } from "@/components/dashboard/monthly-spending-trend-chart";
import {
  aggregateByCategory,
  bucketCashFlow,
  spansMultipleMonths,
  parseCashFlowGranularity,
} from "@/components/dashboard/aggregate";

type CurrencyCode = (typeof CURRENCIES)[number];

type SearchParams = {
  period?: string;
  from?: string;
  to?: string;
  currency?: string;
  granularity?: string;
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
  const lang = await getLanguage();
  const t = getDictionary(lang);

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

  // "Monthly cash flow" / "Monthly spending trend" keep their existing
  // auto month-only behavior: they only render once the period spans 2+
  // months, always bucketed by month.
  const monthSpanning = spansMultipleMonths(from, to);
  const monthlyBuckets = monthSpanning ? bucketCashFlow(expenses, incomes, from, to, "month") : [];
  const monthlyNet = monthlyBuckets.map((b) => ({ label: b.label, net: b.income - b.expense }));
  const monthlySpending = monthlyBuckets.map((b) => ({ label: b.label, expense: b.expense }));

  // "Income vs expenses over time" gets its own explicit, user-selectable
  // granularity (Day / Week / Month / Year), independent of the above.
  const granularity = parseCashFlowGranularity(first(sp.granularity));
  const cashFlowOverTimeBuckets = bucketCashFlow(expenses, incomes, from, to, granularity);

  const hasAnyData = expenses.length > 0 || incomes.length > 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold">{t.dashboard.title}</h1>
        <CurrencyToggle currency={currency} />
      </div>

      <PeriodSelector period={period} from={fromParam} to={toParam} />

      {!hasAnyData ? (
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          {t.dashboard.noDataForPeriod(currency)}
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard
          label={t.dashboard.stats.totalIncome}
          value={formatCurrency(totalIncome, currency)}
          valueClassName="text-success"
        />
        <StatCard
          label={t.dashboard.stats.totalExpenses}
          value={formatCurrency(totalExpenses, currency)}
          valueClassName="text-destructive"
        />
        <StatCard
          label={t.dashboard.stats.netCashFlow}
          value={formatCurrency(netCashFlow, currency)}
          valueClassName={netCashFlow >= 0 ? "text-success" : "text-destructive"}
        />
        <StatCard label={t.dashboard.stats.numberOfExpenses} value={expenseCount.toString()} />
        <StatCard label={t.dashboard.stats.averageExpense} value={formatCurrency(averageExpense, currency)} />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChartCard title={t.dashboard.charts.expensesByCategory}>
          {expensesByCategory.length > 0 ? (
            <ExpensesParetoChart data={expensesByCategory} currency={currency} />
          ) : (
            <EmptyState message={t.dashboard.empty.noExpensesForPeriod(currency)} />
          )}
        </ChartCard>

        <ChartCard title={t.dashboard.charts.incomeByCategory}>
          {incomeByCategory.length > 0 ? (
            <CategoryPieChart data={incomeByCategory} currency={currency} />
          ) : (
            <EmptyState message={t.dashboard.empty.noIncomeForPeriod(currency)} />
          )}
        </ChartCard>

        <div className="md:col-span-2 space-y-3">
          <div className="flex justify-end">
            <GranularitySelector granularity={granularity} />
          </div>
          <ChartCard title={t.dashboard.charts.cashFlowOverTime}>
            {cashFlowOverTimeBuckets.some((b) => b.income > 0 || b.expense > 0) ? (
              <CashFlowOverTimeChart data={cashFlowOverTimeBuckets} currency={currency} />
            ) : (
              <EmptyState message={t.dashboard.empty.noActivityForPeriod(currency)} />
            )}
          </ChartCard>
        </div>

        <ChartCard title={t.dashboard.charts.monthlyCashFlow}>
          {monthSpanning ? (
            monthlyNet.length > 0 ? (
              <MonthlyCashFlowChart data={monthlyNet} currency={currency} />
            ) : (
              <EmptyState message={t.dashboard.empty.noActivityForPeriod(currency)} />
            )
          ) : (
            <EmptyState message={t.dashboard.empty.selectLongerPeriodCashFlow} />
          )}
        </ChartCard>

        <ChartCard title={t.dashboard.charts.monthlySpendingTrend}>
          {monthSpanning ? (
            monthlySpending.length > 0 ? (
              <MonthlySpendingTrendChart data={monthlySpending} currency={currency} />
            ) : (
              <EmptyState message={t.dashboard.empty.noExpensesForPeriod(currency)} />
            )
          ) : (
            <EmptyState message={t.dashboard.empty.selectLongerPeriodSpending} />
          )}
        </ChartCard>
      </div>
    </div>
  );
}
