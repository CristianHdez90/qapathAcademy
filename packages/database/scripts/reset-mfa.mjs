/**
 * Restablece el MFA de una cuenta SOLO en desarrollo local. Nunca disponible por HTTP.
 * Uso: pnpm db:reset-mfa  (pide el correo)   ·   o  RESET_MFA_EMAIL=correo pnpm db:reset-mfa
 * Efecto: borra la credencial TOTP y los códigos de recuperación, desactiva MFA, revoca sesiones
 * y desafíos abiertos y quita el bloqueo por intentos. No toca progreso, notas ni evidencias.
 * En el siguiente inicio de sesión un ADMIN vuelve a la etapa MFA_SETUP y ve un QR nuevo.
 */
import {existsSync} from 'node:fs';
import {dirname,join} from 'node:path';
import {fileURLToPath} from 'node:url';
import readline from 'node:readline/promises';
import pg from 'pg';
const apiEnv=join(dirname(fileURLToPath(import.meta.url)),'..','..','..','apps','api','.env');
if(!process.env.DATABASE_URL&&existsSync(apiEnv))process.loadEnvFile(apiEnv);
const url=process.env.DATABASE_URL;
if(!url)throw new Error('DATABASE_URL requerido en apps/api/.env');
if(process.env.NODE_ENV==='production')throw new Error('reset-mfa está deshabilitado con NODE_ENV=production.');
const host=new URL(url).hostname;
if(!['localhost','127.0.0.1','::1','[::1]'].includes(host))throw new Error(`reset-mfa solo se permite contra una base local (host actual: ${host}).`);
const rl=readline.createInterface({input:process.stdin,output:process.stdout});
const email=(process.env.RESET_MFA_EMAIL||await rl.question('Correo de la cuenta a restablecer: ')).trim().toLowerCase();
if(!email.includes('@')){rl.close();throw new Error('Correo inválido.');}
if(!process.env.RESET_MFA_EMAIL){const ok=(await rl.question(`Escribe de nuevo ${email} para confirmar: `)).trim().toLowerCase();if(ok!==email){rl.close();throw new Error('Confirmación distinta: no se cambió nada.');}}
rl.close();
const pool=new pg.Pool({connectionString:url,max:1,connectionTimeoutMillis:5000});
const client=await pool.connect();
try{
 await client.query('BEGIN');
 const found=await client.query('SELECT id,role FROM users WHERE lower(email)=$1 FOR UPDATE',[email]);
 if(!found.rows.length)throw new Error('No existe una cuenta con ese correo.');
 const {id,role}=found.rows[0];
 await client.query('DELETE FROM user_mfa_credentials WHERE user_id=$1',[id]);
 const codes=await client.query('DELETE FROM mfa_recovery_codes WHERE user_id=$1',[id]);
 await client.query('UPDATE users SET mfa_enabled=false,failed_attempts=0,locked_until=NULL,updated_at=now() WHERE id=$1',[id]);
 const sessions=await client.query('UPDATE auth_sessions SET revoked_at=now() WHERE user_id=$1 AND revoked_at IS NULL',[id]);
 await client.query('UPDATE auth_challenges SET consumed_at=now() WHERE user_id=$1 AND consumed_at IS NULL',[id]);
 await client.query('COMMIT');
 console.log(`MFA restablecido para ${email} (${role}). Códigos de recuperación eliminados: ${codes.rowCount}. Sesiones revocadas: ${sessions.rowCount}.`);
 console.log(role==='ADMIN'?'Inicia sesión de nuevo: verás «Generar clave MFA» y un QR nuevo para vincular tu app.':'Inicia sesión de nuevo; puedes activar MFA desde Mi cuenta.');
}catch(error){await client.query('ROLLBACK').catch(()=>{});throw error}
finally{client.release();await pool.end()}
