import {drizzle} from 'drizzle-orm/node-postgres';
import {Pool} from 'pg';
import * as schema from './schema';
/** Crear conexiones únicamente en adaptadores del backend; nunca en Domain. */
export function createDatabase(databaseUrl:string){
 if(!databaseUrl)throw new Error('DATABASE_URL no configurada');
 const pool=new Pool({connectionString:databaseUrl,max:2,connectionTimeoutMillis:5000,idleTimeoutMillis:30000});
 return {db:drizzle(pool,{schema}),pool};
}
