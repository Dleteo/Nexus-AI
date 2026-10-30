// Offline regressions for the common local HTTP boundary; no backend execution.
import assert from "node:assert/strict";
import { localLabsAccess, readLabsJson } from "../lib/labs-http.mjs";

const base = "http://127.0.0.1:3108";
const oldEnvironment = process.env.NODE_ENV;
const oldFlag = process.env.NEXUS_LABS_FACTORY;
const oldPort = process.env.PORT;
function request(method = "POST", headers = {}, body = "{}", signal) {
  const values = { host: "127.0.0.1:3108", origin: base, "content-type": "application/json", ...headers };
  for (const name of Object.keys(values)) if (values[name] === null) delete values[name];
  return new Request(base, { method, headers: values, signal, ...(method === "GET" ? {} : { body, duplex: "half" }) });
}
function access(req) { return localLabsAccess(req, "NEXUS_LABS_FACTORY"); }
try {
  process.env.NODE_ENV = "development";
  process.env.NEXUS_LABS_FACTORY = "1";
  process.env.PORT = "3108";
  assert.deepEqual(access(request()), { ok: true, port: 3108 });
  assert.equal(access(request("GET", { origin: null })).ok, true);
  assert.equal(access(request("GET", { origin: null, "sec-fetch-site": "none" })).ok, true);
  assert.equal(access(request("POST", { host: "localhost:3108", origin: "http://localhost:3108" })).ok, true);
  for (const host of [null, "localhost:3108:evil", "localhost:0", "localhost:65536", "localhost:00080", "localhost:3109", "localhost.", "127.0.0.1.evil", "localhost@evil", "localhost/path", "[::1]:3108", "127.1:3108", "evil.test"]) {
    assert.equal(access(request("GET", { host, origin: null })).status, 503, `Host ${host}`);
  }
  for (const origin of [null, "null", "https://127.0.0.1:3108", "http://127.0.0.1:3109", "http://localhost:3108", `${base}/path`, `${base}/`, `http://user@127.0.0.1:3108`, `${base}.evil`]) {
    assert.equal(access(request("POST", { origin })).status, 403, `Origin ${origin}`);
  }
  for (const method of ["GET", "POST"]) {
    for (const site of ["cross-site", "same-site"]) {
      assert.equal(access(request(method, { "sec-fetch-site": site })).status, 403);
    }
  }
  assert.equal(access(request("POST", { "sec-fetch-site": "none" })).status, 403);
  assert.equal(access(request("GET", { origin: "https://evil.test" })).status, 403);
  assert.equal(access(request("GET", { "x-forwarded-host": "evil.test" })).status, 503);
  assert.equal(access(request("GET", { "x-forwarded-proto": "https" })).status, 503);
  assert.equal(access(request("GET", { forwarded: "host=localhost:3108" })).status, 503);
  assert.equal(access(request("GET", { "x-forwarded-host": "127.0.0.1:3108", "x-forwarded-proto": "http" })).ok, true);
  for (const environment of ["test", "production"]) {
    process.env.NODE_ENV = environment;
    assert.equal(access(request()).status, 503);
  }
  process.env.NODE_ENV = "development";
  delete process.env.PORT;
  assert.equal(access(request()).status, 503, "Unknown listener port must fail closed");
  process.env.PORT = "3108";
  delete process.env.NEXUS_LABS_FACTORY;
  assert.equal(access(request()).status, 503);
} finally {
  if (oldEnvironment === undefined) delete process.env.NODE_ENV; else process.env.NODE_ENV = oldEnvironment;
  if (oldFlag === undefined) delete process.env.NEXUS_LABS_FACTORY; else process.env.NEXUS_LABS_FACTORY = oldFlag;
  if (oldPort === undefined) delete process.env.PORT; else process.env.PORT = oldPort;
}

assert.deepEqual(await readLabsJson(request(), 2), { ok: true, value: {} });
assert.equal((await readLabsJson(request("POST", { "content-type": "application/jsonp" }), 20)).status, 415);
assert.equal((await readLabsJson(request("POST", { "content-type": "text/plain" }), 20)).status, 415);
assert.equal((await readLabsJson(request("POST", { "content-encoding": "gzip" }), 20)).status, 415);
assert.equal((await readLabsJson(request("POST", { "content-length": "500" }), 20)).status, 413);
assert.equal((await readLabsJson(request("POST", {}, "{"), 20)).reason, "invalid-json");
assert.equal((await readLabsJson(request("POST", {}, new Uint8Array([0xff])), 20)).reason, "invalid-json");
// A small declared size cannot bypass the bound on actual bytes (including multibyte text).
assert.equal((await readLabsJson(request("POST", { "content-length": "2" }, JSON.stringify("💡".repeat(8))), 20)).status, 413);
let cancelled = false;
const manyChunks = new ReadableStream({
  pull(controller) { controller.enqueue(new TextEncoder().encode("0123456789")); },
  cancel() { cancelled = true; },
});
assert.equal((await readLabsJson(request("POST", {}, manyChunks), 25)).status, 413);
assert.equal(cancelled, true, "Oversized chunked sender must be cancelled");
const slow = new ReadableStream({ cancel() { cancelled = true; } });
assert.equal((await readLabsJson(request("POST", {}, slow), 25, 20)).reason, "request-timeout");
const controller = new AbortController();
const aborted = readLabsJson(request("POST", {}, new ReadableStream({}), controller.signal), 25);
controller.abort();
assert.equal((await aborted).reason, "request-cancelled");
console.log("PASS local Host/Origin/CSRF, production gates, streamed byte limits, timeout and cancellation (offline)");
