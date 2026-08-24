export const dashboard = {
  title: "Panel",
  noDataForPeriod: (currency: string) =>
    `Todavía no hay gastos ni ingresos registrados en ${currency} para este período. Agregá algunos para ver tu panel cobrar vida.`,
  stats: {
    totalIncome: "Ingresos totales",
    totalExpenses: "Gastos totales",
    netCashFlow: "Flujo de caja neto",
    numberOfExpenses: "Cantidad de gastos",
    averageExpense: "Gasto promedio",
  },
  charts: {
    expensesByCategory: "Gastos por categoría",
    incomeByCategory: "Ingresos por categoría",
    cashFlowOverTime: "Ingresos vs. gastos en el tiempo",
    monthlyCashFlow: "Flujo de caja mensual",
    monthlySpendingTrend: "Tendencia de gasto mensual",
  },
  empty: {
    noExpensesForPeriod: (currency: string) => `No hay gastos en ${currency} para este período.`,
    noIncomeForPeriod: (currency: string) => `No hay ingresos en ${currency} para este período.`,
    noActivityForPeriod: (currency: string) => `No hay actividad en ${currency} para este período.`,
    selectLongerPeriodCashFlow: "Elegí un período de 2 meses o más para ver el flujo de caja mensual.",
    selectLongerPeriodSpending: "Elegí un período de 2 meses o más para ver la tendencia de gasto.",
  },
  pareto: {
    amount: "Monto",
    cumulativeShare: "% acumulado",
    threshold: "Umbral del 80%",
  },
  cashFlowChart: {
    income: "Ingresos",
    expenses: "Gastos",
  },
  monthlyCashFlowChart: {
    net: "Flujo de caja neto",
  },
  monthlySpendingChart: {
    expenses: "Gastos",
  },
  granularity: {
    label: "Granularidad",
    day: "Día",
    week: "Semana",
    month: "Mes",
    year: "Año",
  },
  periodSelector: {
    periodLabel: "Período",
    fromLabel: "Desde",
    toLabel: "Hasta",
  },
};
