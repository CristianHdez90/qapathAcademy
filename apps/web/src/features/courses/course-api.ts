export class CourseApiError extends Error{constructor(readonly status:number,message:string){super(message)}}
export async function courseRequest<T>(path:string,method='GET',payload?:unknown,signal?:AbortSignal):Promise<T>{
 const response=await fetch(`/api/v1${path}`,{method,headers:{Accept:'application/json',...(payload?{'Content-Type':'application/json'}:{})},...(payload?{body:JSON.stringify(payload)}:{}),credentials:'same-origin',cache:'no-store',signal});
 let body;try{body=await response.json()}catch{throw new CourseApiError(response.status,'El servidor no devolvió una respuesta válida.')}
 if(!response.ok)throw new CourseApiError(response.status,body?.error?.message||body?.message||`No fue posible completar la solicitud (HTTP ${response.status}).`);
 return body.data as T;
}
