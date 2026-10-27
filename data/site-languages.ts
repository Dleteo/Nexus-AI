export const siteLanguages = [
 {code:"en",nativeName:"English",market:"Global / US / UK"},
 {code:"es",nativeName:"Español",market:"España / América Latina"},
 {code:"de",nativeName:"Deutsch",market:"Deutschland / Österreich"},
 {code:"fr",nativeName:"Français",market:"France / Canada"},
 {code:"pt",nativeName:"Português",market:"Brasil / Portugal"},
] as const;
export type SiteLanguage=(typeof siteLanguages)[number]["code"];
export function isSiteLanguage(value:string):value is SiteLanguage {return siteLanguages.some(x=>x.code===value);}
export const portfolioPath=(code:SiteLanguage)=>code==="es"?"/":"/"+code;
export const cvPath=(code:SiteLanguage)=>"/resume?lang="+code;
