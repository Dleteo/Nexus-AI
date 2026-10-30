/**
 * Explicit, read-only provider connectivity diagnostics.
 * Run locally: node scripts/check-provider.mjs
 * No prompts, user messages, keys, or model generations are transmitted.
 * Cloud calls are not made unless NEXUS_CHECK_CLOUD=1 is set.
 */
const scopes=["portfolio","technical"];
const selected=(scope)=>process.env[scope==="portfolio"?"AI_PORTFOLIO_PROVIDER":"AI_TECHNICAL_PROVIDER"]||process.env.AI_PROVIDER;
let failed=false;
for(const scope of scopes){
 const provider=selected(scope);
 if(!["ollama","gemini","openai"].includes(provider)){
  console.log(`${scope}: not configured`);failed=true;continue;
 }
 if(provider==="ollama"){
  const address=process.env.OLLAMA_BASE_URL||"http://127.0.0.1:11434";
  const url=new URL(address);
  if(url.protocol!=="http:"||!["127.0.0.1","localhost","[::1]"].includes(url.hostname)||
     url.pathname!=="/"||url.search||url.hash||url.username||url.password){
   console.error(`${scope}: unsafe local endpoint`);failed=true;continue;
  }
  try {
   const res=await fetch(new URL("/api/tags",url),{signal:AbortSignal.timeout(4000)});
   if(!res.ok)throw Error(`HTTP ${res.status}`);
   const data=await res.json();
   const model=process.env.OLLAMA_MODEL;
   const installed=(data.models||[]).some(x=>x.name===model||x.model===model);
   console.log(`${scope}: local Ollama reachable; requested model ${installed?"installed":"not installed"}`);
   if(!installed)failed=true;
  }catch{console.log(`${scope}: local Ollama not reachable`);failed=true;}
 }else{
  const key=process.env[provider==="gemini"?"GEMINI_API_KEY":"OPENAI_API_KEY"];
  if(!key){console.log(`${scope}: ${provider} API key not configured`);failed=true;continue;}
  if(process.env.NEXUS_CHECK_CLOUD!=="1"){
   console.log(`${scope}: ${provider} key configured; cloud connectivity not tested (set NEXUS_CHECK_CLOUD=1 to opt in)`);
   continue;
  }
  const url=provider==="gemini"?"https://generativelanguage.googleapis.com/v1beta/models?pageSize=1":"https://api.openai.com/v1/models";
  const headers=provider==="gemini"?{"x-goog-api-key":key}:{Authorization:`Bearer ${key}`};
  try{
   const res=await fetch(url,{headers,signal:AbortSignal.timeout(5000)});
   console.log(`${scope}: ${provider} models endpoint returned HTTP ${res.status}`);
   if(!res.ok)failed=true;
  }catch{console.log(`${scope}: ${provider} models endpoint unreachable`);failed=true;}
 }
}
if(failed)process.exitCode=1;
