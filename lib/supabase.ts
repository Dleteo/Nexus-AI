import "server-only";
import { fetchAssistantJson } from "./assistant-api";

export type SupabaseUser = {
  id: string;
  email?: string;
  user_metadata?: { full_name?: string };
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: SupabaseUser;
};

export type SupabaseConfig = {
  url: string;
  apiKey: string;
};

export function getSupabaseConfig(): SupabaseConfig | null {
  // Explicit server configuration must override public build-time values. This
  // also keeps isolated API tests on their local emulator after a public build.
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const apiKey =
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !apiKey) return null;
  return { url: url.replace(/\/$/, ""), apiKey };
}

// Server-only privileged key. Never expose this value through NEXT_PUBLIC_* variables.
export function getSupabaseSecretKey(): string | null {
  return process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? null;
}

export async function supabaseFetch(path: string, init: RequestInit = {}) {
  const config = getSupabaseConfig();
  if (!config) throw new Error("AUTH_NOT_CONFIGURED");
  return fetch(`${config.url}${path}`, {
    ...init,
    headers: {
      apikey: config.apiKey,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
    cache: "no-store",
  });
}

export async function getValidSession(session: AuthSession): Promise<AuthSession | null> {
  const config = getSupabaseConfig();
  if (!config) return null;

  if (session.expires_at && session.expires_at > Math.floor(Date.now() / 1000) + 30) {
    const response = await fetchAssistantJson(`${config.url}/auth/v1/user`, {
      headers: { apikey: config.apiKey, Authorization: `Bearer ${session.access_token}` },
    });
    if (response.ok) {
      const verifiedUser = response.data as SupabaseUser | null;
      if (!verifiedUser || typeof verifiedUser.id !== "string" || !verifiedUser.id) return null;
      return { ...session, user: verifiedUser };
    }
    // An upstream outage cannot be repaired by rotating the refresh token.
    if (response.status >= 500) return null;
  }

  if (!session.refresh_token) return null;
  const response = await fetchAssistantJson(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: config.apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
  });
  if (!response.ok) return null;
  const data = response.data as {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    user: SupabaseUser;
  } | null;
  if (!data || typeof data.access_token !== "string" || !data.access_token
    || typeof data.refresh_token !== "string" || !data.refresh_token
    || typeof data.user?.id !== "string" || !data.user.id) return null;
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
    user: data.user,
  };
}
