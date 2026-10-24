import {Injectable,HttpException} from '@nestjs/common';
import {DatabaseProvider} from '../database.provider';

/** Persistent reservations also work across concurrent Vercel function instances. */
@Injectable()
export class QaQuotaAdapter {
 constructor(private readonly provider:DatabaseProvider){}
 async reserve(userId:string){
  const client=await this.provider.connection.pool.connect();
  try{
   await client.query('BEGIN');
   await client.query('SELECT pg_advisory_xact_lock(71420861)');
   const {rows}=await client.query<{global_count:string;user_count:string;recent_count:string}>(
    `SELECT count(*) AS global_count,
     count(*) FILTER (WHERE actor_user_id=$1) AS user_count,
     count(*) FILTER (WHERE actor_user_id=$1 AND created_at>now()-interval '1 minute') AS recent_count
     FROM admin_audit_events WHERE action='QA_ASSISTANT_REQUEST' AND created_at>=date_trunc('day',now() AT TIME ZONE 'UTC') AT TIME ZONE 'UTC'`,[userId]);
   if(Number(rows[0].global_count)>=100||Number(rows[0].user_count)>=20||Number(rows[0].recent_count)>=5)
    throw new HttpException('Has alcanzado el límite de consultas de IA. Inténtalo más tarde.',429);
   await client.query("INSERT INTO admin_audit_events (actor_user_id,action) VALUES ($1,'QA_ASSISTANT_REQUEST')",[userId]);
   await client.query('COMMIT');
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
 }
}
