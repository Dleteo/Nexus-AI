import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import ts from 'typescript';
async function load(path){const source=await readFile(new URL(path,import.meta.url),'utf8');const {outputText}=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.ES2022,target:ts.ScriptTarget.ES2022}});return import('data:text/javascript;base64,'+Buffer.from(outputText).toString('base64'));}
const {createJob,filesFor,digest,transition,exportFiles,parseHistory,staticQA}=await load('../lib/factory/core.ts');
const {zipFiles}=await load('../lib/factory/zip.ts');
const job=createJob('Accessible starter','Create a page <script>alert(1)</script> with café and safe content.','feature','manual','task-one','2026-10-29T12:00:00Z');
assert.equal(staticQA(filesFor(job)).every(c=>c.passed),true);
assert.match(filesFor(job)['index.html'],/&lt;script&gt;/);
await assert.rejects(transition(job,'build'));
await assert.rejects(exportFiles(job));
const approved=await transition(job,'approve');
assert.equal(approved.approval,await digest(filesFor(job)));
await assert.rejects(transition({...approved,request:'A changed request that has not been approved'},'build'));
const built=await transition(approved,'build');
assert.equal(built.stage,'review');
await assert.rejects(exportFiles(built));
await assert.rejects(transition(built,'accept','short'));
const revised=await transition(built,'revise','Please add a clearer acceptance criterion.');
assert.equal(revised.stage,'planned');assert.equal(revised.approval,null);
await assert.rejects(transition(revised,'build'));
const done=await transition(built,'accept','Inspected the source, memory and static checks.');
const output=await exportFiles(done);
assert.equal(Object.keys(output).length,10);
assert.equal(JSON.parse(output['qa-results.json']).execution,'not_run');
const manifest=JSON.parse(output['manifest.json']);
for(const [name,hash] of Object.entries(manifest.files))assert.equal(hash,await digest({[name]:output[name]}));
const zip=zipFiles(output);
const audit=spawnSync('python3',['-c',`import sys,zipfile,io,json
z=zipfile.ZipFile(io.BytesIO(sys.stdin.buffer.read()))
assert z.testzip() is None
assert len(z.namelist()) == 10
assert 'café' in z.read('index.html').decode()
assert json.loads(z.read('factory.definition.json'))['execution']=='not_run'
assert all(not p.startswith('/') and '..' not in p.split('/') for p in z.namelist())
print('ZIP CRC, UTF-8 and contents verified')`],{input:zip});
assert.equal(audit.status,0,audit.stderr?.toString());
assert.deepEqual(parseHistory(JSON.stringify([done])),[done]);
assert.throws(()=>parseHistory(JSON.stringify([{...done,stage:'invented'}])));
assert.throws(()=>parseHistory(JSON.stringify([{...done,events:[{message:1,at:'no'}]}])));
assert.throws(()=>parseHistory(JSON.stringify(Array(81).fill(done))));
assert.throws(()=>zipFiles({'../escape':'no'}));
const cancelled=await transition(job,'cancel');await assert.rejects(transition(cancelled,'approve'));
assert.equal(JSON.parse(filesFor(done)['factory.definition.json']).autoMerge,false);
console.log('Nexus Software Factory: approvals, tampering, revision, cancellation, persistence, QA, manifest and real ZIP verification passed.');
