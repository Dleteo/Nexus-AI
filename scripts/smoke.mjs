// HTTP smoke checks for the compiled Next.js app; no real account is used.
import assert from "node:assert/strict";

const origin = process.argv[2] ?? "http://127.0.0.1:3100";

function endpoint(path) {
  return new URL(path, origin);
}

async function request(path, options = {}) {
  return fetch(endpoint(path), {
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
    ...options,
  });
}

async function waitUntilReady() {
  for (let attempt = 0; attempt < 45; attempt += 1) {
    try {
      const response = await request("/");
      if (response.status === 200) return;
    } catch {
      // Next.js can require a short startup interval in CI.
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error("Production server did not become ready.");
}

async function checkPublicPage(path, markers) {
  const response = await request(path);
  assert.equal(response.status, 200, path + " must return HTTP 200");
  const html = await response.text();
  for (const marker of markers) {
    assert.ok(html.includes(marker), path + " missing " + JSON.stringify(marker));
  }
  console.log("PASS public page " + path);
}

async function checkSignedOutRedirect(path) {
  const response = await request(path, { redirect: "manual" });
  assert.ok([302, 303, 307, 308].includes(response.status), path + " must redirect unsigned-in visitors");
  const destination = new URL(response.headers.get("location") ?? "", origin);
  assert.equal(destination.pathname, "/login", path + " must redirect to sign-in");
  assert.equal(destination.searchParams.get("next"), path, path + " should preserve the requested destination");
  console.log("PASS protected page " + path);
}

async function checkSignedOutApi(path, options = {}) {
  const response = await request(path, options);
  assert.equal(response.status, 401, path + " must reject unsigned-in requests");
  const body = await response.json();
  assert.equal(typeof body.error, "string", path + " must include an error message");
  console.log("PASS protected API " + path);
}

await waitUntilReady();
await checkSignedOutApi("/api/assistant/status");
await checkPublicPage("/", ["PORTFOLIO","PROYECTOS DESTACADOS","TRABAJEMOS","Nexus AI Workspace","NEXUS / CONTACT"]);
await checkPublicPage("/en", ["PORTFOLIO","FEATURED PROJECTS","TOGETHER"]);
await checkPublicPage("/de", ["PORTFOLIO","AUSGEWÄHLTE PROJEKTE"]);
await checkPublicPage("/fr", ["PORTFOLIO","PROJETS À LA UNE"]);
await checkPublicPage("/pt", ["PORTFOLIO","PROJETOS EM DESTAQUE"]);
await checkPublicPage("/portfolio", ["Hi, I", "Nexus AI, built from the ground up.", "Small projects. Real practice.", "Task Tracker", "Hangman Game", "Text Encoder / Decoder", "Interested in my work?", "Hacking Ético", "Certifications &amp; Training"]);
await checkPublicPage("/resume", ["Joshua Vallejo Sanchez", "PROYECTOS SELECCIONADOS", "Nexus AI", "COMPETENCIAS TÉCNICAS"]);
await checkPublicPage("/interview", ["Presentación profesional para entrevistas", "Cuéntame sobre ti", "Preguntas para practicar"]);
await checkPublicPage("/projects/nexus-ai", ["Nexus AI", "El problema", "Decisiones e implementación", "Evidencia en el código"]);
await checkPublicPage("/projects/task-tracker", ["Task Tracker", "Lo que aprendí", "innerHTML"]);
await checkPublicPage("/projects/hangman", ["Hangman Game", "Límites y trabajo pendiente"]);
await checkPublicPage("/projects/nexus-foundation", ["Nexus Foundation", "Experimental", "Transformer"]);
for (const [lang, sample] of [["en","The problem"],["de","Die Herausforderung"],["fr","Le problème"],["pt","O problema"]]) {
  await checkPublicPage("/projects/nexus-ai?lang="+lang,[sample,"Nexus AI"]);
  await checkPublicPage("/resume?lang="+lang,[lang==="en"?"PROFESSIONAL PROFILE":lang==="de"?"TECHNISCHE KENNTNISSE":lang==="fr"?"COMPÉTENCES TECHNIQUES":"COMPETÊNCIAS TÉCNICAS"]);
  const response = await request("/api/resume/pdf?lang="+lang);
  assert.equal(response.status,200);
  assert.ok((response.headers.get("content-type") ?? "").includes("application/pdf"));
  assert.ok((await response.arrayBuffer()).byteLength > 1000);
}
await checkPublicPage("/login", ["Welcome back.", "Forgot password?"]);
await checkPublicPage("/register", ["Create your account.", "At least 10 characters"]);
await checkPublicPage("/forgot-password", ["Reset your password.", "Send recovery link"]);
await checkPublicPage("/reset-password", ["Choose a new password.", "Confirm new password"]);

const pdf = await request("/api/resume/pdf?lang=es");
assert.equal(pdf.status, 200, "CV PDF must be downloadable");
assert.match(pdf.headers.get("content-type") ?? "", /application\/pdf/i);
assert.ok((await pdf.arrayBuffer()).byteLength > 1000, "CV PDF should not be empty");
console.log("PASS downloadable CV PDF");
const englishPdf = await request("/api/resume/pdf?lang=en");
assert.equal(englishPdf.status, 200);
assert.match(englishPdf.headers.get("content-type") ?? "", /application\/pdf/i);
assert.ok((await englishPdf.arrayBuffer()).byteLength > 1000);
console.log("PASS English CV PDF");
await checkPublicPage("/resume?lang=en", ["PROFESSIONAL PROFILE", "SELECTED PROJECTS", "DOCUMENTED TRAINING"]);

const image = await request("/certificates/ethical-hacking.webp", { method: "HEAD" });
assert.equal(image.status, 200, "Ethical hacking certificate image must exist");
assert.match(image.headers.get("content-type") ?? "", /^image\/webp/i);
console.log("PASS ethical hacking certificate image");

await checkSignedOutRedirect("/dashboard");
await checkSignedOutRedirect("/assistant");

const session = await request("/api/auth/session");
assert.equal(session.status, 200);
assert.equal((await session.json()).user, null, "Anonymous users must not receive a user record");
console.log("PASS anonymous session");

await checkSignedOutApi("/api/projects");
await checkSignedOutApi("/api/assistant/conversations");
await checkSignedOutApi("/api/assistant/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    conversationId: "00000000-0000-0000-0000-000000000000",
    message: "test",
  }),
});

// The local-only SQLite backend must never be remotely writable on production builds.
for (const [method, options] of [
  ["GET", {}],
  ["POST", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({cart:{keyboard:1}}) }],
]) {
  const response = await request("/api/labs/commerce", options);
  assert.equal(response.status, 503, "SQLite API must be disabled in production: "+method);
  assert.equal((await response.json()).reason, "local-backend-disabled");
}
console.log("PASS production SQLite backend remains disabled");

console.log("All production HTTP smoke checks passed.");
