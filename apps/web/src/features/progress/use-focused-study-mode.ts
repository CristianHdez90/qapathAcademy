'use client';
import {useSyncExternalStore} from 'react';
export const STUDY_MODE_EVENT='qapath:study-mode';
function subscribe(callback:()=>void){window.addEventListener('popstate',callback);window.addEventListener(STUDY_MODE_EVENT,callback);return()=>{window.removeEventListener('popstate',callback);window.removeEventListener(STUDY_MODE_EVENT,callback)}}
export function useFocusedStudyMode(){return useSyncExternalStore(subscribe,()=>/^\/study\/\d+$/.test(location.pathname)&&new URLSearchParams(location.search).get('view')==='focused',()=>false)}
