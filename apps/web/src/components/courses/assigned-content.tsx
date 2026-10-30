'use client';
import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import type {CourseInputDTO,LessonDTO,LessonSummaryDTO} from '@qapath/contracts';
import {courseRequest} from '@/features/courses/course-api';
import {LessonEditor,LESSON_STATUS,deleteLesson} from '@/components/study/admin-course-lessons';
type Ref=CourseInputDTO['assignments'][number];
/** Módulos y experiencias existentes que se pueden asignar a un curso. */
export const MODULE_CONTENT=[['LEGACY_MODULE','fundamentos','Fundamentos'],['LEGACY_MODULE','manual','QA Manual'],['LEGACY_MODULE','herramientas','HTTP, Postman, DevTools y SQL'],['LEGACY_MODULE','typescript','JavaScript, TypeScript y Git'],['LEGACY_MODULE','playwright','Playwright'],['LEGACY_MODULE','arquitectura','Framework y API'],['LEGACY_MODULE','cicd','CI/CD · contenido histórico'],['LEGACY_MODULE','portafolio','Portafolio · contenido histórico'],['SCRUM','equipo-scrum','Equipo y Scrum'],['CTFL','istqb-ctfl','Preparación CTFL']] as const;
const same=(a:Ref,b:Ref)=>a.kind===b.kind&&a.ref===b.ref;
/**
 * SPEC-CONTENT-321 · «Contenido asignado» del curso: módulos existentes + lecciones de la biblioteca.
 * Permite crear, editar y eliminar lecciones sin salir del curso y ordenar el índice que verá el estudiante.
 */
