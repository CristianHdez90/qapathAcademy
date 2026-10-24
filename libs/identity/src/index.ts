import type {EmailAddress} from './domain/email-address';
import type {UserRole} from './domain/identity';
/** Bounded context Identity: lógica de negocio, sin dependencias HTTP/DB. */
export {EmailAddress} from './domain/email-address';
export class UserId {
 private constructor(readonly value:string){}
 static from(value:string){
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value))throw new Error('Identificador inválido');
  return new UserId(value);
 }
}
export type User={id:UserId;email:EmailAddress;role:UserRole};

export * from './domain/identity';
export * from './application/auth';
export * from './application/account-security';
