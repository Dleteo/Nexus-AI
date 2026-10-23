import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getValidSession, type AuthSession } from "./supabase";

export const SESSION_COOKIE = "nexus_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export async function writeSession(session: AuthSession) {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}

export async function clearSession() {
  const jar = await cookies();
  jar.set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

export async function readSession(): Promise<AuthSession | null> {
  const jar = await cookies();
  const raw = jar.get(SESSION_COOKIE)?.value;
  if (!raw) return null;
  try {
    const previous = JSON.parse(raw) as AuthSession;
    if (!previous.access_token || !previous.refresh_token || !previous.user?.id) return null;
    const session = await getValidSession(previous);
    if (session) {
      // Persist refreshed access/refresh tokens because Supabase may rotate refresh tokens.
      await writeSession(session);
    } else {
      await clearSession();
    }
    return session;
  } catch {
    await clearSession();
    return null;
  }
}

export async function hasSessionCookie() {
  const jar = await cookies();
  return Boolean(jar.get(SESSION_COOKIE)?.value);
}

export async function requireUser() {
  const session = await readSession();
  if (!session) redirect("/login?next=%2Fdashboard");
  return session;
}
