'use client';
import {useCallback,useEffect,useState} from 'react';
import type {FormEvent} from 'react';
import Link from 'next/link';
import {AdminAiSettings} from './admin-ai-settings';
import {AdminMfaReset} from './admin-mfa-reset';
import {useAuth} from '@/features/auth/auth-provider';

type Student={id:string;email:string;role:'STUDENT';isActive:boolean;emailVerified:boolean;mustChangePassword:boolean;mfaEnabled:boolean;createdAt:string;updatedAt:string};
type StudentRow=Student&{progressPercent:number;completedCount:number;lastProgressAt:string|null};
type ListResponse={data:StudentRow[];total:number;page:number;limit:number};
type Summary={students:number;activeStudents:number;studentsWithProgress:number;averageProgressPercent:number};
type Progress={completedWeeks:number[];readWeeks:number[];tasksCount:number;labsCount:number;finalCount:number;quizScores:Record<string,number>;scrumCompleted:boolean;progressPercent:number;revision:number;updatedAt:string|null};
type Detail={student:Student;progress:Progress};
type Activity={id:string;action:string;at:string;revision?:number;details:Record<string,unknown>;actorEmail?:string|null};

async function api<T>(path:string,method:'GET'|'POST'|'PATCH'='GET',body?:unknown):Promise<T>{
 const response=await fetch(`/api/v1/admin${path}`,{method,cache:'no-store',credentials:'same-origin',headers:{Accept:'application/json',...(body===undefined?{}:{'Content-Type':'application/json'})},body:body===undefined?undefined:JSON.stringify(body)});
 const envelope:unknown=await response.json().catch(()=>null);
 const payload=envelope as {data?:T;message?:string|string[]}|null;
 if(!response.ok)throw new Error(Array.isArray(payload?.message)?payload?.message.join('; '):payload?.message||`Error HTTP ${response.status}`);
 return payload?.data as T;
}
const timestamp=(d:string|null)=>d?new Date(d).toLocaleString('es-CO',{dateStyle:'medium',timeStyle:'short'}):'Sin actividad';
const formatDetails=(details:Record<string,unknown>)=>Object.entries(details).map(([k,v])=>`${k}: ${typeof v==='object'?JSON.stringify(v):String(v)}`).join(' · ');
export function AdminDashboard(){
 const {user,loading}=useAuth();
 const [search,setSearch]=useState('');const [filter,setFilter]=useState<'all'|'active'|'inactive'>('all');const [page,setPage]=useState(1);
 const [items,setItems]=useState<ListResponse|null>(null);const [summary,setSummary]=useState<Summary|null>(null);
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [error,setError]=useState('');
 const [selected,setSelected]=useState<Detail|null>(null);const [events,setEvents]=useState<Activity[]>([]);const [audit,setAudit]=useState<Activity[]>([]);
 const [email,setEmail]=useState('');const [password,setPassword]=useState('');const [editEmail,setEditEmail]=useState('');const [showForm,setShowForm]=useState(false);
 const fetchStudents=useCallback(()=>Promise.all([api<ListResponse>(`/students?${new URLSearchParams({search,status:filter,page:String(page),limit:'12'})}`),api<Summary>('/summary')]),[search,filter,page]);
 const refresh=useCallback(async()=>{
  const [list,stats]=await fetchStudents();
  setItems(list);setSummary(stats);
 },[fetchStudents]);
 const loadStudent=useCallback(async(id:string)=>{
  const [detail,history,audits]=await Promise.all([api<Detail>(`/students/${id}`),api<Activity[]>(`/students/${id}/events`),api<{data:Activity[]}>(`/audit?studentId=${id}&limit=30`)]);
  setSelected(detail);setEditEmail(detail.student.email);setEvents(history);setAudit(audits.data);
 },[]);
 useEffect(()=>{
  if(loading||user?.role!=='ADMIN')return;
  let alive=true;
  void fetchStudents().then(([list,stats])=>{if(alive){setItems(list);setSummary(stats)}}).catch(e=>{if(alive)setError(e instanceof Error?e.message:'No fue posible consultar estudiantes')});
  return()=>{alive=false};
 },[loading,user?.role,fetchStudents]);
 if(loading)return <p role="status">Validando la sesión administrativa…</p>;
 if(!user)return <div className="account-card"><h1>Inicia sesión</h1><p>El panel requiere una cuenta de administrador.</p><Link href="/login" className="button button-primary">Iniciar sesión</Link></div>;
 if(user.role!=='ADMIN')return <div className="account-card"><h1>Acceso restringido</h1><p>Solo los administradores autorizados pueden consultar información de estudiantes.</p></div>;
 async function action(handler:()=>Promise<void>){setBusy(true);setError('');setMessage('');try{await handler()}catch(e){setError(e instanceof Error?e.message:'Operación fallida')}finally{setBusy(false)}}
 function create(e:FormEvent){e.preventDefault();void action(async()=>{const created=await api<Student>('/students','POST',{email,password});setMessage(`Estudiante ${created.email} creado correctamente.`);setEmail('');setPassword('');setShowForm(false);setPage(1);await refresh();});}
 function changeStatus(){if(!selected)return;const active=!selected.student.isActive;if(!active&&!window.confirm('Desactivar esta cuenta revocará las sesiones del estudiante. ¿Continuar?'))return;void action(async()=>{await api(`/students/${selected.student.id}`,'PATCH',{isActive:active});await loadStudent(selected.student.id);await refresh();setMessage(active?'Cuenta activada.':'Cuenta desactivada y sesiones revocadas.');});}
 function rename(e:FormEvent){e.preventDefault();if(!selected)return;void action(async()=>{await api(`/students/${selected.student.id}`,'PATCH',{email:editEmail});await loadStudent(selected.student.id);await refresh();setMessage('Correo actualizado con registro de auditoría.');});}
 return <div className="admin-layout">
  <div className="page-heading"><div><p className="eyebrow">ADMINISTRACIÓN · QAPath Academy</p><h1>Gestión de estudiantes</h1><p className="page-description">Cuentas, avance de aprendizaje y trazabilidad de cambios en PostgreSQL.</p></div><div className="course-toolbar"><Link className="button button-outline" href="/admin/content">Biblioteca de contenido</Link><Link className="button button-outline" href="/admin/modules">Módulos y experiencias</Link><Link className="button button-outline" href="/admin/appearance">Apariencia del Home</Link><Link className="button button-outline" href="/admin/courses">Gestionar cursos</Link><button className="button button-primary" onClick={()=>setShowForm(v=>!v)}>{showForm?'Cerrar formulario':'+ Crear estudiante'}</button></div></div>
  {error&&<div className="feedback bad" role="alert">{error}</div>}{message&&<div className="feedback good" role="status">{message}</div>}
  <AdminAiSettings/>
  <AdminMfaReset/>
  <div className="admin-stats" aria-label="Indicadores académicos">
   <article><small>Total estudiantes</small><strong>{summary?.students??'—'}</strong></article>
   <article><small>Cuentas activas</small><strong>{summary?.activeStudents??'—'}</strong></article>
   <article><small>Con progreso</small><strong>{summary?.studentsWithProgress??'—'}</strong></article>
   <article><small>Promedio de avance</small><strong>{summary?`${summary.averageProgressPercent}%`:'—'}</strong></article>
  </div>
  {showForm&&<form className="admin-form" onSubmit={create}><h2>Nueva cuenta de estudiante</h2><p className="hint">Solo se crean estudiantes. La contraseña temporal obliga a cambiarla en el primer acceso. Se enviará un correo de verificación al estudiante; comunica la contraseña temporal solo por un canal seguro.</p><div className="admin-form-row"><label>Correo electrónico<input required type="email" value={email} maxLength={254} onChange={e=>setEmail(e.target.value)} autoComplete="off"/></label><label>Contraseña inicial<input required type="password" minLength={12} maxLength={128} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password"/></label><button className="button button-primary" disabled={busy}>Crear cuenta</button></div></form>}
  <section className="admin-panel"><div className="admin-head"><div><h2>Directorio de estudiantes</h2><p>Consulta y administra cuentas sin eliminar su historial.</p></div><button className="button button-outline" disabled={busy} onClick={()=>void action(async()=>{await refresh();if(selected)await loadStudent(selected.student.id)})}>Actualizar</button></div>
   <div className="admin-filters"><label>Buscar correo<input type="search" placeholder="Buscar estudiante…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1)}}/></label><label>Estado<select value={filter} onChange={e=>{setFilter(e.target.value as typeof filter);setPage(1)}}><option value="all">Todos</option><option value="active">Activos</option><option value="inactive">Inactivos</option></select></label></div>
   <div className="admin-table-wrap"><table className="admin-table"><thead><tr><th>Estudiante</th><th>Estado</th><th>Seguridad</th><th>Semanas</th><th>Avance</th><th>Último progreso</th><th>Acción</th></tr></thead><tbody>{items?.data.map(student=><tr key={student.id}><td>{student.email}</td><td><span className={student.isActive?'admin-pill good':'admin-pill off'}>{student.isActive?'Activo':'Inactivo'}</span></td><td>{student.emailVerified?'Correo ✓':'Correo pendiente'} · {student.mfaEnabled?'MFA ✓':'MFA pendiente'}{student.mustChangePassword?' · Cambiar clave':''}</td><td>{student.completedCount}/24</td><td><div className="admin-progress"><span style={{width:`${student.progressPercent}%`}}/></div>{student.progressPercent}%</td><td>{timestamp(student.lastProgressAt)}</td><td><button className="admin-link" onClick={()=>void action(()=>loadStudent(student.id))}>Ver detalle ↗</button></td></tr>)}{items?.data.length===0&&<tr><td colSpan={7}>No hay estudiantes con esos criterios.</td></tr>}</tbody></table></div>
   <div className="admin-paging"><small>{items?`${items.total} estudiantes · página ${items.page}`:'Cargando…'}</small><div><button disabled={busy||page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))}>← Anterior</button><button disabled={busy||!items||page*items.limit>=items.total} onClick={()=>setPage(p=>p+1)}>Siguiente →</button></div></div>
  </section>
  {selected&&<section className="admin-panel" aria-label="Detalle de estudiante"><div className="admin-head"><div><p className="eyebrow">PERFIL DEL ESTUDIANTE</p><h2>{selected.student.email}</h2><p>Registro: {timestamp(selected.student.createdAt)} · Último avance: {timestamp(selected.progress.updatedAt)}</p></div><button className="button button-outline" onClick={()=>setSelected(null)}>Cerrar detalle</button></div>
   <div className="admin-detail-metrics"><div><strong>{selected.progress.progressPercent}%</strong><small>Completado</small></div><div><strong>{selected.progress.completedWeeks.length}/24</strong><small>Semanas</small></div><div><strong>{selected.progress.readWeeks.length}/24</strong><small>Lecturas</small></div><div><strong>{Object.keys(selected.progress.quizScores).length}</strong><small>Cuestionarios</small></div></div>
   <h3>Semanas terminadas</h3><div className="admin-weeks">{Array.from({length:24},(_,i)=>i+1).map(week=><span key={week} className={selected.progress.completedWeeks.includes(week)?'done':''} title={`Semana ${week}`}>{week}</span>)}</div>
   <h3>Calificaciones por módulo</h3>{Object.keys(selected.progress.quizScores).length?<div className="admin-scores">{Object.entries(selected.progress.quizScores).map(([moduleId,score])=><div key={moduleId}><span>{moduleId}</span><b>{score}%</b></div>)}</div>:<p className="hint">Todavía no tiene calificaciones guardadas.</p>}
   <div className="admin-manage"><form onSubmit={rename}><label>Actualizar correo<input type="email" required value={editEmail} onChange={e=>setEditEmail(e.target.value)}/></label><button className="button button-outline" disabled={busy||editEmail===selected.student.email}>Guardar correo</button></form><div><p>Estado: <b>{selected.student.isActive?'Activo':'Inactivo'}</b></p><button className="button button-outline" disabled={busy} onClick={changeStatus}>{selected.student.isActive?'Desactivar acceso':'Activar acceso'}</button></div></div>
   <div className="admin-history-columns"><div><h3>Historial académico</h3><div className="admin-timeline">{events.length?events.map(event=><article key={event.id}><small>{timestamp(event.at)} · Rev. {event.revision}</small><b>{event.action}</b><p>{formatDetails(event.details)||'Sin detalles adicionales'}</p></article>):<p className="hint">No hay eventos desde que se activó la auditoría.</p>}</div></div><div><h3>Auditoría de cuenta</h3><div className="admin-timeline">{audit.length?audit.map(event=><article key={event.id}><small>{timestamp(event.at)} · {event.actorEmail||'Sistema'}</small><b>{event.action}</b><p>{formatDetails(event.details)||'—'}</p></article>):<p className="hint">Sin cambios administrativos registrados.</p>}</div></div></div>
  </section>}
 </div>;
}
