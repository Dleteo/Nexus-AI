/**
 * Offline evidence exports for Nexus Labs. This module has no IO or side effects.
 * Its output is a local snapshot, not evidence that any automated test was run.
 */
const safeInt = (value, max = Number.MAX_SAFE_INTEGER) =>
  Number.isSafeInteger(value) && value >= 0 && value <= max;

const csv = (value) => '"' + String(value).replaceAll('"', '""') + '"';
const escapeMd = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
  .replace(/>/g, "&gt;").replace(/\r/g, "").slice(0, 1000);
const quoteMd = (value) => escapeMd(value).split("\n").map(line => "> " + line).join("\n");
const validDate = (value) =>
  typeof value === "string" && value.length <= 50 && Number.isFinite(Date.parse(value))
    ? new Date(value).toISOString() : "";

/** Orders are simulated; IDs/timestamps only exist for SQLite records. */
export function commerceLedgerCsv(orders, local = false) {
  if (!Array.isArray(orders) || orders.length > 100) throw new Error("invalid-orders");
  const header = ["order", "source", "product_lines", "total_usd", "recorded_at", "payment"];
  const rows = orders.map((order, index) => {
    if (!order || !safeInt(order.count, 100) || order.count === 0 ||
      typeof order.total !== "number" || !Number.isFinite(order.total) ||
      order.total < 0 || order.total > 1_000_000) throw new Error("invalid-order");
    const identifier = local && safeInt(order.id) && order.id > 0
      ? String(order.id) : "demo-" + (orders.length - index);
    return [identifier, local ? "local-sqlite" : "browser-simulation",
      order.count, order.total.toFixed(2), local ? validDate(order.createdAt) : "", "none"];
  });
  return [header, ...rows].map(row => row.map(csv).join(",")).join("\r\n") + "\r\n";
}

/** JSON is a snapshot of visible blocks, never instructions for the editor to execute. */
export function studioDocumentJson(blocks, local = false, revision = null) {
  if (!Array.isArray(blocks) || blocks.length > 30) throw new Error("invalid-blocks");
  const ids = new Set();
  const clean = blocks.map(block => {
    if (!block || typeof block.id !== "string" ||
      !/^[a-zA-Z0-9_-]{1,80}$/.test(block.id) || ids.has(block.id) ||
      !["hero", "text", "button"].includes(block.type) ||
      typeof block.text !== "string" || block.text.length > 500 || block.text.includes("\0")) {
      throw new Error("invalid-block");
    }
    ids.add(block.id);
    return {id:block.id, type:block.type, text:block.text};
  });
  const doc = {format:"nexus-studio-document",version:1,
    source:local ? "local-sqlite" : "browser-simulation",
    savedRevision:local && safeInt(revision) ? revision : null,
    note:"Local source snapshot. The exported text is not executed or published.",
    blocks:clean};
  return JSON.stringify(doc, null, 2) + "\n";
}

/** Samples are manually initiated; never label them as uptime percentages/SLA. */
export function monitorSamplesCsv(checks, local = false) {
  if (!Array.isArray(checks) || checks.length > 300) throw new Error("invalid-checks");
  const header = ["recorded_at", "source", "result", "latency_ms", "scope"];
  const rows = checks.map(check => {
    if (!check || typeof check.ok !== "boolean" ||
      !safeInt(check.ms, 30000) || !validDate(check.at)) throw new Error("invalid-check");
    return [validDate(check.at),local?"local-sqlite":"browser-manual",
      check.ok?"success":"failure",check.ms,"manual-samples-not-continuous-uptime"];
  });
  return [header,...rows].map(row=>row.map(csv).join(",")).join("\r\n")+"\r\n";
}

/** Local Factory audit (not a code-execution transcript). */
export function factoryAuditMarkdown(job) {
  if (!job || typeof job.request !== "string" || job.request.length > 500 ||
      !["proposed","approved","built"].includes(job.status) ||
      !Array.isArray(job.events) || job.events.length > 50) throw new Error("invalid-job");
  const lines = [
    "# Nexus Software Factory — local review record", "",
    "**Status:** " + job.status,
    "**Kind:** " + (["feature","bug","refactor"].includes(job.kind)?job.kind:"unspecified"),
    "**Execution:** NOT RUN (isolation not verified).",
    "**Origin:** development-only SQLite; no GitHub writes or model inference.",
    "", "## Request", quoteMd(job.request), "", "## Audit events",
  ];
  for (const event of job.events) {
    if (!event || typeof event.stage !== "string" || typeof event.detail !== "string") {
      throw new Error("invalid-event");
    }
    lines.push("- **" + escapeMd(event.stage).replace(/[*_~\`]/g,"") +
      ":** " + escapeMd(event.detail).replace(/\n/g," ").slice(0,500));
  }
  lines.push("", "## Static validation (not executed-code tests)");
  if (job.qa && Array.isArray(job.qa.checks) && job.qa.checks.length <= 30) {
    lines.push("Result: " + (job.qa.passed === true ? "static QA passed" : "static QA not passed"));
    for (const check of job.qa.checks) {
      lines.push("- ["+(check.passed===true?"x":" ")+"] "+
        escapeMd(check.name).replace(/\n/g," ").slice(0,140));
    }
  } else {
    lines.push("Not available: no static QA results have been recorded.");
  }
  return lines.join("\n")+"\n";
}
