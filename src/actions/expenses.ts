"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { categorySchema, expenseSchema } from "@/lib/validations";
import { uploadReceiptImage, deleteReceiptImage } from "@/lib/storage";

export type ActionState = { error: string | null };

const MAX_RECEIPT_BYTES = 8 * 1024 * 1024; // 8MB

// ---------- Categories ----------

export async function createExpenseCategory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await prisma.expenseCategory.create({
      data: {
        userId: user.id,
        name: parsed.data.name,
        color: parsed.data.color || null,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "You already have a category with that name" };
    }
    throw err;
  }

  revalidatePath("/expenses/categories");
  revalidatePath("/expenses");
  revalidatePath("/expenses/new");
  return { error: null };
}

export async function updateExpenseCategory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing category id" };
  }

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    color: formData.get("color"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.expenseCategory.findFirst({
    where: { id, userId: user.id },
  });
  if (!existing) {
    return { error: "Category not found" };
  }

  try {
    await prisma.expenseCategory.update({
      where: { id },
      data: {
        name: parsed.data.name,
        color: parsed.data.color || null,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "You already have a category with that name" };
    }
    throw err;
  }

  revalidatePath("/expenses/categories");
  revalidatePath("/expenses");
  return { error: null };
}

export async function deleteExpenseCategory(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing category id" };
  }

  const existing = await prisma.expenseCategory.findFirst({
    where: { id, userId: user.id },
    include: { _count: { select: { expenses: true } } },
  });
  if (!existing) {
    return { error: "Category not found" };
  }

  if (existing._count.expenses > 0) {
    return {
      error: `This category has ${existing._count.expenses} expense${existing._count.expenses === 1 ? "" : "s"}. Remove or reassign them before deleting it.`,
    };
  }

  await prisma.expenseCategory.delete({ where: { id } });

  revalidatePath("/expenses/categories");
  revalidatePath("/expenses");
  return { error: null };
}

// ---------- Expenses ----------

function readReceiptFile(formData: FormData): File | null {
  const file = formData.get("receipt");
  if (!(file instanceof File) || file.size === 0) return null;
  return file;
}

async function validateReceiptFile(file: File): Promise<string | null> {
  if (!file.type.startsWith("image/")) {
    return "Receipt must be an image file";
  }
  if (file.size > MAX_RECEIPT_BYTES) {
    return "Receipt image must be smaller than 8MB";
  }
  return null;
}

export async function createExpense(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = expenseSchema.safeParse({
    amount: formData.get("amount"),
    currency: formData.get("currency"),
    date: formData.get("date"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const category = await prisma.expenseCategory.findFirst({
    where: { id: parsed.data.categoryId, userId: user.id },
  });
  if (!category) {
    return { error: "Select a valid category" };
  }

  const receiptFile = readReceiptFile(formData);
  let uploaded: { storagePath: string; mimeType: string; size: number } | null = null;
  if (receiptFile) {
    const fileError = await validateReceiptFile(receiptFile);
    if (fileError) return { error: fileError };
    const buffer = Buffer.from(await receiptFile.arrayBuffer());
    uploaded = await uploadReceiptImage(user.id, buffer);
  }

  await prisma.expense.create({
    data: {
      userId: user.id,
      categoryId: parsed.data.categoryId,
      amount: new Prisma.Decimal(parsed.data.amount),
      currency: parsed.data.currency,
      date: new Date(parsed.data.date),
      description: parsed.data.description || null,
      ...(uploaded
        ? {
            receipt: {
              create: {
                storagePath: uploaded.storagePath,
                mimeType: uploaded.mimeType,
                size: uploaded.size,
              },
            },
          }
        : {}),
    },
  });

  revalidatePath("/expenses");
  redirect("/expenses");
}

export async function updateExpense(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing expense id" };
  }

  const parsed = expenseSchema.safeParse({
    amount: formData.get("amount"),
    currency: formData.get("currency"),
    date: formData.get("date"),
    categoryId: formData.get("categoryId"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.expense.findFirst({
    where: { id, userId: user.id },
    include: { receipt: true },
  });
  if (!existing) {
    return { error: "Expense not found" };
  }

  const category = await prisma.expenseCategory.findFirst({
    where: { id: parsed.data.categoryId, userId: user.id },
  });
  if (!category) {
    return { error: "Select a valid category" };
  }

  const removeReceipt = formData.get("removeReceipt") === "1";
  const receiptFile = readReceiptFile(formData);

  let uploaded: { storagePath: string; mimeType: string; size: number } | null = null;
  if (receiptFile) {
    const fileError = await validateReceiptFile(receiptFile);
    if (fileError) return { error: fileError };
    const buffer = Buffer.from(await receiptFile.arrayBuffer());
    uploaded = await uploadReceiptImage(user.id, buffer);
  }

  // If we're replacing or removing the existing receipt, delete the old
  // stored image/row first.
  if ((uploaded || removeReceipt) && existing.receipt) {
    await deleteReceiptImage(existing.receipt.storagePath);
    await prisma.receipt.delete({ where: { id: existing.receipt.id } });
  }

  await prisma.expense.update({
    where: { id },
    data: {
      categoryId: parsed.data.categoryId,
      amount: new Prisma.Decimal(parsed.data.amount),
      currency: parsed.data.currency,
      date: new Date(parsed.data.date),
      description: parsed.data.description || null,
      ...(uploaded
        ? {
            receipt: {
              create: {
                storagePath: uploaded.storagePath,
                mimeType: uploaded.mimeType,
                size: uploaded.size,
              },
            },
          }
        : {}),
    },
  });

  revalidatePath("/expenses");
  redirect("/expenses");
}

export async function deleteExpense(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing expense id" };
  }

  const existing = await prisma.expense.findFirst({
    where: { id, userId: user.id },
    include: { receipt: true },
  });
  if (!existing) {
    return { error: "Expense not found" };
  }

  if (existing.receipt) {
    await deleteReceiptImage(existing.receipt.storagePath);
    // Receipt row cascades on Expense delete, but delete explicitly first
    // in case that ever changes.
    await prisma.receipt.delete({ where: { id: existing.receipt.id } });
  }

  await prisma.expense.delete({ where: { id } });

  revalidatePath("/expenses");
  return { error: null };
}
