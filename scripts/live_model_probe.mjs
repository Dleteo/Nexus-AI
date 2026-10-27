/**
 * Optional, deliberately opt-in live model smoke test for Nexus AI.
 * Uses only synthetic prompts. No Supabase, stored chats, telemetry or files.
 * Dry run: node scripts/live_model_probe.mjs --dry-run
 * Actual calls require NEXUS_LIVE_PROBE=1. Cloud calls additionally require
 * NEXUS_ALLOW_CLOUD_LIVE_PROBE=1 and may incur provider fees.
 */
const cases = Object.freeze({
  portfolio: [
    {id: "portfolio-evidence", prompt: "Estoy preparando un portafolio junior. Da dos consejos concretos para mejorar un caso de estudio sin inventar experiencia ni resultados."},
  ],
  technical: [
    {id: "programming", prompt: "En JavaScript, explica el resultado de [1, 2, 3].map(x => x * 2) y cómo comprobarlo sin ejecutar código."},
    {id: "hardware", prompt: "Un equipo no muestra imagen después de cambiar la RAM. Da dos comprobaciones reversibles y seguras sin asegurar compatibilidad sin el modelo exacto."},
    {id: "software", prompt: "Una actualización del sistema operativo causa fallos al iniciar. Propón comprobaciones no destructivas y un criterio para detenerse."},
    {id: "cybersecurity", prompt: "Un correo sospechoso pide contraseña. Da consejos de prevención y respuesta defensiva sin solicitar datos privados."},
    {id: "freshness", prompt: "Un usuario dice que una vulnerabilidad de firmware publicada hoy afecta todos los equipos. No tienes búsqueda web. Explica cómo verificarlo con avisos del fabricante, CISA KEV y NVD, y evita afirmar que es cierto."},
  ],
});
const help = `Usage:
  node scripts/live_model_probe.mjs --dry-run
  NEXUS_LIVE_PROBE=1 node scripts/live_model_probe.mjs
  NEXUS_LIVE_PROBE=1 NEXUS_ALLOW_CLOUD_LIVE_PROBE=1 node scripts/live_model_probe.mjs
Optional: NEXUS_LIVE_PROBE_SUITE=extended for all technical categories (5 technical + 1 portfolio calls).
No user data or credentials are printed. An actual cloud call may incur fees.`;

