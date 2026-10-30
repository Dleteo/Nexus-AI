export const siteLanguages = [
 {code:"en",nativeName:"English",market:"Global / US / UK"},
 {code:"es",nativeName:"Español",market:"España / América Latina"},
 {code:"de",nativeName:"Deutsch",market:"Deutschland / Österreich"},
 {code:"fr",nativeName:"Français",market:"France / Canada"},
 {code:"pt",nativeName:"Português",market:"Brasil / Portugal"},
] as const;
export type SiteLanguage=(typeof siteLanguages)[number]["code"];
export function isSiteLanguage(value:string):value is SiteLanguage {return siteLanguages.some(x=>x.code===value);}
export const portfolioPath=(code:SiteLanguage)=>"/"+code;
export const cvPath=(code:SiteLanguage)=>"/resume?lang="+code;
export const cvDownloadPath=(code:SiteLanguage)=>"/api/resume/pdf?lang="+code;
export const cvFileName=(code:SiteLanguage)=>"Joshua-Vallejo-Sanchez-CV-"+code+".pdf";
export const cvDownloadLabels:Record<SiteLanguage,string>={
 es:"Descargar CV en español (PDF)",
 en:"Download English résumé (PDF)",
 de:"Lebenslauf auf Deutsch herunterladen (PDF)",
 fr:"Télécharger le CV en français (PDF)",
 pt:"Baixar currículo em português (PDF)",
};
