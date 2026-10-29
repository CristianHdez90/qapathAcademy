'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import type {CSSProperties,ReactNode} from 'react';
import {DEFAULT_APPEARANCE} from '@qapath/contracts';
import type {AppearanceConfig,CourseDTO,CoursePageDTO,CoursePresentation,LearningPathDTO} from '@qapath/contracts';
import {courseAccent,isOriginalDesign,orderCourses,themeVars} from '@/features/appearance/appearance';
import {progressPercentage} from '@qapath/progress';
import {useAuth} from '@/features/auth/auth-provider';
import {useProgress} from '@/features/progress/progress-provider';
import {courseRequest} from '@/features/courses/course-api';
import {learningModuleStatus,nextLearningAction} from '@/features/progress/learning-navigation';
import {CourseArt,courseArt} from './course-art';
import './courses.css';
import './home-theme.css';
function CourseResume({courses}:{courses:CourseDTO[]}){
 const {user}=useAuth(),{state,ready}=useProgress();const [paths,setPaths]=useState<{owner:string;items:LearningPathDTO[]}>({owner:'',items:[]});
 useEffect(()=>{if(user?.role!=='STUDENT')return;const abort=new AbortController();void courseRequest<LearningPathDTO[]>('/me/learning-paths','GET',undefined,abort.signal).then(items=>setPaths({owner:user.id,items})).catch(()=>{});return()=>abort.abort()},[user?.id,user?.role]);
 if(user?.role!=='STUDENT'||!ready||paths.owner!==user.id)return null;
 const active=paths.items.find(path=>path.active),next=active?.courses.filter(course=>course.status==='PUBLISHED').find(course=>{const metadata=courses.find(item=>item.id===course.id);return metadata&&(!metadata.weeks?.length||progressPercentage(state,metadata.weeks)<100)});
 return next?<aside className="course-content-group" aria-label="Tu siguiente actividad"><strong>Tu siguiente actividad</strong><p>Continúa un curso de tu ruta activa: {next.title}</p><Link className="text-link" href={`/courses/${next.slug}`}>Continuar curso ↗</Link></aside>:null;
}
export type ModuleMeta={id:string;number:string;range:string;icon:string;track:string;color:string;weeks:number[];skills:string[]};
/** Duración propia de cada curso (no la posición en la ruta). Scrum y CTFL son estimaciones ajustables. */
export const weeksLabel=(n:number)=>`${n} ${n===1?'semana':'semanas'}`;

