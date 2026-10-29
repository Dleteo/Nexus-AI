/**
 * Nexus Studio presentation settings: fixed local presets, never arbitrary user CSS.
 * This keeps the export static, offline and safe to inspect without script execution.
 */
export const STUDIO_THEMES = Object.freeze({
  atelier: Object.freeze({label:"Atelier",canvas:"#eee9e4",ink:"#28252a",accent:"#ea674d",surface:"#fffaf5"}),
  noir: Object.freeze({label:"Noir",canvas:"#17191f",ink:"#f6f1e9",accent:"#ff986c",surface:"#252831"}),
  editorial: Object.freeze({label:"Editorial",canvas:"#e9e3d9",ink:"#242c33",accent:"#287bb2",surface:"#fffdf7"}),
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
  const buttonInk=design.theme==="editorial"?"#ffffff":"#231f22";
  return `/* Nexus Studio: fixed, vetted design preset. */
body{background:${t.canvas};color:${t.ink};font:18px/1.7 system-ui,sans-serif;max-width:100%;margin:0;padding:0}
main{position:relative;isolation:isolate;overflow:hidden;width:min(100%,900px);margin:0 auto;padding:clamp(24px,6vw,72px);text-align:${alignment};background:radial-gradient(ellipse at 92% 25%,${t.accent}22,transparent 48%),${t.surface};min-height:100vh;box-sizing:border-box}
main::before{content:"";position:absolute;top:10%;right:-9%;width:35%;aspect-ratio:1;border:1px solid ${t.accent}55;border-radius:46% 54% 63% 37%;transform:rotate(-24deg);pointer-events:none;opacity:.7}
main>*{position:relative;z-index:1}
main>*{margin:${spacing}px 0}
main h1{font-family:Georgia,"Times New Roman",serif;font-size:clamp(36px,6vw,64px);font-weight:750;letter-spacing:-.06em;line-height:1.04;overflow-wrap:anywhere}
main p{overflow-wrap:anywhere}
main .button{display:inline-block;color:${buttonInk};background:${t.accent};padding:14px 20px;border-radius:6px;font-weight:750}`;
}
/** Body text is escaped by the shared renderer. The only injected CSS is preset-based. */
export function renderDesignedStudioHtml(blocks,design,baseRenderer){
  const html=baseRenderer(blocks);
  return html.replace("</style>",studioDesignCss(design)+"</style>");
}
