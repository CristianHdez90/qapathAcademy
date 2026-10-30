'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState,type ReactNode} from 'react';
import type {CourseDTO,LessonSummaryDTO,OutlineProgressDTO,PublicCourseOutlineDTO} from '@qapath/contracts';
import {OUTLINE_PASS_PERCENT} from '@qapath/contracts';
import {useAuth} from '@/features/auth/auth-provider';
import {StudyMarkdown} from '@/components/study/study-markdown';
import {KIND_LABEL} from '@/components/study/course-lessons';
import {outlineApi} from './outline-api';
import {outlineHrefResolver} from './outline-links';
import '@/components/academy/module-detail.css';
import '@/components/study/study.css';
import './outline.css';
const two=(n:number)=>String(n).padStart(2,'0');
/**
 * «Lecturas complementarias»: lecciones de la biblioteca dentro del mismo índice del curso (una fila más de «Clases y actividades»).
 */
export function SupplementaryRows({slug,lessons}:{slug:string;lessons:LessonSummaryDTO[]}){
 if(!lessons.length)return null;
 return <div className="lesson-row" data-supplementary><span className="learning-week-state" aria-hidden="true">▤</span><div className="lesson-info">
  <Link href={`/courses/${slug}/lessons/${lessons[0].id}`} className="lesson-link"><span>LECTURAS COMPLEMENTARIAS</span><h3>Lecciones del curso <span>↗</span></h3></Link><p>{lessons.length} {lessons.length===1?'lección':'lecciones'} con texto, diagramas e interacciones.</p>
  <ol className="module-chapters">{lessons.map((lesson,i)=><li key={lesson.id}><Link href={`/courses/${slug}/lessons/${lesson.id}`}>Lección {two(i+1)} · {lesson.title}</Link><small>{lesson.kinds.map(k=>KIND_LABEL[k]).join(' · ')}</small></li>)}</ol>
 </div><span className="lesson-arrow" aria-hidden="true">↗</span></div>;
}
/** Encabezado igual al de los cursos base (vista de módulo): eyebrow, título, resumen y píldora de semanas. */
export function CourseHeading({course,weeks}:{course:Pick<CourseDTO,'title'|'summary'|'category'>;weeks?:number}){
 return <div className="page-heading"><div><p className="eyebrow">CURSO · {course.category}</p><h1>{course.title}</h1><p className="page-description">{course.summary}</p></div>{weeks!==undefined&&<span className="pill">{weeks} {weeks===1?'semana':'semanas'}</span>}</div>;
}
/** Curso con solo lecciones de la biblioteca: mismo índice «Clases y actividades». */
export function LessonsIndex({course,lessons,actions}:{course:CourseDTO;lessons:LessonSummaryDTO[];actions?:ReactNode}){
 return <><CourseHeading course={course}/>{actions}
  <div className="section-head compact"><div><p className="eyebrow">CONTENIDO DE ESTUDIO</p><h2>Clases y actividades</h2></div>{lessons[0]&&<Link className="button button-primary" href={`/courses/${course.slug}/lessons/${lessons[0].id}`}>Comenzar: {lessons[0].title} ↗</Link>}</div>
  {lessons.length?<div className="lesson-list"><SupplementaryRows slug={course.slug} lessons={lessons}/></div>:<p className="course-empty">Este curso aún no tiene contenido publicado.</p>}</>;
}
/**
 * SPEC-CONTENT-330/331 · Índice del curso con la misma estructura que los cursos base (ModuleDetail):
 * semanas → capítulos (enlazados a la lectura enfocada), el resumen de la semana en Markdown con enlaces a capítulos/tarjetas,
 * el avance del estudiante, «Continuar» y, al final, las lecturas complementarias de la biblioteca.
 */
export function OutlineIndex({outline,course,lessons=[],actions}:{outline:PublicCourseOutlineDTO;course:CourseDTO;lessons?:LessonSummaryDTO[];actions?:ReactNode}){
 const {user}=useAuth();const student=user?.role==='STUDENT';
 const [progress,setProgress]=useState<OutlineProgressDTO|null>(null);
 useEffect(()=>{if(!student)return;let alive=true;void outlineApi.progress(outline.slug).then(p=>{if(alive)setProgress(p)}).catch(()=>{});return()=>{alive=false}},[student,outline.slug]);
 const chapters=outline.weeks.flatMap(w=>w.chapters);
 const number=useMemo(()=>new Map(chapters.map((c,i)=>[c.id,i+1])),[chapters]);
 const passed=(id:string)=>(progress?.passedChapters[id]??-1)>=OUTLINE_PASS_PERCENT;
 const pending=progress?chapters.find(c=>c.cards.some(card=>!progress.readCards.includes(card.id))||(c.quiz.length>0&&!passed(c.id))):undefined;
 const base=`/courses/${outline.slug}/learn`;
 return <section aria-labelledby="outline-index-title">
  <CourseHeading course={course} weeks={outline.weeks.length}/>
  {actions}
  <div className="section-head compact"><div><p className="eyebrow">CONTENIDO DE ESTUDIO</p><h2 id="outline-index-title">Clases y actividades</h2></div>{chapters.length>0&&<Link className="button button-primary" href={`${base}?chapter=${(pending??chapters[0]).id}`}>{progress&&(progress.readCards.length||Object.keys(progress.passedChapters).length)?'Continuar':'Comenzar'}: {(pending??chapters[0]).title} ↗</Link>}</div>
  <div className="lesson-list">{outline.weeks.map((week,wi)=>{const done=!!progress&&week.chapters.length>0&&week.chapters.every(c=>c.cards.every(card=>progress.readCards.includes(card.id))&&(!c.quiz.length||passed(c.id)));
   return <div className="lesson-row" key={week.id}><span className="learning-week-state" aria-label={`Semana ${wi+1}: ${done?'completada':'pendiente'}`}>{done?'✓':'○'}</span><div className="lesson-info">
    <Link href={week.chapters[0]?`${base}?chapter=${week.chapters[0].id}`:base} className="lesson-link"><span>SEMANA {two(wi+1)}</span><h3>{week.title} <span>↗</span></h3></Link>
    {week.summary.trim()&&<div className="outline-week-summary"><StudyMarkdown source={week.summary} resolveHref={outlineHrefResolver(base,outline.weeks,week.id)}/></div>}
    {week.chapters.length>0&&<ol className="module-chapters">{week.chapters.map(chapter=>{const read=progress?chapter.cards.filter(c=>progress.readCards.includes(c.id)).length:0;
     return <li key={chapter.id}><Link href={`${base}?chapter=${chapter.id}`}>Capítulo {two(number.get(chapter.id)??0)} · {chapter.title}</Link><small>{!user||student&&!progress?`${chapter.cards.length} tarjetas${chapter.quiz.length?' · minitest':''}`:!student?`${chapter.cards.length} tarjetas${chapter.quiz.length?` · minitest (${chapter.quiz.length})`:''}`:passed(chapter.id)?'✓ Aprobado':`${read}/${chapter.cards.length} tarjetas leídas${chapter.quiz.length?' · con minitest':''}`}</small></li>})}</ol>}
   </div><span className="lesson-arrow" aria-hidden="true">↗</span></div>})}
   <SupplementaryRows slug={outline.slug} lessons={lessons}/>
  </div>
 </section>;
}
