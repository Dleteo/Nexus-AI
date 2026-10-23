import { NextResponse } from "next/server";
import { getSupabaseConfig, supabaseFetch, type AuthSession } from "../../../../lib/supabase";
import { writeSession } from "../../../../lib/session";

export async function POST(request: Request) {
  if (!getSupabaseConfig()) {
    return NextResponse.json({ error: "Account services are not configured yet. Add the Supabase environment variables and try again." }, { status: 503 });
  }
  const body = await request.json().catch(() => null) as { name?: string; email?: string; password?: string } | null;
  const name = body?.name?.trim() ?? "";
  const email = body?.email?.trim().toLowerCase() ?? "";
  const password = body?.password ?? "";
  if (name.length < 2 || name.length > 80) return NextResponse.json({ error: "Enter a name between 2 and 80 characters." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  if (password.length < 10 || password.length > 128) return NextResponse.json({ error: "Password must be 10–128 characters long." }, { status: 400 });

  try {
    const response = await supabaseFetch("/auth/v1/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, data: { full_name: name } }),
    });
    const data = await response.json().catch(() => ({})) as AuthSession & { expires_in?: number; msg?: string; message?: string; error_description?: string };
    if (!response.ok) {
      const message = data.msg ?? data.message ?? data.error_description;
      return NextResponse.json({ error: message || "We could not create this account. Check the details and try again." }, { status: response.status >= 500 ? 502 : 400 });
    }
    if (data.access_token && data.refresh_token && data.user?.id) {
      await writeSession({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: data.expires_at ?? Math.floor(Date.now() / 1000) + (data.expires_in ?? 3600),
        user: data.user,
      });
      return NextResponse.json({ ok: true, requiresEmailConfirmation: false });
    }
    return NextResponse.json({ ok: true, requiresEmailConfirmation: true });
  } catch {
    return NextResponse.json({ error: "Account service is unavailable. Please try again later." }, { status: 502 });
  }
}
