import Link from 'next/link';
import { siteLanguages, type SiteLanguage } from '@/data/site-languages';
const labels: Record<SiteLanguage,string> = {
 es: 'Idioma del proyecto', en: 'Project language', de: 'Projektsprache',
 fr: 'Langue du projet', pt: 'Idioma do projeto',
};
export default function ProjectLanguageSwitcher({language,lab,standalone}: {
 language: SiteLanguage; lab: string; standalone: boolean;
}) {
 return <nav className="lab-language-selector" aria-label={labels[language]}>
  <span>{labels[language]}</span>
  <div>{siteLanguages.map(item=>{
   const base=item.code==='es'?'/labs':'/'+item.code+'/labs';
   const href=standalone?base+'/'+lab:base+'?lab='+lab;
   return <Link key={item.code} href={href} hrefLang={item.code} lang={item.code}
    aria-current={item.code===language?'page':undefined}>{item.nativeName}</Link>;
  })}</div>
 </nav>;
}