function configuration(scope) {
  const raw = (process.env[scope === "portfolio" ? "AI_PORTFOLIO_PROVIDER" : "AI_TECHNICAL_PROVIDER"]?.trim()
    || process.env.AI_PROVIDER?.trim() || "").toLowerCase();
  if (!(["ollama", "gemini", "openai"].includes(raw))) throw Error(`${scope}: set AI_${scope.toUpperCase()}_PROVIDER or AI_PROVIDER explicitly`);
  if (raw === "ollama") {
    const configured = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
    let url;
    try { url = new URL(configured); } catch { throw Error(`${scope}: invalid Ollama URL`); }
    if (url.protocol !== "http:" || !["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)
      || url.username || url.password || url.pathname !== "/" || url.search || url.hash) {
      throw Error(`${scope}: Ollama must run at a loopback-only HTTP endpoint`);
    }
    const model = process.env.OLLAMA_MODEL?.trim();
    if (!model) throw Error(`${scope}: OLLAMA_MODEL is missing`);
    return {scope, provider:raw, model, url: url.origin, key:""};
  }
  const key = process.env[raw === "gemini" ? "GEMINI_API_KEY" : "OPENAI_API_KEY"]?.trim();
  if (!key) throw Error(`${scope}: ${raw} API key missing`);
  const model = (raw === "gemini" ? process.env.GEMINI_MODEL : process.env.OPENAI_MODEL)?.trim()
    || (raw === "gemini" ? "gemini-2.5-flash" : "gpt-4.1-mini");
  return {scope, provider:raw, model, key, url:""};
}

async function limitedJson(url, options) {
  const response = await fetch(url, {...options, redirect:"error", cache:"no-store", signal:AbortSignal.timeout(90000)});
  const reader=response.body?.getReader();
  let bytes=0, raw="";
  try {
    const decoder=new TextDecoder("utf-8",{fatal:true});
    while(reader){
      const {done,value}=await reader.read();
      if(done) break;
      bytes+=value.byteLength;
      if(bytes>1024*1024) { void reader.cancel().catch(()=>{}); throw Error("Provider response exceeds 1 MiB"); }
      raw+=decoder.decode(value,{stream:true});
    }
    raw+=decoder.decode();
  } finally {reader?.releaseLock();}
  if (!response.ok) throw Error(`Provider returned HTTP ${response.status} (no error details or secrets logged)`);
  try {return JSON.parse(raw);} catch {throw Error("Provider returned non-JSON content");}
}

function answerText(provider,data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return "";
  if (provider === "ollama") return typeof data.message?.content === "string" ? data.message.content.trim() : "";
  if (provider === "gemini") return (Array.isArray(data.candidates?.[0]?.content?.parts)
    ? data.candidates[0].content.parts.map(part=>typeof part?.text==="string"?part.text:"").join("") : "").trim();
  if (typeof data.output_text === "string" && data.output_text.trim()) return data.output_text.trim();
  return (Array.isArray(data.output) ? data.output.flatMap(x=>Array.isArray(x?.content)?x.content:[])
    .filter(x=>x?.type==="output_text"&&typeof x.text==="string")
    .map(x=>x.text).join("") : "").trim();
}

async function generate(config,prompt) {
  const system="You are a Nexus AI testing instance. Reply in Spanish with practical, correct advice. Do not pretend to browse, execute code, verify live facts or access private data.";
  const {provider,key,model,url}=config;
  if (provider === "ollama") return limitedJson(`${url}/api/chat`,{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({model,stream:false,messages:[{role:"system",content:system},{role:"user",content:prompt}],options:{num_predict:320}}),
  });
  if (provider === "gemini") return limitedJson(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,{
    method:"POST",headers:{"x-goog-api-key":key,"Content-Type":"application/json"},
    body:JSON.stringify({systemInstruction:{parts:[{text:system}]},contents:[{role:"user",parts:[{text:prompt}]}],generationConfig:{maxOutputTokens:500}}),
  });
  return limitedJson("https://api.openai.com/v1/responses",{
    method:"POST",headers:{Authorization:`Bearer ${key}`,"Content-Type":"application/json"},
    body:JSON.stringify({model,instructions:system,input:[{role:"user",content:prompt}],max_output_tokens:500,store:false}),
  });
}

async function main() {
  if (process.argv.slice(2).includes("--help")) {console.log(help);return;}
  if (process.argv.slice(2).some(x=>x!=="--dry-run")) throw Error("Only --dry-run is supported; choose optional suite through environment variables");
  const dryRun=process.argv.slice(2).includes("--dry-run");
  const extended=process.env.NEXUS_LIVE_PROBE_SUITE === "extended";
  if (process.env.NEXUS_LIVE_PROBE_SUITE && !["smoke","extended"].includes(process.env.NEXUS_LIVE_PROBE_SUITE)) throw Error("Invalid probe suite");
  const selected = ["portfolio","technical"].map(configuration);
  const probes = selected.flatMap(c=>(c.scope==="portfolio"?cases.portfolio:(extended?cases.technical:cases.technical.slice(0,1)))
    .map(item=>({config:c,case:item})));
  // Validate every provider and user opt-in before sending a single request.
  if (!dryRun && process.env.NEXUS_LIVE_PROBE !== "1") throw Error("No requests sent. Set NEXUS_LIVE_PROBE=1 to opt in to real model generation.");
  if (!dryRun && selected.some(c=>c.provider!=="ollama") && process.env.NEXUS_ALLOW_CLOUD_LIVE_PROBE!=="1") {
    throw Error("No requests sent. Cloud inference may cost money; also set NEXUS_ALLOW_CLOUD_LIVE_PROBE=1.");
  }
  for(const item of probes) console.log(`${dryRun?"PLAN":"PROBE"} ${item.config.scope}/${item.case.id}: ${item.config.provider} model=${item.config.model}`);
  if(dryRun){console.log(`DRY RUN: ${probes.length} synthetic cases planned, zero requests sent.`);return;}
  let failed=0;
  for(const item of probes) {
    const started=Date.now();
    try {
      const data=await generate(item.config,item.case.prompt);
      const response=answerText(item.config.provider,data);
      if(!response || Array.from(response).length>20000) throw Error("Empty or oversized generated answer");
      console.log(`PASS ${item.config.scope}/${item.case.id} response_chars=${Array.from(response).length} elapsed_ms=${Date.now()-started}`);
      if(process.env.NEXUS_LIVE_PROBE_SHOW_ANSWERS==="1") console.log(`ANSWER ${item.case.id}: ${response.slice(0,1800)}`);
    } catch(error) {
      failed++;
      // Do not print upstream error bodies or endpoint/credential strings.
      const reason=error instanceof Error && /Provider returned HTTP \d{3}|Provider response exceeds 1 MiB|Provider returned non-JSON content|Empty or oversized generated answer/.test(error.message)
        ? error.message : "Provider request failed or timed out";
      console.error(`FAIL ${item.config.scope}/${item.case.id}: ${reason}`);
    }
  }
  console.log(`RESULT ${probes.length-failed}/${probes.length} responses parsed. This is not a factual accuracy or current-events certification.`);
  if(failed) process.exitCode=1;
}

main().catch(error=>{console.error(error instanceof Error?error.message:"Probe failed");process.exitCode=1;});
