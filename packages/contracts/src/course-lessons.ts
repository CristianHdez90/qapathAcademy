import {z} from 'zod';
/**
 * SPEC-CONTENT-320 · Contenido de estudio cargado por archivos.
 * .md (lección con bloques ```mermaid), .mmd (diagrama Mermaid), .json (interacción React Flow / Recharts) y .svg (imagen estática).
 * .drawio y .puml no se aceptan: deben exportarse a SVG antes de cargarse.
 */
export const STUDY_FILE_KINDS=['markdown','mermaid','interaction','svg'] as const;
export type StudyFileKind=typeof STUDY_FILE_KINDS[number];
export const STUDY_FILE_LIMITS:Record<StudyFileKind,number>={markdown:200_000,mermaid:50_000,interaction:200_000,svg:300_000};
export const MAX_FILES_PER_LESSON=30;
export const MAX_LESSONS_PER_COURSE=60;
export const STUDY_FILE_ACCEPT='.md,.markdown,.mmd,.mermaid,.json,.svg';
const EXPORT_HINT:Record<string,string>={
 drawio:'Los archivos .drawio deben exportarse a SVG: en diagrams.net usa Archivo → Exportar como → SVG y carga ese .svg.',
 puml:'Los archivos .puml deben exportarse a SVG: ejecuta «plantuml -tsvg archivo.puml» (o exporta desde tu editor) y carga ese .svg.',
};
EXPORT_HINT.plantuml=EXPORT_HINT.puml;EXPORT_HINT.dio=EXPORT_HINT.drawio;
const MERMAID_START=/^(flowchart|graph|sequenceDiagram|classDiagram|stateDiagram(-v2)?|erDiagram|journey|gantt|pie|quadrantChart|requirementDiagram|gitGraph|mindmap|timeline|sankey(-beta)?|xychart(-beta)?|block(-beta)?|packet(-beta)?|kanban|architecture(-beta)?|radar(-beta)?|treemap(-beta)?|C4Context|C4Container|C4Component|C4Dynamic|C4Deployment)\b/;

