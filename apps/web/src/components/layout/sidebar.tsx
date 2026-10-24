"use client";
import Link from 'next/link';
import {usePathname} from 'next/navigation';
import {useAuth} from '@/features/auth/auth-provider';
import {useProgress} from '@/features/progress/progress-provider';
import {progressPercentage} from '@qapath/progress';
const links=[{to:'/',label:'Panel de aprendizaje',icon:'▦'},{to:'/scrum',label:'Equipo y Scrum',icon:'◈'},{to:'/modules',label:'Ruta de 8 módulos',icon:'◫'},{to:'/project',label:'Proyecto final',icon:'◇'},{to:'/resources',label:'Recursos y progreso',icon:'▤'},{to:'/account',label:'Mi cuenta',icon:'☻'}];
export function Sidebar(){const path=usePathname();const {state}=useProgress();const {user,loading,authError}=useAuth();const visibleLinks=user?.role==='ADMIN'?[...links,{to:'/admin',label:'Administración',icon:'⚙'}]:links;return <>
 <aside className="sidebar"><Link href="/" className="brand"><span className="brand-mark">Q<span>A</span></span><span><b>QAPath</b><small>ACADEMY</small></span></Link>
 <p className="nav-kicker">PLATAFORMA</p><nav aria-label="Navegación principal" className="nav-list">{visibleLinks.map(item=><Link key={item.to} href={item.to} className={'nav-item '+(path===item.to||(item.to==='/modules'&&path.startsWith('/modules'))?'active':'')}><span className="nav-icon">{item.icon}</span>{item.label}</Link>)}</nav>
 <div className="account-sidebar">{authError&&<p role="alert" className="feedback bad">{authError}</p>}{loading?'Verificando sesión…':user?<><b>{user.email}</b><small>{user.role==='STUDENT'?'Estudiante':user.role}</small></>:<Link href="/login">Entrar / Crear cuenta ↗</Link>}</div><div className="sidebar-footer"><span className="footer-label">TU FORMACIÓN</span><div className="sidebar-score"><b>{progressPercentage(state)}%</b><span>de la ruta completada</span></div><div className="progress-line"><i style={{width:`${progressPercentage(state)}%`}}/></div><small>{state.weeks.length} de 24 semanas</small><div className="sidebar-tip">✦ Aprende, practica y demuestra tu progreso.</div></div></aside>
 <nav className="mobile-tabs" aria-label="Navegación móvil">{visibleLinks.map(item=><Link key={item.to} href={item.to} className={path===item.to?'selected':''} style={{flex:1,minWidth:0}}><span>{item.icon}</span><small>{item.label.split(' ')[0]}</small></Link>)}</nav>
 </>}
