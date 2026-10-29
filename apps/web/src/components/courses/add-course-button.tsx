'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import type {CourseDTO,LearningPathDTO} from '@qapath/contracts';
import {useAuth} from '@/features/auth/auth-provider';
import {courseRequest} from '@/features/courses/course-api';

const MAX=24;
/** «Añadir curso» en el índice del curso: lo agrega al final de tu ruta activa (o crea «Mi ruta de aprendizaje»). No cambia tu progreso. */
export function AddCourseButton({course}:{course:CourseDTO}){
 const {user,loading}=useAuth();
 const [paths,setPaths]=useState<LearningPathDTO[]|null>(null),[busy,setBusy]=useState(false),[message,setMessage]=useState(''),[error,setError]=useState('');
 const student=user?.role==='STUDENT';
 useEffect(()=>{if(!student)return;const abort=new AbortController();void courseRequest<LearningPathDTO[]>('/me/learning-paths','GET',undefined,abort.signal).then(setPaths).catch(e=>{if(!abort.signal.aborted)setError(e instanceof Error?e.message:'No se pudieron cargar tus rutas.')});return()=>abort.abort()},[student,user?.id]);
 if(loading)return null;
 if(!user)return <Link className="button button-primary" href={`/login?next=${encodeURIComponent(`/learning-paths?add=${course.id}`)}`}>＋ Añadir curso</Link>;
 if(!student)return null;
 const active=paths?.find(path=>path.active);
 const inside=!!active?.courses.some(item=>item.id===course.id);
 async function add(){
  setBusy(true);setError('');setMessage('');
  try{
   const saved=active
    ?await courseRequest<LearningPathDTO>(`/me/learning-paths/${active.id}`,'PATCH',{title:active.title,courseIds:[...active.courses.map(item=>item.id),course.id],active:true,revision:active.revision})
    :await courseRequest<LearningPathDTO>('/me/learning-paths','POST',{title:'Mi ruta de aprendizaje',courseIds:[course.id],active:true});
   setPaths(list=>[...(list??[]).filter(path=>path.id!==saved.id).map(path=>({...path,active:false})),saved]);
   setMessage(`Añadido a tu ruta «${saved.title}».`);
  }catch(e){setError(e instanceof Error?e.message:'No se pudo añadir el curso.')}
  finally{setBusy(false)}
 }
 return <div className="add-course">
  {inside?<span className="course-status add-course-done" role="status">✓ En tu ruta «{active!.title}»</span>
   :<button type="button" className="button button-primary" disabled={busy||paths===null||(active?.courses.length??0)>=MAX} onClick={()=>void add()}>{busy?'Añadiendo…':'＋ Añadir curso'}</button>}
  <Link className="button button-outline" href="/learning-paths">Ver mis rutas</Link>
  {message&&!inside&&<p role="status" className="feedback good">{message}</p>}
  {(active?.courses.length??0)>=MAX&&!inside&&<p className="hint">Tu ruta activa ya tiene {MAX} cursos. Retira alguno en «Mis rutas».</p>}
  {error&&<p role="alert" className="feedback bad">{error}</p>}
 </div>;
}
