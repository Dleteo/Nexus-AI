import { NextResponse } from "next/server";
import { readSession } from "../../../lib/session";
import { getSupabaseConfig } from "../../../lib/supabase";

type Project = { id: string; name: string; description: string; status: string; created_at: string };

export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Sign in to view your projects." }, { status: 401 });
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const response = await fetch(`${config.url}/rest/v1/projects?select=id,name,description,status,created_at&order=created_at.desc`, {
    headers: { apikey: config.apiKey, Authorization: `Bearer ${session.access_token}` },
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Could not load projects. Check the database setup instructions." }, { status: 502 });
  return NextResponse.json({ projects: data as Project[] });
}

export async function POST(request: Request) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Sign in to create a project." }, { status: 401 });
  const body = await request.json().catch(() => null) as { name?: string; description?: string } | null;
  const name = body?.name?.trim() ?? "";
  const description = body?.description?.trim() ?? "";
  if (name.length < 2 || name.length > 80) return NextResponse.json({ error: "Project name must be 2–80 characters." }, { status: 400 });
  if (description.length > 500) return NextResponse.json({ error: "Description must be 500 characters or fewer." }, { status: 400 });
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const response = await fetch(`${config.url}/rest/v1/projects?select=id,name,description,status,created_at`, {
    method: "POST",
    headers: { apikey: config.apiKey, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify({ name, description, user_id: session.user.id }),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Could not save project. Confirm that the SQL schema and row-level security policies are installed." }, { status: 502 });
  return NextResponse.json({ project: Array.isArray(data) ? data[0] : data }, { status: 201 });
}
