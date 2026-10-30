'use client';
import {useCallback} from 'react';
import type {PublicCourseOutlineDTO} from '@qapath/contracts';
import {useAuth} from '@/features/auth/auth-provider';
import {FocusedReader} from './focused-reader';
import {outlineApi} from './outline-api';
/** Conecta la lectura enfocada con la sesión: solo los estudiantes guardan avance. */
export function CourseReader({outline,initialChapter}:{outline:PublicCourseOutlineDTO;initialChapter?:string}){
 const {user,loading}=useAuth();const student=user?.role==='STUDENT';
 const loadProgress=useCallback(()=>outlineApi.progress(outline.slug),[outline.slug]);
 const markRead=useCallback((ids:string[])=>outlineApi.read(outline.slug,ids),[outline.slug]);
 const grade=useCallback((chapterId:string,answers:Record<string,number>)=>outlineApi.grade(outline.slug,chapterId,answers,student),[outline.slug,student]);
 if(loading)return <p className="hint" aria-busy="true">Cargando…</p>;
 return <FocusedReader key={user?.id??'anon'} courseTitle={outline.title} courseHref={`/courses/${outline.slug}`} weeks={outline.weeks} initialChapter={initialChapter} student={student} loadProgress={student?loadProgress:undefined} markRead={student?markRead:undefined} grade={grade}/>;
}
