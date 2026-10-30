'use client';
import Link from 'next/link';
import type {CourseDTO,LessonSummaryDTO,PublicCourseOutlineDTO} from '@qapath/contracts';
import {OutlineIndex} from '@/components/outline/outline-index';
import {CourseLessons} from '@/components/study/course-lessons';
import type {ModuleDetailDTO} from '@/lib/academy-api';
import {useAuth} from '@/features/auth/auth-provider';
import {ModuleDetail} from '@/components/academy/module-detail';
import {AddCourseButton} from './add-course-button';
import './courses.css';
/** Índice del curso: reutiliza la vista de módulo («CONTENIDO DE ESTUDIO · Clases y actividades», prácticas y documentación). */
export function CourseDetail({course,modules,lessons=[],outline=null}:{course:CourseDTO;modules:ModuleDetailDTO[];lessons?:LessonSummaryDTO[];outline?:PublicCourseOutlineDTO|null}){
 const {user}=useAuth();
 const toolbar=<div className="course-toolbar"><AddCourseButton course={course}/>{user?.role==='ADMIN'&&<><Link className="button button-outline" href="/admin/courses">Gestionar cursos</Link><Link className="button button-outline" href={`/admin/courses/${course.id}/content`}>Editar contenido</Link></>}</div>;
 // Con contenido publicado (SPEC-CONTENT-330), el índice del curso es el de semanas/capítulos/tarjetas.
 const single=!outline&&modules.length===1;
 return <article className="course-detail"><Link className="text-link" href="/courses">← Cursos</Link>
  {!single&&<><header className="page-heading"><div><p className="eyebrow">{course.category.toUpperCase()} · CURSO</p><h1>{course.title}</h1><p className="page-description">{course.summary}</p></div></header>{toolbar}</>}
  {course.comingSoon?<section className="course-soon-panel" role="status" aria-labelledby="course-soon-title">{single&&<header className="page-heading"><div><p className="eyebrow">{course.category.toUpperCase()} · CURSO</p><h1>{course.title}</h1><p className="page-description">{course.summary}</p></div></header>}{single&&toolbar}<div className="course-soon-card"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 40h36M10 40V22l14-11 14 11v18M19 40V30h10v10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"/><path d="M30 8l4 4M36 6l-2 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg><div><h2 id="course-soon-title">En construcción</h2><p>Muy pronto estará listo… Estamos preparando las clases, prácticas y evaluaciones de este curso.</p><p className="hint">Puedes añadirlo a tu ruta desde ahora; te esperará cuando se publique. Mientras tanto, empieza por <Link href="/courses/fundamentos">Fundamentos del Testing</Link>.</p></div></div></section>
  :outline?<OutlineIndex outline={outline}/>
  :modules.map(detail=><div className="course-module" key={detail.module.id}><ModuleDetail {...detail} actions={single?toolbar:undefined}/></div>)}
  {!course.comingSoon&&<CourseLessons slug={course.slug} lessons={lessons}/>}
  {!course.comingSoon&&course.assignments.some(ref=>ref.kind==='SCRUM')&&<section className="practice-banner"><h2>Aprende con el equipo Scrum</h2><p>Conserva la introducción, actividades y evaluación que ya utilizas.</p><div className="practical-actions"><Link className="button button-primary" href="/scrum">Estudiar Equipo y Scrum ↗</Link></div></section>}
  {!course.comingSoon&&course.assignments.some(ref=>ref.kind==='CTFL')&&<section className="practice-banner"><h2>Estudio y preparación CTFL</h2><p>Consulta capítulos, ejercicios y simulacro con tus resultados anteriores. Su avance se muestra en la experiencia de certificación.</p><div className="practical-actions"><Link className="button button-primary" href="/certification/istqb">Abrir preparación CTFL ↗</Link></div></section>}
 </article>;
}
