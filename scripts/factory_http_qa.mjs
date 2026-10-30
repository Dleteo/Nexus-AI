// Nexus Factory local HTTP integration: real SQLite, approval gate, ZIP and safe content.
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
const origin=process.argv[2]||"http://127.0.0.1:3108";
const executionNotRun={enabled:false,status:"not_run",reason:"isolation_not_verified"};
function assertSnapshot(preview){
  assert.deepEqual(preview.execution,executionNotRun);
  const digest=createHash("sha256").update(Buffer.from("nexus-factory-snapshot:v1\0","ascii"));
  let totalBytes=0;
  for(const file of [...preview.files].sort((a,b)=>Buffer.compare(Buffer.from(a.name),Buffer.from(b.name)))){
    const name=Buffer.from(file.name,"utf8");
    const content=Buffer.from(file.content,"utf8");
    const pathLength=Buffer.alloc(4);pathLength.writeUInt32BE(name.length);
    const contentLength=Buffer.alloc(8);contentLength.writeBigUInt64BE(BigInt(content.length));
    digest.update(pathLength).update(name).update(contentLength).update(content);
    totalBytes+=content.length;
  }
  assert.deepEqual(preview.snapshot,{sha256:digest.digest("hex"),fileCount:preview.files.length,totalBytes});
}
async function request(method,body,extraHeaders={}){
  const response=await fetch(new URL("/api/labs/factory",origin),{
    method,cache:"no-store",headers:{"Content-Type":"application/json",Origin:origin,...extraHeaders},
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
const created=await request("POST",{action:"propose",request:text,kind:"feature",execution:{enabled:true,status:"passed"}});
assert.equal(created.status,200,"Plan must be created");
const id=created.data.job.id;
assert.match(id,/^[a-f0-9]{32}$/);
assert.equal(created.data.job.status,"proposed");
assert.equal(created.data.job.downloadReady,false);
assert.deepEqual(created.data.job.execution,executionNotRun);
assert.deepEqual(created.data.job.plan.files,["index.html","styles.css","README.md","qa-results.json","manifest.json"]);
const previewResponse=await fetch(new URL("/api/labs/factory?preview="+id,origin),{signal:AbortSignal.timeout(10000)});
assert.equal(previewResponse.status,200,"Pre-approval source preview must work");
const previewData=await previewResponse.json();
assertSnapshot(previewData.preview);
assert.deepEqual(previewData.preview.files.map(file=>file.name),["index.html","styles.css","README.md"]);
assert.equal(previewData.preview.qa.passed,true);
assert.match(previewData.preview.files[0].content,/&lt;script&gt;/);
assert.match(previewData.preview.files[0].sha256,/^[a-f0-9]{64}$/);
const cannotBuild=await request("POST",{action:"build",id});
assert.equal(cannotBuild.status,409,"Build must require explicit approval");
const noApproval=await request("POST",{action:"approve",id,confirmed:false});
assert.equal(noApproval.status,409);
const foreign=await request("POST",{action:"approve",id,confirmed:true},{"Origin":"https://attacker.invalid"});
assert.equal(foreign.status,403);
const approved=await request("POST",{action:"approve",id,confirmed:true,execution:{enabled:true,status:"passed"}});
assert.equal(approved.status,200);
assert.equal(approved.data.job.status,"approved");
assert.deepEqual(approved.data.job.execution,executionNotRun);
const compiled=await request("POST",{action:"build",id});
assert.equal(compiled.status,200);
assert.equal(compiled.data.job.status,"built");
assert.equal(compiled.data.job.qa.passed,true);
assert.deepEqual(compiled.data.job.execution,executionNotRun,"Static QA must never assert execution passed");
assert.equal(compiled.data.job.qa.checks.length,6);
assert.equal(compiled.data.job.events.length,5);
const noDouble=await request("POST",{action:"build",id});
assert.equal(noDouble.status,409);
const listing=await request("GET");
assert.equal(listing.data.jobs[0].id,id);
assert.equal(listing.data.jobs[0].downloadReady,true);
assert.deepEqual(listing.data.jobs[0].execution,executionNotRun);
const afterBuild=await fetch(new URL("/api/labs/factory?preview="+id,origin),{signal:AbortSignal.timeout(10000)});
assert.equal(afterBuild.status,200);
const builtPreview=(await afterBuild.json()).preview;
assertSnapshot(builtPreview);
assert.deepEqual(builtPreview.snapshot,previewData.preview.snapshot,"Approval/build must not change source snapshot");
for(const action of ["execute","run","test"]){
  const denied=await request("POST",{action,id,execution:{enabled:true,status:"passed"}});
  assert.equal(denied.status,400,"There must be no execution action before isolation is verified");
}
const zip=await fetch(new URL("/api/labs/factory?artifact="+id,origin),{cache:"no-store",signal:AbortSignal.timeout(10000)});
assert.equal(zip.status,200);
assert.match(zip.headers.get("content-type")||"",/application\/zip/);
assert.match(zip.headers.get("content-disposition")||"",/attachment/);
const buffer=Buffer.from(await zip.arrayBuffer());
assert.equal(buffer.subarray(0,2).toString(),"PK");
assert.ok(buffer.length>300);
assert.ok(buffer.includes(Buffer.from("manifest.json")),"ZIP should include an integrity manifest");
const unknown=await fetch(new URL("/api/labs/factory?artifact=../../etc/passwd",origin),{cache:"no-store"});
assert.equal(unknown.status,404);
const different=await request("POST",{action:"propose",request:"A different fixed template request to check snapshot identity",kind:"feature"});
assert.equal(different.status,200);
const otherPreview=await fetch(new URL("/api/labs/factory?preview="+different.data.job.id,origin),{signal:AbortSignal.timeout(10000)});
assert.equal(otherPreview.status,200);
const otherData=await otherPreview.json();
assertSnapshot(otherData.preview);
assert.notEqual(otherData.preview.snapshot.sha256,previewData.preview.snapshot.sha256);
console.log("PASS Factory local proposal → approval → deterministic ZIP, static QA, inert snapshot and execution not_run");
