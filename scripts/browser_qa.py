"""Browser QA against a locally built Next.js server, without credentials."""
from pathlib import Path
import os
import shutil

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
    expect(page.get_by_role("heading", name="JOSHUA VALLEJO SANCHEZ").count() == 1,
           "Editorial portfolio headline missing")
    expect(page.get_by_role("heading", name="PROYECTOS DESTACADOS").count() == 1,
           "Featured projects section missing")
    expect(page.get_by_role("region", name="Asistente de contacto").count() == 1,
           "Footer contact assistant missing")
    expect(page.locator('[class*="heroBackdrop"]').count() == 1, "Oversized portfolio wordmark missing")
    expect(page.locator('[class*="heroPortrait"]').count() == 1, "Owned portrait missing")
    expect(page.locator('[class*="projectCard"]').count() == 3, "Expected three real featured project cards")
    expect(page.locator('[class*="proofColumn"]').count() == 3, "Education, skills and process strip missing")
    dimensions = page.evaluate("""() => ({page: document.documentElement.scrollWidth, viewport: window.innerWidth})""")
    expect(dimensions["page"] <= dimensions["viewport"] + 2, f"Homepage horizontal overflow at {width}px: {dimensions}")
    contact = page.get_by_role("region", name="Asistente de contacto")
    contact.get_by_role("button", name="Proyectos").click()
    expect(contact.get_by_text("Nexus Foundation es un laboratorio experimental", exact=False).count() == 1,
           "Public FAQ should respond accurately")
    contact.get_by_role("button", name="Correo", exact=True).click()
    expect(contact.get_by_role("textbox", name="Nombre").is_visible(), "Email form missing")
    contact.get_by_role("textbox", name="Nombre").fill("Reclutamiento QA")
    contact.get_by_role("textbox", name="Tu correo").fill("qa@example.org")
    contact.get_by_role("textbox", name="Mensaje").fill("Me interesa tu portfolio")
    href = contact.get_by_role("link", name="Abrir mi aplicación de correo").get_attribute("href") or ""
    expect(href.startswith("mailto:") and "qa%40example.org" in href, "Mail must be prepared locally")
    if width <= 760:
        menu = page.get_by_role("button", name="Menú")
        expect(menu.is_visible(), "Mobile menu must be visible")
        menu.click()
        expect(page.get_by_role("navigation", name="Mobile portfolio navigation").is_visible(), "Mobile menu failed")
        page.get_by_role("navigation", name="Mobile portfolio navigation").get_by_role("link", name="PROYECTOS").click()
    else:
        expect(page.get_by_role("navigation", name="Navegación principal").is_visible(), "Desktop nav missing")
    page.screenshot(path=str(ARTIFACTS / f"career-home-{label}.png"), full_page=True)
    print(f"PASS career homepage, responsive filters and navigation at {width}px", flush=True)
    for language, label in [("en", "FEATURED PROJECTS"), ("de", "AUSGEWÄHLTE PROJEKTE"), ("fr", "PROJETS À LA UNE"), ("pt", "PROJETOS EM DESTAQUE")]:
        page.goto(BASE + "/" + language, wait_until="networkidle")
        expect(page.get_by_role("heading", name=label).count() == 1, f"Incorrect localized heading: {language}")
        expect(page.locator('[class*="heroBackdrop"]').count() == 1, "Different layout in localized page")
        dimensions = page.evaluate("""() => ({page: document.documentElement.scrollWidth, viewport: window.innerWidth})""")
        expect(dimensions["page"] <= dimensions["viewport"] + 2, f"Localized page overflow at {width}px: {language}")
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
    expect(page.get_by_role("heading", name="JOSHUA VALLEJO SANCHEZ").is_visible(), "Missing resume heading")
    expect(page.get_by_role("link", name="Descargar CV en español (PDF)").is_visible(), "Missing resume PDF download")
    expect(page.get_by_role("link", name="srjoshua08@gmail.com").count() >= 1,
           "The verified email must be visible and clickable")
    expect(page.locator('[class*="topCards"]').count() == 1,
           "Editorial resume must use the same card layout")
    for lang, heading in [("en", "CAREER GOAL"), ("de", "BERUFSZIEL"), ("fr", "OBJECTIF PROFESSIONNEL"), ("pt", "OBJETIVO PROFISSIONAL")]:
        page.goto(BASE + "/resume?lang=" + lang, wait_until="networkidle")
        expect(page.get_by_role("heading", name=heading).count() == 1,
               f"Editorial resume heading missing in {lang}")
        expect(page.locator('[class*="topCards"]').count() == 1,
               f"Editorial resume layout missing in {lang}")
        expect(page.locator('[class*="heroPhoto"]').count() == 1,
               f"Editorial resume portrait missing in {lang}")
        dimensions = page.evaluate("""() => ({page: document.documentElement.scrollWidth, viewport: window.innerWidth})""")
        expect(dimensions["page"] <= dimensions["viewport"] + 2,
               f"Resume horizontal overflow at {width}px in {lang}: {dimensions}")
    page.goto(BASE + "/resume", wait_until="networkidle")
    page.screenshot(path=str(ARTIFACTS / f"resume-{label}.png"), full_page=True)
    page.goto(BASE + "/interview", wait_until="networkidle")
    expect(page.get_by_role("heading", name="Presentación profesional para entrevistas").is_visible(), "Missing interview guide")
    expect(page.locator("details").count() >= 5, "Expected interview practice questions")
    page.goto(BASE + "/projects/nexus-ai", wait_until="networkidle")
    expect(page.get_by_role("heading", name="Nexus AI", exact=True).is_visible(), "Missing case study")
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
