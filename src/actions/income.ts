"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { incomeCategorySchema, incomeSchema } from "@/lib/validations";

export type IncomeActionState = { error: string | null };

function isForeignKeyError(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    (error.code === "P2003" || error.code === "P2014")
  );
}

// ---------------------------------------------------------------------------
// Income categories
// ---------------------------------------------------------------------------

export async function createIncomeCategory(
  _prevState: IncomeActionState,
  formData: FormData,
): Promise<IncomeActionState> {
  const user = await requireUser();

  const parsed = incomeCategorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.incomeCategory.findFirst({
    where: { userId: user.id, name: parsed.data.name },
  });
  if (existing) {
    return { error: "You already have a category with that name" };
  }

  await prisma.incomeCategory.create({
    data: { userId: user.id, name: parsed.data.name },
  });

  revalidatePath("/income/categories");
  revalidatePath("/income");
  revalidatePath("/income/new");
  return { error: null };
}

export async function updateIncomeCategory(
  _prevState: IncomeActionState,
  formData: FormData,
): Promise<IncomeActionState> {
  const user = await requireUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing category" };
  }

  const parsed = incomeCategorySchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const category = await prisma.incomeCategory.findFirst({ where: { id, userId: user.id } });
  if (!category) {
    return { error: "Category not found" };
  }

  const duplicate = await prisma.incomeCategory.findFirst({
    where: { userId: user.id, name: parsed.data.name, NOT: { id } },
  });
  if (duplicate) {
    return { error: "You already have a category with that name" };
  }

  await prisma.incomeCategory.update({
    where: { id },
    data: { name: parsed.data.name },
  });

  revalidatePath("/income/categories");
  revalidatePath("/income");
  return { error: null };
}

export async function deleteIncomeCategory(
  _prevState: IncomeActionState,
  formData: FormData,
): Promise<IncomeActionState> {
  const user = await requireUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing category" };
  }

  const category = await prisma.incomeCategory.findFirst({ where: { id, userId: user.id } });
  if (!category) {
    return { error: "Category not found" };
  }

  try {
    await prisma.incomeCategory.delete({ where: { id } });
  } catch (error) {
    if (isForeignKeyError(error)) {
      return { error: "Can't delete this category — it still has income entries. Move or delete them first." };
    }
    throw error;
  }

  revalidatePath("/income/categories");
  revalidatePath("/income");
  return { error: null };
}

// ---------------------------------------------------------------------------
// Income entries
// ---------------------------------------------------------------------------

async function assertOwnedCategory(userId: string, categoryId: string): Promise<boolean> {
  const category = await prisma.incomeCategory.findFirst({ where: { id: categoryId, userId } });
  return Boolean(category);
}

export async function createIncome(
  _prevState: IncomeActionState,
  formData: FormData,
): Promise<IncomeActionState> {
  const user = await requireUser();

  const parsed = incomeSchema.safeParse({
    amount: formData.get("amount"),
    currency: formData.get("currency"),
    date: formData.get("date"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    source: formData.get("source"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { amount, currency, date, categoryId, description, source } = parsed.data;

  if (!(await assertOwnedCategory(user.id, categoryId))) {
    return { error: "Invalid category" };
  }

  await prisma.income.create({
    data: {
      userId: user.id,
      categoryId,
      amount,
      currency,
      date: new Date(date),
      description: description || null,
      source: source || null,
    },
  });

  revalidatePath("/income");
  redirect("/income");
}

export async function updateIncome(
  _prevState: IncomeActionState,
  formData: FormData,
): Promise<IncomeActionState> {
  const user = await requireUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing income entry" };
  }

  const parsed = incomeSchema.safeParse({
    amount: formData.get("amount"),
    currency: formData.get("currency"),
    date: formData.get("date"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
    source: formData.get("source"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.income.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return { error: "Income entry not found" };
  }

  const { amount, currency, date, categoryId, description, source } = parsed.data;

  if (!(await assertOwnedCategory(user.id, categoryId))) {
    return { error: "Invalid category" };
  }

  await prisma.income.update({
    where: { id },
    data: {
      categoryId,
      amount,
      currency,
      date: new Date(date),
      description: description || null,
      source: source || null,
    },
  });

  revalidatePath("/income");
  redirect("/income");
}

export async function deleteIncome(
  _prevState: IncomeActionState,
  formData: FormData,
): Promise<IncomeActionState> {
  const user = await requireUser();
  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing income entry" };
  }

  const existing = await prisma.income.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return { error: "Income entry not found" };
  }

  await prisma.income.delete({ where: { id } });

  revalidatePath("/income");
  redirect("/income");
}
