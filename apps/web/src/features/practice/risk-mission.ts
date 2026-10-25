export const releaseRisks=[
 {id:'payment',icon:'💳',title:'Cobro duplicado',story:'Una persona confirma una compra y recibe dos cargos. El equipo ya vio reintentos de pago en la versión candidata.',effect:'Pérdida de dinero, reclamaciones y confianza.',probability:4,impact:5,mitigation:'Idempotencia y revisión de reintentos del pago.'},
 {id:'stock',icon:'📦',title:'Venta sin existencias',story:'La tienda confirma la venta de un producto agotado cuando dos personas compran al mismo tiempo.',effect:'Pedidos cancelados e incumplimiento de entregas.',probability:3,impact:4,mitigation:'Reserva atómica de existencias y prueba de concurrencia.'},
 {id:'profile',icon:'👤',title:'Nombre de perfil incorrecto',story:'Después de actualizar el nombre, una pantalla conserva el anterior. Los pedidos y los cobros no se alteran.',effect:'Confusión y consultas de soporte sin pérdida de la compra.',probability:3,impact:2,mitigation:'Invalidación de caché y comprobación de actualización.'}
] as const;
export const probabilityLabels=['Muy poco probable','Poco probable','Posible','Probable','Muy probable'];
export const impactLabels=['Menor','Limitado','Moderado','Grave','Crítico'];
export const testLevels=[{id:'component',label:'Componente / unitaria'},{id:'integration',label:'Integración'},{id:'system',label:'Sistema'},{id:'acceptance',label:'Aceptación'}] as const;
export const levelChallenges=[
 {id:'calculation',icon:'∑',title:'La función que calcula el descuento',situation:'Compruebas una función aislada con entradas conocidas, sin conectar otros servicios.',answer:'component',reason:'El alcance es un componente aislado; aquí se comprueba su lógica interna.'},
 {id:'collaboration',icon:'⇄',title:'Pagos conversa con pedidos',situation:'Compruebas que dos servicios intercambien correctamente el resultado de un pago.',answer:'integration',reason:'Se comprueba la colaboración y el contrato entre servicios.'},
 {id:'journey',icon:'▣',title:'La tienda como producto completo',situation:'Compruebas el flujo de compra del sistema completo en un entorno de pruebas contra sus requisitos de sistema.',answer:'system',reason:'El objeto de prueba es el sistema completo y su comportamiento frente a requisitos de sistema.'},
 {id:'business',icon:'✓',title:'La persona de negocio acepta el incremento',situation:'El Product Owner y una persona usuaria evalúan si la compra satisface los criterios de aceptación acordados y la necesidad de negocio.',answer:'acceptance',reason:'El propósito es evaluar la aceptabilidad y la necesidad de negocio; no se determina solo por usar una pantalla.'}
] as const;
export type RiskSetting={probability:number;impact:number;mitigated:boolean};
export type RiskMission={riskMissionVersion:1;risks:Record<string,RiskSetting>;priorities:string[];levels:Record<string,string>};
export function defaultRiskMission():RiskMission{return {riskMissionVersion:1,risks:Object.fromEntries(releaseRisks.map(r=>[r.id,{probability:r.probability,impact:r.impact,mitigated:false}])),priorities:[],levels:{}}}
export function restoreRiskMission(source?:string):RiskMission{
 const result=defaultRiskMission();try{const parsed=JSON.parse(source||'{}');if(parsed.riskMissionVersion===1){
  for(const risk of releaseRisks){const setting=parsed.risks?.[risk.id];if(setting&&[setting.probability,setting.impact].every(n=>Number.isInteger(n)&&n>=1&&n<=5)&&typeof setting.mitigated==='boolean')result.risks[risk.id]=setting}
  if(Array.isArray(parsed.priorities))result.priorities=[...new Set<string>(parsed.priorities.filter((id:unknown)=>releaseRisks.some(r=>r.id===id)))].slice(0,2);
  for(const challenge of levelChallenges)if(testLevels.some(level=>level.id===parsed.levels?.[challenge.id]))result.levels[challenge.id]=parsed.levels[challenge.id];
 }else{for(const [id,p,i] of [['payment','paymentP','paymentI'],['profile','profileP','profileI']])if([parsed[p],parsed[i]].every(n=>Number.isInteger(Number(n))&&Number(n)>=1&&Number(n)<=5))result.risks[id]={probability:Number(parsed[p]),impact:Number(parsed[i]),mitigated:false}}
 }catch{}return result;
}
export function riskBand(score:number){return score>=16?'Crítico':score>=10?'Alto':score>=5?'Medio':'Bajo'}
export function rankedRisks(mission:RiskMission){return releaseRisks.map(risk=>{const setting=mission.risks[risk.id];const probability=setting.mitigated?Math.max(1,setting.probability-2):setting.probability;return {...risk,...setting,effectiveProbability:probability,score:probability*setting.impact,initialScore:setting.probability*setting.impact}}).sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id))}
export function assessRiskMission(mission:RiskMission){
 const ranked=rankedRisks(mission),threshold=ranked[1].score,selected=new Set(mission.priorities);
 const priorityOk=selected.size===2&&mission.priorities.length===2&&ranked.filter(r=>r.score>threshold).every(r=>selected.has(r.id))&&mission.priorities.every(id=>ranked.some(r=>r.id===id&&r.score>=threshold));
 const feedback=levelChallenges.map(challenge=>({...challenge,chosen:mission.levels[challenge.id]||'',correct:mission.levels[challenge.id]===challenge.answer}));
 const score=Number(priorityOk)+feedback.filter(item=>item.correct).length;
 return {ok:score===5,score,total:5,priorityOk,ranked,feedback,priorityMessage:priorityOk?'Priorización coherente con las puntuaciones configuradas.':selected.size!==2?'Selecciona dos riesgos para tus dos turnos de pruebas.':'Revisa el orden: los dos turnos deben cubrir las mayores exposiciones actuales. En un empate en el corte se acepta cualquiera de los riesgos empatados.'};
}
