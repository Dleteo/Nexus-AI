import LabsWorkspace from "../../../components/labs/LabsWorkspace";
import {isSiteLanguage} from "../../../data/site-languages";
import {notFound} from "next/navigation";
export default async function LocalizedLabs({params}:{params:Promise<{lang:string}>}){const {lang}=await params;if(!isSiteLanguage(lang))notFound();return <LabsWorkspace language={lang}/>;}
