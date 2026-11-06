import {readdir,readFile,stat} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'../dist');
const basePath=(await readFile(path.join(root,'index.html'),'utf8')).match(/name="app-base" content="([^"]+)"/)?.[1]||'/';
let count=0,assets=0;const broken=[];
async function exists(p){try{const s=await stat(p);if(s.isDirectory())return (await stat(path.join(p,'index.html'))).isFile();return s.isFile();}catch{return false;}}
async function visit(dir){for(const item of await readdir(dir,{withFileTypes:true})){const file=path.join(dir,item.name);if(item.isDirectory())await visit(file);else if(item.name.endsWith('.html')){
 count++;const html=await readFile(file,'utf8'),base=html.match(/name="app-base" content="([^"]+)"/)?.[1]||'/';
 const values=[...html.matchAll(/(?:href|src|poster)="([^"]+)"/g)].map(m=>m[1]);
 for(const m of html.matchAll(/srcset="([^"]+)"/gi))values.push(...m[1].split(',').map(s=>s.trim().split(/\s/)[0]));
 for(const value of values){if(!value||value.startsWith('#')||/^(https?:|mailto:|tel:|data:|javascript:)/.test(value))continue;const url=new URL(value,'http://localhost'+base);let p=decodeURIComponent(url.pathname);if(p.startsWith(base))p=p.slice(base.length);else if(p.startsWith('/')){broken.push(`${path.relative(root,file)}: outside base ${value}`);continue;}
 const target=path.resolve(root,p);if(!target.startsWith(root+path.sep)&&target!==root)throw Error('Invalid asset path');if(!await exists(target))broken.push(`${path.relative(root,file)}: ${value}`);else assets++;
 }
 }else if(item.name.endsWith('.css')){
  const css=await readFile(file,'utf8');for(const m of css.matchAll(/url\(["']?([^\)"']+)["']?\)/g)){const v=m[1];if(/^(data:|https?:|#)/.test(v))continue;let target;if(v.startsWith('/')){target=v.startsWith(basePath)?path.join(root,v.slice(basePath.length)):path.join(root,v);}else target=path.resolve(path.dirname(file),v);if(!await exists(target))broken.push(`${path.relative(root,file)}: ${v}`);else assets++;}
 }
}}
await visit(root);if(broken.length){console.error(broken.join('\n'));throw Error(`${broken.length} missing references`);}console.log(`Verified ${count} pages and ${assets} local asset/link references.`);
