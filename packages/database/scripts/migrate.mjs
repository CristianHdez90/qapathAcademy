import {readFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {dirname,join} from 'node:path';
import {createHash} from 'node:crypto';
import pg from 'pg';
const localEnv=join(dirname(fileURLToPath(import.meta.url)),'..','..','..','apps','api','.env');
if(!process.env.DATABASE_URL&&existsSync(localEnv))process.loadEnvFile(localEnv);
const url=process.env.DATABASE_URL;
if(!url)throw new Error('DATABASE_URL faltante: establezca la conexión antes de migrar.');
const dir=join(dirname(fileURLToPath(import.meta.url)),'..','sql');
const pool=new pg.Pool({connectionString:url,max:1,connectionTimeoutMillis:5000});
const client=await pool.connect();
try {
 await client.query(`CREATE TABLE IF NOT EXISTS qapath_schema_migrations (filename text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`);
 const files=(await readdir(dir)).filter(x=>/^\d+_.*\.sql$/.test(x)).sort();
 for(const filename of files){
  // El checksum se calcula con saltos de línea LF: Git en Windows (core.autocrlf) puede reescribir los .sql con CRLF
  // sin cambiar su contenido. Se aceptan también los checksums históricos calculados con CRLF o LF.
  const raw=await readFile(join(dir,filename),'utf8');const sql=raw.replace(/\r\n/g,'\n');
  const hash=text=>createHash('sha256').update(text).digest('hex');const checksum=hash(sql);
  const accepted=new Set([checksum,hash(raw),hash(sql.replace(/\n/g,'\r\n'))]);
  await client.query('BEGIN');
  try {
   await client.query('SELECT pg_advisory_xact_lock(2249004)');
   const existing=await client.query('SELECT checksum FROM qapath_schema_migrations WHERE filename=$1',[filename]);
   if(existing.rows.length){
    const stored=existing.rows[0].checksum;
    if(!accepted.has(stored))throw new Error(`Migración alterada: ${filename} (registrada ${stored.slice(0,12)}…, archivo ${checksum.slice(0,12)}…). El contenido del .sql cambió después de aplicarse.`);
    if(stored!==checksum){await client.query('UPDATE qapath_schema_migrations SET checksum=$2 WHERE filename=$1',[filename,checksum]);console.log(`Ya aplicada: ${filename} (checksum normalizado a LF)`);}
    else console.log(`Ya aplicada: ${filename}`);
   }
   else {await client.query(sql);await client.query('INSERT INTO qapath_schema_migrations(filename,checksum) VALUES($1,$2)',[filename,checksum]);console.log(`Aplicada: ${filename}`);}
   await client.query('COMMIT');
  }catch(error){await client.query('ROLLBACK');throw error;}
 }
}finally{client.release();await pool.end();}
