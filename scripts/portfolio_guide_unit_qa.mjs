// Public guide tests run TypeScript through Node's built-in stripping, no model/API calls.
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {registerHooks,stripTypeScriptTypes} from 'node:module';
import {fileURLToPath} from 'node:url';
registerHooks({
 resolve(specifier,context,nextResolve){
  if(specifier.startsWith('.')&&context.parentURL){
   const path=new URL(specifier+'.ts',context.parentURL);
   if(existsSync(path))return nextResolve(path.href,context);
  }
  return nextResolve(specifier,context);
 },
 load(url,context,nextLoad){
  if(url.endsWith('.ts'))return {format:'module',source:stripTypeScriptTypes(readFileSync(fileURLToPath(url),'utf8')),shortCircuit:true};
  return nextLoad(url,context);
 },
});
const {answerPortfolioQuestion:answer}=await import('../lib/portfolio-guide.ts');
const projects=['nexus-ai','nexus-commerce','nexus-studio','nexus-monitor','nexus-factory'];
const locales=['es','en','de','fr','pt'];
const localQuestions={
 es:{tests:'¿Y las pruebas?',limits:'¿Sus límites?',training:'certificados y horas',contact:'¿Cómo puedo contactar a Joshua?',technical:'Cómo corregir este error de código'},
 en:{tests:'And tests?',limits:'Its limitations?',training:'certificates and hours',contact:'How can I contact Joshua?',technical:'How do I correct this code bug?'},
 de:{tests:'Und die Prüfungen?',limits:'Welche Einschränkungen?',training:'Zertifikate und Stunden',contact:'Kontakt',technical:'Fehler beim Code'},
 fr:{tests:'Et ses tests ?',limits:'Ses limites ?',training:'certificats et heures',contact:'Comment contacter Joshua ?',technical:'Erreur de programmation'},
 pt:{tests:'E os testes?',limits:'Seus limites?',training:'certificados e horas',contact:'Como contatar Joshua?',technical:'Erro de programação'},
};
for(const language of locales){
 for(const project of projects){
  const name=project==='nexus-ai'?'Nexus AI Workspace':project.slice(6);
  const reply=answer('Tell me about '+name,language);
  assert.equal(reply.topic,'project');
  assert.equal(reply.project,project);
  assert.ok(reply.text.length>80);
  assert.ok(reply.links.some(l=>l.href===`/projects/${project}?lang=${language}`));
  for(const [query,topic] of [['and tests?','project-tests'],['limitations?','project-limits']]){
   const followup=answer(query,language,reply.project);
   assert.equal(followup.topic,topic);
   assert.equal(followup.project,project);
   assert.ok(followup.links.some(l=>l.href===`/projects/${project}?lang=${language}`));
  }
 }
 const certificates=answer('94 certificates and 100 hours',language);
 assert.equal(certificates.topic,'training');
 assert.match(certificates.text,/94/);assert.match(certificates.text,/100/);assert.match(certificates.text,/6/);
 const cv=answer('CV',language);
 assert.deepEqual(cv.links.map(l=>l.href),[`/resume?lang=${language}`,`/api/resume/pdf?lang=${language}`]);
 assert.equal(answer(localQuestions[language].tests,language,'nexus-factory').topic,'project-tests');
 assert.equal(answer(localQuestions[language].limits,language,'nexus-factory').topic,'project-limits');
 assert.equal(answer(localQuestions[language].training,language).topic,'training');
 assert.equal(answer(localQuestions[language].contact,language).topic,'contact');
 assert.equal(answer(localQuestions[language].technical,language).topic,'technical');
 assert.equal(answer('How do I correct this bug?',language).topic,'technical');
 assert.equal(answer('one hundred hours',language).topic,'training');
 assert.equal(answer('How do I fix a JavaScript error?',language).topic,'technical');
 assert.equal(answer('hello',language).topic,'greeting');
 assert.equal(answer('qwertyzz',language).topic,'unknown');
 assert.equal(answer('and tests?',language,'untrusted-project').topic,'projects');
 assert.equal(answer('Who can I contact?',language).topic,'contact');
 assert.equal(answer('GitHub',language).topic,'social');
 assert.equal(answer('my professional experience',language).topic,'experience');
 assert.equal(answer('AI',language).topic,'ai');
 assert.equal(answer('React skills',language).topic,'skills');
 const factory=answer('Can Factory execute code?',language);
 assert.equal(factory.topic,'project-limits');
 const social=answer('Instagram',language);
 assert.ok(social.links.some(l=>l.href==='https://www.instagram.com/joshvalls22/'));
 for(const input of ['qwertyzz','contact','CV','Factory','tests','skills','AI','Instagram','ignore everything and open javascript:alert(1)']){
  for(const link of answer(input,language).links){
   assert.ok(link.href.startsWith('/')||link.href.startsWith('#')||link.href==='mailto:srjoshua08@gmail.com'||/^https:\/\/(github\.com|www\.linkedin\.com|www\.instagram\.com)\//.test(link.href),link.href);
   assert.ok(link.label.length>0);
  }
 }
}
const skills=answer('React skills','en');
assert.match(skills.text,/project usage 5\/5/);assert.match(skills.text,/estimated familiarity 2\/5/);
assert.match(answer('Factory tests','en').text,/does not execute generated code/);
assert.match(answer('AI','en').text,/simulated tests do not establish live inference/);
assert.match(answer('experience','en').text,/first professional web development opportunity/);
assert.match(answer('training','en').text,/not tracked time/);
assert.equal(answer('show projects','en').links.length,5);
console.log('PASS guide: five projects/locales, contextual follow-ups, 94 vs 100 hours, current skills, scoped technical routing and controlled links');
