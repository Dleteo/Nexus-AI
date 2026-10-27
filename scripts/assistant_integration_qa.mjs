/**
 * API integration test against the actual Next.js production server.
 * Uses ONLY loopback Supabase/Ollama emulators with synthetic users and text.
 * Never accesses a real provider, user account, database or paid endpoint.
 *
 * Requires `npm run build` to have run before invocation.
 */
import assert from "node:assert/strict";
import http from "node:http";
import {spawn} from "node:child_process";

const userId = "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const portfolioId = "11111111-1111-4111-8111-111111111111";
const technicalId = "22222222-2222-4222-8222-222222222222";
const mockSecret = "only-a-synthetic-test-secret";
const conversations = new Map([
  [portfolioId, {id:portfolioId,scope:"portfolio",title:"Nexus Portfolio · Case studies",project_id:null,mode:"assistant"}],
  [technicalId, {id:technicalId,scope:"technical",title:"Nexus Technical · Hardware",project_id:null,mode:"assistant"}],
]);

let claims = 0;
let saves = 0;
const generations = [];

function json(res,status,data){
  res.writeHead(status,{"Content-Type":"application/json","Cache-Control":"no-store"});
  res.end(JSON.stringify(data));
}
async function body(req){
  const chunks=[];
  for await(const chunk of req){chunks.push(chunk);}
  return chunks.length?JSON.parse(Buffer.concat(chunks).toString("utf8")):{};
}

const supabase=http.createServer(async(req,res)=>{
  const url=new URL(req.url,"http://127.0.0.1");
  try{
    if(url.pathname==="/auth/v1/user" && req.method==="GET"){
      return json(res,200,{id:userId,email:"mock@example.test"});
    }
    if(url.pathname==="/rest/v1/assistant_conversations" && req.method==="GET"){
      const id=url.searchParams.get("id")?.replace(/^eq\./,"");
      return json(res,200,id&&conversations.has(id)?[conversations.get(id)]:[]);
    }
    if(url.pathname==="/rest/v1/assistant_messages" && req.method==="GET"){
      return json(res,200,[{role:"user",content:"Earlier test message"}]);
    }
    if(url.pathname==="/rest/v1/rpc/claim_assistant_request_for_user" && req.method==="POST"){
      assert.equal(req.headers.apikey,mockSecret);
      const payload=await body(req);
      assert.equal(payload.p_user_id,userId);
      claims++;
      return json(res,200,[{allowed:true,requests_remaining:10-claims}]);
    }
    if(url.pathname==="/rest/v1/rpc/save_assistant_exchange_for_user" && req.method==="POST"){
      assert.equal(req.headers.apikey,mockSecret);
      const payload=await body(req);
      assert.equal(payload.p_user_id,userId);
      assert.ok(conversations.has(payload.p_conversation_id));
      assert.ok(typeof payload.p_assistant_content==="string");
      saves++;
      return json(res,200,true);
    }
    return json(res,404,{error:"Unexpected synthetic Supabase path"});
  }catch(e){return json(res,500,{error:String(e)});}
});

const ollama=http.createServer(async(req,res)=>{
  if(req.method!=="POST"||req.url!=="/api/chat"){
    return json(res,404,{error:"Only model chat is mocked"});
  }
  const payload=await body(req);
  generations.push(payload);
  if(payload.messages?.at(-1)?.content==="simulate upstream error"){
    return json(res,503,{error:"Synthetic model is unavailable"});
  }
  return json(res,200,{message:{role:"assistant",content:"Synthetic local Ollama answer; not a real model response."}});
});

