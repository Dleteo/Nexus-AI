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
  const quantity = cart[id] ?? 0;
  if (!item || !Number.isInteger(quantity) || quantity < 0 || quantity >= item.stock) {
    return { ok: false, cart, reason: "stock" };
  }
  return { ok: true, cart: { ...cart, [id]: quantity + 1 } };
}

/**
 * All cart quantities must be valid. Never silently ignore an invalid
 * or unknown product even when browser storage was manually edited.
 */
export function placeOrder(cart, inventory) {
  const entries = Object.entries(cart);
  const unchanged = () => inventory.map((item) => ({ ...item }));
  if (!entries.length || entries.every(([, quantity]) => quantity === 0)) {
    return { ok: false, reason: "empty", inventory: unchanged(), total: 0, lines: [] };
  }
  if (entries.some(([id, quantity]) => {
    const item = inventory.find((product) => product.id === id);
    return !item || !Number.isSafeInteger(quantity) || quantity < 0 || quantity > item.stock;
  })) {
    return { ok: false, reason: "stock", inventory: unchanged(), total: 0, lines: [] };
  }
  const lines = entries.filter(([, quantity]) => quantity > 0).map(([id, quantity]) => {
    const item = inventory.find((product) => product.id === id);
    return { id, name: item.name, quantity, subtotal: item.price * quantity };
  });
  const total = lines.reduce((sum, line) => sum + line.subtotal, 0);
  if (!Number.isSafeInteger(total)) {
    return { ok: false, reason: "invalid-total", inventory: unchanged(), total: 0, lines: [] };
  }
  return {
    ok: true,
    inventory: inventory.map((item) => ({ ...item, stock: item.stock - (cart[item.id] || 0) })),
    total,
    lines,
  };
}

/** Stable local catalog search and category filter; no network calls. */
export function filterProducts(inventory, search = "", category = "all") {
  const term = String(search).trim().toLocaleLowerCase();
  return inventory.filter((item) =>
    (category === "all" || item.category === category)
    && (item.name.toLocaleLowerCase().includes(term) || item.category.toLocaleLowerCase().includes(term))
  );
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

/** Nearest-rank p95 on successful browser-observed checks only. */
export function successfulLatencyP95(checks) {
  const values = checks.filter((check) => check?.ok && Number.isFinite(check.ms) && check.ms >= 0)
    .map((check) => check.ms).sort((a, b) => a - b);
  return values.length ? values[Math.ceil(values.length * 0.95) - 1] : null;
}

/** Authorizes manual follow-up only, never marks code or tests as executed. */
export function reviewFactoryPlan(plan, explicitApproval) {
  if (!plan || !explicitApproval || plan.status !== "awaiting-review") return plan;
  return { ...plan, status: "approved-for-manual-work" };
}

/** Export a plain-text draft; never posts to GitHub. */
export function renderFactoryIssueMarkdown(proposal) {
  if (!proposal || typeof proposal.request !== "string") return "";
  const safe = (value) => String(value).replace(/\r/g, "").slice(0, 500).replace(/^([#*>-]|\d+\.)\s/gm, (match) => String.fromCharCode(92) + match);
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
