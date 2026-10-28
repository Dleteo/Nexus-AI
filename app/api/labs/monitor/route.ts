import { execFile } from "node:child_process";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noCache = { "Cache-Control": "no-store" };
function failure(reason: string, status: number) {
  return NextResponse.json({ ok: false, reason }, { status, headers: noCache });
}

/** Development-only, loopback-only. No arbitrary URLs or remote targets. */
function localPort(req: NextRequest): number | null {
  if (process.env.NODE_ENV !== "development" || process.env.NEXUS_LABS_MONITOR_SQLITE !== "1") {
    return null;
  }
  const host = req.headers.get("host")?.toLowerCase() || "";
  const match = /^(?:127\.0\.0\.1|localhost)(?::([0-9]{1,5}))?$/.exec(host);
  if (!match) return null;
  const port = Number(match[1] || "80");
  return Number.isSafeInteger(port) && port >= 1 && port <= 65535 ? port : null;
}

function runBackend(command: object): Promise<string> {
  return new Promise((resolve, reject) => {
    const executable = process.platform === "win32" ? "python" : "python3";
    const child = execFile(
      executable,
      [path.join(process.cwd(), "labs", "monitor", "backend.py")],
      { timeout: 6500, maxBuffer: 128 * 1024 },
      (problem, stdout) => problem ? reject(problem) : resolve(stdout),
    );
    if (!child.stdin) { reject(new Error("stdin-unavailable")); return; }
    child.stdin.on("error", reject);
    child.stdin.end(JSON.stringify(command));
  });
}

async function invoke(command: object) {
  try {
    const data: unknown = JSON.parse(await runBackend(command));
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
  if (localPort(request) === null) return failure("local-backend-disabled", 503);
  return invoke({ action: "list" });
}

export async function POST(request: NextRequest) {
  const port = localPort(request);
  if (port === null) return failure("local-backend-disabled", 503);
  if (!(request.headers.get("content-type") || "").toLowerCase().startsWith("application/json")) {
    return failure("content-type-required", 415);
  }
  if (request.headers.get("sec-fetch-site") === "cross-site") return failure("origin-denied", 403);
  const origin = request.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== request.nextUrl.origin) return failure("origin-denied", 403);
    } catch {
      return failure("origin-denied", 403);
    }
  }
  // Ignore all request fields. There is no target selector, URL or probe customization.
  return invoke({ action: "probe", port });
}
