import {assessRiskMission,releaseRisks,restoreRiskMission,testLevels} from './risk-mission';
export type RiskEvidenceRun={source:string;at:string;mode:string;output:string;ok:boolean};
export function riskEvidenceSnapshot(execution?:RiskEvidenceRun){
 if(!execution||execution.mode!=='topic')return null;
 try{const raw=JSON.parse(execution.source);if(raw.riskMissionVersion!==1||releaseRisks.some(risk=>{const setting=raw.risks?.[risk.id];return !setting||![setting.probability,setting.impact].every(n=>Number.isInteger(n)&&n>=1&&n<=5)||typeof setting.mitigated!=='boolean'}))return null;
 const mission=restoreRiskMission(execution.source),assessment=assessRiskMission(mission);
 return {at:execution.at,mission,assessment,priorities:assessment.ranked.filter(risk=>mission.priorities.includes(risk.id)),mitigations:assessment.ranked.filter(risk=>risk.mitigated)};
 }catch{return null}
}
export type RiskEvidenceSnapshot=ReturnType<typeof riskEvidenceSnapshot>;
export const riskReflectionPrompts=[
 {title:'¿Por qué estimaste esas probabilidades e impactos?',help:'Elige un riesgo y relaciona tu estimación con la situación y el daño que causaría. No hace falta volver a copiar todos los números.',example:'Estimo un impacto alto para el cobro duplicado porque afecta el dinero del cliente y puede generar reclamaciones. La probabilidad debe justificarse con las señales de la historia.',starter:'Explica qué señales de la historia usaste y qué consecuencias consideraste…'},
 {title:'¿Por qué dedicarías los dos turnos a esos riesgos?',help:'Explica tu prioridad con la exposición actual y las consecuencias. Si hubo un empate, indica qué contexto usarías para decidir.',example:'Asignaría primero un turno al riesgo con mayor exposición. Entre dos riesgos empatados, revisaría el número de personas afectadas y las obligaciones del negocio antes de decidir.',starter:'Relaciona los riesgos que elegiste con el orden de prioridad y explica tu decisión…'},
 {title:'¿Qué cambió con la mitigación y qué falta comprobar?',help:'Distingue la estimación del simulador de una eficacia demostrada. Si no simulaste una mitigación, explica qué medida propondrías y cómo la comprobarías.',example:'La mitigación propone reducir la probabilidad, pero necesito comprobar su eficacia con pruebas y resultados reales. También revisaría el riesgo que queda después de aplicarla.',starter:'Describe la medida, el cambio estimado y la evidencia que necesitarías para confirmar su eficacia…'}
] as const;
export function buildRiskEvidenceMarkdown(snapshot:RiskEvidenceSnapshot,values:readonly string[],labels:readonly string[]){
 const completed=values.filter(value=>value.trim().length>=10).length;
 const lines=['# Semana 2 · Informe de riesgos',`Reflexión: ${completed}/3 respuestas preparadas.`,snapshot?`Última validación: ${snapshot.at}`:'Borrador sin una validación de la misión adjunta.'];
 if(snapshot){lines.push('## Estrategia registrada',`Decisiones acertadas: ${snapshot.assessment.score}/5.`,snapshot.assessment.ok?'Misión resuelta en el simulador.':'Estrategia en revisión.','### Riesgos y exposición',...snapshot.assessment.ranked.map(risk=>`- ${risk.title}: P=${risk.effectiveProbability}, I=${risk.impact}, exposición=${risk.score}${risk.mitigated?` (estimación residual; exposición inicial ${risk.initialScore})`:''}.`),'### Dos turnos de pruebas',snapshot.priorities.length?snapshot.priorities.map(risk=>`- ${risk.title}: ${risk.score}/25.`).join('\n'):'Sin prioridades seleccionadas.','### Niveles elegidos',...snapshot.assessment.feedback.map(item=>`- ${item.title}: ${testLevels.find(level=>level.id===item.chosen)?.label||'Sin seleccionar'} · ${item.correct?'correcto':'por revisar'}.`),'### Mitigaciones simuladas',...(snapshot.mitigations.length?snapshot.mitigations.map(risk=>`- ${risk.title}: ${risk.mitigation} Exposición estimada ${risk.initialScore} → ${risk.score}.`):['No se simularon mitigaciones.']),'Las mitigaciones son hipótesis del ejercicio; no prueban una reducción real del riesgo.')}
 lines.push('## Mi reflexión',...labels.map((label,i)=>`### ${label}\n${values[i]?.trim()||'Sin respuesta todavía.'}`));
 return lines.join('\n\n')+'\n';
}
