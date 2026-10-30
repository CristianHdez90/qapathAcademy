/** SPEC-CONTENT-330 · Contenido del curso por Semanas → Capítulos → Tarjetas, con minitest por capítulo. */
import {CatalogError} from './course-catalog';
import type {StudyFileValidator} from './course-lessons';
export type OutlineVisual={filename:string;kind?:'mermaid'|'interaction'|'svg';content:string};
export type OutlineCard={id:string;title:string;text:string;source?:string;visuals:OutlineVisual[]};
export type OutlineQuestion={id:string;question:string;options:string[];correct:number;explanation:string};
export type OutlineChapter={id:string;title:string;outcome:string;cards:OutlineCard[];quiz:OutlineQuestion[]};
export type OutlineWeek={id:string;title:string;summary:string;chapters:OutlineChapter[]};
export type CourseOutline={weeks:OutlineWeek[]};
/** Dueño del contenido: un curso (contenido propio) o un módulo propio reutilizable. */
export type OutlineOwner={kind:'course'|'module';id:string};
export type OutlineState={courseId:string;title:string;draft:CourseOutline|null;draftRevision:number;draftUpdatedAt:Date|null;published:CourseOutline|null;publishedRevision:number;publishedAt:Date|null};
export type OutlineProgress={readCards:string[];passedChapters:Record<string,number>};
export const PASS_PERCENT=70;
export const OUTLINE_BYTES=1_800_000;
/** Valida y normaliza las gráficas de cada tarjeta con el mismo verificador de archivos de estudio. */
export function normalizeOutline(outline:CourseOutline,validate:StudyFileValidator):CourseOutline{
 const weeks=outline.weeks.map(week=>({...week,chapters:week.chapters.map(chapter=>({...chapter,cards:chapter.cards.map(card=>({...card,text:card.text.replace(/\r\n?/g,'\n'),visuals:card.visuals.map(visual=>{
  const result=validate(visual.filename,visual.content);
  if(!result.ok)throw new CatalogError('INVALID',`«${card.title}» · ${visual.filename}: ${result.message}`);
  if(result.kind==='markdown')throw new CatalogError('INVALID',`«${card.title}» · ${visual.filename}: el texto .md va en el cuerpo de la tarjeta, no como gráfica.`);
  return {filename:visual.filename,kind:result.kind,content:result.content};
 })}))}))}));
 const normalized={weeks};
 if(JSON.stringify(normalized).length>OUTLINE_BYTES)throw new CatalogError('LIMIT','El contenido supera 1,8 MB. Divide el curso o reduce el tamaño de las gráficas.');
 return normalized;
}
export const countCards=(outline:CourseOutline)=>outline.weeks.reduce((n,w)=>n+w.chapters.reduce((m,c)=>m+c.cards.length,0),0);
export const findChapter=(outline:CourseOutline,chapterId:string)=>outline.weeks.flatMap(w=>w.chapters).find(c=>c.id===chapterId);
/** Versión pública: nunca expone la respuesta correcta ni la explicación antes de calificar. */
export function publicOutline(outline:CourseOutline){
 return outline.weeks.map(week=>({...week,chapters:week.chapters.map(chapter=>({...chapter,quiz:chapter.quiz.map(q=>({id:q.id,question:q.question,options:q.options}))}))}));
}
export function gradeChapter(chapter:OutlineChapter,answers:Record<string,number>){
 if(!chapter.quiz.length)throw new CatalogError('INVALID','Este capítulo no tiene minitest.');
 const feedback=chapter.quiz.map(q=>({questionId:q.id,correct:answers[q.id]===q.correct,expected:q.correct,explanation:q.explanation}));
 const score=feedback.filter(f=>f.correct).length,total=chapter.quiz.length,percent=Math.round(score*100/total);
 return {score,total,percent,passed:percent>=PASS_PERCENT,feedback};
}
export interface OutlineRepositoryPort{
 load(owner:OutlineOwner):Promise<OutlineState|undefined>;
 saveDraft(actor:string,owner:OutlineOwner,expectedRevision:number,outline:CourseOutline,action:string):Promise<number>;
 publish(actor:string,owner:OutlineOwner,expectedRevision:number):Promise<void>;
 unpublish(actor:string,owner:OutlineOwner):Promise<void>;
 /** Curso visible (publicado, catálogo, no «En construcción»): su contenido propio publicado + los módulos propios asignados, en orden. */
 published(slug:string):Promise<{courseId:string;slug:string;title:string;revision:number;outline:CourseOutline}|undefined>;
 progress(userId:string,courseId:string):Promise<OutlineProgress>;
 markRead(userId:string,courseId:string,cardIds:string[]):Promise<OutlineProgress>;
 recordQuiz(userId:string,courseId:string,chapterId:string,percent:number):Promise<OutlineProgress>;
}
