'use client';
import {useCallback,useEffect,useRef,useState} from 'react';
import {resolveStudyStep,type StudyStep} from './study-steps';

export function useStudyNavigation(week:number,identity:string,steps:readonly StudyStep[],flush:()=>void,identityReady=true){
 const [active,setActive]=useState(steps[0].id),[notice,setNotice]=useState('');
 const root=useRef<HTMLElement>(null),positions=useRef(new Map<string,number>()),current=useRef(active);
 const flushLatest=useRef(flush),firstFrame=useRef(0),secondFrame=useRef(0);
 useEffect(()=>{flushLatest.current=flush},[flush]);
 const cancelFocus=useCallback(()=>{cancelAnimationFrame(firstFrame.current);cancelAnimationFrame(secondFrame.current)},[]);
 const storageKey=`qapath:study:v1:${identity}:${week}`;
 const go=useCallback((id:string,write=true,focus=true)=>{
  const destination=resolveStudyStep(id,steps);if(!destination)return;
  flushLatest.current();cancelFocus();
  // popstate and hashchange may describe the same visit; do not overwrite its saved scroll twice.
  if(write||destination!==current.current)positions.current.set(current.current,window.scrollY);
  current.current=destination;setActive(destination);setNotice('');
  if(identityReady)try{sessionStorage.setItem(storageKey,destination)}catch{/* Navigation works when storage is unavailable. */}
  if(write&&location.hash!==`#${destination}`)history.pushState(history.state,'',`#${destination}`);
  if(!focus)return;
  firstFrame.current=requestAnimationFrame(()=>{secondFrame.current=requestAnimationFrame(()=>{
   if(document.querySelector('dialog[open]')||current.current!==destination)return;
   root.current?.querySelector<HTMLElement>('[data-study-title]')?.focus({preventScroll:true});
   window.scrollTo({top:positions.current.get(destination)??0,behavior:'instant'});
  })});
 },[steps,cancelFocus,storageKey,identityReady]);
 useEffect(()=>{
  const modal=(event:Event)=>{if((event as CustomEvent<{tool:string|null}>).detail.tool)cancelFocus()};
  window.addEventListener('qapath:study-tool',modal);
  return()=>{cancelFocus();window.removeEventListener('qapath:study-tool',modal)};
 },[cancelFocus]);
 useEffect(()=>{
  const sync=(event?:Event)=>{
   const hash=location.hash;
   const focus=!!event||document.activeElement===document.body;
   if(hash==='#contenido'){document.getElementById('contenido')?.focus();return;}
   if(hash){const id=resolveStudyStep(hash,steps);go(id||steps[0].id,false,focus);if(!id)setNotice('Este enlace ya no identifica una tarjeta. Puedes buscarla en «En esta clase».');}
   else if(identityReady){let saved:string|null=null;try{saved=sessionStorage.getItem(storageKey)}catch{}go(resolveStudyStep(saved||'',steps)||steps[0].id,false,focus);}
  };
  const follow=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const link=event.target instanceof Element?event.target.closest('a[href]'):null;
   if(!(link instanceof HTMLAnchorElement)||link.target==='_blank'||link.hasAttribute('download'))return;
   const url=new URL(link.href);if(url.origin!==location.origin||url.pathname!==location.pathname||url.search!==location.search)return;
   const id=resolveStudyStep(url.hash,steps);if(id){event.preventDefault();go(id);}
  };
  sync();window.addEventListener('popstate',sync);window.addEventListener('hashchange',sync);document.addEventListener('click',follow);
  return()=>{window.removeEventListener('popstate',sync);window.removeEventListener('hashchange',sync);document.removeEventListener('click',follow)};
 },[steps,go,storageKey,identityReady]);
 useEffect(()=>{
  // A position is not shared with a later account/role on this browser session.
  if(!identityReady)return;
  const prefix=`qapath:study:v1:`;
  try{for(const key of Object.keys(sessionStorage))if(key.startsWith(prefix)&&!key.startsWith(`${prefix}${identity}:`))sessionStorage.removeItem(key)}catch{}
 },[identity,identityReady]);
 return {active,go,notice,root};
}
