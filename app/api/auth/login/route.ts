import { NextResponse } from "next/server";
import { getSupabaseConfig, supabaseFetch, type AuthSession } from "../../../../lib/supabase";
import { writeSession } from "../../../../lib/session";

export async function POST(request: Request) {
  if (!getSupabaseConfig()) return NextResponse.json({ error: "Account services are not configured yet. Add the Supabase environment variables and try again." }, { status: 503 });
  const body = await request.json().catch(() => null) as { email?: string; password?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password || password.length > 128) {
    return NextResponse.json({ error: "Enter a valid email and password." }, { status: 400 });
  }
  try {
    const response = await supabaseFetch("/auth/v1/token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) });
    const data = await response.json().catch(() => ({})) as AuthSession & { expires_in?: number; msg?: string; message?: string; error_description?: string };
    if (!response.ok || !data.access_token || !data.refresh_token || !data.user?.id) {
      return NextResponse.json({ error: "Email or password is incorrect, or the email has not been confirmed." }, { status: 401 });
    }
    await writeSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at ?? Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
      user: data.user,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Sign-in service is unavailable. Please try again later." }, { status: 502 });
  }
}