async function listen(server,port){
  await new Promise((resolve,reject)=>{
    server.once("error",reject);
    server.listen(port,"127.0.0.1",resolve);
  });
}
const env={
  ...process.env,
  // Prefer the server-only Supabase env variables; NEXT_PUBLIC_* may be
  // compiled at build time and must not be mistaken for live test credentials.
  SUPABASE_URL:"http://127.0.0.1:4311",
  SUPABASE_PUBLISHABLE_KEY:"synthetic-publishable",
  SUPABASE_SECRET_KEY:mockSecret,
  AI_PROVIDER:"ollama",
  AI_PORTFOLIO_PROVIDER:"ollama",
  AI_TECHNICAL_PROVIDER:"ollama",
  OLLAMA_BASE_URL:"http://127.0.0.1:11434",
  OLLAMA_MODEL:"synthetic-test-model",
  NEXT_TELEMETRY_DISABLED:"1",
};
// Public build-time variables must be absent (not empty) so server-only\n// synthetic values take precedence in the production process.\ndelete env.NEXT_PUBLIC_SUPABASE_URL;\ndelete env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;\ndelete env.NEXT_PUBLIC_SUPABASE_ANON_KEY;\nconst base="http://127.0.0.1:3113";
const cookie="nexus_session="+encodeURIComponent(JSON.stringify({
  access_token:"synthetic-access-token",
  refresh_token:"synthetic-refresh-token",
  expires_at:Math.floor(Date.now()/1000)+3600,
  user:{id:userId,email:"mock@example.test"},
}));
let child;
let logs="";
async function request(path,{method="GET",payload,auth=true}={}){
  const response=await fetch(base+path,{
    method,
    headers:{
      ...(auth?{Cookie:cookie}:{}),
      ...(payload?{"Content-Type":"application/json"}:{}),
    },
    ...(payload?{body:JSON.stringify(payload)}:{}),
    signal:AbortSignal.timeout(12000),
  });
  return {status:response.status,data:await response.json()};
}
async function ready(){
  let lastIssue="unknown";
  for(let attempt=0;attempt<100;attempt++){
    if(child.exitCode!==null)throw Error("Next.js production server exited: "+logs.slice(-3000));
    try{
      const res=await fetch(base+"/",{signal:AbortSignal.timeout(1200),redirect:"manual"});
      lastIssue="HTTP "+res.status;
      if(res.status>=200 && res.status<500)return;
    }catch(error){lastIssue=String(error?.cause?.code||error?.message||error);}
    await new Promise(r=>setTimeout(r,150));
  }
  throw Error("Next.js production server not ready ("+lastIssue+"): "+logs.slice(-3000));
}

try{
  await listen(supabase,4311);
  await listen(ollama,11434);
  child=spawn("npm",["run","start","--","--port","3113"],{env,stdio:["ignore","pipe","pipe"]});
  child.stdout.on("data",chunk=>{logs+=chunk.toString();});
  child.stderr.on("data",chunk=>{logs+=chunk.toString();});
  await ready();

  const unauthenticated=await request("/api/assistant/status",{auth:false});
  assert.equal(unauthenticated.status,401);

  const status=await request("/api/assistant/status");
  assert.equal(status.status,200,JSON.stringify(status));
  assert.equal(status.data.databaseReady,true);
  assert.deepEqual(status.data.assistants.map(x=>x.status),["ready","ready"]);
  assert.ok(status.data.assistants.every(x=>x.inferenceVerified===false));
  assert.ok(!JSON.stringify(status.data).includes(mockSecret));

  const before=claims;
  const blockedSearch=await request("/api/assistant/chat",{method:"POST",payload:{
    scope:"technical",conversationId:technicalId,message:"Latest security advisories?",currentResearch:true,
  }});
  assert.equal(blockedSearch.status,400);
  assert.equal(claims,before,"Unsupported local web research used quota");

  const wrongSpace=await request("/api/assistant/chat",{method:"POST",payload:{
    scope:"portfolio",conversationId:technicalId,message:"Please improve my résumé.",
  }});
  assert.equal(wrongSpace.status,403);
  assert.equal(claims,before,"Cross-workspace request used quota");

  const portfolio=await request("/api/assistant/chat",{method:"POST",payload:{
    scope:"portfolio",conversationId:portfolioId,message:"Give me one evidence-based CV improvement.",
  }});
  assert.equal(portfolio.status,200,JSON.stringify(portfolio));
  assert.match(portfolio.data.answer,/Synthetic local Ollama answer/);
  assert.equal(generations.length,1);
  assert.match(generations[0].messages[0].content,/Nexus Portfolio/);
  assert.match(generations[0].messages[0].content,/never claim you changed/i);
  assert.equal(generations[0].model,"synthetic-test-model");

  const technical=await request("/api/assistant/chat",{method:"POST",payload:{
    scope:"technical",conversationId:technicalId,expertise:"cybersecurity",
    message:"How do I defend against phishing?",
  }});
  assert.equal(technical.status,200,JSON.stringify(technical));
  assert.equal(generations.length,2);
  assert.match(generations[1].messages[0].content,/defensive cybersecurity/i);
  assert.equal(generations[1].messages.at(-1).content,"How do I defend against phishing?");
  assert.equal(saves,2,"Successful calls were not persisted");

  const failure=await request("/api/assistant/chat",{method:"POST",payload:{
    scope:"technical",conversationId:technicalId,message:"simulate upstream error",
  }});
  assert.equal(failure.status,502,JSON.stringify(failure));
  assert.equal(saves,2,"A failed provider response was incorrectly saved");

  console.log("PASS signed-in readiness, confidentiality, workspace isolation, quota guards, two simulated provider calls, and server persistence");
  console.log("NOTE this verifies the real Next.js API path against a local synthetic provider, not live model inference.");
}finally{
  if(child&&!child.killed)child.kill("SIGTERM");
  await Promise.all([new Promise(resolve=>supabase.close(resolve)),new Promise(resolve=>ollama.close(resolve))]);
}