/** Metadatos visuales de los cursos que reutilizan un módulo histórico (número, color, icono, área, semanas). */
export function useModuleMeta(){
 const [modules,setModules]=useState<ModuleMeta[]>([]);
 useEffect(()=>{const abort=new AbortController();void courseRequest<ModuleMeta[]>('/modules','GET',undefined,abort.signal).then(setModules).catch(()=>{});return()=>abort.abort()},[]);
 const metaOf=(course:{assignments?:CourseDTO['assignments']}|undefined)=>{const ref=course?.assignments?.find(item=>item.kind==='LEGACY_MODULE')?.ref;return ref?modules.find(m=>m.id===ref):undefined};
 return {modules,metaOf};
}
/** «QA TÉCNICO» → «QA Técnico»: etiquetas de área legibles en filtros y tarjetas. */
export const prettyTrack=(value:string)=>value.toLowerCase().split(' ').map((word,i)=>word==='qa'||word==='e2e'?word.toUpperCase():i>0&&['de','del','en','y'].includes(word)?word:word.charAt(0).toUpperCase()+word.slice(1)).join(' ');
export function CourseCard({course,meta,badge,actions,presentation,accent:accentOverride,previewProgress}:{course:CourseDTO;meta?:ModuleMeta;badge?:string;actions?:ReactNode;presentation?:CoursePresentation;accent?:string;previewProgress?:number}){
 const {state}=useProgress();
 const weeks=meta?.weeks??course.weeks??[];
 const preview=previewProgress!==undefined;
 // La vista previa del ADMIN simula avance solo en pantalla: nunca lee ni escribe progreso real.
 const pct=preview?previewProgress:weeks.length?progressPercentage(state,weeks):0;
 const status=preview?(previewProgress>=100?'Completado':previewProgress>0?'En curso':'Sin iniciar'):weeks.length?learningModuleStatus(state,weeks):course.contentKind==='SCRUM'?(state.scrumIntro?'En curso':'Sin iniciar'):'Sin iniciar';
 const next=!preview&&weeks.length&&pct>0?nextLearningAction(state,weeks):null;
 const soon=course.comingSoon===true;
 const started=!soon&&status!=='Sin iniciar';
 const category=prettyTrack(meta?.track??course.category);
 const pill=weeks.length?weeksLabel(weeks.length):course.contentKind==='CTFL'?weeksLabel(4):course.contentKind==='SCRUM'?weeksLabel(1):'A tu ritmo';
 const accent=accentOverride??meta?.color??(course.contentKind==='CTFL'?'#c9a2ff':course.contentKind==='SCRUM'?'#5aa9ff':'#5dd8c2');
 const style={'--accent':accent} as CSSProperties;
 const body=<>
  <div className="course-tile-top"><span className="course-tile-cat">{badge?<span className="course-order">{badge}</span>:null}{category}</span><span className="course-tile-dur"><svg viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M8 4.5V8l2.5 1.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>{pill}</span></div>
  {soon&&<p className="course-tile-soon"><svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 16h14M5 16V9l5-4 5 4v7M8 16v-4h4v4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round"/></svg><span><strong>En construcción</strong> · Muy pronto estará listo…</span></p>}
  <div className="course-tile-art"><CourseArt art={presentation&&presentation.illustration!=='auto'?presentation.illustration:courseArt(course.slug,course.contentKind)}/></div>
  <h3>{course.title}</h3>
  <p className="course-tile-summary">{presentation?.summary||course.summary}</p>
  <div className="course-tile-chips">{(presentation?.tags?.length?presentation.tags:course.skills.length?course.skills:meta?.skills??[]).slice(0,presentation?.tags?.length?6:3).map(skill=><span key={skill}>{skill}</span>)}</div>
  {started&&(weeks.length>0||preview)&&<div className="course-tile-progress" aria-label={`Avance del curso: ${pct}%`}><div className="progress-line"><i style={{width:`${pct}%`}}/></div><strong>{pct}%</strong></div>}
  {next&&<p className="course-tile-next">Siguiente: {next.label} · Semana {next.week}</p>}
  {course.contentKind==='SCRUM'&&state.scrumIntro&&<p className="course-tile-next">Introducción registrada · Quiz {state.scrumQuizScore}%</p>}
  <span className="sr-only">Estado: {status}.</span>
 </>;
 if(actions)return <article className="course-card course-tile course-card-static" data-course-slug={course.slug} style={style}>{body}<div className="course-card-actions">{actions}<Link className="text-link" href={`/courses/${course.slug}`}>Ver curso ↗</Link></div></article>;
 return <Link href={`/courses/${course.slug}`} className={`course-card course-tile${started?' is-started':''}${soon?' is-coming-soon':''}`} data-course-slug={course.slug} style={style}>{body}<span className={`course-tile-cta${started?' is-primary':''}${soon?' is-soon':''}`}>{soon?'Muy pronto':started?'Continuar curso':'Ver curso'}<span aria-hidden="true">›</span></span></Link>;
}
export function CourseCatalog({initialSearch='',appearance=DEFAULT_APPEARANCE}:{initialSearch?:string;appearance?:AppearanceConfig}){
 const tokens=appearance.tokens,original=isOriginalDesign(tokens),texts=appearance.home;
 const presentationOf=(id:string)=>appearance.courses.find(item=>item.courseId===id);
 const {user,loading:authLoading}=useAuth();
 const [search,setSearch]=useState(initialSearch),[page,setPage]=useState(1),[data,setData]=useState<CoursePageDTO|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true),[retry,setRetry]=useState(0);
 useEffect(()=>{
  const abort=new AbortController();
  const timer=setTimeout(()=>{setLoading(true);setError('');void courseRequest<CoursePageDTO>(`/courses?search=${encodeURIComponent(search)}&page=${page}&limit=24`,'GET',undefined,abort.signal).then(setData).catch(e=>{if(!abort.signal.aborted)setError(e instanceof Error?e.message:'No se pudo cargar el catálogo.')}).finally(()=>{if(!abort.signal.aborted)setLoading(false)})},200);
  return()=>{clearTimeout(timer);abort.abort()};
 },[search,page,retry]);
 const [track,setTrack]=useState('Todos'),{modules,metaOf}=useModuleMeta();
 const trackOf=(course:CourseDTO)=>metaOf(course)?.track??course.category.toUpperCase();
 const tracks=useMemo(()=>['Todos',...Array.from(new Set((data?.items??[]).map(trackOf)))],[data,modules]);// eslint-disable-line react-hooks/exhaustive-deps
 const visible=orderCourses((data?.items??[]).filter(course=>track==='Todos'||trackOf(course)===track),appearance.courses);
 const routeHref=user?.role==='STUDENT'?'/learning-paths':'/login?next=%2Flearning-paths';
 const updateSearch=(value:string)=>{setSearch(value);setPage(1);const url=new URL(location.href);if(value)url.searchParams.set('q',value);else url.searchParams.delete('q');history.replaceState(history.state,'',url)};
 return <section className="course-catalog course-home" aria-labelledby="course-catalog-title" data-home-theme={original?undefined:appearance.preset} style={original?undefined:themeVars(tokens) as CSSProperties}>
 {texts.showBreadcrumb&&<nav className="course-breadcrumb" aria-label="Ruta de navegación"><Link href="/">QAPath Academy</Link><span aria-hidden="true">›</span><span aria-current="page">Cursos</span></nav>}
 <header className="course-home-head"><div><h1 id="course-catalog-title">{texts.title}</h1>{texts.showSubtitle&&texts.subtitle&&<p className="page-description">{texts.subtitle}</p>}</div><div className="course-toolbar">{!authLoading&&(!user||user.role==='STUDENT')&&<>{user&&<Link className="button button-outline" href="/learning-paths">Ver mis rutas</Link>}<Link className="button button-primary course-home-cta" href={routeHref}><span aria-hidden="true">＋</span> {texts.ctaLabel}</Link></>}{user?.role==='ADMIN'&&<Link className="button button-outline" href="/admin/courses">Gestionar cursos</Link>}</div></header>
 <div className="course-home-toolbar">
  <div className="course-home-search"><label htmlFor="catalog-search" className="sr-only">{texts.searchLabel}</label><svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M13.5 13.5L18 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg><input id="catalog-search" type="search" maxLength={120} value={search} onChange={e=>updateSearch(e.target.value)} placeholder="Buscar cursos por título, habilidad o tecnología…"/>{search&&<button type="button" className="course-home-clear" onClick={()=>updateSearch('')} aria-label="Borrar búsqueda">×</button>}</div>
  {!loading&&!error&&data&&data.items.length>0&&<div className="course-home-filters" role="group" aria-label="Filtrar por área">{tracks.map(t=><button key={t} type="button" aria-pressed={track===t} className={track===t?'is-active':undefined} onClick={()=>setTrack(t)}>{t==='Todos'?t:prettyTrack(t)}</button>)}</div>}
 </div>
 {loading&&<p role="status">Cargando cursos…</p>}{error&&<div role="alert" className="feedback bad"><p>{error}</p><button className="button button-outline" onClick={()=>setRetry(value=>value+1)}>Reintentar</button></div>}
 {!loading&&!error&&data&&<><CourseResume courses={data.items}/><p role="status" className="course-home-count">{data.total} {data.total===1?'curso disponible':'cursos disponibles'}</p>{!data.items.length?<p className="course-empty">{texts.emptyText}</p>:<><div className="course-grid course-home-grid">{visible.map(course=>{const meta=metaOf(course),presentation=presentationOf(course.id);return <CourseCard key={course.id} course={course} meta={meta} presentation={presentation} accent={original&&!presentation?undefined:courseAccent(meta?.color??(course.contentKind==='CTFL'?'#c9a2ff':course.contentKind==='SCRUM'?'#5aa9ff':'#5dd8c2'),presentation,tokens)}/>})}</div>{!visible.length&&<div className="empty-state">No hay cursos en esta área con la búsqueda actual.</div>}</>}{data.total>data.limit&&<nav className="course-toolbar" aria-label="Páginas de cursos"><button className="button button-outline" disabled={page===1} onClick={()=>setPage(value=>value-1)}>← Anterior</button><span>Página {page}</span><button className="button button-outline" disabled={page*data.limit>=data.total} onClick={()=>setPage(value=>value+1)}>Siguiente →</button></nav>}</>}
 </section>;
}
