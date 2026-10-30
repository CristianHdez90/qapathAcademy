import {CourseCatalog} from '@/components/courses/course-catalog';
import {loadPublishedAppearance} from '@/features/appearance/load-appearance';
export const metadata={title:'Cursos'};
export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}){const {q}=await searchParams;const appearance=await loadPublishedAppearance();return <CourseCatalog initialSearch={typeof q==='string'?q.slice(0,120):''} appearance={appearance}/>}
