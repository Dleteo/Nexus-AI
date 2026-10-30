// Adversarial requests against the real Next dev routes. Uses only disposable local databases.
import assert from "node:assert/strict";
import http from "node:http";
import { once } from "node:events";

const base = new URL(process.argv[2] || "http://127.0.0.1:3108");
assert.equal(base.protocol, "http:");
assert.ok(["127.0.0.1", "localhost"].includes(base.hostname));
function call(lab, { method = "POST", headers = {}, body = "{}", chunks } = {}) {
  return new Promise((resolve, reject) => {
    const values = { "content-type": "application/json", origin: base.origin, ...headers };
    for (const name of Object.keys(values)) if (values[name] === null) delete values[name];
    const req = http.request(new URL(`/api/labs/${lab}`, base), { method, headers: values }, response => {
      let raw = "";
      response.setEncoding("utf8");
      response.on("data", chunk => { raw += chunk; });
      response.on("end", () => resolve({ status: response.statusCode, raw, headers: response.headers }));
    });
    req.on("error", reject);
    req.setTimeout(12000, () => req.destroy(new Error("security-qa-timeout")));
    if (method === "GET") req.end();
    else if (chunks) { for (const chunk of chunks) req.write(chunk); req.end(); }
    else req.end(body);
  });
}

// A forged local Host must not turn Monitor into a probe for other local services.
let decoyConnections = 0;
const decoy = http.createServer((_, response) => { response.end("decoy"); });
decoy.on("connection", () => { decoyConnections += 1; });
decoy.listen(0, "127.0.0.1");
await once(decoy, "listening");
try {
  const result = await call("monitor", {
    headers: { host: `127.0.0.1:${decoy.address().port}`, origin: `http://127.0.0.1:${decoy.address().port}` },
  });
  assert.equal(result.status, 503, "Monitor must use its configured listener port, not a supplied Host port");
  assert.equal(decoyConnections, 0, "Forged port must never reach the other local HTTP service");
} finally {
  await new Promise(resolve => decoy.close(resolve));
}

for (const lab of ["commerce", "studio", "monitor", "factory"]) {
  const initial = await call(lab, { method: "GET", headers: { origin: null } });
  assert.equal(initial.status, 200, `${lab} must be enabled with a disposable database`);
  const otherLocalOrigin = new URL(base);
  otherLocalOrigin.hostname = base.hostname === "localhost" ? "127.0.0.1" : "localhost";
  for (const origin of [null, "null", "https://attacker.invalid", `${base.origin}/path`, otherLocalOrigin.origin]) {
    assert.equal((await call(lab, { headers: { origin } })).status, 403, `${lab} Origin ${origin}`);
  }
  for (const site of ["cross-site", "same-site"]) {
    assert.equal((await call(lab, { headers: { "sec-fetch-site": site } })).status, 403, `${lab} POST ${site}`);
    assert.equal((await call(lab, { method: "GET", headers: { origin: null, "sec-fetch-site": site } })).status, 403, `${lab} GET ${site}`);
  }
  for (const host of ["evil.test", "localhost:3108:evil", "127.0.0.1:65536"]) {
    const denied = await call(lab, { method: "GET", headers: { host, origin: null } });
    assert.ok([400, 503].includes(denied.status), `${lab} malformed/nonlocal Host ${host}: ${denied.status}`);
  }
  for (const headers of [{ "x-forwarded-host": "evil.test" }, { "x-forwarded-proto": "https" }, { forwarded: "host=localhost" }]) {
    assert.equal((await call(lab, { headers })).status, 503, `${lab} forwarded authority`);
  }
  for (const type of ["text/plain", "application/x-www-form-urlencoded", "application/jsonp"]) {
    assert.equal((await call(lab, { headers: { "content-type": type } })).status, 415, `${lab} media type ${type}`);
  }
  assert.equal((await call(lab, { headers: { "content-encoding": "gzip" } })).status, 415);
  assert.equal((await call(lab, { body: "{" })).status, 400, `${lab} malformed JSON`);
  const chunks = ['{"x":"', "💡".repeat(6000), '"}'];
  assert.equal((await call(lab, { chunks })).status, 413, `${lab} chunked UTF-8 byte overflow`);
  const after = await call(lab, { method: "GET", headers: { origin: null } });
  assert.equal(after.status, 200);
  assert.deepEqual(JSON.parse(after.raw), JSON.parse(initial.raw), `${lab} denied requests must not change local records`);
  assert.equal(after.headers["cache-control"], "no-store");
}
console.log("PASS four real local APIs reject forged authority, CSRF, bad types and chunked overflow without writes");
