import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const base=new URL('./upstream/',import.meta.url);
const manifest=JSON.parse(await readFile(new URL('./sources.sha256.json',import.meta.url),'utf8'));
let count=0;
for(const [path,expected] of Object.entries(manifest)){
 if(path.startsWith('/')||path.split('/').includes('..'))throw new Error('Invalid source path');
 const bytes=await readFile(new URL(path,base));
 if(createHash('sha256').update(bytes).digest('hex')!==expected)throw new Error('Source changed: '+path);
 count++;
}
console.log(JSON.stringify({ok:true,files:count,rsc:'3.6.0',superBoard:'3.1.2',execution:'not_run',note:'Source integrity only; not a security audit or agent run.'}));
