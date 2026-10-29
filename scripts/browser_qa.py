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
            expect(page.locator('section[aria-label] input[type="checkbox"]').count() == 4,
                   f"Interview prep checklist missing: {language} {slug}")
            challenge = page.get_by_role("region", name={
                "es":"Desafío técnico","en":"Architecture challenge",
                "de":"Architekturaufgabe","fr":"Défi d'architecture",
                "pt":"Desafio de arquitetura",
            }[language])
            expect(challenge.get_by_role("button").count() == 3, f"Architecture choices missing: {language} {slug}")
            if language == "es":
                correct_index = {
                    "nexus-ai":1,"nexus-commerce":2,"nexus-studio":0,
                    "nexus-monitor":1,"nexus-software-factory":2,
                }[slug]
                challenge.get_by_role("button").nth(correct_index).click()
                expect(challenge.get_by_role("status").is_visible(), f"Learning feedback missing: {slug}")
                challenge.get_by_role("button", name="Intentar otra vez").click()

            if language == "es" and slug == "nexus-ai":
                region = page.get_by_role("region", name="Prepara cómo explicar este proyecto")
                region.get_by_role("checkbox").first.check()
                expect(region.get_by_text("1/4 partes revisadas").is_visible(),
                       "Manual interview review state did not update")
                with page.expect_download() as download_info:
                    region.get_by_role("button", name="Descargar notas de entrevista").click()
                expect(download_info.value.suggested_filename == "nexus-interview-nexus-ai.md",
                       "Interview notes download missing")

            expect(page.get_by_role("link", name="GitHub source" if language=="en" else
                                    "Código en GitHub" if language=="es" else
                                    "GitHub-Code" if language=="de" else
                                    "Code GitHub" if language=="fr" else "Código no GitHub").count()==1,
                   f"Missing code provenance: {language} {slug}")
            expect(page.locator("section").count() >= 4, f"Case study incomplete: {slug}")
            if slug != "nexus-ai":
                lab_id = "factory" if slug == "nexus-software-factory" else slug.removeprefix("nexus-")
                localized_path = ("/labs" if language == "es" else "/" + language + "/labs")
                demo_href = localized_path + "/" + lab_id
                expect(page.locator('a[href="' + demo_href + '"]').count() == 1,
                       f"Case-study demo must retain locale {language}: {slug}")
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

def audit_contact_guide_multilingual(browser):
    """The public contact guide must describe the five current demos and preserve locale."""
    context = browser.new_context(viewport={"width": 1280, "height": 900})
    page = context.new_page()
    translations = {
        "es": ("/", "Asistente de contacto", "Proyectos", "Casos de estudio destacados"),
        "en": ("/en", "Contact assistant", "Projects", "Featured case studies"),
        "de": ("/de", "Kontaktassistent", "Projekte", "Fallstudien der Hauptprojekte"),
        "fr": ("/fr", "Assistant de contact", "Projets", "Études de cas principales"),
        "pt": ("/pt", "Assistente de contato", "Projetos", "Estudos de caso em destaque"),
    }
    slugs = ["nexus-ai", "nexus-commerce", "nexus-studio", "nexus-monitor",
             "nexus-software-factory"]
    for lang, (path, name, button, nav_label) in translations.items():
        page.goto(BASE + path, wait_until="networkidle")
        contact = page.get_by_role("region", name=name)
        contact.get_by_role("button", name=button, exact=True).click()
        guide = contact.get_by_role("navigation", name=nav_label)
        expect(guide.get_by_role("link").count() == 5,
               f"All five current projects should be discoverable in {lang}")
        for slug in slugs:
            href = f"/projects/{slug}?lang={lang}"
            expect(guide.locator('a[href="' + href + '"]').count() == 1,
                   f"Contact guide must link localized evidence {lang}: {slug}")
        expect(contact.get_by_text("Nexus Foundation es un laboratorio", exact=False).count() == 0,
               "Featured answer must not revert to the outdated project listing")
        page.screenshot(path=str(ARTIFACTS / f"contact-five-projects-{lang}.png"),full_page=False)
    # Typed technical questions have a different scope from the portfolio guide.
    page.goto(BASE + "/", wait_until="networkidle")
    contact = page.get_by_role("region", name="Asistente de contacto")
    contact.get_by_role("textbox", name="Tu pregunta").fill("Nexus Technical")
    contact.get_by_role("button", name="Preguntar").click()
    expect(contact.get_by_text("Requiere inicio de sesión y motor configurado", exact=False).count() == 1,
           "Technical questions must disclose sign-in and model requirements")
    expect(contact.get_by_role("navigation", name="Casos de estudio destacados").count() == 0,
           "Technical answer must not be misclassified as a portfolio project")
    toggle = contact.get_by_role("button", name="Preparar correo", exact=False)
    expect(toggle.get_attribute("aria-controls") == "nexus-contact-email-form",
           "Email toggle must describe the panel it expands")
    toggle.click()
    expect(toggle.get_attribute("aria-expanded") == "true",
           "Email panel expanded state must be announced")
    expect(contact.get_by_role("group", name="Preparar un mensaje de correo").is_visible(),
           "Email draft form needs a labeled group")
    toggle.click()
    expect(toggle.get_attribute("aria-expanded") == "false",
           "Email panel should be explicitly collapsible")
    expect(contact.get_by_role("group", name="Preparar un mensaje de correo").count() == 0,
           "Closing the email form should remove the draft inputs")
    context.close()
    print("PASS five localized contact guides, technical-question routing and accessible email form",flush=True)

