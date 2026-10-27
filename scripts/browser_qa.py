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
    expect(page.get_by_role("heading", name="Joshua Vallejo Sanchez").count() == 1,
           "Missing professional portfolio heading")
    expect(page.get_by_role("region", name="Asistente de contacto").count() == 1,
           "Portfolio contact assistant missing")
    expect(page.get_by_role("textbox", name="Tu pregunta").count() == 1,
           "Contact assistant input missing")
    expect(page.get_by_text("Respuestas programadas sobre datos públicos", exact=False).count() == 1,
           "Contact assistant must disclose scripted responses")
    expect(page.get_by_role("heading", name="Proyectos que demuestran cómo trabajo.").count() == 1,
           "Missing project case study heading")
    expect(page.get_by_role("heading", name="Formación y certificaciones.").count() == 1,
           "Missing training heading")
    expect(page.get_by_role("link", name="Ver CV").count() == 1,
           "Missing resume action")
    expect(page.locator('[class*="heroMasthead"]').count() == 1, "Editorial PORTFOLIO wordmark missing")
    expect(page.locator('[class*="heroPortrait"]').count() == 1, "Portfolio hero portrait missing")
    expect(page.locator('[class*="processStrip"]').count() == 1, "Editorial education/skills/process strip missing")
    expect(page.locator('[class*="portfolioContactChat"]').count() == 1, "Footer contact assistant missing")
    order = page.evaluate("""() => {
      const project = document.querySelector('#proyectos');
      const strip = document.querySelector('[class*="processStrip"]');
      const skills = document.querySelector('#habilidades');
      return Boolean(project && strip && skills && project.compareDocumentPosition(strip) & Node.DOCUMENT_POSITION_FOLLOWING && strip.compareDocumentPosition(skills) & Node.DOCUMENT_POSITION_FOLLOWING);
    }""")
    expect(order, "Editorial process strip must follow selected projects before expanded skills")
    dimensions = page.evaluate("""() => ({page: document.documentElement.scrollWidth, viewport: window.innerWidth})""")
    expect(dimensions["page"] <= dimensions["viewport"] + 2,
           f"Homepage horizontal overflow at {width}px: {dimensions}")
    filter_group = page.get_by_role("group", name="Filtrar proyectos")
    filter_group.get_by_role("button", name="Frontend").click()
    expect(filter_group.get_by_role("button", name="Frontend").get_attribute("aria-pressed") == "true",
           "Project filter did not activate")
    expect(page.get_by_role("heading", name="Task Tracker").count() == 1,
           "Task Tracker missing after filtering")
    expect(page.get_by_role("heading", name="Nexus Foundation").count() == 0,
           "Research project not filtered out")
    filter_group.get_by_role("button", name="Todos").click()
    expect(page.get_by_role("heading", name="Nexus Foundation").count() == 1,
           "Project filter did not restore all")
    certificates = page.get_by_role("group", name="Filtrar certificados")
    certificates.get_by_role("button", name="Constancias de asistencia").click()
    expect(page.get_by_role("heading", name="Hacking Ético — Certificado de Asistencia").count() == 1,
           "Attendance certificate missing")
    certificates.get_by_role("button", name="Todos").click()
    # Real browser interaction: footer answers public portfolio questions without
    # calling an external model and prepares (never automatically sends) email.
    contact = page.get_by_role("region", name="Asistente de contacto")
    contact.get_by_role("button", name="Proyectos").click()
    expect(contact.get_by_text("Nexus Foundation es un laboratorio experimental", exact=False).count() == 1,
           "Portfolio FAQ must give a real documented answer")
    contact.get_by_role("button", name="Redes").click()
    expect(contact.get_by_text("GitHub, LinkedIn e Instagram", exact=False).count() == 1,
           "Social FAQ must identify published profiles")
    contact.get_by_role("button", name="Correo", exact=True).click()
    expect(contact.get_by_role("textbox", name="Nombre").is_visible(),
           "Contact FAQ must reveal a mail composer")
    contact.get_by_role("textbox", name="Nombre").fill("Reclutamiento QA")
    contact.get_by_role("textbox", name="Tu correo").fill("qa@example.org")
    contact.get_by_role("textbox", name="Mensaje").fill("Quiero conversar sobre Nexus AI.")
    prepared = contact.get_by_role("link", name="Abrir mi aplicación de correo")
    href = prepared.get_attribute("href") or ""
    expect(href.startswith("mailto:") and "qa%40example.org" in href and "Nexus%20AI" in href,
           "Contact form should prepare a mailto with visitor data, not send data to a server")
    expect(contact.get_by_text("no generación neuronal", exact=False).count() == 1,
           "Contact FAQ must disclose its scripted nature")
    print(f"PASS contact assistant FAQ, verified links and mail composer at {width}px", flush=True)
    if width <= 850:
        menu = page.get_by_role("button", name="Abrir menú")
        expect(menu.is_visible(), "Mobile menu toggle missing")
        menu.click()
        expect(page.get_by_role("button", name="Cerrar menú").get_attribute("aria-expanded") == "true",
               "Mobile menu not expanded")
        page.get_by_role("navigation", name="Menú del portafolio").get_by_role("link", name="Proyectos").click()
        expect(page.get_by_role("button", name="Abrir menú").get_attribute("aria-expanded") == "false",
               "Mobile menu did not close")
    else:
        expect(page.get_by_role("navigation", name="Secciones del portafolio").is_visible(),
               "Desktop navigation missing")
    page.screenshot(path=str(ARTIFACTS / f"career-home-{label}.png"), full_page=True)
    print(f"PASS career homepage, responsive filters and navigation at {width}px", flush=True)
    for language, title in [("en", "Building digital experiences"), ("de", "Ich entwickle digitale Lösungen"), ("fr", "Je crée des expériences numériques"), ("pt", "Construo experiências digitais")]:
        page.goto(BASE + "/" + language, wait_until="networkidle")
        expect(page.get_by_role("heading", name="Joshua Vallejo Sanchez").count() == 1, f"Missing localized heading for {language}")
        selected = page.get_by_role("group", name="Choose portfolio language").get_by_role("link", name={"en":"English","de":"Deutsch","fr":"Français","pt":"Português"}[language])
        expect(selected.get_attribute("aria-current") == "page", f"Current locale not indicated for {language}")
        download = page.get_by_role("link", name={"en":"Download English résumé (PDF)","de":"Lebenslauf auf Deutsch herunterladen (PDF)","fr":"Télécharger le CV en français (PDF)","pt":"Baixar currículo em português (PDF)"}[language])
        expect(download.get_attribute("href") == "/api/resume/pdf?lang="+language, f"Wrong PDF for {language}")
        expect(download.get_attribute("download") == "Joshua-Vallejo-Sanchez-CV-"+language+".pdf", f"Wrong PDF filename for {language}")
        dimensions = page.evaluate("""() => ({page: document.documentElement.scrollWidth, viewport: window.innerWidth})""")
        expect(dimensions["page"] <= dimensions["viewport"] + 2, f"Localized horizontal overflow for {language}: {dimensions}")
    page.goto(BASE, wait_until="networkidle")
    expect(page.get_by_role("link", name="Descargar CV en español (PDF)").get_attribute("href") == "/api/resume/pdf?lang=es", "Spanish portfolio download mismatch")
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
    expect(page.get_by_role("link", name="Descargar CV en español (PDF)").is_visible(), "Missing resume PDF download")
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
