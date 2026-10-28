import { execFile } from "node:child_process";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noCache = { "Cache-Control": "no-store" };
const error = (reason: string, status: number) =>
  NextResponse.json({ ok: false, reason }, { status, headers: noCache });

/**
 * The local Studio demo has no authentication.
 * Never expose this writable endpoint in a production build or on a LAN.
 */
function enabled(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== "development" || process.env.NEXUS_LABS_STUDIO_SQLITE !== "1") {
    return false;
  }
  const host = req.headers.get("host")?.toLowerCase().split(":")[0];
  return host === "127.0.0.1" || host === "localhost";
}

function invokePython(command: object): Promise<string> {
  return new Promise((resolve, reject) => {
    const executable = process.platform === "win32" ? "python" : "python3";
    const processHandle = execFile(
      executable,
      [path.join(process.cwd(), "labs", "studio", "backend.py")],
      { timeout: 5000, maxBuffer: 128 * 1024 },
      (problem, stdout) => problem ? reject(problem) : resolve(stdout),
    );
    if (!processHandle.stdin) {
      reject(new Error("stdin-unavailable"));
      return;
    }
    processHandle.stdin.on("error", reject);
    processHandle.stdin.end(JSON.stringify(command));
  });
}

async function execute(command: object): Promise<NextResponse> {
  try {
    const raw: unknown = JSON.parse(await invokePython(command));
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
  if (!enabled(request)) return error("local-backend-disabled", 503);
  return execute({ action: "get" });
}

export async function POST(request: NextRequest) {
  if (!enabled(request)) return error("local-backend-disabled", 503);
  if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) {
    return error("content-type-required", 415);
  }
  if (request.headers.get("sec-fetch-site") === "cross-site") {
    return error("origin-denied", 403);
  }
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== request.nextUrl.origin) return error("origin-denied", 403);
    } catch {
      return error("origin-denied", 403);
    }
  }
  const body = await request.text();
  if (body.length > 20000) return error("request-too-large", 413);
  let command: unknown;
  try {
    command = JSON.parse(body);
  } catch {
    return error("invalid-json", 400);
  }
  if (!command || typeof command !== "object" || Array.isArray(command)) {
    return error("invalid-request", 400);
  }
  const data = command as Record<string, unknown>;
  if (data.action === "save") {
    return execute({ action: "save", expectedRevision: data.expectedRevision, blocks: data.blocks });
  }
  if (data.action === "restore") {
    return execute({ action: "restore", expectedRevision: data.expectedRevision, revision: data.revision });
  }
  return error("unsupported-action", 400);
}