const text=(max:number,min=0)=>z.string().trim().min(min).max(max).refine(value=>!/[<>]|javascript:|[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/i.test(value),'Solo texto plano.');
const id=z.string().regex(/^[A-Za-z0-9_-]{1,40}$/,'Identificadores: letras, números, guion o guion bajo (máx. 40).');
/** Globo (balloon) que aparece al seleccionar un nodo. */
const balloon=z.object({title:text(120).optional(),text:text(1200,1),bullets:z.array(text(240,1)).max(8).optional()}).strict();
export const graphInteractionSchema=z.object({
 type:z.literal('graph'),title:text(120,3),description:text(400).optional(),
 direction:z.enum(['LR','TB']).default('LR'),
 nodes:z.array(z.object({id,label:text(80,1),group:z.enum(['primary','accent','info','warning','neutral']).default('neutral'),x:z.number().min(-5000).max(5000).optional(),y:z.number().min(-5000).max(5000).optional(),detail:balloon.optional()}).strict()).min(1).max(60),
 edges:z.array(z.object({from:id,to:id,label:text(60).optional(),animated:z.boolean().optional()}).strict()).max(120).default([]),
}).strict().superRefine((graph,ctx)=>{
 const ids=new Set<string>();
 for(const node of graph.nodes){if(ids.has(node.id))ctx.addIssue({code:'custom',message:`Nodo repetido: ${node.id}`});ids.add(node.id)}
 for(const edge of graph.edges)if(!ids.has(edge.from)||!ids.has(edge.to))ctx.addIssue({code:'custom',message:`La arista ${edge.from} → ${edge.to} apunta a un nodo inexistente.`});
});
const cell=z.union([z.number().finite(),text(80)]);
export const chartInteractionSchema=z.object({
 type:z.literal('chart'),title:text(120,3),description:text(400).optional(),
 chart:z.enum(['bar','line','area','pie']),xKey:z.string().regex(/^[A-Za-z0-9_]{1,40}$/),
 series:z.array(z.object({key:z.string().regex(/^[A-Za-z0-9_]{1,40}$/),label:text(60,1)}).strict()).min(1).max(6),
 data:z.array(z.record(z.string().regex(/^[A-Za-z0-9_]{1,40}$/),cell)).min(1).max(200),
 unit:text(12).optional(),
}).strict().superRefine((chart,ctx)=>{
 if(chart.chart==='pie'&&chart.series.length!==1)ctx.addIssue({code:'custom',message:'Una gráfica de torta usa exactamente una serie.'});
 chart.data.forEach((row,index)=>{if(!(chart.xKey in row))ctx.addIssue({code:'custom',message:`Fila ${index+1}: falta «${chart.xKey}».`});for(const serie of chart.series)if(typeof row[serie.key]!=='number')ctx.addIssue({code:'custom',message:`Fila ${index+1}: «${serie.key}» debe ser numérico.`})});
});
export type GraphInteraction=z.infer<typeof graphInteractionSchema>;
export type ChartInteraction=z.infer<typeof chartInteractionSchema>;
export type StudyInteraction=GraphInteraction|ChartInteraction;

export type StudyFileCheck={ok:true;kind:StudyFileKind;content:string}|{ok:false;message:string};
const extension=(filename:string)=>filename.toLowerCase().split('.').pop()||'';
const ISSUE_ES:Record<string,string>={invalid_type:'falta o tiene un tipo inválido',too_small:'es demasiado corto o tiene pocos elementos',too_big:'es demasiado largo o tiene demasiados elementos',invalid_value:'tiene un valor no permitido',unrecognized_keys:'incluye campos no permitidos',invalid_union:'no tiene un formato válido',invalid_format:'no tiene un formato válido'};
const firstIssue=(error:z.ZodError)=>{const issue=error.issues[0];if(!issue)return 'Estructura inválida.';const message=issue.code==='custom'||/[áéíóúñ«]/i.test(issue.message)?issue.message:(ISSUE_ES[issue.code]??issue.message);return `${issue.path.length?`«${issue.path.join('.')}» `:''}${message}`};
/** Valida un archivo de estudio. Pura y compartida por el editor (vista previa) y la API (autoridad). */
export function checkStudyFile(filename:string,raw:string):StudyFileCheck{
 if(!/^[\w][\w .()-]{0,118}\.[A-Za-z]{2,8}$/.test(filename))return {ok:false,message:'Nombre de archivo inválido: usa letras, números, espacios, guiones o puntos (máx. 120).'};
 const ext=extension(filename);
 if(EXPORT_HINT[ext])return {ok:false,message:EXPORT_HINT[ext]};
 const kind:StudyFileKind|undefined=ext==='md'||ext==='markdown'?'markdown':ext==='mmd'||ext==='mermaid'?'mermaid':ext==='json'?'interaction':ext==='svg'?'svg':undefined;
 if(!kind)return {ok:false,message:`Formato .${ext} no admitido. Usa .md, .mmd, .json o .svg.`};
 const content=raw.replace(/^﻿/,'').replace(/\r\n?/g,'\n');
 if(!content.trim())return {ok:false,message:'El archivo está vacío.'};
 if(new TextEncoder().encode(content).length>STUDY_FILE_LIMITS[kind])return {ok:false,message:`El archivo supera ${Math.round(STUDY_FILE_LIMITS[kind]/1000)} KB.`};
 if(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(content))return {ok:false,message:'El archivo contiene caracteres binarios: carga texto UTF-8.'};
 if(kind==='mermaid'){
  const body=content.split('\n').filter(line=>!/^\s*(%%|$)/.test(line)).join('\n').replace(/^---[\s\S]*?\n---\n?/,'').trim();
  if(!MERMAID_START.test(body))return {ok:false,message:'El .mmd debe empezar con un tipo de diagrama Mermaid (flowchart, sequenceDiagram, classDiagram, stateDiagram, erDiagram, mindmap, timeline…).'};
  if(/%%\{\s*init|click\s+\w+\s+(call|href)|<script/i.test(content))return {ok:false,message:'El diagrama no puede incluir directivas init, eventos click ni scripts.'};
 }
 if(kind==='interaction'){
  let json:unknown;try{json=JSON.parse(content)}catch(error){return {ok:false,message:`JSON inválido: ${(error as Error).message}`}}
  const type=(json as {type?:unknown})?.type;
  const schema=type==='graph'?graphInteractionSchema:type==='chart'?chartInteractionSchema:undefined;
  if(!schema)return {ok:false,message:'El JSON debe declarar "type": "graph" (React Flow) o "type": "chart" (Recharts).'};
  const parsed=schema.safeParse(json);if(!parsed.success)return {ok:false,message:`Interacción inválida · ${firstIssue(parsed.error)}`};
  return {ok:true,kind,content:JSON.stringify(parsed.data,null,1)};
 }
 if(kind==='svg'){
  if(!/^\s*(<\?xml[^>]*>\s*)?(<!--[\s\S]*?-->\s*|<!DOCTYPE svg[^>\[]*>\s*)*<svg[\s>]/i.test(content)||!/<\/svg>\s*$/i.test(content))return {ok:false,message:'El .svg debe contener un único elemento <svg> completo.'};
  // Se muestra siempre como <img>: el navegador no ejecuta scripts ni carga recursos externos en ese modo. Aun así se rechaza lo activo.
  if(/<!DOCTYPE[^>]*\[|<!ENTITY|<script|<iframe|<embed|<object|\son[a-z]+\s*=|javascript:/i.test(content))return {ok:false,message:'El SVG contiene scripts, eventos o entidades. Expórtalo como SVG plano.'};
 }
 if(kind==='markdown'&&/<script|<iframe|javascript:/i.test(content))return {ok:false,message:'La lección no puede incluir scripts, iframes ni enlaces javascript:.'};
 return {ok:true,kind,content};
}
/** Título sugerido desde el primer encabezado # de un .md, o desde el nombre del archivo. */
export function suggestLessonTitle(filename:string,content:string){
 const heading=/^#\s+(.+)$/m.exec(content)?.[1]?.replace(/[*_`#]/g,'').trim();
 return (heading||filename.replace(/\.[^.]+$/,'').replace(/[-_]+/g,' ')).slice(0,160);
}

export const lessonStatusSchema=z.enum(['DRAFT','PUBLISHED','ARCHIVED']);
export const studyFileUploadSchema=z.object({filename:z.string().min(3).max(120),content:z.string().min(1).max(320_000)}).strict();
export const lessonInputSchema=z.object({title:z.string().trim().min(3).max(160),summary:z.string().trim().max(400).default(''),files:z.array(studyFileUploadSchema).max(MAX_FILES_PER_LESSON).default([])}).strict();
export const lessonUpdateSchema=z.object({
 revision:z.number().int().positive(),title:z.string().trim().min(3).max(160),summary:z.string().trim().max(400),status:z.enum(['DRAFT','PUBLISHED']),
 /** Orden final de la lección: archivos existentes ({id}) y nuevos ({filename,content}). Los existentes omitidos se retiran (no se borran). */
 files:z.array(z.union([z.object({id:z.string().uuid()}).strict(),studyFileUploadSchema])).max(MAX_FILES_PER_LESSON),
}).strict();
export const lessonReorderSchema=z.object({order:z.array(z.object({id:z.string().uuid(),revision:z.number().int().positive()}).strict()).min(1).max(MAX_LESSONS_PER_COURSE)}).strict();
export type StudyFileDTO={id:string;kind:StudyFileKind;filename:string;content:string;size:number;position:number};
export type LessonSummaryDTO={id:string;courseId:string;position:number;title:string;summary:string;status:z.infer<typeof lessonStatusSchema>;revision:number;fileCount:number;kinds:StudyFileKind[];updatedAt:string};
export type LessonDTO=LessonSummaryDTO&{files:StudyFileDTO[]};
