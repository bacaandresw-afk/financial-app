"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { assetSchema, transactionSchema } from "@/lib/validations";
import { summarizeHolding } from "@/lib/portfolio";

export type ActionState = { error: string | null };

// ---------- Shared helpers ----------

/**
 * Current quantity held for an asset, using the average-cost method from
 * portfolio.ts. Pass `excludeTransactionId` when validating an in-place edit
 * of an existing transaction so it isn't counted twice.
 */
async function getQuantityHeld(assetId: string, excludeTransactionId?: string): Promise<number> {
  const transactions = await prisma.investmentTransaction.findMany({
    where: {
      assetId,
      ...(excludeTransactionId ? { id: { not: excludeTransactionId } } : {}),
    },
  });

  const holding = summarizeHolding(
    transactions.map((t) => ({
      type: t.type,
      date: t.date,
      quantity: Number(t.quantity),
      pricePerUnit: Number(t.pricePerUnit),
      totalAmount: Number(t.totalAmount),
    })),
  );
  return holding.quantityHeld;
}

// ---------- Assets ----------

const newAssetSchema = assetSchema.pick({ name: true, type: true, currency: true });
const newAssetTransactionSchema = transactionSchema.omit({ assetId: true, type: true });

/**
 * Creates an Asset together with its first BUY transaction in a single
 * Prisma transaction — an asset with zero transactions isn't meaningful in
 * this app, so the two are always created together.
 */
