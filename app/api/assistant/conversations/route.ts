import { NextResponse } from "next/server";
import { readSession } from "../../../../lib/session";
import { getSupabaseConfig } from "../../../../lib/supabase";
import {conversationTitle,isAssistantScope} from "../../../../lib/assistant-scopes";
import {fetchAssistantJson, isAssistantConversation, isUuid, readAssistantBody} from "../../../../lib/assistant-api";

export const runtime = "nodejs";

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Sign in to view conversations." }, { status: 401 });
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  // Bound each workspace independently so a busy technical history cannot hide
  // every portfolio conversation before the client applies its workspace filter.
  const responses = await Promise.all(["portfolio", "technical"].map(scope => fetchAssistantJson(`${config.url}/rest/v1/assistant_conversations?scope=eq.${scope}&select=id,title,scope,mode,project_id,created_at,updated_at&order=updated_at.desc,id.desc&limit=50`, {
    headers: { apikey: config.apiKey, Authorization: `Bearer ${session.access_token}` },
  })));
  if (responses.some(response => !response.ok || !Array.isArray(response.data))) return NextResponse.json({ error: "Could not load conversations." }, { status: 502 });
  const conversations = responses.flatMap(response => response.data as {updated_at:string}[]);
  if (conversations.some(item => !isAssistantConversation(item) || typeof item.updated_at !== "string")) return NextResponse.json({ error: "Could not load conversations." }, { status: 502 });
  conversations.sort((a,b) => b.updated_at.localeCompare(a.updated_at));
  return NextResponse.json({ conversations });
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Sign in to start a conversation." }, { status: 401 });
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const body = await readAssistantBody(request);
  if (!body) return NextResponse.json({error:"Provide a JSON object."},{status:400});
  const scope = body?.scope ?? "technical";
  if (!isAssistantScope(scope)) return NextResponse.json({error:"Invalid assistant workspace."},{status:400});
  const title = conversationTitle(scope);
  const mode = body?.mode ?? "assistant";
  const projectId = body?.projectId ?? null;
  if (title.length > 120) return NextResponse.json({ error: "Title must be 120 characters or fewer." }, { status: 400 });
  if (typeof mode !== "string" || !["assistant", "plan", "debug", "explain", "interview"].includes(mode)) return NextResponse.json({ error: "Invalid assistant mode." }, { status: 400 });
  if (projectId !== null && !isUuid(projectId)) return NextResponse.json({ error: "Invalid project ID." }, { status: 400 });
  const response = await fetchAssistantJson(`${config.url}/rest/v1/assistant_conversations?select=id,title,scope,mode,project_id,created_at,updated_at`, {
    method: "POST",
    headers: { apikey: config.apiKey, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ user_id: session.user.id, title, scope, mode, project_id: projectId }),
    cache: "no-store",
  });
  const data = response.data;
  if (!response.ok || !Array.isArray(data) || !isAssistantConversation(data[0])) return NextResponse.json({ error: "Could not create conversation. Make sure the database migration is installed." }, { status: 502 });
  return NextResponse.json({ conversation: data[0] }, { status: 201 });
}
