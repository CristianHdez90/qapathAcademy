'use client';
import {useState} from 'react';
import {useProgress} from '@/features/progress/progress-provider';

export function LearningEvidence({kind,id,title}:{kind:'task'|'lab';id:string;title:string}){
 const {state,ready,recordLearning}=useProgress();
 const [draft,setDraft]=useState('');
 const [sending,setSending]=useState(false);
 const saved=state.evidence[`${kind}:${id}`];
 return <div className="learning-evidence"><p><strong>{title}</strong></p>{saved?<p className="learning-status done">✓ Evidencia entregada. Se incorpora al avance automáticamente.</p>:
  <form onSubmit={e=>{e.preventDefault();if(sending)return;setSending(true);void recordLearning({type:'submit-evidence',kind,id,text:draft}).finally(()=>setSending(false))}}><label>Evidencia: {title}<textarea className="notes" disabled={!ready||sending} value={draft} maxLength={8000} minLength={40} required placeholder="Describe lo que realizaste, resultados y conclusiones. Puedes incluir un enlace a tu trabajo (mínimo 40 caracteres)." onChange={e=>setDraft(e.target.value)}/></label><button className="button button-outline" disabled={!ready||sending||draft.trim().length<40}>{sending?'Enviando…':'Enviar evidencia'}</button></form>}
 </div>;
}
