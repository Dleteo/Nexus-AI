import type {Metadata} from "next";
import {notFound} from "next/navigation";
import EditorialPortfolio from "../../components/career/EditorialPortfolio";
import {siteLanguages,type SiteLanguage,isSiteLanguage} from "../../data/site-languages";
export const dynamicParams=false;
export function generateStaticParams(){return siteLanguages.map(x=>({lang:x.code}));}
export async function generateMetadata({params}:{params:Promise<{lang:string}>}):Promise<Metadata>{
 const {lang}=await params;
 if(!isSiteLanguage(lang))return {title:"Not found"};
 const titles:Record<SiteLanguage,string>={es:"Joshua Vallejo Sanchez | Desarrollador web junior",en:"Joshua Vallejo Sanchez | Junior Web Developer",de:"Joshua Vallejo Sanchez | Junior-Webentwickler",fr:"Joshua Vallejo Sanchez | Développeur web junior",pt:"Joshua Vallejo Sanchez | Desenvolvedor web júnior"};
 return {title:titles[lang],description:"Nexus AI · Developer portfolio, verified projects, certificates and web development.",alternates:{canonical:"/"+lang,languages:{es:"/es",en:"/en",de:"/de",fr:"/fr",pt:"/pt","x-default":"/en"}}};
}
export default async function LanguagePage({params}:{params:Promise<{lang:string}>}){
 const {lang}=await params;
 if(!isSiteLanguage(lang))notFound();
 return <EditorialPortfolio language={lang}/>;
}
