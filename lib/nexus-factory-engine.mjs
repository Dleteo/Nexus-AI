/**
 * Nexus Factory's original deterministic intake and quality gate.
 *
 * Inspired by reviewed concepts from Warp Factories, super-board and rsc-harness,
 * not a cloud-agent integration, code generator or installer. No commands run.
 * The service's existing approval + fixed-template + static-QA backend remains
 * the authority for creating packages. This module ONLY plans and documents.
 */
export const FACTORY_ROLES=Object.freeze([
  {id:"triage",title:"Triage",mission:"Classify work and identify risky or missing context."},
  {id:"spec",title:"Specification",mission:"Define a bounded, testable plan for human approval."},
  {id:"build",title:"Builder",mission:"Implement only after an approved plan and source review."},
  {id:"qa",title:"Quality",mission:"Check the evidence and report gaps, not imagined test results."},
  {id:"review",title:"Reviewer",mission:"Inspect the diff, security boundaries and handoff evidence."},
]);
export const FACTORY_SKILLS=Object.freeze([
  {id:"spec",title:"Specification first",source:"Warp lifecycle / rsc",description:"Define scope and acceptance tests before building."},
  {id:"security",title:"Threat & secret review",source:"super-board guards / rsc",description:"Inspect secrets, permissions and risky inputs without running them."},
  {id:"tests",title:"QA evidence",source:"super-board QA",description:"Separate static checks, test evidence and unverified behavior."},
  {id:"review",title:"Independent review",source:"Warp / super-board",description:"Human decision gate; no autonomous merge or release."},
  {id:"ui",title:"UI refinement",source:"super-board design workflow",description:"Check responsive layout, usability and accessibility."},
  {id:"docs",title:"Knowledge continuity",source:"rsc-harness",description:"Capture decisions, provenance and the next recommended action."},
]);
const highRisk=Object.freeze([
  {label:"Secrets / credentials",test:/\b(token|secret|credential|password|api[ -]?key|contrase(?:ña|na)|credencial|llave|clave privada|clé secrète)\b/i},
  {label:"Authentication / access",test:/\b(auth|authentication|authenticate|login|sign[ -]?in|session|permission|oauth|autenticaci[oó]n|acceso|sesión|connexion|zugriff)\b/i},
  {label:"Billing / payments",test:/\b(payment|billing|checkout|stripe|pago|facturaci[oó]n|tarjeta|paiement|zahlung)\b/i},
  {label:"Deployment / infrastructure",test:/\b(deploy|production|infrastructure|terraform|kubernetes|release|despliegue|producci[oó]n|infraestructura|déploiement)\b/i},
]);
const acceptanceByKind={
 feature:["State the expected user-visible behavior.","Cover invalid inputs and the empty state.","Verify an explicit human review before release."],
 bug:["Document steps to reproduce and the expected behavior.","Add a regression test demonstrating the fix.","Check that existing workflows remain intact."],
 refactor:["Preserve externally observable behavior.","Compare test results before and after refactoring.","Record any changed interfaces or migration needs."],
};
export function analyzeFactoryRequest(value,kind="feature"){
 const request=typeof value==="string"?value.trim().replace(/\s+/g," "):"";
 if(request.length<10||request.length>500)return null;
 const type=["feature","bug","refactor"].includes(kind)?kind:"feature";
 const riskFlags=highRisk.filter(x=>x.test.test(request)).map(x=>x.label);
 const needsUI=/\b(ui|ux|interface|design|screen|page|component|responsive|accessibility|accessible|dashboard|mobile|layout|accesibilidad|interfaz|diseño|pagina|página|pantalla|visual|frontend)\b/i.test(request);
 const needsDocs=/\b(doc|docs|documentation|readme|manual|guide|knowledge|conocimiento|documentaci[oó]n|instrucciones)\b/i.test(request);
 const skills=["spec","tests","review",...(riskFlags.length?["security"]:[]),...(needsUI?["ui"]:[]),...(needsDocs?["docs"]:[])];
 const recommended=FACTORY_SKILLS.filter(s=>skills.includes(s.id));
 const risk=riskFlags.length?"elevated":type==="refactor"?"moderate":"standard";
 const acceptance=[...acceptanceByKind[type],...riskFlags.map(flag=>"Review boundary: "+flag+".")];
 return {
   request,kind:type,risk,riskFlags,roleIds:FACTORY_ROLES.map(x=>x.id),
   skills:recommended,acceptance,
   gates:[
     {id:"scope",title:"Triage & specification",state:"planned",detail:"A draft only; verify requirements and scope."},
     {id:"approval",title:"Human approval",state:"required",detail:"Approval is mandatory before creating a local artifact."},
     {id:"implementation",title:"Controlled build",state:"not_run",detail:"Only a fixed local template is available; no arbitrary code execution."},
     {id:"verification",title:"Static QA & reviewer",state:"not_run",detail:"Only verified static checks can be reported as passed."},
     {id:"handoff",title:"Artifact handoff",state:"blocked",detail:"No automatic PR, merge, deployment or agent execution."},
   ],
 };
}
export function factoryBriefMarkdown(brief){
 if(!brief||typeof brief!=="object"||!Array.isArray(brief.acceptance)||!Array.isArray(brief.skills))return null;
 const line=x=>String(x).replace(/[\r\n]+/g," ").replace(/</g,"&lt;").replace(/>/g,"&gt;");
 return [
  "# Nexus Factory — Human-reviewed work brief",
  "",
  "**Mode:** deterministic draft (no agent inference or code execution)",
  "**Work type:** "+line(brief.kind),
  "**Risk:** "+line(brief.risk),
  "",
  "## Request",
  "",
  line(brief.request),
  "",
  "## Human approval checklist",
  "",
  ...brief.acceptance.map(x=>"- [ ] "+line(x)),
  "",
  "## Recommended procedures (advisory only)",
  "",
  ...brief.skills.map(x=>"- "+line(x.title)+" — "+line(x.description)+" ("+line(x.source)+")"),
  "",
  "## Workflow boundaries",
  "",
  ...brief.gates.map(x=>"- "+line(x.title)+": "+line(x.state)+" — "+line(x.detail)),
  "",
  "## Handoff",
  "",
  "No AI agent ran, no runtime tests executed and no pull request or deployment was created by this brief.",
  "A person must approve the spec and review the generated static artifact.",
  "",
 ].join("\n");
}
