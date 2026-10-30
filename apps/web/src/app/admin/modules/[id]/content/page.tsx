import {notFound} from 'next/navigation';
import {OutlineEditorPage} from '@/components/outline/outline-editor';
export const metadata={title:'Contenido del módulo',robots:{index:false,follow:false}};
/** SPEC-CONTENT-331 · Editor del contenido de un módulo propio (mismo editor que el contenido del curso). */
export default async function ModuleContentPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params;if(!/^[0-9a-f-]{36}$/i.test(id))notFound();
 return <OutlineEditorPage courseId={id} kind="module"/>;
}
