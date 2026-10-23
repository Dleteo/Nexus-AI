import { NextResponse } from "next/server";
import { readSession } from "../../../../lib/session";
import { getSupabaseConfig } from "../../../../lib/supabase";

type ProjectUpdate = { name?: string; description?: string; status?: "active" | "archived" };

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Sign in to update a project." }, { status: 401 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid project ID." }, { status: 400 });

  const body = await request.json().catch(() => null) as ProjectUpdate | null;
  if (!body || (body.status === undefined && body.name === undefined && body.description === undefined)) {
    return NextResponse.json({ error: "Provide a project name, description, or status to update." }, { status: 400 });
  }
  const updates: ProjectUpdate = {};
  if (body.name !== undefined) {
    const name = body.name.trim();
    if (name.length < 2 || name.length > 80) return NextResponse.json({ error: "Project name must be 2–80 characters." }, { status: 400 });
    updates.name = name;
  }
  if (body.description !== undefined) {
    const description = body.description.trim();
    if (description.length > 500) return NextResponse.json({ error: "Description must be 500 characters or fewer." }, { status: 400 });
    updates.description = description;
  }
  if (body.status !== undefined) {
    if (body.status !== "active" && body.status !== "archived") return NextResponse.json({ error: "Invalid project status." }, { status: 400 });
    updates.status = body.status;
  }

  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const response = await fetch(`${config.url}/rest/v1/projects?id=eq.${encodeURIComponent(id)}&select=id,name,description,status,created_at`, {
    method: "PATCH",
    headers: { apikey: config.apiKey, Authorization: `Bearer ${session.access_token}`, "Content-Type": "application/json", Prefer: "return=representation" },
    body: JSON.stringify(updates),
    cache: "no-store",
  });
  const data = await response.json().catch(() => null);
  if (!response.ok) return NextResponse.json({ error: "Could not update project." }, { status: 502 });
  if (!Array.isArray(data) || data.length === 0) return NextResponse.json({ error: "Project not found or you do not have permission to update it." }, { status: 404 });
  return NextResponse.json({ project: data[0] });
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Sign in to delete a project." }, { status: 401 });
  const { id } = await context.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) return NextResponse.json({ error: "Invalid project ID." }, { status: 400 });
  const config = getSupabaseConfig();
  if (!config) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  const response = await fetch(`${config.url}/rest/v1/projects?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { apikey: config.apiKey, Authorization: `Bearer ${session.access_token}`, Prefer: "return=minimal" },
    cache: "no-store",
  });
  if (!response.ok) return NextResponse.json({ error: "Could not delete project." }, { status: 502 });
  return NextResponse.json({ ok: true });
}
