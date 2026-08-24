export const investments = {
  title: "Investments",
  subtitle: "Track your brokers, assets, and buy/sell transactions.",
  manageBrokers: "Manage brokers",
  viewDashboard: "View dashboard",
  addInvestment: "Add investment",
  backToInvestments: "Back to investments",

  summary: {
    title: (currency: string) => `Summary (${currency})`,
    totalInvested: "Total invested",
    currentValue: "Current value",
    totalPL: "Total P/L",
    missingPriceHint: "Some assets are missing a current price",
  },

  empty: {
    message: "You haven't added any investments yet.",
    cta: "Add your first investment",
  },

  assetTypes: {
    STOCK: "Stock",
    ETF: "ETF",
    BOND: "Bond",
    CEDEAR: "CEDEAR",
    CRYPTO: "Crypto",
    MUTUAL_FUND: "Mutual fund",
    FIXED_INCOME: "Fixed income",
    OTHER: "Other",
  },

  transactionTypes: {
    BUY: "Buy",
    SELL: "Sell",
  },

  holdingCard: {
    held: "held",
    setPrice: "Set a current price",
    totalReturn: "Total return",
    annualized: "Annualized",
  },

  newPage: {
    title: "Add investment",
    subtitle: "An investment starts life as an asset plus its first purchase.",
    manageBrokersLink: "Manage brokers",
  },

  form: {
    needBroker: "You need at least one broker before adding an investment.",
    addBroker: "Add a broker",
    namePlaceholder: "e.g. Apple Inc.",
    type: "Type",
    broker: "Broker",
    firstPurchase: "First purchase",
    quantity: "Quantity",
    pricePerUnit: "Price per unit",
    total: "Total",
    notesOptional: "Notes (optional)",
    notesPlaceholder: "Optional notes about this purchase",
    submit: "Add investment",
    submitting: "Adding…",
  },

  editPage: {
    backTo: (name: string) => `Back to ${name}`,
    title: "Edit investment",
  },

  editForm: {
    saveChanges: "Save changes",
    saving: "Saving…",
  },

  assetDetail: {
    held: "held",
    currentPriceTitle: "Current price",
    currentPriceLabel: (currency: string) => `Current price (${currency})`,
    notSet: "Not set",
    updatePrice: "Update price",
    updating: "Saving…",
    lastUpdated: (date: string) => `Last updated ${date}`,
    performanceTitle: "Performance",
    investedCostBasis: "Invested (cost basis)",
    currentValue: "Current value",
    setPriceToSeePerformance: "Set a current price to see performance",
    realizedGain: "Realized gain",
    unrealizedGain: "Unrealized gain",
    totalGain: "Total gain",
    totalReturn: "Total return",
    annualizedReturn: "Annualized return",
    transactionsTitle: "Transactions",
    edit: "Edit",
    deleteInvestment: "Delete investment",
    deleting: "Deleting…",
    confirmDelete: (name: string) =>
      `Delete "${name}" and all of its transaction history? This can't be undone.`,
  },

  transactionForm: {
    type: "Type",
    broker: "Broker",
    quantity: "Quantity",
    pricePerUnit: "Price per unit",
    total: "Total",
    notesOptional: "Notes (optional)",
    addTransaction: "Add transaction",
    adding: "Adding…",
    saveChanges: "Save changes",
    saving: "Saving…",
  },

  transactionList: {
    empty: "No transactions recorded yet.",
    edit: "Edit",
    delete: "Delete",
    confirmDelete: "Delete this transaction?",
  },

  addTransactionSection: {
    addTransaction: "Add transaction",
    needBroker: "Add a broker before recording more transactions.",
  },

  brokersPage: {
    title: "Brokers",
    subtitle: "Brokers are used to record which account each transaction happened in.",
  },

  brokerManager: {
    newBrokerLabel: "New broker",
    namePlaceholder: "e.g. Interactive Brokers",
    addBroker: "Add broker",
    adding: "Adding…",
    empty: "No brokers yet. Add one above to start recording transactions.",
    rename: "Rename",
    delete: "Delete",
    save: "Save",
    saving: "Saving…",
    confirmDelete: (name: string) => `Delete broker "${name}"?`,
  },
};
