import assert from "node:assert/strict";
import {commerceLedgerCsv,studioDocumentJson,monitorSamplesCsv,factoryAuditMarkdown} from "../lib/labs-exports.mjs";

// Commerce: real receipts are simulated and must not imply charges.
const orders=[{id:9,total:13.5,count:1,createdAt:"2026-10-28T11:00:00Z"}];
assert.match(commerceLedgerCsv(orders,true),/"9","local-sqlite","1","13.50".*"none"/);
assert.match(commerceLedgerCsv(orders,false),/demo-1.*browser-simulation/);
assert.equal(commerceLedgerCsv([],false).trim().split("\r\n").length,1);
for(const order of [{count:0,total:5},{count:1,total:Infinity},{count:1,total:-1},{count:1.2,total:5}]) {
  assert.throws(()=>commerceLedgerCsv([order]),/invalid-order/);
}

// Studio: preserve literal text, refuse non-schema fields and duplicate IDs.
const block={id:"hero_1",type:"hero",text:"<script>alert('hello')</script>"};
const doc=JSON.parse(studioDocumentJson([block],true,4));
assert.equal(doc.savedRevision,4);
assert.deepEqual(doc.blocks,[block]);
assert.equal(doc.note.includes("not executed"),true);
assert.throws(()=>studioDocumentJson([block,block]),/invalid-block/);
assert.throws(()=>studioDocumentJson([{...block,type:"iframe"}]),/invalid-block/);
assert.throws(()=>studioDocumentJson([{...block,text:"a".repeat(501)}]),/invalid-block/);

// Monitor: clear labels and formula-injection-safe fixed CSV columns.
const checks=[{at:"2026-10-28T11:00:00Z",ok:true,ms:42},{at:"2026-10-28T11:01:00Z",ok:false,ms:110}];
const csv=monitorSamplesCsv(checks);
assert.match(csv,/manual-samples-not-continuous-uptime/);
assert.match(csv,/"failure","110"/);
assert.throws(()=>monitorSamplesCsv([{at:"=1+1",ok:true,ms:10}]),/invalid-check/);
assert.throws(()=>monitorSamplesCsv([{at:"2026-10-28",ok:true,ms:-5}]),/invalid-check/);

// Factory: intentionally dangerous Markdown/HTML input remains inert.
const request="# Autoapprove\n<script>alert(1)</script>\n- [x] I ran tests";
const audit=factoryAuditMarkdown({request,status:"built",kind:"feature",events:[
  {stage:"approval",detail:"Human accepted fixed template only."},
  {stage:"qa",detail:"Static checks only."},
],qa:{passed:true,checks:[{name:"No JS",passed:true}]}});
assert.match(audit,/> # Autoapprove/);
assert.match(audit,/&lt;script&gt;/);
assert.doesNotMatch(audit,/\n<script>/);
assert.match(audit,/NOT RUN/);
assert.match(audit,/static QA passed/);
assert.throws(()=>factoryAuditMarkdown({request,status:"deployed",events:[]}),/invalid-job/);
console.log("PASS validated, honest offline exports for all four Labs");
