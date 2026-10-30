'use client';
import {useEffect,useState} from 'react';
import {createPortal} from 'react-dom';
import Link from 'next/link';
import type {ContentModuleDTO,CourseInputDTO,LessonDTO,LessonSummaryDTO} from '@qapath/contracts';
import {courseRequest} from '@/features/courses/course-api';
import {LessonEditor,LESSON_STATUS,deleteLesson} from '@/components/study/admin-course-lessons';
import {ModuleForm} from './admin-modules';
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
 // SPEC-CONTENT-331 · Módulos propios: se asignan a cualquier curso (como las lecciones) y se crean/renombran aquí mismo.
 const [modules,setModules]=useState<ContentModuleDTO[]>([]),[moduleForm,setModuleForm]=useState<ContentModuleDTO|null|undefined>(undefined);
 useEffect(()=>{const abort=new AbortController();void courseRequest<ContentModuleDTO[]>('/admin/modules','GET',undefined,abort.signal).then(setModules).catch(()=>{});return()=>abort.abort()},[reload]);
 useEffect(()=>{const abort=new AbortController();void courseRequest<LessonSummaryDTO[]>('/admin/lessons','GET',undefined,abort.signal).then(list=>{setLessons(list);setError('')}).catch(e=>{if(!abort.signal.aborted)setError(e instanceof Error?e.message:'No se pudo cargar la biblioteca.')});return()=>abort.abort()},[reload]);
 useEffect(()=>{if(editing===undefined&&moduleForm===undefined)return;const close=(e:KeyboardEvent)=>{if(e.key==='Escape'){setEditing(undefined);setModuleForm(undefined)}};window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[editing,moduleForm]);
 // En cursos heredados/Scrum/CTFL el módulo es único (radio); las lecciones se suman en cualquier tipo de curso.
 const additive=(ref:Ref)=>ref.kind==='LESSON'||ref.kind==='MODULE';
 const toggle=(ref:Ref,on:boolean)=>onChange(curated||additive(ref)?(on?[...assignments.filter(a=>!same(a,ref)),ref]:assignments.filter(a=>!same(a,ref))):[ref,...assignments.filter(additive)]);
 const move=(index:number,delta:number)=>{const next=[...assignments];const [item]=next.splice(index,1);next.splice(index+delta,0,item);onChange(next)};
 const titleOf=(ref:Ref)=>ref.kind==='LESSON'?lessons.find(l=>l.id===ref.ref)?.title??'Lección':ref.kind==='MODULE'?modules.find(m=>m.id===ref.ref)?.title??'Módulo propio':MODULE_CONTENT.find(([k,r])=>k===ref.kind&&r===ref.ref)?.[2]??ref.ref;
 const lessonOf=(ref:Ref)=>ref.kind==='LESSON'?lessons.find(l=>l.id===ref.ref):undefined;
 const open=async(id:string)=>{setError('');try{setEditing(await courseRequest<LessonDTO>(`/admin/lessons/${id}`))}catch(e){setError(e instanceof Error?e.message:'No se pudo abrir la lección.')}};
 const remove=async(lesson:LessonSummaryDTO)=>{setError('');try{const done=await deleteLesson(lesson);if(done){onChange(assignments.filter(a=>!(a.kind==='LESSON'&&a.ref===lesson.id)));setNotice(`«${lesson.title}» se eliminó (recuperable desde la Biblioteca de contenido).`);setReload(v=>v+1)}}catch(e){setError(e instanceof Error?e.message:'No se pudo eliminar.')}};
 const visible=lessons.filter(l=>!search||l.title.toLowerCase().includes(search.toLowerCase()));
 return <fieldset className="assigned-content"><legend>Contenido asignado</legend>
  <h4>Módulos y experiencias</h4>
  <div className="assigned-modules">{MODULE_CONTENT.filter(([kind])=>curated||kind===contentKind).map(([kind,ref,title])=><label key={ref}><input type={curated?'checkbox':'radio'} name="assigned-content" checked={assignments.some(a=>a.kind===kind&&a.ref===ref)} onChange={e=>toggle({kind,ref},e.target.checked)}/>{title}</label>)}</div>
  <div className="assigned-lessons-head"><h4>Módulos propios <small>· semanas, capítulos y tarjetas editables</small></h4><span className="course-toolbar"><button type="button" className="button button-outline" onClick={()=>setModuleForm(null)}>＋ Crear módulo</button><Link className="button button-outline" href="/admin/modules" target="_blank">Gestionar módulos ↗</Link></span></div>
  {modules.length?<ul className="assigned-lessons">{modules.map(m=><li key={m.id}><label><input type="checkbox" checked={assignments.some(a=>a.kind==='MODULE'&&a.ref===m.id)} onChange={e=>toggle({kind:'MODULE',ref:m.id},e.target.checked)}/><span>{m.title}<small className={`lesson-status is-${m.published?'published':'draft'}`}>{m.published?`Publicado · ${m.weeks} ${m.weeks===1?'semana':'semanas'}`:'Sin publicar'}</small></span></label>
   <span className="course-toolbar"><Link className="button button-outline" href={`/admin/modules/${m.id}/content`} target="_blank">Editar contenido ↗<span className="sr-only"> {m.title} (abre en otra pestaña)</span></Link><button type="button" className="button button-outline" onClick={()=>setModuleForm(m)}>Renombrar <span className="sr-only">{m.title}</span></button></span></li>)}</ul>
   :<p className="hint">Aún no hay módulos propios. Crea uno con «＋ Crear módulo» y agrega su contenido (semanas → capítulos → tarjetas).</p>}
  <>
   <div className="assigned-lessons-head"><h4>Lecciones de la biblioteca</h4><button type="button" className="button button-outline" onClick={()=>setEditing(null)}>＋ Crear lección nueva</button></div>
   {lessons.length>6&&<label className="assigned-search">Buscar lección<input type="search" value={search} maxLength={120} onChange={e=>setSearch(e.target.value)}/></label>}
   {error&&<p role="alert" className="feedback bad">{error}</p>}{notice&&<p role="status" className="feedback good">{notice}</p>}
   {visible.length?<ul className="assigned-lessons">{visible.map(lesson=><li key={lesson.id}><label><input type="checkbox" checked={assignments.some(a=>a.kind==='LESSON'&&a.ref===lesson.id)} onChange={e=>toggle({kind:'LESSON',ref:lesson.id},e.target.checked)}/><span>{lesson.title}<small className={`lesson-status is-${lesson.status.toLowerCase()}`}>{LESSON_STATUS[lesson.status]}</small></span></label>
    <span className="course-toolbar"><button type="button" className="button button-outline" onClick={()=>void open(lesson.id)}>Editar <span className="sr-only">{lesson.title}</span></button><button type="button" className="button button-outline" onClick={()=>void remove(lesson)}>Eliminar <span className="sr-only">{lesson.title}</span></button></span></li>)}</ul>
    :<p className="hint">{lessons.length?'Ninguna lección coincide con la búsqueda.':'La biblioteca aún no tiene lecciones. Crea la primera con «＋ Crear lección nueva».'}</p>}
  </>
  {problem}
  {assignments.length>0&&<div className="course-index-editor"><h4>Índice del curso <small>· orden en que lo verá el estudiante</small></h4><ol>{assignments.map((ref,index)=>{const lesson=lessonOf(ref);return <li key={ref.kind+ref.ref}><span><strong>{titleOf(ref)}</strong><small>{ref.kind==='LESSON'?`Lección${lesson?.status==='DRAFT'?' · borrador: no se verá hasta publicarla':''}`:ref.kind==='MODULE'?`Módulo propio${modules.find(m=>m.id===ref.ref)?.published===false?' · sin publicar: no se verá hasta publicar su contenido':''}`:ref.kind==='LEGACY_MODULE'?'Módulo':'Experiencia'}</small></span>
   <span className="course-toolbar"><button type="button" className="button button-outline" disabled={index===0} aria-label={`Subir ${titleOf(ref)}`} onClick={()=>move(index,-1)}>↑</button><button type="button" className="button button-outline" disabled={index===assignments.length-1} aria-label={`Bajar ${titleOf(ref)}`} onClick={()=>move(index,1)}>↓</button>{(curated||additive(ref))&&<button type="button" className="button button-outline" aria-label={`Quitar ${titleOf(ref)} del curso`} onClick={()=>toggle(ref,false)}>Quitar</button>}</span></li>})}</ol>
   <p className="hint">Los cambios del índice se aplican al pulsar «Guardar cambios» o «Crear borrador».</p></div>}
  {editing!==undefined&&typeof document!=='undefined'&&createPortal(<div className="lesson-modal" role="dialog" aria-modal="true" aria-labelledby="lesson-editor-title"><div className="lesson-modal-card course-editor">
   <LessonEditor key={editing?`${editing.id}:${editing.revision}`:'new'} lesson={editing} heading={editing?undefined:'Nueva lección para este curso'} onClose={()=>setEditing(undefined)} onSaved={(saved,text)=>{
    if(!editing&&!assignments.some(a=>a.kind==='LESSON'&&a.ref===saved.id))onChange([...assignments,{kind:'LESSON',ref:saved.id}]);
    setNotice(editing?text:`${text} Se agregó al índice del curso; guarda el curso para confirmar.`);setEditing(saved);setReload(v=>v+1)}}/>
  </div></div>,document.body)}
 {moduleForm!==undefined&&typeof document!=='undefined'&&createPortal(<div className="lesson-modal" role="dialog" aria-modal="true" aria-labelledby="module-form-title"><div className="lesson-modal-card course-editor">
   <ModuleForm key={moduleForm?`${moduleForm.id}:${moduleForm.revision}`:'new'} module={moduleForm} onClose={()=>setModuleForm(undefined)} onSaved={(saved,text)=>{
    if(!moduleForm&&!assignments.some(a=>a.kind==='MODULE'&&a.ref===saved.id))onChange([...assignments,{kind:'MODULE',ref:saved.id}]);
    setNotice(moduleForm?text:`Módulo «${saved.title}» creado y agregado al índice; guarda el curso para confirmar. Agrega su contenido con «Editar contenido».`);setModuleForm(undefined);setReload(v=>v+1)}}/>
  </div></div>,document.body)}
 </fieldset>;
}
