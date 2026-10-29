import assert from "node:assert/strict";
import {renderPageHtml} from "../lib/labs-core.mjs";
import {STUDIO_DEFAULT_DESIGN,normalizeStudioDesign,studioDesignCss,renderDesignedStudioHtml} from "../lib/labs-studio-design.mjs";

assert.deepEqual(normalizeStudioDesign(null),STUDIO_DEFAULT_DESIGN);
assert.deepEqual(normalizeStudioDesign({theme:"<script>",alignment:"unset",density:"random"}),STUDIO_DEFAULT_DESIGN);
assert.deepEqual(normalizeStudioDesign({theme:"noir",alignment:"center",density:"spacious"}),{theme:"noir",alignment:"center",density:"spacious"});

for(const theme of ["atelier","noir","editorial"]){
 const css=studioDesignCss({theme,alignment:"left",density:"balanced"});
 assert.match(css,/main\{width:min/);
 assert.ok(!css.includes("undefined"));
}

const blocks=[
 {id:"a",type:"hero",text:"Studio <hello>"},
 {id:"b",type:"text",text:"Test <img src=x onerror=alert(1)>"},
 {id:"c",type:"button",text:"Get started"},
];
const exported=renderDesignedStudioHtml(blocks,{theme:"noir",alignment:"center",density:"spacious"},renderPageHtml);
assert.ok(exported.startsWith("<!doctype html>"));
assert.ok(exported.includes("background:#201a2a"));
assert.ok(exported.includes("text-align:center"));
assert.ok(exported.includes("margin:43px 0"));
assert.ok(exported.includes("&lt;hello&gt;"));
assert.ok(exported.includes("&lt;img src=x onerror=alert(1)&gt;"));
assert.ok(!exported.includes("<script>"));
assert.ok(!exported.includes("<img src=x"));
assert.equal((exported.match(/<style>/g)||[]).length,1);
assert.equal((exported.match(/<\/style>/g)||[]).length,1);
assert.ok(exported.includes("<h1>Studio &lt;hello&gt;</h1>"));

const invalid=renderDesignedStudioHtml(blocks,{theme:"javascript:alert(1)",alignment:"left;evil",density:"infinite"},renderPageHtml);
assert.ok(invalid.includes("background:#f6f2fb"));
assert.ok(!invalid.includes("javascript:"));
console.log("Studio design presets and safe static export passed.");
