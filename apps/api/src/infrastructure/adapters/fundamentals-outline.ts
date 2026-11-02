import {contentSnapshot,foundationAnswerKeys} from '@qapath/content';
import type {CourseOutline,OutlineCard,OutlineQuestion} from '@qapath/learning';
/** Bloques de lectura de Fundamentos v2 (SPEC-CONTENT-240) usados por la conversión. */
type Block={kind:string;text?:string;title?:string;items?:unknown[];ordered?:boolean;caption?:string;columns?:string[];rows?:string[][];tone?:string;steps?:string[];code?:string;variants?:{label:string;filename:string;code:string}[]};
type FoundationCard={id:string;title:string;objective:string;context:string;explanation:string;content?:Block[];aside?:Block[];focus?:string[];levelFocus?:string;example:{situation:string;qaDecision:string;evidence:string};checks:{id:string;question:string;options:{id:string;text:string}[]}[]};
type FoundationChapter={id:string;number:number;title:string;outcome:string;intro?:Block[];cards:FoundationCard[];typesMap?:boolean;levelsMap?:boolean;
 opening?:{story:string[];question:string;answer:string};objectives?:string[];teamCase?:{who:string;what:string;evidence:string}[];
 diagram?:{id?:string;title:string;mermaid?:string;relations?:unknown[];alternative?:string};balloons?:{title:string;states:unknown[]};activity?:{title:string};
 transfer?:{prompt:string;rubric:string[]};closing?:{summary:string[];glossary:{term:string;meaning:string}[];next:string};sources?:{title:string;url:string}[]};
