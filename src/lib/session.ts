import "server-only";

import { cookies } from "next/headers";
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/lib/prisma";

export const SESSION_COOKIE_NAME = "session";
const SESSION_DURATION_MS = 48 * 60 * 60 * 1000; // 48 hours
// Once a session is more than this old since its last refresh, extend it on
// use. Keeps the user logged in while active without writing to the DB on
// every single request.
const REFRESH_THRESHOLD_MS = 60 * 60 * 1000; // 1 hour

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
};

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  await prisma.session.create({
    data: { id: tokenHash, userId, expiresAt },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function getCurrentUser(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await prisma.session.findUnique({
    where: { id: tokenHash },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({ where: { id: tokenHash } }).catch(() => {});
    cookieStore.delete(SESSION_COOKIE_NAME);
    return null;
  }

  const timeRemaining = session.expiresAt.getTime() - Date.now();
  const shouldRefresh = SESSION_DURATION_MS - timeRemaining > REFRESH_THRESHOLD_MS;

  if (shouldRefresh) {
    const newExpiresAt = new Date(Date.now() + SESSION_DURATION_MS);
    await prisma.session.update({
      where: { id: tokenHash },
      data: { expiresAt: newExpiresAt, createdAt: new Date() },
    });
    cookieStore.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      expires: newExpiresAt,
    });
  }

  return session.user;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    await prisma.session.delete({ where: { id: hashToken(token) } }).catch(() => {});
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}
