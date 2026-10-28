/**
 * Pure UI helpers for the four labs. No network, persistence, code execution,
 * simulated payment capture, or background monitoring.
 */

/** Never grant quantities above stock or accept corrupted storage values. */
export function setCartQuantity(cart, products, productId, nextQuantity) {
  const item = Array.isArray(products) ? products.find(p => p.id === productId) : null;
  if (!item || !cart || typeof cart !== "object" || Array.isArray(cart) ||
      !Number.isSafeInteger(nextQuantity) || nextQuantity < 0 ||
      !Number.isSafeInteger(item.stock) || item.stock < 0 ||
      nextQuantity > item.stock ||
      Object.values(cart).some(quantity => !Number.isSafeInteger(quantity) || quantity < 0)) {
    return {ok:false,reason:"invalid-quantity",cart};
  }
  const next = {...cart};
  if (nextQuantity === 0) delete next[productId];
  else next[productId] = nextQuantity;
  return {ok:true,cart:next};
}

/** Only documents exported by Nexus Studio can be imported. No eval/HTML parsing. */
export function parseStudioDocument(raw) {
  if (typeof raw !== "string" || raw.length > 25000) throw new Error("invalid-document");
  let parsed;
  try { parsed = JSON.parse(raw); } catch { throw new Error("invalid-json"); }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed) ||
      parsed.format !== "nexus-studio-document" || parsed.version !== 1 ||
      !["local-sqlite","browser-simulation"].includes(parsed.source) ||
      !Object.prototype.hasOwnProperty.call(parsed,"blocks") ||
      !Array.isArray(parsed.blocks) || parsed.blocks.length > 30) {
    throw new Error("invalid-document");
  }
  const seen = new Set();
  return parsed.blocks.map(block => {
    if (!block || typeof block !== "object" || Array.isArray(block) ||
        Object.keys(block).sort().join(",") !== "id,text,type" ||
        typeof block.id !== "string" || !/^[a-zA-Z0-9_-]{1,80}$/.test(block.id) ||
        seen.has(block.id) || !["hero","text","button"].includes(block.type) ||
        typeof block.text !== "string" || block.text.length > 500 ||
        block.text.includes("\0")) throw new Error("invalid-block");
    seen.add(block.id);
    return {id:block.id,type:block.type,text:block.text};
  });
}

/** Incident streaks on recorded, manually initiated samples only. Latest first. */
export function summarizeManualIncidents(checks, slowThresholdMs = 500) {
  if (!Array.isArray(checks) || !Number.isSafeInteger(slowThresholdMs) || slowThresholdMs < 1) {
    return {sampleCount:0,currentFailures:0,longestFailures:0,slowSamples:0,incidents:0};
  }
  const valid = checks.slice(0,300).filter(check => check &&
    typeof check.ok === "boolean" && Number.isFinite(check.ms) && check.ms >= 0);
  let currentFailures = 0;
  for (const check of valid) {
    if (check.ok) break;
    currentFailures++;
  }
  let longestFailures = 0, run = 0, incidents = 0, slowSamples = 0;
  for (const check of valid) {
    if (!check.ok) {
      if (run === 0) incidents++;
      run++;
      longestFailures = Math.max(longestFailures,run);
    } else {
      run = 0;
      if (check.ms >= slowThresholdMs) slowSamples++;
    }
  }
  return {sampleCount:valid.length,currentFailures,longestFailures,slowSamples,incidents};
}

/** Factory status filters are read-only; no job transitions or side effects. */
export function filterFactoryJobs(jobs, status = "all", search = "") {
  if (!Array.isArray(jobs) || !["all","proposed","approved","built"].includes(status)) return [];
  const term = String(search).trim().toLocaleLowerCase().slice(0,100);
  return jobs.filter(job=>job && typeof job.request === "string" &&
    (status==="all" || job.status===status) &&
    (job.request.toLocaleLowerCase().includes(term) || String(job.id).includes(term)));
}
