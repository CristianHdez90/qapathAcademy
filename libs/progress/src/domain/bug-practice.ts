export type BugReport={title:string;description:string;environment:string;preconditions:string;steps:string;severity:string;priority:string};
export type BugAction='report'|'triage'|'assign'|'start'|'ready'|'retest'|'fix'|'regression'|'close';
export type BugEvent={action:BugAction;at:string;owner?:string;amount?:number;expected?:number};
export type BugMission={bugLabVersion:1;report:BugReport;reproducedAt?:string;events:BugEvent[]};
export const bugOwners=['Desarrollo · Servicio de cuentas','Desarrollo · API de transferencias'] as const;
export const bugStates=['Sin reportar','Nuevo','En análisis','Asignado','En corrección','Listo para retest','Reabierto','Verificado','Cerrado'] as const;
export const bugActionLabels:Record<BugAction,string>={report:'Reportar bug',triage:'Realizar triage',assign:'Asignar corrección',start:'Iniciar corrección',ready:'Marcar listo para retest',retest:'Ejecutar retest',fix:'Aplicar corrección simulada',regression:'Ejecutar regresión',close:'Cerrar bug'};
export const emptyBugMission=():BugMission=>({bugLabVersion:1,report:{title:'',description:'',environment:'',preconditions:'',steps:'',severity:'',priority:''},events:[]});
export function bugReportErrors(report:BugReport){const errors:string[]=[];for(const [key,label,min] of [['title','título',8],['description','descripción',15],['environment','entorno y versión',5],['preconditions','precondiciones',10]] as const)if(report[key].trim().length<min)errors.push(`Completa ${label} con información concreta (mínimo ${min} caracteres).`);if(report.steps.split('\n').filter(line=>/^\s*\d+[.)]\s+\S/.test(line)).length<3)errors.push('Escribe al menos tres pasos numerados, uno por línea.');if(!['Alta','Media','Baja'].includes(report.severity))errors.push('Selecciona la severidad según el impacto.');if(!['Alta','Media','Baja'].includes(report.priority))errors.push('Selecciona la prioridad según la urgencia.');return errors}
export function assessBugMission(mission:BugMission){
 let state:string='Sin reportar',fixed=false,owner='',failedRetest=false;const transitions:{from:string;to:string;action:BugAction;at:string}[]=[],retests:{at:string;expected:number;observed:number;passed:boolean}[]=[];let regression:{at:string;amount:number;expected:number;observed:number}|null=null;
 const requireState=(states:string[])=>{if(!states.includes(state))throw Error('Esta acción no corresponde al estado actual del bug.')};
 try{for(const event of mission.events){const from=state;switch(event.action){
 case 'report':requireState(['Sin reportar']);if(!mission.reproducedAt)throw Error('Reproduce el fallo antes de reportarlo.');if(bugReportErrors(mission.report).length)throw Error(bugReportErrors(mission.report).join(' '));state='Nuevo';break;
 case 'triage':requireState(['Nuevo']);state='En análisis';break;
 case 'assign':requireState(['En análisis']);if(!bugOwners.some(item=>item===event.owner))throw Error('Elige el equipo responsable de la corrección.');owner=event.owner!;state='Asignado';break;
 case 'start':requireState(['Asignado','Reabierto']);state='En corrección';break;
 case 'fix':requireState(['En corrección']);if(!failedRetest||fixed)throw Error('Primero confirma y reabre el fallo de la versión inicial.');fixed=true;break;
 case 'ready':requireState(['En corrección']);if(failedRetest&&!fixed)throw Error('Aplica la corrección simulada antes de entregar la nueva versión.');state='Listo para retest';break;
 case 'retest':requireState(['Listo para retest']);retests.push({at:event.at,expected:150,observed:fixed?150:195,passed:fixed});if(!fixed)failedRetest=true;state=fixed?'Verificado':'Reabierto';break;
 case 'regression':requireState(['Verificado']);if(![1,100,200].includes(event.amount||0))throw Error('Selecciona otro importe para la regresión.');if(event.expected!==200-event.amount!)throw Error(`Revisa tu predicción: con saldo 200 e importe ${event.amount}, el saldo debe ser ${200-event.amount!}.`);regression={at:event.at,amount:event.amount!,expected:event.expected,observed:200-event.amount!};break;
 case 'close':requireState(['Verificado']);if(!failedRetest||!retests.some(item=>item.passed)||!regression)throw Error('Completa reapertura, retest correcto y regresión antes de cerrar.');state='Cerrado';break;
 default:throw Error('Acción de bug desconocida.');
 }transitions.push({from,to:state,action:event.action,at:event.at})}return {valid:true,error:'',state,fixed,owner,failedRetest,retests,regression,transitions,complete:state==='Cerrado'};
 }catch(error){return {valid:false,error:error instanceof Error?error.message:'Revisa el flujo del bug.',state,fixed,owner,failedRetest,retests,regression,transitions,complete:false}}
}
export function advanceBugMission(mission:BugMission,event:BugEvent):BugMission{
 const events=event.action==='regression'?[...mission.events.filter(item=>item.action!=='regression'),event]:[...mission.events,event];
 const next={...mission,events};const result=assessBugMission(next);if(!result.valid)throw Error(result.error);return next;
}
export function readBugMission(source:string):BugMission|null{
 try{const data=JSON.parse(source);if(data.bugLabVersion!==1||!data.report||!Array.isArray(data.events)||data.events.length>24)return null;
 const report=emptyBugMission().report;for(const [key,max] of [['title',120],['description',300],['environment',120],['preconditions',200],['steps',600],['severity',5],['priority',5]] as const){if(typeof data.report[key]!=='string'||data.report[key].length>max)return null;report[key]=data.report[key]}
 if(data.reproducedAt!==undefined&&(typeof data.reproducedAt!=='string'||!Number.isFinite(Date.parse(data.reproducedAt))))return null;
 const events:BugEvent[]=[];for(const item of data.events){if(!item||!Object.hasOwn(bugActionLabels,item.action)||typeof item.at!=='string'||!Number.isFinite(Date.parse(item.at))||item.owner!==undefined&&(typeof item.owner!=='string'||item.owner.length>80)||item.amount!==undefined&&!Number.isFinite(item.amount)||item.expected!==undefined&&!Number.isFinite(item.expected))return null;events.push({action:item.action,at:item.at,...(item.owner!==undefined?{owner:item.owner}:{}),...(item.amount!==undefined?{amount:item.amount}:{}),...(item.expected!==undefined?{expected:item.expected}:{})})}
 const mission:BugMission={bugLabVersion:1,report,...(data.reproducedAt?{reproducedAt:data.reproducedAt}:{}),events};return assessBugMission(mission).valid?mission:null;
 }catch{return null}
}
