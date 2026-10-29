'use client';
import {useState} from 'react';
import type {FoundationCheck,FoundationCheckResult} from '@qapath/contracts';
import {useProgress} from '@/features/progress/progress-provider';

/** Minitest de una tarjeta: la corrección y el feedback vienen del servidor; el aprobado exige la lectura verificada. */
export function FoundationCheckBlock({check,index,total,cardRead}:{check:FoundationCheck;index:number;total:number;cardRead:boolean}){
 const {state,ready,remote,recordLearning,refreshProgress}=useProgress();
 const passed=!!state.foundationChecks?.[check.id];
 const [choice,setChoice]=useState<string|null>(null),[result,setResult]=useState<FoundationCheckResult|null>(null);
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[round,setRound]=useState(0);
 const options=check.options.map((_,i)=>check.options[(i+round)%check.options.length]);
 const submit=async()=>{
  if(!choice)return;setBusy(true);setError('');
  try{
   const response=await fetch(`/api/v1/${remote?'me/':''}foundation/checks/${encodeURIComponent(check.id)}`,{method:'POST',headers:{Accept:'application/json','Content-Type':'application/json'},body:JSON.stringify({optionId:choice}),credentials:'same-origin',cache:'no-store'});
   if(!response.ok)throw new Error(`No se pudo comprobar la respuesta (HTTP ${response.status}).`);
   const data=(await response.json() as {data:FoundationCheckResult}).data;setResult(data);
   if(data.correct&&cardRead){if(remote)await refreshProgress();else await recordLearning({type:'foundation-check-passed',questionId:check.id});}
  }catch(e){setError(e instanceof Error?e.message:'No se pudo comprobar la respuesta.')}
  finally{setBusy(false)}
 };
 const retry=()=>{setResult(null);setChoice(null);setRound(value=>value+1)};
 return <fieldset className="foundation-check" disabled={!ready||busy} data-check-id={check.id}>
  <legend><span className="foundation-check-label">Comprueba esta tarjeta{total>1?` · ${index+1}/${total}`:''}</span>{check.question}</legend>
  {passed&&!result&&<p className="foundation-check-state good">✓ Minitest aprobado. Puedes repasarlo cuando quieras.</p>}
  {!cardRead&&<p className="hint">Puedes responder ahora, pero el minitest solo cuenta cuando termines de leer la tarjeta.</p>}
  <div className="foundation-check-options">{options.map(option=><label key={option.id} className={choice===option.id?'is-chosen':''}><input type="radio" name={`${check.id}-${round}`} value={option.id} checked={choice===option.id} disabled={!!result} onChange={()=>setChoice(option.id)}/><span>{option.text}</span></label>)}</div>
  {!result?<button type="button" className="button button-primary" disabled={!choice||busy} onClick={()=>void submit()}>{busy?'Comprobando…':'Comprobar'}</button>
   :<div role="status" className={`feedback ${result.correct?'good':'bad'}`}><strong>{result.correct?'✓ ':'✗ Revisa este punto. '}</strong>{result.feedback}{result.correct&&!cardRead&&<span className="hint"> Termina la lectura de la tarjeta para que cuente.</span>}<div><button type="button" className="button button-outline" onClick={retry}>{result.correct?'Repetir':'Reintentar'}</button></div></div>}
  {error&&<p role="alert" className="feedback bad">{error}</p>}
 </fieldset>;
}
