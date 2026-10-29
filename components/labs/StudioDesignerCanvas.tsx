"use client";

import type {CSSProperties} from "react";
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
};

const viewports:StudioViewport[]=["desktop","tablet","mobile"];
const spaces:StudioDesign["density"][]=["compact","balanced","spacious"];

export default function StudioDesignerCanvas({blocks,selected,onSelect,design,onDesignChange,viewport,onViewportChange,disabled=false}:Props){
  const theme=STUDIO_THEMES[design.theme] ?? STUDIO_THEMES.atelier;
  const change=(patch:Partial<StudioDesign>)=>onDesignChange({...design,...patch});
  const style={
    "--studio-page":theme.canvas,
    "--studio-ink":theme.ink,
    "--studio-highlight":theme.accent,
    "--studio-paper":theme.surface,
  } as CSSProperties;
  return <div className="studio-design-console">
    <header className="studio-design-toolbar">
      <div className="studio-toolbar-identity"><span className="studio-toolbar-logo">✦</span><div><strong>NEXUS / STUDIO</strong><small>LIVE VISUAL EDITOR · STATIC HTML</small></div></div>
      <div className="studio-viewport-controls" role="group" aria-label="Preview viewport">
        {viewports.map(mode=><button key={mode} type="button" aria-pressed={viewport===mode} onClick={()=>onViewportChange(mode)}>{mode==="desktop"?"▣":mode==="tablet"?"▤":"▯"} <span>{mode}</span></button>)}
      </div>
      <span className="studio-toolbar-state">● LOCAL DRAFT</span>
    </header>
    <div className="studio-design-layout">
      <div className="studio-canvas-stage">
        <div className="studio-stage-ruler"><span>CANVAS / {viewport.toUpperCase()}</span><span>{blocks.length} BLOCKS · SELECT TO EDIT</span></div>
        <div className={"studio-canvas-frame studio-viewport-"+viewport+" studio-density-"+design.density} data-studio-viewport={viewport} style={style}>
          <div className="studio-canvas-page" data-studio-theme={design.theme} data-studio-alignment={design.alignment}>
            <span className="studio-canvas-overline">YOUR PAGE / LIVE PREVIEW</span>
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
        <footer className="studio-stage-footer"><span>VISUAL PREVIEW · NO SCRIPTS EXECUTED</span><span>100% · {viewport.toUpperCase()}</span></footer>
      </div>
      <aside className="studio-design-inspector" aria-label="Studio design inspector">
        <div className="studio-inspector-title"><strong>INSPECTOR</strong><span>STYLE / 01</span></div>
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
