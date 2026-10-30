'use client';
import {useCallback} from 'react';
import type {PublicCourseOutlineDTO} from '@qapath/contracts';
import {useAuth} from '@/features/auth/auth-provider';
import {FocusedReader} from './focused-reader';
import {outlineApi} from './outline-api';
import '@/components/academy/focused-study.css';
/** Conecta la lectura enfocada con la sesión: solo los estudiantes guardan avance. */
export function CourseReader({outline,initialChapter,initialCard}:{outline:PublicCourseOutlineDTO;initialChapter?:string;initialCard?:string}){
 const {user,loading}=useAuth();const student=user?.role==='STUDENT';
 const loadProgress=useCallback(()=>outlineApi.progress(outline.slug),[outline.slug]);
 const markRead=useCallback((ids:string[])=>outlineApi.read(outline.slug,ids),[outline.slug]);
 const grade=useCallback((chapterId:string,answers:Record<string,number>)=>outlineApi.grade(outline.slug,chapterId,answers,student),[outline.slug,student]);
 // Mientras carga la sesión ya se marca el modo enfocado (sin barra lateral) para evitar el salto visual.
 if(loading)return <div className="focused-study"><p className="hint" aria-busy="true">Cargando lectura enfocada…</p></div>;
 return <FocusedReader key={user?.id??'anon'} courseTitle={outline.title} courseHref={`/courses/${outline.slug}`} learnHref={`/courses/${outline.slug}/learn`} weeks={outline.weeks} initialChapter={initialChapter} initialCard={initialCard} student={student} loadProgress={student?loadProgress:undefined} markRead={student?markRead:undefined} grade={grade}/>;
}
