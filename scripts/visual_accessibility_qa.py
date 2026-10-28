"""Targeted visual/accessibility regressions against an already-built local Nexus server.

Not a WCAG certification or screen-reader audit. Uses computed browser styles,
keyboard navigation, narrow viewports and screenshots to catch concrete defects.
"""
from pathlib import Path
import os
import shutil

from playwright.sync_api import sync_playwright

BASE = os.environ.get("NEXUS_QA_BASE", "http://127.0.0.1:3102")
OUTPUT = Path("qa-screenshots")
OUTPUT.mkdir(exist_ok=True)

def check(condition, reason):
    if not condition:
        raise AssertionError(reason)

# Browser computed colors, opaque buttons only.
def button_contrast(locator):
    return locator.evaluate("""(element) => {
      function relativeLuminance(rgb) {
        const values = rgb.match(/[\d.]+/g);
        if (!values || values.length < 3) throw new Error("No RGB color");
        const c = values.slice(0,3).map(Number).map(value => {
          const x = value / 255;
          return x <= .04045 ? x / 12.92 : Math.pow((x + .055) / 1.055, 2.4);
        });
        return c[0] * .2126 + c[1] * .7152 + c[2] * .0722;
      }
      const css = getComputedStyle(element);
      const fg = relativeLuminance(css.color);
      const bg = relativeLuminance(css.backgroundColor);
      return (Math.max(fg,bg)+.05)/(Math.min(fg,bg)+.05);
    }""")

def document_dimensions(page):
    return page.evaluate("""() => ({
      width:innerWidth,
      scrollWidth:document.documentElement.scrollWidth,
      bodyWidth:document.body.scrollWidth,
    })""")

def audit(browser):
    checks = [
        ("/", "home"),
        ("/resume", "resume"),
        ("/labs?lab=commerce", "commerce"),
        ("/labs?lab=studio", "studio"),
        ("/labs?lab=monitor", "monitor"),
        ("/labs?lab=factory", "factory"),
        ("/projects/nexus-ai?lang=es", "case-study"),
        ("/interview", "interview"),
    ]
    context = browser.new_context(viewport={"width":375,"height":900}, reduced_motion="reduce")
    page = context.new_page()
    try:
        for path, label in checks:
            page.goto(BASE+path, wait_until="networkidle")
            sizes = document_dimensions(page)
            check(sizes["scrollWidth"] <= sizes["width"]+2 and
                  sizes["bodyWidth"] <= sizes["width"]+2,
                  f"Unexpected horizontal overflow on {label} mobile: {sizes}")
            if label in {"home","resume","commerce","case-study","interview"}:
                page.screenshot(path=str(OUTPUT / f"visual-audit-{label}-mobile.png"),full_page=True)

        page.goto(BASE+"/", wait_until="networkidle")
        primary = page.locator('a[href="#proyectos"][class*="primary"]').first
        check(primary.count()==1, "Portfolio primary call-to-action missing")
        ratio = button_contrast(primary)
        check(ratio >= 4.5, f"Small text on portfolio red CTA lacks 4.5:1 contrast: {ratio:.2f}")
        page.keyboard.press("Tab")
        skip = page.get_by_role("link",name="Ir al contenido")
        check(skip.evaluate("(el)=>document.activeElement===el"),
              "First keyboard tab should reach Skip to content")
        skip_style=skip.evaluate("""(el)=>{
          const s=getComputedStyle(el);
          return {position:s.position,outlineStyle:s.outlineStyle,
            outlineWidth:parseFloat(s.outlineWidth),transform:s.transform,top:el.getBoundingClientRect().top};
        }""")
        check(skip_style["outlineStyle"]!="none" and skip_style["outlineWidth"]>=2 and
              skip_style["top"]>=0 and skip_style["position"]=="fixed" and skip_style["transform"]=="none",
              f"Skip link must show a fixed visible keyboard indicator: {skip_style}")
        card=page.locator('[class*="projectCard"]').first
        duration=card.evaluate("""(el)=>Math.max(...getComputedStyle(el)
          .transitionDuration.split(",").map(v=>parseFloat(v)*
            (v.includes("ms")?1:1000)))""")
        check(duration <= 30,f"Reduced-motion preference ignored by project card: {duration} ms")

        page.goto(BASE+"/resume",wait_until="networkidle")
        download=page.locator("a[download]").first
        check(download.count()==1, "CV download action missing")
        ratio=button_contrast(download)
        check(ratio>=4.5,f"CV red download button lacks 4.5:1 contrast: {ratio:.2f}")
        controls=page.get_by_role("navigation",name="Opciones del CV")
        for action in [controls.get_by_label("Cambiar idioma"),
                       controls.get_by_role("link",name="Volver al portafolio")]:
            size=action.bounding_box()
            check(size is not None and size["height"]>=44,
                  f"CV mobile action needs 44px target height: {size}")

        page.goto(BASE+"/labs?lab=commerce",wait_until="networkidle")
        nav=page.get_by_role("navigation",name="Nexus labs")
        check(nav.get_by_role("button").count()==4,"Four accessible lab choices required")
        for button in nav.get_by_role("button").all():
            rect=button.bounding_box()
            check(rect is not None and rect["height"]>=44,
                  f"Lab selector target too small: {rect}")
        print("PASS mobile overflow, visible skip focus, 4.5:1 CTA contrast, reduced motion and touch controls",flush=True)
    finally:
        context.close()

    narrow=browser.new_context(viewport={"width":320,"height":760}, reduced_motion="reduce")
    p=narrow.new_page()
    try:
        for path, label in [("/", "home"),("/resume","resume")]:
            p.goto(BASE+path,wait_until="networkidle")
            dimensions=document_dimensions(p)
            check(dimensions["scrollWidth"]<=dimensions["width"]+2,
                  f"Narrow {label} has horizontal overflow: {dimensions}")
            p.screenshot(path=str(OUTPUT / f"visual-audit-{label}-320.png"),full_page=True)
        print("PASS narrow 320px viewport captures without document overflow",flush=True)
    finally:
        narrow.close()

def main():
    binary = shutil.which("google-chrome") or shutil.which("chromium") or shutil.which("chromium-browser")
    check(binary is not None,"Chrome/Chromium not installed on runner")
    with sync_playwright() as pw:
        browser=pw.chromium.launch(headless=True, executable_path=binary,args=["--no-sandbox"])
        try:
            audit(browser)
        finally:
            browser.close()

if __name__=="__main__":
    main()
