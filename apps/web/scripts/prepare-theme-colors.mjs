// Genera el inventario de colores de las hojas de estilo para que el tema publicado pueda reasignarlos.
import {readFileSync,readdirSync,statSync,writeFileSync} from 'node:fs';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);const {collect}=require('./theme-colors.cjs');
const root=join(dirname(fileURLToPath(import.meta.url)),'..','src');
const walk=dir=>readdirSync(dir).flatMap(name=>{const path=join(dir,name);return statSync(path).isDirectory()?walk(path):path.endsWith('.css')?[path]:[]});
const set=new Set();for(const file of walk(root))collect(readFileSync(file,'utf8'),set);
const colors=[...set].sort();
const target=join(root,'features','appearance','theme-colors.json');
const next=JSON.stringify(colors)+'\n';let previous='';try{previous=readFileSync(target,'utf8')}catch{}
if(previous!==next)writeFileSync(target,next);
console.log(`Colores de tema: ${colors.length}`);
