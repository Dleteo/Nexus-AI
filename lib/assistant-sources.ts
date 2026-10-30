/**
 * Extract verifiable HTTPS references returned by the configured AI provider.
 * The app never invents citations from its own prompt or from assistant prose.
 */

export type AssistantSource = { uri: string; title?: string };

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function items(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function safeSource(uri: unknown, title?: unknown): AssistantSource | null {
  if (typeof uri !== "string" || uri.length > 2048) return null;
  try {
    const parsed = new URL(uri);
    if (parsed.protocol !== "https:" || parsed.username || parsed.password) return null;
    // Titles are untrusted provider text; React renders these without executing HTML.
    return {
      uri: parsed.href,
      ...(typeof title === "string" && title.trim() ? { title: title.trim().slice(0, 180) } : {}),
    };
  } catch {
    return null;
  }
}

export function extractGroundingSources(
  provider: "gemini" | "openai" | "ollama",
  data: unknown,
): AssistantSource[] {
  // Successful HTTP responses still contain untrusted JSON. Malformed optional
  // citations must never turn a generated/saved exchange into a failed request.
  const payload = record(data);
  const sources: AssistantSource[] = [];
  const seen = new Set<string>();
  function add(uri: unknown, title: unknown) {
    const source = safeSource(uri, title);
    if (!source || seen.has(source.uri)) return;
    seen.add(source.uri);
    sources.push(source);
  }

  if (provider === "gemini") {
    const candidate = record(items(payload.candidates)[0]);
    const grounding = record(candidate.groundingMetadata);
    for (const chunk of items(grounding.groundingChunks)) {
      const web = record(record(chunk).web);
      add(web.uri, web.title);
      if (sources.length === 5) return sources;
    }
  } else if (provider === "openai") {
    for (const output of items(payload.output)) {
      for (const content of items(record(output).content)) {
        for (const entry of items(record(content).annotations)) {
          const annotation = record(entry);
          if (annotation.type === "url_citation") add(annotation.url, annotation.title);
          if (sources.length === 5) return sources;
        }
      }
    }
  }
  return sources;
}
