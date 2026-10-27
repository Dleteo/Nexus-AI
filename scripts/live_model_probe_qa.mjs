import assert from "node:assert/strict";
import http from "node:http";
import {spawn} from "node:child_process";

const requests=[];
const server=http.createServer(async(req,res)=>{
  const chunks=[];for await(const chunk of req)chunks.push(chunk);
  requests.push({path:req.url,payload:JSON.parse(Buffer.concat(chunks).toString())});
  res.writeHead(200,{"Content-Type":"application/json"});
  res.end(JSON.stringify({message:{content:"Synthetic answer: consult official documentation; I have not browsed."}}));
});
await new Promise(resolve=>server.listen(0,"127.0.0.1",resolve));
const port=server.address().port;
const env={...process.env,AI_PROVIDER:"ollama",AI_PORTFOLIO_PROVIDER:"ollama",AI_TECHNICAL_PROVIDER:"ollama",OLLAMA_MODEL:"qa-synthetic",OLLAMA_BASE_URL:`http://127.0.0.1:${port}`};
delete env.NEXUS_LIVE_PROBE;
delete env.NEXUS_ALLOW_CLOUD_LIVE_PROBE;
delete env.NEXUS_LIVE_PROBE_SHOW_ANSWERS;
delete env.NEXUS_LIVE_PROBE_SUITE;

async function run(args,variables){
  return new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,["scripts/live_model_probe.mjs",...args],{env:variables,stdio:["ignore","pipe","pipe"]});
    let log="";for(const stream of [child.stdout,child.stderr])stream.on("data",chunk=>log+=chunk.toString());
    const timer=setTimeout(()=>child.kill("SIGKILL"),9000);
    child.on("error",reject);
    child.on("close",code=>{clearTimeout(timer);resolve({code,log});});
  });
}
try{
  const dry=await run(["--dry-run"],env);
  assert.equal(dry.code,0,dry.log);
  assert.match(dry.log,/DRY RUN: 2 synthetic cases planned, zero requests sent/);
  assert.equal(requests.length,0);
  const denied=await run([],env);
  assert.notEqual(denied.code,0);
  assert.match(denied.log,/No requests sent/);
  assert.equal(requests.length,0);
  const testKey="synthetic-key-do-not-log";
  const cloud=await run([],{...env,AI_PROVIDER:"openai",AI_PORTFOLIO_PROVIDER:"openai",AI_TECHNICAL_PROVIDER:"openai",OPENAI_API_KEY:testKey,NEXUS_LIVE_PROBE:"1"});
  assert.notEqual(cloud.code,0);
  assert.match(cloud.log,/Cloud inference may cost money/);
  assert.ok(!cloud.log.includes(testKey));
  assert.equal(requests.length,0);
  const local=await run([],{...env,NEXUS_LIVE_PROBE:"1"});
  assert.equal(local.code,0,local.log);
  assert.match(local.log,/RESULT 2\/2 responses parsed/);
  assert.equal(requests.length,2);
  assert.ok(!local.log.includes("Synthetic answer"));
  for(const request of requests){
    assert.equal(request.path,"/api/chat");
    assert.equal(request.payload.stream,false);
    assert.equal(request.payload.model,"qa-synthetic");
    assert.equal(request.payload.messages[1].role,"user");
  }
  requests.length=0;
  const extended=await run([],{...env,NEXUS_LIVE_PROBE:"1",NEXUS_LIVE_PROBE_SUITE:"extended"});
  assert.equal(extended.code,0,extended.log);
  assert.match(extended.log,/RESULT 6\/6 responses parsed/);
  assert.equal(requests.length,6);
  console.log("PASS live probe safety gates and 2/6 synthetic cases against isolated loopback server");
}finally{
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
}
