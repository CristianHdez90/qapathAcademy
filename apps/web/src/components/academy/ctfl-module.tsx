'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {ctflChapters,ctflQuestions,ctflSources,gradeCtfl} from '@/features/certification/ctfl-content';
import type {CtflQuestion} from '@/features/certification/ctfl-content';
import {useProgress} from '@/features/progress/progress-provider';
import {useAuth} from '@/features/auth/auth-provider';
import {SaveFeedback} from './save-feedback';
import './ctfl-module.css';

type Report=ReturnType<typeof gradeCtfl>&{completedAt:string;mode:string};
type Session={id:number;chapter:number|null;questions:CtflQuestion[];deadline:number|null;seconds:number};
function previousReport(value?:string):Report|null{
 try{const result=JSON.parse(value||'null');return result&&Number.isInteger(result.score)&&Number.isInteger(result.total)&&result.total>0&&result.score>=0&&result.score<=result.total?result:null}catch{return null}
}
function shuffled<T>(values:readonly T[]){const copy=[...values];for(let i=copy.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[copy[i],copy[j]]=[copy[j],copy[i]]}return copy}
function newSession(id:number,chapter:number|null,minutes:number):Session{return {id,chapter,questions:shuffled(chapter?ctflQuestions.filter(q=>q.chapter===chapter):ctflQuestions),deadline:chapter?null:Date.now()+minutes*60_000,seconds:chapter?0:minutes*60}}

