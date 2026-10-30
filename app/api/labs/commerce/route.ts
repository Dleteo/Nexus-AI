import { NextRequest, NextResponse } from "next/server";
import { localLabsAccess, readLabsJson } from "@/lib/labs-http.mjs";
import { runLabsPython } from "@/lib/labs-python-runner.mjs";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const noCache = { "Cache-Control": "no-store" };
const failure = (reason: string, status: number) => NextResponse.json(
  { ok: false, reason }, { status, headers: noCache },
);
async function invoke(command: object, signal: AbortSignal): Promise<NextResponse> {
  try {
    const output: unknown = JSON.parse(await runLabsPython("commerce", command, { signal }));
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
  const access = localLabsAccess(req, "NEXUS_LABS_SQLITE");
  if (!access.ok) return failure(access.reason, access.status);
  return invoke({ action: "list" }, req.signal);
}

export async function POST(req: NextRequest) {
  const access = localLabsAccess(req, "NEXUS_LABS_SQLITE");
  if (!access.ok) return failure(access.reason, access.status);
  const body = await readLabsJson(req, 2048);
  if (!body.ok) return failure(body.reason, body.status);
  const data = body.value;
  if (!data || typeof data !== "object" || Array.isArray(data) || !("cart" in data)) {
    return NextResponse.json({ ok: false, reason: "invalid-cart" }, { status: 400, headers: noCache });
  }
  return invoke({ action: "checkout", cart: data.cart }, req.signal);
}
