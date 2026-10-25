export const sprintEvents = [
 {id:'goal',situation:'Acordar por qué este Sprint aporta valor y planificar el trabajo.',answer:'planning'},
 {id:'blocker',situation:'Inspeccionar el avance hacia el Sprint Goal y adaptar el plan del día.',answer:'daily'},
 {id:'results',situation:'Inspeccionar el resultado con stakeholders y decidir adaptaciones del producto.',answer:'review'},
 {id:'improve',situation:'Mejorar la calidad y la efectividad del trabajo del equipo.',answer:'retro'}
] as const;
export type SprintPractice={sprintLabVersion:1;goal:string;events:Record<string,string>;planned:number;passed:number;failed:number;blocked:number;predictedExecuted:string;predictedApproval:string;dod:string;improvement:string;validatedAt?:string};
export function emptySprintPractice():SprintPractice{return {sprintLabVersion:1,goal:'',events:{},planned:25,passed:17,failed:2,blocked:1,predictedExecuted:'',predictedApproval:'',dod:'',improvement:''}}
export function sprintMetrics(data:SprintPractice){
 const valid=[data.planned,data.passed,data.failed,data.blocked].every(n=>Number.isInteger(n)&&n>=0&&n<=100)&&data.planned>0&&data.passed+data.failed+data.blocked<=data.planned;
 const executed=data.passed+data.failed;return {valid,executed,remaining:data.planned-executed-data.blocked,execution:valid?Math.round(executed/data.planned*100):0,approval:valid&&executed?Math.round(data.passed/executed*100):null,done:valid&&data.passed===data.planned};
}
export function assessSprintPractice(data:SprintPractice){
 const metrics=sprintMetrics(data),planning=data.goal.trim().length>=10&&sprintEvents.every(item=>data.events[item.id]===item.answer);
 const execution=metrics.valid&&data.predictedExecuted.trim()!==''&&Number(data.predictedExecuted)===metrics.executed&&(metrics.approval===null?data.predictedApproval==='na':data.predictedApproval.trim()!==''&&Number(data.predictedApproval)===metrics.approval);
 const closure=metrics.valid&&data.dod===(metrics.done?'done':'pending')&&['prepare-data','add-regression'].includes(data.improvement);
 return {metrics,planning,execution,closure,complete:planning&&execution&&closure};
}
export function readSprintPractice(source:string):SprintPractice|null{
 try{const data=JSON.parse(source);if(data?.sprintLabVersion!==1)return null;
 for(const [key,max] of [['goal',200],['predictedExecuted',5],['predictedApproval',5],['dod',10],['improvement',30]] as const)if(typeof data[key]!=='string'||data[key].length>max)return null;
 if(!data.events||typeof data.events!=='object'||Array.isArray(data.events))return null;
 const events:Record<string,string>={};for(const item of sprintEvents){const value=data.events[item.id];if(value!==undefined&&(typeof value!=='string'||value.length>20))return null;if(value!==undefined)events[item.id]=value;}
 for(const key of ['planned','passed','failed','blocked'])if(typeof data[key]!=='number'||!Number.isInteger(data[key])||data[key]<0||data[key]>100)return null;
 if(data.validatedAt!==undefined&&(typeof data.validatedAt!=='string'||!Number.isFinite(Date.parse(data.validatedAt))))return null;
 return {sprintLabVersion:1,goal:data.goal,events,planned:data.planned,passed:data.passed,failed:data.failed,blocked:data.blocked,predictedExecuted:data.predictedExecuted,predictedApproval:data.predictedApproval,dod:data.dod,improvement:data.improvement,...(data.validatedAt?{validatedAt:data.validatedAt}:{})};
 }catch{return null}
}
