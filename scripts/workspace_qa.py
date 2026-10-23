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

from playwright.sync_api import sync_playwright

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
        self.messages = []
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
        if path == "/api/assistant/conversations":
            if method == "GET":
                return ok({"conversations": self.conversations})
            if method == "POST":
                item = {"id": CONVERSATION_ID, "title": payload.get("title", "New conversation"), "mode": payload.get("mode", "assistant"), "project_id": None, "updated_at": STAMP}
                self.conversations.insert(0, item)
                return ok({"conversation": item}, status=201)
        if path.startswith("/api/assistant/conversations/"):
            convo_id = path.rsplit("/", 1)[-1]
            item = next((c for c in self.conversations if c["id"] == convo_id), None)
            if method == "GET" and item:
                return ok({"conversation": item, "messages": self.messages})
            if method == "PATCH" and item:
                item["mode"] = payload["mode"]
                return ok({"conversation": item})
            if method == "DELETE":
                self.conversations = [c for c in self.conversations if c["id"] != convo_id]
                return ok({"ok": True})
        if path == "/api/assistant/chat" and method == "POST":
            self.last_sent = payload
            self.messages.extend([
                {"id": "message-1", "role": "user", "content": payload["message"], "created_at": STAMP},
                {"id": "message-2", "role": "assistant", "content": "QA simulated assistant answer.", "created_at": STAMP},
            ])
            return ok({"answer": "QA simulated assistant answer.", "requestsRemaining": 9})
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
    page.get_by_role("heading", name="What are we working on?").wait_for()
    no_overflow(page, "assistant-" + label)
    page.screenshot(path=str(SHOTS / f"assistant-empty-{label}.png"), full_page=True)
    page.get_by_role("button", name=re.compile("New conversation", re.I)).first.click()
    page.get_by_role("heading", name="Let’s make the next step clear.").wait_for()
    page.get_by_role("group", name="Choose assistant mode").get_by_role("button", name="Planificar").click()
    ensure(page.get_by_role("group", name="Choose assistant mode").get_by_role("button", name="Planificar").get_attribute("aria-pressed") == "true",
           "Assistant mode did not change")
    page.locator("#assistant-message").fill("Plan a small portfolio feature")
    page.get_by_role("button", name="Send message").click()
    page.get_by_text("QA simulated assistant answer.").wait_for()
    ensure(fake.last_sent is not None and fake.last_sent["mode"] == "plan",
           "Assistant did not submit the selected mode")
    ensure(page.get_by_text("9 AI requests remaining today.", exact=False).is_visible(),
           "Remaining request counter did not update")
    no_overflow(page, "assistant-conversation-" + label)
    page.screenshot(path=str(SHOTS / f"assistant-conversation-{label}.png"), full_page=True)
    print(f"PASS mocked assistant conversation, mode and response at {width}px", flush=True)
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
        finally:
            browser.close()
    print("All mocked workspace browser checks passed.", flush=True)


if __name__ == "__main__":
    main()
