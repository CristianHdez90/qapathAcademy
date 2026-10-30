'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import {suggestLessonTitle,MAX_FILES_PER_LESSON,type LessonDTO,type LessonSummaryDTO} from '@qapath/contracts';
import {courseRequest} from '@/features/courses/course-api';
import {useAuth} from '@/features/auth/auth-provider';
import {LessonBody} from './lesson-body';
import {StudyFilesField,type StudyItem} from './study-files-field';
import {KIND_LABEL} from './course-lessons';
import {STUDY_TEMPLATES} from './study-templates';
import './study.css';
import './admin-course-lessons.css';
export const LESSON_STATUS={DRAFT:'Borrador',PUBLISHED:'Publicada'} as const;
const BASE='/admin/lessons';
const usedIn=(lesson:LessonSummaryDTO)=>lesson.courses.length?`En ${lesson.courses.length} ${lesson.courses.length===1?'curso':'cursos'}: ${lesson.courses.map(c=>c.title).join(', ')}`:'Sin asignar a cursos';
/** Confirmación de borrado recuperable: avisa de qué cursos se quitará. */
export async function deleteLesson(lesson:LessonSummaryDTO){
 if(!window.confirm(`¿Eliminar «${lesson.title}»?\n\n${lesson.courses.length?`Se quitará de: ${lesson.courses.map(c=>c.title).join(', ')}.\n`:''}Podrás restaurarla desde «Eliminadas» (volverá como borrador y sin asignar).`))return null;
 return courseRequest<LessonDTO>(`${BASE}/${lesson.id}`,'DELETE',{revision:lesson.revision});
}
/** SPEC-CONTENT-321 · Biblioteca de contenido: crear, editar, publicar, eliminar (recuperable) y restaurar lecciones. */
export function ContentLibrary(){
 const {user,loading}=useAuth();
 if(loading)return <p role="status">Verificando permisos…</p>;
 if(!user)return <><h1>Biblioteca de contenido</h1><Link href="/login">Inicia sesión con una cuenta ADMIN</Link></>;
 if(user.role!=='ADMIN')return <p role="alert">No tienes permisos para administrar el contenido.</p>;
 return <LibraryWorkspace/>;
}
function LibraryWorkspace(){
 const [tab,setTab]=useState<'active'|'deleted'>('active'),[search,setSearch]=useState(''),[lessons,setLessons]=useState<LessonSummaryDTO[]|null>(null);
 const [editing,setEditing]=useState<LessonDTO|null|undefined>(undefined),[error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[reload,setReload]=useState(0);
 useEffect(()=>{const abort=new AbortController();const timer=setTimeout(()=>{void courseRequest<LessonSummaryDTO[]>(`${BASE}?search=${encodeURIComponent(search)}&deleted=${tab==='deleted'}`,'GET',undefined,abort.signal).then(list=>{setLessons(list);setError('')}).catch(e=>{if(!abort.signal.aborted)setError(e instanceof Error?e.message:'No se pudo cargar la biblioteca.')})},200);return()=>{clearTimeout(timer);abort.abort()}},[search,tab,reload]);
 const run=async(work:()=>Promise<unknown>,done:string)=>{setBusy(true);setError('');setMessage('');try{const result=await work();if(result!==null){setMessage(done);setReload(v=>v+1)}}catch(e){setError(e instanceof Error?e.message:'No se pudo completar la acción.')}finally{setBusy(false)}};
 return <section className="course-editor lesson-library" aria-labelledby="library-title">
  <Link href="/admin">← Administración</Link>
  <p className="eyebrow">CONTENIDO DE ESTUDIO</p><h1 id="library-title">Biblioteca de contenido</h1>
  <p>Crea lecciones con archivos <strong>.md</strong> (texto a la izquierda) y <strong>.mmd</strong>, <strong>.json</strong> o <strong>.svg</strong> (gráficas a la derecha). Después asígnalas a uno o varios cursos desde <Link className="text-link" href="/admin/courses">Gestionar cursos</Link> → «Contenido asignado».</p>
  <details className="lesson-templates"><summary>Plantillas de ejemplo</summary><p>Descarga una plantilla, edítala y cárgala en una lección.</p><div className="course-toolbar">{STUDY_TEMPLATES.map(t=><a key={t.filename} className="button button-outline" download={t.filename} href={`data:text/plain;charset=utf-8,${encodeURIComponent(t.content)}`}>{t.label} <small>· {t.filename}</small></a>)}</div></details>
  <div className="course-toolbar"><button type="button" className="button button-primary" disabled={busy} onClick={()=>{setEditing(null);setMessage('')}}>＋ Nueva lección</button></div>
  <div className="lesson-library-filters"><div role="tablist" aria-label="Estado"><button type="button" role="tab" aria-selected={tab==='active'} onClick={()=>{setTab('active');setLessons(null)}}>Activas</button><button type="button" role="tab" aria-selected={tab==='deleted'} onClick={()=>{setTab('deleted');setLessons(null)}}>Eliminadas</button></div><label>Buscar lecciones<input type="search" maxLength={120} value={search} onChange={e=>setSearch(e.target.value)}/></label></div>
  {error&&<p role="alert" className="feedback bad">{error}</p>}{message&&<p role="status" className="feedback good">{message}</p>}
  {!lessons&&!error&&<p className="hint" aria-busy="true">Cargando lecciones…</p>}
  {lessons&&(lessons.length?<ul className="lesson-admin-list">{lessons.map(lesson=><li key={lesson.id}><div><strong>{lesson.title}</strong><small>{tab==='deleted'?'Eliminada':LESSON_STATUS[lesson.status]} · {lesson.fileCount} {lesson.fileCount===1?'archivo':'archivos'} · {tab==='deleted'?'Al restaurarla vuelve como borrador sin asignar':usedIn(lesson)}</small><span className="study-kinds">{lesson.kinds.map(k=><span key={k} className="study-kind">{KIND_LABEL[k]}</span>)}</span></div>
   <div className="course-toolbar">{tab==='active'?<><button type="button" className="button button-outline" disabled={busy} onClick={()=>void run(async()=>{setEditing(await courseRequest<LessonDTO>(`${BASE}/${lesson.id}`));return null},'')}>Editar <span className="sr-only">{lesson.title}</span></button><button type="button" className="button button-outline" disabled={busy} onClick={()=>void run(async()=>{const r=await deleteLesson(lesson);if(r&&editing?.id===lesson.id)setEditing(undefined);return r},'Lección eliminada. Puedes restaurarla desde «Eliminadas».')}>Eliminar <span className="sr-only">{lesson.title}</span></button></>
    :<button type="button" className="button button-outline" disabled={busy} onClick={()=>void run(()=>courseRequest(`${BASE}/${lesson.id}/restore`,'POST',{revision:lesson.revision}),'Lección restaurada como borrador.')}>Restaurar <span className="sr-only">{lesson.title}</span></button>}</div></li>)}</ul>
   :<p className="course-empty">{tab==='deleted'?'No hay lecciones eliminadas.':search?'No hay lecciones con esa búsqueda.':'Aún no hay lecciones. Crea la primera con «＋ Nueva lección».'}</p>)}
  {editing!==undefined&&<LessonEditor key={editing?`${editing.id}:${editing.revision}`:'new'} lesson={editing} onClose={()=>setEditing(undefined)} onSaved={(saved,text)=>{setEditing(saved);setMessage(text);setReload(v=>v+1)}}/>}
 </section>;
}
/** Editor de una lección (crear o editar). Reutilizado en la biblioteca y en «Contenido asignado» del curso. */
export function LessonEditor({lesson,onSaved,onClose,heading}:{lesson:LessonDTO|null;onSaved:(lesson:LessonDTO,message:string)=>void;onClose:()=>void;heading?:string}){
 const [title,setTitle]=useState(lesson?.title??''),[summary,setSummary]=useState(lesson?.summary??''),[status,setStatus]=useState<'DRAFT'|'PUBLISHED'>(lesson?.status??'DRAFT');
 const [items,setItems]=useState<StudyItem[]>(lesson?.files.map(f=>({key:f.id,id:f.id,filename:f.filename,kind:f.kind,content:f.content}))??[]);
 const [preview,setPreview]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const added=(read:StudyItem[])=>setTitle(old=>old||(()=>{const first=read.find(i=>i.kind==='markdown')??read.find(i=>!i.error);return first?suggestLessonTitle(first.filename,first.content):''})());
 const valid=items.filter(i=>!i.error),invalid=items.length-valid.length;
 const save=async(event:React.FormEvent)=>{
  // Se abre dentro del editor de curso (portal): el submit no debe propagarse al formulario del curso.
  event.preventDefault();event.stopPropagation();if(invalid){setError('Retira los archivos con errores antes de guardar.');return}
  if(title.trim().length<3){setError('Escribe un título de al menos 3 caracteres.');return}
  if(status==='PUBLISHED'&&!valid.length){setError('Para publicar, carga al menos un archivo.');return}
  setBusy(true);setError('');
  try{
   const files=valid.map(i=>i.id?{id:i.id}:{filename:i.filename,content:i.content});
   const saved=lesson?await courseRequest<LessonDTO>(`${BASE}/${lesson.id}`,'PATCH',{revision:lesson.revision,title,summary,status,files}):await courseRequest<LessonDTO>(BASE,'POST',{title,summary,status,files});
   onSaved(saved,lesson?(status==='PUBLISHED'?'Lección guardada y publicada.':'Lección guardada como borrador.'):status==='PUBLISHED'?'Lección creada y publicada.':'Lección creada como borrador.');
  }catch(e){setError(e instanceof Error?e.message:'No se pudo guardar la lección.')}finally{setBusy(false)}
 };
 // Para corregir un archivo existente: retíralo y carga la versión corregida (el anterior queda retirado, no borrado).
 return <form noValidate className="lesson-editor" onSubmit={event=>void save(event)} aria-labelledby="lesson-editor-title">
  <h3 id="lesson-editor-title">{heading??(lesson?`Editar lección · ${lesson.title}`:'Nueva lección')}</h3>
  {lesson&&lesson.courses.length>0&&<p className="hint">Asignada a: {lesson.courses.map(c=>c.title).join(', ')}. Los cambios se ven en todos esos cursos.</p>}
  <fieldset disabled={busy}><legend>Datos de la lección</legend>
   <label>Título<input required minLength={3} maxLength={160} value={title} onChange={e=>setTitle(e.target.value)}/></label>
   <label>Resumen (opcional)<textarea maxLength={400} value={summary} onChange={e=>setSummary(e.target.value)}/></label>
   <label>Visibilidad<select value={status} onChange={e=>setStatus(e.target.value as typeof status)}><option value="DRAFT">Borrador · solo administradores</option><option value="PUBLISHED">Publicada · visible en los cursos donde esté asignada</option></select></label>
  </fieldset>
  <fieldset disabled={busy}><legend>Archivos ({items.length}/{MAX_FILES_PER_LESSON})</legend>
   <StudyFilesField items={items} onChange={setItems} onAdded={added}/>
  </fieldset>
  {error&&<p role="alert" className="feedback bad">{error}</p>}
  <div className="course-toolbar"><button type="submit" className="button button-primary">{busy?'Guardando…':lesson?'Guardar lección':'Crear lección'}</button><button type="button" className="button button-outline" aria-expanded={preview} onClick={()=>setPreview(v=>!v)}>{preview?'Ocultar vista previa':'Vista previa'}</button><button type="button" className="button button-outline" onClick={onClose}>Cerrar</button></div>
  {preview&&<div className="lesson-preview" aria-label="Vista previa de la lección"><p className="eyebrow">VISTA PREVIA · ASÍ LO VERÁ EL ESTUDIANTE</p><h1>{title||'Lección sin título'}</h1>{summary&&<p className="page-description">{summary}</p>}<LessonBody files={valid.map(item=>({kind:item.kind!,filename:item.filename,content:item.content}))} title={title}/>{!valid.length&&<p className="hint">Carga archivos para ver la vista previa.</p>}</div>}
 </form>;
}
