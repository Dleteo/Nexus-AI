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
const otherUserId = "bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb";
const foreignId = "33333333-3333-4333-8333-333333333333";
const mockSecret = "only-a-synthetic-test-secret";
const conversations = new Map([
  [portfolioId, {id:portfolioId,user_id:userId,scope:"portfolio",title:"Nexus Portfolio · Case studies",project_id:null,mode:"assistant",updated_at:"2026-01-01T00:00:00Z"}],
  [technicalId, {id:technicalId,user_id:userId,scope:"technical",title:"Nexus Technical · Hardware",project_id:null,mode:"assistant",updated_at:"2026-02-01T00:00:00Z"}],
  [foreignId, {id:foreignId,user_id:otherUserId,scope:"technical",title:"Private other user conversation",project_id:null,mode:"assistant",updated_at:"2026-02-01T00:00:00Z"}],
]);
for(let index=0;index<51;index++){
  const id=`44444444-4444-4444-8444-${String(index).padStart(12,"0")}`;
  conversations.set(id,{id,user_id:userId,scope:"technical",title:`Extra technical ${index}`,mode:"assistant",project_id:null,updated_at:"2026-03-01T00:00:00Z"});
}
const history=Array.from({length:102},(_,index)=>({
  id:String(index).padStart(4,"0"),
  role:index%2===0?"user":"assistant",
  content:`${index%2===0?"Question":"Answer"} ${Math.floor(index/2)}`,
  created_at:new Date(Date.UTC(2026,0,1,0,Math.floor(index/2))).toISOString(),
}));

let claims = 0;
let saves = 0;
const generations = [];
const mockErrors = [];
let databaseFault = null;
let denyQuota = false;
let saveResult = "ok";
let redirectedRequests = 0;

