"use client";

import { useState } from "react";

type Block =
  | { kind: "code"; language: string; value: string }
  | { kind: "text"; value: string };

function splitCodeFences(value: string): Block[] {
  const result: Block[] = [];
  const pattern = /(?:^|\n)\x60{3}([\w.+-]*)[ \t]*\r?\n([\s\S]*?)\r?\n\x60{3}(?=\n|$)/g;
  let cursor = 0;
  for (const match of value.matchAll(pattern)) {
    const start = match.index ?? 0;
    if (start > cursor) result.push({ kind: "text", value: value.slice(cursor, start) });
    result.push({ kind: "code", language: match[1] || "code", value: match[2] });
    cursor = start + match[0].length;
  }
  if (cursor < value.length) result.push({ kind: "text", value: value.slice(cursor) });
  if (!result.length) result.push({ kind: "text", value });
  return result;
}

function TextLines({ value }: { value: string }) {
  return (
    <div className="space-y-2.5 break-words text-sm leading-7">
      {value.trim().split(/\n{2,}/).map((paragraph, index) => {
        const trimmed = paragraph.trim();
        if (trimmed.startsWith("### ")) return <h4 key={index} className="pt-2 text-sm font-bold text-[#302923]">{trimmed.slice(4)}</h4>;
        if (trimmed.startsWith("## ")) return <h3 key={index} className="pt-2 text-base font-bold text-[#302923]">{trimmed.slice(3)}</h3>;
        if (trimmed.startsWith("# ")) return <h2 key={index} className="pt-2 text-lg font-bold text-[#302923]">{trimmed.slice(2)}</h2>;
        const lines = trimmed.split("\n");
        if (lines.every((line) => /^[-*]\s/.test(line))) {
          return <ul key={index} className="list-disc space-y-1 pl-5">{lines.map((line, li) => <li key={li}>{line.replace(/^[-*]\s/, "")}</li>)}</ul>;
        }
        if (lines.every((line) => /^\d+[.)]\s/.test(line))) {
          return <ol key={index} className="list-decimal space-y-1 pl-5">{lines.map((line, li) => <li key={li}>{line.replace(/^\d+[.)]\s/, "")}</li>)}</ol>;
        }
        return <p key={index} className="whitespace-pre-wrap">{trimmed}</p>;
      })}
    </div>
  );
}

export default function MessageContent({ content }: { content: string }) {
  const [copied, setCopied] = useState<number | null>(null);
  async function copySnippet(value: string, index: number) {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(index);
    } catch {
      setCopied(null);
    }
  }
  return (
    <div className="min-w-0 space-y-3">
      {splitCodeFences(content).map((block, index) => block.kind === "code" ? (
        <div key={index} className="min-w-0 overflow-hidden rounded-xl border border-[#3A3836] bg-[#242424] text-[#F5F1EA]">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-[#30302F] px-3 py-2">
            <span className="truncate text-[11px] font-semibold text-[#E6D7C7]">{block.language}</span>
            <button type="button" onClick={() => void copySnippet(block.value, index)} aria-label={"Copy " + block.language + " code"} className="rounded-md border border-white/20 px-2.5 py-1 text-[11px] font-medium text-white transition hover:bg-white/10">{copied === index ? "Copied!" : "Copy code"}</button>
          </div>
          <pre className="max-w-full overflow-x-auto p-4 text-xs leading-6 sm:text-sm"><code>{block.value}</code></pre>
        </div>
      ) : block.value.trim() ? <TextLines key={index} value={block.value} /> : null)}
    </div>
  );
}
