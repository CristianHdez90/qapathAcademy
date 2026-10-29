import type {Module,Week,PublicQuestion,Lab,Resource,StudyGuide,ScrumData} from '@qapath/contracts';
/** Cliente HTTP del frontend; no importa servicios, repositorios ni Domain del backend. */
export class ApiError extends Error {constructor(readonly status:number,message:string){super(message);this.name='ApiError';}}
async function get<T>(path:string):Promise<T>{
 const url=(process.env.API_INTERNAL_URL||'http://localhost:4000').replace(/\/$/,'')+`/api/v1${path}`;
 const response=await fetch(url,{cache:'no-store',headers:{Accept:'application/json'}});
 if(!response.ok)throw new ApiError(response.status,`API: HTTP ${response.status} en ${path}`);
 const envelope:unknown=await response.json();
 if(!envelope||typeof envelope!=='object'||!('data' in envelope))throw new ApiError(502,'Respuesta API inválida');
 return (envelope as {data:T}).data;
}
export type ModuleOverview=Module&{weekDetails:Week[]};
export type ModuleDetailDTO={module:Module;weeks:Week[];quiz:PublicQuestion[];labs:Lab[];resources:Resource[]};
export type LessonDTO={week:Week;guide:StudyGuide};
export const academyApi={
 appearance:()=>get<import('@qapath/contracts').PublishedAppearanceDTO>('/appearance/home'),
 course:(slug:string)=>get<import('@qapath/contracts').CourseDTO>(`/courses/${encodeURIComponent(slug)}`),
 courseLessons:(slug:string)=>get<import('@qapath/contracts').LessonSummaryDTO[]>(`/courses/${encodeURIComponent(slug)}/lessons`),
 courseLesson:(slug:string,id:string)=>get<import('@qapath/contracts').LessonDTO>(`/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(id)}`),
 modules:()=>get<ModuleOverview[]>('/modules'),
 module:(id:string)=>get<ModuleDetailDTO>(`/modules/${encodeURIComponent(id)}`),
 lesson:(week:number)=>get<LessonDTO>(`/lessons/${week}`),
 scrum:()=>get<ScrumData>('/scrum'),
 resources:()=>get<Resource[]>('/resources'),
 finalChecklist:()=>get<string[]>('/project/checklist')
};
