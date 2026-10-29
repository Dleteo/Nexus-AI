import { certifications, totalTrainingHours } from "../../../../data/certifications";
import { professionalProfile } from "../../../../data/profile";
import { resumeCopy, type ResumeLang } from "../../../../data/resume-copy";
import { isSiteLanguage } from "../../../../data/site-languages";

import { skillEvidence, proficiency, skillRatingCopy } from "../../../../data/professional-development";

export const runtime = "nodejs";

function latin(value: string): string {
 return value.replace(/\u00b7/g," | ").replace(/[\u2013\u2014]/g,"-")
 .replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"')
 .replace(/[^\u0020-\u00ff]/g,"");
}
function pdfLiteral(value:string):string {
 return "("+latin(value).replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)")+")";
}
function byteString(str:string):Uint8Array {
 const out=new Uint8Array(str.length);
 for(let i=0;i<str.length;i++) out[i]=str.charCodeAt(i)&255;
 return out;
}
function wrap(text:string,max=90):string[] {
 const words=latin(text).split(/\s+/).filter(Boolean);const rows:string[]=[];let row="";
 for(const word of words) {if(row && (row.length+word.length+1)>max){rows.push(row);row=word;}else{row+=(row?" ":"")+word;}}
 if(row)rows.push(row); return rows;
}
function makePdf(lang:ResumeLang):Uint8Array {
 const d=resumeCopy[lang], p=professionalProfile;
 const pages:string[][]=[[]];let y=782;
 const newPage=()=>{pages.push([]);y=782;};
 function line(value:string, size=9, bold=false, indent=0, step=10.5, color:"dark"|"red"|"white"="dark") {
  if(y<55)newPage();
  const ink=color==="red"?"0.84 0.07 0.16":color==="white"?"1 1 1":"0.12 0.10 0.13";
  pages[pages.length-1].push(ink+" rg BT /"+(bold?"F2":"F1")+" "+size+" Tf 1 0 0 1 "+(42+indent)+" "+y+" Tm "+pdfLiteral(value)+" Tj ET");
  y-=step;
 }
 const body=(s:string,limit=92)=>{for(const l of wrap(s,limit))line(l);};
 const section=(heading:string)=>{if(y<100)newPage();y-=5;line(heading.toUpperCase(),10,true,0,15,"red");};
 pages[0].push("0.08 0.06 0.08 rg 32 737 531 78 re f");
 line(p.name.toUpperCase(),21,true,0,30,"white");line(d.role+" | "+d.headline,9,false,0,15,"white");
 line(p.location+" | github.com/Dleteo",8,false,0,12);
 line("Email: "+p.email+" | LinkedIn: "+(p.linkedin||"N/A"),8,false,0,18);
 section(d.headings.profile);body(d.summary);
 section(d.headings.projects);
 for(const item of d.projects){body(item.name+" | "+item.stack,88);body(item.summary);body(item.url.replace("https://github.com/","github.com/"),92);}
 section(d.headings.skills);
 const ratings=skillRatingCopy[lang];
 // Two compact columns keep all twelve ratings legible on the one-page CV.
 body(ratings.usage+" / "+ratings.knowledge);
 for(let row=0;row<6;row++){
  const baseline=y;
  for(let col=0;col<2;col++){
   const skill=skillEvidence[row+col*6];
   const x=42+col*266;
   pages[pages.length-1].push("0.12 0.10 0.13 rg BT /F1 7 Tf 1 0 0 1 "+x+" "+baseline+" Tm "+pdfLiteral(skill.name)+" Tj ET");
   [skill.projects,proficiency[skill.id]??0].forEach((value,meter)=>{
    const start=x+134+meter*60;
    // Bezier circles work in PDF without depending on a symbol font.
    for(let dot=0;dot<5;dot++){
     const cx=start+dot*6,cy=baseline+2,r=1.8,k=r*0.55228475;
     const circle=`${cx+r} ${cy} m ${cx+r} ${cy+k} ${cx+k} ${cy+r} ${cx} ${cy+r} c ${cx-k} ${cy+r} ${cx-r} ${cy+k} ${cx-r} ${cy} c ${cx-r} ${cy-k} ${cx-k} ${cy-r} ${cx} ${cy-r} c ${cx+k} ${cy-r} ${cx+r} ${cy-k} ${cx+r} ${cy} c`;
     pages[pages.length-1].push("0.84 0.07 0.16 RG 0.84 0.07 0.16 rg 0.5 w "+circle+(dot<value?" f":" S"));
    }
    pages[pages.length-1].push("0.12 0.10 0.13 rg BT /F1 6 Tf 1 0 0 1 "+(start+31)+" "+baseline+" Tm "+pdfLiteral(value+"/5")+" Tj ET");
   });
  }
  y-=13;
 }
 body(ratings.note,111);
 section(d.headings.experience);body(d.experience);
 section(d.headings.training+" | "+totalTrainingHours+" h");
 body(d.trainingNote);
 for(const c of certifications)body(c.title+" | "+c.issuer+" | "+c.hours+" h | "+(c.credentialType==="Course completion"?d.completedLabel:d.attendanceLabel),111);
 section(d.headings.research);body(d.research);
 section(d.headings.languages);body(d.languages);
 y-=3;body(d.footnote,112);
 const objects:string[]=[""];
 const push=(obj:string)=>{objects.push(obj);return objects.length-1;};
 const catalog=push("");const pageRoot=push("");
 const normal=push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
 const strong=push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");
 const pageNums:number[]=[];
 for(const commands of pages){
  const stream="1 1 1 rg 0 0 595 842 re f\n0.86 0.08 0.17 rg 32 726 531 4 re f\n"+commands.join("\n")+"\n";
  const streamNum=push("<< /Length "+byteString(stream).length+" >>\nstream\n"+stream+"endstream");
  const page=push("<< /Type /Page /Parent "+pageRoot+" 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 "+normal+" 0 R /F2 "+strong+" 0 R >> >> /Contents "+streamNum+" 0 R >>");
  pageNums.push(page);
 }
 objects[catalog]="<< /Type /Catalog /Pages "+pageRoot+" 0 R >>";
 objects[pageRoot]="<< /Type /Pages /Count "+pageNums.length+" /Kids ["+pageNums.map(i=>i+" 0 R").join(" ")+"] >>";
 let pdf="%PDF-1.4\n%\u00e2\u00e3\u00cf\u00d3\n";const offsets:number[]=[0];
 for(let i=1;i<objects.length;i++){offsets[i]=byteString(pdf).length;pdf+=i+" 0 obj\n"+objects[i]+"\nendobj\n";}
 const start=byteString(pdf).length;
 pdf+="xref\n0 "+objects.length+"\n0000000000 65535 f \n";
 for(let i=1;i<objects.length;i++) pdf+=String(offsets[i]).padStart(10,"0")+" 00000 n \n";
 pdf+="trailer\n<< /Size "+objects.length+" /Root "+catalog+" 0 R >>\nstartxref\n"+start+"\n%%EOF\n";
 return byteString(pdf);
}
export async function GET(request:Request){
 const url=new URL(request.url);
 const requested=url.searchParams.get("lang");
 const lang:ResumeLang=requested&&isSiteLanguage(requested)?requested:"es";
 const bytes=makePdf(lang);
 const buffer=new ArrayBuffer(bytes.byteLength);
 new Uint8Array(buffer).set(bytes);
 return new Response(buffer,{headers:{
 "Content-Type":"application/pdf",
 "Content-Disposition":'attachment; filename="Joshua-Vallejo-Sanchez-CV-'+lang+'.pdf"',
 "Cache-Control":"public, max-age=3600",
 "X-Content-Type-Options":"nosniff",
 }});
}
