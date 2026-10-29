'use client';
import {readingAuxiliaryIsOpen} from '@/features/study/concept-detail-state';
import {useEffect,useRef,useState} from 'react';
import type {StudyStep} from './study-steps';
import {useProgress} from './progress-provider';
import {READING_SECTION_SECONDS} from '@qapath/progress';
import {readingEligible} from './reading-coverage';
import {measureReadingReference,verifyReadingPiece,creditReadingExposure,type ReadingGeometry,type Piece,type Range} from './focused-reading-geometry';
import {textLayout,exposeTextBands} from './reading-text-map';

type Plan={step:string;geometry:ReadingGeometry;piece:Piece;offset:number};
export function useFocusedReading(week:number,step:StudyStep,revision:string){
 const blueprint=useRef<HTMLDivElement>(null),region=useRef<HTMLDivElement>(null);
 const [plan,setPlan]=useState<Plan|null>(null),[verified,setVerified]=useState(false);
 const [diagnostic,setDiagnostic]=useState('pending');
 const {ready,state,recordLearning}=useProgress();
 const chapters=useRef(new Map<number,{time:number;ranges:Range[];channels:Map<string,Range[]>}>());
 const textHistory=useRef(new Map<string,{glyphs:Set<number>;edges:{top:boolean;bottom:boolean}}>());
 const pending=useRef(new Set<number>()),latest=useRef({ready,state,recordLearning});
 useEffect(()=>{latest.current={ready,state,recordLearning}},[ready,state,recordLearning]);
 useEffect(()=>{
  if(step.chapter===undefined||!blueprint.current)return;
  const measure=()=>{
   const node=blueprint.current;if(!node?.isConnected)return;
   setVerified(false);
   const geometry=measureReadingReference(node,step.chapter!,step.id);
   if(!geometry){setPlan(null);return;}
   const piece=geometry.pieces.find(piece=>piece.id===step.id);
   if(piece)setPlan({step:step.id,geometry,piece,offset:0});else setPlan(null);
  };
  measure();window.addEventListener('resize',measure);document.fonts?.addEventListener('loadingdone',measure);
  const observer=new ResizeObserver(measure);
  region.current?.querySelectorAll('.study-section,dd,.concept-demo-status,pre,ul,ol').forEach(node=>observer.observe(node));
  return()=>{observer.disconnect();window.removeEventListener('resize',measure);document.fonts?.removeEventListener('loadingdone',measure)};
 },[step,revision]);
 useEffect(()=>{
  if(!plan||plan.step!==step.id||!region.current)return;
  const check=()=>{
   const result=verifyReadingPiece(region.current!,plan.piece);
   setDiagnostic(result.diagnostic);
   if(Math.round(result.offset*64)!==0){setPlan(old=>old?{...old,offset:old.offset+result.offset}:old);return;}
   setVerified(result.valid);
  };
  const frame=requestAnimationFrame(check);
  return()=>cancelAnimationFrame(frame);
 },[plan,step.id]);
 useEffect(()=>{
  if(!ready||!verified||!plan||plan.step!==step.id||step.chapter===undefined)return;
  const chapter=step.chapter,reading=chapters.current.get(chapter)||{time:0,ranges:[],channels:new Map<string,Range[]>()};chapters.current.set(chapter,reading);
  let last=performance.now();
  const timer=setInterval(()=>{
   const now=performance.now(),delta=Math.min(now-last,500);last=now;
   const current=latest.current,node=region.current;
   const saved=current.state.readingSections[String(week)];
   if(!current.ready||!node?.isConnected||document.visibilityState!=='visible'||!document.hasFocus()||(document.querySelector('dialog[open]')||readingAuxiliaryIsOpen())||pending.current.has(chapter)||saved?.includes(chapter))return;
   if(node.closest('[data-study-step]')?.getAttribute('data-study-step')!==step.id)return;
   for(let parent:HTMLElement|null=node;parent;parent=parent.parentElement){const style=getComputedStyle(parent);if(parent.hidden||parent.inert||style.visibility!=='visible'||style.opacity==='0')return;}
   // Fail closed if layout changed between measurement and sampling (fonts, host CSS, etc.).
   const match=verifyReadingPiece(node,plan.piece);
   if(!match.valid){setVerified(false);setDiagnostic(match.diagnostic);return;}
   const r=node.getBoundingClientRect(),tools=document.querySelector<HTMLElement>('.focused-tools')?.getBoundingClientRect();
   const bottom=tools&&tools.left<r.right&&tools.right>r.left?Math.min(innerHeight,tools.top):innerHeight;
   const shown=Math.max(0,Math.min(r.bottom,bottom)-Math.max(r.top,0));
   if(r.width<=0||r.right<=0||r.left>=innerWidth||shown<Math.min(r.height,innerHeight)*.15)return;
   const a=Math.max(0,-r.top)/r.height,b=Math.min(1,(Math.min(r.bottom,bottom)-r.top)/r.height);
   if(b<=a)return;
   if(node.dataset.readingLayout==='reflow'&&plan.piece.text){
    const content=node.querySelector<HTMLElement>('.reading-concept');if(!content)return;
    const box=content.getBoundingClientRect(),key=JSON.stringify([step.id,plan.piece.text.signature,plan.geometry.height,plan.piece.width,plan.piece.start,plan.piece.end]);
    const history=textHistory.current.get(key)||{glyphs:new Set<number>(),edges:{top:false,bottom:false}};textHistory.current.set(key,history);
    const bands=exposeTextBands(plan.piece.text,textLayout(content,true,true),[Math.max(0,-box.top,r.top-box.top),Math.min(box.height,Math.min(bottom,r.bottom)-box.top)],box.height,history.glyphs,history.edges);
    const length=plan.piece.end-plan.piece.start;
    for(const [start,end] of bands)reading.ranges=creditReadingExposure(plan.geometry,plan.piece,[start/length,end/length],reading.channels,reading.ranges);
   }else reading.ranges=creditReadingExposure(plan.geometry,plan.piece,[a,b],reading.channels,reading.ranges);
   reading.time+=delta;
   const eligible=readingEligible(reading.ranges,reading.time,READING_SECTION_SECONDS*1000);
   // Local, immutable-to-the-tracker observation; never sent to a server or persisted by the app.
   window.dispatchEvent(new CustomEvent('qapath:reading-observation',{detail:{week,chapter,step:step.id,delta,attentionMs:reading.time,minimumMs:READING_SECTION_SECONDS*1000,source:[plan.piece.start,plan.piece.end,plan.geometry.height],local:[a,b],ranges:reading.ranges.map(([start,end])=>[start,end]),eligible}}));
   if(eligible){
    pending.current.add(chapter);
    // The provider owns the queue, error and retry; only its ACK displays a recorded section.
    void current.recordLearning({type:'reading-section',week,section:chapter});
   }
  },250);
  return()=>clearInterval(timer);
 },[ready,verified,plan,step.id,step.chapter,week]);
 const active=plan?.step===step.id?plan:null;
 return {blueprint,region,plan:active,verified:!!active&&verified,diagnostic};
}
