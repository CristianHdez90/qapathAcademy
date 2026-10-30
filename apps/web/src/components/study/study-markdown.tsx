'use client';
import Link from 'next/link';
import {useMemo} from 'react';
import ReactMarkdown,{type Components} from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {MermaidDiagram} from './lazy';
/**
 * Lección .md: Markdown + GFM (tablas, listas de tareas). El HTML crudo se muestra como texto (no se interpreta).
 * Los bloques ```mermaid se dibujan como diagramas. Los encabezados bajan un nivel: el título de la lección es el h1.
 */
function Anchor({href,children}:{href?:string;children?:React.ReactNode}){const external=!!href&&/^https?:/i.test(href);return <a href={href} {...(external?{target:'_blank',rel:'noopener noreferrer'}:{})}>{children}{external&&<span className="sr-only"> (abre en otra pestaña)</span>}</a>}
const components:Components={
 h1:({children})=><h2>{children}</h2>,h2:({children})=><h3>{children}</h3>,h3:({children})=><h4>{children}</h4>,h4:({children})=><h5>{children}</h5>,
 a:({href,children})=><Anchor href={href}>{children}</Anchor>,
 table:({children})=><div className="catalog-table-scroll"><table>{children}</table></div>,
 pre:({children})=><>{children}</>,
 code:({className,children})=>{
  const language=/language-([\w-]+)/.exec(className||'')?.[1],text=String(children??'').replace(/\n$/,'');
  if(language==='mermaid')return <MermaidDiagram code={text}/>;
  if(!language&&!text.includes('\n'))return <code>{children}</code>;
  return <pre className="study-code" data-language={language}><code>{text}</code></pre>;
 },
};
/**
 * `resolveHref` (opcional) traduce enlaces internos (capítulos/tarjetas del curso): URL → enlace interno,
 * `null` → texto sin enlace (p. ej. un .md que no está en el curso), `undefined` → enlace tal cual.
 */
export type HrefResolver=(href:string)=>string|null|undefined;
export function StudyMarkdown({source,resolveHref}:{source:string;resolveHref?:HrefResolver}){
 const resolved=useMemo<Components>(()=>!resolveHref?components:{...components,a:({href,children})=>{
  const target=href?resolveHref(href):undefined;
  if(target===null)return <span className="study-link-unresolved">{children}</span>;
  if(target)return <Link href={target} className="study-internal-link">{children}</Link>;
  return <Anchor href={href}>{children}</Anchor>;
 }},[resolveHref]);
 return <div className="study-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={resolved} skipHtml>{source}</ReactMarkdown></div>;
}
