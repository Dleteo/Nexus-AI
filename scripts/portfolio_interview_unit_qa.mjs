// Public practice data only. These tests never grade answers or call a model.
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
const {getPortfolioInterviewExercises:getExercises}=await import('../data/portfolio-interview.ts');
const {getCaseStudy}=await import('../data/case-studies.ts');
const {translatedCaseStudy}=await import('../data/localized-case-studies.ts');
const slugs=['nexus-ai','nexus-commerce','nexus-studio','nexus-monitor','nexus-factory'];
const locales=['es','en','de','fr','pt'];
const questions=new Set();
for(const language of locales){
 const items=getExercises(language);
 assert.equal(items.length,5);
 assert.deepEqual(items.map(item=>item.id),slugs);
 assert.equal(new Set(items.map(item=>item.id)).size,5);
 for(const item of items){
  assert.equal(item.criteria.length,3);
  assert.ok(item.criteria.every(criterion=>typeof criterion==='string'&&criterion.length>40));
  assert.ok(item.question.length>60&&item.question.includes('?'));
  questions.add(item.question);
  assert.equal(item.caseStudyHref,'/projects/'+item.id+'?lang='+language);
  assert.ok(item.example.length>200);
  const study=translatedCaseStudy(getCaseStudy(item.id),language);
  assert.ok(item.example.includes(study.approach[1]),'Example must cite the documented approach');
  assert.ok(item.example.includes(study.limitations[0]),'Every example must retain a documented limitation');
  assert.deepEqual(Object.keys(item).sort(),['id','project','question','criteria','example','caseStudyHref'].sort(),'No invented score, employment or grading result');
 }
 // Returned criteria cannot be mutated to change subsequent exercises.
 items[0].criteria[0]='mutated';
 assert.notEqual(getExercises(language)[0].criteria[0],'mutated');
}
assert.equal(questions.size,25,'Questions must be localized rather than falling back to English');
const en=getExercises('en');
assert.ok(en.every(item=>item.example.includes('Practice example — not an assessment')));
assert.ok(en.every(item=>item.example.includes('AI-assisted learning project')));
assert.ok(en[0].criteria.join(' ').includes('simulated providers'));
assert.ok(en[1].criteria.join(' ').includes('no real payments'));
assert.ok(en[2].criteria.join(' ').includes('HTTP 409'));
assert.ok(en[3].criteria.join(' ').includes('not continuous monitoring or an SLA'));
assert.ok(en[4].criteria.join(' ').includes('not a digital signature'));
assert.ok(en[4].criteria.join(' ').includes('executing generated code'));
assert.ok(en[0].example.includes('server'));
assert.ok(en[2].example.includes('409'));
assert.ok(en[3].example.includes('p95'));
assert.ok(en[4].example.includes('not_run')||en[4].example.includes('execution'));
console.log('PASS interview practice: 25 localized questions, three grounded criteria each, source-derived examples/limits, controlled case links and no automatic grading');
