'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import type {ContentModuleDTO} from '@qapath/contracts';
import {courseRequest} from '@/features/courses/course-api';
import {useAuth} from '@/features/auth/auth-provider';
import './courses.css';
import '@/components/study/admin-course-lessons.css';
const BASE='/admin/modules';
const usedIn=(m:ContentModuleDTO)=>m.courses.length?`En ${m.courses.length} ${m.courses.length===1?'curso':'cursos'}: ${m.courses.map(c=>c.title).join(', ')}`:'Sin asignar a cursos';
/** Eliminar recuperable: avisa de qué cursos se quitará. */
export async function deleteModule(m:ContentModuleDTO){
 if(!window.confirm(`¿Eliminar el módulo «${m.title}»?\n\n${m.courses.length?`Se quitará de: ${m.courses.map(c=>c.title).join(', ')}.\n`:''}Su contenido y el avance de los estudiantes se conservan. Podrás restaurarlo desde «Eliminados» (volverá sin asignar).`))return null;
 return courseRequest<ContentModuleDTO>(`${BASE}/${m.id}`,'DELETE',{revision:m.revision});
}
/** SPEC-CONTENT-331 · Módulos propios: contenido reutilizable (semanas → capítulos → tarjetas) asignable a cualquier curso. */
export function AdminModules(){
 const {user,loading}=useAuth();
 if(loading)return <p role="status">Verificando permisos…</p>;
 if(!user)return <><h1>Módulos y experiencias</h1><Link href="/login">Inicia sesión con una cuenta ADMIN</Link></>;
 if(user.role!=='ADMIN')return <p role="alert">No tienes permisos para administrar módulos.</p>;
 return <ModulesWorkspace/>;
}
function ModulesWorkspace(){
 const [tab,setTab]=useState<'active'|'deleted'>('active'),[modules,setModules]=useState<ContentModuleDTO[]|null>(null),[editing,setEditing]=useState<ContentModuleDTO|null|undefined>(undefined);
 const [error,setError]=useState(''),[message,setMessage]=useState(''),[busy,setBusy]=useState(false),[reload,setReload]=useState(0);
 useEffect(()=>{const abort=new AbortController();void courseRequest<ContentModuleDTO[]>(`${BASE}?deleted=${tab==='deleted'}`,'GET',undefined,abort.signal).then(list=>{setModules(list);setError('')}).catch(e=>{if(!abort.signal.aborted)setError(e instanceof Error?e.message:'No se pudieron cargar los módulos.')});return()=>abort.abort()},[tab,reload]);
 const run=async(work:()=>Promise<unknown>,done:string)=>{setBusy(true);setError('');setMessage('');try{const result=await work();if(result!==null){setMessage(done);setReload(v=>v+1)}}catch(e){setError(e instanceof Error?e.message:'No se pudo completar la acción.')}finally{setBusy(false)}};
 return <section className="course-editor lesson-library" aria-labelledby="modules-title">
  <Link href="/admin/courses">← Gestionar cursos</Link>
  <p className="eyebrow">CONTENIDO DE ESTUDIO</p><h1 id="modules-title">Módulos y experiencias</h1>
  <p>Crea módulos propios con <strong>semanas → capítulos → tarjetas</strong> (y minitests). Cada módulo se puede asignar a uno o varios cursos desde <Link className="text-link" href="/admin/courses">Gestionar cursos</Link> → «Contenido asignado», igual que los módulos base.</p>
  <div className="course-toolbar"><button type="button" className="button button-primary" disabled={busy} onClick={()=>{setEditing(null);setMessage('')}}>＋ Nuevo módulo</button><Link className="button button-outline" href="/admin/content">Biblioteca de lecciones</Link></div>
  {editing!==undefined&&<ModuleForm key={editing?`${editing.id}:${editing.revision}`:'new'} module={editing} onClose={()=>setEditing(undefined)} onSaved={(saved,text)=>{setEditing(undefined);setMessage(text);setReload(v=>v+1);void saved}}/>}
  <div className="lesson-library-filters"><div role="tablist" aria-label="Estado"><button type="button" role="tab" aria-selected={tab==='active'} onClick={()=>{setTab('active');setModules(null)}}>Activos</button><button type="button" role="tab" aria-selected={tab==='deleted'} onClick={()=>{setTab('deleted');setModules(null)}}>Eliminados</button></div></div>
  {error&&<p role="alert" className="feedback bad">{error}</p>}{message&&<p role="status" className="feedback good">{message}</p>}
  {!modules&&!error&&<p className="hint" aria-busy="true">Cargando módulos…</p>}
  {modules&&(modules.length?<ul className="lesson-admin-list">{modules.map(m=><li key={m.id}><div><strong>{m.title}</strong><small>{tab==='deleted'?'Eliminado · al restaurarlo vuelve sin asignar':`${m.track} · ${m.weeks} ${m.weeks===1?'semana':'semanas'} · ${m.published?'Contenido publicado':'Sin publicar'} · ${usedIn(m)}`}</small>{m.summary&&<small>{m.summary}</small>}</div>
   <div className="course-toolbar">{tab==='active'?<><Link className="button button-primary" href={`/admin/modules/${m.id}/content`}>Editar contenido <span className="sr-only">{m.title}</span></Link><button type="button" className="button button-outline" disabled={busy} onClick={()=>{setEditing(m);setMessage('')}}>Renombrar <span className="sr-only">{m.title}</span></button><button type="button" className="button button-outline" disabled={busy} onClick={()=>void run(()=>deleteModule(m),'Módulo eliminado. Puedes restaurarlo desde «Eliminados».')}>Eliminar <span className="sr-only">{m.title}</span></button></>
    :<button type="button" className="button button-outline" disabled={busy} onClick={()=>void run(()=>courseRequest(`${BASE}/${m.id}/restore`,'POST',{revision:m.revision}),'Módulo restaurado (sin asignar).')}>Restaurar <span className="sr-only">{m.title}</span></button>}</div></li>)}</ul>
   :<p className="course-empty">{tab==='deleted'?'No hay módulos eliminados.':'Aún no hay módulos propios. Crea el primero con «＋ Nuevo módulo».'}</p>)}
 </section>;
}
/** Crear o renombrar un módulo (nombre, descripción y área). Reutilizado en «Contenido asignado» del curso. */
export function ModuleForm({module,onSaved,onClose}:{module:ContentModuleDTO|null;onSaved:(module:ContentModuleDTO,message:string)=>void;onClose:()=>void}){
 const [title,setTitle]=useState(module?.title??''),[summary,setSummary]=useState(module?.summary??''),[track,setTrack]=useState(module?.track??'QA');
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 const save=async(event:React.FormEvent)=>{
  // Puede abrirse dentro del editor de curso: el submit no debe propagarse a su formulario.
  event.preventDefault();event.stopPropagation();
  if(title.trim().length<3){setError('Escribe un nombre de al menos 3 caracteres.');return}
  setBusy(true);setError('');
  try{const saved=module?await courseRequest<ContentModuleDTO>(`${BASE}/${module.id}`,'PATCH',{revision:module.revision,title,summary,track}):await courseRequest<ContentModuleDTO>(BASE,'POST',{title,summary,track});onSaved(saved,module?'Módulo actualizado.':'Módulo creado. Agrega su contenido con «Editar contenido».')}
  catch(e){setError(e instanceof Error?e.message:'No se pudo guardar el módulo.')}finally{setBusy(false)}
 };
 return <form noValidate className="lesson-editor" onSubmit={event=>void save(event)} aria-labelledby="module-form-title">
  <h3 id="module-form-title">{module?`Renombrar módulo · ${module.title}`:'Nuevo módulo'}</h3>
  {module&&module.courses.length>0&&<p className="hint">Asignado a: {module.courses.map(c=>c.title).join(', ')}. El nombre se actualiza en todos esos cursos.</p>}
  <fieldset disabled={busy}><legend>Datos del módulo</legend>
   <label>Nombre<input required minLength={3} maxLength={160} value={title} onChange={e=>setTitle(e.target.value)}/></label>
   <label>Descripción (opcional)<textarea maxLength={1000} value={summary} onChange={e=>setSummary(e.target.value)}/></label>
   <label>Área<input maxLength={80} value={track} onChange={e=>setTrack(e.target.value)}/></label>
  </fieldset>
  {error&&<p role="alert" className="feedback bad">{error}</p>}
  <div className="course-toolbar"><button type="submit" className="button button-primary">{busy?'Guardando…':module?'Guardar módulo':'Crear módulo'}</button><button type="button" className="button button-outline" onClick={onClose}>Cerrar</button></div>
 </form>;
}
