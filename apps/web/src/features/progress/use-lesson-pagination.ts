'use client';
import {useCallback,useEffect,useState} from 'react';
export function useLessonPagination(week:number,ids:readonly string[]){
 const key=ids.join('|');const [selection,setSelection]=useState({week,id:ids[0]});
 const activeId=selection.week===week&&ids.includes(selection.id)?selection.id:ids[0];
 const go=useCallback((id:string,writeHistory=true)=>{
  if(!key.split('|').includes(id))return;
  setSelection({week,id});
  if(writeHistory&&window.location.hash!=='#'+id){window.history.pushState(window.history.state,'','#'+id);window.dispatchEvent(new HashChangeEvent('hashchange'))}
  requestAnimationFrame(()=>requestAnimationFrame(()=>{
   const target=document.getElementById(id);if(!target)return;
   let parent:HTMLElement|null=target;while(parent){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement}
   target.focus({preventScroll:true});target.scrollIntoView({block:'start',behavior:'instant'});
  }));
 },[week,key]);
 useEffect(()=>{
  const sync=()=>{const id=window.location.hash.slice(1);if(key.split('|').includes(id))go(id,false);else setSelection({week,id:key.split('|')[0]})};
  const follow=(event:MouseEvent)=>{
   if(event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
   const anchor=event.target instanceof Element?event.target.closest('a[href]'):null;if(!(anchor instanceof HTMLAnchorElement)||anchor.target==='_blank')return;
   const url=new URL(anchor.href);if(url.origin===location.origin&&url.pathname===location.pathname&&url.search===location.search&&key.split('|').includes(url.hash.slice(1))){event.preventDefault();go(url.hash.slice(1));}
  };
  sync();window.addEventListener('hashchange',sync);window.addEventListener('popstate',sync);document.addEventListener('click',follow,true);
  return()=>{window.removeEventListener('hashchange',sync);window.removeEventListener('popstate',sync);document.removeEventListener('click',follow,true)};
 },[week,key,go]);
 return {activeId,go};
}
