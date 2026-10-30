"""Grounded guide and mocked AI availability/errors; no real model or user data."""
import os,shutil
from playwright.sync_api import sync_playwright
BASE=os.environ.get('NEXUS_QA_BASE','http://127.0.0.1:3134')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
 def setup(status='ready'):
  context=browser.new_context(viewport={'width':375,'height':812});page=context.new_page()
  page.route('**/api/auth/session',lambda route:route.fulfill(json={'user':{'id':'synthetic-user'}}))
  page.route('**/api/assistant/status',lambda route:route.fulfill(json={'assistants':[{'scope':'portfolio','status':status}]}))
  page.goto(BASE+'/',wait_until='networkidle');page.get_by_role('button',name='Open Nexus assistant',exact=True).click()
  return context,page,page.get_by_role('dialog',name='Nexus floating assistant')
 context,page,panel=setup('not_configured');calls=[]
 page.route('**/api/assistant/conversations',lambda route:calls.append(route.request.url))
 page.route('**/api/assistant/chat',lambda route:calls.append(route.request.url))
 panel.get_by_role('button',name='Explain Nexus Factory',exact=True).click()
 panel.get_by_role('log').locator('a[href="/projects/nexus-factory?lang=en"]').wait_for()
 panel.get_by_label('Ask the floating assistant').fill('And its limitations?')
 panel.get_by_role('button',name='Send floating question').click()
 assert panel.get_by_role('log').locator('a[href="/projects/nexus-factory?lang=en"]').count()>=2
 panel.get_by_role('button',name='AI',exact=True).click();panel.get_by_role('button',name='Use Guide',exact=True).wait_for()
 assert not calls,'Unavailable AI must not create empty conversations or call a model'
 panel.get_by_role('button',name='Use Guide',exact=True).click()
 panel.get_by_role('button',name='New conversation;',exact=False).click()
 assert panel.get_by_role('log').locator('article').count()==0
 context.close()
 # Delay the synthetic response while a visitor types their next question.
 context,page,panel=setup();held=[];payloads=[]
 page.route('**/api/assistant/conversations',lambda route:route.fulfill(json={'conversation':{'id':'11111111-1111-4111-8111-111111111111'}}))
 def hold(route):
  payloads.append(route.request.post_data_json);held.append(route)
 page.route('**/api/assistant/chat',hold)
 panel.get_by_role('button',name='AI',exact=True).click()
 field=panel.get_by_label('Ask the floating assistant');field.wait_for();field.fill('Explain my projects')
 panel.get_by_role('button',name='Send floating question').click()
 for _ in range(40):
  if held:break
  page.wait_for_timeout(100)
 assert len(held)==1
 assert payloads[0]['language']=='en' and payloads[0]['scope']=='portfolio'
 field.fill('My next question must survive')
 held.pop().fulfill(json={'answer':'Synthetic answer with no real inference.'})
 panel.get_by_text('Synthetic answer with no real inference.',exact=True).wait_for()
 assert field.input_value()=='My next question must survive'
 # Hide private history while session identity cannot be revalidated.
 panel.get_by_role('button',name='Close chat',exact=True).click()
 page.unroute('**/api/auth/session');session_checks=[]
 page.route('**/api/auth/session',lambda route:session_checks.append(route))
 page.get_by_role('button',name='Open Nexus assistant',exact=True).click()
 assert panel.get_by_text('Synthetic answer with no real inference.',exact=True).count()==0
 for _ in range(40):
  if session_checks:break
  page.wait_for_timeout(100)
 session_checks.pop().fulfill(status=500,json={'error':'Unavailable'})
 panel.get_by_role('button',name='Use Guide',exact=True).wait_for()
 assert panel.get_by_text('Synthetic answer with no real inference.',exact=True).count()==0
 page.unroute('**/api/auth/session');page.route('**/api/auth/session',lambda route:route.fulfill(json={'user':{'id':'synthetic-user'}}))
 panel.get_by_role('button',name='Check again',exact=True).click()
 field.wait_for()
 panel.get_by_text('Synthetic answer with no real inference.',exact=True).wait_for()
 # A malformed response keeps the submitted draft and gives a readable error.
 page.unroute('**/api/assistant/chat');page.route('**/api/assistant/chat',lambda route:route.fulfill(status=200,content_type='text/html',body='Not JSON'))
 panel.get_by_role('button',name='Send floating question').click();panel.get_by_role('alert').wait_for()
 assert field.input_value()=='My next question must survive'
 assert 'could not get an answer' in panel.get_by_role('alert').inner_text()
 # An expired session immediately hides authenticated history and stops thread reuse.
 page.unroute('**/api/assistant/chat');page.route('**/api/assistant/chat',lambda route:route.fulfill(status=401,json={'error':'Expired'}))
 panel.get_by_role('button',name='Send floating question').click()
 panel.get_by_role('link',name='Sign in to use AI',exact=False).wait_for()
 assert panel.get_by_text('Synthetic answer with no real inference.',exact=True).count()==0
 for width,height in [(320,600),(375,400),(768,900),(1440,900)]:
  page.set_viewport_size({'width':width,'height':height})
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
 context.close();browser.close()
print('PASS grounded project follow-up, safe unavailable state, draft preservation, malformed response, session expiration and mobile layout')
