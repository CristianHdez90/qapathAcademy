import {contentSnapshot,foundationAnswerKeys} from '@qapath/content';
import type {CourseOutline,OutlineCard,OutlineQuestion} from '@qapath/learning';
/** Bloques de lectura de Fundamentos v2 (SPEC-CONTENT-240) usados por la conversión. */
type Block={kind:string;text?:string;title?:string;items?:unknown[];ordered?:boolean;caption?:string;columns?:string[];rows?:string[][];tone?:string;steps?:string[];code?:string;variants?:{label:string;filename:string;code:string}[]};
type FoundationCard={id:string;title:string;objective:string;context:string;explanation:string;content?:Block[];aside?:Block[];example:{situation:string;qaDecision:string;evidence:string};checks:{id:string;question:string;options:{id:string;text:string}[]}[]};
type FoundationChapter={id:string;number:number;title:string;outcome:string;intro?:Block[];cards:FoundationCard[];diagram?:{title:string;mermaid?:string}};
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
function card(source:FoundationCard,mermaid?:{title:string;code:string}):OutlineCard{
 const parts=[`**Objetivo:** ${source.objective}`,`**Contexto:** ${source.context}`,source.explanation,...(source.content??[]).map(blockMarkdown),...(source.aside??[]).map(blockMarkdown),
  `### Ejemplo en ReservaYa\n\n- **Situación:** ${source.example.situation}\n- **Decisión de QA:** ${source.example.qaDecision}\n- **Evidencia:** ${source.example.evidence}`];
 return {id:source.id,title:source.title,text:parts.filter(Boolean).join('\n\n'),visuals:mermaid?[{filename:`${mermaid.title.replace(/[^\w .()-]+/g,' ').trim().slice(0,100)||'diagrama'}.mmd`,content:mermaid.code}]:[]};
}
function questions(source:FoundationCard[]):OutlineQuestion[]{
 // Los minitests de Fundamentos son por tarjeta; en el editor se agrupan por capítulo (máximo 15).
 return source.flatMap(c=>c.checks).slice(0,15).map(check=>{
  const key=foundationAnswerKeys[check.id],correct=Math.max(0,check.options.findIndex(o=>o.id===key?.correct));
  return {id:check.id,question:check.question,options:check.options.map(o=>o.text),correct,explanation:(key?.feedback?.[key.correct]??'').replace(/^Correcto\.\s*/,'').slice(0,600)};
 });
}
/** Copia editable de Fundamentos v2 para el editor de contenido (no modifica el contenido publicado actual). */
export function fundamentalsOutline():CourseOutline{
 const weeks=Object.values((contentSnapshot.foundation as unknown as {weeks:Record<string,FoundationWeek>}).weeks).sort((a,b)=>a.week-b.week);
 return {weeks:weeks.map(week=>({id:`FND-W${String(week.week).padStart(2,'0')}`,title:week.title,summary:week.summary.slice(0,400),chapters:week.chapters.map(chapter=>{
  const intro=(chapter.intro??[]).map(blockMarkdown).filter(Boolean).join('\n\n');
  const mermaid=chapter.diagram?.mermaid?{title:chapter.diagram.title,code:chapter.diagram.mermaid}:undefined;
  const cards=chapter.cards.map((c,i)=>card(c,i===0?mermaid:undefined));
  if(intro&&cards[0])cards[0]={...cards[0],text:`${intro}\n\n${cards[0].text}`};
  return {id:chapter.id,title:`Capítulo ${String(chapter.number).padStart(2,'0')} · ${chapter.title}`.slice(0,160),outcome:chapter.outcome.slice(0,400),cards,quiz:questions(chapter.cards)};
 })}))};
}
