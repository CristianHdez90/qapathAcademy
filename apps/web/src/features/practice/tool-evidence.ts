import type {PracticeRun} from '@/components/academy/practice-execution';
export type ToolMode='http'|'sql'|'git'|'devtools';
export type ToolSnapshot=Pick<PracticeRun,'mode'|'source'|'output'|'at'|'ok'|'endpoint'|'method'|'expectedStatus'>;
export type ToolRuns=Partial<Record<ToolMode,ToolSnapshot>>;
export const toolNames:Record<ToolMode,string>={http:'Postman y HTTP',sql:'Base de datos SQL',git:'Comandos Git',devtools:'DevTools'};
export function toolSnapshot(value:unknown):ToolSnapshot|null{
 if(!value||typeof value!=='object')return null;const v=value as Record<string,unknown>;
 if(!['http','sql','git'].includes(String(v.mode))||typeof v.source!=='string'||v.source.length>6000||typeof v.output!=='string'||v.output.length>2500||typeof v.at!=='string'||!Number.isFinite(Date.parse(v.at))||typeof v.ok!=='boolean'||typeof v.endpoint!=='string'||v.endpoint.length>200||typeof v.method!=='string'||v.method.length>10||typeof v.expectedStatus!=='number'||!Number.isInteger(v.expectedStatus)||v.expectedStatus<0||v.expectedStatus>599)return null;
 return {mode:v.mode as ToolSnapshot['mode'],source:v.source,output:v.output,at:v.at,ok:v.ok,endpoint:v.endpoint,method:v.method,expectedStatus:v.expectedStatus};
}
export function readToolRuns(run?:PracticeRun):ToolRuns{
 const runs:ToolRuns={};for(const mode of ['http','sql','git','devtools'] as const){const item=toolSnapshot(run?.toolRuns?.[mode]);if(item&&(item.mode===mode||(mode==='devtools'&&item.mode==='http')))runs[mode]=item;}
 const latest=toolSnapshot(run);if(latest)runs[run?.toolKey==='devtools'&&latest.mode==='http'?'devtools':latest.mode as ToolMode]=latest;return runs;
}
export function mergeToolRun(runs:ToolRuns,run:PracticeRun,slot:ToolMode=run.mode as ToolMode){
 const next={...runs};const snapshot=toolSnapshot(run);if(snapshot)next[slot]=snapshot;
 const others={...next};delete others[slot];return {runs:next,execution:{...run,toolKey:slot,toolRuns:others}};
}
export const toolReflectionPrompts=[
 {title:'¿Qué comprobaste en la API?',hint:'Indica endpoint y método. Compara status, headers y cuerpo. Explica por qué un 401 y un 403 representan situaciones diferentes.'},
 {title:'¿Qué comprobaste en los datos?',hint:'Describe tu SELECT o JOIN: ¿qué filas esperabas y cuáles obtuviste? LEFT JOIN conserva al cliente sin pedidos.'},
 {title:'¿Qué descubriste con DevTools y cómo lo entregarías?',hint:'Compara Network y Console con la interfaz. Explica dónde aparece la diferencia y adjunta evidencia externa de Postman solo si la ejecutaste.'}
];
export function buildToolEvidence(run:PracticeRun|undefined,values:string[],labels:string[]){
 const runs=readToolRuns(run),lines=['# Semana 7 · Bitácora Postman, DevTools y SQL','Se conserva la última ejecución de cada herramienta. Las ejecuciones del navegador no demuestran una ejecución externa de Postman.'];
 for(const mode of ['http','devtools','sql'] as const){const item=runs[mode];lines.push('## '+toolNames[mode]);if(!item){lines.push('Sin ejecución registrada.');continue;}lines.push('Fecha: '+item.at+' · '+(item.ok?'Comprobación correcta':'Resultado por revisar'), '### Configuración ejecutada',item.source,'### Resultado obtenido y comprobaciones',item.output);}
 labels.forEach((label,i)=>lines.push('## '+label,values[i]?.trim()||'Reflexión opcional pendiente.'));return lines.join('\n\n');
}
