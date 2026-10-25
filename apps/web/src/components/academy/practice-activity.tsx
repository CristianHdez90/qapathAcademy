'use client';
import {useState} from 'react';
import Link from 'next/link';
import type {PracticalExercise} from '@qapath/contracts';
import {activityProfiles} from '@/features/practice/activity-fields';
import {useProgress} from '@/features/progress/progress-provider';
import {useAuth} from '@/features/auth/auth-provider';
import {SaveFeedback} from './save-feedback';
import {WeekLaboratory} from './week-laboratory';
import {PracticeFiles} from './practice-files';
import {savedRun,type PracticeRun} from './practice-execution';
import {CaseMatrix,readCaseMatrix,type PracticeCase} from './case-matrix';
import './practice-activity.css';

function savedFields(text:string|undefined,count:number):string[]{
 try{const value=JSON.parse(text||'null');if(Array.isArray(value?.fields)&&value.fields.length===count&&value.fields.every((f:unknown)=>typeof f==='string'&&f.length<=1000))return value.fields}catch{}
 return Array.from({length:count},()=> '');
}
export function PracticeActivity({week,exercise}:{week:number;exercise:PracticalExercise}){
 const profile=activityProfiles[week];const {state,ready,remote,recordLearning}=useProgress();const {user}=useAuth();
 const [draft,setDraft]=useState<string[]|null>(null),[sending,setSending]=useState(false);
 const values=draft??savedFields(state.evidence[`exercise:${week}`],profile.fields.length);
 const [matrixDraft,setMatrixDraft]=useState<PracticeCase[]|null>(null);
 const caseMatrix=matrixDraft??readCaseMatrix(state.evidence[`exercise:${week}`]);
 const [runDraft,setRunDraft]=useState<PracticeRun|undefined>();
 const execution=runDraft??savedRun(state.evidence[`exercise:${week}`]);
 const report=JSON.stringify({...(execution?{execution}:{}),week,title:exercise.title,fieldNames:profile.fields,fields:values,...(week<=6?{caseMatrix}:{})});
 const canRecord=!user||user.role==='STUDENT';
 const hasMatrix=week<=6&&caseMatrix.some(row=>row.title.trim().length>=3);
 const canSave=canRecord&&ready&&!sending&&report.length<=8000&&(execution||hasMatrix||values.every(v=>v.trim().length>=10));
 const persisted=savedFields(state.evidence[`exercise:${week}`],profile.fields.length);
 const savedSummary=persisted.some(v=>v.trim())?profile.fields.map((label,i)=>`${label}\n${persisted[i]}`).join('\n\n'):state.evidence[`exercise:${week}`];
 function download(name:string,text:string){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;a.click();URL.revokeObjectURL(url)}
 const labEvidence=<>
 {week<=6&&<CaseMatrix rows={caseMatrix} onChange={setMatrixDraft} disabled={!ready||sending||!canRecord}/>}
 <details className="laboratory-evidence"><summary>Guardar y revisar evidencia</summary><h3>{profile.workspace}</h3><p>Documenta el trabajo de esta práctica. Mantén separados el resultado esperado y el resultado obtenido (observado). {!canRecord?'Puedes revisar y descargar tu trabajo; el guardado de progreso está disponible para estudiantes.':remote?'La evidencia se guarda en tu cuenta.':'La evidencia se guarda en este navegador. Inicia sesión como estudiante para sincronizarla.'}</p><form onSubmit={event=>{event.preventDefault();if(!canSave)return;setSending(true);void recordLearning({type:'submit-evidence',kind:'exercise',id:String(week),text:report}).then(ok=>{if(ok){setDraft(null);setMatrixDraft(null);setRunDraft(undefined)}}).finally(()=>setSending(false))}}>{profile.fields.map((label,i)=><label key={label}>{label}<textarea aria-label={label} className="notes" disabled={!ready||sending} value={values[i]} minLength={hasMatrix||execution?undefined:10} maxLength={1000} required={!hasMatrix&&!execution} onChange={event=>{const updated=[...values];updated[i]=event.target.value;setDraft(updated)}}/></label>)}<p className="hint">Puedes guardar una ejecución o una matriz aunque esté en elaboración. Si no usas ninguna, escribe al menos 10 caracteres por campo. Guarda resultados y enlaces a evidencias; no incluyas credenciales.</p>{report.length>8000&&<p role="alert">Reduce el texto para guardar: máximo 8000 caracteres en conjunto.</p>}<div className="practical-actions"><button className="button button-primary" disabled={!canSave}>{sending?'Guardando…':'Guardar evidencia de esta actividad'}</button><button className="button button-outline" type="button" onClick={()=>download(`semana-${week}-evidencia.md`,`# ${exercise.title}\n\n`+profile.fields.map((name,i)=>`## ${name}\n\n${values[i]}`).join('\n\n'))}>Descargar mi trabajo</button></div></form><SaveFeedback actionKey={`evidence:exercise:${week}`}/>{state.evidence[`exercise:${week}`]&&<details><summary>Última evidencia guardada de esta semana</summary><pre className="activity-saved">{savedSummary}</pre></details>}</details>
 </>;
 return <div className="practice-activity"><header><Link href={`/study/${week}#practical-exercise`} className="activity-back">← Volver a la lectura de la semana {week}</Link><p className="eyebrow">ACTIVIDAD ESPECÍFICA · SEMANA {week}</p><h1>{exercise.title}</h1><p>{exercise.objective}</p><span className="pill">{exercise.minutes} min · {exercise.tools.join(' / ')}</span></header>
 {ready?<WeekLaboratory week={week} title={exercise.title} initial={execution} onResult={setRunDraft}>{labEvidence}</WeekLaboratory>:<section className="activity-section"><h2>Laboratorio interactivo de esta semana</h2><p>Cargando tu actividad…</p></section>}
 <section className="activity-section"><h2>Prepara tu actividad</h2><ul>{exercise.setup.map(item=><li key={item}>{item}</li>)}</ul><a className="button button-outline" href="/practice/qapath-practice-kit.zip" download>Descargar kit de apoyo</a></section>
 <section className="activity-section"><h2>Instrucciones de esta semana</h2><ol className="practical-steps">{exercise.steps.map((step,i)=><li key={i}><strong>{step.action}</strong><p className="practical-expected"><b>Resultado esperado:</b> {step.expected}</p></li>)}</ol>{exercise.starter&&<details><summary>Archivo de apoyo · {exercise.starter.filename}</summary><pre className="code-block"><code>{exercise.starter.code}</code></pre><button className="button button-outline" type="button" onClick={()=>download(exercise.starter!.filename,exercise.starter!.code)}>Descargar archivo de apoyo</button></details>}
</section>
 <PracticeFiles exercise={exercise}/>

 </div>;
}
