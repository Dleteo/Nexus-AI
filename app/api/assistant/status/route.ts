import { NextResponse } from "next/server";
import { readSession } from "../../../../lib/session";
import { getSupabaseConfig } from "../../../../lib/supabase";
import { readAiProvider } from "../../../../lib/ai-runtime";
import { fetchAssistantJson } from "../../../../lib/assistant-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Status = "ready" | "not_configured" | "database_migration_required" | "database_unavailable";

/**
 * Readiness is configuration-only. This endpoint NEVER calls paid model APIs,
 * downloads weights, discloses credentials, or reads user conversations.
 */
export async function GET() {
  const session = await readSession();
  if (!session) return NextResponse.json({ error: "Sign in to check AI readiness." }, { status: 401 });

  const config = getSupabaseConfig();
  let databaseReady = false;
  let migrationRequired = false;
  if (config) {
    const response = await fetchAssistantJson(
      `${config.url}/rest/v1/assistant_conversations?select=scope&limit=0`,
      {
        headers: {
          apikey: config.apiKey,
          Authorization: `Bearer ${session.access_token}`,
        },
      },
    );
    const payload = response.data;
    databaseReady = response.ok && Array.isArray(payload);
    if (!response.ok) {
      const code = payload !== null && typeof payload === "object" && "code" in payload ? payload.code : null;
      // An outage or expired session is not evidence that a migration is missing.
      migrationRequired = typeof code === "string" && ["42703", "42P01", "PGRST204", "PGRST205"].includes(code);
    }
  }

  const statuses = (["portfolio", "technical"] as const).map((scope) => {
    const provider = readAiProvider(scope);
    const status: Status = !provider
      ? "not_configured"
      : !databaseReady
        ? migrationRequired ? "database_migration_required" : "database_unavailable"
        : "ready";
    return {
      scope,
      status,
      provider: provider?.provider ?? null,
      // A configured provider is not a verified or connected model.
      configured: Boolean(provider),
      inferenceVerified: false,
    };
  });

  return NextResponse.json(
    { assistants: statuses, databaseReady, note: "Readiness is a configuration check, not a live inference test." },
    { headers: { "Cache-Control": "no-store" } },
  );
}
