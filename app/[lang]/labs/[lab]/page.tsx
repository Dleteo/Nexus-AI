import { notFound } from "next/navigation";
import LabsWorkspace, { type LabId } from "../../../../components/labs/LabsWorkspace";
import {isSiteLanguage} from "../../../../data/site-languages";
const labs:LabId[]=["commerce","studio","monitor","factory"];
export function generateStaticParams(){return ["en","es","de","fr","pt"].flatMap(lang=>labs.map(lab=>({lang,lab})));}
export default async function LocalizedStandaloneLab({params}:{params:Promise<{lang:string;lab:string}>}){
 const {lang,lab}=await params;
 if(!isSiteLanguage(lang)||!labs.some(value=>value===lab))notFound();
 return <LabsWorkspace language={lang} initialLab={lab as LabId} standalone/>;
}
