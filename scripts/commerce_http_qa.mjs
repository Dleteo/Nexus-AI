// Local development-only HTTP integration of Next.js and real SQLite.
// CI starts Next dev with NEXUS_LABS_SQLITE=1 and a disposable database.
import assert from "node:assert/strict";

const origin = process.argv[2] || "http://127.0.0.1:3108";
async function call(method,body,extraHeaders={}) {
  const response=await fetch(new URL("/api/labs/commerce",origin),{
    method,headers:{"Content-Type":"application/json",...extraHeaders},
    ...(body===undefined?{}:{body:JSON.stringify(body)}),
    cache:"no-store",signal:AbortSignal.timeout(10000),
  });
  return {status:response.status,data:await response.json()};
}
for(let i=0;i<50;i++){
  try{const r=await call("GET");if(r.status===200)break;}catch{}
  if(i===49)throw new Error("Local SQLite API did not start");
  await new Promise(resolve=>setTimeout(resolve,400));
}
let response=await call("GET");
assert.equal(response.status,200);
assert.equal(response.data.mode,"local-sqlite");
assert.equal(response.data.inventory.length,4);
response=await call("POST",{cart:{"keyboard":2}});
assert.equal(response.status,200);
assert.equal(response.data.inventory[0].stock,6);
assert.equal(response.data.orders[0].total,158);
const firstId=response.data.orderId;
response=await call("GET");
assert.equal(response.data.orders[0].id,firstId,"Orders must survive between requests");
assert.equal(response.data.inventory[0].stock,6);
response=await call("POST",{cart:{"keyboard":7}});
assert.equal(response.status,409,"Overselling must return conflict");
response=await call("GET");
assert.equal(response.data.inventory[0].stock,6,"Failed order must not change stock");
response=await call("POST",{cart:{"keyboard":1}},{Origin:"https://untrusted.example"});
assert.equal(response.status,403,"Cross-origin POST must be rejected");
response=await call("POST",{cart:{"keyboard":-1}});
assert.equal(response.status,400,"Invalid quantity must be rejected");
console.log("PASS Next.js development API + durable SQLite checkout, stock, and origin guard");
