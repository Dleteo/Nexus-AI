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

def audit_factory_execution_disclosure(browser):
    """Presentation regression only: mocked static QA must never imply execution."""
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()
    job = {
        "id": "1" * 32,
        "request": "A static starter with successful template checks",
        "kind": "feature",
        "status": "built",
        "createdAt": "2026-10-28T00:00:00Z",
        "plan": {
            "template": "static-landing-page", "scope": "Fixed template only",
            "files": ["index.html", "styles.css", "README.md"], "stages": [], "acceptance": [],
        },
        "events": [],
        "qa": {"passed": True, "mode": "static-validation", "checks": [{"name": "Static template files", "passed": True}]},
        "downloadReady": True,
        "execution": {"enabled": False, "status": "not_run", "reason": "isolation_not_verified"},
    }
    calls = []
    def factory_response(route):
        calls.append(route.request.method)
        route.fulfill(status=200, json={"ok": True, "jobs": [job]})
    page.route("**/api/labs/factory", factory_response)
    try:
        for language, title in [
            ("es", "Pruebas de ejecución: no ejecutadas"),
            ("en", "Execution tests: not run"),
            ("de", "Ausführungstests: nicht ausgeführt"),
            ("fr", "Tests d’exécution : non exécutés"),
            ("pt", "Testes de execução: não executados"),
        ]:
            path = "/labs" if language == "es" else "/" + language + "/labs"
            page.goto(BASE + path + "?lab=factory", wait_until="networkidle")
            page.get_by_role("heading", name=title, exact=True).wait_for(state="visible")
            page.get_by_role("button", name="Use local Factory", exact=True).click()
            page.get_by_text("QA: PASSED · static-validation", exact=True).wait_for(state="visible")
            expect(page.get_by_role("region", name=title, exact=True).is_visible(),
                   f"Static QA success must leave execution visibly not run in {language}")
        expect(calls == ["GET"] * 5, "Disclosure must not submit execution or build requests")
        print("PASS five-language execution disclosure with mocked successful static QA; no sandbox verified", flush=True)
    finally:
        context.close()

