'use client';
import {useEffect,useRef,type ReactNode} from 'react';

export const STUDY_TOOL_EVENT='qapath:study-tool';
export function announceStudyTool(tool:'menu'|'index'|'assistant'|null){window.dispatchEvent(new CustomEvent(STUDY_TOOL_EVENT,{detail:{tool}}))}

/** One native modal, explicit keyboard cycle, and the exact opener restored on close. */
export function useStudyDialog(open:boolean,onClose:()=>void){
 const ref=useRef<HTMLDialogElement>(null),opener=useRef<HTMLElement|null>(null),callback=useRef(onClose);
 useEffect(()=>{callback.current=onClose},[onClose]);
 useEffect(()=>{
  const dialog=ref.current;if(!open||!dialog)return;
  opener.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
  dialog.showModal();const previous=document.body.style.overflow;document.body.style.overflow='hidden';
  dialog.querySelector<HTMLElement>('[data-dialog-close]')?.focus();
  const cancel=(event:Event)=>{event.preventDefault();callback.current()};
  const trap=(event:KeyboardEvent)=>{
   if(event.key!=='Tab')return;
   const controls=Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled),a[href],input:not(:disabled),textarea:not(:disabled),select:not(:disabled),summary,[tabindex]:not([tabindex="-1"])')).filter(node=>{
    if(node.closest('[hidden],[inert]')||!node.getClientRects().length)return false;
    for(let parent=node.parentElement;parent&&parent!==dialog;parent=parent.parentElement)if(parent instanceof HTMLDetailsElement&&!parent.open&&!(node.tagName==='SUMMARY'&&node.parentElement===parent))return false;
    return true;
   });
   const first=controls[0],last=controls.at(-1);
   if(!first){event.preventDefault();dialog.focus();return;}
   if(event.shiftKey&&(document.activeElement===first||!dialog.contains(document.activeElement))){event.preventDefault();last?.focus()}
   else if(!event.shiftKey&&(document.activeElement===last||!dialog.contains(document.activeElement))){event.preventDefault();first.focus()}
  };
  dialog.addEventListener('cancel',cancel);dialog.addEventListener('keydown',trap);
  return()=>{
   dialog.removeEventListener('cancel',cancel);dialog.removeEventListener('keydown',trap);dialog.close();document.body.style.overflow=previous;
   if(opener.current?.isConnected)opener.current.focus({preventScroll:true});
  };
 },[open]);
 return ref;
}

export function StudyDialog({open,title,onClose,children}:{open:boolean;title:string;onClose:()=>void;children:ReactNode}){
 const ref=useStudyDialog(open,onClose);
 return <dialog ref={ref} className="study-modal" aria-label={title}><header><h2>{title}</h2><button type="button" data-dialog-close aria-label={`Cerrar ${title}`} onClick={onClose}>× Cerrar</button></header><div className="study-modal-body">{children}</div></dialog>;
}
