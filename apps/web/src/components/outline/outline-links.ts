/**
 * SPEC-CONTENT-331 · Enlaces del índice (resumen de la semana y tarjetas) hacia capítulos y tarjetas en lectura enfocada.
 * Formatos admitidos en el Markdown:
 *  - [Tema](capitulo:3) · [Tema](tarjeta:12)       → por número (1, 2, 3…) dentro del curso o módulo
 *  - [Tema](capitulo:c1) · [Tema](tarjeta:k4) · [Tema](#c1) → por identificador
 *  - [Tema](C03-tema.md) · [Tema](./semana-1/C03-tema.md)  → por el .md de origen de la tarjeta, o «C03» = capítulo 3
 *  - [Tema](Pruebas de humo)                          → por título (sin tildes ni mayúsculas)
 * Los enlaces .md que no se resuelven se muestran como texto (nunca como enlace roto). http(s) y mailto se mantienen.
 */
type Card={id:string;title:string;source?:string};
type Chapter={id:string;title:string;cards:Card[]};
type Week={id:string;chapters:Chapter[]};
const MODULE_PREFIX=/^m[0-9a-f]{6}_/;
const slug=(text:string)=>text.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/\.(md|markdown)$/,'').replace(/^[a-z]?\d+[\s._-]+/,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const basename=(path:string)=>decodeURIComponent(path.split(/[?#]/)[0].split('/').pop()??'').toLowerCase();
const unprefixed=(id:string)=>id.replace(MODULE_PREFIX,'');
export type OutlineTarget={kind:'chapter'|'card';id:string};
/** Ámbito de la numeración: el contenido propio del curso o un módulo asignado (sus ids comparten prefijo). */
function scope(weeks:Week[],weekId?:string){
 const prefix=weekId?MODULE_PREFIX.exec(weekId)?.[0]??'':undefined;
 return prefix===undefined?weeks:weeks.filter(w=>(MODULE_PREFIX.exec(w.id)?.[0]??'')===prefix);
}
export function resolveOutlineTarget(href:string,weeks:Week[],weekId?:string):OutlineTarget|null{
 const raw=href.trim();if(!raw||/^(https?:|mailto:)/i.test(raw))return null;
 const all=scope(weeks,weekId),chapters=all.flatMap(w=>w.chapters),cards=chapters.flatMap(c=>c.cards);
 const anyChapters=weeks.flatMap(w=>w.chapters),anyCards=anyChapters.flatMap(c=>c.cards);
 const byId=(id:string):OutlineTarget|null=>{
  const chapter=chapters.find(c=>c.id===id||unprefixed(c.id)===id)??anyChapters.find(c=>c.id===id);if(chapter)return {kind:'chapter',id:chapter.id};
  const card=cards.find(c=>c.id===id||unprefixed(c.id)===id)??anyCards.find(c=>c.id===id);return card?{kind:'card',id:card.id}:null;
 };
 const scheme=/^(capitulo|capítulo|chapter|tarjeta|card):\s*(.+)$/i.exec(raw);
 if(scheme){
  const isChapter=/^cap|^chap/i.test(scheme[1]),value=scheme[2].trim();
  if(/^\d+$/.test(value)){const n=Number(value)-1;const item=isChapter?chapters[n]:cards[n];return item?{kind:isChapter?'chapter':'card',id:item.id}:null}
  const found=byId(value);if(found)return found;
  const s=slug(value);const item=isChapter?chapters.find(c=>slug(c.title)===s):cards.find(c=>slug(c.title)===s);
  return item?{kind:isChapter?'chapter':'card',id:item.id}:null;
 }
 if(raw.startsWith('#'))return byId(raw.slice(1));
 const file=basename(raw);
 if(/\.(md|markdown)$/.test(file)){
  const card=cards.find(c=>c.source&&basename(c.source)===file)??anyCards.find(c=>c.source&&basename(c.source)===file);
  if(card)return {kind:'card',id:card.id};
  const number=/^(?:c|cap|capitulo|chapter)[-_ ]?0*(\d{1,3})(?:\D|$)/i.exec(file);
  if(number){const chapter=chapters[Number(number[1])-1];if(chapter)return {kind:'chapter',id:chapter.id}}
  const s=slug(file);
  const chapter=chapters.find(c=>slug(c.title)===s);if(chapter)return {kind:'chapter',id:chapter.id};
  const titled=cards.find(c=>slug(c.title)===s);return titled?{kind:'card',id:titled.id}:null;
 }
 const direct=byId(raw);if(direct)return direct;
 const s=slug(raw);if(!s)return null;
 const chapter=chapters.find(c=>slug(c.title)===s);if(chapter)return {kind:'chapter',id:chapter.id};
 const card=cards.find(c=>slug(c.title)===s);return card?{kind:'card',id:card.id}:null;
}
export const targetHref=(base:string,target:OutlineTarget)=>`${base}?${target.kind}=${encodeURIComponent(target.id)}`;
/**
 * Resolutor para StudyMarkdown: devuelve la URL de lectura enfocada, `null` para mostrar el texto sin enlace,
 * o `undefined` para dejar el enlace tal cual (externo).
 */
export function outlineHrefResolver(base:string,weeks:Week[],weekId?:string){
 return (href:string):string|null|undefined=>{
  if(/^(https?:|mailto:)/i.test(href.trim()))return undefined;
  const target=resolveOutlineTarget(href,weeks,weekId);
  return target?targetHref(base,target):null;
 };
}

/**
 * SPEC-CONTENT-331 · Completa el curso desde el índice de una semana: cada enlace a un .md que aún no apunta a nada
 * crea un capítulo con una tarjeta (origen = ese .md). Los encabezados «SEMANA 0N» del índice deciden la semana destino
 * (se crea si falta). Con `files` (nombre .md → texto), también llena el texto de las tarjetas.
 */
type DraftCard={id:string;title:string;text:string;source?:string;visuals:unknown[]};
type DraftChapter={id:string;title:string;outcome:string;cards:DraftCard[];quiz:unknown[]};
type DraftWeek={id:string;title:string;summary:string;chapters:DraftChapter[]};
const LINK_RE=/\[([^\]]+)\]\(([^)\s]+)\)/g;
const WEEK_RE=/^\s*(?:#{1,6}\s*)?(?:\*\*)?\s*SEMANA\s*0*(\d{1,2})\b\s*[—–:-]?\s*(.*?)(?:\*\*)?\s*$/gim;
const plainTitle=(text:string)=>text.replace(/[*_`]/g,'').replace(/\s+/g,' ').trim().slice(0,160);
const fileNumber=(file:string)=>Number(/^(?:c|cap|capitulo|chapter)[-_ ]?0*(\d{1,3})(?:\D|$)/i.exec(file)?.[1]??9999);
export type IndexPlan<W>={weeks:W[];createdChapters:number;createdWeeks:number;filled:number;skipped:string[]};
export function completeFromIndex<W extends DraftWeek>(weeks:W[],weekId:string,newId:(prefix:string)=>string,files?:Map<string,string>):IndexPlan<W>{
 const current=weeks.findIndex(w=>w.id===weekId);
 const summary=weeks[current]?.summary??'';
 const headings=[...summary.matchAll(WEEK_RE)].map(m=>({pos:m.index??0,n:Number(m[1]),title:plainTitle(m[2]??'')}));
 const next:W[]=weeks.map(w=>({...w,chapters:w.chapters.map(c=>({...c,cards:c.cards.map(k=>({...k}))}))}));
 // Número de cada capítulo existente: el de su .md de origen o, si no tiene, su posición en el curso.
 const position=new Map(weeks.flatMap(w=>w.chapters).map((c,i)=>[c.id,i+1]));
 const numberOf=(c:DraftChapter)=>{const source=c.cards.find(k=>k.source)?.source;return source&&fileNumber(basename(source))!==9999?fileNumber(basename(source)):position.get(c.id)??9999};
 let createdChapters=0,createdWeeks=0,filled=0;const skipped:string[]=[];const seen=new Set<string>();
 const links=[...summary.matchAll(LINK_RE)].filter(m=>!/^(https?:|mailto:)/i.test(m[2])).map(m=>({text:m[1],href:m[2],pos:m.index??0,file:basename(m[2])}))
  .sort((a,b)=>a.pos-b.pos);
 for(const link of links){
  if(seen.has(link.href))continue;seen.add(link.href);
  const content=files?.get(link.file);
  const target=resolveOutlineTarget(link.href,next);
  if(target){
   // Ya existe: si se cargó su .md y la tarjeta está vacía, se llena.
   const card=target.kind==='card'?next.flatMap(w=>w.chapters).flatMap(c=>c.cards).find(k=>k.id===target.id):next.flatMap(w=>w.chapters).find(c=>c.id===target.id)?.cards[0];
   if(card&&content!==undefined&&!card.text.trim()){card.text=content;card.source??=link.file;filled++}
   continue;
  }
  if(!/\.(md|markdown)$/.test(link.file)){skipped.push(link.href);continue}
  const heading=[...headings].reverse().find(h=>h.pos<link.pos);
  let index=heading?heading.n-1:current;
  if(index<0)index=current;
  while(next.length<=index){next.push({id:newId('sem'),title:heading&&next.length===index&&heading.title.length>=3?heading.title:`Semana ${next.length+1}`,summary:'',chapters:[]} as unknown as W);createdWeeks++}
  const title=plainTitle(link.text).length>=3?plainTitle(link.text):plainTitle(link.file.replace(/\.(md|markdown)$/,'').replace(/[-_]+/g,' '));
  const chapter:DraftChapter={id:newId('cap'),title,outcome:'',cards:[{id:newId('card'),title,text:content??'',source:link.file,visuals:[]}],quiz:[]};
  // Se inserta respetando el número del archivo (C02 antes que C03).
  const list=next[index].chapters,n=fileNumber(link.file);
  const at=list.findIndex(c=>numberOf(c)>n);
  if(at<0)list.push(chapter);else list.splice(at,0,chapter);
  createdChapters++;if(content!==undefined)filled++;
 }
 return {weeks:next,createdChapters,createdWeeks,filled,skipped};
}
