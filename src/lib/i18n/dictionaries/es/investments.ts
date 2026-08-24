export const investments = {
  title: "Inversiones",
  subtitle: "Llevá el control de tus brokers, activos y operaciones de compra/venta.",
  manageBrokers: "Administrar brokers",
  viewDashboard: "Ver panel",
  addInvestment: "Agregar inversión",
  backToInvestments: "Volver a inversiones",

  summary: {
    title: (currency: string) => `Resumen (${currency})`,
    totalInvested: "Total invertido",
    currentValue: "Valor actual",
    totalPL: "Ganancia/pérdida total",
    missingPriceHint: "A algunos activos les falta un precio actual",
  },

  empty: {
    message: "Todavía no agregaste ninguna inversión.",
    cta: "Agregá tu primera inversión",
  },

  assetTypes: {
    STOCK: "Acción",
    ETF: "ETF",
    BOND: "Bono",
    CEDEAR: "CEDEAR",
    CRYPTO: "Cripto",
    MUTUAL_FUND: "Fondo común de inversión",
    FIXED_INCOME: "Renta fija",
    OTHER: "Otro",
  },

  transactionTypes: {
    BUY: "Compra",
    SELL: "Venta",
  },

  holdingCard: {
    held: "en cartera",
    setPrice: "Definí un precio actual",
    totalReturn: "Retorno total",
    annualized: "Anualizado",
  },

  newPage: {
    title: "Agregar inversión",
    subtitle: "Una inversión nace como un activo más su primera compra.",
    manageBrokersLink: "Administrar brokers",
  },

  form: {
    needBroker: "Necesitás al menos un broker antes de agregar una inversión.",
    addBroker: "Agregar un broker",
    namePlaceholder: "ej. Apple Inc.",
    type: "Tipo",
    broker: "Broker",
    firstPurchase: "Primera compra",
    quantity: "Cantidad",
    pricePerUnit: "Precio por unidad",
    total: "Total",
    notesOptional: "Notas (opcional)",
    notesPlaceholder: "Notas opcionales sobre esta compra",
    submit: "Agregar inversión",
    submitting: "Agregando…",
  },

  editPage: {
    backTo: (name: string) => `Volver a ${name}`,
    title: "Editar inversión",
  },

  editForm: {
    saveChanges: "Guardar cambios",
    saving: "Guardando…",
  },

  assetDetail: {
    held: "en cartera",
    currentPriceTitle: "Precio actual",
    currentPriceLabel: (currency: string) => `Precio actual (${currency})`,
    notSet: "Sin definir",
    updatePrice: "Actualizar precio",
    updating: "Guardando…",
    lastUpdated: (date: string) => `Última actualización: ${date}`,
    performanceTitle: "Rendimiento",
    investedCostBasis: "Invertido (costo base)",
    currentValue: "Valor actual",
    setPriceToSeePerformance: "Definí un precio actual para ver el rendimiento",
    realizedGain: "Ganancia realizada",
    unrealizedGain: "Ganancia no realizada",
    totalGain: "Ganancia total",
    totalReturn: "Retorno total",
    annualizedReturn: "Rendimiento anualizado",
    transactionsTitle: "Operaciones",
    edit: "Editar",
    deleteInvestment: "Eliminar inversión",
    deleting: "Eliminando…",
    confirmDelete: (name: string) =>
      `¿Eliminar "${name}" y todo su historial de operaciones? Esta acción no se puede deshacer.`,
  },

  transactionForm: {
    type: "Tipo",
    broker: "Broker",
    quantity: "Cantidad",
    pricePerUnit: "Precio por unidad",
    total: "Total",
    notesOptional: "Notas (opcional)",
    addTransaction: "Agregar operación",
    adding: "Agregando…",
    saveChanges: "Guardar cambios",
    saving: "Guardando…",
  },

  transactionList: {
    empty: "Todavía no hay operaciones registradas.",
    edit: "Editar",
    delete: "Eliminar",
    confirmDelete: "¿Eliminar esta operación?",
  },

  addTransactionSection: {
    addTransaction: "Agregar operación",
    needBroker: "Agregá un broker antes de registrar más operaciones.",
  },

  brokersPage: {
    title: "Brokers",
    subtitle: "Los brokers se usan para registrar en qué cuenta ocurrió cada operación.",
  },

  brokerManager: {
    newBrokerLabel: "Nuevo broker",
    namePlaceholder: "ej. Interactive Brokers",
    addBroker: "Agregar broker",
    adding: "Agregando…",
    empty: "Todavía no hay brokers. Agregá uno arriba para empezar a registrar operaciones.",
    rename: "Renombrar",
    delete: "Eliminar",
    save: "Guardar",
    saving: "Guardando…",
    confirmDelete: (name: string) => `¿Eliminar el broker "${name}"?`,
  },
};
