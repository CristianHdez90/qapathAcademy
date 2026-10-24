import {readFile} from 'node:fs/promises';
import {createHash,createHmac} from 'node:crypto';
import {join} from 'node:path';
import {expect,Page} from '@playwright/test';
export async function verifyEmail(page:Page,email:string){
 const dir=process.env.TEST_INBOX_DIR!;
 const path=join(dir,createHash('sha256').update(email.toLowerCase()).digest('hex')+'.json');
 let token='';
 await expect.poll(async()=>{try{const value=JSON.parse(await readFile(path,'utf8')) as {token:string};token=value.token;return true;}catch{return false}},{timeout:10000}).toBe(true);
 await page.goto('/verify-email#token='+encodeURIComponent(token));
 await expect(page.getByText('Correo verificado. Ya puedes iniciar sesión.')).toBeVisible();
}
export function totp(secret:string){
 const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';let a=0,bits=0;const bytes:number[]=[];
 for(const v of secret){a=a<<5|alphabet.indexOf(v);bits+=5;if(bits>=8){bytes.push((a>>>(bits-8))&255);bits-=8}}
 const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(Math.floor(Date.now()/30000)));
 const digest=createHmac('sha1',Buffer.from(bytes)).update(counter).digest();const offset=digest.at(-1)!&15;
 return String((digest.readUInt32BE(offset)&0x7fffffff)%1_000_000).padStart(6,'0');
}
