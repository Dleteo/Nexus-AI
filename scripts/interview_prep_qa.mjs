import assert from "node:assert/strict";
import {buildInterviewPrepMarkdown} from "../lib/interview-prep.mjs";

const example={
 title:"Nexus AI Workspace",
 problem:"Explain how user data stays separate from other accounts.",
 approach:["Use server-side authentication.","Apply RLS to tables."],
 evidence:[{label:"Workspace tests",url:"https://github.com/Dleteo/Nexus-AI/blob/main/scripts/workspace_qa.py"}],
 limitations:["No verified production SaaS.","Provider inference requires configuration."],
};
const labels=["Explain problem","Defend architecture","Inspect tests","Discuss limits"];
const markdown=buildInterviewPrepMarkdown(example,labels,[true,false,true,false]);
assert.match(markdown,/\[x\] Explain problem/);
assert.match(markdown,/\[ \] Defend architecture/);
assert.match(markdown,/Workspace tests/);
assert.match(markdown,/not automated test evidence/);
assert.match(markdown,/No verified production SaaS/);
assert.doesNotMatch(markdown,/Passed integration tests for interview/);
const injection=buildInterviewPrepMarkdown({
 ...example,title:"# Foo <script>alert(1)</script>",
 problem:"<img src=x onerror=alert(1)>",approach:["## fake success"],
},labels,[false,false,false,false]);
assert.match(injection,/# Interview preparation —/);
assert.match(injection,/&lt;script&gt;/);
assert.match(injection,/&lt;img/);
assert.doesNotMatch(injection,/\n## fake success/);
assert.throws(()=>buildInterviewPrepMarkdown(example,labels,[true,true]),/invalid-interview-data/);
console.log("PASS interview prep export: accurate, escaped, manually reviewed, not fake test evidence");
