import "server-only";

import { redirect } from "next/navigation";
import { getCurrentUser, type SessionUser } from "@/lib/session";

export { getCurrentUser, createSession, destroySession } from "@/lib/session";
export type { SessionUser } from "@/lib/session";

/** Use in server components/pages that require an authenticated user. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return user;
}
