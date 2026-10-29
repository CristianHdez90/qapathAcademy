// La API se consulta por request, no durante next build ni al generar páginas estáticas.
export const dynamic='force-dynamic';
import {notFound,redirect} from 'next/navigation';
import {academyApi,ApiError} from '@/lib/academy-api';
export default async function ModulePage({params}:{params:Promise<{moduleId:string}>}){
 const {moduleId}=await params;
 if(['cicd','portafolio'].includes(moduleId))redirect(`/legacy/modules/${moduleId}`);
 if(!['fundamentos','manual','herramientas','typescript','playwright','arquitectura'].includes(moduleId))notFound();
 try{await academyApi.course(moduleId)}catch(error){if(error instanceof ApiError&&error.status===404)redirect(`/legacy/modules/${moduleId}`);throw error}
 redirect(`/courses/${moduleId}`);
}
