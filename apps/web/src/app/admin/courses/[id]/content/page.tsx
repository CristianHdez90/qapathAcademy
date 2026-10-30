import {notFound} from 'next/navigation';
import {OutlineEditorPage} from '@/components/outline/outline-editor';
export const metadata={title:'Contenido del curso',robots:{index:false,follow:false}};
export default async function CourseContentPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))notFound();
 return <OutlineEditorPage courseId={id}/>;
}
