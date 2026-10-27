/**
 * Infrastructure provider configuration. Nexus retains its product identity,
 * prompts, accounts and user-owned records independently of the model vendor.
 */
import type {AssistantScope} from "./assistant-scopes";
export type AiProvider = "gemini" | "openai" | "ollama";

export function readAiProvider(scope:AssistantScope): { provider: AiProvider; model: string; key: string; endpoint?: string } | null {
  const preferred = scope === "portfolio" ? process.env.AI_PORTFOLIO_PROVIDER : process.env.AI_TECHNICAL_PROVIDER;
  const provider = (preferred?.trim() || process.env.AI_PROVIDER?.trim())?.toLowerCase();
  const geminiKey = process.env.GEMINI_API_KEY?.trim();
  const openaiKey = process.env.OPENAI_API_KEY?.trim();
  if (provider === "gemini" && geminiKey) {
    return {provider, model:process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash", key:geminiKey};
  }
  if (provider === "openai" && openaiKey) {
    return {provider, model:process.env.OPENAI_MODEL?.trim() || "gpt-4.1-mini", key:openaiKey};
  }
  if (provider === "ollama") {
    const url = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
    let parsed: URL;
    try { parsed = new URL(url); } catch { return null; }
    // Restrict local inference to loopback. Never allow arbitrary SSRF targets.
    if(parsed.protocol!=="http:" || !["127.0.0.1","localhost","[::1]"].includes(parsed.hostname)
      || parsed.username || parsed.password || parsed.search || parsed.hash || parsed.pathname!=="/") return null;
    const model=process.env.OLLAMA_MODEL?.trim();
    if(!model) return null;
    return {provider,model,key:"",endpoint:parsed.origin};
  }
  return null;
}
