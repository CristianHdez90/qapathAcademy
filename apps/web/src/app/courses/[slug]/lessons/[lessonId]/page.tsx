export const dynamic='force-dynamic';
import {notFound} from 'next/navigation';
import {academyApi,ApiError} from '@/lib/academy-api';
import {LessonView} from '@/components/study/course-lessons';
export default async function CourseLessonPage({params}:{params:Promise<{slug:string;lessonId:string}>}){
 const {slug,lessonId}=await params;
 if(!/^[a-z0-9-]{3,100}$/.test(slug)||!/^[0-9a-f-]{36}$/i.test(lessonId))notFound();
 let data;
 try{data=await Promise.all([academyApi.course(slug),academyApi.courseLesson(slug,lessonId),academyApi.courseLessons(slug)])}
 catch(error){if(error instanceof ApiError&&(error.status===404||error.status===400))notFound();throw error}
 const [course,lesson,lessons]=data;
 return <LessonView courseSlug={slug} courseTitle={course.title} lesson={lesson} lessons={lessons}/>;
}
