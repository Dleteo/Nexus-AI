import { NextRequest, NextResponse } from "next/server";
import { localLabsAccess, readLabsJson } from "@/lib/labs-http.mjs";
import { runLabsPython } from "@/lib/labs-python-runner.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noCache = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const failure = (reason: string, status: number) =>
  NextResponse.json({ ok: false, reason }, { status, headers: noCache });

async function invoke(command: object, signal: AbortSignal): Promise<NextResponse> {
  try {
    const raw: unknown = JSON.parse(await runLabsPython("factory", command, { signal }));
    if (!raw || typeof raw !== "object" || !("ok" in raw)) throw new Error("invalid-response");
    const data = raw as { ok: boolean; reason?: string; base64?: string; filename?: string };
    if (command && typeof command === "object" && "action" in command && command.action === "artifact" && data.ok) {
      if (!data.base64 || !data.filename || !/^nexus-factory-[0-9a-f]{8}\.zip$/.test(data.filename)) {
        throw new Error("invalid-artifact");
      }
      return new NextResponse(Buffer.from(data.base64, "base64"), {
        headers: {
          ...noCache,
          "Content-Type": "application/zip",
          "Content-Disposition": 'attachment; filename="' + data.filename + '"',
        },
      });
    }
    return NextResponse.json(data, {
      status: data.ok ? 200 : data.reason === "approval-required" || data.reason === "invalid-transition" ? 409 : data.reason === "job-not-found" || data.reason === "artifact-not-found" ? 404 : data.reason === "artifact-integrity-failed" ? 422 : 400,
      headers: noCache,
    });
  } catch {
    return failure("local-backend-unavailable", 503);
  }
}
export async function GET(req: NextRequest) {
  const access = localLabsAccess(req, "NEXUS_LABS_FACTORY");
  if (!access.ok) return failure(access.reason, access.status);
  const artifact = req.nextUrl.searchParams.get("artifact");
  const preview = req.nextUrl.searchParams.get("preview");
  if (artifact && preview) return failure("ambiguous-request", 400);
  if (preview) return invoke({ action: "preview", id: preview }, req.signal);
  return invoke(artifact ? { action: "artifact", id: artifact } : { action: "list" }, req.signal);
}
export async function POST(req: NextRequest) {
  const access = localLabsAccess(req, "NEXUS_LABS_FACTORY");
  if (!access.ok) return failure(access.reason, access.status);
  const body = await readLabsJson(req, 4096);
  if (!body.ok) return failure(body.reason, body.status);
  const input = body.value;
  if (!input || typeof input !== "object" || Array.isArray(input)) return failure("invalid-request", 400);
  const data = input as Record<string, unknown>;
  if (data.action === "propose") {
    return invoke({ action: "propose", request: data.request, kind: data.kind }, req.signal);
  }
  if (data.action === "approve") {
    return invoke({ action: "approve", id: data.id, confirmed: data.confirmed }, req.signal);
  }
  if (data.action === "build") {
    return invoke({ action: "build", id: data.id }, req.signal);
  }
  return failure("unsupported-action", 400);
}
