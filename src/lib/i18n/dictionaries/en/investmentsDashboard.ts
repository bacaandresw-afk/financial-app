export const investmentsDashboard = {
  title: "Investments dashboard",
  noAssetsForCurrency: (currency: string) =>
    `No ${currency} assets yet. Add an asset and some transactions to see your portfolio performance here.`,
  stats: {
    totalInvested: "Total invested capital",
    currentValue: "Current portfolio value",
    totalGain: "Total profit / loss",
    overallReturn: "Overall return",
  },
  charts: {
    performanceByAsset: "Performance by asset",
    performanceByBroker: "Performance by broker",
    allocationByType: "Allocation by asset type",
    allocationByBroker: "Allocation by broker",
  },
  empty: {
    noAssets: "No assets to show yet.",
    noBrokerTransactions: "No broker transactions to show yet.",
    noValuedHoldings: "No valued holdings to show yet.",
  },
  performanceChart: {
    gainLoss: "Gain / loss",
  },
  assetTypes: {
    STOCK: "Stocks",
    ETF: "ETFs",
    BOND: "Bonds",
    CEDEAR: "CEDEARs",
    CRYPTO: "Crypto",
    MUTUAL_FUND: "Mutual funds",
    FIXED_INCOME: "Fixed income",
    OTHER: "Other",
  },
};
