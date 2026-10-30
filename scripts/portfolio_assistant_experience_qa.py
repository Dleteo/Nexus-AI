"""Reader-friendly assistant controls using synthetic responses, no model calls."""
import os,shutil
from playwright.sync_api import sync_playwright
BASE=os.environ.get('NEXUS_QA_BASE','http://127.0.0.1:3136')
with sync_playwright() as p:
 browser=p.chromium.launch(executable_path=shutil.which('chromium') or shutil.which('google-chrome'),args=['--no-sandbox'])
 context=browser.new_context(viewport={'width':375,'height':812})
 context.add_init_script("Object.defineProperty(navigator,'clipboard',{value:{writeText:async text=>{window.copiedAnswer=text;}}});")
 page=context.new_page()
 page.route('**/api/auth/session',lambda route:route.fulfill(json={'user':{'id':'synthetic-user'}}))
 page.route('**/api/assistant/status',lambda route:route.fulfill(json={'assistants':[{'scope':'portfolio','status':'ready'}]}))
 page.goto(BASE+'/',wait_until='networkidle');page.get_by_role('button',name='Open Nexus assistant',exact=True).click()
 panel=page.get_by_role('dialog',name='Nexus floating assistant');log=panel.get_by_role('log')
 panel.get_by_role('button',name='Compare Commerce and Factory',exact=True).click()
 assert log.locator('a[href="/projects/nexus-commerce?lang=en"]').count()==1
 assert log.locator('a[href="/projects/nexus-factory?lang=en"]').count()==1
 reply=log.locator('article[data-role="guide"]').last
 reply.get_by_role('button',name='Copy answer',exact=True).click()
 reply.get_by_text('Answer copied',exact=True).wait_for()
 copied=page.evaluate('window.copiedAnswer')
 assert 'Nexus Commerce' in copied and 'Nexus Software Factory' in copied
 page.evaluate("()=>{navigator.clipboard.writeText=async()=>{throw Error('Denied')};}")
 reply.get_by_role('button',name='Copy answer',exact=True).click()
 reply.get_by_text('Could not copy. Select the text to copy it.',exact=True).wait_for()
 panel.get_by_role('button',name='Explain Nexus Factory',exact=True).click()
 reply=log.locator('article[data-role="guide"]').last;reply.get_by_role('button',name='Show tests',exact=True).click()
 assert 'Static QA' in log.locator('article[data-role="guide"]').last.inner_text()
 # Generated content uses the existing text-only Markdown renderer, never raw HTML.
 first='## Documented overview\n\n- One checked item\n- Another checked item\n\n```js\nconst safe = "'+'x'*500+'";\n```\n\n<img src=x onerror="window.executed=true">\n\n'+'\n\n'.join('Earlier paragraph '+str(i)+' '+('reading '*15) for i in range(35))
 calls=[];held=[]
 page.route('**/api/assistant/conversations',lambda route:route.fulfill(json={'conversation':{'id':'11111111-1111-4111-8111-111111111111'}}))
 def chat(route):
  calls.append(route.request.post_data_json)
  if len(calls)==1:route.fulfill(json={'answer':first})
  else:held.append(route)
 page.route('**/api/assistant/chat',chat)
 panel.get_by_role('button',name='AI',exact=True).click()
 panel.get_by_role('combobox',name='Help with').select_option('interview')
 field=panel.get_by_label('Ask the floating assistant');field.fill('First line');field.press('Shift+Enter');field.type('Second line')
 assert '\n' in field.input_value()
 field.press('Enter')
 log.locator('article[data-role="ai"] pre code').wait_for()
 assert calls[0]['mode']=='interview' and calls[0]['message']=='First line\nSecond line'
 assert log.locator('article[data-role="ai"] ul li').count()==2
 assert log.locator('article[data-role="ai"] img').count()==0
 assert page.evaluate('window.executed') is None
 # A late response must not pull the reader away from earlier text.
 field.fill('A second question');field.press('Enter')
 for _ in range(40):
  if held:break
  page.wait_for_timeout(100)
 assert len(held)==1
 log.evaluate("e=>{e.scrollTop=0;e.dispatchEvent(new Event('scroll',{bubbles:true}));}")
 assert log.evaluate('e=>e.scrollTop')<5
 held.pop().fulfill(json={'answer':'A new synthetic answer.'})
 latest=panel.get_by_role('button',name='View latest answer',exact=False);latest.wait_for()
 assert log.evaluate('e=>e.scrollTop')<5
 latest.click()
 assert log.evaluate('e=>e.scrollHeight-e.clientHeight-e.scrollTop')<3
 assert panel.get_by_role('button',name='View latest answer',exact=False).count()==0
 for width,height in [(320,600),(375,400),(768,900),(1440,900)]:
  page.set_viewport_size({'width':width,'height':height})
  assert page.evaluate('document.documentElement.scrollWidth<=innerWidth+1')
  assert log.evaluate('e=>e.scrollWidth<=e.clientWidth+1')
 context.close();browser.close()
print('PASS comparisons, contextual actions, clipboard success/failure, multiline/Enter, coaching selection, safe rich responses and reader-controlled scrolling')
