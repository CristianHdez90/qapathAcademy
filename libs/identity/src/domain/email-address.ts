export class EmailAddress {
 private constructor(readonly value:string){}
 static create(raw:string):EmailAddress {
  const value=raw.trim().toLowerCase();
  if(value.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))throw new Error('Correo inválido');
  return new EmailAddress(value);
 }
 equals(other:EmailAddress){return this.value===other.value;}
}
