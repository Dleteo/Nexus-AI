"""Choose a language inside each public project, preserving project and locale links."""
import os
import shutil
from playwright.sync_api import sync_playwright
BASE=os.environ.get('NEXUS_QA_BASE','http://127.0.0.1:3122')
LANGS=['es','en','de','fr','pt']
with sync_playwright() as p:
    browser=p.chromium.launch(headless=True,executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1440,'height':1000})
    page=context.new_page()
    errors=[]
    page.on('pageerror',lambda e:errors.append(str(e)))
    for lab in ['commerce','studio','monitor','factory']:
        page.goto(BASE+'/labs/'+lab)
        for lang in LANGS:
            selector=page.locator('.lab-language-selector')
            assert selector.get_by_role('link').count()==5
            selector.locator(f'a[lang="{lang}"]').click()
            expected=('/labs/' if lang=='es' else '/'+lang+'/labs/')+lab
            page.wait_for_url(BASE+expected)
            main=page.locator('main[data-lab]')
            assert main.get_attribute('lang')==lang and main.get_attribute('data-lab')==lab
            assert selector.locator('a[aria-current="page"]').get_attribute('lang')==lang
            assert main.locator('.lab-study-link').get_attribute('href').endswith('?lang='+lang)
            prefix='/labs/' if lang=='es' else '/'+lang+'/labs/'
            assert all(a.get_attribute('href').startswith(prefix) for a in main.locator('[data-lab-navigation] a').all())
        print('PASS language selection and navigation:',lab,flush=True)
    # The existing Workspace case and all four lab cases also expose five languages.
    for slug in ['nexus-ai','nexus-commerce','nexus-studio','nexus-monitor','nexus-factory']:
        page.goto(BASE+'/projects/'+slug)
        for lang in LANGS:
            page.locator('[role="group"] a[lang="'+lang+'"]').click()
            page.wait_for_url(BASE+'/projects/'+slug+'?lang='+lang)
            assert page.locator('main').get_attribute('lang')==lang
            assert page.locator('[role="group"] a[aria-current="page"]').get_attribute('lang')==lang
    # Language switches retain the active lab in the combined workspace.
    page.goto(BASE+'/labs?lab=studio')
    page.locator('main[data-lab="studio"]').wait_for()
    page.locator('.lab-language-selector a[lang="fr"]').click()
    page.wait_for_url(BASE+'/fr/labs?lab=studio')
    page.locator('main[data-lab="studio"][lang="fr"]').wait_for()
    # Existing user-created Factory work survives changing the interface language.
    page.goto(BASE+'/labs/factory')
    desk=page.get_by_role('region',name='Nexus Software Factory delivery workspace')
    desk.get_by_label('Título',exact=True).fill('Conservar mi trabajo')
    desk.get_by_label('Objetivo y criterios de aceptación').fill('El trabajo guardado debe conservarse cuando cambio el idioma de la interfaz.')
    desk.get_by_role('button',name='Crear plan',exact=False).click()
    page.locator('.lab-language-selector a[lang="en"]').click()
    desk.get_by_role('button',name='Feature Conservar mi trabajo',exact=False).wait_for()
    for width in [320,375,768,1440]:
        page.set_viewport_size({'width':width,'height':1000})
        assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),f'Overflow at {width}'
        assert page.locator('.lab-language-selector').is_visible()
    assert not errors,errors
    browser.close()
print('PASS all five case studies, combined workspace, saved Factory work and responsive language controls')
