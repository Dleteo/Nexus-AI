import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");

async function importTs(path, dependencies = {}) {
  const source = readFileSync(path, "utf8");
  const transpiled = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod={exports:{}};
  new Function("module","exports","require",transpiled)(mod,mod.exports,
    (name) => Object.hasOwn(dependencies,name) ? dependencies[name] : require(name));
  return mod.exports;
}
const {extractGroundingSources}=await importTs("lib/assistant-sources.ts");
const assistantScopes=await importTs("lib/assistant-scopes.ts");
const assistantApi=await importTs("lib/assistant-api.ts",{"server-only":{},"./assistant-scopes":assistantScopes});
const supabaseModule=await importTs("lib/supabase.ts",{"server-only":{},"./assistant-api":assistantApi});
const {getSupabaseConfig,getValidSession}=supabaseModule;
const supabaseVariables=["SUPABASE_URL","SUPABASE_PUBLISHABLE_KEY","SUPABASE_ANON_KEY","NEXT_PUBLIC_SUPABASE_URL","NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY","NEXT_PUBLIC_SUPABASE_ANON_KEY"];
const previousSupabaseVariables=new Map(supabaseVariables.map(name=>[name,process.env[name]]));
try {
  for (const name of supabaseVariables) delete process.env[name];
  assert.equal(getSupabaseConfig(),null);
  process.env.NEXT_PUBLIC_SUPABASE_URL="https://public.example.test/";
  assert.equal(getSupabaseConfig(),null);
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY="public-anon";
  assert.deepEqual(getSupabaseConfig(),{url:"https://public.example.test",apiKey:"public-anon"});
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="public-publishable";
  assert.equal(getSupabaseConfig().apiKey,"public-publishable");
  process.env.SUPABASE_URL="http://127.0.0.1:4311/";
  process.env.SUPABASE_ANON_KEY="server-anon";
  assert.deepEqual(getSupabaseConfig(),{url:"http://127.0.0.1:4311",apiKey:"server-anon"});
  process.env.SUPABASE_PUBLISHABLE_KEY="server-publishable";
  assert.deepEqual(getSupabaseConfig(),{url:"http://127.0.0.1:4311",apiKey:"server-publishable"});
  delete process.env.SUPABASE_URL;
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  assert.equal(getSupabaseConfig(),null);
} finally {
  for (const [name,value] of previousSupabaseVariables) {
    if (value===undefined) delete process.env[name];
    else process.env[name]=value;
  }
}
// Incoming assistant JSON must be bounded even when sent as a stream
// without Content-Length, and Unicode JSON must still decode correctly.
const requestPayload = JSON.stringify({message:"ñ 😀",scope:"technical"});
assert.deepEqual(await assistantApi.readAssistantBody(new Request("http://local.test",{
  method:"POST",headers:{"Content-Type":"application/json"},body:requestPayload,
})),{message:"ñ 😀",scope:"technical"});
assert.equal(await assistantApi.readAssistantBody(new Request("http://local.test",{
  method:"POST",headers:{"Content-Length":"999999"},body:"{}",
})),null);
assert.equal(await assistantApi.readAssistantBody(new Request("http://local.test",{
  method:"POST",body:JSON.stringify({message:"x".repeat(65536)}),
})),null);
assert.equal(await assistantApi.readAssistantBody(new Request("http://local.test",{
  method:"POST",body:"[]",
})),null);

