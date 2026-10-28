/** HTTP gates for unauthenticated, development-only Labs. These are not peer authentication.
 * Bind Next to 127.0.0.1; do not expose this server through a proxy or LAN listener.
 */
export function localLabsAccess(request, featureFlag) {
  if (process.env.NODE_ENV !== "development" || process.env[featureFlag] !== "1") {
    return { ok: false, reason: "local-backend-disabled", status: 503 };
  }
  const host = request.headers.get("host")?.toLowerCase() || "";
  const match = /^(127\.0\.0\.1|localhost)(?::([1-9][0-9]{0,4}))?$/.exec(host);
  const port = Number(match?.[2] || "80");
  // Next's standard dev server sets PORT to its actual listening port after bind.
  // Never let a forged Host choose Monitor's loopback probe destination.
  const listenerPort = process.env.PORT || "";
  if (!match || !/^[1-9][0-9]{0,4}$/.test(listenerPort) || port !== Number(listenerPort) || port > 65535) {
    return { ok: false, reason: "local-backend-disabled", status: 503 };
  }
  // Forwarding is not a supported way to expose these unauthenticated services.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto");
  if (request.headers.has("forwarded") || (forwardedHost && forwardedHost.toLowerCase() !== host) ||
      (forwardedProto && forwardedProto !== "http")) {
    return { ok: false, reason: "local-backend-disabled", status: 503 };
  }
  const origin = request.headers.get("origin");
  const site = request.headers.get("sec-fetch-site");
  const writing = request.method !== "GET" && request.method !== "HEAD";
  if ((site && site !== "same-origin" && !(site === "none" && !writing)) ||
      (writing && !origin) || (origin !== null && origin !== new URL(`http://${host}`).origin)) {
    return { ok: false, reason: "origin-denied", status: 403 };
  }
  return { ok: true, port: Number(listenerPort) };
}

class BodyFailure extends Error {
  constructor(reason, status) { super(reason); this.status = status; }
}

/** Bound actual UTF-8 bytes while streaming, including chunked bodies and slow senders. */
export async function readLabsJson(request, maxBytes, timeoutMs = 5000) {
  if ((request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase() !== "application/json") {
    return { ok: false, reason: "content-type-required", status: 415 };
  }
  if (request.headers.has("content-encoding") && request.headers.get("content-encoding") !== "identity") {
    return { ok: false, reason: "content-encoding-denied", status: 415 };
  }
  const length = request.headers.get("content-length");
  if (length !== null && (!/^[0-9]+$/.test(length) || Number(length) > maxBytes)) {
    return { ok: false, reason: "request-too-large", status: 413 };
  }
  if (!request.body) return { ok: false, reason: "invalid-json", status: 400 };
  const reader = request.body.getReader();
  let timer;
  let abort;
  try {
    const interrupted = new Promise((_, reject) => {
      timer = setTimeout(() => reject(new BodyFailure("request-timeout", 408)), timeoutMs);
      abort = () => reject(new BodyFailure("request-cancelled", 400));
      request.signal.addEventListener("abort", abort, { once: true });
      if (request.signal.aborted) abort();
    });
    const chunks = [];
    let size = 0;
    while (true) {
      const { done, value } = await Promise.race([reader.read(), interrupted]);
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) throw new BodyFailure("request-too-large", 413);
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return { ok: true, value: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) };
  } catch (error) {
    // Do not wait on an uncooperative sender to acknowledge cancellation.
    void reader.cancel().catch(() => {});
    return { ok: false, reason: error instanceof BodyFailure ? error.message : "invalid-json", status: error instanceof BodyFailure ? error.status : 400 };
  } finally {
    clearTimeout(timer);
    if (abort) request.signal.removeEventListener("abort", abort);
    reader.releaseLock();
  }
}
