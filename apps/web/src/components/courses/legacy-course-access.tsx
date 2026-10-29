'use client';
import Link from 'next/link';
import type {ModuleDetailDTO} from '@/lib/academy-api';
import {useAuth} from '@/features/auth/auth-provider';
import {useProgress} from '@/features/progress/progress-provider';
import {ModuleDetail} from '@/components/academy/module-detail';
export function LegacyCourseAccess({detail}:{detail:ModuleDetailDTO}){
 const {user,loading}=useAuth(),{state,ready}=useProgress();
 if(loading||!ready)return <p role="status">Verificando acceso al contenido histórico…</p>;
 if(!user)return <><h1>Contenido histórico</h1><p>Inicia sesión para consultar tu formación anterior.</p><Link href="/login">Iniciar sesión</Link></>;
 const historical=detail.module.weeks.some(week=>state.weeks.includes(week)||state.read.includes(week)||state.readingSections[String(week)]?.length||state.notes[String(week)]||Object.keys(state.evidence).some(key=>key===`exercise:${week}`||key.startsWith(`task:${week}:`)))||Object.hasOwn(state.quizzes,detail.module.id)||detail.labs?.some(lab=>state.evidence[`lab:${(lab as {id:string}).id}`]);
 if(user.role!=='ADMIN'&&!historical)return <><h1>Contenido no disponible en el catálogo</h1><p>Este acceso se conserva para cuentas con formación anterior registrada.</p><Link href="/courses">Explorar cursos publicados</Link></>;
 return <><p className="feedback">Contenido histórico · Tus notas, resultados y evidencias se conservan.</p><ModuleDetail {...detail}/></>;
}
