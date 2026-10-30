export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import {academyApi,ApiError,type ModuleDetailDTO} from '@/lib/academy-api';
import type {CourseDTO,LessonSummaryDTO,PublicCourseOutlineDTO} from '@qapath/contracts';
import {CourseDetail} from '@/components/courses/course-detail';
export default async function CoursePage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 if(!/^[a-z0-9-]{3,100}$/.test(slug))notFound();
 let course:CourseDTO;let modules:ModuleDetailDTO[];let lessons:LessonSummaryDTO[]=[];let outline:PublicCourseOutlineDTO|null=null;
 try{course=await academyApi.course(slug);modules=await Promise.all(course.assignments.filter(ref=>ref.kind==='LEGACY_MODULE').map(ref=>academyApi.module(ref.ref)));
  // Contenido de estudio por archivos (SPEC-CONTENT-320). Si la API aún no tiene la migración 012, el curso se muestra igual.
  lessons=course.comingSoon?[]:await academyApi.courseLessons(slug).catch(()=>[]);
  // Contenido editable en modo enfocado (SPEC-CONTENT-330). Sin la migración 014 o sin publicar, se mantiene el índice actual.
  outline=course.comingSoon?null:await academyApi.courseOutline(slug).catch(()=>null)}
 catch(error){if(error instanceof ApiError&&error.status===404)notFound();throw error}
 return <CourseDetail course={course} modules={modules} lessons={lessons} outline={outline}/>;
}
