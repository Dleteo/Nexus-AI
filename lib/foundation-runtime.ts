import { spawn } from "node:child_process";
import { isAbsolute, win32 } from "node:path";

type TechnicalMode = "guide" | "sources";
export type FoundationResponse = {
  answer: string;
  sources: Array<{ name: string; url: string }>;
  backend: "technical-guides" | "verified-sources";
};

// The private Python project runs in the *same local machine* as the Next.js
// dev server. Never allow client messages to set executable paths or the cwd.
function isSafeAbsolute(value: string | undefined): value is string {
  return typeof value === "string" && value.length > 3 && value.length <= 1024
    && !value.includes("\0") && !value.startsWith("\\\\") && !value.startsWith("//")
    && (isAbsolute(value) || win32.isAbsolute(value));
}

export function configuredFoundation(): boolean {
  return process.env.NODE_ENV === "development"
    && isSafeAbsolute(process.env.NEXUS_FOUNDATION_PYTHON)
    && isSafeAbsolute(process.env.NEXUS_FOUNDATION_ROOT);
}

export async function runFoundationTechnical(
  query: string, mode: TechnicalMode, signal?: AbortSignal,
): Promise<FoundationResponse | null> {
  if (!configuredFoundation() || signal?.aborted || mode !== "guide" && mode !== "sources"
    || typeof query !== "string" || !query.trim() || query.length > 4000) return null;
  const payload = Buffer.from(JSON.stringify({query, mode}), "utf8");
  if (payload.byteLength > 16384) return null;

  return new Promise(resolve => {
    let child: ReturnType<typeof spawn>;
    try {
      child = spawn(process.env.NEXUS_FOUNDATION_PYTHON!, ["-B", "-m", "nexus_app.technical_stdio"], {
        cwd: process.env.NEXUS_FOUNDATION_ROOT!,
        shell: false, windowsHide: true,
        stdio: ["pipe", "pipe", "ignore"],
        env: {...process.env, PYTHONDONTWRITEBYTECODE: "1"},
      });
    } catch { resolve(null); return; }
    const chunks: Buffer[] = [];
    let bytes = 0, settled = false;
    const complete = (result: FoundationResponse | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      signal?.removeEventListener("abort", abort);
      if (result === null) child.kill();
      resolve(result);
    };
    const abort = () => complete(null);
    const timer = setTimeout(abort, 6000);
    signal?.addEventListener("abort", abort, {once:true});
    child.on("error", abort);
    child.stdout!.on("data", (chunk: Buffer) => {
      bytes += chunk.byteLength;
      if (bytes > 128 * 1024) { complete(null); return; }
      chunks.push(chunk);
    });
    child.on("close", code => {
      if (settled || code !== 0) { complete(null); return; }
      try {
        const parsed: unknown = JSON.parse(Buffer.concat(chunks).toString("utf8"));
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) { complete(null); return; }
        const row = parsed as Record<string, unknown>;
        if (row.neural_inference !== false || row.live_web_lookup !== false
          || row.filesystem_mutation !== false
          || row.backend !== (mode === "guide" ? "technical-guides" : "verified-sources")
          || typeof row.answer !== "string" || !row.answer.trim()
          || [...row.answer].length > 20000 || !Array.isArray(row.sources)
          || row.sources.length > 30) { complete(null); return; }
        const sources: Array<{name:string;url:string}> = [];
        for (const entry of row.sources) {
          if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
          const item = entry as Record<string, unknown>;
          if (typeof item.url === "string" && typeof item.name === "string"
            && item.name.length <= 180 && item.url.length <= 2048) {
            sources.push({name:item.name,url:item.url});
          }
        }
        complete({answer:row.answer, sources, backend:row.backend as FoundationResponse["backend"]});
      } catch { complete(null); }
    });
    child.stdin!.on("error", abort);
    child.stdin!.end(payload);
  });
}
