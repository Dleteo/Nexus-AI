"use client";
import {forwardRef,type AnchorHTMLAttributes} from 'react';
type Props=Omit<AnchorHTMLAttributes<HTMLAnchorElement>,'href'> & {
 href:string|{pathname?:string;query?:Record<string,string>;hash?:string};
 prefetch?:boolean|null;replace?:boolean;scroll?:boolean;shallow?:boolean;locale?:string|false;
};
/** Full page navigation avoids the hosting adapter's unsupported RSC prefetch. */
const SitesLink=forwardRef<HTMLAnchorElement,Props>(function SitesLink(props,ref){
 const {href,prefetch,replace,scroll,shallow,locale,...anchor}=props;
 void prefetch;void replace;void scroll;void shallow;void locale;
 const target=typeof href==='string'?href:(href.pathname??'/')+(href.query?'?'+new URLSearchParams(href.query):'')+(href.hash??'');
 return <a {...anchor} href={target} ref={ref}/>;
});
export default SitesLink;
