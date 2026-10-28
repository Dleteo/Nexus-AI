import { execFile } from "node:child_process";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noCache = { "Cache-Control": "no-store" };
const unavailable = () => NextResponse.json(
  { ok: false, reason: "local-backend-disabled" }, { status: 503, headers: noCache },
);

/**
 * The SQLite demo has no accounts. It is disabled in production and on any
 * non-loopback Host to prevent accidentally exposing a writable shared store.
 */
function isLocalDevelopment(req: NextRequest): boolean {
  if (process.env.NODE_ENV !== "development" || process.env.NEXUS_LABS_SQLITE !== "1") {
    return false;
  }
  const hostname = req.headers.get("host")?.toLowerCase().split(":")[0];
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function runPython(command: object): Promise<string> {
  return new Promise((resolve, reject) => {
    const python = process.platform === "win32" ? "python" : "python3";
    const child = execFile(
      python,
      [path.join(process.cwd(), "labs", "commerce", "backend.py")],
      { timeout: 5000, maxBuffer: 65536 },
      (error, stdout) => error ? reject(error) : resolve(stdout),
    );
    if (!child.stdin) { reject(new Error("stdin-unavailable")); return; }
    child.stdin.on("error", reject);
    child.stdin.end(JSON.stringify(command));
  });
}

async function invoke(command: object): Promise<NextResponse> {
  try {
    const output: unknown = JSON.parse(await runPython(command));
    if (!output || typeof output !== "object" || !("ok" in output)) {
      throw new Error("invalid-backend-output");
    }
    const result = output as { ok: boolean; reason?: string };
    const status = result.ok ? 200 : (result.reason === "insufficient-stock" ? 409 : 400);
    return NextResponse.json(result, { status, headers: noCache });
  } catch {
    return NextResponse.json(
      { ok: false, reason: "local-backend-unavailable" },
      { status: 503, headers: noCache },
    );
  }
}

export async function GET(req: NextRequest) {
  if (!isLocalDevelopment(req)) return unavailable();
  return invoke({ action: "list" });
}

export async function POST(req: NextRequest) {
  if (!isLocalDevelopment(req)) return unavailable();
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      if (new URL(origin).origin !== req.nextUrl.origin) {
        return NextResponse.json({ ok: false, reason: "origin-denied" }, { status: 403, headers: noCache });
      }
    } catch {
      return NextResponse.json({ ok: false, reason: "origin-denied" }, { status: 403, headers: noCache });
    }
  }
  const body = await req.text();
  if (body.length > 2048) {
    return NextResponse.json({ ok: false, reason: "invalid-cart" }, { status: 400, headers: noCache });
  }
  let data: unknown;
  try { data = JSON.parse(body); } catch {
    return NextResponse.json({ ok: false, reason: "invalid-json" }, { status: 400, headers: noCache });
  }
  if (!data || typeof data !== "object" || Array.isArray(data) || !("cart" in data)) {
    return NextResponse.json({ ok: false, reason: "invalid-cart" }, { status: 400, headers: noCache });
  }
  return invoke({ action: "checkout", cart: data.cart });
}
