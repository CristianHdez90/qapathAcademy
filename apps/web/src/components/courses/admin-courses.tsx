'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import type {CourseDTO,CourseInputDTO,CoursePageDTO} from '@qapath/contracts';
import {CourseCard} from './course-catalog';
import {AssignedContent} from './assigned-content';
import {useAuth} from '@/features/auth/auth-provider';
import {courseRequest} from '@/features/courses/course-api';
import './courses.css';
import '@/components/study/study.css';
import '@/components/study/admin-course-lessons.css';
const blank:CourseInputDTO={slug:'',title:'',summary:'',description:'',category:'QA',skills:[],position:9,cover:null,contentKind:'CURATED',assignments:[],comingSoon:false};
const label=(status:CourseDTO['status'])=>({DRAFT:'Borrador',PUBLISHED:'Publicado',ARCHIVED:'Archivado'}[status]);
export function AdminCourses(){const {user,loading}=useAuth();if(loading)return <p role="status">Verificando permisos…</p>;if(!user)return <><h1>Gestión de cursos</h1><Link href="/login">Inicia sesión con una cuenta ADMIN</Link></>;if(user.role!=='ADMIN')return <p role="alert">No tienes permisos para administrar cursos.</p>;return <CourseWorkspace key={user.id}/>}
function CourseWorkspace(){
 const [data,setData]=useState<CoursePageDTO|null>(null),[search,setSearch]=useState(''),[status,setStatus]=useState(''),[page,setPage]=useState(1),[revision,setRevision]=useState(0);
 const [editing,setEditing]=useState<CourseDTO|null|undefined>(undefined),[error,setError]=useState(''),[message,setMessage]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false);
 useEffect(()=>{const abort=new AbortController();const timer=setTimeout(()=>{setLoading(true);setError('');void courseRequest<CoursePageDTO>(`/admin/courses?search=${encodeURIComponent(search)}&page=${page}&limit=12${status?`&status=${status}`:''}`,'GET',undefined,abort.signal).then(setData).catch(e=>{if(!abort.signal.aborted)setError(e.message)}).finally(()=>{if(!abort.signal.aborted)setLoading(false)})},200);return()=>{clearTimeout(timer);abort.abort()}},[search,status,page,revision]);
 const transition=async(course:CourseDTO,restore:boolean)=>{
  if(!window.confirm(restore?`¿Restaurar «${course.title}» como borrador?`:`¿Archivar «${course.title}»? No se borrarán clases ni avances.`))return;
  setBusy(true);setError('');setMessage('');try{const updated=await courseRequest<CourseDTO>(`/admin/courses/${course.id}${restore?'/restore':''}`,restore?'POST':'DELETE',{revision:course.revision});if(editing?.id===updated.id)setEditing(updated);setRevision(v=>v+1);setMessage(restore?'Curso restaurado como borrador. Debes publicarlo explícitamente.':'Curso archivado. El contenido y progreso se conservan.')}catch(e){setError(e instanceof Error?e.message:'No se pudo cambiar el estado.')}finally{setBusy(false)}
 };
 return <section className="course-editor"><Link href="/account">← Mi cuenta</Link><h1>Gestionar cursos</h1><p>Edita metadatos, asigna contenido existente o carga el contenido de estudio con archivos. Eliminar significa archivar, sin borrar clases ni progreso.</p><div className="course-toolbar"><button className="button button-primary" onClick={()=>{setEditing(null);setMessage('')}}>Agregar curso</button></div><label>Buscar cursos administrados<input type="search" value={search} maxLength={120} onChange={e=>{setSearch(e.target.value);setPage(1)}}/></label><label>Estado<select value={status} onChange={e=>{setStatus(e.target.value);setPage(1)}}><option value="">Todos</option><option value="DRAFT">Borrador</option><option value="PUBLISHED">Publicado</option><option value="ARCHIVED">Archivado</option></select></label>{loading&&<p role="status">Cargando cursos…</p>}{error&&<div role="alert" className="feedback bad"><p>{error}</p><button className="button button-outline" onClick={()=>setRevision(v=>v+1)}>Recargar listado</button></div>}{message&&<p role="status" className="feedback good">{message}</p>}
 {data&&!loading&&<><p>{data.total} cursos</p><div className="catalog-table-scroll"><table><caption>Catálogo administrado</caption><thead><tr><th>Curso</th><th>Estado</th><th>Orden</th><th>Acciones</th></tr></thead><tbody>{data.items.map(course=><tr key={course.id}><td>{course.title}<small> · {course.slug}</small></td><td>{label(course.status)}{course.comingSoon&&<span className="course-coming-soon-pill">En construcción</span>}</td><td>{course.position}</td><td><div className="course-toolbar"><button className="button button-outline" disabled={busy} onClick={()=>{setBusy(true);void courseRequest<CourseDTO>(`/admin/courses/${course.id}`).then(setEditing).catch(e=>setError(e.message)).finally(()=>setBusy(false))}}>Editar {course.title}</button>{course.status==='ARCHIVED'?<button className="button button-outline" disabled={busy} onClick={()=>void transition(course,true)}>Restaurar</button>:<button className="button button-outline" disabled={busy} onClick={()=>void transition(course,false)}>Archivar</button>}</div></td></tr>)}</tbody></table></div><nav className="course-toolbar" aria-label="Páginas administrativas"><button className="button button-outline" disabled={page===1} onClick={()=>setPage(v=>v-1)}>Anterior</button><span>Página {page}</span><button className="button button-outline" disabled={page*12>=data.total} onClick={()=>setPage(v=>v+1)}>Siguiente</button></nav></>}
 {editing!==undefined&&<CourseEditor key={editing?`${editing.id}:${editing.revision}`:'new'} course={editing} onCancel={()=>setEditing(undefined)} onSaved={course=>{setEditing(course);setRevision(v=>v+1);setMessage('Curso guardado correctamente.')}}/>}
 </section>;
}
/** «Playwright Avanzado» → «playwright-avanzado»: minúsculas, sin tildes, solo letras, números y guiones. */
export const toSlug=(text:string)=>text.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,100);
const SLUG=/^[a-z0-9]+(?:-[a-z0-9]+)*$/,COVER=/^\/course-covers\/[a-zA-Z0-9_-]+\.(svg|png|webp|jpg)$/;
type Problems=Partial<Record<'title'|'slug'|'category'|'summary'|'cover'|'assignments',string>>;
function CourseEditor({course,onSaved,onCancel}:{course:CourseDTO|null;onSaved:(course:CourseDTO)=>void;onCancel:()=>void}){
 const [input,setInput]=useState<CourseInputDTO>(course?{slug:course.slug,title:course.title,summary:course.summary,description:course.description,category:course.category,skills:course.skills,position:course.position,cover:course.cover,contentKind:course.contentKind,assignments:course.assignments,comingSoon:course.comingSoon??false}:{...blank}),[status,setStatus]=useState<'DRAFT'|'PUBLISHED'>(course?.status==='PUBLISHED'?'PUBLISHED':'DRAFT');
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[skillsText,setSkillsText]=useState(input.skills.join(', '));const archived=course?.status==='ARCHIVED';
 const [slugEdited,setSlugEdited]=useState(!!course),[tried,setTried]=useState(false);
 const set=<K extends keyof CourseInputDTO>(key:K,value:CourseInputDTO[K])=>setInput(old=>({...old,[key]:value}));
 const skills=skillsText.split(',').map(s=>s.trim()).filter(Boolean);
 const problems:Problems={};
 if(input.title.trim().length<3)problems.title='Escribe un título de al menos 3 caracteres.';
 if(!SLUG.test(input.slug)||input.slug.length<3)problems.slug='Usa minúsculas, números y guiones (mínimo 3), por ejemplo «playwright-avanzado».';
 if(!input.category.trim())problems.category='Indica una categoría, por ejemplo «QA Técnico».';
 if(input.cover&&!COVER.test(input.cover))problems.cover='Usa una ruta como «/course-covers/playwright.webp» o deja el campo vacío.';
 if(status==='PUBLISHED'&&!input.summary.trim())problems.summary='Para publicar, escribe un resumen.';
 if(input.contentKind!=='CURATED'&&!input.assignments.some(a=>a.kind!=='LESSON'))problems.assignments='Selecciona el contenido de este tipo de curso.';
 const invalid=Object.keys(problems).length>0;
 const show=(key:keyof Problems)=>tried&&problems[key]?<small className="field-error" role="alert">{problems[key]}</small>:null;
 const submit=async(event:React.FormEvent)=>{event.preventDefault();setTried(true);if(invalid){setError('Revisa los campos marcados.');return}
  if(course&&course.status!==status&&!window.confirm(`¿Cambiar la visibilidad a ${label(status)}?`))return;
  setBusy(true);setError('');
  try{
   const saved=await courseRequest<CourseDTO>(`/admin/courses${course?'/'+course.id:''}`,course?'PATCH':'POST',{...input,slug:input.slug,cover:input.cover||null,skills,...(course?{revision:course.revision,status}:{})});
   onSaved(saved);
  }catch(e){setError(e instanceof Error?e.message:'No se pudo guardar.')}finally{setBusy(false)}};
 // Vista previa de la tarjeta del catálogo con los datos del formulario (sin guardar).
 const previewCourse:CourseDTO={...input,id:course?.id??'preview',status:course?.status??'DRAFT',revision:course?.revision??1,createdAt:'',updatedAt:'',title:input.title||'Título del curso',summary:input.summary||'El resumen del curso aparecerá aquí.',slug:input.slug||'nuevo-curso',skills,category:input.category||'QA'};
 return <div className="course-editor-layout">
 <form noValidate className="course-content-group" onSubmit={event=>void submit(event)} aria-labelledby="course-editor-title"><h2 id="course-editor-title">{course?'Editar curso':'Nuevo curso'}</h2>{course?.usageCount!==undefined&&<p>Presente en {course.usageCount} rutas personales. Archivar conserva esas relaciones.</p>}{archived&&<p>Restaura el curso desde el listado antes de editarlo.</p>}<fieldset disabled={busy||archived}><legend>Metadatos y contenido</legend><div className="catalog-form-grid">
  <label>Título<input autoFocus required minLength={3} maxLength={250} value={input.title} aria-invalid={tried&&!!problems.title} onChange={e=>{const title=e.target.value;setInput(old=>({...old,title,...(slugEdited?{}:{slug:toSlug(title)})}))}}/>{show('title')}</label>
  <label>Slug estable (URL)<input required readOnly={!!course} maxLength={100} value={input.slug} aria-invalid={tried&&!!problems.slug} aria-describedby="slug-hint" onChange={e=>{setSlugEdited(true);set('slug',toSlug(e.target.value.replace(/\s/g,'-'))+(/[-\s]$/.test(e.target.value)?'-':''))}} onBlur={()=>set('slug',toSlug(input.slug))}/><small id="slug-hint" className="hint">{course?'El slug no cambia después de crear el curso.':<>Se genera desde el título. URL: <code>/courses/{input.slug||'…'}</code></>}</small>{show('slug')}</label>
  <label>Categoría<input required maxLength={80} value={input.category} aria-invalid={tried&&!!problems.category} onChange={e=>set('category',e.target.value)}/>{show('category')}</label>
  <label>Orden editorial<input type="number" required min={0} max={10000} value={input.position} onChange={e=>set('position',Number(e.target.value))}/></label></div>
  <label className="course-coming-soon-field"><input type="checkbox" checked={!!input.comingSoon} onChange={e=>set('comingSoon',e.target.checked)}/> <span><strong>En construcción</strong> · el curso se ve en el catálogo con el aviso «Muy pronto estará listo…» y su contenido aún no se ofrece.</span></label>
  <label>Resumen<textarea maxLength={500} value={input.summary} aria-invalid={tried&&!!problems.summary} onChange={e=>set('summary',e.target.value)}/>{show('summary')}</label>
  <label>Descripción<textarea maxLength={8000} value={input.description} onChange={e=>set('description',e.target.value)}/></label>
  <label>Habilidades separadas por comas<input maxLength={1000} value={skillsText} onChange={e=>setSkillsText(e.target.value)}/></label>
  <label>Portada local opcional<input placeholder="/course-covers/mi-curso.webp" value={input.cover||''} aria-invalid={tried&&!!problems.cover} onChange={e=>set('cover',e.target.value.trim()||null)}/><small className="hint">Déjala vacía para usar la ilustración automática de la tarjeta.</small>{show('cover')}</label>
  <label>Origen del contenido<select value={input.contentKind} onChange={e=>{const kind=e.target.value as CourseInputDTO['contentKind'];setInput(old=>{const lessons=old.assignments.filter(a=>a.kind==='LESSON');return {...old,contentKind:kind,assignments:[...(kind==='SCRUM'?[{kind:'SCRUM' as const,ref:'equipo-scrum'}]:kind==='CTFL'?[{kind:'CTFL' as const,ref:'istqb-ctfl'}]:[]),...lessons]}})}}><option value="CURATED">Selección de módulos y lecciones de la biblioteca</option><option value="LEGACY_MODULE">Curso heredado</option><option value="SCRUM">Equipo y Scrum</option><option value="CTFL">Preparación CTFL</option></select></label>
 <AssignedContent contentKind={input.contentKind} assignments={input.assignments} onChange={next=>set('assignments',next)} problem={show('assignments')}/>

 {course?<label>Visibilidad<select value={status} onChange={e=>setStatus(e.target.value as typeof status)}><option value="DRAFT">Borrador · despublicado</option><option value="PUBLISHED">Publicado</option></select></label>:<p>Se creará como borrador. Podrás publicarlo con un resumen y contenido asignado (un módulo o al menos una lección publicada).</p>}{error&&<p role="alert" className="feedback bad">{error}</p>}<div className="course-toolbar"><button type="submit" className="button button-primary">{busy?'Guardando…':course?'Guardar cambios':'Crear borrador'}</button><button type="button" className="button button-outline" onClick={onCancel}>Cerrar editor</button></div></fieldset></form>
 <aside className="course-card-preview" aria-label="Vista previa de la tarjeta"><p className="eyebrow">VISTA PREVIA DE LA TARJETA</p><div className="course-card-preview-frame" inert><CourseCard course={previewCourse} previewProgress={0}/></div><p className="hint">Así se verá en «Explora cursos». La ilustración se elige automáticamente; puedes cambiarla en Apariencia del Home.</p></aside>
 </div>;
}
