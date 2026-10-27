import "server-only";
import {isAssistantScope, type AssistantScope} from "./assistant-scopes";

type AssistantConversation = {
  id: string; title: string; scope: AssistantScope; mode: string;
  project_id: string | null; updated_at?: unknown;
};

export function isAssistantConversation(value: unknown): value is AssistantConversation {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return isUuid(row.id) && typeof row.title === "string" && isAssistantScope(row.scope)
    && typeof row.mode === "string" && ["assistant", "plan", "debug", "explain", "interview"].includes(row.mode)
    && (row.project_id === null || isUuid(row.project_id));
}

export function isAssistantMessage(value: unknown): value is {role: "user" | "assistant"; content: string} {
  if (!value || typeof value !== "object") return false;
  const row = value as Record<string, unknown>;
  return (row.role === "user" || row.role === "assistant") && typeof row.content === "string";
}

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

export async function readAssistantBody(request: Request): Promise<Record<string, unknown> | null> {
  const body: unknown = await request.json().catch(() => null);
  return body !== null && typeof body === "object" && !Array.isArray(body)
    ? body as Record<string, unknown>
    : null;
}

// Bound both response headers and body reads. Never return upstream exception text,
// which can contain server URLs or credentials, to the browser.
export async function fetchAssistantJson(url: string, init: RequestInit = {}) {
  const timeout = AbortSignal.timeout(5000);
  try {
    const response = await fetch(url, {
      ...init,
      signal: init.signal ? AbortSignal.any([init.signal, timeout]) : timeout,
      redirect: "error",
      cache: "no-store",
    });
    const data: unknown = await response.json().catch(() => null);
    return { ok: response.ok && (response.status === 204 || data !== null), status: response.status, data };
  } catch {
    return { ok: false, status: 502, data: null };
  }
}
