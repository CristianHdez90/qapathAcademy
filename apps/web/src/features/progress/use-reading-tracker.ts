'use client';
import {useEffect,useRef} from 'react';
import {READING_SECTION_SECONDS} from '@qapath/progress';
import {useProgress} from './progress-provider';

/** Records visible chapters and the guided example, never a manual completion flag. */
export function useReadingTracker(week:number){
 const root=useRef<HTMLDivElement>(null);
 const elapsed=useRef(new Map<number,number>());
 const trackedWeek=useRef(week),queued=useRef(new Set<number>());
 const {ready,state,recordLearning}=useProgress();
 const saved=state.readingSections[String(week)];
 useEffect(()=>{
  if(!ready||!root.current)return;
  if(trackedWeek.current!==week){elapsed.current.clear();queued.current.clear();trackedWeek.current=week;}
  const visible=new Set<number>(),sent=new Set([...(saved||[]),...queued.current]);
  const observer=new IntersectionObserver(entries=>{for(const entry of entries){
   const index=Number((entry.target as HTMLElement).dataset.readingSection);
   if(entry.isIntersecting&&entry.intersectionRatio>=0.15)visible.add(index);else visible.delete(index);
  }},{threshold:[0,0.15]});
  root.current.querySelectorAll('[data-reading-section]').forEach(section=>observer.observe(section));
  let last=performance.now();
  const timer=setInterval(()=>{
   const now=performance.now(),delta=Math.min(now-last,500);last=now;
   if(document.visibilityState!=='visible'||!document.hasFocus())return;
   for(const section of visible){
    if(sent.has(section))continue;
    const time=(elapsed.current.get(section)||0)+delta;elapsed.current.set(section,time);
    if(time>=READING_SECTION_SECONDS*1000){sent.add(section);queued.current.add(section);void recordLearning({type:'reading-section',week,section});}
   }
  },250);
  return()=>{clearInterval(timer);observer.disconnect()};
 },[week,ready,saved,recordLearning]);
 return root;
}
