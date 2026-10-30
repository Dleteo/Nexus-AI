"""English entry point, sticky mobile menu and long contact messages on mobile."""
import os,shutil
from playwright.sync_api import sync_playwright
BASE=os.environ.get('NEXUS_QA_BASE','http://127.0.0.1:3132')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
 page=browser.new_page()
 for width in [320,375,390,760]:
  page.set_viewport_size({'width':width,'height':800})
  page.goto(BASE+'/',wait_until='networkidle')
  assert page.locator('#inicio').get_attribute('lang')=='en'
  page.get_by_role('heading',name='FEATURED PROJECTS',exact=False).wait_for()
  page.locator('#contacto').scroll_into_view_if_needed()
  assert page.evaluate('scrollY')>500
  menu=page.get_by_role('button',name='Menu',exact=True)
  menu.click()
  nav=page.locator('#mobile-portfolio-nav')
  bounds=nav.bounding_box()
  assert bounds and 0<=bounds['y']<100 and bounds['y']+bounds['height']<=801,bounds
  assert menu.get_attribute('aria-expanded')=='true'
  nav.get_by_role('link',name='PROJECTS',exact=True).click()
  assert page.locator('#mobile-portfolio-nav').count()==0
  page.wait_for_function("location.hash==='#proyectos'")
  menu.click();nav.get_by_role('link',name='HOME',exact=True).focus();page.keyboard.press('Escape')
  assert menu.get_attribute('aria-expanded')=='false'
  assert menu.evaluate('(e)=>e===document.activeElement')
  contact=page.get_by_role('region',name='Contact assistant',exact=True)
  question=contact.get_by_role('textbox',name='Your question',exact=True)
  question.fill('x'*500)
  contact.get_by_role('button',name='Ask',exact=True).click()
  assert 'x'*500 in contact.get_by_role('log').inner_text()
  assert contact.get_by_role('log').evaluate('(e)=>e.scrollWidth<=e.clientWidth+1')
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  contact.get_by_role('button',name='Compose email',exact=False).click()
  contact.get_by_role('textbox',name='Name',exact=True).fill('A'*80)
  contact.get_by_role('textbox',name='Your email',exact=True).fill('test@example.com')
  contact.get_by_role('textbox',name='Message',exact=True).fill('x'*1000)
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  href=contact.get_by_role('link',name='Open my email app',exact=False).get_attribute('href')
  assert 'Contact%20from%20Nexus%20AI' in href
  page.set_viewport_size({'width':width,'height':400})
  menu.click();bounds=nav.bounding_box()
  assert bounds and bounds['y']+bounds['height']<=401,bounds
  page.keyboard.press('Escape')
 page.goto(BASE+'/resume',wait_until='networkidle')
 assert page.locator('main').get_attribute('lang')=='en'
 page.goto(BASE+'/es',wait_until='networkidle')
 assert page.locator('#inicio').get_attribute('lang')=='es'
 browser.close()
print('PASS English defaults, mobile menu after scrolling, Escape focus, long messages, email composition and short viewports')
