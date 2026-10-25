"use client";
import Link from 'next/link';
import Image from 'next/image';
import {useEffect,useRef,useState} from 'react';
import {LearningTree} from './learning-tree';
import {usePathname} from 'next/navigation';
import {useAuth} from '@/features/auth/auth-provider';
import {useProgress} from '@/features/progress/progress-provider';
import {progressPercentage} from '@qapath/progress';
import './brand.css';
const links=[{to:'/',label:'Panel de aprendizaje',icon:'▦'},{to:'/scrum',label:'Equipo y Scrum',icon:'◈'},{to:'/modules',label:'Ruta de 8 módulos',icon:'◫'},{to:'/project',label:'Proyecto final',icon:'◇'},{to:'/resources',label:'Recursos y progreso',icon:'▤'},{to:'/account',label:'Mi cuenta',icon:'☻'}];
export function Sidebar(){const path=usePathname();const [routeOpen,setRouteOpen]=useState(false);const routeDialog=useRef<HTMLDialogElement>(null);const routeTrigger=useRef<HTMLButtonElement>(null);
 const closeRoute=()=>{setRouteOpen(false);requestAnimationFrame(()=>routeTrigger.current?.focus({preventScroll:true}))};
 useEffect(()=>{if(!routeOpen)return;const dialog=routeDialog.current;if(!dialog)return;dialog.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{dialog.close();document.body.style.overflow=previous}},[routeOpen]);
 const {state}=useProgress();const {user,loading,authError}=useAuth();const visibleLinks=user?.role==='ADMIN'?[...links,{to:'/admin',label:'Administración',icon:'⚙'}]:links;return <>
 <aside className="sidebar" aria-label="Menú lateral" tabIndex={0}><Link href="/" className="brand" aria-label="QAPath Academy — Inicio"><Image className="brand-mark" src="/brand/qapath-mark.svg" width={48} height={48} alt=""/><span className="brand-wordmark"><b>QA<span>Path</span></b><small>ACADEMY</small></span></Link>
 <p className="nav-kicker">PLATAFORMA</p><nav aria-label="Navegación principal" className="nav-list">{visibleLinks.map(item=>item.to==='/modules'?<LearningTree key={item.to}/>:<Link key={item.to} href={item.to} className={'nav-item '+(path===item.to||(item.to==='/modules'&&path.startsWith('/modules'))?'active':'')}><span className="nav-icon">{item.icon}</span>{item.label}</Link>)}</nav>
 <div className="account-sidebar">{authError&&<p role="alert" className="feedback bad">{authError}</p>}{loading?'Verificando sesión…':user?<><b>{user.email}</b><small>{user.role==='STUDENT'?'Estudiante':user.role}</small></>:<Link href="/login">Entrar / Crear cuenta ↗</Link>}</div><div className="sidebar-footer"><span className="footer-label">TU FORMACIÓN</span><div className="sidebar-score"><b>{progressPercentage(state)}%</b><span>de la ruta completada</span></div><div className="progress-line"><i style={{width:`${progressPercentage(state)}%`}}/></div><small>{state.weeks.length} de 24 semanas</small><div className="sidebar-tip">✦ Aprende, practica y demuestra tu progreso.</div></div></aside>
 <nav className="mobile-tabs" aria-label="Navegación móvil">{visibleLinks.map(item=>item.to==='/modules'?<button ref={routeTrigger} type="button" key={item.to} aria-label="Ruta de 8 módulos" aria-haspopup="dialog" aria-expanded={routeOpen} className={path.startsWith('/modules')||path.startsWith('/study')||path.startsWith('/practice/')?'selected':''} onClick={()=>setRouteOpen(true)}><span aria-hidden="true">◫</span><small>Ruta</small></button>:<Link key={item.to} href={item.to} className={path===item.to?'selected':''} aria-label={item.label} aria-current={path===item.to?'page':undefined}><span>{item.icon}</span><small>{{'/':'Inicio','/scrum':'Scrum','/modules':'Ruta','/project':'Proyecto','/resources':'Recursos','/account':'Cuenta','/admin':'Admin'}[item.to]}</small></Link>)}</nav>
 {routeOpen&&<dialog ref={routeDialog} className="route-tree-dialog" aria-labelledby="route-tree-dialog-title" onClose={()=>setRouteOpen(false)} onCancel={closeRoute}><header><h2 id="route-tree-dialog-title">Tu ruta de aprendizaje</h2><button type="button" aria-label="Cerrar ruta de aprendizaje" onClick={closeRoute}>✕</button></header><nav aria-label="Árbol de la ruta de aprendizaje"><LearningTree onNavigate={()=>setRouteOpen(false)}/></nav></dialog>}
 </>}
