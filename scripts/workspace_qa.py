"""Browser tests of workspace interactions with a deliberately mocked backend.

These tests do NOT verify live Supabase authentication or the AI provider.
They check the real compiled React UI using isolated, in-memory API responses.
"""
import json
from pathlib import Path
import re
import shutil
import os
from urllib.parse import urlparse

from playwright.sync_api import expect as playwright_expect, sync_playwright

BASE = os.environ.get("NEXUS_QA_BASE", "http://127.0.0.1:3101")
SHOTS = Path("qa-screenshots")
SHOTS.mkdir(exist_ok=True)
FIRST_ID = "11111111-1111-4111-8111-111111111111"
ARCHIVED_ID = "22222222-2222-4222-8222-222222222222"
CREATED_ID = "33333333-3333-4333-8333-333333333333"
CONVERSATION_ID = "44444444-4444-4444-8444-444444444444"
STAMP = "2026-10-23T12:00:00+00:00"


def ensure(condition, message):
    if not condition:
        raise AssertionError(message)


class FakeWorkspace:
    def __init__(self):
        self.projects = [
            {"id": FIRST_ID, "name": "Prototype dashboard", "description": "A responsive project", "status": "active", "created_at": STAMP},
            {"id": ARCHIVED_ID, "name": "Documentation refresh", "description": "Archived notes", "status": "archived", "created_at": STAMP},
        ]
        self.conversations = []
        self.messages = {}
        self.conversation_loads = 0
        self.created_conversations = 0
        self.last_sent = None

    def respond(self, route):
        request = route.request
        path = urlparse(request.url).path
        method = request.method
        payload = json.loads(request.post_data or "{}") if method in ("POST", "PATCH") else {}

        def ok(data, status=200):
            route.fulfill(status=status, content_type="application/json", body=json.dumps(data))

        if path == "/api/auth/session" and method == "GET":
            return ok({"user": {"id": "mock-user", "email": "qa@example.test", "name": "QA Reviewer"}})
        if path == "/api/projects":
            if method == "GET":
                return ok({"projects": self.projects})
            if method == "POST":
                item = {"id": CREATED_ID, "name": payload["name"], "description": payload.get("description", ""), "status": "active", "created_at": STAMP}
                self.projects.insert(0, item)
                return ok({"project": item}, status=201)
        if path.startswith("/api/projects/"):
            project_id = path.rsplit("/", 1)[-1]
            if method == "PATCH":
                item = next((p for p in self.projects if p["id"] == project_id), None)
                if item:
                    item.update(payload)
                    return ok({"project": item})
            if method == "DELETE":
                self.projects = [p for p in self.projects if p["id"] != project_id]
                return ok({"ok": True})
        if path == "/api/assistant/status" and method == "GET":
            return ok({"databaseReady": True, "assistants": [
                {"scope": "portfolio", "status": "ready", "provider": "ollama", "inferenceVerified": False},
                {"scope": "technical", "status": "not_configured", "provider": None, "inferenceVerified": False},
            ]})
        if path == "/api/assistant/conversations":
            if method == "GET":
                self.conversation_loads += 1
                return ok({"conversations": self.conversations})
            if method == "POST":
                self.created_conversations += 1
                item = {"id": f"44444444-4444-4444-8444-{self.created_conversations:012d}", "title": ("Nexus Portfolio · " if payload.get("scope") == "portfolio" else "Nexus Technical · ") + "New conversation", "scope": payload.get("scope", "technical"), "mode": payload.get("mode", "assistant"), "project_id": None, "updated_at": STAMP}
                self.conversations.insert(0, item)
                return ok({"conversation": item}, status=201)
        if path.startswith("/api/assistant/conversations/"):
            convo_id = path.rsplit("/", 1)[-1]
            item = next((c for c in self.conversations if c["id"] == convo_id), None)
            if method == "GET" and item:
                return ok({"conversation": item, "messages": self.messages.get(convo_id, [])})
            if method == "PATCH" and item:
                item["mode"] = payload["mode"]
                return ok({"conversation": item})
            if method == "DELETE":
                self.conversations = [c for c in self.conversations if c["id"] != convo_id]
                return ok({"ok": True})
        if path == "/api/assistant/chat" and method == "POST":
            self.last_sent = payload
            self.messages.setdefault(payload["conversationId"], []).extend([
                {"id": "message-1", "role": "user", "content": payload["message"], "created_at": STAMP},
                {"id": "message-2", "role": "assistant", "content": "QA simulated assistant answer.\n\n```javascript\nconsole.log(42);\n```", "created_at": STAMP},
            ])
            return ok({"answer": "QA simulated assistant answer.\n\n```javascript\nconsole.log(42);\n```", "requestsRemaining": 9})
        if path == "/api/auth/logout" and method == "POST":
            return ok({"ok": True})
        return ok({"error": "Unexpected mocked request", "path": path, "method": method}, status=404)


