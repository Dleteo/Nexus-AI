import { NextResponse } from "next/server";
import { readSession } from "../../../../../lib/session";
import { getSupabaseConfig } from "../../../../../lib/supabase";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Sign in to view this conversation." }, { status: 401 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid conversation ID." }, { status: 400 });
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const headers = { apikey: config.apiKey, Authorization: `Bearer ${session.access_token}` };
  const conversationResponse = await fetch(`${config.url}/rest/v1/assistant_conversations?id=eq.${encodeURIComponent(id)}&select=id,title,mode,project_id,created_at,updated_at`, { headers, cache: "no-store" });
  const conversations = await conversationResponse.json().catch(() => null);
  if (!conversationResponse.ok) return NextResponse.json({ error: "Could not load conversation." }, { status: 502 });
  if (!Array.isArray(conversations) || !conversations[0]) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  const messagesResponse = await fetch(`${config.url}/rest/v1/assistant_messages?conversation_id=eq.${encodeURIComponent(id)}&select=id,role,content,created_at&order=created_at.asc&limit=100`, { headers, cache: "no-store" });
  const messages = await messagesResponse.json().catch(() => null);
  if (!messagesResponse.ok) return NextResponse.json({ error: "Could not load messages." }, { status: 502 });
  return NextResponse.json({ conversation: conversations[0], messages });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Sign in to delete this conversation." }, { status: 401 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid conversation ID." }, { status: 400 });
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const response = await fetch(`${config.url}/rest/v1/assistant_conversations?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { apikey: config.apiKey, Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: "Could not delete conversation." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
