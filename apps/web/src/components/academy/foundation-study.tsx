'use client';
import Link from 'next/link';
import {useEffect,useMemo,useState} from 'react';
import type {Week,StudyGuide,FoundationWeek,FoundationChapter,FoundationCard,FoundationClassifier} from '@qapath/contracts';
import {foundationChapters,foundationChapterPassed,FOUNDATION_PASS_RATIO} from '@qapath/progress';
import {useAuth} from '@/features/auth/auth-provider';
import {useProgress} from '@/features/progress/progress-provider';
import type {StudyStep} from '@/features/progress/study-steps';
import {useStudyNavigation} from '@/features/progress/use-study-navigation';
import {useCardReading} from '@/features/progress/use-card-reading';
import {STUDY_MODE_EVENT} from '@/features/progress/use-focused-study-mode';
import {ASK_LIA_EVENT} from '@/components/assistant/ask-lia';
import {CourseStudyMenu,CourseProgressPanel} from './course-study-menu';
import {FoundationRichContent,TestTypesMap,RelationsMap,LevelsPyramid} from './foundation-rich';
import courseTree from '@/features/navigation/learning-tree.json';
import {cardSuggestions,chapterSuggestions,stepSuggestions,publishReadingContext} from '@/features/assistant/reading-suggestions';
import {LearningSteps} from './learning-steps';
import {PracticalExercisePanel} from './practical-exercise';
import {SaveFeedback} from './save-feedback';
import {StudyDialog,STUDY_TOOL_EVENT,announceStudyTool} from './study-dialog';
import {FoundationCheckBlock} from './foundation-check';
import {StateBalloons} from './state-balloons';
import './focused-study.css';
import './foundation-study.css';

type Step=StudyStep&{chapterId?:string;card?:FoundationCard;part?:'opening'|'card'|'case'|'map'|'apply'|'activity'|'transfer'|'closing'|'pending'};
const anchor=(week:number,chapter:FoundationChapter)=>`FND-W0${week}-C${String(chapter.number).padStart(2,'0')}`;
function buildSteps(f:FoundationWeek,hasExercise:boolean):Step[]{
 const steps:Step[]=[{id:`FND-W0${f.week}-intro`,title:'Comienza esta semana',kind:'foundation'}];
 for(const chapter of f.chapters){
  const base=anchor(f.week,chapter),label=`Capítulo ${String(chapter.number).padStart(2,'0')}`;
  if(chapter.status!=='published'){steps.push({id:base,title:`${label} · ${chapter.title} (en preparación)`,kind:'foundation',chapterId:chapter.id,part:'pending'});continue;}
  steps.push({id:base,title:`${label} · ${chapter.title}`,kind:'foundation',chapterId:chapter.id,part:'opening'});
  for(const card of chapter.cards)steps.push({id:card.id,title:card.title,kind:'foundation',chapterId:chapter.id,card,part:'card'});
  if(chapter.teamCase)steps.push({id:`${base}-case`,title:'Caso del equipo',kind:'foundation',chapterId:chapter.id,part:'case'});
  if(chapter.diagram)steps.push({id:`${base}-map`,title:'Mapa de relaciones',kind:'foundation',chapterId:chapter.id,part:'map'});
  if(chapter.balloons)steps.push({id:`${base}-apply`,title:`Así se aplica · ${chapter.balloons.title}`,kind:'foundation',chapterId:chapter.id,part:'apply'});
  if(chapter.activity)steps.push({id:`${base}-activity`,title:chapter.activity.title,kind:'foundation',chapterId:chapter.id,part:'activity'});
  if(chapter.transfer)steps.push({id:`${base}-transfer`,title:'Llévalo a tu sprint',kind:'foundation',chapterId:chapter.id,part:'transfer'});
  steps.push({id:`${base}-closing`,title:`Cierre del ${label.toLowerCase()}`,kind:'foundation',chapterId:chapter.id,part:'closing'});
 }
 if(hasExercise)steps.push({id:'practical-exercise',title:'Práctica de la semana',kind:'exercise'});
 steps.push({id:'study-notes',title:'Mis notas',kind:'notes'},{id:'study-resources',title:'Recursos para profundizar',kind:'resources'},{id:'study-finish',title:'Fin del recorrido',kind:'finish'});
 return steps;
}