def create_context(browser, width, fake):
    context = browser.new_context(viewport={"width": width, "height": 900}, device_scale_factor=1)
    # The server only checks cookie presence to render the shell. All API data
    # is intercepted below; no real session, key, or user account is created.
    context.add_cookies([{"name": "nexus_session", "value": "mock-browser-qa",
                          "domain": "127.0.0.1", "path": "/", "httpOnly": True,
                          "sameSite": "Lax"}])
    context.route("**/api/**", fake.respond)
    return context


def no_overflow(page, label):
    dimensions = page.evaluate("() => ({width: window.innerWidth, scroll: document.documentElement.scrollWidth})")
    ensure(dimensions["scroll"] <= dimensions["width"] + 2,
           f"{label} horizontal page overflow: {dimensions}")


def dashboard_test(browser, width, label):
    fake = FakeWorkspace()
    ctx = create_context(browser, width, fake)
    page = ctx.new_page()
    page.on("dialog", lambda dialog: dialog.accept())
    page.goto(BASE + "/dashboard", wait_until="networkidle")
    page.get_by_role("heading", name="Good to see you, QA.").wait_for()
    ensure(page.get_by_text("Prototype dashboard", exact=True).is_visible(),
           "Active project did not render")
    ensure(not page.get_by_text("Documentation refresh", exact=True).is_visible(),
           "Archived project appeared before requesting it")
    no_overflow(page, "dashboard-" + label)
    page.screenshot(path=str(SHOTS / f"dashboard-{label}.png"), full_page=True)

    # The new search and archive filters must work independently.
    search = page.get_by_role("searchbox", name="Search projects by name or description")
    search.fill("missing")
    ensure(page.get_by_role("heading", name="No matching projects").is_visible(),
           "No-results state missing")
    search.fill("prototype")
    ensure(page.get_by_text("Prototype dashboard", exact=True).is_visible(),
           "Project search did not find an existing project")
    search.fill("")
    page.get_by_role("button", name="Show archived").click()
    ensure(page.get_by_text("Documentation refresh", exact=True).is_visible(),
           "Show archived did not reveal archived projects")
    page.get_by_role("button", name="Hide archived").click()

    # Interact with all four project actions via the real UI, mocked API only.
    page.locator("#project-name").fill("Interactive QA project")
    page.locator("#project-description").fill("Saved using mock endpoints")
    page.get_by_role("button", name="Create project").click()
    page.get_by_text("Project created successfully.").wait_for()
    project = page.locator("li").filter(has_text="Interactive QA project").first
    project.get_by_role("button", name="Edit").click()
    project = page.locator("#projects ul > li").first
    project.get_by_role("textbox", name="Project name").fill("QA project updated")
    project.get_by_role("button", name="Save changes").click()
    page.get_by_text("Project updated and saved.").wait_for()
    project = page.locator("li").filter(has_text="QA project updated").first
    project.get_by_role("button", name="Archive").click()
    page.get_by_text("Project updated and saved.").wait_for()
    ensure(page.get_by_text("QA project updated", exact=True).count() == 0,
           "Archiving did not hide the project")
    page.get_by_role("button", name="Show archived").click()
    project = page.locator("li").filter(has_text="QA project updated").first
    project.get_by_role("button", name="Restore").click()
    page.get_by_text("Project updated and saved.").wait_for()
    project.get_by_role("button", name="Delete").click()
    page.get_by_text("Project deleted.").wait_for()
    ensure(not any(p["name"] == "QA project updated" for p in fake.projects),
           "Delete did not reach the mocked API")
    page.screenshot(path=str(SHOTS / f"dashboard-tested-{label}.png"), full_page=True)
    print(f"PASS mocked dashboard CRUD, filters and layout at {width}px", flush=True)
    ctx.close()