def audit_labs_keyboard_and_localization(browser):
    """Four accessible lab selections and five-language guided walkthroughs."""
    context=browser.new_context(viewport={"width":1280,"height":900})
    page=context.new_page()
    pages=[
        ("es", "/labs", "Recorrido de la demostración"),
        ("en", "/en/labs", "Demo walkthrough"),
        ("de", "/de/labs", "Demo-Ablauf"),
        ("fr", "/fr/labs", "Parcours de démonstration"),
        ("pt", "/pt/labs", "Roteiro de demonstração"),
    ]
    for language, path, title in pages:
        page.goto(BASE+path+"?lab=commerce",wait_until="networkidle")
        guide=page.get_by_role("region",name=title)
        expect(guide.is_visible(),f"Missing translated lab guidance: {language}")
        expect(guide.locator("ol > li").count()==3,f"Wrong number of walkthrough steps: {language}")
        expect(page.get_by_role("button",name="Nexus Commerce").get_attribute("aria-pressed")=="true",
               f"Active lab must be announced: {language}")
        expect(page.get_by_role("region",name="Active engineering lab").count()==1,
               f"Active lab panel missing: {language}")
    page.goto(BASE+"/labs?lab=commerce",wait_until="networkidle")
    lab_navigation=page.get_by_role("navigation",name="Nexus labs")
    commerce=lab_navigation.get_by_role("button",name="Nexus Commerce")
    commerce.focus()
    page.keyboard.press("ArrowRight")
    studio=lab_navigation.get_by_role("button",name="Nexus Studio")
    expect(studio.get_attribute("aria-pressed")=="true","ArrowRight should select Studio")
    expect(studio.evaluate("(el) => document.activeElement === el"),
           "Arrow navigation should move keyboard focus")
    expect("lab=studio" in page.url,"Keyboard lab navigation must update shareable URL")
    page.keyboard.press("End")
    expect(lab_navigation.get_by_role("button",name="Nexus Software Factory").get_attribute("aria-pressed")=="true",
           "End should select last lab")
    page.keyboard.press("Home")
    expect(commerce.get_attribute("aria-pressed")=="true","Home should select first lab")
    for lab in ["commerce","studio","monitor","factory"]:
        lab_navigation.get_by_role("button",name={"commerce":"Nexus Commerce","studio":"Nexus Studio",
            "monitor":"Nexus Monitor","factory":"Nexus Software Factory"}[lab]).click()
        expect(page.get_by_role("region",name="Recorrido de la demostración").locator("ol > li").count()==3,
               f"Demo guide must follow selected module: {lab}")
    context.close()
    print("PASS keyboard-friendly lab nav, guided demos in all five languages",flush=True)

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
    greeting = page.locator('[class*="handwrittenInk"]')
    expect(greeting.count() == 1 and greeting.inner_text() == "Hola, soy",
           "Handwritten introduction text missing")
    greeting_animation = greeting.evaluate("(el) => getComputedStyle(el).animationName")
    expect("nexusGreetingWriteErase" in greeting_animation,
           "Handwritten greeting must erase and reappear in a loop")
    portrait = page.locator('[class*="heroPortrait"]')
    applied_mask = portrait.evaluate("(el) => getComputedStyle(el).maskImage")
    expect("portrait-silhouette-mask.svg" not in applied_mask,
           "The transparent portrait must not use the mismatched legacy silhouette mask")
    page.screenshot(path=str(ARTIFACTS / f"hero-reference-check-{label}.png"), full_page=False)
    portrait_source = portrait.evaluate("(el) => getComputedStyle(el).backgroundImage")
    expect("joshua-cutout.png" in portrait_source,
           "Homepage must use the high-resolution transparent portrait")
    image_asset = page.request.get(BASE + "/portfolio/joshua-cutout.png")
    expect(image_asset.status == 200, "High-resolution portrait image missing")
    original_width = page.evaluate("""async () => {
        const image = new Image();
        image.src = '/portfolio/joshua-cutout.png';
        await image.decode();
        return image.naturalWidth;
    }""")
    expect(original_width >= 1024, "Portrait source must retain its original resolution")

    expect(page.locator('[class*="projectCard"]').count() == 5, "Expected Nexus AI and four engineering lab featured cards")
    project_cards = page.locator('article[data-project]')
    expect(project_cards.count() == 5, "Every featured project needs an individual presentation")
    workspace_card = page.locator('article[data-project="workspace"]')
    expect(workspace_card.count() == 1, "Nexus AI featured application card missing")
    preview = workspace_card.locator('[class*="workspaceWindow"]')
    expect(preview.count() == 1, "Premium Nexus dashboard preview missing")
    expect(preview.locator('[class*="noteCards"] > [class*="workspaceFeature"]').count() == 3,
           "Nexus Workspace must show three detailed feature panels, not skeleton rectangles")
    expect(preview.locator('[class*="workspaceFeatureIcon"]').count() == 3,
           "Gold-on-obsidian feature icon tiles missing")
    expect(workspace_card.locator('a[href*="/projects/nexus-ai?lang="]').count() >= 1,
           "Portfolio card must retain working Nexus AI case-study link")
    previous_bottom = None
    for project in project_cards.all():
        bounds = project.bounding_box()
        expect(bounds is not None, "Project presentation must be visible")
        if previous_bottom is not None:
            expect(bounds["y"] >= previous_bottom + 20,
                   "Projects must have separate rows with readable spacing")
        previous_bottom = bounds["y"] + bounds["height"]
    expect(page.locator('[class*="proofColumn"]').count() == 3, "Education, skills and process strip missing")
    dimensions = page.evaluate("""() => ({page: document.documentElement.scrollWidth, viewport: window.innerWidth})""")
    expect(dimensions["page"] <= dimensions["viewport"] + 2, f"Homepage horizontal overflow at {width}px: {dimensions}")
    contact = page.get_by_role("region", name="Asistente de contacto")
    contact.get_by_role("button", name="Proyectos").click()
    expect(contact.get_by_text("Estos son mis cinco proyectos destacados", exact=False).count() == 1,
           "Contact guide must accurately feature the current five projects")
    expect(contact.get_by_role("navigation", name="Casos de estudio destacados").get_by_role("link").count() == 5,
           "Contact answer must link all five featured case studies")
    contact.get_by_role("button", name="Correo", exact=True).click()
    expect(contact.get_by_role("textbox", name="Nombre").is_visible(), "Email form missing")
    contact.get_by_role("textbox", name="Nombre").fill("Reclutamiento QA")
    contact.get_by_role("textbox", name="Tu correo").fill("qa@example.org")
    contact.get_by_role("textbox", name="Mensaje").fill("Me interesa tu portfolio")
    href = contact.get_by_role("link", name="Abrir mi aplicación de correo").get_attribute("href") or ""
    expect(href.startswith("mailto:") and "qa%40example.org" in href, "Mail must be prepared locally")
    skip_link = page.get_by_role("link", name="Ir al contenido")
    expect(skip_link.get_attribute("href") == "#main-content", "Skip link must target the main content")
    expect(page.locator("main#main-content").count() == 1, "Main content landmark missing")
    if width <= 760:
        menu = page.get_by_role("button", name="Menú")
        expect(menu.is_visible(), "Mobile menu must be visible")
        menu.click()
        expect(page.get_by_role("navigation", name="Mobile portfolio navigation").is_visible(), "Mobile menu failed")
        expect(menu.get_attribute("aria-expanded") == "true", "Menu expanded state must be announced")
        expect(menu.get_attribute("aria-controls") == "mobile-portfolio-nav", "Menu button must identify its panel")
        page.get_by_role("navigation", name="Mobile portfolio navigation").get_by_role("link", name="HABILIDADES").focus()
        page.keyboard.press("Escape")
        expect(page.get_by_role("navigation", name="Mobile portfolio navigation").count() == 0, "Escape should close mobile menu")
        expect(menu.get_attribute("aria-expanded") == "false", "Escape must update expanded state")
        expect(menu.evaluate("(element) => document.activeElement === element"), "Escape should restore menu focus")
        menu.click()
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
    expect(page.url == BASE + "/", "Legacy portfolio must redirect to the current Spanish portfolio")
    featured = page.locator("#proyectos")
    expect(featured.locator("article").count() == 5, "Canonical portfolio must show five current projects")
    for project in ["Nexus AI Workspace", "Nexus Commerce", "Nexus Studio", "Nexus Monitor", "Nexus Software Factory"]:
        expect(featured.get_by_role("heading", name=project, exact=True).count() == 1,
               "Canonical portfolio missing current project: " + project)
    expect(page.get_by_role("heading", name="EDUCACIÓN Y FORMACIÓN", exact=False).count() == 1,
           "Canonical portfolio must retain documented training")
    expect(page.locator("#certificados").get_by_role("link", name="Ver formación y CV", exact=False).count() == 1,
           "Canonical portfolio must retain its training and CV link")
    expect(page.get_by_role("link", name="Ver CV", exact=False).count() >= 1, "Canonical portfolio CV action missing")
    dimensions = page.evaluate("""() => ({page: document.documentElement.scrollWidth, viewport: window.innerWidth})""")
    expect(dimensions["page"] <= dimensions["viewport"] + 2, f"Canonical portfolio horizontal overflow: {dimensions}")
    page.screenshot(path=str(ARTIFACTS / f"portfolio-canonical-{label}.png"), full_page=True)
    page.goto(BASE + "/portfolio?lang=en", wait_until="networkidle")
    expect(page.url == BASE + "/en", "Legacy portfolio must preserve the selected language")
    expect(page.get_by_role("heading", name="FEATURED PROJECTS", exact=False).count() == 1,
           "Localized canonical portfolio missing after redirect")
    print(f"PASS canonical portfolio redirects, five projects, training and CV at {width}px", flush=True)
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
    if width <= 650:
        font_size = page.locator('[class*="summary"]').first.evaluate(
            "(el) => parseFloat(getComputedStyle(el).fontSize)")
        expect(font_size >= 12, f"Resume summary must remain readable on mobile: {font_size}px")
        summary_height = controls.get_by_label("Cambiar idioma").evaluate(
            "(el) => el.getBoundingClientRect().height")
        expect(summary_height >= 44, "CV language selector target must be at least 44px high")
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
    compare = page.get_by_role("region", name="Compara las cinco arquitecturas")
    expect(compare.is_visible(), "Interview project comparison is missing")
    compare.get_by_label("Primer proyecto").select_option("nexus-commerce")
    compare.get_by_label("Segundo proyecto").select_option("nexus-studio")
    expect(compare.get_by_role("heading", name="Nexus Commerce").count() == 1,
           "Commerce architecture should appear in comparison")
    expect(compare.get_by_role("heading", name="Nexus Studio").count() == 1,
           "Studio architecture should appear in comparison")
    compare.get_by_label("Segundo proyecto").select_option("nexus-commerce")
    expect(compare.get_by_text("Has elegido el mismo proyecto.", exact=False).is_visible(),
           "Comparison must indicate identical selections")
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
    # Each engineering product has a distinct visual surface and accessible navigation.
    for lab in ("commerce", "studio", "monitor", "factory"):
        page.goto(BASE + "/labs?lab=" + lab, wait_until="networkidle")
        shell = page.locator("main.nexus-lab-shell")
        expect(shell.get_attribute("data-lab") == lab, "Wrong active product identity: " + lab)
        expect(page.locator(".lab-product-overview-" + lab).count() == 1, "Missing real product overview: " + lab)
        expect(page.locator(".lab-product-overview").count() == 1, "Missing unique product overview: " + lab)
        expect(not page.evaluate("document.documentElement.scrollWidth > innerWidth + 2"),
               "Horizontal overflow in " + lab)
    # Return to Commerce for the existing functional flows.
    page.goto(BASE + "/labs?lab=commerce", wait_until="networkidle")
    # Four engineering lab demos: navigation and core user paths.
    page.goto(BASE + "/labs?lab=commerce", wait_until="networkidle")
    expect(page.get_by_role("heading", name="Los cuatro laboratorios", level=1).is_visible(), "Engineering labs missing")
    expect(page.get_by_role("button", name="Add to cart").count() == 4, "Commerce catalog missing")
    # Catalog and hero preview must use curated photographic sources (or graceful offline fallback).
    for product_id in ("keyboard", "headset", "monitor", "mouse"):
        photo = page.locator('.commerce-catalog [data-product-photo="' + product_id + '"]')
        expect(photo.count() == 1, "Commerce photo container missing: " + product_id)
        remote = photo.locator("img")
        if remote.count():
            url = remote.first.get_attribute("src") or ""
            expect(url.startswith("https://images.unsplash.com/photo-"),
                   "Commerce photo must use a curated fixed source: " + product_id)
            expect(bool(remote.first.get_attribute("alt")),
                   "Commerce product photograph needs descriptive alt text: " + product_id)
        else:
            expect(photo.get_by_role("img").count() == 1,
                   "Offline commerce photo must display its accessible fallback: " + product_id)
    expect(page.locator(".lab-screen-products [data-product-photo]").count() == 3,
           "Storefront preview must use real product image component")
    page.get_by_role("searchbox", name="Search products").fill("Keyboard")
    expect(page.get_by_role("button", name="Add to cart").count() == 1, "Catalog search did not filter")
    page.get_by_role("searchbox", name="Search products").clear()
    page.get_by_role("combobox", name="Category").select_option("Audio")
    expect(page.get_by_role("button", name="Add to cart").count() == 1, "Category filter did not work")
    page.get_by_role("combobox", name="Category").select_option("all")
    page.get_by_role("button", name="Add to cart").first.click()
    page.get_by_role("button", name="Add one Mechanical Keyboard").click()
    cart_review = page.get_by_role("region", name="Cart price breakdown")
    expect(cart_review.is_visible(), "Itemized demo cart estimate missing")
    expect(cart_review.get_by_text("Total estimated:", exact=False).is_visible(),
           "Cart total estimate must be visible")
    expect(page.get_by_text("Mechanical Keyboard × 2").is_visible(),
           "Cart quantity increase failed")
    page.get_by_role("button", name="Remove one Mechanical Keyboard").click()
    expect(page.get_by_text("Mechanical Keyboard × 1").is_visible(),
           "Cart quantity decrease failed")
    page.get_by_role("button", name="Place demo order").click()
    expect(page.get_by_role("button", name="Export demo orders CSV").is_enabled(),
           "Commerce CSV export should unlock after a demo order")
    expect(page.get_by_role("status").get_by_text("Demo order created.", exact=False).is_visible(), "Checkout failed")
    page.get_by_role("button", name="Nexus Studio").click()
    expect(page.get_by_role("button", name="Export HTML").is_visible(), "HTML editor export missing")
    expect(page.get_by_role("button", name="Export blocks JSON").is_visible(), "Studio JSON export missing")
    expect(page.get_by_role("region", name="Studio static content audit").is_visible(),
           "Studio limited content audit missing")
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

    studio_json = ('{"format":"nexus-studio-document","version":1,'
                   '"source":"browser-simulation","blocks":'
                   '[{"id":"hero-new","type":"hero","text":"Imported locally"}]}')
    page.locator("#studio-import-json").set_input_files({
        "name":"nexus-studio-document.json",
        "mimeType":"application/json",
        "buffer":studio_json.encode("utf-8"),
    })
    page.get_by_text("Validated preview: 1 blocks").wait_for(state="visible")
    expect(page.get_by_text("Browser editor test", exact=True).count() >= 1,
           "Review-only import should not replace current editor")
    page.get_by_role("button", name="Replace editor with preview").click()
    page.get_by_text("Imported locally", exact=True).first.wait_for(state="visible")
    page.get_by_role("button", name="Undo", exact=True).click()
    expect(page.get_by_text("Browser editor test", exact=True).count() >= 1,
           "Imported Studio document must be undoable")

    page.get_by_role("button", name="Nexus Monitor").click()
    page.get_by_role("button", name="Use local SQLite").click()
    page.get_by_text("Monitor SQLite unavailable.", exact=False).wait_for(state="visible", timeout=10000)
    expect(page.get_by_role("button", name="Run health check").is_visible(), "Browser monitor should work without local SQLite")
    page.get_by_role("button", name="Run health check").click()
    page.get_by_text("HEALTHY", exact=True).first.wait_for(state="visible", timeout=10000)
    expect(page.get_by_text("p95 successful latency:", exact=False).is_visible(), "Monitor p95 missing")
    expect(page.get_by_role("button", name="Export manual samples CSV").is_enabled(), "Monitor CSV export missing")
    expect(page.get_by_role("region", name="Manual incident analysis").is_visible(), "Manual incident analysis missing")
    manual_window = page.get_by_role("region", name="Manual sample window")
    expect(manual_window.is_visible(), "Monitor sample window missing")
    manual_window.get_by_label("Select sample window").select_option("5")
    expect(manual_window.get_by_text("Samples in window").is_visible(), "Sample window summary missing")
    page.get_by_role("button", name="Nexus Software Factory").click()
    page.get_by_role("button", name="Use local Factory").click()
    page.get_by_text("Local Factory unavailable.", exact=False).wait_for(state="visible", timeout=10000)
    expect(page.get_by_role("button", name="Create reviewable plan").is_visible(), "Browser planning mode should remain usable")
    page.get_by_role("button", name="Create reviewable plan").click()
    page.get_by_text("○ Implementation", exact=True).wait_for(state="visible", timeout=10000)
    expect(page.get_by_role("button", name="Create reviewable plan").is_visible(), "Factory browser planning must remain available")
    approve = page.get_by_role("button", name="Approve plan (manual work only)")
    expect(approve.is_disabled(), "Factory must require explicit human confirmation")
    page.get_by_role("checkbox", name="I reviewed this plan.", exact=False).check()
    approve.click()
    expect(page.get_by_text("approved-for-manual-work").is_visible(), "Review status missing")
    page.screenshot(path=str(ARTIFACTS / f"labs-{label}.png"), full_page=True)
    print(f"PASS four engineering labs at {width}px", flush=True)
    context.close()
    print(f"PASS auth pages at {width}px", flush=True)


