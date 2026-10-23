import { NextResponse } from "next/server";
import { clearSession, readSession } from "../../../../lib/session";
import { getSupabaseConfig } from "../../../../lib/supabase";

export async function POST() {
  const session = await readSession();
  const config = getSupabaseConfig();
  if (session && config) {
    await fetch(`${config.url}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: config.anonKey, Authorization: `Bearer ${session.access_token}` },
      cache: "no-store",
    }).catch(() => undefined);
  }
  await clearSession();
  return NextResponse.json({ ok: true });
}
