'use client';
import type {ReactNode} from 'react';
import type {FoundationBalloonState,FoundationBlock,FoundationClassifier,FoundationLevelFocus,FoundationTypesFocus} from '@qapath/contracts';
import {FoundationRichContent,LevelsPyramid,RelationsMap,TestTypesMap,rich} from '@/components/academy/foundation-rich';
import {StateBalloons} from '@/components/academy/state-balloons';
import {Classifier} from '@/components/academy/foundation-classifier';
import '@/components/academy/foundation-study.css';
/**
 * SPEC-CONTENT-331 · Bloques enriquecidos del contenido editable: reutilizan los componentes, el HTML y el CSS de Fundamentos v2.
 * En el Markdown de una tarjeta se escriben como bloques de código con lenguaje `qapath-…` y contenido JSON
 * (o texto, en `qapath-destacado`). Todo se muestra como texto de React: nada se interpreta como HTML.
 */
export const RICH_FENCES=['qapath-bloques','qapath-destacado','qapath-pregunta','qapath-encabezado','qapath-ejemplo','qapath-caso','qapath-mapa','qapath-globos','qapath-clasificador','qapath-entregable','qapath-cierre','qapath-fuentes'] as const;
type Diagram=Parameters<typeof RelationsMap>[0]['diagram']&{id?:string;mermaid?:string};
const str=(v:unknown)=>typeof v==='string'?v:'';
const arr=<T,>(v:unknown)=>Array.isArray(v)?v as T[]:[];
const bad=(language:string,message:string)=><p role="alert" className="study-error">Bloque {language}: {message}</p>;
function Fence({language,data}:{language:string;data:unknown}):ReactNode{
 const o=(data??{}) as Record<string,unknown>;
 switch(language){
  case 'qapath-bloques':return <FoundationRichContent blocks={arr<FoundationBlock>(data)}/>;
  case 'qapath-pregunta':return <details className="foundation-panel"><summary>{str(o.question)}</summary><p>{rich(str(o.answer))}</p></details>;
  case 'qapath-encabezado':return <><p className="foundation-meta"><span>Objetivo: {str(o.objective)}</span></p>{str(o.context)&&<p className="foundation-context"><strong>Contexto en ReservaYa.</strong> {str(o.context)}</p>}</>;
  case 'qapath-ejemplo':return <dl className="foundation-example"><div><dt>Situación</dt><dd>{str(o.situation)}</dd></div><div><dt>Decisión de QA</dt><dd>{str(o.qaDecision)}</dd></div><div><dt>Evidencia</dt><dd>{str(o.evidence)}</dd></div></dl>;
  case 'qapath-caso':return <ol className="foundation-case">{arr<{who:string;what:string;evidence:string}>(data).map((item,i)=><li key={i}><strong>{str(item.who)}</strong><span>{str(item.what)}</span><small>Evidencia: {str(item.evidence)}</small></li>)}</ol>;
  case 'qapath-mapa':{const d=data as Diagram;if(!Array.isArray(d?.relations)&&!Array.isArray(d?.groups))return bad(language,'faltan «relations» o «groups».');
   return <figure className="foundation-map foundation-diagram"><figcaption>{str(d.title)}</figcaption><RelationsMap diagram={d}/>{d.alternative&&<p className="rel-reading"><strong>Lectura del mapa:</strong> {d.alternative}</p>}
    {d.mermaid&&<details><summary>Consultar la fuente Mermaid</summary><pre tabIndex={0}><code>{d.mermaid}</code></pre></details>}</figure>;}
  case 'qapath-globos':return <StateBalloons flowId={`flow-${str(o.title).replace(/[^A-Za-z0-9]+/g,'-').slice(0,40)||'estados'}`} title={str(o.title)} states={arr<FoundationBalloonState>(o.states)}/>;
  case 'qapath-clasificador':{const a=data as FoundationClassifier;if(!Array.isArray(a?.items)||!Array.isArray(a?.axes))return bad(language,'faltan «axes» o «items».');return <Classifier activity={a}/>;}
  case 'qapath-entregable':return <><p className="focused-lead">{rich(str(o.prompt))}</p><h3>Criterios para revisarla</h3><ul className="bullet-list">{arr<string>(o.rubric).map(item=><li key={item}>{rich(str(item))}</li>)}</ul><p className="hint">Es un entregable formativo: guárdalo en tus notas o en tu portafolio.</p></>;
  case 'qapath-cierre':return <>{arr<string>(o.summary).length>0&&<ul className="bullet-list">{arr<string>(o.summary).map(item=><li key={item}>{rich(str(item))}</li>)}</ul>}
   {arr(o.glossary).length>0&&<><h3>Glosario</h3><dl className="foundation-glossary">{arr<{term:string;meaning:string}>(o.glossary).map(item=><div key={item.term}><dt>{str(item.term)}</dt><dd>{str(item.meaning)}</dd></div>)}</dl></>}
   {str(o.next)&&<p className="focused-callout">{str(o.next)}</p>}</>;
  case 'qapath-fuentes':return <><h3>Fuentes consultadas</h3><ul className="foundation-sources">{arr<{title:string;url:string;version?:string;consulted?:string}>(data).map(source=>{const safe=/^https:\/\//i.test(str(source.url));
   return <li key={source.url}>{safe?<a href={source.url} target="_blank" rel="noopener noreferrer">{str(source.title)} ↗</a>:<span>{str(source.title)}</span>}<small>{[str(source.version),source.consulted?`consultada ${str(source.consulted)}`:''].filter(Boolean).join(' · ')}</small></li>})}</ul></>;
 }
 return bad(language,'tipo desconocido.');
}
/** Bloque ```qapath-…``` dentro del Markdown. */
export function RichFence({language,source}:{language:string;source:string}){
 if(language==='qapath-destacado')return <p className="focused-lead">{rich(source.trim())}</p>;
 let data:unknown;
 try{data=JSON.parse(source)}catch{return bad(language,'el contenido debe ser JSON válido.')}
 return <div className="outline-rich" data-rich={language}>{Fence({language,data})}</div>;
}
/** Gráfica de la columna derecha (.json con "type":"fundamentos"): mapa de tipos, pirámide de niveles o bloques de apoyo. */
export type FundamentosVisual={type:'fundamentos';view:'types-map'|'levels-pyramid'|'bloques';focus?:FoundationTypesFocus[]|FoundationLevelFocus;compact?:boolean;blocks?:FoundationBlock[]};
export function FundamentosView({data}:{data:FundamentosVisual}){
 if(data.view==='types-map')return <TestTypesMap focus={Array.isArray(data.focus)?data.focus:[]}/>;
 if(data.view==='levels-pyramid')return <LevelsPyramid focus={typeof data.focus==='string'?data.focus:undefined} compact={data.compact}/>;
 return <FoundationRichContent blocks={data.blocks??[]}/>;
}