def assistant_test(browser, width, label):
    fake = FakeWorkspace()
    ctx = create_context(browser, width, fake)
    page = ctx.new_page()
    page.goto(BASE + "/assistant", wait_until="networkidle")
    page.get_by_role("heading", name="¿En qué trabajamos hoy?").wait_for()
    page.get_by_role("status", name="Estado de configuración del asistente").get_by_text("MODELO NO CONFIGURADO").wait_for()
    no_overflow(page, "assistant-" + label)
    page.screenshot(path=str(SHOTS / f"assistant-empty-{label}.png"), full_page=True)
    ensure(page.get_by_role("button", name="Mi portafolio").is_visible(), "Portfolio assistant workspace missing")
    ensure(page.get_by_role("button", name="Asistente técnico").is_visible(), "Technical assistant workspace missing")
    page.get_by_role("button", name="Mi portafolio").click()
    playwright_expect(page.get_by_role("button", name="Mi portafolio")).to_have_attribute("aria-pressed","true")
    page.get_by_role("status", name="Estado de configuración del asistente").get_by_text("CONFIGURADO · SIN PRUEBA REAL").wait_for()
    ensure(page.get_by_text("Revisar mi CV").is_visible(), "Portfolio quick action missing")
    page.get_by_role("button", name="Asistente técnico").click()
    playwright_expect(page.get_by_role("button", name="Asistente técnico")).to_have_attribute("aria-pressed","true")
    page.get_by_role("button", name=re.compile("Nueva conversación", re.I)).first.click()
    page.get_by_role("heading", name="Let’s make the next step clear.").wait_for()
    page.get_by_role("group", name="Choose assistant mode").get_by_role("button", name="Planificar").click()
    playwright_expect(
        page.get_by_role("group", name="Choose assistant mode").get_by_role("button", name="Planificar")
    ).to_have_attribute("aria-pressed", "true")
    page.get_by_label("Especialidad").select_option("hardware")
    page.get_by_label("Consultar fuentes recientes").check()
    page.locator("#assistant-message").fill("Plan a small portfolio feature")
    page.get_by_role("button", name="Send message").click()
    page.get_by_text("QA simulated assistant answer.").wait_for()
    ensure(fake.last_sent is not None and fake.last_sent["expertise"] == "hardware" and fake.last_sent["currentResearch"] is True, "Specialty and research toggle missing from request")
    ensure(fake.last_sent is not None and fake.last_sent["mode"] == "plan",
           "Assistant did not submit the selected mode")
    ensure(page.get_by_text("9 AI requests remaining today.", exact=False).is_visible(),
           "Remaining request counter did not update")
    ensure(page.get_by_role("button", name="Copy javascript code").is_visible(),
           "AI code block is missing its copy button")
    ensure(page.get_by_text("console.log(42);", exact=True).is_visible(),
           "Assistant code block did not render")
    ensure(page.get_by_role("button", name="Copy message 2").is_visible(),
           "Assistant response is missing a copy button")
    if width < 1024:
        history_toggle = page.get_by_role("button", name=re.compile("Historial reciente"))
        history_toggle.click()
        playwright_expect(history_toggle).to_have_attribute("aria-expanded", "true")
        ensure(page.locator("#assistant-history").is_visible(),
               "Mobile history did not open")
        history_toggle.click()
    no_overflow(page, "assistant-conversation-" + label)
    page.screenshot(path=str(SHOTS / f"assistant-conversation-{label}.png"), full_page=True)
    print(f"PASS mocked assistant conversation, mode and response at {width}px", flush=True)
    ctx.close()


