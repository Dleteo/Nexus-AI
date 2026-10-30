import {defineConfig} from 'vite';
import vinext from 'vinext';
import {cloudflare} from '@cloudflare/vite-plugin';
export default defineConfig({plugins:[
 {
  name:'portfolio-hosted-links',enforce:'pre',
  transform(code,id){
   if(!id.includes('/node_modules/')&&/\.[jt]sx?(\?|$)/.test(id)){
    const updated=code.replace(/from\s*(['"])next\/link\1/g,'from "@/components/hosting/SitesLink"');
    if(updated!==code)return {code:updated,map:null};
   }
  }
 },
 vinext(),cloudflare({viteEnvironment:{name:'rsc',childEnvironments:['ssr']}})
]});
