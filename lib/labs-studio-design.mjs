/**
 * Nexus Studio presentation settings: fixed local presets, never arbitrary user CSS.
 * This keeps the export static, offline and safe to inspect without script execution.
 */
export const STUDIO_THEMES = Object.freeze({
  atelier: Object.freeze({label:"Atelier",canvas:"#f6f2fb",ink:"#30243d",accent:"#7250ad",surface:"#ffffff"}),
  noir: Object.freeze({label:"Noir",canvas:"#201a2a",ink:"#f7efff",accent:"#c8a5ff",surface:"#2c2338"}),
  editorial: Object.freeze({label:"Editorial",canvas:"#f8f0e6",ink:"#322421",accent:"#a95e42",surface:"#fffaf3"}),
});
export const STUDIO_DEFAULT_DESIGN = Object.freeze({theme:"atelier",alignment:"left",density:"balanced"});
export function normalizeStudioDesign(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {...STUDIO_DEFAULT_DESIGN};
  return {
    theme:Object.hasOwn(STUDIO_THEMES,value.theme)?value.theme:STUDIO_DEFAULT_DESIGN.theme,
    alignment:["left","center"].includes(value.alignment)?value.alignment:STUDIO_DEFAULT_DESIGN.alignment,
    density:["compact","balanced","spacious"].includes(value.density)?value.density:STUDIO_DEFAULT_DESIGN.density,
  };
}
export function studioDesignCss(value){
  const design=normalizeStudioDesign(value);
  const t=STUDIO_THEMES[design.theme];
  const spacing={compact:14,balanced:25,spacious:43}[design.density];
  const alignment=design.alignment;
  return `/* Nexus Studio: fixed, vetted design preset. */
body{background:${t.canvas};color:${t.ink};font:18px/1.7 system-ui,sans-serif;max-width:100%;margin:0;padding:0}
main{width:min(100%,900px);margin:0 auto;padding:clamp(24px,6vw,72px);text-align:${alignment};background:${t.surface};min-height:100vh;box-sizing:border-box}
main>*{margin:${spacing}px 0}
main h1{font-size:clamp(36px,6vw,64px);font-weight:800;line-height:1.1;overflow-wrap:anywhere}
main p{overflow-wrap:anywhere}
main .button{display:inline-block;color:#fff;background:${t.accent};padding:12px 21px;border-radius:9px;font-weight:700}`;
}
/** Body text is escaped by the shared renderer. The only injected CSS is preset-based. */
export function renderDesignedStudioHtml(blocks,design,baseRenderer){
  const html=baseRenderer(blocks);
  return html.replace("</style>",studioDesignCss(design)+"</style>");
}