def assistant_pending_test(browser):
    """Delayed mocked responses exercise UI state without real model inference."""
    fake = FakeWorkspace()
    technical = {"id": CONVERSATION_ID, "scope": "technical", "title": "Nexus Technical · Existing", "mode": "assistant", "project_id": None, "updated_at": STAMP}
    portfolio = {**technical, "id": CREATED_ID, "scope": "portfolio", "title": "Nexus Portfolio · Existing"}
    fake.conversations = [technical, portfolio]
    fake.messages = {
        CONVERSATION_ID: [{"role": "assistant", "content": "Technical history only"}],
        CREATED_ID: [{"role": "assistant", "content": "Portfolio history only"}],
    }
    ctx = create_context(browser, 1440, fake)
    page = ctx.new_page()
    page.goto(BASE + "/assistant", wait_until="networkidle")
    page.get_by_text("Technical history only", exact=True).wait_for()

    # Switching away from an existing thread used to trigger a global reload,
    # reopen list[0], and silently switch back to the previous workspace.
    page.get_by_role("button", name="Mi portafolio").click()
    page.get_by_role("heading", name="Asistente de portafolio", exact=True).wait_for()
    page.wait_for_load_state("networkidle")
    playwright_expect(page.get_by_role("button", name="Mi portafolio")).to_have_attribute("aria-pressed", "true")
    ensure(fake.conversation_loads == 1, "Workspace switch reloaded and reset the initial thread")
    ensure(page.get_by_text("Technical history only", exact=True).count() == 0, "Technical messages remained in Portfolio")
    page.locator("#assistant-history").get_by_role("button", name=re.compile("Nexus Portfolio · Existing Copilot")).click()
    page.get_by_text("Portfolio history only", exact=True).wait_for()
    ensure(page.get_by_text("Technical history only", exact=True).count() == 0, "Portfolio opened technical history")

    pending = []
    ctx.route("**/api/assistant/chat", lambda route: pending.append(route))
    editor = page.locator("#assistant-message")
    editor.fill("Pending portfolio question")
    page.get_by_role("button", name="Send message").click()
    page.get_by_text("Nexus AI is thinking…", exact=True).wait_for()
    ensure(len(pending) == 1, "Mock did not hold the outgoing chat")
    playwright_expect(page.get_by_role("button", name="Asistente técnico")).to_be_disabled()
    playwright_expect(page.get_by_role("button", name=re.compile("Nueva conversación", re.I))).to_be_disabled()
    playwright_expect(page.locator("#assistant-history").get_by_role("button").first).to_be_disabled()
    playwright_expect(page.get_by_role("button", name=re.compile("Delete conversation"))).to_be_disabled()
    editor.fill("A different draft typed while waiting")
    pending.pop().fulfill(status=502, content_type="application/json", body=json.dumps({"error": "Simulated provider unavailable"}))
    page.get_by_role("alert").filter(has_text="Simulated provider unavailable").wait_for()
    playwright_expect(editor).to_have_value("A different draft typed while waiting")
    ensure(page.get_by_text("Pending portfolio question", exact=True).count() == 0, "Failed optimistic message stayed visible")
    playwright_expect(page.get_by_role("button", name="Asistente técnico")).to_be_enabled()

    ctx.unroute("**/api/assistant/chat")
    page.get_by_role("button", name="Send message").click()
    log = page.get_by_role("log", name="Conversation messages")
    log.get_by_text("QA simulated assistant answer.", exact=True).wait_for()
    playwright_expect(log).to_have_attribute("aria-live", "polite")
    ensure(fake.last_sent["scope"] == "portfolio" and fake.last_sent["currentResearch"] is False, "Portfolio submitted technical research")

    # Mode writes also block submission and navigation until persisted.
    page.get_by_role("button", name="Asistente técnico").click()
    page.locator("#assistant-history").get_by_role("button", name=re.compile("Nexus Technical · Existing Copilot")).click()
    page.get_by_text("Technical history only", exact=True).wait_for()
    pending_modes = []
    ctx.route("**/api/assistant/conversations/" + CONVERSATION_ID, lambda route: pending_modes.append(route))
    page.get_by_role("group", name="Choose assistant mode").get_by_role("button", name="Depurar").click()
    page.get_by_role("status").filter(has_text="Actualizando conversación").wait_for()
    playwright_expect(page.get_by_role("button", name="Mi portafolio")).to_be_disabled()
    playwright_expect(editor).to_be_disabled()
    playwright_expect(page.get_by_role("group", name="Choose assistant mode").get_by_role("button", name="Planificar")).to_be_disabled()
    ensure(len(pending_modes) == 1, "Mode update was not held")
    technical["mode"] = "debug"
    pending_modes.pop().fulfill(status=200, content_type="application/json", body=json.dumps({"conversation": technical}))
    playwright_expect(page.get_by_role("group", name="Choose assistant mode").get_by_role("button", name="Depurar")).to_have_attribute("aria-pressed", "true")
    playwright_expect(editor).to_be_enabled()
    ensure(fake.conversation_loads == 1, "Conversation changes triggered global history reloads")
    print("PASS mocked assistant scope stability, pending-operation isolation, accessible responses and draft recovery", flush=True)
    ctx.close()


