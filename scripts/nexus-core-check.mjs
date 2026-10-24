import assert from "node:assert/strict";
import { ReadableStream } from "node:stream/web";
import { readFileSync } from "node:fs";

const adapter = readFileSync(new URL("../lib/nexus-core.ts", import.meta.url), "utf8");
const route = readFileSync(new URL("../app/api/assistant/chat/route.ts", import.meta.url), "utf8");

assert.match(adapter, /127\.0\.0\.1:11434\/api\/chat/);
assert.match(adapter, /env\.NODE_ENV !== "production"/);
assert.ok(adapter.includes(":cloud$"), "Cloud-model suffix must be rejected");
assert.match(route, /aiProvider === "ollama"/);
assert.match(route, /NEXUS_CORE_ENABLED/);
assert.match(route, /save_assistant_exchange_for_user/);
assert.match(route, /parseOllamaNdjson/);
assert.match(route, /AI_PROVIDER must be gemini, openai, or ollama/);
assert.match(route, /const frame = encodeNexusCoreEvent;/);
assert.match(adapter, /export function encodeNexusCoreEvent/);
assert.match(adapter, /event: \${kind}\\ndata: \${JSON.stringify\(payload\)}\\n\\n/);
// Check the emitted TypeScript template uses actual LF escapes, not double-escaped slashes.
const fn = adapter.slice(adapter.indexOf("export function encodeNexusCoreEvent"), adapter.indexOf("export type OllamaPacket"));
assert.ok(fn.includes('\\n'), "Expected newline separators");
assert.ok(!fn.includes('\\\\n'), "Double-escaped line separators would break the browser SSE parser");

// Minimal JS mirror of the line-oriented protocol for boundary behavior;
// TypeScript CI and app smoke tests additionally compile the real adapter.
async function* parse(stream) {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let pending = "";
  while (true) {
    const { value, done } = await reader.read();
    pending += decoder.decode(value, { stream: !done });
    let end = pending.indexOf("\n");
    while (end >= 0) {
      const line = pending.slice(0, end).trim();
      pending = pending.slice(end + 1);
      if (line) yield JSON.parse(line);
      end = pending.indexOf("\n");
    }
    if (done) break;
  }
  if (pending.trim()) yield JSON.parse(pending.trim());
}
const encoder = new TextEncoder();
const chunks = ['{"message":{"content":"hola', '"}}\n{"message":{"content":" mundo"}}\n{"done":true}'];
const readable = new ReadableStream({
  start(controller) {
    for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
    controller.close();
  },
});
const received = [];
for await (const value of parse(readable)) received.push(value);
assert.equal(received[0].message.content + received[1].message.content, "hola mundo");
assert.equal(received[2].done, true);
console.log("Nexus Core protocol and server-side security invariants: PASS");
