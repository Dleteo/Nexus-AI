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
await checkPublicPage("/", [
  "Construyo experiencias digitales",
  "Proyectos que demuestran",
  "Formación y",
  "Nexus AI",
]);
await checkPublicPage("/portfolio", ["Hi, I", "Nexus AI, built from the ground up.", "Small projects. Real practice.", "Task Tracker", "Hangman Game", "Text Encoder / Decoder", "Interested in my work?", "Hacking Ético", "Certifications &amp; Training"]);
await checkPublicPage("/resume", ["Joshua Vallejo Sanchez", "Proyectos seleccionados", "Nexus AI", "Competencias técnicas"]);
await checkPublicPage("/interview", ["Presentación profesional para entrevistas", "Cuéntame sobre ti", "Preguntas para practicar"]);
await checkPublicPage("/projects/nexus-ai", ["Nexus AI", "El problema", "Decisiones e implementación", "Evidencia en el código"]);
await checkPublicPage("/projects/task-tracker", ["Task Tracker", "Lo que aprendí", "innerHTML"]);
await checkPublicPage("/projects/hangman", ["Hangman Game", "Límites y trabajo pendiente"]);
await checkPublicPage("/projects/nexus-foundation", ["Nexus Foundation", "Experimental", "Transformer"]);
await checkPublicPage("/login", ["Welcome back.", "Forgot password?"]);
await checkPublicPage("/register", ["Create your account.", "At least 10 characters"]);
await checkPublicPage("/forgot-password", ["Reset your password.", "Send recovery link"]);
await checkPublicPage("/reset-password", ["Choose a new password.", "Confirm new password"]);

const pdf = await request("/Joshua-Vallejo-Sanchez-Resume.pdf");
assert.equal(pdf.status, 200, "CV PDF must be downloadable");
assert.match(pdf.headers.get("content-type") ?? "", /application\/pdf/i);
assert.ok((await pdf.arrayBuffer()).byteLength > 1000, "CV PDF should not be empty");
console.log("PASS downloadable CV PDF");

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

console.log("All production HTTP smoke checks passed.");
