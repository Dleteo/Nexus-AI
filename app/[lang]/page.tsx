import type {Metadata} from "next";
import {notFound} from "next/navigation";
import CareerHome from "../../components/career/CareerHome";
import {siteLanguages,type SiteLanguage,isSiteLanguage} from "../../data/site-languages";
export const dynamicParams=false;
export function generateStaticParams(){return siteLanguages.filter(x=>x.code!=="es").map(x=>({lang:x.code}));}
export async function generateMetadata({params}:{params:Promise<{lang:string}>}):Promise<Metadata>{
 const {lang}=await params;
 if(!isSiteLanguage(lang)||lang==="es")return {title:"Not found"};
 const titles:Record<Exclude<SiteLanguage,"es">,string>={en:"Joshua Vallejo Sanchez | Junior Web Developer",de:"Joshua Vallejo Sanchez | Junior-Webentwickler",fr:"Joshua Vallejo Sanchez | Développeur web junior",pt:"Joshua Vallejo Sanchez | Desenvolvedor web júnior"};
 return {title:titles[lang],description:"Nexus AI · Developer portfolio, verified projects, certificates and web development.",alternates:{canonical:"/"+lang,languages:{es:"/",en:"/en",de:"/de",fr:"/fr",pt:"/pt","x-default":"/en"}}};
}
export default async function LanguagePage({params}:{params:Promise<{lang:string}>}){
 const {lang}=await params;
 if(!isSiteLanguage(lang)||lang==="es")notFound();
 return <CareerHome language={lang}/>;
}