export function CtflModule(){
 const {state,ready,remote,recordLearning}=useProgress();const {user}=useAuth();
 const [minutes,setMinutes]=useState(60);const [session,setSession]=useState<Session|null>(null);
 const [savedKey,setSavedKey]=useState('');const sessionId=useRef(0);const runner=useRef<HTMLDivElement>(null);
 const practiced=ctflChapters.filter(ch=>{const result=previousReport(state.evidence[`certification:ctfl-chapter-${ch.id}`]);return result&&result.score/result.total>=.65}).length;
 const mock=previousReport(state.evidence['certification:ctfl-mock']);
 const start=(chapter:number|null)=>{
  if(session&&!window.confirm('¿Reiniciar el intento actual? Las respuestas sin entregar se perderán.'))return;
  setSavedKey('');setSession(newSession(++sessionId.current,chapter,minutes));
  requestAnimationFrame(()=>{runner.current?.scrollIntoView({behavior:'smooth',block:'start'});runner.current?.focus()});
 };
 const complete=useCallback((report:Report)=>{
  if(user&&user.role!=='STUDENT')return;
  const id=report.mode;const previous=previousReport(state.evidence[`certification:${id}`]);
  // Keep the best submitted result; lower retakes still receive full feedback on screen.
  if(previous&&previous.score/previous.total>report.score/report.total)return;
  setSavedKey(`evidence:certification:${id}`);
  void recordLearning({type:'submit-evidence',kind:'certification',id,text:JSON.stringify(report)});
 },[recordLearning,state.evidence,user]);
 return <div className="ctfl-page">
  <header className="ctfl-hero"><p className="eyebrow">MÓDULO COMPLEMENTARIO · CERTIFICACIÓN</p><h1>ISTQB Foundation Level</h1><p>Prepárate para CTFL v4.0: estudia, aplica técnicas y practica con un simulacro de examen.</p><div className="ctfl-facts"><span><b>6</b> capítulos</span><span><b>40</b> preguntas</span><span><b>60 min</b> por simulacro</span><span><b>26/40</b> objetivo de aprobación</span></div></header>
  <p className="ctfl-notice">Preparación independiente de QAPath. Las preguntas y explicaciones son originales; este módulo no es un examen oficial ni otorga la certificación. Referencia: temario CTFL v4.0.1 y reglas de examen consultadas el 24 de octubre de 2026.</p>
  <section className="ctfl-panel" aria-labelledby="ctfl-plan"><h2 id="ctfl-plan">Tu plan de preparación</h2><p>Lee cada capítulo, resuelve su práctica guiada y completa la autoevaluación. Después realiza el simulacro sin consultar apuntes y repasa las explicaciones de tus errores.</p><p><strong>{ready?practiced:'…'} de 6 capítulos con autoevaluación aprobada</strong> · Meta de práctica: al menos 65% en cada capítulo.</p><progress value={practiced} max={6} aria-label="Capítulos con autoevaluación aprobada"/><p className="hint">Este avance es independiente de las 24 semanas. {remote?'Los mejores resultados entregados se guardan en tu cuenta.':user?'Puedes practicar; el registro de progreso está disponible para estudiantes.':'Los mejores resultados entregados se guardan en este navegador; inicia sesión como estudiante para sincronizarlos.'} Un intento en curso se reinicia al salir de la página.</p></section>
  <nav className="ctfl-index" aria-label="Capítulos ISTQB">{ctflChapters.map(ch=><a key={ch.id} href={`#ctfl-chapter-${ch.id}`}>{ch.id}. {ch.title}</a>)}</nav>
  <div className="ctfl-chapters">{ctflChapters.map(ch=>{
   const result=previousReport(state.evidence[`certification:ctfl-chapter-${ch.id}`]);
   return <details className="ctfl-chapter" key={ch.id} id={`ctfl-chapter-${ch.id}`} open={ch.id===1?true:undefined}><summary><span className="ctfl-number">0{ch.id}</span><span><strong>{ch.title}</strong><small>{ch.focus}</small></span>{result&&<span className="pill">{result.score}/{result.total}</span>}</summary><div className="ctfl-reading">{ch.sections.map(section=><section key={section.title}><h3>{section.title}</h3><p>{section.text}</p></section>)}<section className="ctfl-practice"><p className="eyebrow">PRÁCTICA GUIADA</p><h3>Aplica lo que estudiaste</h3><p>{ch.exercise}</p><details><summary>Comparar con una solución razonada</summary><p className="ctfl-solution">{ch.solution}</p></details></section><p className="ctfl-pitfall"><strong>Evita esta confusión:</strong> {ch.pitfall}</p><button type="button" className="button button-primary" disabled={!ready} onClick={()=>start(ch.id)}>Autoevaluación · Capítulo {ch.id}</button></div></details>;
  })}</div>
  <section className="ctfl-panel" aria-labelledby="ctfl-mock-heading"><p className="eyebrow">SIMULACRO CRONOMETRADO</p><h2 id="ctfl-mock-heading">Practica las condiciones del examen</h2><p>40 preguntas de respuesta única, un punto por acierto y sin penalización adicional por error. Distribución por capítulos: 8, 6, 4, 11, 9 y 2. Se usan las mismas preguntas del banco de autoevaluación, en orden aleatorio; es una práctica, no una predicción del resultado oficial.</p><label className="ctfl-duration">Tiempo de práctica<select value={minutes} disabled={!!session} onChange={e=>setMinutes(Number(e.target.value))}><option value={60}>60 minutos · estándar</option><option value={75}>75 minutos · práctica con tiempo adicional</option></select></label><p className="hint">La elegibilidad para tiempo adicional en el examen real la confirma tu proveedor.</p>{mock&&<p>Mejor simulacro guardado: <strong>{mock.score}/{mock.total}</strong> ({Math.round(mock.score/mock.total*100)}%).</p>}<button type="button" className="button button-primary" disabled={!ready} onClick={()=>start(null)}>Iniciar simulacro de 40 preguntas</button></section>
  <div ref={runner} tabIndex={-1} className="ctfl-runner">{session&&<CtflQuiz key={session.id} session={session} onComplete={complete} onClose={()=>setSession(null)}/>}</div>
  {savedKey&&<SaveFeedback actionKey={savedKey}/>}
  <section className="ctfl-panel"><h2>Material oficial para complementar</h2><p>Consulta el temario completo y los exámenes de muestra oficiales antes de presentar la certificación. El módulo ofrece un repaso y ejercicios propios; el temario sigue siendo la referencia para todos los objetivos examinables.</p><div className="ctfl-source-links"><a href={ctflSources.syllabus} target="_blank" rel="noreferrer">Temario CTFL v4.0.1 ↗</a><a href={ctflSources.overview} target="_blank" rel="noreferrer">Exámenes de muestra oficiales ↗</a><a href={ctflSources.rules} target="_blank" rel="noreferrer">Estructura y reglas del examen ↗</a><a href={ctflSources.glossary} target="_blank" rel="noreferrer">Glosario ISTQB ↗</a></div><p className="hint">ISTQB® es una marca registrada de International Software Testing Qualifications Board, titular del temario oficial. QAPath no afirma acreditación ni afiliación.</p></section>
 </div>;
}

