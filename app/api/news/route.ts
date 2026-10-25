import { NextResponse } from "next/server";

export const runtime = "nodejs";

type Headline = { title: string; url: string; date: string | null; source: string };
const SOURCES = [
  { url: "https://github.blog/changelog/feed/", host: "github.blog", name: "GitHub Changelog" },
  { url: "https://developer.mozilla.org/en-US/blog/rss.xml", host: "developer.mozilla.org", name: "MDN Web Docs" },
] as const;

function decodeText(value: string): string {
  return value.replace(/<[^>]*>/g, "").replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim().slice(0, 240);
}

function tag(xml: string, name: string): string {
  const found = xml.match(new RegExp("<" + name + "(?:\\s[^>]*)?>([\\s\\S]*?)<\\/" + name + ">", "i"));
  return found?.[1] ?? "";
}

function parseItems(xml: string, host: string, source: string): Headline[] {
  const blocks = xml.match(/<item(?:\s[^>]*)?>[\s\S]*?<\/item>/gi) ?? [];
  return blocks.slice(0, 8).flatMap((item) => {
    const title = decodeText(tag(item, "title"));
    const address = decodeText(tag(item, "link"));
    let url: URL;
    try { url = new URL(address); } catch { return []; }
    if (url.protocol !== "https:" || url.hostname !== host || !title) return [];
    const rawDate = decodeText(tag(item, "pubDate"));
    const timestamp = Date.parse(rawDate);
    return [{ title, url: url.toString(), date: Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : null, source }];
  });
}

export async function GET() {
  const results = await Promise.all(SOURCES.map(async (source) => {
    try {
      const response = await fetch(source.url, {
        next: { revalidate: 900 },
        signal: AbortSignal.timeout(6500),
        headers: { Accept: "application/rss+xml, application/xml, text/xml" },
      });
      if (!response.ok) return [] as Headline[];
      const xml = (await response.text()).slice(0, 500_000);
      return parseItems(xml, source.host, source.name);
    } catch { return [] as Headline[]; }
  }));
  const headlines = results.flat().sort((a, b) => Date.parse(b.date ?? "") - Date.parse(a.date ?? "") || 0).slice(0, 12);
  return NextResponse.json({ headlines, live: headlines.length > 0, updatedAt: new Date().toISOString(), note: "Original source articles are authoritative; automatic summaries are not generated." });
}
