import { NextRequest, NextResponse } from "next/server";
import { localLabsAccess, readLabsJson } from "@/lib/labs-http.mjs";
import { runLabsPython } from "@/lib/labs-python-runner.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noCache = { "Cache-Control": "no-store" };
const error = (reason: string, status: number) =>
  NextResponse.json({ ok: false, reason }, { status, headers: noCache });

async function execute(command: object, signal: AbortSignal): Promise<NextResponse> {
  try {
    const raw: unknown = JSON.parse(await runLabsPython("studio", command, { signal }));
    if (!raw || typeof raw !== "object" || !("ok" in raw)) throw new Error("invalid-response");
    const result = raw as { ok: boolean; reason?: string };
    return NextResponse.json(result, {
      status: result.ok ? 200 : result.reason === "revision-conflict" ? 409 : 400,
      headers: noCache,
    });
  } catch {
    return error("local-backend-unavailable", 503);
  }
}

export async function GET(request: NextRequest) {
  const access = localLabsAccess(request, "NEXUS_LABS_STUDIO_SQLITE");
  if (!access.ok) return error(access.reason, access.status);
  return execute({ action: "get" }, request.signal);
}

export async function POST(request: NextRequest) {
  const access = localLabsAccess(request, "NEXUS_LABS_STUDIO_SQLITE");
  if (!access.ok) return error(access.reason, access.status);
  const body = await readLabsJson(request, 20000);
  if (!body.ok) return error(body.reason, body.status);
  const command = body.value;
  if (!command || typeof command !== "object" || Array.isArray(command)) {
    return error("invalid-request", 400);
  }
  const data = command as Record<string, unknown>;
  if (data.action === "save") {
    return execute({ action: "save", expectedRevision: data.expectedRevision, blocks: data.blocks }, request.signal);
  }
  if (data.action === "restore") {
    return execute({ action: "restore", expectedRevision: data.expectedRevision, revision: data.revision }, request.signal);
  }
  return error("unsupported-action", 400);
}
