import assert from "node:assert/strict";
import {summarizeCart,auditStudioBlocks,summarizeSampleWindow,summarizeFactoryBoard} from "../lib/labs-insights.mjs";

const products=[{id:"a",name:"Keyboard",price:79.99,stock:3},{id:"b",name:"Mouse",price:39,stock:2}];
assert.deepEqual(summarizeCart({a:2,b:1},products),{
  valid:true,lines:[{id:"a",name:"Keyboard",quantity:2,unitPrice:79.99,subtotal:159.98},
    {id:"b",name:"Mouse",quantity:1,unitPrice:39,subtotal:39}],
  units:3,total:198.98,reason:null,
});
assert.equal(summarizeCart({a:4},products).valid,false);
assert.equal(summarizeCart({"unknown":1},products).valid,false);
assert.equal(summarizeCart({a:1.5},products).valid,false);
assert.equal(summarizeCart({a:-1},products).valid,false);
assert.equal(summarizeCart({a:0},products).total,0);
assert.equal(summarizeCart({a:1},[{...products[0],price:Infinity}]).valid,false);
const doc=[{id:"hero",type:"hero",text:"Build with purpose"},{id:"button",type:"button",text:"Start here"}];
assert.deepEqual(auditStudioBlocks(doc),{ok:true,issues:[],words:5,blocks:2});
assert.ok(auditStudioBlocks([{id:"x",type:"text",text:""}]).issues.some(x=>x.includes("Empty text")));
assert.ok(auditStudioBlocks([{id:"x",type:"hero",text:"A"},{id:"y",type:"hero",text:"B"}]).issues.some(x=>x.includes("multiple")));
assert.equal(auditStudioBlocks([{id:"x",type:"hero",text:"A"},{id:"x",type:"text",text:"B"}]).ok,false);
assert.equal(auditStudioBlocks([]).ok,false);
const checks=[
  {at:"2026-10-28T12:00:00Z",ok:false,ms:20},
  {at:"2026-10-28T11:59:00Z",ok:true,ms:100},
  {at:"2026-10-28T11:58:00Z",ok:true,ms:450},
  {at:"2026-10-28T11:57:00Z",ok:true,ms:800},
  {at:"2026-10-28T11:56:00Z",ok:false,ms:5},
  {at:"2026-10-28T11:55:00Z",ok:true,ms:1000},
];
const first=summarizeSampleWindow(checks,5);
assert.equal(first.count,5);
assert.equal(first.successPercent,60);
assert.equal(first.p95Ms,800);
assert.equal(summarizeSampleWindow(checks,0).count,6);
assert.equal(summarizeSampleWindow([],10).successPercent,null);
assert.equal(summarizeSampleWindow(checks,99).count,0);
assert.equal(summarizeSampleWindow([{ok:true,ms:-1,at:"no"}],0).count,0);
const jobs=[
  {status:"proposed",qa:null},{status:"approved",qa:null},
  {status:"built",qa:{passed:true}},{status:"built",qa:{passed:false}},
];
assert.deepEqual(summarizeFactoryBoard(jobs),
  {total:4,proposed:1,approved:1,built:2,passedStaticQa:1});
assert.equal(summarizeFactoryBoard([{status:"deleted",qa:{passed:true}}]).total,0);
console.log("PASS cart cents, Studio static content audit, manual-sample windows, Factory status counts");
