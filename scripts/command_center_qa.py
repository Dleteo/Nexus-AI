"""Run only after installing the Command Center into the REAL Next.js repo.

Uses Playwright (Python) and a running local Next.js server.
  pip install playwright
  playwright install chromium
  NEXUS_QA_BASE=http://localhost:3000 python scripts/command_center_qa.py

This checks navigation and public chat UI; the live backend and TTS require separate verification.
"""
import os
import shutil
from pathlib import Path
from playwright.sync_api import sync_playwright

BASE = os.getenv("NEXUS_QA_BASE", "http://localhost:3000").rstrip("/")
SCREENSHOTS = Path("qa-screenshots")
SCREENSHOTS.mkdir(exist_ok=True)


def run():
    with sync_playwright() as p:
        binary = shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chromium-browser")
        assert binary, "Chrome/Chromium is unavailable"
        browser = p.chromium.launch(headless=True, executable_path=binary, args=["--no-sandbox"])
        for kind, dimensions in [("desktop", {"width": 1440, "height": 950}), ("mobile", {"width": 390, "height": 844})]:
            page = browser.new_page(viewport=dimensions, reduced_motion="reduce")
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.add_init_script("localStorage.setItem(\'nexus-language-welcome-seen\', \'yes\')")
            response = page.goto(BASE + "/command-center", wait_until="domcontentloaded")
            assert response is not None and response.status == 200, f"Route unavailable: {response}"
            assert page.locator(".ncc-stage").count() == 1
            assert page.locator(".ncc-hotspot").count() == 6
            assert page.locator(".ncc-stage").bounding_box()["width"] >= dimensions["width"] * 0.9
            art = page.locator(".ncc-scene-art")
            assert "/nexus-command-center.png" in art.evaluate("element => getComputedStyle(element).backgroundImage")
            image_resp = page.request.get(BASE + "/nexus-command-center.png")
            assert image_resp.status == 200 and image_resp.headers.get("content-type", "").startswith("image/"), "Missing art"
            assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 2"), "Horizontal overflow"
            if kind == "desktop":
                page.locator('.ncc-hotspot').nth(3).click()
            else:
                assert page.locator(".ncc-mobile-zones").is_visible()
                page.locator(".ncc-mobile-zones button").nth(3).click()
            assert page.locator("#ncc-drawer-heading").inner_text() == "Proyectos y redes"
            assert page.locator('.ncc-actions a[href="https://github.com/Dleteo/Nexus-AI"]').count() == 1
            page.keyboard.press("Escape")
            assert page.locator("#ncc-drawer").count() == 0
            page.locator(".ncc-hud-actions button").first.click()
            assert page.locator(".ncc-language-card").is_visible()
            page.locator(".ncc-language-options button").nth(1).click()
            if kind == "desktop":
                page.locator('.ncc-hotspot').nth(0).click()
            else:
                page.locator('.ncc-mobile-zones button').nth(0).click()
            assert page.locator("#ncc-drawer-heading").inner_text() == "My creator Josh"
            page.keyboard.press("Escape")
            page.get_by_role("button", name="Ask Nexus").click()
            assert page.locator(".nexus-companion-window").is_visible()
            page.locator("#nexus-companion-draft").fill("Nexus Foundation")
            page.locator(".nexus-companion-form button").click()
            assert "experimental" in page.locator(".nexus-companion-messages").inner_text().lower()
            assert page.locator('.nexus-companion-foot a[href="/assistant"]').count() == 1
            page.screenshot(path=str(SCREENSHOTS / f"command-center-{kind}.png"), full_page=True)
            page.goto(BASE + "/", wait_until="domcontentloaded")
            assert page.locator(".ncc-hotspot").count() == 6
            assert page.locator(".ncc-ai-window").count() == 0
            page.locator(".ncc-hotspot").nth(4).evaluate("el => el.click()") if kind == "mobile" else page.locator(".ncc-hotspot").nth(4).click()
            page.locator(".ncc-feature-actions button").click()
            assert page.locator(".ncc-ai-window").is_visible()
            assert page.locator(".ncc-ai-auth").count() == 1
            page.screenshot(path=str(SCREENSHOTS / f"nexus-home-{kind}.png"), full_page=True)
            assert not errors, f"Browser errors: {errors}"
            page.close()
        browser.close()
    print("PASS: desktop/mobile, six hotspots, drawer, escape, language, chat and asset")

if __name__ == "__main__":
    run()
