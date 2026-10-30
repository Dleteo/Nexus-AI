"""Integration test for CV PDF structure, Unicode text and source evidence."""
from io import BytesIO
from pathlib import Path
from urllib.request import urlopen
import os
import time
import re
from urllib.error import URLError
from pypdf import PdfReader

base = os.environ.get("NEXUS_QA_BASE", "http://127.0.0.1:3102")
headings = {
    "es": "PERFIL PROFESIONAL",
    "en": "PROFESSIONAL PROFILE",
    "de": "TECHNISCHE KENNTNISSE",
    "fr": "COMPÉTENCES TECHNIQUES",
    "pt": "COMPETÊNCIAS TÉCNICAS",
}

artifacts = Path("qa-pdfs")
artifacts.mkdir(exist_ok=True)

for attempt in range(60):
    try:
        with urlopen(base + '/api/resume/pdf?lang=es', timeout=3) as response:
            if response.status == 200:
                break
    except (URLError, TimeoutError):
        pass
    time.sleep(0.25)
else:
    raise RuntimeError('Production server did not become ready for PDF QA')

for lang, expected in headings.items():
    with urlopen(f"{base}/api/resume/pdf?lang={lang}", timeout=15) as resp:
        assert resp.status == 200
        assert resp.headers["Content-Type"].startswith("application/pdf")
        payload = resp.read()
    (artifacts / f"Joshua-Vallejo-Sanchez-CV-{lang}.pdf").write_bytes(payload)
    reader = PdfReader(BytesIO(payload), strict=True)
    assert len(reader.pages) == 1, f"{lang}: resume should fit one polished page; got {len(reader.pages)}"
    text = "\n".join(page.extract_text() or "" for page in reader.pages)
    assert expected in text, f"{lang}: missing localized heading"
    assert "github.com/Dleteo" in text, f"{lang}: missing contact reference"
    assert "Nexus AI" in text, f"{lang}: missing featured project"
    assert "94" in text, f"{lang}: missing documented training hours"
    assert "Hangman Game" in text, f"{lang}: missing project"
    for skill in ("HTML / CSS", "JavaScript", "TypeScript", "React / Next.js", "Python", "Git / GitHub", "Supabase", "SQL / SQLite", "Automated testing", "Accessibility", "Browser storage", "AI-assisted development"):
        assert skill in text, f"{lang}: missing rated skill {skill}"
    assert len(re.findall(r"[1-5]/5", text)) >= 24, f"{lang}: missing usage/knowledge scores"
    assert "1/5" in text and "2/5" in text, f"{lang}: missing provisional scale explanation"
    assert "\ufffd" not in text, f"{lang}: replacement characters indicate damaged encoding"
    print(f"PASS PDF {lang}: {len(reader.pages)} pages, localized content and references", flush=True)
