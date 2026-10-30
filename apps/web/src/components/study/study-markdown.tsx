'use client';
import ReactMarkdown,{type Components} from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {MermaidDiagram} from './lazy';
/**
 * Lección .md: Markdown + GFM (tablas, listas de tareas). El HTML crudo se muestra como texto (no se interpreta).
 * Los bloques ```mermaid se dibujan como diagramas. Los encabezados bajan un nivel: el título de la lección es el h1.
 */
const components:Components={
 h1:({children})=><h2>{children}</h2>,h2:({children})=><h3>{children}</h3>,h3:({children})=><h4>{children}</h4>,h4:({children})=><h5>{children}</h5>,
 a:({href,children})=>{const external=!!href&&/^https?:/i.test(href);return <a href={href} {...(external?{target:'_blank',rel:'noopener noreferrer'}:{})}>{children}{external&&<span className="sr-only"> (abre en otra pestaña)</span>}</a>},
 table:({children})=><div className="catalog-table-scroll"><table>{children}</table></div>,
 pre:({children})=><>{children}</>,
 code:({className,children})=>{
  const language=/language-([\w-]+)/.exec(className||'')?.[1],text=String(children??'').replace(/\n$/,'');
  if(language==='mermaid')return <MermaidDiagram code={text}/>;
  if(!language&&!text.includes('\n'))return <code>{children}</code>;
  return <pre className="study-code" data-language={language}><code>{text}</code></pre>;
 },
};
export function StudyMarkdown({source}:{source:string}){return <div className="study-markdown"><ReactMarkdown remarkPlugins={[remarkGfm]} components={components} skipHtml>{source}</ReactMarkdown></div>}
