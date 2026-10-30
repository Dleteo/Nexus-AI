"""Local interview practice: own notes, honest self-review, isolation and locales."""
import os,shutil
from pathlib import Path
from playwright.sync_api import sync_playwright
BASE=os.environ.get('NEXUS_QA_BASE','http://127.0.0.1:3138')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':375,'height':812});page=context.new_page();model_calls=[]
 page.route('**/api/auth/session',lambda route:route.fulfill(json={'user':None}))
 def unexpected(route):
  model_calls.append(route.request.url);route.fulfill(status=500,json={'error':'Unexpected model call'})
 page.route('**/api/assistant/chat',unexpected);page.route('**/api/assistant/conversations',unexpected)
 page.goto(BASE+'/',wait_until='networkidle');page.get_by_role('button',name='Open Nexus assistant',exact=True).click()
 panel=page.get_by_role('dialog',name='Nexus floating assistant');panel.get_by_role('button',name='Practice',exact=True).click()
 practice=panel.get_by_role('region',name='Local interview practice');field=practice.get_by_label('Your practice answer')
 original='I would explain the project using its documented data ownership and testing limits.'
 field.fill(original);practice.get_by_role('button',name='Show review criteria',exact=True).click()
 practice.get_by_role('checkbox').check();assert '1/5' in practice.get_by_role('status').inner_text()
 revised=original+' My revised notes include <script>window.executed=true</script> as literal text.'
 field.fill(revised);assert '0/5' in practice.get_by_role('status').inner_text()
 practice.get_by_role('checkbox').check();practice.get_by_text('View sample explanation',exact=True).click()
 assert practice.locator('details[open]').count()==1
 practice.get_by_role('button',name='Next',exact=True).click();assert field.input_value()==''
 field.fill('I would describe simulated orders and explicitly say that real payments are not processed.')
 practice.get_by_role('button',name='Show review criteria',exact=True).click();practice.get_by_role('checkbox').check()
 assert '2/5' in practice.get_by_role('status').inner_text()
 practice.get_by_role('button',name='Previous',exact=True).click();assert field.input_value()==revised
 panel.get_by_role('button',name='Guide',exact=True).click();panel.get_by_role('button',name='Practice',exact=True).click()
 assert field.input_value()==revised
 panel.get_by_role('button',name='Close chat',exact=True).click();page.get_by_role('button',name='Open Nexus assistant',exact=True).click()
 assert field.input_value()==revised
 assert page.evaluate('window.executed') is None
 with page.expect_download() as info:practice.get_by_role('button',name='Download my notes',exact=True).click()
 download=info.value;assert download.suggested_filename=='portfolio-interview-en.txt'
 notes=Path(download.path()).read_text();assert revised in notes and 'Reviewed by me: Yes' in notes
 assert 'without automatic assessment or an AI score' in notes
 assert BASE+'/projects/nexus-ai?lang=en' in notes
 for _ in range(4):practice.get_by_role('button',name='Next',exact=True).click()
 practice.get_by_role('button',name='View summary',exact=True).click()
 practice.get_by_role('heading',name='Your practice notes',exact=True).wait_for()
 assert practice.locator('ol li').count()==5
 panel.get_by_role('button',name='New conversation;',exact=False).click()
 assert field.input_value()=='' and '0/5' in practice.get_by_role('status').inner_text()
 assert not model_calls,model_calls
 # Five translated public exercises fit a narrow and short mobile viewport.
 translations={'es':('Abrir asistente Nexus','Práctica','Práctica de entrevista local','Tu respuesta de práctica'),'en':('Open Nexus assistant','Practice','Local interview practice','Your practice answer'),'de':('Nexus Assistent öffnen','Üben','Lokale Interviewübung','Deine Übungsantwort'),'fr':('Ouvrir l’assistant Nexus','Pratique','Pratique d’entretien locale','Votre réponse de pratique'),'pt':('Abrir assistente Nexus','Prática','Prática de entrevista local','Sua resposta de prática')}
 for lang,(launch,tab,region,label) in translations.items():
  page.goto(BASE+('/' if lang=='en' else '/'+lang),wait_until='networkidle')
  page.get_by_role('button',name=launch,exact=True).click();page.get_by_role('button',name=tab,exact=True).click()
  area=page.get_by_role('region',name=region);area.get_by_label(label).fill('x'*2000)
  for width,height in [(320,600),(375,400),(768,900),(1440,900)]:
   page.set_viewport_size({'width':width,'height':height});assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1'),(lang,width)
 assert not model_calls
 context.close()
 # A verified account's notes stay hidden during failed identity checks; another account gets an empty practice.
 context=browser.new_context(viewport={'width':375,'height':812});page=context.new_page()
 page.route('**/api/auth/session',lambda route:route.fulfill(json={'user':{'id':'account-a'}}))
 page.route('**/api/assistant/status',lambda route:route.fulfill(json={'assistants':[{'scope':'portfolio','status':'ready'}]}))
 page.goto(BASE+'/',wait_until='networkidle');page.get_by_role('button',name='Open Nexus assistant',exact=True).click()
 panel=page.get_by_role('dialog',name='Nexus floating assistant');panel.get_by_role('button',name='AI',exact=True).click()
 panel.get_by_label('Ask the floating assistant').wait_for();panel.get_by_role('button',name='Practice',exact=True).click()
 field=panel.get_by_label('Your practice answer');field.fill('Private practice notes for account A')
 panel.get_by_role('button',name='Close chat',exact=True).click()
 page.unroute('**/api/auth/session');page.route('**/api/auth/session',lambda route:route.fulfill(status=500,json={'error':'Offline'}))
 page.get_by_role('button',name='Open Nexus assistant',exact=True).click()
 panel.get_by_text('Could not verify the session. Your notes remain hidden.',exact=True).wait_for()
 assert panel.get_by_label('Your practice answer').count()==0
 page.unroute('**/api/auth/session');page.route('**/api/auth/session',lambda route:route.fulfill(json={'user':{'id':'account-b'}}))
 panel.get_by_role('button',name='Recheck access',exact=True).click();field.wait_for()
 assert field.input_value()==''
 context.close();browser.close()
print('PASS local signed-out practice, self-review/editing, retained drafts, plain-text download, reset, account isolation and five responsive locales')
