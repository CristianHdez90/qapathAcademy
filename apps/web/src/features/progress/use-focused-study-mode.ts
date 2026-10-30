'use client';
import {useSyncExternalStore} from 'react';
export const STUDY_MODE_EVENT='qapath:study-mode';
function subscribe(callback:()=>void){window.addEventListener('popstate',callback);window.addEventListener(STUDY_MODE_EVENT,callback);return()=>{window.removeEventListener('popstate',callback);window.removeEventListener(STUDY_MODE_EVENT,callback)}}
/** Lectura enfocada: /study/N?view=focused (cursos base) y /courses/:slug/learn (contenido editable, SPEC-CONTENT-330/331). */
export const isFocusedStudyPath=(pathname:string,search:string)=>/^\/courses\/[a-z0-9-]+\/learn\/?$/.test(pathname)||/^\/study\/\d+$/.test(pathname)&&new URLSearchParams(search).get('view')==='focused';
export function useFocusedStudyMode(){return useSyncExternalStore(subscribe,()=>isFocusedStudyPath(location.pathname,location.search),()=>false)}
