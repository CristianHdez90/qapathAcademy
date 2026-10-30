'use client';
import type {OutlineGradeDTO,OutlineProgressDTO} from '@qapath/contracts';
import {courseRequest} from '@/features/courses/course-api';
export const outlineApi={
 progress:(slug:string)=>courseRequest<OutlineProgressDTO>(`/me/courses/${slug}/outline-progress`),
 read:(slug:string,cardIds:string[])=>courseRequest<OutlineProgressDTO>(`/me/courses/${slug}/outline-progress/read`,'POST',{cardIds}),
 grade:(slug:string,chapterId:string,answers:Record<string,number>,student:boolean)=>courseRequest<OutlineGradeDTO>(student?`/me/courses/${slug}/outline-progress/chapters/${chapterId}/grade`:`/courses/${slug}/outline/chapters/${chapterId}/grade`,'POST',{answers}),
};
