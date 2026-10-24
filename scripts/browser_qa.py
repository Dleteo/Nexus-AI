"""Browser QA against a locally built Next.js server, without credentials."""
from pathlib import Path
from urllib.parse import urlparse
import os
import shutil
import subprocess
import time

from playwright.sync_api import sync_playwright

BASE = os.environ.get("NEXUS_QA_BASE", "http://127.0.0.1:3102")
ARTIFACTS = Path("qa-screenshots")
ARTIFACTS.mkdir(exist_ok=True)

def expect(condition, reason):
    if not condition:
        raise AssertionError(reason)

def audit(browser, width, label):
    context = browser.new_context(viewport={"width": width, "height": 900}, device_scale_factor=1)
    page = context.new_page()
    page.goto(BASE, wait_until="networkidle")
    expect(page.get_by_role("heading", name="Build with confidence.").count() == 1, "Missing main heading")
    page.evaluate("document.fonts.ready")
    expect(page.evaluate("getComputedStyle(document.documentElement).colorScheme") == "dark",
           "Royal Black should enable dark-native browser controls")
    expect(page.evaluate("getComputedStyle(document.documentElement).backgroundColor") == "rgb(9, 9, 9)",
           "Wrong base background for Royal Black")
    expect("linear-gradient" in page.locator(".nexus-primary-button").first.evaluate("(el) => getComputedStyle(el).backgroundImage"),
           "Primary call-to-action must use the Royal Black golden gradient")
    expect(page.locator('nav[aria-label="Main navigation"] svg').count() >= 1,
           "Crown logo missing from navigation")
    hero = page.locator("#top .royal-art-stage")
    expect(hero.count() == 1, "Dimensional crowned hero artwork is missing")
    expect(page.locator("#top .royal-showcase-landscape").count() == 1, "Lower landscape showcase is missing")
    expect(page.locator("#top .royal-reference-art").count() == 1, "Real photographic crown crop is missing")
    page.wait_for_function("""() => {
        const photo = document.querySelector('.royal-reference-art');
        return photo && photo.complete && photo.naturalWidth > 0 && photo.naturalHeight > 0;
    }""")
    expect(page.locator("#top .royal-feature-tile").count() == 4,
           "Four actual feature cards should be present")
    page.screenshot(path=str(ARTIFACTS / f"homepage-{label}.png"), full_page=True)
    expect(page.locator("#top h1").count() == 1,
           "Premium editorial hero heading missing")
    hero_class = page.locator("#top h1").get_attribute("class") or ""
    expect("nexus-royal-title" in hero_class,
           f"Premium editorial hero typography missing: {hero_class}")

    button = page.locator(".nexus-primary-button").first
    button.hover()
    expect(button.evaluate("(el) => getComputedStyle(el).boxShadow") != "none",
           "Golden CTA hover glow is missing")
    dimensions = page.evaluate("""() => ({page: document.documentElement.scrollWidth, viewport: window.innerWidth})""")
    expect(dimensions["page"] <= dimensions["viewport"] + 2,
           f"Horizontal overflow at {width}px: {dimensions}")
    # Navigate within the current page: Home and the logo must always scroll up.
    page.evaluate("window.scrollTo({top: 800, behavior: 'instant'})")
    page.wait_for_function("window.scrollY > 300")
    if width >= 768:
        page.get_by_role("navigation", name="Main navigation").get_by_role("link", name="Home", exact=True).click()
    else:
        page.get_by_role("button", name="Open navigation menu").click()
        page.get_by_role("navigation", name="Mobile navigation").get_by_role("link", name="Home", exact=True).click()
    page.wait_for_function("window.scrollY <= 2")
    expect(not page.url.endswith("#features"), "Home must clear old anchor")
    page.evaluate("window.scrollTo({top: 800, behavior: 'instant'})")
    page.wait_for_function("window.scrollY > 300")
    page.get_by_role("link", name="Nexus AI home").click()
    page.wait_for_function("window.scrollY <= 2")
    print(f"PASS Home and logo always return to top at {width}px", flush=True)

    if width < 768:
        button = page.get_by_role("button", name="Open navigation menu")
        expect(button.is_visible(), "Mobile menu toggle is missing")
        button.click()
        expect(page.get_by_role("button", name="Close navigation menu").get_attribute("aria-expanded") == "true",
               "Mobile navigation not expanded")
        menu = page.get_by_role("navigation", name="Mobile navigation")
        expect(menu.is_visible(), "Mobile navigation not visible")
        menu.get_by_role("link", name="My portfolio").click()
        expect(page.get_by_role("button", name="Open navigation menu").get_attribute("aria-expanded") == "false",
               "Mobile menu did not close after navigation")
    else:
        expect(page.get_by_role("navigation", name="Main navigation").get_by_role("link", name="My portfolio").is_visible(),
               "Desktop navigation missing certificates")
    page.goto(BASE + "/portfolio", wait_until="networkidle")
    expect(page.get_by_role("heading", name="Certifications & Training").count() == 1, "Missing portfolio certificates heading")
    expect(page.get_by_text("Hacking Ético — Certificado de Asistencia", exact=True).count() == 1, "Missing cybersecurity training")
    expect(page.get_by_text("94", exact=True).count() >= 1, "Incorrect training hours")
    dimensions = page.evaluate("""() => ({page: document.documentElement.scrollWidth, viewport: window.innerWidth})""")
    expect(dimensions["page"] <= dimensions["viewport"] + 2, f"Portfolio horizontal overflow: {dimensions}")
    expect(page.get_by_role("heading", name="Interested in my work?").count() == 1, "Missing contact section")
    expect(page.get_by_role("link", name="View / save my CV").count() == 1, "Missing CV action")
    expect(page.get_by_role("link", name="GitHub", exact=True).count() >= 1, "Missing GitHub profile")
    expect(page.locator("#other-projects article").count() == 3, "Expected exactly three curated project cards")
    for project in ["Task Tracker", "Hangman Game", "Text Encoder / Decoder"]:
        expect(page.get_by_role("link", name="Open live demo: " + project).count() == 1,
               "Missing demo link: " + project)
        expect(page.get_by_role("link", name="View source code: " + project).count() == 1,
               "Missing repository link: " + project)
    for project in ["Task Tracker", "Hangman Game", "Text Encoder / Decoder"]:
        expect(page.get_by_role("link", name="View original project image: " + project).count() == 1,
               "Project missing authentic image link: " + project)
    expect(page.get_by_alt_text("Original screenshot of the JavaScript task tracker.").count() == 1,
           "Missing authentic task tracker screenshot")
    expect(page.get_by_alt_text("Original castle artwork used in the Hangman Game.").count() == 1,
           "Missing project artwork")
    expect(page.get_by_alt_text("Original screenshot of the text encoder and decoder interface.").count() == 1,
           "Missing authentic encoder screenshot")
    group = page.get_by_role("group", name="Filter certificates by record type")
    group.get_by_role("button", name="Attendance certificates").click()
    expect(group.get_by_role("button", name="Attendance certificates").get_attribute("aria-pressed") == "true",
           "Training filter did not activate")
    expect(page.get_by_text("Showing 4 records").is_visible(), "Training records filter count incorrect")
    expect(page.get_by_text("Hacking Ético — Certificado de Asistencia", exact=True).is_visible(),
           "Training record filtered out")
    group.get_by_role("button", name="All records").click()
    expect(page.get_by_text("Showing 6 records").is_visible(), "All records filter did not restore")
    expect(page.locator('img[alt="Certificate for Hacking Ético — Certificado de Asistencia"]').count() == 1,
           "Cybersecurity image missing")
    page.screenshot(path=str(ARTIFACTS / f"portfolio-{label}.png"), full_page=True)
    print(f"PASS home and separate portfolio navigation, filters, image and overflow at {width}px", flush=True)
    page.goto(BASE + "/resume", wait_until="networkidle")
    expect(page.get_by_role("heading", name="Joshua Vallejo Sanchez").is_visible(), "Missing resume heading")
    expect(page.get_by_role("link", name="Download CV (PDF)").is_visible(), "Missing resume PDF download")
    page.screenshot(path=str(ARTIFACTS / f"resume-{label}.png"), full_page=True)
    page.goto(BASE + "/login", wait_until="networkidle")
    expect(page.get_by_role("heading", name="Welcome back.").is_visible(), "Login heading missing")
    expect(page.get_by_role("link", name="Forgot password?").is_visible(), "Recovery navigation missing")
    page.screenshot(path=str(ARTIFACTS / f"login-{label}.png"), full_page=True)
    page.goto(BASE + "/register", wait_until="networkidle")
    expect(page.get_by_role("heading", name="Create your account.").is_visible(), "Register heading missing")
    expect(page.get_by_role("button", name="Create account").is_visible(), "Registration button missing")
    page.screenshot(path=str(ARTIFACTS / f"register-{label}.png"), full_page=True)
    context.close()
    print(f"PASS auth pages at {width}px", flush=True)

def main():
    binary = shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chromium-browser")
    expect(binary is not None, "Chrome/Chromium not installed on runner")
    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=True, executable_path=binary, args=["--no-sandbox"])
        try:
            audit(browser, 375, "mobile")
            audit(browser, 768, "tablet")
            audit(browser, 1440, "desktop")
        finally:
            browser.close()
    print("All browser QA checks passed.", flush=True)

if __name__ == "__main__":
    main()
