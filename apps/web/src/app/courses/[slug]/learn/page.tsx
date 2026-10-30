export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import {academyApi,ApiError} from '@/lib/academy-api';
import {CourseReader} from '@/components/outline/course-reader';
/** SPEC-CONTENT-330 · Lectura enfocada del contenido publicado de un curso. */
export default async function CourseLearnPage({params,searchParams}:{params:Promise<{slug:string}>;searchParams:Promise<Record<string,string|string[]|undefined>>}){
 const {slug}=await params,query=await searchParams;
 if(!/^[a-z0-9-]{3,100}$/.test(slug))notFound();
 let outline;
 try{outline=await academyApi.courseOutline(slug)}catch(error){if(error instanceof ApiError&&(error.status===404||error.status===400))notFound();throw error}
 const id=(value:unknown)=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,80}$/.test(value)?value:undefined;
 // ?chapter= abre el capítulo; ?card= abre la tarjeta exacta (enlaces del índice de la semana).
 return <CourseReader outline={outline} initialChapter={id(query.chapter)} initialCard={id(query.card)}/>;
}
