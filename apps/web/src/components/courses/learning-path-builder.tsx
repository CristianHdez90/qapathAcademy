'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import type {CourseDTO,CoursePageDTO,LearningPathDTO} from '@qapath/contracts';
import {useAuth} from '@/features/auth/auth-provider';
import {courseRequest} from '@/features/courses/course-api';
import {useProgress} from '@/features/progress/progress-provider';
import {progressPercentage} from '@qapath/progress';
import {CourseCard,useModuleMeta} from './course-catalog';
import './courses.css';
export function LearningPathBuilder({add}:{add?:string}){
 const {user,loading}=useAuth();
 if(loading)return <p role="status">Verificando sesión…</p>;
 if(!user)return <section className="path-builder"><div className="page-heading"><div><p className="eyebrow">RUTA DE APRENDIZAJE</p><h1>Organiza tu ruta</h1><p className="page-description">Explorar cursos es público. Inicia sesión para guardar tu selección y su orden.</p></div></div><Link className="button button-primary" href={`/login?next=${encodeURIComponent('/learning-paths'+(add?`?add=${add}`:''))}`}>Iniciar sesión para crear mi ruta</Link></section>;
 if(user.role!=='STUDENT')return <p>Las rutas personales pertenecen a cuentas STUDENT. Puedes <Link href="/courses">explorar los cursos</Link>.</p>;
 return <PathWorkspace key={user.id} add={add}/>;
}
function PathWorkspace({add}:{add?:string}){
 const [paths,setPaths]=useState<LearningPathDTO[]>([]),[courses,setCourses]=useState<CourseDTO[]>([]),[search,setSearch]=useState(''),[page,setPage]=useState(1),[total,setTotal]=useState(0);
 const [editing,setEditing]=useState<LearningPathDTO|null>(null),[title,setTitle]=useState('Mi ruta de aprendizaje'),[ids,setIds]=useState<string[]>(add?[add]:[]),[active,setActive]=useState(true);
 const [busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState(''),[message,setMessage]=useState(''),[reload,setReload]=useState(0);
 useEffect(()=>{let live=true;void courseRequest<LearningPathDTO[]>('/me/learning-paths').then(data=>{if(live)setPaths(data)}).catch(e=>{if(live)setError(e.message)}).finally(()=>{if(live)setLoading(false)});return()=>{live=false}},[reload]);
 useEffect(()=>{const abort=new AbortController();const timer=setTimeout(()=>{void courseRequest<CoursePageDTO>(`/courses?search=${encodeURIComponent(search)}&page=${page}&limit=24`,'GET',undefined,abort.signal).then(data=>{setCourses(data.items);setTotal(data.total)}).catch(e=>{if(!abort.signal.aborted)setError(e.message)})},200);return()=>{clearTimeout(timer);abort.abort()}},[search,page,reload]);
 const edit=(path:LearningPathDTO)=>{setEditing(path);setTitle(path.title);setActive(path.active);setIds(path.courses.map(course=>course.id));setMessage('');setError('')};
 const start=()=>{setEditing(null);setTitle('Mi ruta de aprendizaje');setIds([]);setActive(false);setMessage('');setError('')};
 const save=async()=>{setBusy(true);setError('');setMessage('');try{const path=await courseRequest<LearningPathDTO>(`/me/learning-paths${editing?'/'+editing.id:''}`,editing?'PATCH':'POST',{title,courseIds:ids,active,...(editing?{revision:editing.revision}:{})});edit(path);setReload(v=>v+1);setMessage('Ruta guardada. El orden y la selección se conservan en tu cuenta.')}catch(e){setError(e instanceof Error?e.message:'No se pudo guardar.')}finally{setBusy(false)}};
 const remove=async(path:LearningPathDTO)=>{if(!window.confirm(`¿Eliminar la selección «${path.title}»? Tu progreso académico se conserva.`))return;setBusy(true);setError('');try{await courseRequest(`/me/learning-paths/${path.id}`,'DELETE',{revision:path.revision});if(editing?.id===path.id)start();setReload(v=>v+1);setMessage('Selección eliminada. Tus notas, calificaciones y evidencias se conservan.')}catch(e){setError(e instanceof Error?e.message:'No se pudo eliminar.')}finally{setBusy(false)}};
 const activate=async(path:LearningPathDTO)=>{setBusy(true);setError('');try{const updated=await courseRequest<LearningPathDTO>(`/me/learning-paths/${path.id}`,'PATCH',{title:path.title,courseIds:path.courses.map(course=>course.id),active:true,revision:path.revision});if(editing?.id===path.id)edit(updated);setReload(v=>v+1);setMessage('Ruta activa actualizada.')}catch(e){setError(e instanceof Error?e.message:'No se pudo activar.')}finally{setBusy(false)}};
 const move=(id:string,offset:number)=>{const index=ids.indexOf(id),next=index+offset;if(next<0||next>=ids.length)return;const reordered=[...ids];[reordered[index],reordered[next]]=[reordered[next],reordered[index]];setIds(reordered)};
 const {metaOf}=useModuleMeta(),{state,ready}=useProgress();
 const full=(id:string)=>courses.find(c=>c.id===id);
 const pathWeeks=(path:LearningPathDTO)=>path.courses.flatMap(item=>metaOf(full(item.id))?.weeks??full(item.id)?.weeks??[]);
 return <section className="path-builder"><Link className="text-link" href="/courses">← Cursos</Link>
 <div className="page-heading"><div><p className="eyebrow">RUTA DE APRENDIZAJE</p><h1>Mis rutas de aprendizaje</h1><p className="page-description">Selecciona cursos y ordénalos a tu gusto. Retirar un curso no borra lo que ya aprendiste.</p></div><button type="button" className="button button-primary" disabled={busy} onClick={start}>＋ Nueva ruta</button></div>
 {loading&&<p role="status">Cargando rutas…</p>}{error&&<div className="feedback bad" role="alert"><p>{error}</p><button className="button button-outline" onClick={()=>{setError('');setLoading(true);setReload(v=>v+1)}}>Recargar datos</button></div>}{message&&<p role="status" className="feedback good">{message}</p>}
 {!loading&&!paths.length&&<div className="empty-state">Todavía no tienes rutas. Elige cursos abajo y guarda tu primera ruta.</div>}
 {paths.map(path=>{const weeks=pathWeeks(path),pct=ready&&weeks.length?progressPercentage(state,weeks):0;return <section className={`path-panel${path.active?' is-active':''}`} key={path.id} aria-label={`Ruta ${path.title}`}>
  <header className="path-panel-head"><div><p className="eyebrow">{path.active?'RUTA ACTIVA':'RUTA GUARDADA'} · {path.courses.length} {path.courses.length===1?'curso':'cursos'}{weeks.length?` · ${weeks.length} semanas`:''}</p><h2>{path.title} {path.active&&<span className="course-status">Activa</span>}</h2></div>
   {weeks.length>0&&<div className="path-panel-progress"><strong>{pct}%</strong><span>avance de las semanas de esta ruta</span><div className="progress-line"><i style={{width:`${pct}%`}}/></div></div>}</header>
  <div className="module-grid path-grid">{path.courses.map((item,index)=>{const course=full(item.id);return course&&item.status==='PUBLISHED'?<CourseCard key={item.id} course={course} meta={metaOf(course)} badge={`${index+1}`}/>:<article key={item.id} className="module-card path-unavailable"><div className="module-meta"><span className="module-id"><span className="course-order">{index+1}</span>CURSO</span><span className="pill">No disponible</span></div><h3>{item.title}</h3><p>Este curso ya no está publicado. Puedes conservarlo o retirarlo de la ruta.</p></article>})}</div>
  <div className="path-actions"><button className="button button-outline" disabled={busy} onClick={()=>edit(path)}>Editar {path.title}</button>{!path.active&&<button className="button button-outline" disabled={busy} onClick={()=>void activate(path)}>Usar como activa</button>}<button className="button button-outline" disabled={busy} onClick={()=>void remove(path)}>Eliminar selección</button></div>
 </section>})}
 <section className="path-panel path-editor" aria-labelledby="path-editor-title"><header className="path-panel-head"><div><p className="eyebrow">{editing?'EDITAR':'NUEVA'} RUTA</p><h2 id="path-editor-title">{editing?'Editar mi ruta':'Crear mi ruta'}</h2></div></header>
 <div className="path-editor-fields"><label>Nombre de la ruta<input value={title} maxLength={120} minLength={3} onChange={e=>setTitle(e.target.value)}/></label><label className="path-check"><input type="checkbox" checked={active} onChange={e=>setActive(e.target.checked)}/>Usar como ruta activa</label></div>
 <h3>Orden seleccionado</h3>{!ids.length&&<p className="hint">Añade al menos un curso publicado desde la lista de abajo.</p>}<ol className="lesson-list path-order">{ids.map((id,index)=>{const course=full(id)||editing?.courses.find(c=>c.id===id);return <li key={id} className="path-course lesson-row"><span className="course-order" aria-hidden="true">{index+1}</span><div className="lesson-info"><h3>{course?.title||'Curso seleccionado'}</h3>{course&&course.status!=='PUBLISHED'&&<p>No disponible</p>}</div><div className="path-actions"><button className="button button-outline" aria-label={`Subir ${course?.title||'curso'}`} disabled={index===0||busy} onClick={()=>move(id,-1)}>↑</button><button className="button button-outline" aria-label={`Bajar ${course?.title||'curso'}`} disabled={index===ids.length-1||busy} onClick={()=>move(id,1)}>↓</button><button className="button button-outline" disabled={busy} onClick={()=>setIds(value=>value.filter(item=>item!==id))}>Retirar</button></div></li>})}</ol>
 <div className="path-save"><button className="button button-primary" disabled={busy||!ids.length||title.trim().length<3} onClick={()=>void save()}>{busy?'Guardando…':'Guardar ruta'}</button><p className="hint">Hasta 24 cursos por ruta. No se calcula un porcentaje mezclando Scrum, CTFL y semanas.</p></div>
 <h3>Añadir cursos</h3><label className="path-search">Buscar cursos para añadir<input type="search" value={search} maxLength={120} onChange={e=>{setSearch(e.target.value);setPage(1)}} placeholder="Título, habilidad o categoría…"/></label>
 <ul className="module-grid path-grid path-candidates">{courses.map(course=><li className="path-course path-candidate" key={course.id}><CourseCard course={course} meta={metaOf(course)} actions={<button className={`button ${ids.includes(course.id)?'button-outline':'button-primary'}`} disabled={busy||ids.includes(course.id)||ids.length>=24} onClick={()=>setIds(value=>[...value,course.id])}>{ids.includes(course.id)?'Seleccionado':'Añadir'}</button>}/></li>)}</ul>
 {total>24&&<nav className="course-toolbar" aria-label="Cursos para añadir"><button className="button button-outline" disabled={page===1} onClick={()=>setPage(p=>p-1)}>Anterior</button><span>Página {page}</span><button className="button button-outline" disabled={page*24>=total} onClick={()=>setPage(p=>p+1)}>Siguiente</button></nav>}
 </section>
 </section>;
}
