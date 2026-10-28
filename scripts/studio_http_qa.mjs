// Real Next.js dev API ↔ Python ↔ SQLite, with an isolated temporary database.
import assert from "node:assert/strict";
const origin = process.argv[2] || "http://127.0.0.1:3109";
async function call(method, payload, extraHeaders={}) {
  const response = await fetch(new URL("/api/labs/studio", origin), {
    method,
    headers: {"Content-Type":"application/json",...extraHeaders},
    ...(payload===undefined?{}:{body:JSON.stringify(payload)}),
    cache:"no-store",signal:AbortSignal.timeout(10000),
  });
  return {status:response.status,data:await response.json()};
}
let initial;
for(let attempt=0;attempt<60;attempt++){
  try{const response=await call("GET");if(response.status===200){initial=response;break;}}catch{}
  if(attempt===59)throw new Error("Local Studio API unavailable");
  await new Promise(resolve=>setTimeout(resolve,400));
}
assert.equal(initial.data.mode,"local-sqlite");
assert.equal(initial.data.revision,0);
const edited=[{id:"hero-1",type:"hero",text:"Saved through the API"}];
let result=await call("POST",{action:"save",expectedRevision:0,blocks:edited});
assert.equal(result.status,200,"First save must succeed");
assert.equal(result.data.revision,1);
assert.deepEqual(result.data.blocks,edited);
result=await call("GET");
assert.equal(result.data.revision,1,"Saved revision must be durable");
assert.equal(result.data.blocks[0].text,"Saved through the API");
const oldVersion=await call("POST",{action:"save",expectedRevision:0,blocks:edited});
assert.equal(oldVersion.status,409,"Stale save must not overwrite");
assert.equal(oldVersion.data.reason,"revision-conflict");
const bad=await call("POST",{action:"save",expectedRevision:1,blocks:[{id:"bad id",type:"iframe",text:"x"}]});
assert.equal(bad.status,400,"Disallowed block and id must be rejected");
const crossSite=await call("POST",{action:"save",expectedRevision:1,blocks:edited},{Origin:"https://outside.example"});
assert.equal(crossSite.status,403,"Cross-origin editing must be rejected");
result=await call("POST",{action:"restore",expectedRevision:1,revision:0});
assert.equal(result.status,200);
assert.equal(result.data.revision,2,"Restore must create a new revision");
assert.equal(result.data.blocks.length,3,"Restore must load original document");
assert.deepEqual(result.data.revisions.map(x=>x.revision),[2,1,0]);
console.log("PASS Studio Next.js API: durable saves, conflict handling, validation, restore, and origin guard");
