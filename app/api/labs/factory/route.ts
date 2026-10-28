import { execFile } from "node:child_process";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const noCache = { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" };
const failure = (reason: string, status: number) =>
  NextResponse.json({ ok: false, reason }, { status, headers: noCache });

/** No authentication is built. Keep all writes and ZIP access localhost-only in development. */
function enabled(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== "development" || process.env.NEXUS_LABS_FACTORY !== "1") return false;
  const host = req.headers.get("host")?.toLowerCase() ?? "";
  return /^(?:127\.0\.0\.1|localhost)(?::\d{1,5})?$/.test(host);
}
function runPython(command: object): Promise<string> {
  return new Promise((resolve, reject) => {
    const executable = process.platform === "win32" ? "python" : "python3";
    const child = execFile(
      executable,
      [path.join(process.cwd(), "labs", "factory", "backend.py")],
      { timeout: 5000, maxBuffer: 256 * 1024 },
      (problem, stdout) => problem ? reject(problem) : resolve(stdout),
    );
    if (!child.stdin) { reject(new Error("stdin-unavailable")); return; }
    child.stdin.on("error", reject);
    child.stdin.end(JSON.stringify(command));
  });
}
async function invoke(command: object): Promise<NextResponse> {
  try {
    const raw: unknown = JSON.parse(await runPython(command));
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
  if (!enabled(req)) return failure("local-backend-disabled", 503);
  const artifact = req.nextUrl.searchParams.get("artifact");
  const preview = req.nextUrl.searchParams.get("preview");
  if (artifact && preview) return failure("ambiguous-request", 400);
  if (preview) return invoke({ action: "preview", id: preview });
  return invoke(artifact ? { action: "artifact", id: artifact } : { action: "list" });
}
export async function POST(req: NextRequest) {
  if (!enabled(req)) return failure("local-backend-disabled", 503);
  if (!(req.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) {
    return failure("content-type-required", 415);
  }
  if (req.headers.get("sec-fetch-site") === "cross-site") return failure("origin-denied", 403);
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== req.nextUrl.origin) return failure("origin-denied", 403);
    } catch {
      return failure("origin-denied", 403);
    }
  }
  const body = await req.text();
  if (body.length > 2048) return failure("request-too-large", 413);
  let input: unknown;
  try { input = JSON.parse(body); } catch { return failure("invalid-json", 400); }
  if (!input || typeof input !== "object" || Array.isArray(input)) return failure("invalid-request", 400);
  const data = input as Record<string, unknown>;
  if (data.action === "propose") {
    return invoke({ action: "propose", request: data.request, kind: data.kind });
  }
  if (data.action === "approve") {
    return invoke({ action: "approve", id: data.id, confirmed: data.confirmed });
  }
  if (data.action === "build") {
    return invoke({ action: "build", id: data.id });
  }
  return failure("unsupported-action", 400);
}