function CardView({card,cardIndex,total,typesMap=false,levelsMap=false}:{card:FoundationCard;cardIndex:number;total:number;typesMap?:boolean;levelsMap?:boolean}){
 const {region,recorded,attention}=useCardReading(card.id);
 const body=<>
  <div ref={region} className="foundation-card-body" data-card-read={recorded}>
   <p className="foundation-meta">Tarjeta {cardIndex+1} de {total} · <span>Objetivo: {card.objective}</span></p>
   <p className="foundation-context"><strong>Contexto en ReservaYa.</strong> {card.context}</p>
   <p className="focused-lead">{card.explanation}</p>
   {card.content&&<FoundationRichContent blocks={card.content}/>}
   {card.content&&<h3 className="foundation-example-title">Así se ve en ReservaYa</h3>}
   <dl className="foundation-example"><div><dt>Situación</dt><dd>{card.example.situation}</dd></div><div><dt>Decisión de QA</dt><dd>{card.example.qaDecision}</dd></div><div><dt>Evidencia</dt><dd>{card.example.evidence}</dd></div></dl>
  </div>
  <p className="foundation-reading" role="status">{recorded?'✓ Lectura de la tarjeta registrada':<>Lectura en curso<progress aria-label="Tiempo de atención en esta tarjeta" value={attention} max={1}/></>}</p>
  {card.checks.map((check,i)=><FoundationCheckBlock key={check.id} check={check} index={i} total={card.checks.length} cardRead={recorded}/>)}
 </>;
 if(!typesMap&&!levelsMap&&!card.aside?.length)return body;
 return <div className={`foundation-card-layout${card.aside?.length?' has-wide-aside':''}`}><div className="foundation-card-main">{body}</div><aside className="foundation-card-aside" aria-label={card.aside?.length?'Ejemplo de la tarjeta':levelsMap?'Mapa de los niveles de prueba':'Mapa de los tipos de prueba'}>{card.aside?.length?<FoundationRichContent blocks={card.aside}/>:levelsMap?<LevelsPyramid focus={card.levelFocus} compact/>:<TestTypesMap focus={card.focus}/>}</aside></div>;
}

function Classifier({activity}:{activity:FoundationClassifier}){
 const [answers,setAnswers]=useState<Record<string,Record<string,string>>>({}),[checked,setChecked]=useState(false);
 const complete=activity.items.every(item=>activity.axes.every(axis=>answers[item.id]?.[axis.id]));
 return <div className="foundation-activity"><p>{activity.prompt}</p>
  {activity.items.map(item=><fieldset key={item.id} className="foundation-activity-item"><legend>{item.text}</legend><div className="foundation-axes">{activity.axes.map(axis=>{
   const value=answers[item.id]?.[axis.id]||'',right=value===item.answers[axis.id];
   return <label key={axis.id}>{axis.label}<select value={value} onChange={event=>{setChecked(false);setAnswers(old=>({...old,[item.id]:{...old[item.id],[axis.id]:event.target.value}}))}}><option value="">Elige…</option>{axis.options.map(option=><option key={option.id} value={option.id}>{option.label}</option>)}</select>{checked&&value&&<small className={right?'good':'bad'}>{right?'✓':'✗'} {right?'Correcto':`Revisa: ${axis.options.find(o=>o.id===item.answers[axis.id])?.label}`}</small>}</label>;
  })}</div>{checked&&<p className="hint">{item.feedback}</p>}</fieldset>)}
  <div className="foundation-actions"><button type="button" className="button button-primary" disabled={!complete} onClick={()=>setChecked(true)}>Comprobar clasificación</button><button type="button" className="button button-outline" onClick={()=>{setAnswers({});setChecked(false)}}>Reiniciar actividad</button></div>
  <p className="hint" role="status">{checked?'Revisa el feedback de cada eje. Esta actividad es formativa: no afecta tu progreso.':complete?'Listo para comprobar.':'Completa los tres ejes de cada prueba.'}</p>
 </div>;
}

