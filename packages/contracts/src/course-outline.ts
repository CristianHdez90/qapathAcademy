import {z} from 'zod';
/**
 * SPEC-CONTENT-330 · Contenido del curso en modo enfocado: Semanas → Capítulos → Tarjetas (+ minitest por capítulo).
 * El ADMIN edita un borrador con vista previa y lo publica; los estudiantes leen una tarjeta a la vez.
 */
export const OUTLINE_LIMITS={weeks:24,chapters:20,cards:60,visuals:6,questions:15,options:6,text:20_000,bytes:1_800_000};
export const OUTLINE_PASS_PERCENT=70;
const id=z.string().regex(/^[A-Za-z0-9_-]{1,64}$/,'Identificador inválido.');
const line=(max:number,min=0)=>z.string().trim().min(min).max(max);
export const outlineVisualSchema=z.object({filename:z.string().min(3).max(120),kind:z.enum(['mermaid','interaction','svg']).optional(),content:z.string().min(1).max(320_000)}).strict();
export const outlineCardSchema=z.object({id,title:line(160,3),text:z.string().max(OUTLINE_LIMITS.text),visuals:z.array(outlineVisualSchema).max(OUTLINE_LIMITS.visuals)}).strict();
export const outlineQuestionSchema=z.object({id,question:line(400,3),options:z.array(line(240,1)).min(2).max(OUTLINE_LIMITS.options),correct:z.number().int().min(0),explanation:line(600)}).strict()
 .refine(q=>q.correct<q.options.length,{message:'La respuesta correcta debe ser una de las opciones.',path:['correct']});
export const outlineChapterSchema=z.object({id,title:line(160,3),outcome:line(400),cards:z.array(outlineCardSchema).max(OUTLINE_LIMITS.cards),quiz:z.array(outlineQuestionSchema).max(OUTLINE_LIMITS.questions)}).strict();
export const outlineWeekSchema=z.object({id,title:line(160,3),summary:line(400),chapters:z.array(outlineChapterSchema).max(OUTLINE_LIMITS.chapters)}).strict();
export const courseOutlineSchema=z.object({weeks:z.array(outlineWeekSchema).max(OUTLINE_LIMITS.weeks)}).strict().superRefine((outline,ctx)=>{
 const ids=new Set<string>();
 const check=(value:string,path:(string|number)[])=>{if(ids.has(value))ctx.addIssue({code:'custom',message:`Identificador repetido: ${value}`,path});ids.add(value)};
 outline.weeks.forEach((w,wi)=>{check(w.id,['weeks',wi,'id']);w.chapters.forEach((c,ci)=>{check(c.id,['weeks',wi,'chapters',ci,'id']);c.cards.forEach((card,ki)=>check(card.id,['weeks',wi,'chapters',ci,'cards',ki,'id']));c.quiz.forEach((q,qi)=>check(q.id,['weeks',wi,'chapters',ci,'quiz',qi,'id']))})});
});
export type OutlineVisual=z.infer<typeof outlineVisualSchema>;
export type OutlineCard=z.infer<typeof outlineCardSchema>;
export type OutlineQuestion=z.infer<typeof outlineQuestionSchema>;
export type OutlineChapter=z.infer<typeof outlineChapterSchema>;
export type OutlineWeek=z.infer<typeof outlineWeekSchema>;
export type CourseOutline=z.infer<typeof courseOutlineSchema>;
export const outlineDraftSchema=z.object({expectedRevision:z.number().int().min(0),outline:courseOutlineSchema}).strict();
export const outlineRevisionSchema=z.object({expectedRevision:z.number().int().min(0)}).strict();
export const outlineGradeSchema=z.object({answers:z.record(id,z.number().int().min(0).max(OUTLINE_LIMITS.options-1))}).strict();
export const outlineReadSchema=z.object({cardIds:z.array(id).min(1).max(OUTLINE_LIMITS.cards)}).strict();
/** Versión pública: sin respuestas correctas ni explicaciones (se entregan al calificar). */
export type PublicOutlineQuestion={id:string;question:string;options:string[]};
export type PublicOutlineChapter=Omit<OutlineChapter,'quiz'>&{quiz:PublicOutlineQuestion[]};
export type PublicOutlineWeek=Omit<OutlineWeek,'chapters'>&{chapters:PublicOutlineChapter[]};
export type PublicCourseOutlineDTO={courseId:string;slug:string;title:string;revision:number;weeks:PublicOutlineWeek[]};
export type AdminCourseOutlineDTO={courseId:string;draft:CourseOutline;draftRevision:number;draftUpdatedAt:string|null;published:CourseOutline|null;publishedRevision:number;publishedAt:string|null;dirty:boolean};
export type OutlineGradeDTO={score:number;total:number;percent:number;passed:boolean;feedback:{questionId:string;correct:boolean;expected:number;explanation:string}[]};
export type OutlineProgressDTO={readCards:string[];passedChapters:Record<string,number>};
export const EMPTY_OUTLINE:CourseOutline={weeks:[]};
export const outlineCards=(outline:{weeks:{chapters:{cards:{id:string}[]}[]}[]})=>outline.weeks.flatMap(w=>w.chapters.flatMap(c=>c.cards));
