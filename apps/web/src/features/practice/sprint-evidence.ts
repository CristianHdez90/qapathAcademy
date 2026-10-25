import {readSprintPractice,assessSprintPractice} from '@qapath/progress';
export const sprintReflections=[
 {title:'¿Cómo ayuda el objetivo a elegir el trabajo?',hint:'Relaciona el Sprint Goal con la transferencia y explica qué revisarías en Planning y en la Daily.'},
 {title:'¿Qué dicen las métricas y qué no dicen?',hint:'Separa ejecutados / planificados de aprobados / ejecutados. Un bloqueado sin ejecutar no forma parte del segundo denominador.'},
 {title:'¿Qué presentarías y qué mejorarías?',hint:'En Review comunica resultados y pendientes. En Retrospective propone una acción concreta para mejorar el proceso.'}
];
export function buildSprintEvidence(source:string|undefined,values:string[],labels:string[]):string{
 const data=readSprintPractice(source||'');const lines=['# Semana 6 · Bitácora de Sprint QA'];
 if(data){const {metrics:m,complete}=assessSprintPractice(data);lines.push('## Configuración',data.goal||'Objetivo aún por definir',
 'Planificados: '+data.planned+'; aprobados: '+data.passed+'; fallidos: '+data.failed+'; bloqueados sin ejecutar: '+data.blocked+'.',
 'Eventos elegidos: '+Object.entries(data.events).map(([key,value])=>key+': '+value).join('; '),
 '## Predicción del estudiante','Ejecutados: '+(data.predictedExecuted||'pendiente')+'; aprobación: '+(data.predictedApproval||'pendiente')+'.',
 '## Resultado calculado',m.valid?'Ejecutados: '+m.executed+'/'+data.planned+' ('+m.execution+' %). Aprobación: '+data.passed+'/'+m.executed+' ('+(m.approval===null?'No aplica':m.approval+' %')+'). Bloqueados: '+data.blocked+'; restantes sin ejecutar: '+m.remaining+'.':'Configuración inconsistente: no se emiten porcentajes.',
 'DoD elegida: '+(data.dod||'pendiente')+'. Mejora elegida: '+(data.improvement||'pendiente')+'.',
 'Estado: '+(complete&&data.validatedAt?'Misión validada · '+data.validatedAt:'Borrador · pendiente de validación')+'.');}
 else lines.push('Todavía no hay una ejecución del nuevo laboratorio.');
 labels.forEach((label,i)=>lines.push('## '+label,values[i]?.trim()||'Reflexión pendiente (opcional).'));
 return lines.join('\n\n');
}
