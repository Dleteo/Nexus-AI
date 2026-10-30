import assert from "node:assert/strict";
import {
  setCartQuantity,parseStudioDocument,summarizeManualIncidents,filterFactoryJobs,
} from "../lib/labs-demo-tools.mjs";
import {studioDocumentJson} from "../lib/labs-exports.mjs";

const inventory=[{id:"keyboard",stock:3},{id:"monitor",stock:0}];
const added=setCartQuantity({},inventory,"keyboard",2);
assert.equal(added.ok,true);
assert.deepEqual(added.cart,{keyboard:2});
assert.deepEqual(setCartQuantity(added.cart,inventory,"keyboard",0).cart,{});
for(const invalid of [-1,1.1,4,Number.NaN,Infinity]) {
  assert.equal(setCartQuantity({},inventory,"keyboard",invalid).ok,false);
}
assert.equal(setCartQuantity({},inventory,"missing",1).ok,false);
assert.equal(setCartQuantity({},inventory,"monitor",1).ok,false);
assert.equal(setCartQuantity({keyboard:-7},inventory,"keyboard",1).ok,false);
assert.deepEqual(added.cart,{keyboard:2},"Earlier snapshots must be immutable");

const blocks=[{id:"hero-1",type:"hero",text:"<img src=x onerror=alert(1)>"},{id:"text-2",type:"text",text:"Hello"}];
const exported=studioDocumentJson(blocks,false,null);
assert.deepEqual(parseStudioDocument(exported),blocks);
for(const document of [
  "garbage",JSON.stringify({format:"another",version:1,source:"browser-simulation",blocks}),
  JSON.stringify({format:"nexus-studio-document",version:2,source:"browser-simulation",blocks}),
  JSON.stringify({format:"nexus-studio-document",version:1,source:"browser-simulation",blocks:[blocks[0],blocks[0]]}),
  JSON.stringify({format:"nexus-studio-document",version:1,source:"browser-simulation",blocks:[{...blocks[0],script:"evil"}]}),
  JSON.stringify({format:"nexus-studio-document",version:1,source:"browser-simulation",blocks:[{...blocks[0],text:"a".repeat(501)}]}),
  "x".repeat(25001),
]) assert.throws(()=>parseStudioDocument(document),/invalid-(json|document|block)/);

// The newest sample is first. Incident count is the number of independent failure runs.
const samples=[
  {ok:false,ms:50},{ok:false,ms:50},{ok:true,ms:600},
  {ok:false,ms:30},{ok:true,ms:100},{ok:false,ms:200},
];
assert.deepEqual(summarizeManualIncidents(samples),
  {sampleCount:6,currentFailures:2,longestFailures:2,slowSamples:1,incidents:3});
assert.deepEqual(summarizeManualIncidents([]),
  {sampleCount:0,currentFailures:0,longestFailures:0,slowSamples:0,incidents:0});
assert.equal(summarizeManualIncidents([{ok:false,ms:-1},{ok:true,ms:100}]).sampleCount,1);

const jobs=[{id:"a",request:"Improve checkout",status:"proposed"},
  {id:"b",request:"Review Checkout",status:"approved"},
  {id:"c",request:"Static page",status:"built"}];
assert.equal(filterFactoryJobs(jobs,"proposed").length,1);
assert.equal(filterFactoryJobs(jobs,"all","CHECKOUT").length,2);
assert.equal(filterFactoryJobs(jobs,"approved","static").length,0);
assert.equal(filterFactoryJobs(jobs,"unsupported").length,0);
console.log("PASS four labs: validated quantities, inert JSON import, incident streaks, job search");
