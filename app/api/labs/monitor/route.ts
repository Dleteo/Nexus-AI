import { NextRequest, NextResponse } from "next/server";
import { localLabsAccess, readLabsJson } from "@/lib/labs-http.mjs";
import { runLabsPython } from "@/lib/labs-python-runner.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noCache = { "Cache-Control": "no-store" };
function failure(reason: string, status: number) {
  return NextResponse.json({ ok: false, reason }, { status, headers: noCache });
}

async function invoke(command: object, signal: AbortSignal) {
  try {
    const data: unknown = JSON.parse(await runLabsPython("monitor", command, { signal }));
    if (!data || typeof data !== "object" || !("ok" in data)) throw new Error("invalid-response");
    const result = data as { ok: boolean; reason?: string };
    return NextResponse.json(result, {
      status: result.ok ? 200 : 400,
      headers: noCache,
    });
  } catch {
    return failure("local-backend-unavailable", 503);
  }
}

export async function GET(request: NextRequest) {
  const access = localLabsAccess(request, "NEXUS_LABS_MONITOR_SQLITE");
  if (!access.ok) return failure(access.reason, access.status);
  return invoke({ action: "list" }, request.signal);
}

export async function POST(request: NextRequest) {
  const access = localLabsAccess(request, "NEXUS_LABS_MONITOR_SQLITE");
  if (!access.ok) return failure(access.reason, access.status);
  const body = await readLabsJson(request, 2048);
  if (!body.ok) return failure(body.reason, body.status);
  // Ignore all request fields. There is no target selector, URL or probe customization.
  return invoke({ action: "probe", port: access.port }, request.signal);
}
