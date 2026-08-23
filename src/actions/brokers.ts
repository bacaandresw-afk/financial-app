"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/auth";
import { brokerSchema } from "@/lib/validations";

export type ActionState = { error: string | null };

export async function createBroker(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const parsed = brokerSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  try {
    await prisma.broker.create({
      data: { userId: user.id, name: parsed.data.name },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "You already have a broker with that name" };
    }
    throw err;
  }

  revalidatePath("/investments/brokers");
  revalidatePath("/investments/new");
  return { error: null };
}

export async function updateBroker(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing broker id" };
  }

  const parsed = brokerSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await prisma.broker.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return { error: "Broker not found" };
  }

  try {
    await prisma.broker.update({
      where: { id },
      data: { name: parsed.data.name },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "You already have a broker with that name" };
    }
    throw err;
  }

  revalidatePath("/investments/brokers");
  revalidatePath("/investments");
  return { error: null };
}

export async function deleteBroker(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await requireUser();

  const id = formData.get("id");
  if (typeof id !== "string" || !id) {
    return { error: "Missing broker id" };
  }

  const existing = await prisma.broker.findFirst({ where: { id, userId: user.id } });
  if (!existing) {
    return { error: "Broker not found" };
  }

  try {
    await prisma.broker.delete({ where: { id } });
  } catch (err) {
    // No cascade is configured from InvestmentTransaction -> Broker on
    // purpose, so a broker still referenced by transactions fails the FK
    // constraint here rather than silently orphaning transaction history.
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2003") {
      return {
        error: "This broker has transactions recorded against it and can't be deleted.",
      };
    }
    throw err;
  }

  revalidatePath("/investments/brokers");
  revalidatePath("/investments");
  revalidatePath("/investments/new");
  return { error: null };
}
