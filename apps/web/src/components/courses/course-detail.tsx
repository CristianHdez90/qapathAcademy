'use client';
import Link from 'next/link';
import type {CourseDTO,LessonSummaryDTO,PublicCourseOutlineDTO} from '@qapath/contracts';
import {OutlineIndex,LessonsIndex,SupplementaryRows,CourseHeading} from '@/components/outline/outline-index';
import type {ModuleDetailDTO} from '@/lib/academy-api';
import {useAuth} from '@/features/auth/auth-provider';
import {ModuleDetail} from '@/components/academy/module-detail';
import {AddCourseButton} from './add-course-button';
import './courses.css';
/**
 * Índice del curso con la estructura de los cursos base (vista de módulo: «CONTENIDO DE ESTUDIO · Clases y actividades»).
 * SPEC-CONTENT-331 · Un solo índice: el contenido editable (semanas → capítulos), los módulos base asignados
 * y, al final del mismo índice, las lecturas complementarias de la biblioteca.
 */
export function CourseDetail({course,modules,lessons=[],outline=null}:{course:CourseDTO;modules:ModuleDetailDTO[];lessons?:LessonSummaryDTO[];outline?:PublicCourseOutlineDTO|null}){
 const {user}=useAuth();
 const toolbar=<div className="course-toolbar"><AddCourseButton course={course}/>{user?.role==='ADMIN'&&<><Link className="button button-outline" href="/admin/courses">Gestionar cursos</Link><Link className="button button-outline" href={`/admin/courses/${course.id}/content`}>Editar contenido</Link></>}</div>;
 const extras=(index:number,total:number)=>!outline&&index===total-1?<SupplementaryRows slug={course.slug} lessons={lessons}/>:undefined;
 // Con un solo módulo base (o con contenido editable) el encabezado es el del propio índice, como en los cursos base.
 const ownHeading=!course.comingSoon&&(!!outline||modules.length===1||(!modules.length&&lessons.length>0));
 return <article className="course-detail"><Link className="text-link" href="/courses">← Cursos</Link>
  {!ownHeading&&<><CourseHeading course={course}/>{toolbar}</>}
  {course.comingSoon?<section className="course-soon-panel" role="status" aria-labelledby="course-soon-title"><div className="course-soon-card"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M6 40h36M10 40V22l14-11 14 11v18M19 40V30h10v10" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"/><path d="M30 8l4 4M36 6l-2 6" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"/></svg><div><h2 id="course-soon-title">En construcción</h2><p>Muy pronto estará listo… Estamos preparando las clases, prácticas y evaluaciones de este curso.</p><p className="hint">Puedes añadirlo a tu ruta desde ahora; te esperará cuando se publique. Mientras tanto, empieza por <Link href="/courses/fundamentos">Fundamentos del Testing</Link>.</p></div></div></section>
  :<>
   {outline&&<OutlineIndex outline={outline} course={course} lessons={lessons} actions={toolbar}/>}
   {/* El contenido editable publicado reemplaza al índice del módulo base (como en SPEC-CONTENT-330): un solo índice. */}
   {!outline&&modules.map((detail,i)=><div className="course-module" key={detail.module.id}><ModuleDetail {...detail} actions={!outline&&modules.length===1?toolbar:undefined} extraRows={extras(i,modules.length)}/></div>)}
   {!outline&&!modules.length&&(lessons.length?<LessonsIndex course={course} lessons={lessons} actions={toolbar}/>:<p className="course-empty">Este curso aún no tiene contenido publicado.</p>)}
  </>}
  {!course.comingSoon&&course.assignments.some(ref=>ref.kind==='SCRUM')&&<section className="practice-banner"><h2>Aprende con el equipo Scrum</h2><p>Conserva la introducción, actividades y evaluación que ya utilizas.</p><div className="practical-actions"><Link className="button button-primary" href="/scrum">Estudiar Equipo y Scrum ↗</Link></div></section>}
  {!course.comingSoon&&course.assignments.some(ref=>ref.kind==='CTFL')&&<section className="practice-banner"><h2>Estudio y preparación CTFL</h2><p>Consulta capítulos, ejercicios y simulacro con tus resultados anteriores. Su avance se muestra en la experiencia de certificación.</p><div className="practical-actions"><Link className="button button-primary" href="/certification/istqb">Abrir preparación CTFL ↗</Link></div></section>}
 </article>;
}
