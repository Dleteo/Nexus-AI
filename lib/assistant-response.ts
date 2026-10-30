import type { AiProvider } from "./ai-runtime";

function record(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

function items(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/** Read provider JSON without trusting its shape; keep the database text limit. */
export function readAssistantAnswer(provider: AiProvider, data: unknown): string | null {
  const payload = record(data);
  let text: unknown;
  if (provider === "ollama") {
    text = record(payload.message).content;
  } else if (provider === "gemini") {
    const candidate = record(items(payload.candidates)[0]);
    text = items(record(candidate.content).parts)
      .map((part) => record(part).text)
      .filter((part): part is string => typeof part === "string")
      .join("");
  } else {
    text = typeof payload.output_text === "string" && payload.output_text.trim()
      ? payload.output_text
      : items(payload.output)
          .flatMap((output) => items(record(output).content))
          .map((content) => record(content))
          .filter((content) => content.type === "output_text" && typeof content.text === "string")
          .map((content) => content.text)
          .join("");
  }
  if (typeof text !== "string") return null;
  const answer = text.trim();
  if (!answer) return null;
  // PostgreSQL char_length counts Unicode code points, not UTF-16 code units.
  let length = 0;
  for (const character of answer) {
    void character;
    if (++length > 20_000) return null;
  }
  return answer;
}