export function AssignedContent({contentKind,assignments,onChange,problem}:{contentKind:CourseInputDTO['contentKind'];assignments:Ref[];onChange:(next:Ref[])=>void;problem?:React.ReactNode}){
 const curated=contentKind==='CURATED';
 const [lessons,setLessons]=useState<LessonSummaryDTO[]>([]),[search,setSearch]=useState(''),[reload,setReload]=useState(0),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const [editing,setEditing]=useState<LessonDTO|null|undefined>(undefined);
 useEffect(()=>{const abort=new AbortController();void courseRequest<LessonSummaryDTO[]>('/admin/lessons','GET',undefined,abort.signal).then(list=>{setLessons(list);setError('')}).catch(e=>{if(!abort.signal.aborted)setError(e instanceof Error?e.message:'No se pudo cargar la biblioteca.')});return()=>abort.abort()},[reload]);
 useEffect(()=>{if(editing===undefined)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape')setEditing(undefined)};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[editing]);
 // En cursos heredados/Scrum/CTFL el módulo es único (radio); las lecciones se suman en cualquier tipo de curso.
 const toggle=(ref:Ref,on:boolean)=>onChange(curated||ref.kind==='LESSON'?(on?[...assignments.filter(a=>!same(a,ref)),ref]:assignments.filter(a=>!same(a,ref))):[ref,...assignments.filter(a=>a.kind==='LESSON')]);
 const move=(index:number,delta:number)=>{const next=[...assignments];const [item]=next.splice(index,1);next.splice(index+delta,0,item);onChange(next)};
 const titleOf=(ref:Ref)=>ref.kind==='LESSON'?lessons.find(l=>l.id===ref.ref)?.title??'Lección':MODULE_CONTENT.find(([k,r])=>k===ref.kind&&r===ref.ref)?.[2]??ref.ref;
 const lessonOf=(ref:Ref)=>ref.kind==='LESSON'?lessons.find(l=>l.id===ref.ref):undefined;
 const open=async(id:string)=>{setError('');try{setEditing(await courseRequest<LessonDTO>(`/admin/lessons/${id}`))}catch(e){setError(e instanceof Error?e.message:'No se pudo abrir la lección.')}};
 const remove=async(lesson:LessonSummaryDTO)=>{setError('');try{const done=await deleteLesson(lesson);if(done){onChange(assignments.filter(a=>!(a.kind==='LESSON'&&a.ref===lesson.id)));setNotice(`«${lesson.title}» se eliminó (recuperable desde la Biblioteca de contenido).`);setReload(v=>v+1)}}catch(e){setError(e instanceof Error?e.message:'No se pudo eliminar.')}};
 const visible=lessons.filter(l=>!search||l.title.toLowerCase().includes(search.toLowerCase()));
 return <fieldset className="assigned-content"><legend>Contenido asignado</legend>
  <h4>Módulos y experiencias</h4>
  <div className="assigned-modules">{MODULE_CONTENT.filter(([kind])=>curated||kind===contentKind).map(([kind,ref,title])=><label key={ref}><input type={curated?'checkbox':'radio'} name="assigned-content" checked={assignments.some(a=>a.kind===kind&&a.ref===ref)} onChange={e=>toggle({kind,ref},e.target.checked)}/>{title}</label>)}</div>
  <>
   <div className="assigned-lessons-head"><h4>Lecciones de la biblioteca</h4><button type="button" className="button button-outline" onClick={()=>setEditing(null)}>＋ Crear lección nueva</button></div>
   {lessons.length>6&&<label className="assigned-search">Buscar lección<input type="search" value={search} maxLength={120} onChange={e=>setSearch(e.target.value)}/></label>}
   {error&&<p role="alert" className="feedback bad">{error}</p>}{notice&&<p role="status" className="feedback good">{notice}</p>}
   {visible.length?<ul className="assigned-lessons">{visible.map(lesson=><li key={lesson.id}><label><input type="checkbox" checked={assignments.some(a=>a.kind==='LESSON'&&a.ref===lesson.id)} onChange={e=>toggle({kind:'LESSON',ref:lesson.id},e.target.checked)}/><span>{lesson.title}<small className={`lesson-status is-${lesson.status.toLowerCase()}`}>{LESSON_STATUS[lesson.status]}</small></span></label>
    <span className="course-toolbar"><button type="button" className="button button-outline" onClick={()=>void open(lesson.id)}>Editar <span className="sr-only">{lesson.title}</span></button><button type="button" className="button button-outline" onClick={()=>void remove(lesson)}>Eliminar <span className="sr-only">{lesson.title}</span></button></span></li>)}</ul>
    :<p className="hint">{lessons.length?'Ninguna lección coincide con la búsqueda.':'La biblioteca aún no tiene lecciones. Crea la primera con «＋ Crear lección nueva».'}</p>}
  </>
  {problem}
  {assignments.length>0&&<div className="course-index-editor"><h4>Índice del curso <small>· orden en que lo verá el estudiante</small></h4><ol>{assignments.map((ref,index)=>{const lesson=lessonOf(ref);return <li key={ref.kind+ref.ref}><span><strong>{titleOf(ref)}</strong><small>{ref.kind==='LESSON'?`Lección${lesson?.status==='DRAFT'?' · borrador: no se verá hasta publicarla':''}`:ref.kind==='LEGACY_MODULE'?'Módulo':'Experiencia'}</small></span>
   <span className="course-toolbar"><button type="button" className="button button-outline" disabled={index===0} aria-label={`Subir ${titleOf(ref)}`} onClick={()=>move(index,-1)}>↑</button><button type="button" className="button button-outline" disabled={index===assignments.length-1} aria-label={`Bajar ${titleOf(ref)}`} onClick={()=>move(index,1)}>↓</button>{(curated||ref.kind==='LESSON')&&<button type="button" className="button button-outline" aria-label={`Quitar ${titleOf(ref)} del curso`} onClick={()=>toggle(ref,false)}>Quitar</button>}</span></li>})}</ol>
   <p className="hint">Los cambios del índice se aplican al pulsar «Guardar cambios» o «Crear borrador».</p></div>}
  {editing!==undefined&&typeof document!=='undefined'&&createPortal(<div className="lesson-modal" role="dialog" aria-modal="true" aria-labelledby="lesson-editor-title"><div className="lesson-modal-card course-editor">
   <LessonEditor key={editing?`${editing.id}:${editing.revision}`:'new'} lesson={editing} heading={editing?undefined:'Nueva lección para este curso'} onClose={()=>setEditing(undefined)} onSaved={(saved,text)=>{
    if(!editing&&!assignments.some(a=>a.kind==='LESSON'&&a.ref===saved.id))onChange([...assignments,{kind:'LESSON',ref:saved.id}]);
    setNotice(editing?text:`${text} Se agregó al índice del curso; guarda el curso para confirmar.`);setEditing(saved);setReload(v=>v+1)}}/>
  </div></div>,document.body)}
 </fieldset>;
}
