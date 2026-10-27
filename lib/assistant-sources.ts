/**
 * Extract verifiable HTTPS references returned by the configured AI provider.
 * The app never invents citations from its own prompt or from assistant prose.
 */

export type AssistantSource = { uri: string; title?: string };

type GeminiGrounding = {
  candidates?: Array<{
    groundingMetadata?: { groundingChunks?: Array<{ web?: { uri?: string; title?: string } }> };
  }>;
};
type OpenAiOutput = {
  output?: Array<{
    content?: Array<{
      annotations?: Array<{ type?: string; url?: string; title?: string }>;
    }>;
  }>;
};

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
  data: GeminiGrounding & OpenAiOutput,
): AssistantSource[] {
  const entries: Array<AssistantSource | null> =
    provider === "gemini"
      ? (data.candidates?.[0]?.groundingMetadata?.groundingChunks ?? [])
          .map((chunk) => safeSource(chunk.web?.uri, chunk.web?.title))
      : provider === "openai"
        ? (data.output ?? [])
            .flatMap((item) => item.content ?? [])
            .flatMap((item) => item.annotations ?? [])
            .filter((annotation) => annotation.type === "url_citation")
            .map((annotation) => safeSource(annotation.url, annotation.title))
        : [];

  const seen = new Set<string>();
  return entries.filter((source): source is AssistantSource => {
    if (!source || seen.has(source.uri) || seen.size >= 5) return false;
    seen.add(source.uri);
    return true;
  });
}
