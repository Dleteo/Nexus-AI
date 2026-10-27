import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createRequire} from "node:module";

const require = createRequire(import.meta.url);
const ts = require("typescript");

async function importTs(path) {
  const source = readFileSync(path, "utf8");
  const transpiled = ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod={exports:{}};
  new Function("module","exports","require",transpiled)(mod,mod.exports,require);
  return mod.exports;
}
const {extractGroundingSources}=await importTs("lib/assistant-sources.ts");
const gemini=extractGroundingSources("gemini",{candidates:[{groundingMetadata:{groundingChunks:[
 {web:{uri:"https://www.cisa.gov/known-exploited-vulnerabilities-catalog",title:"CISA"}},
 {web:{uri:"javascript:alert(1)",title:"Unsafe"}},
 {web:{uri:"https://www.cisa.gov/known-exploited-vulnerabilities-catalog",title:"Duplicate"}},
]}}]});
assert.equal(gemini.length,1);
assert.equal(gemini[0].title,"CISA");
const openai=extractGroundingSources("openai",{output:[{content:[{annotations:[
 {type:"url_citation",url:"https://nvd.nist.gov",title:"NIST NVD"},
 {type:"other",url:"https://example.com",title:"Other"}
]}]}]});
assert.equal(openai.length,1);
assert.equal(openai[0].uri,"https://nvd.nist.gov/");
assert.deepEqual(extractGroundingSources("ollama",{}),[]);
const route=readFileSync("app/api/assistant/chat/route.ts","utf8");
assert.ok(route.indexOf('currentResearch && aiProvider === "ollama"') < route.indexOf('claim_assistant_request_for_user'));
assert.match(route,/conversation\.scope !== scope/);
console.log("PASS grounded provider citation extraction and early safety gates");
