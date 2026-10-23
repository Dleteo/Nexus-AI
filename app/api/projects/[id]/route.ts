import { NextResponse } from "next/server";
import { readSession } from "../../../../lib/session";
import { getSupabaseConfig } from "../../../../lib/supabase";

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Sign in to delete a project." }, { status: 401 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid project ID." }, { status: 400 });
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const response = await fetch(`${config.url}/rest/v1/projects?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { apikey: config.anonKey, Authorization: `Bearer ${session.access_token}`, Prefer: "return=minimal" },
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: "Could not delete project." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
