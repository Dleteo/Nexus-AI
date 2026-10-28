// Real Next.js dev API -> Python fixed-target HTTP probe -> durable SQLite.
import assert from "node:assert/strict";

const origin = process.argv[2] || "http://127.0.0.1:3108";
async function request(method, data, headers = {}) {
  const response = await fetch(new URL("/api/labs/monitor", origin), {
    method,
    cache: "no-store",
    headers: { "Content-Type": "application/json", Origin:origin, ...headers },
    ...(data===undefined ? {} : {body: JSON.stringify(data)}),
    signal: AbortSignal.timeout(12000),
  });
  return { status: response.status, data: await response.json() };
}
let initial;
for (let attempt=0;attempt<60;attempt++) {
  try { const result=await request("GET");if(result.status===200){initial=result;break;} }catch{}
  if(attempt===59)throw new Error("Monitor API unavailable");
  await new Promise(resolve=>setTimeout(resolve,400));
}
assert.equal(initial.data.mode,"local-sqlite");
assert.equal(initial.data.checks.length,0);
assert.equal(initial.data.alert.level,"unknown");
assert.match(initial.data.scope,/127\.0\.0\.1/);
const result=await request("POST",{url:"http://external.example/anything",action:"scan"});
assert.equal(result.status,200,"Local probe should be recorded");
assert.equal(result.data.checks.length,1);
assert.equal(result.data.checks[0].ok,true,"Nexus local health endpoint should respond healthy");
assert.equal(result.data.checks[0].statusCode,200);
assert.equal(result.data.checks[0].note,"healthy");
assert.equal(result.data.alert.level,"healthy");
assert.equal(result.data.alert.successPercent,100);
const persisted=await request("GET");
assert.equal(persisted.data.checks[0].id,result.data.checks[0].id,"Probe must be stored on disk");
assert.equal(persisted.data.checks.length,1);
const second=await request("POST",{});
assert.equal(second.status,200);
assert.equal(second.data.checks.length,2);
assert.ok(second.data.checks[0].id>second.data.checks[1].id);
const crossOrigin=await request("POST",{},{"Origin":"https://external.example"});
assert.equal(crossOrigin.status,403,"Cross-site probe requests must be rejected");
const withoutType=await fetch(new URL("/api/labs/monitor",origin),{
  method:"POST",body:"{}",headers:{"Content-Type":"text/plain",Origin:origin},signal:AbortSignal.timeout(8000),
});
assert.equal(withoutType.status,415);
console.log("PASS Nexus Monitor fixed-target HTTP probes, persistent history, alert calculations and origin checks");
