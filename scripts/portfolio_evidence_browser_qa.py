"""Portfolio gallery, evidence ratings, contact companion and simulated AI API flow.
Synthetic chat responses do not establish live model inference.
"""
import os,shutil,json
from playwright.sync_api import sync_playwright
BASE=os.environ.get('NEXUS_QA_BASE','http://127.0.0.1:3123')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),headless=True,args=['--no-sandbox'])
 ctx=browser.new_context(viewport={'width':1440,'height':1000})
 page=ctx.new_page();errors=[];page.on('pageerror',lambda e:errors.append(str(e)))
 page.goto(BASE+'/')
 certificates=page.locator('#certificados')
 assert certificates.get_by_role('heading',level=3).count()==6
 assert '94' in certificates.inner_text() and '4 realizados + 2 previstos' in certificates.inner_text()
 certificates.get_by_role('button',name='AI & Agents',exact=True).click()
 assert certificates.get_by_role('heading',level=3).count()==3
 certificates.get_by_role('button',name='Todos',exact=True).click()
 certificates.get_by_role('button',name='Ampliar certificado:',exact=False).first.click()
 modal=page.get_by_role('dialog',name='Documento del certificado');assert modal.is_visible()
 assert modal.locator('img').get_attribute('alt')
 page.keyboard.press('Escape');assert not modal.is_visible()
 actor=page.locator('svg[viewBox="0 0 90 112"]').locator('..')
 original=actor.evaluate('(e)=>getComputedStyle(e).transform')
 page.mouse.move(600,250)
 page.wait_for_function("(old)=>getComputedStyle(document.querySelector('[data-portfolio-mascot]')).transform!==old",arg=original)
 assert page.locator('#habilidades').get_by_role('heading',level=3).count()==12
 assert page.locator('#trayectoria ol>li').count()==6
 launch=page.get_by_role('button',name='Abrir asistente Nexus',exact=True);launch.click()
 panel=page.get_by_role('dialog',name='Nexus asistente flotante')
 panel.get_by_label('Pregunta al asistente flotante').fill('Muéstrame los certificados')
 panel.get_by_role('button',name='Enviar pregunta flotante').click()
 assert '94 horas' in panel.get_by_role('log').inner_text()
 panel.get_by_role('button',name='IA',exact=True).click()
 panel.get_by_role('link',name='Iniciar sesión para usar IA',exact=False).wait_for()
 panel.get_by_role('button',name='Mascota',exact=True).click()
 assert page.locator('svg[viewBox="0 0 90 112"]').count()==0
 page.keyboard.press('Escape');assert not panel.is_visible()
 for width in [320,375,768,1440]:
  page.set_viewport_size({'width':width,'height':1000})
  assert page.evaluate('document.documentElement.scrollWidth <= innerWidth+1'),f'Overflow {width}'
 assert not errors,errors
 ctx.close()
 # An authenticated session uses the existing protected APIs, always portfolio scope.
 ctx=browser.new_context(viewport={'width':1100,'height':1000});page=ctx.new_page();calls=[]
 page.route('**/api/auth/session',lambda route:route.fulfill(json={'user':{'id':'synthetic-user'}}))
 def create(route):
  calls.append(('create',route.request.post_data_json));route.fulfill(json={'conversation':{'id':'11111111-1111-4111-8111-111111111111'}})
 def chat(route):
  calls.append(('chat',route.request.post_data_json));route.fulfill(json={'answer':'Respuesta simulada para comprobar el flujo, sin inferencia real.'})
 page.route('**/api/assistant/conversations',create);page.route('**/api/assistant/chat',chat)
 page.goto(BASE+'/');page.get_by_role('button',name='Abrir asistente Nexus',exact=True).click()
 panel=page.get_by_role('dialog',name='Nexus asistente flotante');panel.get_by_role('button',name='IA',exact=True).click()
 panel.get_by_label('Pregunta al asistente flotante').wait_for()
 panel.get_by_label('Pregunta al asistente flotante').fill('Ayúdame con el portafolio')
 panel.get_by_role('button',name='Enviar pregunta flotante').click()
 panel.get_by_text('Respuesta simulada para comprobar el flujo, sin inferencia real.',exact=True).wait_for()
 assert len(calls)==2 and all(payload['scope']=='portfolio' for _,payload in calls)
 panel.get_by_role('button',name='Cerrar chat',exact=True).click()
 page.route('**/api/auth/session',lambda route:route.fulfill(json={'user':None}))
 page.get_by_role('button',name='Abrir asistente Nexus',exact=True).click()
 panel.get_by_role('link',name='Iniciar sesión para usar IA',exact=False).wait_for()
 assert panel.get_by_text('Respuesta simulada para comprobar el flujo, sin inferencia real.',exact=True).count()==0
 ctx.close()
 # Reduced motion keeps the decorative baby stationary.
 ctx=browser.new_context(reduced_motion='reduce');page=ctx.new_page();page.goto(BASE+'/')
 actor=page.locator('svg[viewBox="0 0 90 112"]').locator('..')
 before=actor.evaluate('(e)=>getComputedStyle(e).transform');page.mouse.move(600,300);page.wait_for_timeout(150)
 assert actor.evaluate('(e)=>getComputedStyle(e).transform')==before
 ctx.close();browser.close()
print('PASS six visible certificates, filters, dialog, honest time and ratings, six process steps, floating guide, login gate, mocked authenticated AI, reduced motion and responsive layouts')
