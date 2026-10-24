import {Injectable} from '@nestjs/common';
import {createCipheriv,createDecipheriv,createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import type {TotpPort} from '@qapath/identity';
const ALPHABET='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
function base32Encode(bytes:Buffer):string{
 let acc=0,bits=0,out='';for(const v of bytes){acc=(acc<<8)|v;bits+=8;while(bits>=5){out+=ALPHABET[(acc>>>(bits-5))&31];bits-=5;}}
 if(bits>0)out+=ALPHABET[(acc<<(5-bits))&31];return out;
}
function base32Decode(raw:string):Buffer{
 if(!/^[A-Z2-7]{32}$/.test(raw))throw new Error('Secreto TOTP inválido');
 let acc=0,bits=0;const out:number[]=[];
 for(const letter of raw){acc=(acc<<5)|ALPHABET.indexOf(letter);bits+=5;if(bits>=8){out.push((acc>>>(bits-8))&255);bits-=8;}}
 return Buffer.from(out);
}
function codeAt(secret:string,step:number):string{
 const counter=Buffer.alloc(8);counter.writeBigUInt64BE(BigInt(step));
 const digest=createHmac('sha1',base32Decode(secret)).update(counter).digest();
 const offset=digest[digest.length-1]&15;
 return String((digest.readUInt32BE(offset)&0x7fffffff)%1_000_000).padStart(6,'0');
}
export function totpCode(secret:string,at:number):string{return codeAt(secret,Math.floor(at/30000));}
@Injectable()
export class TotpAdapter implements TotpPort {
 private key(){const raw=process.env.MFA_ENCRYPTION_KEY;if(!raw||!/^[0-9a-fA-F]{64}$/.test(raw))throw new Error('MFA_ENCRYPTION_KEY debe ser una clave aleatoria de 32 bytes en hexadecimal.');return Buffer.from(raw,'hex');}
 createSecret(){return base32Encode(randomBytes(20));}
 encrypt(secret:string){const iv=randomBytes(12);const cipher=createCipheriv('aes-256-gcm',this.key(),iv);const value=Buffer.concat([cipher.update(secret,'utf8'),cipher.final()]);return `v1:${iv.toString('base64url')}:${cipher.getAuthTag().toString('base64url')}:${value.toString('base64url')}`;}
 decrypt(encrypted:string){const [version,nonce,tag,content]=encrypted.split(':');if(version!=='v1'||!nonce||!tag||!content)throw new Error('Secreto cifrado inválido');const decipher=createDecipheriv('aes-256-gcm',this.key(),Buffer.from(nonce,'base64url'));decipher.setAuthTag(Buffer.from(tag,'base64url'));return Buffer.concat([decipher.update(Buffer.from(content,'base64url')),decipher.final()]).toString('utf8');}
 provisioningUri(email:string,secret:string){return `otpauth://totp/${encodeURIComponent('QAPath Academy:'+email)}?secret=${secret}&issuer=${encodeURIComponent('QAPath Academy')}&algorithm=SHA1&digits=6&period=30`;}
 matchingStep(secret:string,code:string,afterStep:number){if(!/^\d{6}$/.test(code))return null;const actual=Buffer.from(code);const current=Math.floor(Date.now()/30000);for(const step of [current-1,current,current+1]){if(step<=afterStep)continue;const expected=Buffer.from(codeAt(secret,step));if(timingSafeEqual(expected,actual))return step;}return null;}
 newRecoveryCodes(){return Array.from({length:8},()=>{const bytes=randomBytes(10).toString('hex').toUpperCase();return bytes.match(/.{1,5}/g)!.join('-');});}
 hashRecoveryCode(code:string){return createHash('sha256').update(code.replace(/-/g,'').toUpperCase()).digest('hex');}
}
