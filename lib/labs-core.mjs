/**
 * Shared, deterministic domain logic for the four Nexus Labs prototypes.
 * No payment processing, autonomous code execution, outbound network scanning or AI inference.
 */
export const seedProducts = Object.freeze([
  { id: "keyboard", name: "Mechanical Keyboard", category: "Peripherals", price: 79, stock: 8 },
  { id: "headset", name: "Studio Headset", category: "Audio", price: 59, stock: 12 },
  { id: "monitor", name: "27-inch Monitor", category: "Displays", price: 249, stock: 5 },
  { id: "mouse", name: "Precision Mouse", category: "Peripherals", price: 39, stock: 16 },
]);

export function addToCart(cart, inventory, id) {
  const item = inventory.find((product) => product.id === id);
  if (!item || item.stock < 1 || (cart[id] || 0) >= item.stock) {
    return { ok: false, cart, reason: "stock" };
  }
  return { ok: true, cart: { ...cart, [id]: (cart[id] || 0) + 1 } };
}

export function placeOrder(cart, inventory) {
  const entries = Object.entries(cart).filter(([, quantity]) => Number.isInteger(quantity) && quantity > 0);
  if (entries.length === 0) return { ok: false, reason: "empty", inventory: inventory.map((item) => ({ ...item })), total: 0, lines: [] };
  let total = 0;
  const lines = [];
  for (const [id, quantity] of entries) {
    const item = inventory.find((product) => product.id === id);
    if (!item || quantity > item.stock) {
      return { ok: false, reason: "stock", inventory: inventory.map((item) => ({ ...item })), total: 0, lines: [] };
    }
    total += item.price * quantity;
    lines.push({ id, name: item.name, quantity, subtotal: item.price * quantity });
  }
  return {
    ok: true,
    inventory: inventory.map((item) => ({ ...item, stock: item.stock - (cart[item.id] || 0) })),
    total,
    lines,
  };
}

export function moveBlock(blocks, index, direction) {
  const target = index + direction;
  if (index < 0 || target < 0 || index >= blocks.length || target >= blocks.length) return blocks.map((block) => ({ ...block }));
  const result = blocks.map((block) => ({ ...block }));
  [result[index], result[target]] = [result[target], result[index]];
  return result;
}

export function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[char]);
}

export function renderPageHtml(blocks) {
  const body = blocks.map((block) => {
    const safe = escapeHtml(block.text).slice(0, 4000);
    if (block.type === "hero") return "<h1>" + safe + "</h1>";
    if (block.type === "button") return '<p><span class="button">' + safe + "</span></p>";
    return "<p>" + safe + "</p>";
  }).join("\n");
  return '<!doctype html><html lang="es"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Nexus Studio Export</title><style>body{font:18px system-ui;max-width:800px;margin:60px auto;padding:24px;background:#141416;color:#f5f0eb}h1{font-size:52px}.button{background:#af354a;padding:12px 24px;border-radius:8px}</style><main>' + body + "</main></html>";
}

export function summarizeChecks(checks) {
  const total = checks.length;
  const success = checks.filter((entry) => entry.ok);
  const averageMs = success.length
    ? Math.round(success.reduce((sum, entry) => sum + entry.ms, 0) / success.length)
    : null;
  return { total, successful: success.length, failed: total - success.length, averageMs };
}

/**
 * Observed availability is not a long-term uptime SLA: it only covers recorded probes.
 * Ignore malformed entries, never divide by zero.
 */
export function observedAvailability(checks) {
  const valid = checks.filter((check) => check && typeof check.ok === "boolean" && Number.isFinite(check.ms) && check.ms >= 0);
  if (!valid.length) return { sampleCount: 0, percent: null, minMs: null, maxMs: null };
  return {
    sampleCount: valid.length,
    percent: Math.round(1000 * valid.filter((check) => check.ok).length / valid.length) / 10,
    minMs: Math.min(...valid.map((check) => check.ms)),
    maxMs: Math.max(...valid.map((check) => check.ms)),
  };
}

/** Export a plain-text draft; never posts to GitHub. */
export function renderFactoryIssueMarkdown(proposal) {
  if (!proposal || typeof proposal.request !== "string") return "";
  const safe = (value) => String(value).replace(/\r/g, "").slice(0, 500).replace(/^([#*>-]|\d+\.)\s/gm, "\\/**
 * A reviewable, RULE-BASED proposal, not an AI agent and not executed tests.
 */");
  const stages = Array.isArray(proposal.stages) ? proposal.stages : [];
  const acceptance = Array.isArray(proposal.acceptance) ? proposal.acceptance : [];
  return [
    "# Engineering request (" + safe(proposal.kind || "feature") + ")",
    "",
    "## Request", safe(proposal.request), "",
    "## Workflow (not executed)",
    ...stages.map((step) => "- [ ] " + safe(step.label) + ": " + safe(step.detail)),
    "",
    "## Acceptance criteria",
    ...acceptance.map((criterion) => "- [ ] " + safe(criterion)),
    "",
    "Drafted locally using Nexus Software Factory. No AI inference, code generation, tests, or GitHub changes were performed.",
    "",
  ].join("\n");
}

/**
 * A reviewable, RULE-BASED proposal, not an AI agent and not executed tests.
 */
export function buildFactoryProposal(request, kind = "feature") {
  const description = String(request).trim();
  if (description.length < 10 || description.length > 500) return null;
  const allowed = ["feature", "bug", "refactor"];
  const type = allowed.includes(kind) ? kind : "feature";
  return {
    request: description,
    kind: type,
    status: "awaiting-review",
    stages: [
      { id: "requirements", label: "Requirements", detail: "Clarify expected behavior, inputs and edge cases.", completed: true },
      { id: "design", label: "Design", detail: "Propose the smallest change and list affected components.", completed: true },
      { id: "implementation", label: "Implementation", detail: "Pending human-approved code changes; no files have been modified.", completed: false },
      { id: "qa", label: "Quality assurance", detail: "Pending: no tests have been executed.", completed: false },
    ],
    acceptance: [
      "The requested behavior is defined and reproducible.",
      "Invalid inputs and failure cases are handled.",
      "Automated tests are written and executed before merging.",
      "A human reviews the diff and approves the change.",
    ],
  };
}
