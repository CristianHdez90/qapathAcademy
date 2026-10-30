import Link from 'next/link';
import type {LessonDTO,LessonSummaryDTO,StudyFileKind} from '@qapath/contracts';
import {LessonBody} from './lesson-body';
import './study.css';
export const KIND_LABEL:Record<StudyFileKind,string>={markdown:'Lectura',mermaid:'Diagrama',interaction:'Interactivo',svg:'Imagen'};
/** «Contenido de estudio» del curso: lecciones publicadas desde archivos. */
export function CourseLessons({slug,lessons}:{slug:string;lessons:LessonSummaryDTO[]}){
 if(!lessons.length)return null;
 return <section className="study-lessons" aria-labelledby="study-lessons-title"><p className="eyebrow">CONTENIDO DE ESTUDIO</p><h2 id="study-lessons-title">Lecciones del curso</h2>
  <ol>{lessons.map(lesson=><li key={lesson.id}><Link className="study-lesson-link" href={`/courses/${slug}/lessons/${lesson.id}`}><span><strong>{lesson.title}</strong>{lesson.summary&&<small>{lesson.summary}</small>}</span><span className="study-kinds">{lesson.kinds.map(kind=><span key={kind} className="study-kind">{KIND_LABEL[kind]}</span>)}</span></Link></li>)}</ol>
 </section>;
}
export function LessonView({courseSlug,courseTitle,lesson,lessons}:{courseSlug:string;courseTitle:string;lesson:LessonDTO;lessons:LessonSummaryDTO[]}){
 const index=lessons.findIndex(item=>item.id===lesson.id),previous=index>0?lessons[index-1]:undefined,next=index>=0?lessons[index+1]:undefined;
 return <article className="study-lesson">
  <Link className="text-link" href={`/courses/${courseSlug}`}>← {courseTitle}</Link>
  <header className="study-lesson-header"><p className="eyebrow">LECCIÓN {index>=0?String(index+1).padStart(2,'0'):''} · CONTENIDO DE ESTUDIO</p><h1>{lesson.title}</h1>{lesson.summary&&<p className="page-description">{lesson.summary}</p>}</header>
  <LessonBody files={lesson.files} title={lesson.title}/>
  <nav className="study-lesson-nav" aria-label="Lecciones">{previous?<Link className="button button-outline" href={`/courses/${courseSlug}/lessons/${previous.id}`}>← {previous.title}</Link>:<span/>}{next?<Link className="button button-primary" href={`/courses/${courseSlug}/lessons/${next.id}`}>{next.title} →</Link>:<Link className="button button-outline" href={`/courses/${courseSlug}`}>Volver al curso</Link>}</nav>
 </article>;
}
