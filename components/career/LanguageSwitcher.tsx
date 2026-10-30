import Link from "next/link";
import { siteLanguages, portfolioPath, type SiteLanguage } from "../../data/site-languages";
export default function LanguageSwitcher({language}:{language:SiteLanguage}){
 return <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Choose portfolio language">
 <span className="text-xs text-slate-400" aria-hidden="true">🌐</span>
 {siteLanguages.map(item=><Link key={item.code} href={portfolioPath(item.code)} hrefLang={item.code} aria-current={item.code===language?"page":undefined} lang={item.code} className={item.code===language?"rounded-md border border-sky-400 bg-sky-900/40 px-2.5 py-1.5 text-xs font-semibold text-sky-100":"rounded-md border border-slate-600 px-2.5 py-1.5 text-xs text-slate-300 hover:border-sky-400"}>{item.nativeName}</Link>)}
 </div>;
}