def assistant_initial_failure_test(browser):
    fake = FakeWorkspace()
    broken = {"id": CONVERSATION_ID, "scope": "technical", "title": "Unavailable conversation", "mode": "assistant", "project_id": None, "updated_at": STAMP}
    available = {**broken, "id": CREATED_ID, "title": "Available conversation"}
    fake.conversations = [broken, available]
    fake.messages = {CREATED_ID: [{"role": "assistant", "content": "Recovered saved history"}]}
    ctx = create_context(browser, 1440, fake)
    ctx.route("**/api/assistant/conversations/" + CONVERSATION_ID,
              lambda route: route.fulfill(status=502, content_type="application/json", body=json.dumps({"error": "Simulated history failure"})))
    page = ctx.new_page()
    page.goto(BASE + "/assistant", wait_until="networkidle")
    page.get_by_role("alert").filter(has_text="Simulated history failure").wait_for()
    page.locator("#assistant-history").get_by_role("button", name="Available conversation Copilot", exact=True).click()
    page.get_by_text("Recovered saved history", exact=True).wait_for()
    ensure(fake.conversation_loads == 1, "History recovery reloaded the entire workspace")
    print("PASS mocked assistant preserves the history list when the initial thread cannot load", flush=True)
    ctx.close()


def main():
    browser_binary = shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chromium-browser")
    ensure(browser_binary, "Chromium browser is missing on runner")
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=browser_binary,
                                             args=["--no-sandbox"])
        try:
            dashboard_test(browser, 375, "mobile")
            dashboard_test(browser, 1440, "desktop")
            assistant_test(browser, 375, "mobile")
            assistant_test(browser, 1440, "desktop")
            assistant_pending_test(browser)
            assistant_initial_failure_test(browser)
        finally:
            browser.close()
    print("All mocked workspace browser checks passed.", flush=True)


if __name__ == "__main__":
    main()
