'use client';
import {useState} from 'react';
import type {FoundationClassifier} from '@qapath/contracts';
/** Actividad formativa «clasificar pruebas por ejes» (Fundamentos v2). También se usa en el contenido editable. */
export function Classifier({activity}:{activity:FoundationClassifier}){
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
