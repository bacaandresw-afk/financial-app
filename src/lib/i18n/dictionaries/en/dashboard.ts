export const dashboard = {
  title: "Dashboard",
  noDataForPeriod: (currency: string) =>
    `No expenses or income recorded in ${currency} for this period yet. Add some to see your dashboard come to life.`,
  stats: {
    totalIncome: "Total income",
    totalExpenses: "Total expenses",
    netCashFlow: "Net cash flow",
    numberOfExpenses: "Number of expenses",
    averageExpense: "Average expense",
  },
  charts: {
    expensesByCategory: "Expenses by category",
    incomeByCategory: "Income by category",
    cashFlowOverTime: "Income vs expenses over time",
    monthlyCashFlow: "Monthly cash flow",
    monthlySpendingTrend: "Monthly spending trend",
  },
  empty: {
    noExpensesForPeriod: (currency: string) => `No expenses in ${currency} for this period.`,
    noIncomeForPeriod: (currency: string) => `No income in ${currency} for this period.`,
    noActivityForPeriod: (currency: string) => `No activity in ${currency} for this period.`,
    selectLongerPeriodCashFlow: "Select a period spanning 2 or more months to see monthly cash flow.",
    selectLongerPeriodSpending: "Select a period spanning 2 or more months to see the spending trend.",
  },
  pie: {
    otherCategories: "Other categories",
  },
  usdIncome: {
    toggleLabel: "Include dollar income",
    rateNote: (rate: string, source: string, date: string) =>
      `USD income converted at ${rate} per USD (Dólar MEP, ${source}, ${date}).`,
    rateUnavailable: "Couldn't fetch the dollar rate right now, so dollar income is not included.",
    arsEquivalent: (amount: string) => `≈ ${amount} ARS`,
    arsEquivalentRate: (rate: string) => `ARS equivalent at ${rate} per USD (Dólar MEP)`,
  },
  cashFlowChart: {
    income: "Income",
    expenses: "Expenses",
  },
  monthlyCashFlowChart: {
    net: "Net cash flow",
  },
  monthlySpendingChart: {
    expenses: "Expenses",
  },
  granularity: {
    label: "Granularity",
    day: "Day",
    week: "Week",
    month: "Month",
    year: "Year",
  },
  periodSelector: {
    periodLabel: "Period",
    fromLabel: "From",
    toLabel: "To",
  },
};
