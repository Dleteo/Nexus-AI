import { NextResponse } from "next/server";
import { getSupabaseConfig } from "../../../../lib/supabase";

export async function POST(request: Request) {
  const config = getSupabaseConfig();
  if (!config) {
    return NextResponse.json({ error: "Account services are not configured yet." }, { status: 503 });
  }

  const body = await request.json().catch(() => null) as { accessToken?: string; password?: string } | null;
  const accessToken = body?.accessToken?.trim() ?? "";
  const password = body?.password ?? "";

  if (!accessToken || accessToken.length > 8192) {
    return NextResponse.json({ error: "Your recovery link is missing or invalid. Request a new one." }, { status: 400 });
  }
  if (password.length < 10 || password.length > 128) {
    return NextResponse.json({ error: "Password must be 10–128 characters long." }, { status: 400 });
  }

  try {
    const response = await fetch(`${config.url}/auth/v1/user`, {
      method: "PUT",
      headers: {
        apikey: config.apiKey,
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: "Your recovery link is invalid or expired. Request a new one." }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Password reset is temporarily unavailable. Please try again later." }, { status: 502 });
  }
}
