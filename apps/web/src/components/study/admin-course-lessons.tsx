'use client';
import {useEffect,useState} from 'react';
import {suggestLessonTitle,MAX_FILES_PER_LESSON,type CourseDTO,type LessonDTO,type LessonSummaryDTO} from '@qapath/contracts';
import {courseRequest} from '@/features/courses/course-api';
import {LessonBody} from './lesson-body';
import {StudyFilesField,type StudyItem} from './study-files-field';
import {KIND_LABEL} from './course-lessons';
import {STUDY_TEMPLATES} from './study-templates';
import './study.css';
import './admin-course-lessons.css';
const STATUS={DRAFT:'Borrador',PUBLISHED:'Publicada',ARCHIVED:'Archivada'} as const;
/** SPEC-CONTENT-320 · «Contenido de estudio» del curso: carga de .md, .mmd, .json y .svg con vista previa. */
export function AdminCourseLessons({course}:{course:CourseDTO}){
 const [lessons,setLessons]=useState<LessonSummaryDTO[]|null>(null),[editing,setEditing]=useState<LessonDTO|null|undefined>(undefined);
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[reload,setReload]=useState(0);
 const base=`/admin/courses/${course.id}/lessons`;
 useEffect(()=>{const abort=new AbortController();void courseRequest<LessonSummaryDTO[]>(base,'GET',undefined,abort.signal).then(list=>{setLessons(list);setError('')}).catch(e=>{if(!abort.signal.aborted)setError(e instanceof Error?e.message:'No se pudo cargar el contenido.')});return()=>abort.abort()},[base,reload]);
 const run=async(work:()=>Promise<void>,done:string)=>{setBusy(true);setError('');setMessage('');try{await work();setMessage(done);setReload(v=>v+1)}catch(e){setError(e instanceof Error?e.message:'No se pudo completar la acción.')}finally{setBusy(false)}};
 const open=(lesson:LessonSummaryDTO)=>void run(async()=>setEditing(await courseRequest<LessonDTO>(`${base}/${lesson.id}`)),'');
 const move=(index:number,delta:number)=>{if(!lessons)return;const active=lessons.filter(l=>l.status!=='ARCHIVED'),next=[...active];const [item]=next.splice(index,1);next.splice(index+delta,0,item);void run(async()=>{setLessons(await courseRequest<LessonSummaryDTO[]>(`${base}/order`,'PUT',{order:next.map(l=>({id:l.id,revision:l.revision}))}))},'Orden actualizado.')};
 const archive=(lesson:LessonSummaryDTO)=>{const restore=lesson.status==='ARCHIVED';if(!window.confirm(restore?`¿Restaurar «${lesson.title}» como borrador?`:`¿Archivar «${lesson.title}»? Dejará de mostrarse a los estudiantes; podrás restaurarla.`))return;void run(async()=>{await courseRequest(`${base}/${lesson.id}${restore?'/restore':''}`,restore?'POST':'DELETE',{revision:lesson.revision});if(editing?.id===lesson.id)setEditing(undefined)},restore?'Lección restaurada como borrador.':'Lección archivada.')};
 if(course.status==='ARCHIVED')return null;
 const active=lessons?.filter(l=>l.status!=='ARCHIVED')??[],archived=lessons?.filter(l=>l.status==='ARCHIVED')??[];
 return <section className="course-content-group lesson-admin" aria-labelledby="lesson-admin-title">
  <p className="eyebrow">CONTENIDO DE ESTUDIO</p><h2 id="lesson-admin-title">Lecciones de «{course.title}»</h2>
  <p>Carga el material del curso como archivos: <strong>.md</strong> para la lectura (con bloques <code>```mermaid</code>), <strong>.mmd</strong> para diagramas, <strong>.json</strong> para interacciones (mapas con globos o gráficas) y <strong>.svg</strong> para imágenes. Los <strong>.drawio</strong> y <strong>.puml</strong> deben exportarse antes a SVG.</p>
  <details className="lesson-templates"><summary>Plantillas de ejemplo</summary><p>Descarga una plantilla, edítala y cárgala en una lección.</p><div className="course-toolbar">{STUDY_TEMPLATES.map(t=><a key={t.filename} className="button button-outline" download={t.filename} href={`data:text/plain;charset=utf-8,${encodeURIComponent(t.content)}`}>{t.label} <small>· {t.filename}</small></a>)}</div></details>
  {error&&<p role="alert" className="feedback bad">{error}</p>}{message&&<p role="status" className="feedback good">{message}</p>}
  {!lessons&&!error&&<p className="hint" aria-busy="true">Cargando lecciones…</p>}
  {lessons&&<>
   {active.length?<ol className="lesson-admin-list">{active.map((lesson,index)=><li key={lesson.id}><div><strong>{lesson.title}</strong><small>{STATUS[lesson.status]} · {lesson.fileCount} {lesson.fileCount===1?'archivo':'archivos'}</small><span className="study-kinds">{lesson.kinds.map(k=><span key={k} className="study-kind">{KIND_LABEL[k]}</span>)}</span></div><div className="course-toolbar"><button type="button" className="button button-outline" disabled={busy} onClick={()=>open(lesson)}>Editar <span className="sr-only">{lesson.title}</span></button><button type="button" className="button button-outline" disabled={busy||index===0} aria-label={`Subir ${lesson.title}`} onClick={()=>move(index,-1)}>↑</button><button type="button" className="button button-outline" disabled={busy||index===active.length-1} aria-label={`Bajar ${lesson.title}`} onClick={()=>move(index,1)}>↓</button><button type="button" className="button button-outline" disabled={busy} onClick={()=>archive(lesson)}>Archivar</button></div></li>)}</ol>:<p className="course-empty">Este curso aún no tiene lecciones cargadas.</p>}
   {archived.length>0&&<details><summary>Archivadas ({archived.length})</summary><ul className="lesson-admin-list">{archived.map(lesson=><li key={lesson.id}><div><strong>{lesson.title}</strong><small>Archivada</small></div><button type="button" className="button button-outline" disabled={busy} onClick={()=>archive(lesson)}>Restaurar</button></li>)}</ul></details>}
   <div className="course-toolbar"><button type="button" className="button button-primary" disabled={busy} onClick={()=>{setEditing(null);setMessage('')}}>＋ Nueva lección</button></div>
  </>}
  {editing!==undefined&&<LessonEditor key={editing?`${editing.id}:${editing.revision}`:'new'} base={base} lesson={editing} onClose={()=>setEditing(undefined)} onSaved={(saved,text)=>{setEditing(saved);setMessage(text);setReload(v=>v+1)}}/>}
 </section>;
}
function LessonEditor({base,lesson,onSaved,onClose}:{base:string;lesson:LessonDTO|null;onSaved:(lesson:LessonDTO,message:string)=>void;onClose:()=>void}){
 const [title,setTitle]=useState(lesson?.title??''),[summary,setSummary]=useState(lesson?.summary??''),[status,setStatus]=useState<'DRAFT'|'PUBLISHED'>(lesson?.status==='PUBLISHED'?'PUBLISHED':'DRAFT');
 const [items,setItems]=useState<StudyItem[]>(lesson?.files.map(f=>({key:f.id,id:f.id,filename:f.filename,kind:f.kind,content:f.content}))??[]);
 const [preview,setPreview]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const added=(read:StudyItem[])=>setTitle(old=>old||(()=>{const first=read.find(i=>i.kind==='markdown')??read.find(i=>!i.error);return first?suggestLessonTitle(first.filename,first.content):''})());
 const valid=items.filter(i=>!i.error),invalid=items.length-valid.length;
 const save=async(event:React.FormEvent)=>{
  event.preventDefault();if(invalid){setError('Retira los archivos con errores antes de guardar.');return}
  setBusy(true);setError('');
  try{
   const files=valid.map(i=>i.id?{id:i.id}:{filename:i.filename,content:i.content});
   const saved=lesson
    ?await courseRequest<LessonDTO>(`${base}/${lesson.id}`,'PATCH',{revision:lesson.revision,title,summary,status,files})
    :await courseRequest<LessonDTO>(base,'POST',{title,summary,files});
   onSaved(saved,lesson?(status==='PUBLISHED'?'Lección guardada y publicada.':'Lección guardada como borrador.'):'Lección creada como borrador. Revísala y publícala cuando esté lista.');
  }catch(e){setError(e instanceof Error?e.message:'No se pudo guardar la lección.')}finally{setBusy(false)}
 };
 // Para corregir un archivo existente: retíralo y carga la versión corregida (el anterior queda retirado, no borrado).
 return <form className="lesson-editor" onSubmit={event=>void save(event)} aria-labelledby="lesson-editor-title">
  <h3 id="lesson-editor-title">{lesson?`Editar lección · ${lesson.title}`:'Nueva lección'}</h3>
  <fieldset disabled={busy}><legend>Datos de la lección</legend>
   <label>Título<input required minLength={3} maxLength={160} value={title} onChange={e=>setTitle(e.target.value)}/></label>
   <label>Resumen (opcional)<textarea maxLength={400} value={summary} onChange={e=>setSummary(e.target.value)}/></label>
   {lesson?<label>Visibilidad<select value={status} onChange={e=>setStatus(e.target.value as typeof status)}><option value="DRAFT">Borrador · solo administradores</option><option value="PUBLISHED">Publicada · visible para estudiantes</option></select></label>:<p className="hint">Se crea como borrador; podrás publicarla después de revisar la vista previa.</p>}
  </fieldset>
  <fieldset disabled={busy}><legend>Archivos ({items.length}/{MAX_FILES_PER_LESSON})</legend>
   <StudyFilesField items={items} onChange={setItems} onAdded={added}/>
  </fieldset>
  {error&&<p role="alert" className="feedback bad">{error}</p>}
  <div className="course-toolbar"><button type="submit" className="button button-primary">{busy?'Guardando…':lesson?'Guardar lección':'Crear lección'}</button><button type="button" className="button button-outline" aria-expanded={preview} onClick={()=>setPreview(v=>!v)}>{preview?'Ocultar vista previa':'Vista previa'}</button><button type="button" className="button button-outline" onClick={onClose}>Cerrar</button></div>
  {preview&&<div className="lesson-preview" aria-label="Vista previa de la lección"><p className="eyebrow">VISTA PREVIA · ASÍ LO VERÁ EL ESTUDIANTE</p><h1>{title||'Lección sin título'}</h1>{summary&&<p className="page-description">{summary}</p>}<LessonBody files={valid.map(item=>({kind:item.kind!,filename:item.filename,content:item.content}))} title={title}/>{!valid.length&&<p className="hint">Carga archivos para ver la vista previa.</p>}</div>}
 </form>;
}