def audit_case_study_visual_consistency(browser):
    """Preserve portfolio navigation while giving every featured project its own theme."""
    themes = {
        "task-tracker": ("legacy", "rgb(8, 6, 8)"),
        "hangman": ("legacy", "rgb(8, 6, 8)"),
        "nexus-ai": ("workspace", "rgb(9, 9, 9)"),
        "nexus-commerce": ("commerce", "rgb(16, 37, 31)"),
        "nexus-studio": ("studio", "rgb(32, 26, 43)"),
        "nexus-monitor": ("monitor", "rgb(7, 27, 36)"),
        "nexus-software-factory": ("factory", "rgb(32, 30, 25)"),
    }
    for width in (375, 1440):
        context = browser.new_context(viewport={"width": width, "height": 900})
        page = context.new_page()
        for slug in ("task-tracker", "hangman", "nexus-ai", "nexus-commerce", "nexus-studio", "nexus-monitor", "nexus-software-factory"):
            page.goto(BASE + "/projects/" + slug + "?lang=es", wait_until="networkidle")
            expect(page.get_by_role("heading", level=1).count() == 1, "Case study must have one primary heading")
            header = page.locator("main > header")
            expect(header.count() == 1, "Case study needs a shared editorial header")
            expect(header.get_by_role("link", name="NEXUS AI").is_visible(), "Portfolio branding missing")
            expect(header.get_by_role("link", name="VER CV").is_visible(), "Localized CV navigation missing")
            background = page.locator("main").evaluate("(element) => getComputedStyle(element).backgroundColor")
            kind, expected_background = themes[slug]
            expect(page.locator("main").get_attribute("data-project-kind") == kind,
                   "Wrong project identity on " + slug)
            expect(background == expected_background, "Project theme missing on " + slug)
            overflow = page.evaluate("document.documentElement.scrollWidth > window.innerWidth + 2")
            expect(not overflow, "Horizontal overflow on " + slug)
            if slug == "nexus-ai":
                expect(page.locator(".nexus-showcase-window").count() == 1,
                       "Nexus AI must present the obsidian/gold assistant UI preview")
                expect(page.get_by_text("NEXUS PORTFOLIO", exact=True).count() > 0,
                       "Portfolio assistant identity missing from preview")
                expect(page.get_by_text("NEXUS TECHNICAL", exact=True).count() > 0,
                       "Technical assistant identity missing from preview")
                expect(page.locator('a[href="/assistant"]').count() >= 1,
                       "Nexus AI case study must open the real assistant")
                expect(page.locator('[class*="nexusHighlights"] > [class*="nexusHighlight"]').count() >= 3,
                       "Architecture and safety evidence should remain visible")
            if slug == "task-tracker":
                expect(page.get_by_text("PROYECTO DE APRENDIZAJE").is_visible(), "Learning project should be clearly labeled")
            if slug in ("task-tracker", "nexus-ai"):
                page.screenshot(path=str(ARTIFACTS / f"case-{slug}-{width}.png"), full_page=True)
        context.close()

