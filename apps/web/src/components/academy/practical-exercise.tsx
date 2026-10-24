'use client';
import Link from 'next/link';
import type {PracticalExercise} from '@qapath/contracts';
import {LearningDisclosure} from './learning-disclosure';
import {LearningEvidence} from './learning-evidence';
import './practical-exercise.css';

function downloadText(filename:string,text:string){const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download=filename;link.click();URL.revokeObjectURL(url)}
export function PracticalExercisePanel({week,exercise}:{week:number;exercise:PracticalExercise}){
 return <LearningDisclosure id="practical-exercise" title={`Ejercicio práctico · ${exercise.title}`} description={`${exercise.minutes} min · Práctica adicional con evidencia · ${exercise.tools.join(' / ')}`}>
  <div className="practical-exercise"><p className="eyebrow">DEL CONCEPTO A LA EJECUCIÓN</p><h2>{exercise.title}</h2><p>{exercise.objective}</p>
   <p className="hint">Complementa los retos de esta semana. Conserva tus requisitos de avance actuales; su evidencia se guarda por separado.</p>
   <div className="practical-actions"><Link href={`/practice/${week}`} className="button button-primary" target="_blank" rel="noopener noreferrer">Abrir actividad de la semana {week} ↗</Link><a className="button button-outline" href="/practice/qapath-practice-kit.zip" download>↓ Descargar kit práctico</a></div>
   <h3>Antes de comenzar</h3><ul className="bullet-list">{exercise.setup.map(item=><li key={item}>{item}</li>)}</ul>
   <h3>Ejecuta y compara</h3><ol className="practical-steps">{exercise.steps.map((step,i)=><li key={i}><p><strong>{step.action}</strong></p><p className="practical-expected"><b>Resultado esperado:</b> {step.expected}</p></li>)}</ol>
   {exercise.starter&&<><h3>Archivo de apoyo · {exercise.starter.filename}</h3><pre className="code-block"><code>{exercise.starter.code}</code></pre><button type="button" className="button button-outline" onClick={()=>downloadText(exercise.starter!.filename,exercise.starter!.code)}>↓ Descargar archivo de apoyo</button></>}
   <h3>Entregables</h3><ul className="bullet-list">{exercise.deliverables.map(item=><li key={item}>{item}</li>)}</ul>
   <h3>Criterios de calidad</h3><ul className="bullet-list">{exercise.rubric.map(item=><li key={item}>{item}</li>)}</ul>
   <LearningEvidence kind="exercise" id={String(week)} title={`Ejercicio práctico: ${exercise.title}`}/>
   <p className="hint">La evidencia documenta tu trabajo; la plataforma no certifica automáticamente ejecuciones hechas en Postman, tu terminal o un repositorio externo.</p>
   <div className="lesson-resources">{exercise.links.map(([label,url])=><a key={url} href={url} target="_blank" rel="noopener noreferrer">{label} ↗</a>)}</div>
  </div>
 </LearningDisclosure>;
}
