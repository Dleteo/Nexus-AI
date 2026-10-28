// Nexus Factory local HTTP integration: real SQLite, approval gate, ZIP and safe content.
import assert from "node:assert/strict";
const origin=process.argv[2]||"http://127.0.0.1:3108";
async function request(method,body,extraHeaders={}){
  const response=await fetch(new URL("/api/labs/factory",origin),{
    method,cache:"no-store",headers:{"Content-Type":"application/json",...extraHeaders},
    ...(body===undefined?{}:{body:JSON.stringify(body)}),
    signal:AbortSignal.timeout(15000),
  });
  return {status:response.status,data:await response.json()};
}
let initial;
for(let attempt=0;attempt<60;attempt++){
  try{const result=await request("GET");if(result.status===200){initial=result;break;}}catch{}
  if(attempt===59)throw new Error("Factory API unavailable");
  await new Promise(resolve=>setTimeout(resolve,400));
}
assert.deepEqual(initial.data.jobs,[]);
const text='<script>alert("hello")</script> Create my sample portfolio';
const created=await request("POST",{action:"propose",request:text,kind:"feature"});
assert.equal(created.status,200,"Plan must be created");
const id=created.data.job.id;
assert.match(id,/^[a-f0-9]{32}$/);
assert.equal(created.data.job.status,"proposed");
assert.equal(created.data.job.downloadReady,false);
assert.deepEqual(created.data.job.plan.files,["index.html","styles.css","README.md","qa-results.json"]);
const cannotBuild=await request("POST",{action:"build",id});
assert.equal(cannotBuild.status,409,"Build must require explicit approval");
const noApproval=await request("POST",{action:"approve",id,confirmed:false});
assert.equal(noApproval.status,409);
const foreign=await request("POST",{action:"approve",id,confirmed:true},{"Origin":"https://attacker.invalid"});
assert.equal(foreign.status,403);
const approved=await request("POST",{action:"approve",id,confirmed:true});
assert.equal(approved.status,200);
assert.equal(approved.data.job.status,"approved");
const compiled=await request("POST",{action:"build",id});
assert.equal(compiled.status,200);
assert.equal(compiled.data.job.status,"built");
assert.equal(compiled.data.job.qa.passed,true);
assert.equal(compiled.data.job.qa.checks.length,6);
assert.equal(compiled.data.job.events.length,5);
const noDouble=await request("POST",{action:"build",id});
assert.equal(noDouble.status,409);
const listing=await request("GET");
assert.equal(listing.data.jobs[0].id,id);
assert.equal(listing.data.jobs[0].downloadReady,true);
const zip=await fetch(new URL("/api/labs/factory?artifact="+id,origin),{cache:"no-store",signal:AbortSignal.timeout(10000)});
assert.equal(zip.status,200);
assert.match(zip.headers.get("content-type")||"",/application\/zip/);
assert.match(zip.headers.get("content-disposition")||"",/attachment/);
const buffer=Buffer.from(await zip.arrayBuffer());
assert.equal(buffer.subarray(0,2).toString(),"PK");
assert.ok(buffer.length>300);
const unknown=await fetch(new URL("/api/labs/factory?artifact=../../etc/passwd",origin),{cache:"no-store"});
assert.equal(unknown.status,404);
console.log("PASS Factory local proposal → approval → deterministic ZIP, QA and cross-origin safety");
