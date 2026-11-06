import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve(import.meta.dirname, '..');
const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/');
if (!/^\/[\w/-]*\/$|^\/$/.test(base)) throw new Error('BASE_PATH must be / or /repository/');
await rm(path.join(root,'dist'),{recursive:true,force:true});
await mkdir(path.join(root,'dist'),{recursive:true});
await cp(path.join(root,'public'),path.join(root,'dist'),{recursive:true});
async function pages(dir, relative='') {
  for (const item of await readdir(dir,{withFileTypes:true})) {
    const rel=path.join(relative,item.name);
    if(item.isDirectory()) await pages(path.join(dir,item.name),rel);
    else {
      let html=await readFile(path.join(dir,item.name),'utf8');
      html=html.replaceAll('href="/diary/beginner/1"','href="/learn/#/diary/1"').replaceAll('href="/features/diary/"','href="/learn/#/diary"').replaceAll('href="/features/topik/"','href="/learn/#/topik"');
      html=html.replace(/href="\/(diary|grammar|phonetics|vocabulary|radio|reading|topik|practice)\/?"/g,(_,r)=>`href="/learn/#/${r}"`).replace(/href="\/mine\/membership"/g,'href="/learn/#/settings"').replace(/href="\/scene\/custom\/new[^"]*"/g,'href="/learn/#/speaking"').replace(/href="\/learn"/g,'href="/learn/"').replace(/href="\/(downloads\/[^"]*|api\/app-update[^"]*)"/g,'href="/learn/" data-web-download="true"');
      html=html.replace(/(href|src|poster)="\/(?!\/)([^"]*)"/g,(_,a,v)=>`${a}="${base}${v}"`);
      html=html.replace(/(imageSrcSet|imagesrcset|srcSet|srcset)="([^"]*)"/g,(_,a,v)=>`${a}="${v.replace(/\/brand\//g,base+'brand/')}"`);
      html=html.replace('</head>',`<meta name="app-base" content="${base}"></head>`);
      const target=path.join(root,'dist',rel);await mkdir(path.dirname(target),{recursive:true});await writeFile(target,html);
    }
  }
}
await pages(path.join(root,'src/pages'));
for(const file of await readdir(path.join(root,'dist/brand/assets'))){if(file.endsWith('.css')){const p=path.join(root,'dist/brand/assets',file);let css=await readFile(p,'utf8');css=css.replaceAll('/brand/assets/',base+'brand/assets/');await writeFile(p,css);}}
await writeFile(path.join(root,'dist/.nojekyll'),'');
console.log(`Built dist/ with base ${base}`);
