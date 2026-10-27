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
// A hostile or misconfigured upstream must not stream unbounded JSON into memory.
// Ordinary assistant messages, history and provider metadata fit well within 4 MiB.
const MAX_UPSTREAM_JSON_BYTES = 4 * 1024 * 1024;

export async function fetchAssistantJson(url: string, init: RequestInit = {}, timeoutMs = 5000) {
  type Result = {ok: boolean; status: number; data: unknown};
  const controller = new AbortController();
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  let expire!: (result: Result) => void;
  const timeout = new Promise<Result>(resolve => { expire = resolve; });
  const abort = () => {
    controller.abort(init.signal?.reason);
    // Cancel our own reader as well: aborting fetch alone does not reliably
    // unblock a JSON body read on all supported Node/Undici versions.
    void reader?.cancel().catch(() => {});
    expire({ok: false, status: 504, data: null});
  };
  const timer = setTimeout(abort, timeoutMs);
  if (init.signal?.aborted) abort();
  else init.signal?.addEventListener("abort", abort, {once: true});
  try {
    const work = (async (): Promise<Result> => {
      try {
        const response = await fetch(url, {
          ...init, signal: controller.signal, redirect: "error", cache: "no-store",
        });
        reader = response.body?.getReader();
        const decoder = new TextDecoder();
        let text = "";
        let receivedBytes = 0;
        while (reader) {
          const {done, value} = await reader.read();
          if (done) break;
          receivedBytes += value.byteLength;
          if (receivedBytes > MAX_UPSTREAM_JSON_BYTES) {
            controller.abort();
            void reader.cancel().catch(() => {});
            return {ok: false, status: 502, data: null};
          }
          text += decoder.decode(value, {stream: true});
        }
        text += decoder.decode();
        let data: unknown = null;
        try { data = JSON.parse(text); } catch { /* Invalid JSON is an upstream failure. */ }
        return {ok: response.ok && (response.status === 204 || data !== null), status: response.status, data};
      } catch {
        return {ok: false, status: 502, data: null};
      } finally {
        reader?.releaseLock();
      }
    })();
    // This deadline covers headers AND body parsing even if an underlying fetch
    // implementation fails to settle after abort. The work promise handles errors.
    return await Promise.race([timeout, work]);
  } finally {
    clearTimeout(timer);
    init.signal?.removeEventListener("abort", abort);
  }
}
