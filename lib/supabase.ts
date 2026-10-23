import "server-only";

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
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const apiKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.SUPABASE_PUBLISHABLE_KEY ??
    process.env.SUPABASE_ANON_KEY;
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
    const response = await fetch(`${config.url}/auth/v1/user`, {
      headers: { apikey: config.apiKey, Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    });
    if (response.ok) {
      const verifiedUser = await response.json() as SupabaseUser;
      return { ...session, user: verifiedUser };
    }
  }

  if (!session.refresh_token) return null;
  const response = await fetch(`${config.url}/auth/v1/token?grant_type=refresh_token`, {
    method: "POST",
    headers: { apikey: config.apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: session.refresh_token }),
    cache: "no-store",
  });
  if (!response.ok) return null;
  const data = (await response.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in?: number;
    user: SupabaseUser;
  };
  if (!data.access_token || !data.refresh_token || !data.user?.id) return null;
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
    user: data.user,
  };
}
