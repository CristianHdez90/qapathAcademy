'use client';
import {useEffect,useRef} from 'react';
import type {ReactNode} from 'react';

export function LearningDisclosure({id,title,description,children}:{id:string;title:string;description?:string;children:ReactNode}){
 const ref=useRef<HTMLDetailsElement>(null);
 useEffect(()=>{
  let frame=0;
  const reveal=()=>{
   const target=document.getElementById(window.location.hash.slice(1));
   if(target&&ref.current?.contains(target)){
    ref.current.open=true;
    frame=requestAnimationFrame(()=>{target.scrollIntoView({block:'start'});target.focus({preventScroll:true})});
   }
  };
  reveal();window.addEventListener('hashchange',reveal);
  return()=>{window.removeEventListener('hashchange',reveal);cancelAnimationFrame(frame)};
 },[]);
 return <details id={id} ref={ref} data-lesson-section className="learning-disclosure" tabIndex={-1}><summary><span><strong>{title}</strong>{description&&<small>{description}</small>}</span><span className="disclosure-indicator" aria-hidden="true">+</span></summary><div className="disclosure-content">{children}</div></details>;
}
