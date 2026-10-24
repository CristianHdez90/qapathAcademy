// La API se consulta por request, no durante next build ni al generar páginas estáticas.
export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import {academyApi,ApiError} from '@/lib/academy-api';
import {LessonStudy} from '@/components/academy/lesson-study';
export default async function StudyPage({params}:{params:Promise<{week:string}>}){
 const {week}=await params;if(!/^\d{1,5}$/.test(week))notFound();
 let lesson;
 try {lesson=await academyApi.lesson(Number(week));}
 catch(e){if(e instanceof ApiError&&(e.status===404||e.status===422))notFound();throw e;}
 return <LessonStudy week={lesson.week} guide={lesson.guide}/>;
}
