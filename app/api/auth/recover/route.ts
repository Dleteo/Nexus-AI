import { NextResponse } from "next/server";
import { getSupabaseConfig, supabaseFetch } from "../../../../lib/supabase";

function getAppOrigin(request: Request) {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) {
    try {
      const url = new URL(configured);
      if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") return null;
      return url.origin;
    } catch {
      return null;
    }
  }

  const requestUrl = new URL(request.url);
  if (process.env.NODE_ENV !== "production" && ["localhost", "127.0.0.1"].includes(requestUrl.hostname)) {
    return requestUrl.origin;
  }
  return null;
}

export async function POST(request: Request) {
  const config = getSupabaseConfig();
  if (!config) {
    return NextResponse.json({ error: "Account services are not configured yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { email?: string } | null;
  const email = body?.email?.trim().toLowerCase() ?? "";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  const origin = getAppOrigin(request);
  if (!origin) {
    return NextResponse.json({ error: "Password recovery needs NEXT_PUBLIC_SITE_URL configured to your application origin." }, { status: 503 });
  }

  try {
    const redirectTo = `${origin}/reset-password`;
    const response = await supabaseFetch(`/auth/v1/recover?redirect_to=${encodeURIComponent(redirectTo)}`, {
      method: "POST",
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      // Avoid exposing whether the email exists or leaking provider details.
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Password recovery is temporarily unavailable. Please try again later." }, { status: 502 });
  }
}
