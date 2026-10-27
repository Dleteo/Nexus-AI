import { NextResponse } from "next/server";
import { readSession } from "../../../../../lib/session";
import { getSupabaseConfig } from "../../../../../lib/supabase";
import {fetchAssistantJson, isAssistantConversation, isAssistantMessage, isUuid, readAssistantBody} from "../../../../../lib/assistant-api";

export const runtime = "nodejs";

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Sign in to view this conversation." }, { status: 401 });
  const { id } = await context.params;
  if (!isUuid(id)) return NextResponse.json({ error: "Invalid conversation ID." }, { status: 400 });
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const headers = { apikey: config.apiKey, Authorization: `Bearer ${session.access_token}` };
  const conversationResponse = await fetchAssistantJson(`${config.url}/rest/v1/assistant_conversations?id=eq.${encodeURIComponent(id)}&select=id,title,scope,mode,project_id,created_at,updated_at`, { headers });
  const conversations = conversationResponse.data;
  if (!conversationResponse.ok || !Array.isArray(conversations)) return NextResponse.json({ error: "Could not load conversation." }, { status: 502 });
  if (conversations.length === 0) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  if (!isAssistantConversation(conversations[0])) return NextResponse.json({ error: "Could not load conversation." }, { status: 502 });
  const messagesResponse = await fetchAssistantJson(`${config.url}/rest/v1/assistant_messages?conversation_id=eq.${encodeURIComponent(id)}&select=id,role,content,created_at&order=created_at.desc,role.asc,id.desc&limit=100`, { headers });
  const messages = messagesResponse.data;
  if (!messagesResponse.ok || !Array.isArray(messages) || !messages.every(isAssistantMessage)) return NextResponse.json({ error: "Could not load messages." }, { status: 502 });
  return NextResponse.json({ conversation: conversations[0], messages: messages.reverse() });
}

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Sign in to update this conversation." }, { status: 401 });
  const { id } = await context.params;
  if (!isUuid(id)) return NextResponse.json({ error: "Invalid conversation ID." }, { status: 400 });
  const body = await readAssistantBody(request);
  if (typeof body?.mode !== "string" || !["assistant", "plan", "debug", "explain", "interview"].includes(body.mode)) {
    return NextResponse.json({ error: "Invalid assistant mode." }, { status: 400 });
  }
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const response = await fetchAssistantJson(`${config.url}/rest/v1/assistant_conversations?id=eq.${encodeURIComponent(id)}&select=id,title,scope,mode,project_id,created_at,updated_at`, {
    method: "PATCH",
    headers: { apikey: config.apiKey, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ mode: body.mode }),
    cache: "no-store",
  });
  const data = response.data;
  if (!response.ok || !Array.isArray(data)) return NextResponse.json({ error: "Could not update conversation." }, { status: 502 });
  if (data.length === 0) return NextResponse.json({ error: "Conversation not found." }, { status: 404 });
  if (!isAssistantConversation(data[0])) return NextResponse.json({ error: "Could not update conversation." }, { status: 502 });
  return NextResponse.json({ conversation: data[0] });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Sign in to delete this conversation." }, { status: 401 });
  const { id } = await context.params;
  if (!isUuid(id)) return NextResponse.json({ error: "Invalid conversation ID." }, { status: 400 });
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const response = await fetchAssistantJson(`${config.url}/rest/v1/assistant_conversations?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { apikey: config.apiKey, Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: "Could not delete conversation." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
