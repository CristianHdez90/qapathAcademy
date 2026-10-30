import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,readdirSync,statSync} from 'node:fs';
import {join} from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {rewrite,collect,normalize}=require('../apps/web/scripts/theme-colors.cjs');
test('SPEC-UX-310: los colores se convierten en variables con el valor original como respaldo',()=>{
 assert.equal(rewrite('#52dfb7'),'var(--q-52dfb7,#52dfb7)');
 assert.equal(rewrite('1px solid #2A3D5A'),'1px solid var(--q-2a3d5a,#2A3D5A)');
 assert.equal(rewrite('linear-gradient(90deg,#fff,#0f1a2e80)'),'linear-gradient(90deg,var(--q-ffffff,#fff),var(--q-0f1a2e80,#0f1a2e80))');
 assert.equal(rewrite('url(#gradient)'),'url(#gradient)');assert.equal(rewrite('var(--q-52dfb7,#52dfb7)'),'var(--q-52dfb7,#52dfb7)');
 assert.equal(normalize('ABCF'),'aabbcc');assert.equal(normalize('abc8'),'aabbcc88');assert.equal(normalize('aabbccff'),'aabbcc');
});
test('SPEC-UX-310: el inventario de colores cubre todas las hojas de estilo',()=>{
 const root='apps/web/src',walk=dir=>readdirSync(dir).flatMap(name=>{const path=join(dir,name);return statSync(path).isDirectory()?walk(path):path.endsWith('.css')?[path]:[]});
 const set=new Set();for(const file of walk(root))collect(readFileSync(file,'utf8'),set);
 const manifest=new Set(JSON.parse(readFileSync('apps/web/src/features/appearance/theme-colors.json','utf8')));
 const missing=[...set].filter(code=>!manifest.has(code));assert.deepEqual(missing,[],'ejecuta node apps/web/scripts/prepare-theme-colors.mjs');
});
