import {cp,mkdir,rm,writeFile,readFile} from 'node:fs/promises';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
// Always build cloud assets at the root path; GitHub build remains separate.
const savedBase=process.env.BASE_PATH;delete process.env.BASE_PATH;
await import('./build.mjs?cloud');if(savedBase)process.env.BASE_PATH=savedBase;
await rm(path.join(root,'cloud-app/public'),{force:true,recursive:true});
await cp(path.join(root,'dist'),path.join(root,'cloud-app/public'),{recursive:true});
for(const file of ['learning-state.js','learning-data.js','curriculum-extended.js','progress-sync.js'])await cp(path.join(root,'public',file),path.join(root,'cloud-app/lib',file));
console.log('Prepared cloud frontend and shared curriculum.');
