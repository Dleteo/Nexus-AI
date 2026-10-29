"use client";

import {useState, type CSSProperties} from "react";
import {STUDIO_THEMES} from "../../lib/labs-studio-design.mjs";

export type StudioDesign = {
  theme:"atelier"|"noir"|"editorial";
  alignment:"left"|"center";
  density:"compact"|"balanced"|"spacious";
};
export type StudioViewport = "desktop"|"tablet"|"mobile";
type StudioBlock = {id:string;type:"hero"|"text"|"button";text:string};
type Props = {
  blocks:StudioBlock[];
  selected:number;
  onSelect:(index:number)=>void;
  design:StudioDesign;
  onDesignChange:(next:StudioDesign)=>void;
  viewport:StudioViewport;
  onViewportChange:(next:StudioViewport)=>void;
  disabled?:boolean;
  exportMarkup:string;
};

const viewports:StudioViewport[]=["desktop","tablet","mobile"];
const spaces:StudioDesign["density"][]=["compact","balanced","spacious"];

export default function StudioDesignerCanvas({blocks,selected,onSelect,design,onDesignChange,viewport,onViewportChange,exportMarkup,disabled=false}:Props){
  const [previewMode,setPreviewMode]=useState<"canvas"|"code">("canvas");
  const [copied,setCopied]=useState(false);
  const [showGrid,setShowGrid]=useState(true);
  async function copyHtml(){try{await navigator.clipboard.writeText(exportMarkup);setCopied(true);}catch{setCopied(false);}}
  const theme=STUDIO_THEMES[design.theme] ?? STUDIO_THEMES.atelier;
  const change=(patch:Partial<StudioDesign>)=>onDesignChange({...design,...patch});
  const style={
    "--studio-page":theme.canvas,
    "--studio-ink":theme.ink,
    "--studio-highlight":theme.accent,
    "--studio-paper":theme.surface,
  } as CSSProperties;
  return <div className="studio-design-console" style={style}>
    <header className="studio-design-toolbar">
      <div className="studio-toolbar-identity"><span className="studio-toolbar-logo">◈</span><div><strong>NEXUS / STUDIO</strong><small>DESIGN WORKSPACE · LOCAL FIRST</small></div></div>
      <div className="studio-viewport-controls" role="group" aria-label="Preview viewport">
        {viewports.map(mode=><button key={mode} type="button" aria-pressed={viewport===mode} onClick={()=>onViewportChange(mode)}>{mode==="desktop"?"▣":mode==="tablet"?"▤":"▯"} <span>{mode}</span></button>)}
      </div>
      <span className="studio-toolbar-state"><i aria-hidden="true"/> LOCAL DRAFT</span>
    </header>
    <div className="studio-document-strip"><span className="studio-document-tab"><span aria-hidden="true">▦</span> index.html <i aria-hidden="true"/> </span><span className="studio-document-context">DOCUMENT / DESIGN SYSTEM <span aria-hidden="true">•</span> UNSAVED PREVIEW</span></div>
    <div className="studio-design-layout">
      <div className={"studio-canvas-stage"+(showGrid?"":" studio-canvas-no-grid")}>
        <div className="studio-stage-ruler"><span>{previewMode==="canvas"?"DESIGN CANVAS / "+viewport.toUpperCase():"EXPORT SOURCE / HTML"}</span><span>{blocks.length} BLOCKS · LOCAL DOCUMENT</span></div><div className="studio-stage-tabs" role="group" aria-label="Studio preview mode"><button type="button" onClick={()=>setPreviewMode("canvas")} aria-pressed={previewMode==="canvas"}>◈ Design</button><button type="button" onClick={()=>{setPreviewMode("code");setCopied(false);}} aria-pressed={previewMode==="code"}>〈/〉 HTML</button><button type="button" className="studio-toggle-grid" aria-pressed={showGrid} onClick={()=>setShowGrid(v=>!v)} aria-label="Toggle canvas grid">⊞ Grid</button>{previewMode==="code"&&<button type="button" onClick={()=>void copyHtml()} className="studio-copy-code">{copied?"Copied HTML":"Copy HTML"}</button>}</div>
        {previewMode==="canvas"?<div className={"studio-canvas-frame studio-viewport-"+viewport+" studio-density-"+design.density} data-studio-viewport={viewport}>
          <div className="studio-canvas-page" data-studio-theme={design.theme} data-studio-alignment={design.alignment}>
            <span className="studio-canvas-overline"><span aria-hidden="true">✳</span> NEXUS / DESIGN NOTES <span className="studio-canvas-edition">ISSUE Nº 01</span></span>
            {blocks.map((block,index)=><button
              key={block.id}
              type="button"
              disabled={disabled}
              className={"studio-canvas-block studio-canvas-"+block.type}
              aria-label={"Select "+block.type+" block "+(index+1)}
              aria-pressed={selected===index}
              onClick={()=>onSelect(index)}
            ><span>{block.text}</span>{selected===index&&<small className="studio-selection-handle" aria-hidden="true">EDIT</small>}</button>)}
            {blocks.length===0&&<p className="studio-canvas-empty">Your page is empty. Add a block in the Layers panel.</p>}
          </div>
        </div>
        :<div className="studio-code-window" role="region" aria-label="Generated HTML source"><div className="studio-code-title"><span>◈ /index.html</span><span>READ ONLY · SAFE EXPORT</span></div><pre><code>{exportMarkup}</code></pre></div>}
        <footer className="studio-stage-footer"><span>VISUAL PREVIEW · NO SCRIPTS EXECUTED</span><span>100% · {viewport.toUpperCase()}</span></footer>
      </div>
      <aside className="studio-design-inspector" aria-label="Studio design inspector">
        <div className="studio-inspector-title"><strong>DESIGN INSPECTOR</strong><span>STYLE / 01</span></div>
        <div className="studio-inspector-palette" aria-label="Selected theme colors"><span className="studio-palette-surface"/><span className="studio-palette-accent"/><span className="studio-palette-canvas"/><span className="studio-palette-label">LIVE PALETTE</span></div>
        <section aria-label="Studio themes">
          <h3>Color system</h3>
          <p>Switch the page palette. The export uses the same colors.</p>
          <div className="studio-theme-options">
            {(["atelier","noir","editorial"] as const).map(key=><button key={key} type="button" onClick={()=>change({theme:key})} aria-pressed={design.theme===key} className="studio-theme-button">
              <span className={"studio-theme-swatch studio-theme-"+key} aria-hidden="true"><i/><i/></span>
              <span>{STUDIO_THEMES[key].label}</span>
            </button>)}
          </div>
        </section>
        <section aria-label="Studio alignment"><h3>Text alignment</h3><div className="studio-inspector-toggle">{(["left","center"] as const).map(option=><button type="button" key={option} aria-pressed={design.alignment===option} onClick={()=>change({alignment:option})}>{option==="left"?"☷":"≡"} {option}</button>)}</div></section>
        <section aria-label="Studio spacing"><h3>Element spacing</h3><div className="studio-inspector-spacing">{spaces.map(space=><button type="button" key={space} aria-pressed={design.density===space} onClick={()=>change({density:space})}>{space}</button>)}</div></section>
        <section aria-label="Studio selection"><h3>Selected layer</h3><div className="studio-inspector-selection"><span>{blocks[selected]?blocks[selected].type.toUpperCase():"NONE"}</span><strong>{blocks[selected]?blocks[selected].text.slice(0,55):"Select a block"}</strong><small>Use the Layers panel to edit the text, duplicate, reorder or remove it.</small></div></section>
      </aside>
    </div>
  </div>;
}
