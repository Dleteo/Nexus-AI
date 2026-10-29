import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LabsWorkspace, { type LabId } from "../../../components/labs/LabsWorkspace";

const names: Record<LabId,string> = {
  commerce:"Nexus Commerce",
  studio:"Nexus Studio",
  monitor:"Nexus Monitor",
  factory:"Nexus Factory",
};
const isLab = (value:string):value is LabId => Object.hasOwn(names,value);
export function generateStaticParams(){return Object.keys(names).map(lab=>({lab}));}
export async function generateMetadata({params}:{params:Promise<{lab:string}>}):Promise<Metadata>{
  const {lab}=await params;
  return {title:(isLab(lab)?names[lab]:"Project")+" | Nexus AI"};
}
export default async function StandaloneLab({params}:{params:Promise<{lab:string}>}){
  const {lab}=await params;
  if(!isLab(lab))notFound();
  return <LabsWorkspace key={lab} initialLab={lab} standalone/>;
}
