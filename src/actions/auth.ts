"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createSession, destroySession } from "@/lib/session";
import { loginSchema, registerSchema } from "@/lib/validations";

export type AuthActionState = { error: string | null };

const DEFAULT_EXPENSE_CATEGORIES = ["Groceries", "Transport", "Dining out", "Utilities", "Housing", "Health", "Entertainment", "Other"];
const DEFAULT_INCOME_CATEGORIES = ["Salary", "Freelance", "Business", "Investment", "Other"];

export async function registerAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "An account with that email already exists" };
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      expenseCategories: { create: DEFAULT_EXPENSE_CATEGORIES.map((name) => ({ name })) },
      incomeCategories: { create: DEFAULT_INCOME_CATEGORIES.map((name) => ({ name })) },
    },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(
  _prevState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { email, password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  // Constant-shaped response for unknown email vs wrong password to avoid
  // leaking which emails are registered.
  const valid = user ? await verifyPassword(password, user.passwordHash) : false;

  if (!user || !valid) {
    return { error: "Invalid email or password" };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect("/login");
}
