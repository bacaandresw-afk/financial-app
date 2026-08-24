export const investmentsDashboard = {
  title: "Panel de inversiones",
  noAssetsForCurrency: (currency: string) =>
    `Todavía no tenés activos en ${currency}. Agregá un activo y algunas transacciones para ver el rendimiento de tu cartera acá.`,
  stats: {
    totalInvested: "Capital total invertido",
    currentValue: "Valor actual de la cartera",
    totalGain: "Ganancia / pérdida total",
    overallReturn: "Rendimiento total",
  },
  charts: {
    performanceByAsset: "Rendimiento por activo",
    performanceByBroker: "Rendimiento por broker",
    allocationByType: "Distribución por tipo de activo",
    allocationByBroker: "Distribución por broker",
  },
  empty: {
    noAssets: "Todavía no hay activos para mostrar.",
    noBrokerTransactions: "Todavía no hay transacciones de brokers para mostrar.",
    noValuedHoldings: "Todavía no hay tenencias valuadas para mostrar.",
  },
  performanceChart: {
    gainLoss: "Ganancia / pérdida",
  },
  assetTypes: {
    STOCK: "Acciones",
    ETF: "ETFs",
    BOND: "Bonos",
    CEDEAR: "CEDEARs",
    CRYPTO: "Cripto",
    MUTUAL_FUND: "Fondos comunes",
    FIXED_INCOME: "Renta fija",
    OTHER: "Otro",
  },
};
