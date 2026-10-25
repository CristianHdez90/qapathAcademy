import {createRequire} from 'node:module';
import {dirname,resolve} from 'node:path';
import {mkdir,copyFile} from 'node:fs/promises';
const require=createRequire(import.meta.url);
const source=dirname(require.resolve('@electric-sql/pglite'));
const destination=resolve(import.meta.dirname,'../public/practice/runtime');
await mkdir(destination,{recursive:true});
for(const file of ['pglite.wasm','initdb.wasm','pglite.data'])await copyFile(resolve(source,file),resolve(destination,file));
