export const dynamic='force-dynamic';
export const metadata={title:'Contenido histórico',robots:{index:false,follow:false}};
import {notFound} from 'next/navigation';
import {academyApi,ApiError,type ModuleDetailDTO} from '@/lib/academy-api';
import {LegacyCourseAccess} from '@/components/courses/legacy-course-access';
export default async function LegacyModulePage({params}:{params:Promise<{moduleId:string}>}){
 const {moduleId}=await params;if(!['fundamentos','manual','herramientas','typescript','playwright','arquitectura','cicd','portafolio'].includes(moduleId))notFound();
 let detail:ModuleDetailDTO;
 try{detail=await academyApi.module(moduleId)}catch(error){if(error instanceof ApiError&&error.status===404)notFound();throw error}
 return <LegacyCourseAccess detail={detail}/>;
}
