// La API se consulta por request, no durante next build ni al generar páginas estáticas.
export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import {academyApi,ApiError} from '@/lib/academy-api';
import {ModuleDetail} from '@/components/academy/module-detail';
export default async function ModulePage({params}:{params:Promise<{moduleId:string}>}){
 const {moduleId}=await params;
 let detail;
 try {detail=await academyApi.module(moduleId);}
 catch(e){if(e instanceof ApiError&&e.status===404)notFound();throw e;}
 return <ModuleDetail {...detail}/>;
}