const {readAssistantAnswer}=await importTs("lib/assistant-response.ts");
const providerAnswers={
  ollama:text=>({message:{content:text}}),
  gemini:text=>({candidates:[{content:{parts:[{text}]}}]}),
  openai:text=>({output:[{content:[{type:"output_text",text}]}]}),
};
for (const [provider,response] of Object.entries(providerAnswers)) {
  assert.equal(readAssistantAnswer(provider,response("  Test answer  ")),"Test answer");
  assert.equal(readAssistantAnswer(provider,response(" ")),null);
  assert.equal(readAssistantAnswer(provider,response("x".repeat(20_000))),"x".repeat(20_000));
  assert.equal(readAssistantAnswer(provider,response("x".repeat(20_001))),null);
  assert.equal(readAssistantAnswer(provider,response("😀".repeat(20_000))),"😀".repeat(20_000));
  assert.equal(readAssistantAnswer(provider,response("😀".repeat(20_001))),null);
  for (const malformed of [null,[],42,"invalid",{message:{content:{}}},
    {candidates:{}},{candidates:[null]},{candidates:[{content:{parts:{}}}]},
    {candidates:[{content:{parts:[null,{text:42}]}}]},
    {output_text:{},output:{}},{output:[null,{content:{}},{content:[null,{type:"output_text",text:42}]}]},
  ]) assert.equal(readAssistantAnswer(provider,malformed),null);
}
assert.equal(readAssistantAnswer("gemini",{candidates:[{content:{parts:[null,{text:"First "},{text:42},{text:"answer"}]}}]}),"First answer");
assert.equal(readAssistantAnswer("openai",{output_text:" Direct answer "}),"Direct answer");
assert.equal(readAssistantAnswer("openai",{output_text:{},output:[null,{content:[null,{type:"refusal",text:"hidden"},{type:"output_text",text:"Answer"}]}]}),"Answer");
const gemini=extractGroundingSources("gemini",{candidates:[{groundingMetadata:{groundingChunks:[
 {web:{uri:"https://www.cisa.gov/known-exploited-vulnerabilities-catalog",title:"CISA"}},
 {web:{uri:"javascript:alert(1)",title:"Unsafe"}},
 {web:{uri:"https://www.cisa.gov/known-exploited-vulnerabilities-catalog",title:"Duplicate"}},
]}}]});
assert.equal(gemini.length,1);
assert.equal(gemini[0].title,"CISA");
const openai=extractGroundingSources("openai",{output:[{content:[{annotations:[
 {type:"url_citation",url:"https://nvd.nist.gov",title:"NIST NVD"},
 {type:"other",url:"https://example.com",title:"Other"}
]}]}]});
assert.equal(openai.length,1);
assert.equal(openai[0].uri,"https://nvd.nist.gov/");
assert.deepEqual(extractGroundingSources("ollama",{}),[]);
for (const malformed of [null, [], 42, "invalid", {candidates:{}}, {candidates:[null]},
 {candidates:[{groundingMetadata:{groundingChunks:{}}}]},
 {candidates:[{groundingMetadata:{groundingChunks:[null, {web:42}]}}]},
 {output:{}}, {output:[null, {content:{}}, {content:[null, {annotations:{}}]}]},
 {output:[{content:[{annotations:[null, 42, {type:"url_citation",url:{}}]}]}]}]) {
  assert.deepEqual(extractGroundingSources("gemini",malformed),[]);
  assert.deepEqual(extractGroundingSources("openai",malformed),[]);
}
const citations=extractGroundingSources("openai",{output:[null,{content:[null,{annotations:[
 null, {type:"url_citation",url:"https://user:secret@example.com/"},
 {type:"url_citation",url:"http://example.com/"},
 ...Array.from({length:8},(_,i)=>({type:"url_citation",url:`https://example.com/${i}`,title:" x ".repeat(200)})),
]}]}]});
assert.equal(citations.length,5);
assert.equal(citations[0].uri,"https://example.com/0");
assert.equal(citations[0].title.length,180);

