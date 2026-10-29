'use client';
import type {Week,StudyGuide} from '@qapath/contracts';
import {useAuth} from '@/features/auth/auth-provider';
import {LegacyLessonStudy} from './lesson-study-legacy';
import {FocusedStudy} from './focused-study';
import {FoundationStudy} from './foundation-study';
import './focused-study.css';

export function LessonStudy({week,guide,focused=false}:{week:Week;guide:StudyGuide;focused?:boolean}){
 const {user}=useAuth();
 const scope=`${user?.id||'guest'}:${user?.role||'guest'}:${week.id}`;
 // Fundamentos v2 sustituye el estudio anterior de las semanas 1–2 (SPEC-CONTENT-220, D-02).
 if(guide.foundation)return <FoundationStudy key={`${scope}:fnd`} week={week} guide={guide} foundation={guide.foundation}/>;
 return focused?<FocusedStudy key={scope} week={week} guide={guide}/>:<LegacyLessonStudy key={scope} week={week} guide={guide}/>;
}
