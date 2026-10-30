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
