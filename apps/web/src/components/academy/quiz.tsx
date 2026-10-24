"use client";
import {useState} from 'react';
import {useAuth} from '@/features/auth/auth-provider';
import {useProgress} from '@/features/progress/progress-provider';
import type {PublicQuestion,QuizResult} from '@qapath/contracts';
export function Quiz({moduleId,questions}:{moduleId:string;questions:PublicQuestion[]}){
 const [answers,setAnswers]=useState<Record<number,number>>({});const [result,setResult]=useState<QuizResult|null>(null);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const {saveGrade,saveScrum}=useProgress();const {user}=useAuth();
 if(!questions.length)return null;
 const submit=async()=>{
  setBusy(true);setError('');setResult(null);
  try{
   const response=await fetch(`/api/v1/${user?'me/quizzes':'quizzes'}/${encodeURIComponent(moduleId)}/grade`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({answers:questions.map((_,i)=>answers[i])})});
   const body=await response.json();if(!response.ok)throw new Error(body?.error?.message||'No fue posible calificar');
   const score=body.data as QuizResult;setResult(score);saveGrade(moduleId,score.percent);if(moduleId==='scrum')saveScrum(score.percent);
  }catch(e){setError(e instanceof Error?e.message:'Error desconocido');}finally{setBusy(false);}
 };
 return <section className="quiz-panel"><div className="quiz-top"><div><p className="eyebrow">CONSOLIDA LO APRENDIDO</p><h2>Evaluación del módulo</h2></div><span className="pill">{questions.length} preguntas</span></div>
 {questions.map((q,i)=><fieldset className="question" key={i}><legend><span className="question-index">{String(i+1).padStart(2,'0')}</span>{q.q}</legend><div className="options">{q.a.map((option,j)=><label key={j} className={'option '+(answers[i]===j?'chosen':'')}><input type="radio" name={`q-${moduleId}-${i}`} checked={answers[i]===j} onChange={()=>{setAnswers(a=>({...a,[i]:j}));setResult(null)}}/><span>{option}</span></label>)}</div>{result&&<p className={result.feedback[i].correct?'feedback good':'feedback bad'}>{result.feedback[i].correct?'✓ Correcto. ':'✕ Revisa esta respuesta. '}{result.feedback[i].reason}</p>}</fieldset>)}
 {error&&<p className="feedback bad" role="alert">{error}</p>}{result&&<p className="quiz-score" role="status">Resultado: <strong>{result.score} / {result.total} ({result.percent}%)</strong></p>}
 <button onClick={submit} disabled={busy||Object.keys(answers).length!==questions.length} className="button button-primary">{busy?'Evaluando…':'Calificar respuestas'} ↗</button>
 </section>;
}
