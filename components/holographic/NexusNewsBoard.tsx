"use client";

import { useEffect, useState } from "react";
import { useGuideLanguage } from "./guidePreferences";

type Headline={title:string;url:string;date:string|null;source:string};
type Feed={headlines:Headline[];live:boolean;updatedAt:string};
const messages={
 es:{title:"Nexus Newsroom",tag:"TECNOLOGÍA / DESARROLLO / IA",loading:"Consultando fuentes técnicas...",empty:"No se pudieron cargar las noticias ahora. Vuelve a intentarlo más tarde.",source:"Fuente original",refresh:"Actualizar noticias",note:"Titulares originales de fuentes públicas. Nexus no genera ni inventa noticias."},
 en:{title:"Nexus Newsroom",tag:"TECH / DEVELOPMENT / AI",loading:"Fetching verified sources...",empty:"News could not be loaded right now. Try again later.",source:"Original source",refresh:"Refresh news",note:"Original public-source headlines. Nexus does not generate or invent breaking news."},
 pt:{title:"Nexus Newsroom",tag:"TECNOLOGIA / DESENVOLVIMENTO / IA",loading:"Buscando fontes...",empty:"Não foi possível carregar as notícias agora.",source:"Fonte original",refresh:"Atualizar",note:"Manchetes de fontes públicas; não são notícias geradas por IA."},
 fr:{title:"Nexus Newsroom",tag:"TECH / DÉVELOPPEMENT / IA",loading:"Chargement des sources...",empty:"Actualités indisponibles pour le moment.",source:"Source originale",refresh:"Actualiser",note:"Titres de sources publiques, non inventés par l'IA."}
} as const;

export default function NexusNewsBoard(){
 const lang=useGuideLanguage();
 const t=messages[lang];
 const [feed,setFeed]=useState<Feed|null>(null);
 const [loading,setLoading]=useState(true);
 const [refresh,setRefresh]=useState(0);
 useEffect(()=>{
   const ctl=new AbortController();
   fetch("/api/news",{cache:"no-store",signal:ctl.signal})
     .then(async r=>r.ok?await r.json() as Feed:null)
     .then(data=>{if(!ctl.signal.aborted)setFeed(data);})
     .catch(()=>{if(!ctl.signal.aborted)setFeed(null);})
     .finally(()=>{if(!ctl.signal.aborted)setLoading(false);});
   return ()=>ctl.abort();
 },[refresh]);
 return <section className="ncc-news" aria-label={t.title}>
   <div className="ncc-news-title"><span>{t.tag}</span><button type="button" onClick={()=>{setLoading(true);setRefresh(v=>v+1);}}>{t.refresh}</button></div>
   {loading?<p role="status">{t.loading}</p>:(feed?.headlines?.length?<ul className="ncc-news-list">
     {feed.headlines.map(item=><li key={item.url}>
       <a href={item.url} target="_blank" rel="noopener noreferrer"><strong>{item.title}</strong></a>
       <small>{item.source} {item.date&&"· "+new Intl.DateTimeFormat(lang,{dateStyle:"medium"}).format(new Date(item.date))}</small>
     </li>)}
   </ul>:<p role="status">{t.empty}</p>)}
   <p className="ncc-news-disclaimer">{t.note}</p>
 </section>;
}