def audit_standalone_labs(browser):
    """Every engineering project has its own destination and live controls."""
    for width in (375, 1440):
        context = browser.new_context(viewport={"width":width,"height":900})
        page = context.new_page()
        for lab, headline, action in [
            ("commerce","Nexus Commerce","Add to cart"),
            ("studio","Nexus Studio","Export HTML"),
            ("monitor","Nexus Monitor","Run health check"),
            ("factory","Nexus Software Factory","Create reviewable plan"),
        ]:
            page.goto(BASE+"/labs/"+lab,wait_until="networkidle")
            expect(page.locator('main[data-standalone="true"][data-lab="'+lab+'"]').count()==1,
                   "Independent project page missing for "+lab)
            expect(page.get_by_role("heading",name=headline,level=1).is_visible(),
                   "Project header missing for "+lab)
            expect(page.get_by_role("button",name=action).count()>0,
                   "Real product operation missing for "+lab)
            expect(page.locator(".lab-overview-screen").count()==1,
                   "Product-specific live data preview missing for "+lab)
            expect(page.locator(".lab-dedicated-layout > nav").count()==0,
                   "An individual project must not retain the shared workspace sidebar")
            switcher = page.locator("details.lab-project-switcher")
            expect(switcher.count()==1 and switcher.get_attribute("open") is None,
                   "Other projects should be in a collapsed selector")
            switcher.locator("summary").focus()
            page.keyboard.press("Enter")
            expect(switcher.get_attribute("open") is not None,
                   "Project selector must open with the keyboard")
            expect(switcher.get_by_role("link").count()==4,
                   "Project selector must retain the four individual destinations")
            switcher.locator("summary").click()
            expect(not page.evaluate("document.documentElement.scrollWidth>innerWidth+2"),
                   "Horizontal overflow for "+lab)
            page.screenshot(path=str(ARTIFACTS/f"standalone-{lab}-{width}.png"),full_page=True)
        # Client-side navigation must mount the selected product, not retain the
        # previous route's initialLab state.
        page.locator("details.lab-project-switcher summary").click()
        page.get_by_role("link", name="Nexus Commerce", exact=False).click()
        page.wait_for_url("**/labs/commerce")
        page.get_by_role("heading", name="Nexus Commerce", level=1).wait_for(state="visible")
        expect(page.locator('main[data-lab="commerce"]').count()==1,
               "Switching project routes must update the active product")
        context.close()

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
            audit_labs_keyboard_and_localization(browser)
            audit_contact_guide_multilingual(browser)
            audit_case_study_visual_consistency(browser)
            audit_standalone_labs(browser)
        finally:
            browser.close()
    print("All browser QA checks passed.", flush=True)

if __name__ == "__main__":
    main()
