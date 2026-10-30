"use client";

import Image from "next/image";
import {useState} from "react";

/**
 * Free-to-use Unsplash photography for our fictional demo catalog.
 * These are illustrative category images, NOT photos of actual SKUs.
 * Do not add media fields to seedProducts: domain and SQLite data stay deterministic.
 * The images load directly in the browser at no API cost and have a local fallback.
 */
export const commerceMedia = {
  keyboard: {
    src:"https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&h=630&q=78",
    source:"https://unsplash.com/s/photos/mechanical-keyboard",
    alt:"Photograph of a mechanical computer keyboard",
    glyph:"⌨",
  },
  headset: {
    src:"https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&h=630&q=78",
    source:"https://unsplash.com/s/photos/headphones",
    alt:"Photograph of over-ear headphones",
    glyph:"◉",
  },
  monitor: {
    src:"https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=900&h=630&q=78",
    source:"https://unsplash.com/s/photos/computer-monitor",
    alt:"Photograph of a computer display in a workspace",
    glyph:"▣",
  },
  mouse: {
    src:"https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=900&h=630&q=78",
    source:"https://unsplash.com/s/photos/computer-mouse",
    alt:"Photograph of a computer mouse",
    glyph:"⌁",
  },
} as const;

export type CommerceMediaId = keyof typeof commerceMedia;
export function mediaForProduct(id:string){
  return Object.hasOwn(commerceMedia,id) ? commerceMedia[id as CommerceMediaId] : null;
}

/** Only fixed, curated URLs ever reach next/image (no user-controlled remote source). */
export default function CommerceProductPhoto({id,compact=false}:{id:string;compact?:boolean}){
  const [failed,setFailed]=useState(false);
  const media=mediaForProduct(id);
  return <div className={"commerce-product-photo"+(compact?" commerce-product-photo-compact":"")} data-product-photo={id}>
    {media&&!failed
      ? <Image unoptimized fill sizes={compact?"(max-width: 560px) 29vw, 160px":"(max-width: 640px) 90vw, (max-width: 1100px) 40vw, 370px"} src={media.src} alt={media.alt} onError={()=>setFailed(true)} loading="lazy" />
      : <span className="commerce-product-photo-fallback" aria-label={media?.alt||"Product image unavailable"} role="img">{media?.glyph||"◈"}</span>}
  </div>;
}
