import { NextResponse } from "next/server";
import { readSession } from "../../../../lib/session";
import { getSupabaseConfig } from "../../../../lib/supabase";
import {conversationTitle,isAssistantScope} from "../../../../lib/assistant-scopes";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Sign in to view conversations." }, { status: 401 });
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const response = await fetch(`${config.url}/rest/v1/assistant_conversations?select=id,title,mode,project_id,created_at,updated_at&order=updated_at.desc&limit=50`, {
    headers: { apikey: config.apiKey, Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Could not load conversations." }, { status: 502 });
  return NextResponse.json({ conversations: data });
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Sign in to start a conversation." }, { status: 401 });
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const body = await request.json().catch(() => null) as { title?: string; mode?: string; projectId?: string | null; scope?: string } | null;
  const scope = body?.scope ?? "technical";
  if (!isAssistantScope(scope)) return NextResponse.json({error:"Invalid assistant workspace."},{status:400});
  const title = conversationTitle(scope);
  const mode = body?.mode ?? "assistant";
  const projectId = body?.projectId ?? null;
  if (title.length > 120) return NextResponse.json({ error: "Title must be 120 characters or fewer." }, { status: 400 });
  if (!["assistant", "plan", "debug", "explain", "interview"].includes(mode)) return NextResponse.json({ error: "Invalid assistant mode." }, { status: 400 });
  if (projectId !== null && (typeof projectId !== "string" || !/^[0-9a-f-]{36}$/i.test(projectId))) return NextResponse.json({ error: "Invalid project ID." }, { status: 400 });
  const response = await fetch(`${config.url}/rest/v1/assistant_conversations?select=id,title,mode,project_id,created_at,updated_at`, {
    method: "POST",
    headers: { apikey: config.apiKey, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ user_id: session.user.id, title, mode, project_id: projectId }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Could not create conversation. Make sure the database migration is installed." }, { status: 502 });
  return NextResponse.json({ conversation: Array.isArray(data) ? data[0] : data }, { status: 201 });
}