function CtflQuiz({session,onComplete,onClose}:{session:Session;onComplete:(report:Report)=>void;onClose:()=>void}){
 const {questions,deadline,chapter}=session;
 const [answers,setAnswers]=useState<Record<string,number>>({});const answersRef=useRef(answers);
 const [index,setIndex]=useState(0);const [seconds,setSeconds]=useState(session.seconds);
 const [result,setResult]=useState<Report|null>(null);const finished=useRef(false);const [confirm,setConfirm]=useState(false);
 const heading=useRef<HTMLHeadingElement>(null);
 const finish=useCallback(()=>{
  if(finished.current)return;finished.current=true;
  const report={...gradeCtfl(questions,answersRef.current),completedAt:new Date().toISOString(),mode:chapter?`ctfl-chapter-${chapter}`:'ctfl-mock'};
  setResult(report);setConfirm(false);onComplete(report);requestAnimationFrame(()=>heading.current?.focus());
 },[chapter,onComplete,questions]);
 useEffect(()=>{
  if(!deadline||result)return;
  const update=()=>{const left=Math.max(0,Math.ceil((deadline-Date.now())/1000));setSeconds(left);if(left===0)finish()};
  const timer=setInterval(update,500);return()=>clearInterval(timer);
 },[deadline,finish,result]);
 const question=questions[index];const unanswered=questions.length-Object.keys(answers).length;
 const navigate=(next:number)=>{setIndex(next);setConfirm(false);requestAnimationFrame(()=>heading.current?.focus())};
 if(result)return <section className="ctfl-panel ctfl-results" aria-labelledby="ctfl-result"><h2 id="ctfl-result" ref={heading} tabIndex={-1}>Resultado de {chapter?'autoevaluación':'simulacro'}</h2><p className="ctfl-result-score">{result.score}/{result.total} <span>· {result.percent}%</span></p><p role="status">{result.passed?'Alcanzaste el objetivo de práctica del 65%.':'Repasa los temas pendientes y vuelve a practicar.'} {unanswered>0?`${unanswered} preguntas quedaron sin responder y cuentan como incorrectas.`:''}</p><h3>Repaso por capítulo</h3><ul>{ctflChapters.filter(ch=>!chapter||ch.id===chapter).map(ch=>{const subset=questions.filter(q=>q.chapter===ch.id);const grade=gradeCtfl(subset,answers);return <li key={ch.id}><a href={`#ctfl-chapter-${ch.id}`}>{ch.title}</a>: {grade.score}/{grade.total}{grade.passed?' · objetivo alcanzado':' · reforzar'}</li>})}</ul><div className="ctfl-review">{questions.map((q,i)=><details key={q.id}><summary>{i+1}. {answers[q.id]===q.correct?'Correcta':'Por repasar'} · {q.q}</summary><p><strong>Tu respuesta:</strong> {q.options[answers[q.id]]??'Sin responder'}</p><p><strong>Respuesta correcta:</strong> {q.options[q.correct]}</p><p>{q.why}</p><small>{q.objective} · {q.level}</small></details>)}</div><button type="button" className="button button-outline" onClick={onClose}>Cerrar resultado y elegir otra práctica</button></section>;
 return <section className="ctfl-panel ctfl-quiz" aria-label={chapter?`Autoevaluación del capítulo ${chapter}`:'Simulacro ISTQB'}><header><p className="eyebrow">{chapter?`AUTOEVALUACIÓN · CAPÍTULO ${chapter}`:'SIMULACRO CTFL'}</p>{deadline&&<span role="timer" aria-label="Tiempo restante">{Math.floor(seconds/60)}:{String(seconds%60).padStart(2,'0')}</span>}</header><p>{Object.keys(answers).length} de {questions.length} respondidas</p><nav className="ctfl-question-nav" aria-label="Navegar preguntas">{questions.map((q,i)=><button type="button" key={q.id} aria-label={`Pregunta ${i+1}${answers[q.id]!==undefined?', respondida':''}`} aria-current={i===index?'step':undefined} className={answers[q.id]!==undefined?'answered':''} onClick={()=>navigate(i)}>{i+1}</button>)}</nav><h2 ref={heading} tabIndex={-1} id="ctfl-question">Pregunta {index+1}. {question.q}</h2><fieldset aria-labelledby="ctfl-question"><legend className="ctfl-legend">Selecciona una respuesta</legend>{question.options.map((option,i)=><label key={option}><input type="radio" name={question.id} checked={answers[question.id]===i} value={i} onChange={()=>{const next={...answersRef.current,[question.id]:i};answersRef.current=next;setAnswers(next);setConfirm(false)}}/><span>{option}</span></label>)}</fieldset><div className="ctfl-quiz-actions"><button type="button" className="button button-outline" disabled={index===0} onClick={()=>navigate(index-1)}>Anterior</button><button type="button" className="button button-outline" disabled={index===questions.length-1} onClick={()=>navigate(index+1)}>Siguiente</button><button type="button" className="button button-primary" onClick={()=>unanswered?setConfirm(true):finish()}>Entregar respuestas</button></div>{confirm&&<div className="ctfl-confirm" role="alert"><p>Quedan {unanswered} preguntas sin responder. Contarán como incorrectas.</p><button type="button" className="button button-primary" onClick={finish}>Entregar con {unanswered} sin responder</button><button type="button" className="button button-outline" onClick={()=>setConfirm(false)}>Seguir respondiendo</button></div>}<p className="hint">El resultado se calcula al entregar{deadline?' o al terminar el tiempo':''}. Las explicaciones se muestran al finalizar.</p></section>;
}
