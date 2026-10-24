/** Crear un administrador inicial LOCALMENTE. Nunca disponible por HTTP. */
import {createHash,randomBytes,scrypt} from 'node:crypto';
import {existsSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import readline from 'node:readline/promises';
import pg from 'pg';
const apiEnv=join(dirname(fileURLToPath(import.meta.url)),'..','..','..','apps','api','.env');
if(!process.env.DATABASE_URL&&existsSync(apiEnv))process.loadEnvFile(apiEnv);
if(!process.env.DATABASE_URL)throw new Error('DATABASE_URL requerido en apps/api/.env');
const rl=readline.createInterface({input:process.stdin,output:process.stdout});
const email=(process.env.ADMIN_EMAIL||await rl.question('Correo de administrador: ')).trim().toLowerCase();
rl.close();
async function hiddenPassword(){
 if(process.env.ADMIN_PASSWORD)return process.env.ADMIN_PASSWORD;
 if(!process.stdin.isTTY||!process.stdin.setRawMode)throw new Error('Ejecuta en una terminal interactiva o suministra ADMIN_PASSWORD como variable temporal.');
 process.stdout.write('Contraseña (no se mostrará): ');
 process.stdin.setRawMode(true);process.stdin.resume();process.stdin.setEncoding('utf8');
 return await new Promise((resolve,reject)=>{
  let password='';const onData=(ch)=>{
   for(const c of ch){
    if(c==='\u0003'){cleanup();reject(new Error('Cancelado'));return;}
    if(c==='\r'||c==='\n'){cleanup();process.stdout.write('\n');resolve(password);return;}
    if(c==='\b'||c==='\u007f'){password=password.slice(0,-1);continue;}
    if(c>=' '&&c!=='\u007f'&&password.length<128)password+=c;
   }
  };
  const cleanup=()=>{process.stdin.off('data',onData);process.stdin.setRawMode(false);process.stdin.pause();};
  process.stdin.on('data',onData);
 });
}
const password=await hiddenPassword();
if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||email.length>254)throw new Error('Correo inválido');
if(password.length<12||password.length>128)throw new Error('Contraseña: entre 12 y 128 caracteres');
const salt=randomBytes(16);
const derived=await new Promise((resolve,reject)=>scrypt(password,salt,32,{N:1<<15,r:8,p:1,maxmem:64*1024*1024},(e,key)=>e?reject(e):resolve(key)));
const passwordHash=`scrypt-v1:${salt.toString('hex')}:${derived.toString('hex')}`;
const pool=new pg.Pool({connectionString:process.env.DATABASE_URL,max:1,connectionTimeoutMillis:5000});
const client=await pool.connect();
try{
 await client.query('BEGIN');
 const existing=await client.query('SELECT id FROM users WHERE email=$1',[email]);
 if(existing.rowCount)throw new Error('El correo ya existe; no se elevarán privilegios de una cuenta existente. Usa otro correo.');
 const inserted=await client.query("INSERT INTO users (email,password_hash,role,must_change_password,email_verified_at) VALUES ($1,$2,'ADMIN',true,NULL) RETURNING id",[email,passwordHash]);
 await client.query("INSERT INTO admin_audit_events(actor_user_id,target_user_id,action,details) VALUES ($1,$1,'ADMIN_BOOTSTRAP','{}'::jsonb)",[inserted.rows[0].id]);
 await client.query('COMMIT');
 console.info(`Administrador creado: ${email}. Primero verifica correo; al entrar deberás cambiar contraseña y activar MFA.`);
}catch(e){await client.query('ROLLBACK');throw e;}finally{client.release();await pool.end();}