const {readAiProvider}=await importTs("lib/ai-runtime.ts");
const providerVariables=["AI_PROVIDER","AI_PORTFOLIO_PROVIDER","AI_TECHNICAL_PROVIDER","GEMINI_API_KEY","GEMINI_MODEL","OPENAI_API_KEY","OPENAI_MODEL","OLLAMA_BASE_URL","OLLAMA_MODEL"];
const previousVariables=new Map(providerVariables.map(name=>[name,process.env[name]]));
const originalFetch=globalThis.fetch;
try {
  for (const name of providerVariables) delete process.env[name];
  assert.equal(readAiProvider("technical"),null);
  Object.assign(process.env,{AI_PROVIDER:" openai ",OPENAI_API_KEY:" test-key ",OPENAI_MODEL:" ",AI_PORTFOLIO_PROVIDER:"ollama",OLLAMA_MODEL:" local-model "});
  assert.deepEqual(readAiProvider("technical"),{provider:"openai",model:"gpt-4.1-mini",key:"test-key"});
  assert.deepEqual(readAiProvider("portfolio"),{provider:"ollama",model:"local-model",key:"",endpoint:"http://127.0.0.1:11434"});
  process.env.AI_TECHNICAL_PROVIDER=" ";
  assert.equal(readAiProvider("technical").provider,"openai");
  process.env.OPENAI_API_KEY=" ";
  assert.equal(readAiProvider("technical"),null);
  process.env.AI_TECHNICAL_PROVIDER="gemini";
  process.env.GEMINI_API_KEY=" ";
  assert.equal(readAiProvider("technical"),null);
  process.env.GEMINI_API_KEY="test-gemini";
  assert.equal(readAiProvider("technical").provider,"gemini");
  for (const endpoint of ["https://localhost:11434","http://example.com:11434","http://127.0.0.1:11434/path","http://user:secret@localhost:11434","http://localhost:11434?target=remote","http://localhost:11434/#fragment"]) {
    process.env.OLLAMA_BASE_URL=endpoint;
    assert.equal(readAiProvider("portfolio"),null,`Reject unsafe local endpoint ${endpoint}`);
  }
  for (const endpoint of ["http://localhost:11434","http://127.0.0.1:11434","http://[::1]:11434"]) {
    process.env.OLLAMA_BASE_URL=endpoint;
    assert.equal(readAiProvider("portfolio").provider,"ollama");
  }
  process.env.OLLAMA_MODEL=" ";
  assert.equal(readAiProvider("portfolio"),null);

  const dependencies={
    "../../../../lib/session":{readSession:async()=>({access_token:"test-session"})},
    "../../../../lib/supabase":{getSupabaseConfig:()=>({url:"http://database.test",apiKey:"test-publishable"})},
    "../../../../lib/ai-runtime":{readAiProvider:()=>({provider:"ollama",model:"local-model",key:"",endpoint:"http://127.0.0.1:11434"})},
    "../../../../lib/assistant-api":assistantApi,
  };
  const {GET}=await importTs("app/api/assistant/status/route.ts",dependencies);
  for (const [response,expected] of [
    [()=>Response.json([]),"ready"],
    [()=>Response.json({unexpected:"response"}),"database_unavailable"],
    [()=>new Response("invalid JSON"),"database_unavailable"],
    [()=>Response.json({code:"42703"},{status:400}),"database_migration_required"],
    [()=>Response.json({code:"PGRST205"},{status:404}),"database_migration_required"],
    [()=>Response.json({code:"PGRST301"},{status:401}),"database_unavailable"],
    [()=>Response.json({error:"maintenance"},{status:503}),"database_unavailable"],
    [()=>{throw new Error("timeout");},"database_unavailable"],
  ]) {
    globalThis.fetch=async()=>response();
    const result=await GET();
    assert.equal(result.status,200);
    assert.equal(result.headers.get("cache-control"),"no-store");
    const payload=await result.json();
    assert.equal(payload.databaseReady,expected==="ready");
    assert.equal(payload.assistants.length,2);
    for (const assistant of payload.assistants) {
      assert.equal(assistant.status,expected);
      assert.equal(assistant.inferenceVerified,false);
      assert.equal("key" in assistant,false);
      assert.equal("endpoint" in assistant,false);
    }
  }
  const {GET:signedOutStatus}=await importTs("app/api/assistant/status/route.ts",{
    ...dependencies,
    "../../../../lib/session":{readSession:async()=>null},
  });
  globalThis.fetch=async()=>{assert.fail("Signed-out readiness must not query the database");};
  assert.equal((await signedOutStatus()).status,401);

  // These fetch mocks deliberately ignore AbortSignal, as a stalled upstream
  // body must still be bounded independently of fetch cancellation behavior.
  globalThis.fetch=async()=>new Promise(()=>{});
  const neverResponded=await assistantApi.fetchAssistantJson("http://local.test",{},25);
  assert.equal(neverResponded.status,504);
  assert.equal(neverResponded.ok,false);
  let cancelled=false;
  globalThis.fetch=async()=>new Response(new ReadableStream({
    start(controller){controller.enqueue(new TextEncoder().encode("["));},
    cancel(){cancelled=true;},
  }));
  const incompleteBody=await assistantApi.fetchAssistantJson("http://local.test",{},25);
  assert.equal(incompleteBody.status,504);
  assert.equal(incompleteBody.ok,false);
  assert.equal(cancelled,true,"Timed-out body reader was not cancelled");
  const controller=new AbortController();
  globalThis.fetch=async()=>new Promise(()=>{});
  const cancelledRequest=assistantApi.fetchAssistantJson("http://local.test",{signal:controller.signal},1000);
  controller.abort();
  assert.equal((await cancelledRequest).status,504);

  // Reject unbounded streamed JSON before decoding it into a giant string.
  let overSizeCancelled=false;
  globalThis.fetch=async()=>new Response(new ReadableStream({
    start(controller){controller.enqueue(new Uint8Array(4*1024*1024+1));},
    cancel(){overSizeCancelled=true;},
  }));
  const oversized=await assistantApi.fetchAssistantJson("http://local.test",{},200);
  assert.equal(oversized.status,502);
  assert.equal(oversized.ok,false);
  assert.equal(overSizeCancelled,true,"Oversized response body reader must be cancelled");

  const auth=await importTs("lib/supabase.ts",{
    "server-only":{},
    "./assistant-api":{fetchAssistantJson:async()=>({ok:false,status:504,data:null})},
  });
  const authEnv=new Map(supabaseVariables.map(name=>[name,process.env[name]]));
  try {
    process.env.SUPABASE_URL="http://database.test";
    process.env.SUPABASE_PUBLISHABLE_KEY="test-publishable";
    const session={access_token:"test-session",refresh_token:"test-refresh",expires_at:Math.floor(Date.now()/1000)+3600,user:{id:"untrusted-cookie-id"}};
    assert.equal(await auth.getValidSession(session),null,"Auth timeout accepted an unverified session");
    globalThis.fetch=async()=>Response.json({id:"verified-user"});
    assert.equal((await getValidSession(session)).user.id,"verified-user");
    globalThis.fetch=async()=>Response.json({unexpected:"no user ID"});
    assert.equal(await getValidSession(session),null);
    globalThis.fetch=async()=>Response.json({access_token:"new-session",refresh_token:"new-refresh",expires_in:3600,user:{id:"verified-user"}});
    assert.equal((await getValidSession({...session,expires_at:0})).access_token,"new-session");
    globalThis.fetch=async()=>Response.json({access_token:{},refresh_token:"new-refresh",user:{id:"verified-user"}});
    assert.equal(await getValidSession({...session,expires_at:0}),null);
  } finally {
    for (const [name,value] of authEnv) {
      if (value===undefined) delete process.env[name];
      else process.env[name]=value;
    }
  }
} finally {
  globalThis.fetch=originalFetch;
  for (const [name,value] of previousVariables) {
    if (value===undefined) delete process.env[name];
    else process.env[name]=value;
  }
}
const route=readFileSync("app/api/assistant/chat/route.ts","utf8");
assert.ok(route.indexOf('currentResearch && aiProvider === "ollama"') < route.indexOf('claim_assistant_request_for_user'));
assert.match(route,/conversation\.scope !== scope/);
console.log("PASS defensive citations, provider isolation, bounded headers/body reads, auth, readiness diagnostics and early safety gates (simulated responses only)");