export async function createAsset(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const assetParsed = newAssetSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    currency: formData.get("currency"),
  });
  if (!assetParsed.success) {
    return { error: assetParsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const txParsed = newAssetTransactionSchema.safeParse({
    brokerId: formData.get("brokerId"),
    date: formData.get("date"),
    quantity: formData.get("quantity"),
    pricePerUnit: formData.get("pricePerUnit"),
    notes: formData.get("notes"),
  });
  if (!txParsed.success) {
    return { error: txParsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const broker = await prisma.broker.findFirst({
    where: { id: txParsed.data.brokerId, userId: user.id },
  });
  if (!broker) {
    return { error: "Select a valid broker" };
  }

  const totalAmount = txParsed.data.quantity * txParsed.data.pricePerUnit;

  const asset = await prisma.$transaction(async (tx) => {
    const createdAsset = await tx.asset.create({
      data: {
        userId: user.id,
        name: assetParsed.data.name,
        type: assetParsed.data.type,
        currency: assetParsed.data.currency,
      },
    });

    await tx.investmentTransaction.create({
      data: {
        assetId: createdAsset.id,
        brokerId: txParsed.data.brokerId,
        type: "BUY",
        date: new Date(txParsed.data.date),
        quantity: new Prisma.Decimal(txParsed.data.quantity),
        pricePerUnit: new Prisma.Decimal(txParsed.data.pricePerUnit),
        totalAmount: new Prisma.Decimal(totalAmount),
        notes: txParsed.data.notes || null,
      },
    });

    return createdAsset;
  });

  revalidatePath("/investments");
  redirect(`/investments/${asset.id}`);
}

const updateAssetSchema = assetSchema.omit({ currentPricePerUnit: true });

export async function updateAsset(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing asset id" };
  }

  const parsed = updateAssetSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    currency: formData.get("currency"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.asset.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return { error: "Investment not found" };
  }

  await prisma.asset.update({
    where: { id },
    data: {
      name: parsed.data.name,
      type: parsed.data.type,
      currency: parsed.data.currency,
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/investments");
  revalidatePath(`/investments/${id}`);
  redirect(`/investments/${id}`);
}

const priceSchema = z.object({
  currentPricePerUnit: z.coerce
    .number()
    .finite()
    .nonnegative("Price must be zero or greater"),
});

export async function updateAssetCurrentPrice(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing asset id" };
  }

  const parsed = priceSchema.safeParse({
    currentPricePerUnit: formData.get("currentPricePerUnit"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.asset.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return { error: "Investment not found" };
  }

  await prisma.asset.update({
    where: { id },
    data: {
      currentPricePerUnit: new Prisma.Decimal(parsed.data.currentPricePerUnit),
      currentPriceUpdatedAt: new Date(),
    },
  });

  revalidatePath("/investments");
  revalidatePath(`/investments/${id}`);
  return { error: null };
}

export async function deleteAsset(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing asset id" };
  }

  const existing = await prisma.asset.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return { error: "Investment not found" };
  }

  // InvestmentTransaction -> Asset cascades on delete (see schema.prisma),
  // so this intentionally removes the asset's full transaction history too.
  await prisma.asset.delete({ where: { id } });

  revalidatePath("/investments");
  redirect("/investments");
}

// ---------- Transactions ----------

async function assertOwnedAsset(assetId: string, userId: string) {
  const asset = await prisma.asset.findFirst({ where: { id: assetId, userId } });
  return asset;
}

export async function createTransaction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = transactionSchema.safeParse({
    assetId: formData.get("assetId"),
    brokerId: formData.get("brokerId"),
    type: formData.get("type"),
    date: formData.get("date"),
    quantity: formData.get("quantity"),
    pricePerUnit: formData.get("pricePerUnit"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const asset = await assertOwnedAsset(parsed.data.assetId, user.id);
  if (!asset) {
    return { error: "Investment not found" };
  }

  const broker = await prisma.broker.findFirst({
    where: { id: parsed.data.brokerId, userId: user.id },
  });
  if (!broker) {
    return { error: "Select a valid broker" };
  }

  if (parsed.data.type === "SELL") {
    const quantityHeld = await getQuantityHeld(parsed.data.assetId);
    if (parsed.data.quantity > quantityHeld) {
      return {
        error: `This would sell more than you currently hold (${quantityHeld} available).`,
      };
    }
  }

  const totalAmount = parsed.data.quantity * parsed.data.pricePerUnit;

  await prisma.investmentTransaction.create({
    data: {
      assetId: parsed.data.assetId,
      brokerId: parsed.data.brokerId,
      type: parsed.data.type,
      date: new Date(parsed.data.date),
      quantity: new Prisma.Decimal(parsed.data.quantity),
      pricePerUnit: new Prisma.Decimal(parsed.data.pricePerUnit),
      totalAmount: new Prisma.Decimal(totalAmount),
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/investments");
  revalidatePath(`/investments/${parsed.data.assetId}`);
  redirect(`/investments/${parsed.data.assetId}`);
}

export async function updateTransaction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing transaction id" };
  }

  const parsed = transactionSchema.safeParse({
    assetId: formData.get("assetId"),
    brokerId: formData.get("brokerId"),
    type: formData.get("type"),
    date: formData.get("date"),
    quantity: formData.get("quantity"),
    pricePerUnit: formData.get("pricePerUnit"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const asset = await assertOwnedAsset(parsed.data.assetId, user.id);
  if (!asset) {
    return { error: "Investment not found" };
  }

  const existing = await prisma.investmentTransaction.findFirst({
    where: { id, assetId: parsed.data.assetId },
  });
  if (!existing) {
    return { error: "Transaction not found" };
  }

  const broker = await prisma.broker.findFirst({
    where: { id: parsed.data.brokerId, userId: user.id },
  });
  if (!broker) {
    return { error: "Select a valid broker" };
  }

  if (parsed.data.type === "SELL") {
    const quantityHeld = await getQuantityHeld(parsed.data.assetId, id);
    if (parsed.data.quantity > quantityHeld) {
      return {
        error: `This would sell more than you currently hold (${quantityHeld} available).`,
      };
    }
  }

  const totalAmount = parsed.data.quantity * parsed.data.pricePerUnit;

  await prisma.investmentTransaction.update({
    where: { id },
    data: {
      brokerId: parsed.data.brokerId,
      type: parsed.data.type,
      date: new Date(parsed.data.date),
      quantity: new Prisma.Decimal(parsed.data.quantity),
      pricePerUnit: new Prisma.Decimal(parsed.data.pricePerUnit),
      totalAmount: new Prisma.Decimal(totalAmount),
      notes: parsed.data.notes || null,
    },
  });

  revalidatePath("/investments");
  revalidatePath(`/investments/${parsed.data.assetId}`);
  redirect(`/investments/${parsed.data.assetId}`);
}

export async function deleteTransaction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const id = formData.get("id");
  const assetId = formData.get("assetId");
  if (typeof id !== "string" || !id || typeof assetId !== "string" || !assetId) {
    return { error: "Missing transaction id" };
  }

  const asset = await assertOwnedAsset(assetId, user.id);
  if (!asset) {
    return { error: "Investment not found" };
  }

  const existing = await prisma.investmentTransaction.findFirst({
    where: { id, assetId },
  });
  if (!existing) {
    return { error: "Transaction not found" };
  }

  await prisma.investmentTransaction.delete({ where: { id } });

  revalidatePath("/investments");
  revalidatePath(`/investments/${assetId}`);
  return { error: null };
}
