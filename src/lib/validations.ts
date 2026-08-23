import { z } from "zod";

export const CURRENCIES = ["ARS", "USD"] as const;
export const ASSET_TYPES = [
  "STOCK",
  "ETF",
  "BOND",
  "CEDEAR",
  "CRYPTO",
  "MUTUAL_FUND",
  "FIXED_INCOME",
  "OTHER",
] as const;
export const TRANSACTION_TYPES = ["BUY", "SELL"] as const;

export const registerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters").max(200),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const categorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
  color: z.string().trim().max(20).optional().nullable(),
  icon: z.string().trim().max(50).optional().nullable(),
});
export type CategoryInput = z.infer<typeof categorySchema>;

export const incomeCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(50),
});
export type IncomeCategoryInput = z.infer<typeof incomeCategorySchema>;

const amountSchema = z.coerce.number().finite().positive("Amount must be greater than 0");
const dateSchema = z.string().min(1, "Date is required");

export const expenseSchema = z.object({
  amount: amountSchema,
  currency: z.enum(CURRENCIES),
  date: dateSchema,
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().trim().max(500).optional().nullable(),
});
export type ExpenseInput = z.infer<typeof expenseSchema>;

export const incomeSchema = z.object({
  amount: amountSchema,
  currency: z.enum(CURRENCIES),
  date: dateSchema,
  categoryId: z.string().min(1, "Category is required"),
  description: z.string().trim().max(500).optional().nullable(),
  source: z.string().trim().max(200).optional().nullable(),
});
export type IncomeInput = z.infer<typeof incomeSchema>;

export const brokerSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
});
export type BrokerInput = z.infer<typeof brokerSchema>;

export const assetSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  type: z.enum(ASSET_TYPES),
  currency: z.enum(CURRENCIES),
  currentPricePerUnit: z.coerce.number().finite().nonnegative().optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
});
export type AssetInput = z.infer<typeof assetSchema>;

export const transactionSchema = z.object({
  assetId: z.string().min(1, "Asset is required"),
  brokerId: z.string().min(1, "Broker is required"),
  type: z.enum(TRANSACTION_TYPES),
  date: dateSchema,
  quantity: z.coerce.number().finite().positive("Quantity must be greater than 0"),
  pricePerUnit: z.coerce.number().finite().positive("Price must be greater than 0"),
  notes: z.string().trim().max(500).optional().nullable(),
});
export type TransactionInput = z.infer<typeof transactionSchema>;

export const periodSchema = z.enum([
  "this_month",
  "last_month",
  "last_3_months",
  "last_6_months",
  "this_year",
  "custom",
]);
export type Period = z.infer<typeof periodSchema>;