/** Fundamentos v2 (SPEC-CONTENT-220): una tarjeta a la vez y un minitest por tarjeta. */
export function FoundationStudy({week,guide,foundation}:{week:Week;guide:StudyGuide;foundation:FoundationWeek}){
 const {user,loading}=useAuth();const {state,ready,remote,saveNote,flushNote}=useProgress();
 const steps=useMemo(()=>buildSteps(foundation,!!guide.exercise),[foundation,guide.exercise]);
 const {active,go,notice,root}=useStudyNavigation(week.id,`${user?.id||'guest'}:${user?.role||'guest'}:fnd-v2`,steps,flushNote,!loading);
 const [tool,setTool]=useState<'menu'|'index'|'assistant'|null>(null);
 const index=Math.max(0,steps.findIndex(step=>step.id===active)),step=steps[index];
 const chapter=foundation.chapters.find(item=>item.id===step.chapterId);
 const rules=foundationChapters(week.id),rule=rules.find(item=>item.id===step.chapterId);
 const complete=state.weeks.includes(week.id);
 const close=()=>{setTool(null);announceStudyTool(null)};
 useEffect(()=>{
  window.dispatchEvent(new Event(STUDY_MODE_EVENT));
  const sync=(event:Event)=>setTool((event as CustomEvent<{tool:'menu'|'index'|'assistant'|null}>).detail.tool);
  window.addEventListener(STUDY_TOOL_EVENT,sync);return()=>{window.removeEventListener(STUDY_TOOL_EVENT,sync);window.dispatchEvent(new Event(STUDY_MODE_EVENT))};
 },[]);
 const open=(next:'menu'|'index')=>{announceStudyTool(next);setTool(next)};
 const checksOf=(c:FoundationChapter)=>c.cards.flatMap(card=>card.checks.map(check=>check.id));
 const label=step.part==='card'||step.chapterId?`CAPÍTULO ${String(chapter?.number??0).padStart(2,'0')}`:'TU RECORRIDO';
 const courseTitle=courseTree.find(item=>item.id===week.module)?.title??week.module;
 const readingHints=step.card?cardSuggestions(courseTitle,step.card):chapter?chapterSuggestions(courseTitle,chapter,step.part??'opening'):stepSuggestions(courseTitle,week.id,step.title);
 const readingPrompt=`Estoy estudiando el curso «${courseTitle}», semana ${week.id}: ${step.title}. Ayúdame a comprenderlo con un ejemplo de QA, sin darme la respuesta del minitest.`;
 useEffect(()=>{publishReadingContext({topic:step.title,week:week.id,prompt:readingPrompt,suggestions:readingHints})},[step.id,week.id]);// eslint-disable-line react-hooks/exhaustive-deps
 return <div className="focused-study foundation-study" data-study-week={week.id} data-foundation-version={foundation.version}>
  <header className="focused-header"><Link href={`/courses/${week.module}`} className="text-link">← Volver al curso</Link><span className="pill">Fundamentos · ISTQB CTFL v4.0.1</span><div><p className="eyebrow">SEMANA {String(week.id).padStart(2,'0')} · {guide.level}</p><h1>{foundation.title}</h1></div><p className="focused-navigation-status" aria-live="polite" aria-atomic="true">Paso {index+1} de {steps.length} · {step.title}</p><progress aria-label="Posición en la semana, no progreso académico" value={index+1} max={steps.length}/></header>
  {notice&&<p role="status" className="feedback bad">{notice}</p>}
  <section ref={root} className="focused-card" data-study-step={step.id} aria-labelledby="focused-step-title">
   <p className="chapter-label">{label} · {index+1} / {steps.length}</p>
   <h2 id="focused-step-title" data-study-title tabIndex={-1}>{step.part==='card'&&chapter?step.title:step.part==='opening'&&chapter?chapter.title:step.title}</h2>
   {step.id.endsWith('-intro')&&<><p className="focused-lead">{foundation.summary}</p><LearningSteps week={week.id} focused/><div className="focused-callout"><strong>Cómo funciona</strong><p>Lees una tarjeta a la vez. Al terminarla aparece su minitest: aprueba al menos el {Math.round(FOUNDATION_PASS_RATIO*100)} % de cada capítulo. Tus notas y prácticas anteriores se conservan.</p></div><ol className="foundation-chapter-list">{foundation.chapters.map(item=>{const r=rules.find(x=>x.id===item.id);return <li key={item.id}><a href={`#${anchor(week.id,item)}`} onClick={event=>{event.preventDefault();go(anchor(week.id,item))}}>Capítulo {String(item.number).padStart(2,'0')} · {item.title}</a><small>{item.status!=='published'?'En preparación':r&&foundationChapterPassed(state,r)?'✓ Aprobado':`${item.cards.filter(card=>state.foundationCards?.[card.id]).length}/${item.cards.length} tarjetas leídas`}</small></li>})}</ol></>}
   {step.part==='pending'&&chapter&&<><p className="focused-lead">{chapter.outcome}</p><p className="focused-callout">Este capítulo está en preparación y se publicará tras la revisión del Capítulo 01. Hasta entonces la semana no puede completarse con el nuevo recorrido.</p></>}
   {step.part==='opening'&&chapter?.opening&&(()=>{const facts=chapter.intro?.filter(block=>block.kind==='facts')??[],rest=chapter.intro?.filter(block=>block.kind!=='facts')??[];
    const opening=<>{facts.length>0&&<FoundationRichContent blocks={facts}/>}{chapter.intro&&<h3 className="foundation-opening-title">La escena</h3>}{chapter.opening.story.map((line,i)=><p key={i} className={i===0?'focused-lead':undefined}>{line}</p>)}<details className="foundation-panel"><summary>{chapter.opening.question}</summary><p>{chapter.opening.answer}</p></details>{chapter.objectives&&<><h3>{chapter.intro?'Resultados de aprendizaje':'Al terminar podrás'}</h3><ol className="number-list">{chapter.objectives.map(item=><li key={item}>{item}</li>)}</ol></>}{rest.length>0&&<FoundationRichContent blocks={rest}/>}</>;
    return chapter.typesMap?<div className="foundation-card-layout"><div className="foundation-card-main foundation-opening">{opening}</div><aside className="foundation-card-aside" aria-label="Mapa de los tipos de prueba"><TestTypesMap/></aside></div>:chapter.levelsMap?<><div className="foundation-opening">{opening}</div><LevelsPyramid/></>:opening;})()}
   {step.part==='card'&&step.card&&chapter&&<CardView key={step.card.id} card={step.card} cardIndex={chapter.cards.indexOf(step.card)} total={chapter.cards.length} typesMap={!!chapter.typesMap} levelsMap={!!chapter.levelsMap}/>}
   {step.part==='case'&&chapter?.teamCase&&<ol className="foundation-case">{chapter.teamCase.map((item,i)=><li key={i}><strong>{item.who}</strong><span>{item.what}</span><small>Evidencia: {item.evidence}</small></li>)}</ol>}
   {step.part==='map'&&chapter?.diagram&&<figure className="foundation-map foundation-diagram" aria-labelledby={`${chapter.diagram.id}-caption`}><figcaption id={`${chapter.diagram.id}-caption`}>{chapter.diagram.title}</figcaption>
    <RelationsMap diagram={chapter.diagram}/><p className="rel-reading"><strong>Lectura del mapa:</strong> {chapter.diagram.alternative}</p>
<details><summary>Consultar la fuente Mermaid</summary><pre tabIndex={0}><code>{chapter.diagram.mermaid}</code></pre></details></figure>}
   {step.part==='apply'&&chapter?.balloons&&<StateBalloons key={chapter.id} flowId={`${chapter.id}-flow`} title={chapter.balloons.title} states={chapter.balloons.states}/>}
   {step.part==='activity'&&chapter?.activity&&<Classifier activity={chapter.activity}/>}
   {step.part==='transfer'&&chapter?.transfer&&<><p className="focused-lead">{chapter.transfer.prompt}</p><h3>Criterios para revisarla</h3><ul className="bullet-list">{chapter.transfer.rubric.map(item=><li key={item}>{item}</li>)}</ul><p className="hint">Es un entregable formativo: guárdalo en tus notas o en tu portafolio.</p></>}
   {step.part==='closing'&&chapter&&<>{chapter.closing&&<ul className="bullet-list">{chapter.closing.summary.map(item=><li key={item}>{item}</li>)}</ul>}{rule&&(()=>{const ids=checksOf(chapter),ok=ids.filter(id=>state.foundationChecks?.[id]).length,need=Math.ceil(ids.length*FOUNDATION_PASS_RATIO);return <p role="status" className={`feedback ${ok>=need?'good':'bad'}`}>{ok>=need?`✓ Capítulo aprobado: ${ok}/${ids.length} minitests correctos.`:`Minitests: ${ok}/${ids.length} correctos. Necesitas ${need} para aprobar el capítulo.`}{ok<need&&<> Pendientes: {chapter.cards.filter(card=>card.checks.some(check=>!state.foundationChecks?.[check.id])).map(card=><button key={card.id} type="button" className="text-link" onClick={()=>go(card.id)}>{card.title}</button>)}</>}</p>})()}{chapter.closing&&<><h3>Glosario</h3><dl className="foundation-glossary">{chapter.closing.glossary.map(item=><div key={item.term}><dt>{item.term}</dt><dd>{item.meaning}</dd></div>)}</dl><p className="focused-callout">{chapter.closing.next}</p></>}{chapter.sources&&<><h3>Fuentes consultadas</h3><ul className="foundation-sources">{chapter.sources.map(source=><li key={source.url}><a href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a><small>{source.version} · consultada {source.consulted}</small></li>)}</ul></>}</>}
   {step.kind==='exercise'&&guide.exercise&&<PracticalExercisePanel week={week.id} exercise={guide.exercise}/>}
   {step.kind==='notes'&&<><label className="notes-label">Mis notas<textarea className="notes" aria-label="Mis notas" disabled={!ready} value={state.notes[String(week.id)]??''} onChange={event=>saveNote(week.id,event.target.value)} onBlur={flushNote} placeholder="Conclusiones, dudas y tu entregable del capítulo…"/></label><SaveFeedback actionKey={`note:${week.id}`}/><p className="hint">{remote?'Guardado automático en tu cuenta.':'Guardado en este navegador. Crea una cuenta para sincronizar tus notas.'}</p></>}
   {step.kind==='resources'&&<div className="lesson-resources">{[...new Map(foundation.chapters.flatMap(item=>item.sources||[]).map(source=>[source.url,source])).values()].map(source=><a className="resource-link" key={source.url} href={source.url} target="_blank" rel="noopener noreferrer">{source.title} ↗</a>)}</div>}
   {step.kind==='finish'&&<><LearningSteps week={week.id} focused/><p className="learning-status">{complete?'✓ Semana completada automáticamente':'La semana se completa al leer todas las tarjetas, aprobar los minitests de sus cuatro capítulos y validar la práctica.'}</p>{week.id<24&&<Link className="button button-outline" href={`/study/${week.id+1}`}>Siguiente semana ↗</Link>}</>}
  </section>
  <nav className="focused-pager" aria-label="Navegación por tarjetas"><button type="button" className="button button-outline" disabled={index===0} onClick={()=>go(steps[index-1].id)}>← Anterior</button><span aria-hidden="true">{index+1} / {steps.length}</span>{index<steps.length-1?<button type="button" className="button button-primary" onClick={()=>go(steps[index+1].id)}>Siguiente →</button>:<Link className="button button-primary" href={`/courses/${week.module}`}>Volver al curso ↗</Link>}</nav>
  <nav className="focused-tools" aria-label="Herramientas de estudio"><button aria-haspopup="dialog" aria-expanded={tool==='menu'} onClick={event=>{event.currentTarget.focus();open('menu')}}><span aria-hidden="true">☰</span>Menú</button><button aria-haspopup="dialog" aria-expanded={tool==='index'} onClick={event=>{event.currentTarget.focus();open('index')}}><span aria-hidden="true">☷</span>Avance del curso</button><button disabled={loading} aria-haspopup="dialog" aria-expanded={tool==='assistant'} onClick={event=>{event.currentTarget.focus();announceStudyTool('assistant');window.dispatchEvent(new CustomEvent(ASK_LIA_EVENT,{detail:{prompt:readingPrompt,preserveDraft:true,topic:step.title,week:week.id,suggestions:readingHints}}))}}><span aria-hidden="true">🐞</span>MariBug</button></nav>
  <StudyDialog open={tool==='menu'} title="Menú del curso" onClose={close}>{tool==='menu'&&<CourseStudyMenu moduleId={week.module} week={week.id} onNavigate={close} onGo={id=>{close();go(id)}}/>}</StudyDialog>
  <StudyDialog open={tool==='index'} title="Avance del curso" onClose={close}>{tool==='index'&&<><CourseProgressPanel moduleId={week.module} week={week.id}/><h3 className="course-progress-index-title">En esta semana</h3><p className="hint">El índice cambia tu posición; no completa actividades.</p><nav aria-label="Índice de tarjetas">{steps.map((item,i)=><a href={`#${item.id}`} key={item.id} className={`focused-index-row${item.part==='opening'||item.part==='pending'?' is-chapter':''}`} aria-current={step.id===item.id?'step':undefined} onClick={event=>{if(event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey){event.preventDefault();close();go(item.id)}}}><span>{i+1}</span>{item.title}{item.card&&state.foundationCards?.[item.card.id]&&<small>✓ leída</small>}{step.id===item.id&&<small>Actual</small>}</a>)}</nav></>}</StudyDialog>
 </div>;
}
