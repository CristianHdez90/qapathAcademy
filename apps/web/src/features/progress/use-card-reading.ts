'use client';
import {useEffect,useRef,useState} from 'react';
import {FOUNDATION_CARD_SECONDS} from '@qapath/progress';
import {readingAuxiliaryIsOpen} from '@/features/study/concept-detail-state';
import {addReadingExposure,readingEligible} from './reading-coverage';
import {useProgress} from './progress-provider';

/**
 * Lectura verificada de una tarjeta de Fundamentos v2: recorrer al menos el 80 % del texto
 * (incluido el final) con la pestaña visible y enfocada durante FOUNDATION_CARD_SECONDS.
 * Ni los clics, ni los globos, ni el índice cuentan como lectura (AC-16).
 */
export function useCardReading(cardId:string|undefined){
 const region=useRef<HTMLDivElement>(null);
 const {ready,state,recordLearning}=useProgress();
 const recorded=!!cardId&&!!state.foundationCards?.[cardId];
 const [attention,setAttention]=useState(0);
 const latest=useRef({recordLearning});
 useEffect(()=>{latest.current={recordLearning}},[recordLearning]);
 useEffect(()=>{
  if(!ready||!cardId||recorded)return;
  let ranges:[number,number][]=[],time=0,last=performance.now(),sent=false;
  const timer=setInterval(()=>{
   const now=performance.now(),delta=Math.min(now-last,500);last=now;
   const node=region.current;
   if(sent||!node?.isConnected||document.visibilityState!=='visible'||!document.hasFocus()||document.querySelector('dialog[open]')||readingAuxiliaryIsOpen())return;
   const tools=document.querySelector<HTMLElement>('.focused-tools')?.getBoundingClientRect();
   const r=node.getBoundingClientRect(),bottom=tools&&tools.left<r.right&&tools.right>r.left?Math.min(innerHeight,tools.top):innerHeight;
   const shown=Math.max(0,Math.min(r.bottom,bottom)-Math.max(r.top,0));
   if(r.width<=0||shown<Math.min(r.height,bottom)*.15)return;
   ranges=addReadingExposure(ranges,r.top,r.bottom,r.height,bottom);time+=delta;
   setAttention(Math.min(1,time/(FOUNDATION_CARD_SECONDS*1000)));
   if(readingEligible(ranges,time,FOUNDATION_CARD_SECONDS*1000)){sent=true;void latest.current.recordLearning({type:'foundation-card-read',cardId});}
  },250);
  return()=>clearInterval(timer);
 },[ready,cardId,recorded]);
 return {region,recorded,attention:recorded?1:attention};
}