def audit_featured_case_studies(browser):
    """Each of the five featured projects must have a reachable case study in five languages."""
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()
    projects = [
        ("nexus-ai", "Nexus AI"),
        ("nexus-commerce", "Nexus Commerce"),
        ("nexus-studio", "Nexus Studio"),
        ("nexus-monitor", "Nexus Monitor"),
        ("nexus-software-factory", "Nexus Software Factory"),
    ]
    labels = {"es": "Ver caso de estudio", "en": "Read case study",
              "de": "Fallstudie lesen", "fr": "Voir l’étude de cas",
              "pt": "Ver estudo de caso"}
    for language, button_label in labels.items():
        home = "/" if language == "es" else "/" + language
        page.goto(BASE + home, wait_until="networkidle")
        study_links = page.get_by_role("link", name=button_label, exact=False)
        expect(study_links.count() == 5, f"Expected five case-study links for {language}")
        for slug, title in projects:
            url = f"/projects/{slug}?lang={language}"
            expect(page.locator('a[href="' + url + '"]').count() >= 1,
                   f"Missing featured case study link: {language} {slug}")
            page.goto(BASE + url, wait_until="domcontentloaded")
            page.get_by_role("heading", name=title, exact=True).wait_for(state="visible", timeout=15000)
            expect(page.get_by_role("link", name="GitHub source" if language=="en" else
                                    "Código en GitHub" if language=="es" else
                                    "GitHub-Code" if language=="de" else
                                    "Code GitHub" if language=="fr" else "Código no GitHub").count()==1,
                   f"Missing code provenance: {language} {slug}")
            expect(page.locator("section").count() >= 4, f"Case study incomplete: {slug}")
            page.goto(BASE + home, wait_until="domcontentloaded")
        print(f"PASS five case studies in {language}", flush=True)
    for lab, slug in [("commerce","nexus-commerce"),("studio","nexus-studio"),
                      ("monitor","nexus-monitor"),("factory","nexus-software-factory")]:
        page.goto(BASE + "/labs?lab=" + lab, wait_until="networkidle")
        page.get_by_role("link", name="Leer arquitectura y pruebas").wait_for(state="visible", timeout=10000)
        expect(page.locator('a[href="/projects/' + slug + '?lang=es"]').count() == 1,
               f"Lab must link to matching case study: {lab}")
    context.close()
    print("PASS five documented projects and four lab evidence links", flush=True)

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
    portrait = page.locator('[class*="heroPortrait"]')
    applied_mask = portrait.evaluate("(el) => getComputedStyle(el).maskImage")
    expect("portrait-silhouette-mask.svg" in applied_mask,
           "Background removal mask is not applied to the portrait")
    mask_asset = page.request.get(BASE + "/portfolio/portrait-silhouette-mask.svg")
    expect(mask_asset.status == 200, "Background removal asset could not be loaded")
    image_asset = page.request.get(BASE + "/portfolio/portrait-color-reconstruction.webp")
    expect(image_asset.status == 200, "Original portrait image missing")

    expect(page.locator('[class*="projectCard"]').count() == 5, "Expected Nexus AI and four engineering lab featured cards")
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
    controls = page.get_by_role("navigation", name="Opciones del CV")
    expect(controls.count() == 1, "Resume must have a compact controls-only navigation")
    expect(controls.get_by_role("link", name="Volver al portafolio").count() == 1,
           "Resume back button missing")
    expect(controls.get_by_label("Cambiar idioma").is_visible(),
           "Resume language selector missing")
    expect(page.locator('[class*="desktopNav"]').count() == 0,
           "The full portfolio navbar must not appear in the CV")

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
    expect(page.get_by_role("heading", name="Cinco proyectos para explicar ante entrevistadores").count() == 1,
           "Five-project interview walkthrough missing")
    expect(page.get_by_role("link", name="Ver caso de estudio").count() == 5,
           "Interview guide must link exactly five featured case studies")
    expect(page.get_by_text("¿Software Factory es una IA que programa sola?").count() == 1,
           "Factory limitations must be rehearsable in the interview guide")
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
    # Deep-link from the featured portfolio into each engineering lab.
    for lab, title in [("commerce","Nexus Commerce"),("studio","Nexus Studio"),("monitor","Nexus Monitor"),("factory","Nexus Software Factory")]:
        page.goto(BASE + "/labs?lab=" + lab, wait_until="networkidle")
        page.get_by_role("heading", name=title).wait_for(state="visible", timeout=10000)
    # Four engineering lab demos: navigation and core user paths.
    page.goto(BASE + "/labs?lab=commerce", wait_until="networkidle")
    expect(page.get_by_role("heading", name="CUATRO PROYECTOS.").is_visible(), "Engineering labs missing")
    expect(page.get_by_role("button", name="Add to cart").count() == 4, "Commerce catalog missing")
    page.get_by_role("searchbox", name="Search products").fill("Keyboard")
    expect(page.get_by_role("button", name="Add to cart").count() == 1, "Catalog search did not filter")
    page.get_by_role("searchbox", name="Search products").clear()
    page.get_by_role("combobox", name="Category").select_option("Audio")
    expect(page.get_by_role("button", name="Add to cart").count() == 1, "Category filter did not work")
    page.get_by_role("combobox", name="Category").select_option("all")
    page.get_by_role("button", name="Add to cart").first.click()
    page.get_by_role("button", name="Place demo order").click()
    expect(page.get_by_role("status").get_by_text("Demo order created.", exact=False).is_visible(), "Checkout failed")
    page.get_by_role("button", name="Nexus Studio").click()
    expect(page.get_by_role("button", name="Export HTML").is_visible(), "HTML editor export missing")
    page.get_by_role("button", name="Use local SQLite").click()
    page.get_by_text("Studio SQLite unavailable.", exact=False).wait_for(state="visible", timeout=10000)
    expect(page.get_by_role("button", name="Export HTML").is_visible(), "Browser editor must remain usable without SQLite")
    page.get_by_label("Selected block text").fill("Browser editor test")
    expect(page.get_by_text("Browser editor test", exact=True).count() >= 1, "Live editing failed")
    page.get_by_label("Selected block text").blur()
    page.get_by_role("button", name="Undo", exact=True).click()
    expect(page.get_by_text("Build something remarkable.", exact=True).count() >= 1, "Undo text edit failed")
    page.get_by_role("button", name="Redo", exact=True).click()
    expect(page.get_by_text("Browser editor test", exact=True).count() >= 1, "Redo text edit failed")
    page.get_by_role("button", name="Nexus Monitor").click()
    page.get_by_role("button", name="Use local SQLite").click()
    page.get_by_text("Monitor SQLite unavailable.", exact=False).wait_for(state="visible", timeout=10000)
    expect(page.get_by_role("button", name="Run health check").is_visible(), "Browser monitor should work without local SQLite")
    page.get_by_role("button", name="Run health check").click()
    page.get_by_text("HEALTHY", exact=True).first.wait_for(state="visible", timeout=10000)
    expect(page.get_by_text("p95 successful latency:", exact=False).is_visible(), "Monitor p95 missing")
    page.get_by_role("button", name="Nexus Software Factory").click()
    page.get_by_role("button", name="Use local Factory").click()
    page.get_by_text("Local Factory unavailable.", exact=False).wait_for(state="visible", timeout=10000)
    expect(page.get_by_role("button", name="Create reviewable plan").is_visible(), "Browser planning mode should remain usable")
    page.get_by_role("button", name="Create reviewable plan").click()
    page.get_by_text("○ Implementation", exact=True).wait_for(state="visible", timeout=10000)
    approve = page.get_by_role("button", name="Approve plan (manual work only)")
    expect(approve.is_disabled(), "Factory must require explicit human confirmation")
    page.get_by_role("checkbox", name="I reviewed this plan.", exact=False).check()
    approve.click()
    expect(page.get_by_text("approved-for-manual-work").is_visible(), "Review status missing")
    page.screenshot(path=str(ARTIFACTS / f"labs-{label}.png"), full_page=True)
    print(f"PASS four engineering labs at {width}px", flush=True)
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
            audit_factory_execution_disclosure(browser)
            audit_featured_case_studies(browser)
        finally:
            browser.close()
    print("All browser QA checks passed.", flush=True)

if __name__ == "__main__":
    main()
