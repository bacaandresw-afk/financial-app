import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CURRENCY_LOCALE: Record<string, string> = {
  ARS: "es-AR",
  USD: "en-US",
};

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency] ?? "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercent(value: number, digits = 1): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(digits)}%`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "UTC",
  }).format(d);
}

export function todayDateInputValue(): string {
  return new Date().toISOString().slice(0, 10);
}
