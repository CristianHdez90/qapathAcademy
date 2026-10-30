import {useState} from 'react';
import type {ReactNode} from 'react';
import type {FoundationBlock,FoundationLevelFocus,FoundationTypesFocus} from '@qapath/contracts';

/** Énfasis seguro: solo `**negrita**` y `*cursiva*`; el texto nunca se interpreta como HTML. */
export function rich(text:string):ReactNode[]{
 return text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean).map((part,i)=>part.startsWith('**')?<strong key={i}>{part.slice(2,-2)}</strong>:part.startsWith('*')&&part.length>2?<em key={i}>{part.slice(1,-1)}</em>:part);
}

/** Lectura enriquecida de una tarjeta (SPEC-CONTENT-240): títulos, listas, tablas, avisos, flujos y pseudocódigo. */
export function FoundationRichContent({blocks}:{blocks:FoundationBlock[]}){
 return <div className="foundation-rich">{blocks.map((block,i)=>{
  switch(block.kind){
   case 'h':return <h3 key={i}>{block.text}</h3>;
   case 'p':return <p key={i}>{rich(block.text)}</p>;
   case 'list':{const items=block.items.map(item=><li key={item}>{rich(item)}</li>);return <div key={i} className="foundation-rich-list">{block.title&&<p className="foundation-rich-label">{block.title}</p>}{block.ordered?<ol>{items}</ol>:<ul>{items}</ul>}</div>;}
   case 'table':return <div key={i} className="foundation-table-scroll" tabIndex={0} role="region" aria-label={block.caption}><table><caption>{block.caption}</caption><thead><tr>{block.columns.map((column,c)=><th key={c} scope="col">{column}</th>)}</tr></thead><tbody>{block.rows.map((row,r)=><tr key={r}>{row.map((cell,c)=>c===0?<th key={c} scope="row">{rich(cell)}</th>:<td key={c} data-label={block.columns[c]||undefined} className={cell.startsWith('✓')?'is-yes':undefined}>{rich(cell)}</td>)}</tr>)}</tbody></table></div>;
   case 'callout':return <aside key={i} className={`foundation-callout tone-${block.tone}`} aria-label={block.title}><p className="foundation-rich-label">{block.tone==='key'?'★ ':block.tone==='warn'?'⚠ ':'ℹ '}{block.title}</p><p>{rich(block.text)}</p></aside>;
   case 'flow':return <figure key={i} className="foundation-flow"><figcaption>{block.caption}</figcaption><ol>{block.steps.map((step,s)=><li key={step}><span className="foundation-flow-step">{step}</span>{s<block.steps.length-1&&<span className="foundation-flow-arrow" aria-hidden="true">→</span>}</li>)}</ol></figure>;
   case 'gherkin':return <GherkinViewer key={i} caption={block.caption} variants={block.variants}/>;
   case 'facts':return <dl key={i} className="foundation-facts">{block.items.map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>;
   case 'code':return <figure key={i} className="foundation-pseudo"><figcaption>{block.caption}</figcaption><pre tabIndex={0}><code>{block.code}</code></pre></figure>;
  }
 })}</div>;
}

const AXES:{id:FoundationTypesFocus;label:string;items:string[]}[]=[
 {id:'scope',label:'Alcance',items:['E2E']},
 {id:'purpose',label:'Propósito de verificación',items:['Smoke','Sanity']},
 {id:'changes',label:'Cambios',items:['Re-test','Regresión']},
 {id:'approach',label:'Enfoque',items:['Exploratoria']},
 {id:'static',label:'¿Se ejecuta?',items:['Estática','Dinámica']},
];
/** Gráfica de los tipos de prueba (CTFL v4.0.1) y de los ejes con los que se combinan. Resalta el concepto de la tarjeta actual. */
export function TestTypesMap({focus=[]}:{focus?:FoundationTypesFocus[]}){
 const on=(id:FoundationTypesFocus)=>focus.includes(id);
 const node=(id:FoundationTypesFocus,title:string,hint:string,icon:string)=><div className={`types-node${on(id)?' is-focus':''}`} aria-current={on(id)?'true':undefined}><span className="types-node-icon" aria-hidden="true">{icon}</span><strong>{title}</strong><small>{hint}</small>{on(id)&&<span className="types-here">Estás aquí</span>}</div>;
 return <figure className="types-map" aria-labelledby="types-map-title">
  <figcaption id="types-map-title"><span className="eyebrow">MAPA DEL CAPÍTULO</span><strong>Pruebas de software</strong></figcaption>
  <p className="types-map-axis">¿Qué se evalúa?</p>
  <div className="types-pair">{node('functional','Funcionales','Qué hace el sistema','✓')}{node('nonfunctional','No funcionales','Cómo se comporta','◷')}</div>
  <p className="types-map-axis">¿En qué se basa el diseño?</p>
  <div className="types-pair">{node('blackbox','Caja negra','Desde la especificación','■')}{node('whitebox','Caja blanca','Desde la estructura interna','□')}</div>
  <p className="types-map-join"><span aria-hidden="true">↓</span> Ambos ejes pueden combinarse con</p>
  <ul className="types-axes">{AXES.map(axis=><li key={axis.id} className={on(axis.id)?'is-focus':undefined} aria-current={on(axis.id)?'true':undefined}><span>{axis.label}</span><span className="types-chips">{axis.items.map(item=><span key={item} className="types-chip">{item}</span>)}</span></li>)}</ul>
  <p className="types-map-note">Los cuatro tipos de CTFL v4.0.1 son funcional, no funcional, caja negra y caja blanca. Las filas inferiores son ejes didácticos, no subtipos.</p>
 </figure>;
}

type Diagram={title:string;relations:{from:string;to:string[]}[];alternative:string;groups?:{title:string;hint?:string;options:string[]}[];flow?:boolean};
const TONES=['tone-a','tone-b','tone-c','tone-d'];
/** Ramas alternativas («No: …», «No pasa: …») se distinguen por forma y texto, no solo por color. */
const chipClass=(item:string)=>/^No( pasa)?:/.test(item)?'rel-chip is-on is-alt':'rel-chip is-on';
/** Mapa de relaciones nativo (accesible, sin imagen): matriz por ejes, recorrido por pasos o relaciones origen → destino. */
export function RelationsMap({diagram}:{diagram:Diagram}){
 if(diagram.groups?.length){const groups=diagram.groups;
  return <div className="rel-map">
   <ul className="rel-legend" aria-label="Ejes del mapa">{groups.map((group,g)=><li key={group.title} className={TONES[g%4]}><strong>{group.title}</strong>{group.hint&&<small>{group.hint}</small>}<span className="rel-options">{group.options.map(option=><span key={option} className="rel-chip is-on">{option}</span>)}</span></li>)}</ul>
   <p className="rel-lead">Cada ejemplo toma <strong>un valor de cada eje</strong>. Los ejes se combinan: ninguno reemplaza a otro.</p>
   <div className="rel-matrix" role="table" aria-label={diagram.title}>
    <div className="rel-row rel-head" role="row"><span role="columnheader">Ejemplo</span>{groups.map((group,g)=><span key={group.title} role="columnheader" className={TONES[g%4]}>{group.title}</span>)}</div>
    {diagram.relations.map(relation=><div className="rel-row" role="row" key={relation.from}><span role="rowheader" className="rel-example">{relation.from}</span>
     {groups.map((group,g)=>{const chosen=group.options.filter(option=>relation.to.includes(option));return <span role="cell" key={group.title} className={`rel-cell ${TONES[g%4]}`} data-axis={group.title}><span className="sr-only">{group.title}: {chosen.join(', ')||'—'}</span>{group.options.map(option=><span key={option} aria-hidden="true" className={`rel-chip${chosen.includes(option)?' is-on':''}`}>{chosen.includes(option)?'● ':''}{option}</span>)}</span>})}
    </div>)}
   </div>
  </div>;}
 if(diagram.flow)return <ol className="rel-flow" aria-label={diagram.title}>{diagram.relations.map((relation,i)=><li key={relation.from} className={TONES[i%4]}><span className="rel-step" aria-hidden="true">{i+1}</span><div><strong>{relation.from}</strong><span className="rel-options">{relation.to.map(item=><span key={item} className={chipClass(item)}>{/^No( pasa)?:/.test(item)?'↩ ':''}{item}</span>)}</span></div></li>)}</ol>;
 return <ul className="rel-pairs" aria-label={diagram.title}>{diagram.relations.map((relation,i)=><li key={relation.from} className={TONES[i%4]}><strong className="rel-from">{relation.from}</strong><span className="rel-arrow" aria-hidden="true">→</span><span className="rel-options">{relation.to.map(item=><span key={item} className="rel-chip is-on">{item}</span>)}</span></li>)}</ul>;
}

/** Niveles CTFL v4.0.1 de la cima a la base (la base es la más numerosa y rápida). Roles habituales, no exclusivos. */
const LEVELS:{id:Exclude<FoundationLevelFocus,'roles'>;name:string;object:string;roles:string[];detail:{who:string;example:string;failure:string;evidence:string;techniques:string}}[]=[
 {id:'acceptance',name:'Aceptación',object:'Necesidad del negocio y del usuario',roles:['Clientes y usuarios','PO','QA'],detail:{who:'Clientes y usuarios validan; el PO decide; QA prepara escenarios y evidencia.',example:'Valeria y dos recepcionistas reservan turnos reales del lunes en staging.',failure:'El sistema cumple la especificación pero no resuelve la necesidad (por ejemplo, el comprobante confunde).',evidence:'Acta de aceptación con escenarios aprobados y observaciones de usuarios.',techniques:'Caja negra y basadas en la experiencia; funcional y usabilidad.'}},
 {id:'systemIntegration',name:'Integración de sistemas',object:'Interfaces con sistemas externos',roles:['QA','DEV','Operaciones'],detail:{who:'QA diseña; DEV y Operaciones preparan ambientes, credenciales de prueba y monitoreo.',example:'ReservaYa envía la confirmación al proveedor externo de notificaciones.',failure:'Contratos incompatibles, tiempos de espera, reintentos que duplican envíos.',evidence:'Trazas de la petición y respuesta del proveedor, registros de reintento.',techniques:'Caja negra sobre contratos; no funcional: fiabilidad y rendimiento.'}},
 {id:'system',name:'Sistema',object:'El sistema integrado completo',roles:['QA','DEV'],detail:{who:'QA lidera con apoyo de DEV para datos y diagnóstico.',example:'Reservar un turno desde la interfaz de punta a punta en el ambiente QA.',failure:'Reglas de negocio mal implementadas en el flujo completo, mensajes incorrectos.',evidence:'Casos ejecutados con resultado esperado vs. obtenido, capturas y respuestas API.',techniques:'Caja negra (particiones, valores límite, estados); funcional y no funcional.'}},
 {id:'componentIntegration',name:'Integración de componentes',object:'Interfaces entre componentes',roles:['DEV','QA'],detail:{who:'DEV automatiza; QA aporta casos de interfaz y datos límite.',example:'El servicio de reservas guarda en el repositorio y lee el turno ocupado.',failure:'Datos mal mapeados entre capas, transacciones incompletas, errores no propagados.',evidence:'Pruebas de integración en CI con base de datos de prueba.',techniques:'Caja negra y caja blanca sobre interfaces; mayormente funcional.'}},
 {id:'component',name:'Componente',object:'Función o clase aislada (unitaria)',roles:['DEV'],detail:{who:'DEV escribe y mantiene; QA puede revisar casos y cobertura.',example:'El validador de fecha rechaza un turno en el pasado.',failure:'Cálculos y condiciones erróneas en una unidad aislada.',evidence:'Pruebas unitarias en verde y reporte de cobertura de sentencias y ramas.',techniques:'Caja blanca (cobertura) y caja negra (valores límite).'}},
];
/** Gráfica de niveles de prueba: roles · pirámide · tipos · técnicas. Pasar el puntero, enfocar o pulsar un rol o una franja muestra su detalle. */
export function LevelsPyramid({focus,compact=false}:{focus?:FoundationLevelFocus;compact?:boolean}){
 const roles=focus==='roles';
 const [hover,setHover]=useState<number|null>(null),[pinned,setPinned]=useState<number|null>(null);
 const active=hover??pinned;
 const level=active!==null?LEVELS[active]:null;
 const panelId=compact?'levels-detail-c':'levels-detail';
 const toggle=(i:number)=>setPinned(value=>value===i?null:i);
 const bind=(i:number)=>({onMouseEnter:()=>setHover(i),onMouseLeave:()=>setHover(null),onFocus:()=>setHover(i),onBlur:()=>setHover(null),onClick:()=>toggle(i),onKeyDown:(event:React.KeyboardEvent)=>{if(event.key==='Escape'){setPinned(null);setHover(null)}},'aria-expanded':active===i,'aria-controls':panelId});
 return <figure className={`levels-map${compact?' is-compact':''}${active!==null?' has-active':''}`} aria-labelledby={compact?'levels-map-title-c':'levels-map-title'}>
  <figcaption id={compact?'levels-map-title-c':'levels-map-title'}><span className="eyebrow">{compact?'MAPA DEL CAPÍTULO':'NIVELES, ROLES, TIPOS Y TÉCNICAS'}</span><strong>Cinco niveles de prueba · CTFL v4.0.1</strong></figcaption>
  <div className="levels-grid">
   <div className="levels-col levels-pyramid-col">
    <div className="levels-col-head"><span className={`levels-roles-head${roles?' is-focus':''}`}>Roles</span><span>Niveles</span></div>
    <ol className="levels-pyramid">{LEVELS.map((item,i)=>{const on=focus===item.id,lit=active===i;return <li key={item.id} className={`levels-row lvl-${i}${on?' is-focus':''}${lit?' is-active':''}`} aria-current={on?'true':undefined}>
     <button type="button" className={`levels-roles${roles?' is-focus':''}`} aria-label={`Roles en ${item.name}: ${item.roles.join(', ')}. Ver detalle del nivel`} {...bind(i)}>{item.roles.map(role=><span key={role}>{role}</span>)}</button>
     <button type="button" className="levels-band" style={{['--w' as string]:`${50+i*12.5}%`}} aria-label={`Nivel ${item.name}. Ver detalle`} {...bind(i)}><strong>{item.name}</strong>{!compact&&<small>{item.object}</small>}{on&&<span className="types-here">Estás aquí</span>}</button>
    </li>})}</ol>
    <div id={panelId} className="levels-detail" role="region" aria-live="polite" aria-label="Detalle del nivel">
     {level?<><p className="levels-detail-title"><strong>{level.name}</strong>{pinned!==null&&<button type="button" className="text-link" onClick={()=>{setPinned(null);setHover(null)}}>Cerrar ✕</button>}</p>
      <dl><div><dt>Quién participa</dt><dd>{level.detail.who}</dd></div><div><dt>Ejemplo en ReservaYa</dt><dd>{level.detail.example}</dd></div><div><dt>Fallo que buscamos</dt><dd>{level.detail.failure}</dd></div><div><dt>Evidencia útil</dt><dd>{level.detail.evidence}</dd></div>{!compact&&<div><dt>Tipos y técnicas habituales</dt><dd>{level.detail.techniques}</dd></div>}</dl></>
     :<p className="levels-detail-hint">Pasa el puntero, enfoca o pulsa un <strong>rol</strong> o un <strong>nivel</strong> para ver quién participa, un ejemplo, el fallo que buscamos y la evidencia útil. Consultarlo no cuenta como lectura.</p>}
    </div>
    <p className="levels-note">Base amplia: muchas pruebas rápidas y aisladas. Cima: pocas, cercanas al negocio. Los roles son habituales, <strong>no exclusivos</strong>.</p>
   </div>
   {!compact&&<div className="levels-col">
    <p className="levels-col-title tone-types">Tipos de prueba</p>
    <div className="levels-card tone-types"><strong>Funcional</strong><p>Evalúa las funciones que el sistema debe realizar: <b>qué</b> hace.</p></div>
    <div className="levels-card tone-types"><strong>No funcional</strong><p>Evalúa características de calidad: <b>cómo</b> lo hace (rendimiento, seguridad, usabilidad…).</p></div>
    <p className="levels-hint">Ambos se aplican en <strong>cualquier nivel</strong>.</p>
   </div>}
   {!compact&&<div className="levels-col">
    <p className="levels-col-title tone-tech">Técnicas de diseño</p>
    <div className="levels-card tone-tech"><strong>Caja blanca</strong><p>Desde la estructura interna: se conoce el código.</p><span className="levels-chips"><span>Cobertura de sentencias</span><span>Cobertura de ramas</span></span></div>
    <div className="levels-card tone-tech"><strong>Caja negra</strong><p>Desde la especificación: entradas y salidas, sin ver el código.</p><span className="levels-chips"><span>Partición de equivalencia</span><span>Valores límite</span><span>Tablas de decisión</span><span>Transición de estados</span></span></div>
    <p className="levels-hint">Caja blanca es más frecuente en los niveles bajos; caja negra, en todos.</p>
   </div>}
  </div>
 </figure>;
}

const GHERKIN_SECTIONS=/^(\s*)(Característica|Antecedentes|Escenario|Esquema del escenario|Ejemplos|Regla|Feature|Background|Scenario Outline|Scenario|Examples|Rule)(:)(.*)$/;
const GHERKIN_STEPS=/^(\s*)(Dado|Cuando|Entonces|Y|Pero|Given|When|Then|And|But)(\s)(.*)$/;
/** Resalta cadenas «"…"» y parámetros «<…>» dentro de un paso. */
function gherkinText(text:string,key:string):ReactNode[]{
 return text.split(/("[^"]*"|<[^>]+>)/g).filter(Boolean).map((part,i)=>part.startsWith('"')?<span key={key+i} className="gk-string">{part.split(/(<[^>]+>)/g).map((sub,j)=>sub.startsWith('<')?<span key={j} className="gk-param">{sub}</span>:sub)}</span>:part.startsWith('<')?<span key={key+i} className="gk-param">{part}</span>:part);
}
function GherkinLine({line,header}:{line:string;header:boolean}){
 let m;
 if(/^\s*#/.test(line))return <span className={/language:/.test(line)?'gk-lang':'gk-comment'}>{line}</span>;
 if((m=line.match(GHERKIN_SECTIONS)))return <>{m[1]}<span className="gk-keyword">{m[2]}{m[3]}</span><span className="gk-title">{m[4]}</span></>;
 if((m=line.match(GHERKIN_STEPS)))return <>{m[1]}<span className="gk-step">{m[2]}</span>{m[3]}{gherkinText(m[4],'s')}</>;
 if(/^\s*\|/.test(line))return <>{line.split(/(\|)/g).map((cell,i)=>cell==='|'?<span key={i} className="gk-pipe">|</span>:<span key={i} className={header?'gk-th':'gk-td'}>{cell}</span>)}</>;
 return <span className="gk-narrative">{line}</span>;
}
/** Editor de solo lectura para archivos .feature: números de línea, resaltado y pestañas por idioma. */
export function GherkinViewer({caption,variants}:{caption:string;variants:{label:string;filename:string;code:string}[]}){
 const [tab,setTab]=useState(0);const variant=variants[tab]??variants[0];
 const lines=variant.code.split('\n');
 const isRow=(line?:string)=>!!line&&/^\s*\|/.test(line);
 return <figure className="gk-viewer" aria-label={caption}>
  <figcaption className="gk-caption">{caption}</figcaption>
  <div className="gk-window">
   <div className="gk-tabs" role="tablist" aria-label="Idioma del ejemplo">{variants.map((item,i)=><button key={item.label} type="button" role="tab" aria-selected={i===tab} className={`gk-tab${i===tab?' is-active':''}`} onClick={()=>setTab(i)}><span aria-hidden="true">≡</span> {item.filename}<small>{item.label}</small></button>)}</div>
   <pre className="gk-code" tabIndex={0} aria-label={`Contenido de ${variant.filename}`}><code>{lines.map((line,i)=>{const header=isRow(line)&&!isRow(lines[i-1]);return <span key={i} className="gk-line"><span className="gk-num" aria-hidden="true">{i+1}</span><span className="gk-src"><GherkinLine line={line} header={header}/>{'\n'}</span></span>})}</code></pre>
  </div>
 </figure>;
}