type FoundationWeek={week:number;title:string;summary:string;chapters:FoundationChapter[]};
const cell=(text:string)=>text.replace(/\|/g,'\\|').replace(/\n/g,' ');
/** Bloque → Markdown (texto plano con énfasis **…**, sin HTML). */
export function blockMarkdown(block:Block):string{
 switch(block.kind){
  case 'h':return `### ${block.text}`;
  case 'p':return block.text??'';
  case 'list':return `${block.title?`**${block.title}**\n\n`:''}${(block.items??[]).map((item,i)=>`${block.ordered?`${i+1}.`:'-'} ${String(item)}`).join('\n')}`;
  case 'table':return `${block.caption?`**${block.caption}**\n\n`:''}| ${(block.columns??[]).map(cell).join(' | ')} |\n| ${(block.columns??[]).map(()=>'---').join(' | ')} |\n${(block.rows??[]).map(row=>`| ${row.map(cell).join(' | ')} |`).join('\n')}`;
  case 'callout':return `> **${block.title}** ${block.text??''}`;
  case 'flow':return `${block.caption?`**${block.caption}**\n\n`:''}${(block.steps??[]).map((step,i)=>`${i+1}. ${step}`).join('\n')}`;
  case 'code':return `${block.caption?`**${block.caption}**\n\n`:''}\`\`\`\n${block.code}\n\`\`\``;
  case 'facts':return (block.items as [string,string][]??[]).map(([label,value])=>`- **${label}:** ${value}`).join('\n');
  case 'gherkin':return (block.variants??[]).slice(0,1).map(v=>`${block.caption?`**${block.caption}**\n\n`:''}\`\`\`gherkin\n${v.code}\n\`\`\``).join('');
  default:return '';
 }
}
type Visual=OutlineCard['visuals'][number];
/** Bloque enriquecido ```qapath-…``` (lo dibujan los mismos componentes de Fundamentos en la lectura enfocada). */
/** JSON legible para editar: objetos en varias líneas; listas cortas de valores en una sola línea. */
function pretty(value:unknown,indent=''):string{
 const inner=indent+' ';
 const flat=(v:unknown):boolean=>v===null||typeof v!=='object'||(Array.isArray(v)&&v.every(x=>x===null||typeof x!=='object'));
 if(Array.isArray(value)){
  if(value.every(flat)&&JSON.stringify(value).length<=100)return JSON.stringify(value);
  return `[\n${value.map(v=>inner+pretty(v,inner)).join(',\n')}\n${indent}]`;
 }
 if(value&&typeof value==='object')return `{\n${Object.entries(value).map(([k,v])=>`${inner}${JSON.stringify(k)}: ${pretty(v,inner)}`).join(',\n')}\n${indent}}`;
 return JSON.stringify(value);
}
const fence=(language:string,data:unknown)=>`\`\`\`${language}\n${typeof data==='string'?data:pretty(data)}\n\`\`\``;
const visual=(filename:string,data:Record<string,unknown>):Visual=>({filename,kind:'interaction',content:JSON.stringify({type:'fundamentos',...data},null,1)});
const join=(parts:(string|false|undefined)[])=>parts.filter(Boolean).join('\n\n');
const two=(n:number)=>String(n).padStart(2,'0');
/** Columna derecha de la tarjeta, igual que en Fundamentos: bloques de apoyo, pirámide de niveles o mapa de tipos (con su foco). */
function cardVisuals(chapter:FoundationChapter,source:FoundationCard):Visual[]{
 if(source.aside?.length)return [visual('ejemplo de la tarjeta.json',{view:'bloques',blocks:source.aside})];
 if(chapter.levelsMap)return [visual('niveles de prueba.json',{view:'levels-pyramid',compact:true,...(source.levelFocus?{focus:source.levelFocus}:{})})];
 if(chapter.typesMap)return [visual('mapa del capitulo.json',{view:'types-map',...(source.focus?{focus:source.focus}:{})})];
 return [];
}
function card(chapter:FoundationChapter,source:FoundationCard):OutlineCard{
 return {id:source.id,title:source.title,visuals:cardVisuals(chapter,source),text:join([
  fence('qapath-encabezado',{objective:source.objective,context:source.context}),
  fence('qapath-destacado',source.explanation),
  !!source.content?.length&&fence('qapath-bloques',source.content),
  !!source.content?.length&&'## Así se ve en ReservaYa',
  fence('qapath-ejemplo',source.example),
 ])};
}
/** Apertura del capítulo: datos, la escena, su pregunta, resultados de aprendizaje y la introducción. */
function opening(chapter:FoundationChapter):OutlineCard{
 const facts=(chapter.intro??[]).filter(b=>b.kind==='facts'),rest=(chapter.intro??[]).filter(b=>b.kind!=='facts');
 const story=chapter.opening?.story??[];
 return {id:`${chapter.id}-apertura`,title:chapter.title,
  visuals:chapter.typesMap?[visual('mapa del capitulo.json',{view:'types-map'})]:chapter.levelsMap?[visual('niveles de prueba.json',{view:'levels-pyramid'})]:[],
  text:join([
   !!facts.length&&fence('qapath-bloques',facts),
   !!chapter.intro&&!!story.length&&'## La escena',
   story[0]&&fence('qapath-destacado',story[0]),
   ...story.slice(1),
   chapter.opening?.question&&fence('qapath-pregunta',{question:chapter.opening.question,answer:chapter.opening.answer}),
   !!chapter.objectives?.length&&`## ${chapter.intro?'Resultados de aprendizaje':'Al terminar podrás'}\n\n${chapter.objectives!.map((o,i)=>`${i+1}. ${o}`).join('\n')}`,
   !!rest.length&&fence('qapath-bloques',rest),
  ])};
}
/** Pasos posteriores a las tarjetas, en el mismo orden que la lectura original. */
function after(chapter:FoundationChapter):OutlineCard[]{
 const label=`Capítulo ${two(chapter.number)}`,cards:OutlineCard[]=[];
 const add=(suffix:string,title:string,text:string)=>cards.push({id:`${chapter.id}-${suffix}`,title,text,visuals:[]});
 if(chapter.teamCase?.length)add('caso','Caso del equipo',fence('qapath-caso',chapter.teamCase));
 if(chapter.diagram)add('mapa','Mapa de relaciones',fence('qapath-mapa',chapter.diagram));
 if(chapter.balloons)add('aplica',`Así se aplica · ${chapter.balloons.title}`,fence('qapath-globos',chapter.balloons));
 if(chapter.activity)add('actividad',chapter.activity.title,fence('qapath-clasificador',chapter.activity));
 if(chapter.transfer)add('entregable','Llévalo a tu sprint',fence('qapath-entregable',chapter.transfer));
 add('cierre',`Cierre del ${label.toLowerCase()}`,join([chapter.closing&&fence('qapath-cierre',chapter.closing),!!chapter.sources?.length&&fence('qapath-fuentes',chapter.sources)])||`Terminaste el ${label.toLowerCase()}.`);
 return cards;
}
function questions(source:FoundationCard[]):OutlineQuestion[]{
 // Los minitests de Fundamentos son por tarjeta; en el editor se agrupan por capítulo (máximo 15).
 return source.flatMap(c=>c.checks).slice(0,15).map(check=>{
  const key=foundationAnswerKeys[check.id],correct=Math.max(0,check.options.findIndex(o=>o.id===key?.correct));
  return {id:check.id,question:check.question,options:check.options.map(o=>o.text),correct,explanation:(key?.feedback?.[key.correct]??'').replace(/^Correcto\.\s*/,'').slice(0,600)};
 });
}
/**
 * Copia editable de Fundamentos v2, fiel a la lectura original (no modifica el contenido publicado actual):
 * apertura → tarjetas → caso del equipo → mapa de relaciones → así se aplica → actividad → entregable → cierre, y minitest.
 */
export function fundamentalsOutline():CourseOutline{
 const weeks=Object.values((contentSnapshot.foundation as unknown as {weeks:Record<string,FoundationWeek>}).weeks).sort((a,b)=>a.week-b.week);
 return {weeks:weeks.map(week=>({id:`FND-W${two(week.week)}`,title:week.title,summary:week.summary.slice(0,8000),chapters:week.chapters.map(chapter=>({
  id:chapter.id,title:`Capítulo ${two(chapter.number)} · ${chapter.title}`.slice(0,160),outcome:chapter.outcome.slice(0,400),
  cards:[opening(chapter),...chapter.cards.map(c=>card(chapter,c)),...after(chapter)],quiz:questions(chapter.cards),
 }))}))};
}