function selectRows(rows,url){
  const order=(url.searchParams.get("order")??"").split(",").filter(Boolean).map(term=>term.split("."));
  return [...rows].sort((a,b)=>{
    for(const [key,direction] of order){
      const compared=String(a[key]).localeCompare(String(b[key]));
      if(compared)return direction==="desc"?-compared:compared;
    }
    return 0;
  }).slice(0,Number(url.searchParams.get("limit")??rows.length));
}

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
    if(url.pathname==="/should-not-follow"){
      redirectedRequests++;
      return json(res,200,{message:{content:"Redirect followed"}});
    }
    if(databaseFault?.path===url.pathname && (!databaseFault.method||databaseFault.method===req.method)){
      if(databaseFault.mode==="disconnect")return req.socket.destroy();
      if(databaseFault.mode==="stall"){
        res.writeHead(200,{"Content-Type":"application/json"});
        return res.write("["); // Headers arrive, but the body never finishes.
      }
      if(databaseFault.mode==="invalid")return json(res,200,{unexpected:"not an array"});
      if(databaseFault.mode==="invalid_row")return json(res,200,[null]);
    }
    if(url.pathname==="/auth/v1/user" && req.method==="GET"){
      return req.headers.authorization==="Bearer synthetic-access-token"
        ? json(res,200,{id:userId,email:"mock@example.test"})
        : json(res,401,{error:"Invalid token"});
    }
    if(url.pathname==="/auth/v1/token")return json(res,401,{error:"Invalid refresh token"});
    if(url.pathname.startsWith("/rest/v1/assistant_")){
      assert.equal(req.headers.authorization,"Bearer synthetic-access-token");
      assert.equal(req.headers.apikey,"synthetic-publishable");
    }
    if(url.pathname==="/rest/v1/assistant_conversations"){
      const id=url.searchParams.get("id")?.replace(/^eq\./,"");
      const scope=url.searchParams.get("scope")?.replace(/^eq\./,"");
      const owned=[...conversations.values()].filter(row=>row.user_id===userId&&(!id||row.id===id)&&(!scope||row.scope===scope));
      if(req.method==="GET")return json(res,200,selectRows(owned,url));
      if(req.method==="PATCH"){
        const payload=await body(req);
        owned.forEach(row=>{row.mode=payload.mode;});
        return json(res,200,owned);
      }
      if(req.method==="DELETE"){
        owned.forEach(row=>conversations.delete(row.id));
        res.writeHead(204);return res.end();
      }
      if(req.method==="POST"){
        const payload=await body(req);
        assert.equal(payload.user_id,userId);
        const row={...payload,id:"55555555-5555-4555-8555-555555555555",updated_at:"2026-04-01T00:00:00Z"};
        conversations.set(row.id,row);
        return json(res,201,[row]);
      }
    }
    if(url.pathname==="/rest/v1/assistant_messages" && req.method==="GET"){
      const id=url.searchParams.get("conversation_id")?.replace(/^eq\./,"");
      const owned=conversations.get(id)?.user_id===userId;
      return json(res,200,selectRows(owned?history:[],url));
    }
    if(url.pathname==="/rest/v1/rpc/claim_assistant_request_for_user" && req.method==="POST"){
      assert.equal(req.headers.apikey,mockSecret);
      const payload=await body(req);
      assert.equal(payload.p_user_id,userId);
      claims++;
      return json(res,200,[{allowed:!denyQuota,requests_remaining:denyQuota?0:7}]);
    }
    if(url.pathname==="/rest/v1/rpc/save_assistant_exchange_for_user" && req.method==="POST"){
      assert.equal(req.headers.apikey,mockSecret);
      const payload=await body(req);
      assert.equal(payload.p_user_id,userId);
      assert.ok(conversations.has(payload.p_conversation_id));
      assert.ok(typeof payload.p_assistant_content==="string");
      if(saveResult==="error")return json(res,503,{error:mockSecret});
      if(saveResult==="false")return json(res,200,false);
      saves++;
      return json(res,200,true);
    }
    return json(res,404,{error:"Unexpected synthetic Supabase path"});
  }catch(e){mockErrors.push(String(e));return json(res,500,{error:String(e)});}
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
  if(payload.messages?.at(-1)?.content==="simulate malformed response")return json(res,200,{message:{content:{toString:17}}});
  if(payload.messages?.at(-1)?.content==="simulate long response")return json(res,200,{message:{content:"x".repeat(20001)}});
  if(payload.messages?.at(-1)?.content==="simulate redirect"){
    res.writeHead(307,{Location:"http://127.0.0.1:4311/should-not-follow"});return res.end();
  }
  if(payload.messages?.at(-1)?.content==="simulate stalled provider"){
    res.writeHead(200,{"Content-Type":"application/json"});return res.write('{"message":');
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
// Explicit server-only values above take precedence over any compiled public
// values or .env.local defaults. Do not inherit runtime public credentials.
delete env.NEXT_PUBLIC_SUPABASE_URL;
delete env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
delete env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const base="http://127.0.0.1:3113";
function sessionCookie({claimedUser=userId,token="synthetic-access-token"}={}){
  return "nexus_session="+encodeURIComponent(JSON.stringify({
  access_token:token,
  refresh_token:"synthetic-refresh-token",
  expires_at:Math.floor(Date.now()/1000)+3600,
  user:{id:claimedUser,email:"mock@example.test"},
  }));
}
let child;
let logs="";
async function request(path,{method="GET",payload,raw,auth=true,claimedUser,token,timeout=12000}={}){
  const response=await fetch(base+path,{
    method,
    headers:{
      ...(auth?{Cookie:sessionCookie({claimedUser,token})}:{}),
      ...(payload!==undefined||raw!==undefined?{"Content-Type":"application/json"}:{}),
    },
    ...(raw!==undefined?{body:raw}:payload!==undefined?{body:JSON.stringify(payload)}:{}),
    signal:AbortSignal.timeout(timeout),
  });
  return {status:response.status,data:await response.json().catch(()=>({error:"Non-JSON response"}))};
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
  child=spawn(process.execPath,["node_modules/next/dist/bin/next","start","--port","3113"],{env,stdio:["ignore","pipe","pipe"]});
  child.stdout.on("data",chunk=>{logs+=chunk.toString();});
  child.stderr.on("data",chunk=>{logs+=chunk.toString();});
  await ready();
  console.log("Integration server ready");

  console.log("Checking unauthenticated status");
  const unauthenticated=await request("/api/assistant/status",{auth:false});
  assert.equal(unauthenticated.status,401);

  console.log("Checking authenticated readiness");
  const status=await request("/api/assistant/status");
  assert.equal(status.status,200,JSON.stringify(status));
  assert.equal(status.data.databaseReady,true);
  assert.deepEqual(status.data.assistants.map(x=>x.status),["ready","ready"]);
  assert.ok(status.data.assistants.every(x=>x.inferenceVerified===false));
  assert.ok(!JSON.stringify(status.data).includes(mockSecret));

  console.log("Checking malformed inputs before quota or generation");
  const baseline={scope:"technical",conversationId:technicalId,message:"A valid question"};
  for(const message of [123,{},[],null,""]){
    const result=await request("/api/assistant/chat",{method:"POST",payload:{...baseline,message}});
    assert.equal(result.status,400,JSON.stringify({message,result}));
  }
  for(const invalid of [{conversationId:"-".repeat(36)},{conversationId:{}},{mode:[]},{expertise:{}},{scope:{}},{currentResearch:"yes"}]){
    const result=await request("/api/assistant/chat",{method:"POST",payload:{...baseline,...invalid}});
    assert.equal(result.status,400,JSON.stringify({invalid,result}));
  }
  for(const raw of ["null","[]","42","{"]){
    for(const path of ["/api/assistant/chat","/api/assistant/conversations"]){
      const result=await request(path,{method:"POST",raw});
      assert.equal(result.status,400,JSON.stringify({raw,path,result}));
    }
  }
  assert.equal(claims,0);
  assert.equal(generations.length,0);

  console.log("Checking recent history and independent workspace limits");
  const listing=await request("/api/assistant/conversations");
  assert.equal(listing.status,200,JSON.stringify(listing));
  assert.equal(listing.data.conversations.filter(row=>row.scope==="technical").length,50);
  assert.ok(listing.data.conversations.some(row=>row.id===portfolioId),"Recent technical threads hid portfolio history");
  assert.ok(!listing.data.conversations.some(row=>row.id===foreignId));
  const detail=await request(`/api/assistant/conversations/${technicalId}`);
  assert.equal(detail.status,200,JSON.stringify(detail));
  assert.deepEqual(detail.data.messages,history.slice(-100),"History must show the newest messages, with questions before tied-timestamp answers");

  console.log("Checking authentication and cross-owner access");
  const invalidSession=await request("/api/assistant/conversations",{token:"invalid-token"});
  assert.equal(invalidSession.status,401,JSON.stringify(invalidSession));
  for(const method of ["GET","PATCH"]){
    const result=await request(`/api/assistant/conversations/${foreignId}`,{method,...(method==="PATCH"?{payload:{mode:"debug"}}:{})});
    assert.equal(result.status,404,JSON.stringify({method,result}));
  }
  const foreignDelete=await request(`/api/assistant/conversations/${foreignId}`,{method:"DELETE"});
  assert.equal(foreignDelete.status,200,JSON.stringify(foreignDelete));
  assert.ok(conversations.has(foreignId),"DELETE crossed the row owner boundary");
  const foreignChat=await request("/api/assistant/chat",{method:"POST",payload:{...baseline,conversationId:foreignId}});
  assert.equal(foreignChat.status,404,JSON.stringify(foreignChat));
  assert.equal(claims,0,"Invalid or foreign requests consumed quota");

  console.log("Checking quota-free validation");
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

  console.log("Checking portfolio provider and persistence");
  const portfolio=await request("/api/assistant/chat",{method:"POST",payload:{
    scope:"portfolio",conversationId:portfolioId,message:"Give me one evidence-based CV improvement.",
  }});
  assert.equal(portfolio.status,200,JSON.stringify(portfolio));
  assert.match(portfolio.data.answer,/Synthetic local Ollama answer/);
  assert.equal(generations.length,1);
  assert.match(generations[0].messages[0].content,/Nexus Portfolio/);
  assert.match(generations[0].messages[0].content,/never claim you changed/i);
  assert.equal(generations[0].model,"synthetic-test-model");
  assert.deepEqual(generations[0].messages.slice(1,-1).map(({role,content})=>({role,content})),history.slice(-12).map(({role,content})=>({role,content})),"Model history reversed questions and answers with equal timestamps");

  console.log("Checking technical provider and persistence");
  const technical=await request("/api/assistant/chat",{method:"POST",payload:{
    scope:"technical",conversationId:technicalId,expertise:"cybersecurity",
    message:"How do I defend against phishing?",
  }});
  assert.equal(technical.status,200,JSON.stringify(technical));
  assert.equal(generations.length,2);
  assert.match(generations[1].messages[0].content,/defensive cybersecurity/i);
  assert.equal(generations[1].messages.at(-1).content,"How do I defend against phishing?");
  assert.equal(saves,2,"Successful calls were not persisted");

  console.log("Checking model error handling");
  const failure=await request("/api/assistant/chat",{method:"POST",payload:{
    scope:"technical",conversationId:technicalId,message:"simulate upstream error",
  }});
  assert.equal(failure.status,502,JSON.stringify(failure));
  assert.equal(saves,2,"A failed provider response was incorrectly saved");

  console.log("Checking defensive model parsing and loopback redirect isolation");
  for(const message of ["simulate malformed response","simulate long response","simulate redirect"]){
    const result=await request("/api/assistant/chat",{method:"POST",payload:{...baseline,message}});
    assert.ok([502,504].includes(result.status),JSON.stringify({message,result}));
    if(message!=="simulate redirect")assert.equal(result.data.code,"AI_INVALID_RESPONSE");
    assert.equal(saves,2,"An invalid model reply was saved");
  }
  assert.equal(redirectedRequests,0,"A local provider redirect escaped the configured endpoint");

  console.log("Checking quota denial and authoritative session identity");
  denyQuota=true;
  const beforeDenied=generations.length;
  const limited=await request("/api/assistant/chat",{method:"POST",payload:baseline});
  assert.equal(limited.status,429,JSON.stringify(limited));
  assert.equal(generations.length,beforeDenied,"Quota denial still invoked the model");
  denyQuota=false;
  const forgedCookie=await request("/api/assistant/chat",{method:"POST",payload:baseline,claimedUser:otherUserId});
  assert.equal(forgedCookie.status,200,JSON.stringify(forgedCookie));
  // The mock RPC asserts p_user_id is the ID returned by Auth /user, not the cookie.
  assert.equal(saves,3);

  console.log("Checking database outage, incomplete bodies, and persistence failures");
  for(const mode of ["disconnect","invalid","invalid_row"]){
    databaseFault={path:"/rest/v1/assistant_conversations",mode};
    for(const path of ["/api/assistant/conversations",`/api/assistant/conversations/${technicalId}`]){
      const result=await request(path);
      assert.equal(result.status,502,JSON.stringify({mode,path,result}));
    }
    const chat=await request("/api/assistant/chat",{method:"POST",payload:baseline});
    assert.equal(chat.status,502,JSON.stringify(chat));
    assert.ok(!JSON.stringify(chat.data).includes(mockSecret));
  }
  for(const mode of ["invalid_row","stall"]){
    databaseFault={path:"/rest/v1/assistant_messages",mode};
    const result=await request(`/api/assistant/conversations/${technicalId}`);
    assert.equal(result.status,502,JSON.stringify({mode,result}));
    const beforeFault=claims;
    const chat=await request("/api/assistant/chat",{method:"POST",payload:baseline});
    assert.equal(chat.status,502,JSON.stringify(chat));
    assert.equal(claims,beforeFault,"A history failure consumed model quota");
  }
  databaseFault=null;
  for(const outcome of ["error","false"]){
    saveResult=outcome;
    const result=await request("/api/assistant/chat",{method:"POST",payload:baseline});
    assert.equal(result.status,502,JSON.stringify({outcome,result}));
    assert.ok(!JSON.stringify(result.data).includes(mockSecret));
    assert.equal(saves,3,"Failed persistence was reported as a saved exchange");
  }
  saveResult="ok";
  console.log("Checking the provider deadline after partial response headers");
  const beforeTimeout=saves;
  const timedOut=await request("/api/assistant/chat",{method:"POST",payload:{...baseline,message:"simulate stalled provider"},timeout:30000});
  assert.equal(timedOut.status,504,JSON.stringify(timedOut));
  assert.equal(saves,beforeTimeout,"A timed-out provider response was persisted");
  const created=await request("/api/assistant/conversations",{method:"POST",payload:{scope:"portfolio"}});
  assert.equal(created.status,201,JSON.stringify(created));
  const patched=await request(`/api/assistant/conversations/${created.data.conversation.id}`,{method:"PATCH",payload:{mode:"interview"}});
  assert.equal(patched.status,200,JSON.stringify(patched));
  const deleted=await request(`/api/assistant/conversations/${created.data.conversation.id}`,{method:"DELETE"});
  assert.equal(deleted.status,200,JSON.stringify(deleted));
  assert.deepEqual(mockErrors,[],"Synthetic backend assertions failed");

  console.log("PASS authentication, owner/workspace isolation, input validation, history ordering/limits, quota guards, safe model parsing/redirects, database errors/timeouts, and persistence");
  console.log("NOTE this verifies the real Next.js API path against a local synthetic provider, not live model inference.");
}finally{
  if(child&&!child.killed)child.kill("SIGTERM");
  supabase.closeAllConnections();
  ollama.closeAllConnections();
  await Promise.all([new Promise(resolve=>supabase.close(resolve)),new Promise(resolve=>ollama.close(resolve))]);
}
