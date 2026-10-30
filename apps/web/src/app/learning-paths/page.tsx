import {LearningPathBuilder} from '@/components/courses/learning-path-builder';
export const metadata={title:'Mis rutas'};
export default async function LearningPathsPage({searchParams}:{searchParams:Promise<{add?:string}>}){const {add}=await searchParams;return <LearningPathBuilder add={typeof add==='string'&&/^[a-f0-9-]{36}$/i.test(add)?add:undefined}/>}
