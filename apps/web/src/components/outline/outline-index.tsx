'use client';
import Link from 'next/link';
import {useEffect,useState} from 'react';
import type {OutlineProgressDTO,PublicCourseOutlineDTO} from '@qapath/contracts';
import {OUTLINE_PASS_PERCENT} from '@qapath/contracts';
import {useAuth} from '@/features/auth/auth-provider';
import {outlineApi} from './outline-api';
import '@/components/academy/module-detail.css';
import './outline.css';
/** Índice del curso (semanas → capítulos) con el avance del estudiante y el botón «Continuar». */
export function OutlineIndex({outline}:{outline:PublicCourseOutlineDTO}){
 const {user}=useAuth();const student=user?.role==='STUDENT';
 const [progress,setProgress]=useState<OutlineProgressDTO|null>(null);
 useEffect(()=>{if(!student)return;let alive=true;void outlineApi.progress(outline.slug).then(p=>{if(alive)setProgress(p)}).catch(()=>{});return()=>{alive=false}},[student,outline.slug]);
 const chapters=outline.weeks.flatMap(w=>w.chapters);
 const pending=progress?chapters.find(c=>c.cards.some(card=>!progress.readCards.includes(card.id))||(c.quiz.length>0&&(progress.passedChapters[c.id]??0)<OUTLINE_PASS_PERCENT)):undefined;
 const base=`/courses/${outline.slug}/learn`;
 return <section aria-labelledby="outline-index-title">
  <div className="section-head compact"><div><p className="eyebrow">CONTENIDO DE ESTUDIO</p><h2 id="outline-index-title">Clases y actividades</h2></div>{chapters.length>0&&<Link className="button button-primary" href={pending?`${base}?chapter=${pending.id}`:base}>{progress&&progress.readCards.length?'Continuar':'Comenzar'}: {(pending??chapters[0]).title} ↗</Link>}</div>
  <div className="lesson-list">{outline.weeks.map((week,wi)=>{const done=!!progress&&week.chapters.every(c=>c.cards.every(card=>progress.readCards.includes(card.id))&&(!c.quiz.length||(progress.passedChapters[c.id]??0)>=OUTLINE_PASS_PERCENT));
   return <div className="lesson-row" key={week.id}><span className="learning-week-state" aria-label={`Semana ${wi+1}: ${done?'completada':'pendiente'}`}>{done?'✓':'○'}</span><div className="lesson-info">
    <Link href={week.chapters[0]?`${base}?chapter=${week.chapters[0].id}`:base} className="lesson-link"><span>SEMANA {String(wi+1).padStart(2,'0')}</span><h3>{week.title} <span>↗</span></h3></Link><p>{week.summary}</p>
    <ol className="module-chapters">{week.chapters.map(chapter=>{const read=progress?chapter.cards.filter(c=>progress.readCards.includes(c.id)).length:0,best=progress?.passedChapters[chapter.id];
     return <li key={chapter.id}><Link href={`${base}?chapter=${chapter.id}`}>{chapter.title}</Link><small>{best!==undefined&&best>=OUTLINE_PASS_PERCENT?'✓ Aprobado':`${read}/${chapter.cards.length} tarjetas leídas${chapter.quiz.length?' · con minitest':''}`}</small></li>})}</ol>
   </div><span className="lesson-arrow" aria-hidden="true">↗</span></div>})}</div>
 </section>;
}
