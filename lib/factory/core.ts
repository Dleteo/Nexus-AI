export type Stage = 'planned' | 'ready' | 'review' | 'done' | 'cancelled';
export type Kind = 'feature' | 'bug' | 'refactor';
export type Job = {
  id: string; title: string; request: string; kind: Kind; source: 'manual' | 'github' | 'ticket';
  createdAt: string; stage: Stage; approval: string | null; review: string;
  events: { at: string; message: string }[];
};
export type FileMap = Record<string, string>;
export const stages: { id: Stage; label: string; role: string }[] = [
  { id: 'planned', label: 'Planificación', role: 'Coordinador' },
  { id: 'ready', label: 'Listo', role: 'Aprobación humana' },
  { id: 'review', label: 'Revisión', role: 'Build + QA estática' },
  { id: 'done', label: 'Entregado', role: 'Revisión humana' },
];
export const skills = [
  { id: 'documentation', name: 'Memoria del proyecto', origin: 'rsc-harness', path: 'rsc-harness/skills', description: 'Contexto, decisiones y criterios de aceptación en archivos portables.' },
  { id: 'super-board', name: 'Coordinación del tablero', origin: 'super-board', path: 'super-board/skills/super-board', description: 'Trabajo por etapas y trazabilidad desde la solicitud hasta la entrega.' },
  { id: 'super-build', name: 'Construcción', origin: 'super-board', path: 'super-board/skills/super-build', description: 'Responsabilidad separada para implementación y evidencia.' },
  { id: 'super-qa', name: 'Verificación', origin: 'super-board', path: 'super-board/skills/super-qa', description: 'Resultados comprobables antes de pasar a revisión.' },
  { id: 'super-review', name: 'Revisión', origin: 'super-board', path: 'super-board/skills/super-review', description: 'Hallazgos y devolución a planificación cuando hace falta.' },
  { id: 'accessibility', name: 'Accesibilidad', origin: 'rsc-harness', path: 'rsc-harness/skills/accessibility', description: 'Criterios de estructura, lectura y controles accesibles.' },
];
const escapeHtml = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
export function createJob(title: string, request: string, kind: Kind, source: Job['source'], id: string, at: string): Job {
  if (title.trim().length < 4 || title.length > 100 || request.trim().length < 15 || request.length > 2000) throw new Error('Escribe un título de 4–100 caracteres y un objetivo de 15–2000.');
  if (!['feature', 'bug', 'refactor'].includes(kind) || !['manual', 'github', 'ticket'].includes(source)) throw new Error('Tipo u origen no válido.');
  return { id, title: title.trim(), request: request.trim(), kind, source, createdAt: at, stage: 'planned', approval: null, review: '', events: [{ at, message: 'Solicitud recibida; plan determinista preparado.' }] };
}
export function filesFor(job: Job): FileMap {
  const definition = { schemaVersion: 1, name: 'Nexus Software Factory', task: job.id, mode: 'offline-static', source: { type: job.source, connected: false }, stages: ['triage', 'plan', 'human-approval', 'build', 'static-qa', 'human-review', 'export'], roles: ['coordinator', 'builder', 'qa', 'reviewer'], provider: 'none', execution: 'not_run', autoMerge: false, skills: skills.map(s => s.path) };
  const spec = { title: job.title, goal: job.request, kind: job.kind, createdAt: job.createdAt, acceptance: ['Solicitud incluida como texto escapado.', 'HTML/CSS local sin scripts ni dependencias remotas.', 'Memoria, definición y tablero incluidos.', 'QA estática y revisión humana antes de exportar.'], scope: 'Plantilla estática; no implementación arbitraria del objetivo.' };
  return {
    'index.html': `<!doctype html>\n<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(job.title)}</title><link rel="stylesheet" href="styles.css"></head><body><main><span>NEXUS FACTORY / STATIC STARTER</span><h1>${escapeHtml(job.title)}</h1><p>${escapeHtml(job.request)}</p><footer>Base HTML/CSS generada a partir de un plan revisado. El objetivo describe trabajo pendiente, no funcionalidades implementadas.</footer></main></body></html>\n`,
    'styles.css': '*{box-sizing:border-box}body{margin:0;background:#151714;color:#f0eee5;font:18px/1.7 system-ui;padding:6vw}main{max-width:900px;margin:auto;border:1px solid #535441;padding:7vw}span{color:#d8c18e;font-size:12px;letter-spacing:.16em}h1{font-size:clamp(32px,7vw,80px);line-height:1.1;overflow-wrap:anywhere}p{white-space:pre-wrap;overflow-wrap:anywhere}footer{border-top:1px solid #535441;margin-top:60px;padding-top:24px;font-size:13px;color:#b8bbae}\n',
    'factory.definition.json': JSON.stringify(definition, null, 2),
    '02-DOCS/spec.json': JSON.stringify(spec, null, 2),
    '02-DOCS/memory.md': `# Memoria del proyecto\n\n## Objetivo\n${JSON.stringify(job.request)}\n\n## Decisiones\n- Modo offline determinista.\n- Plantilla HTML/CSS, sin modelo ni ejecución.\n- El código de los paquetes de referencia se distribuye en tools/nexus-factory/upstream del proyecto Nexus AI.\n\n## Pendiente\nImplementar el objetivo, ejecutar sus pruebas en un entorno adecuado y revisar antes de publicar.\n`,
    'board.json': JSON.stringify({ task: job.id, title: job.title, source: job.source, lanes: stages.map(s => s.label), scope: 'Snapshot del plan, no estado de un servicio conectado.' }, null, 2),
    'README.md': '# Nexus Software Factory\n\nBase estática portable con especificación, memoria y definición de flujo. Abra index.html para ver la plantilla. No contiene implementación autónoma, inferencia, ejecución, PR ni despliegue. QA es análisis estático.\n\nDiseño del flujo inspirado en Warp Factories (https://docs.warp.dev/factories). Memoria inspirada en rsc-harness; etapas Build/QA/Review en super-board. Consulte docs/factory/README.md y THIRD_PARTY_NOTICES.md en Nexus AI para versiones, licencias y uso opcional de los paquetes originales.\n',
  };
}
export function staticQA(files: FileMap) {
  const html = files['index.html'] ?? '';
  return [
    { name: 'Rutas relativas controladas', passed: Object.keys(files).length === 7 && Object.keys(files).every(p => !p.startsWith('/') && !p.split('/').includes('..') && /^[a-zA-Z0-9_.\-/]+$/.test(p)) },
    { name: 'Un encabezado principal', passed: (html.match(/<h1>/g) ?? []).length === 1 && (html.match(/<\/h1>/g) ?? []).length === 1 },
    { name: 'Sin scripts ni manejadores HTML', passed: !/<script\b|\son\w+\s*=/i.test(html) },
    { name: 'CSS local sin recursos externos', passed: html.includes('href="styles.css"') && !/https?:|@import|url\(/i.test(files['styles.css'] ?? '') },
    { name: 'Memoria y definición válidas', passed: (() => { try { return JSON.parse(files['factory.definition.json']).execution === 'not_run' && !!JSON.parse(files['02-DOCS/spec.json']).goal && !!files['02-DOCS/memory.md']; } catch { return false; } })() },
    { name: 'Tamaño acotado', passed: Object.values(files).every(f => new TextEncoder().encode(f).length <= 16000) },
  ];
}
export async function digest(files: FileMap): Promise<string> {
  const canonical = JSON.stringify(Object.keys(files).sort().map(p => [p, files[p]]));
  const value = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(canonical));
  return Array.from(new Uint8Array(value), n => n.toString(16).padStart(2, '0')).join('');
}
export async function transition(job: Job, action: 'approve' | 'build' | 'accept' | 'revise' | 'cancel', note = '', at = new Date().toISOString()): Promise<Job> {
  if (job.events.length >= 290) throw new Error("Límite de historial alcanzado.");
  const hash = await digest(filesFor(job));
  const next = { ...job, events: [...job.events] };
  let message = '';
  if (action === 'cancel' && !['done', 'cancelled'].includes(job.stage)) { next.stage = 'cancelled'; next.approval = null; message = 'Trabajo cancelado.'; }
  else if (action === 'approve' && job.stage === 'planned') { next.stage = 'ready'; next.approval = hash; message = 'Plan y snapshot exacto aprobados por la persona usuaria.'; }
  else if (action === 'build' && job.stage === 'ready' && job.approval === hash) {
    if (!staticQA(filesFor(job)).every(c => c.passed)) throw new Error('QA estática fallida.');
    next.stage = 'review'; message = 'Plantilla preparada y QA estática completada. Ejecución: not_run.';
  } else if (action === 'accept' && job.stage === 'review' && job.approval === hash && note.trim().length >= 10) {
    next.stage = 'done'; next.review = note.trim().slice(0, 1000); message = 'Revisión humana registrada; exportación habilitada.';
  } else if (action === 'revise' && job.stage === 'review' && note.trim().length >= 10) {
    next.stage = 'planned'; next.approval = null; next.review = note.trim().slice(0, 1000); message = 'Devuelto a planificación: ' + next.review;
  } else throw new Error('Transición no válida. Revisa la etapa, la aprobación y la nota (mínimo 10 caracteres).');
  next.events.push({ at, message });
  return next;
}
export async function exportFiles(job: Job): Promise<FileMap> {
  const files = filesFor(job);
  if (job.stage !== 'done' || job.approval !== await digest(files) || !staticQA(files).every(c => c.passed)) throw new Error('El trabajo necesita aprobación vigente, QA y revisión humana.');
  files['qa-results.json'] = JSON.stringify({ mode: 'static-validation', execution: 'not_run', checks: staticQA(files) }, null, 2);
  files['review.json'] = JSON.stringify({ approvalDigest: job.approval, note: job.review, events: job.events }, null, 2);
  const manifest: Record<string, string> = {};
  for (const [name, content] of Object.entries(files)) manifest[name] = await digest({ [name]: content });
  files['manifest.json'] = JSON.stringify({ algorithm: 'SHA-256 canonical-path-content', files: manifest, note: 'Integridad de contenido; no firma digital ni garantía de seguridad.' }, null, 2);
  return files;
}
export function parseHistory(raw: string): Job[] {
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value) || value.length > 80) throw new Error('Historial no válido.');
  return value.map((v: unknown) => {
    if (!v || typeof v !== 'object') throw new Error('Trabajo no válido.');
    const j = v as Job;
    createJob(j.title, j.request, j.kind, j.source, j.id, j.createdAt);
    if (typeof j.id !== 'string' || !/^[\w-]{1,80}$/.test(j.id) || !Number.isFinite(Date.parse(j.createdAt)) || ![...stages.map(s => s.id), 'cancelled'].includes(j.stage) || !(j.approval === null || typeof j.approval === 'string' && /^[a-f0-9]{64}$/.test(j.approval)) || typeof j.review !== 'string' || j.review.length > 1000 || !Array.isArray(j.events) || j.events.length > 300 || j.events.some(e => !e || typeof e.message !== 'string' || e.message.length > 2000 || typeof e.at !== 'string' || !Number.isFinite(Date.parse(e.at)))) throw new Error('Formato de trabajo no válido.');
    return j;
  });
}
