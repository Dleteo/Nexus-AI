"""Actual browser delivery flow; no provider, inference or generated-code execution."""
import os
import tempfile
import shutil
import zipfile
import json
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('NEXUS_QA_BASE','http://127.0.0.1:3116')
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True, executable_path=shutil.which('chromium') or shutil.which('chromium-browser'), args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1440,'height':1000},accept_downloads=True)
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    page.goto(BASE+'/labs/factory')
    desk=page.get_by_role('region',name='Nexus Software Factory delivery workspace')
    desk.get_by_label('Título',exact=True).fill('Registro accesible de prueba')
    desk.get_by_label('Objetivo y criterios de aceptación').fill('Crear una base de registro accesible con criterios claros y memoria portable.')
    desk.get_by_role('button',name='Crear plan',exact=False).click()
    approve=desk.get_by_role('button',name='Aprobar este contenido')
    assert approve.is_disabled(), 'Source inspection must precede approval'
    desk.locator('summary').filter(has_text='Inspeccionar archivos').click()
    desk.get_by_label('Archivo',exact=True).select_option('02-DOCS/memory.md')
    assert 'Memoria del proyecto' in desk.locator('pre').inner_text()
    approve.click()
    desk.get_by_role('button',name='Preparar plantilla + QA').click()
    desk.get_by_label('Nota de revisión').fill('Revisé la memoria, el HTML escapado y la evidencia estática.')
    desk.get_by_role('button',name='Aceptar revisión',exact=True).click()
    with page.expect_download() as result:
        desk.get_by_role('button',name='Descargar paquete ZIP').click()
    with tempfile.TemporaryDirectory() as tmp:
        target=Path(tmp)/'delivery.zip'; result.value.save_as(target)
        with zipfile.ZipFile(target) as z:
            assert z.testzip() is None and len(z.namelist())==10
            assert json.loads(z.read('qa-results.json'))['execution']=='not_run'
    page.reload()
    desk.get_by_role('button',name='Funcionalidad Registro accesible de prueba',exact=False).click()
    assert desk.get_by_role('button',name='Descargar paquete ZIP').is_visible(), 'Reload must preserve reviewed delivery'
    for width in [320,375,768,1440]:
        page.set_viewport_size({'width':width,'height':1000})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'), f'Overflow at {width}'
    for lang,heading in [('en','From approved plan'),('de','Vom freigegebenen Plan'),('fr','Du plan validé'),('pt','Do plano aprovado')]:
        page.goto(BASE+'/'+lang+'/labs/factory')
        assert page.get_by_role('region',name='Nexus Software Factory delivery workspace').get_by_text(heading,exact=False).is_visible()
    assert not errors, errors
    browser.close()
print('PASS real browser: review gate, memory preview, ZIP download, reload, 320/375/768/1440 px and five languages')
