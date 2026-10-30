import type {Week,StudyGuide,ReadingConcept,StudyChapterExperience,ChapterQuestion} from '@qapath/contracts';
import {demonstrationDetails} from '@/features/study/demonstration-details';
function conceptMarkdown(c:ReadingConcept){
 const details=demonstrationDetails(c.demonstration?.stepDetails,c.demonstration?.steps.length||0);
 return '### '+c.title+'\n\n'+c.description+(c.example?'\n\n**Ejemplo aplicado**\n\n- Situación: '+c.example.context+'\n- Qué hace QA: '+c.example.action+'\n- Resultado: '+c.example.result+(c.example.counterexample?'\n- Contraejemplo: '+c.example.counterexample:''):'')+(c.demonstration?'\n\nSecuencia: '+c.demonstration.steps.join(' → '):'')+(details?'\n\n'+details.map((detail,i)=>[
  `#### Paso ${i+1}: ${c.demonstration!.steps[i]}`,`Objetivo: ${detail.goal}`,
  ...(detail.input?[`Entrada: ${detail.input}`]:[]),detail.actions.map((action,j)=>`${j+1}. ${action}`).join('\n'),
  `Evidencia: ${detail.evidence}`,...(detail.roles?.length?[`Participan: ${detail.roles.join(' · ')}`]:[]),...(detail.pitfall?[`Evita: ${detail.pitfall}`]:[]),
 ].join('\n\n')).join('\n\n'):'');
}
function questionMarkdown(question:ChapterQuestion){return question.question+'\n\n'+question.options.map(option=>`- ${option.text}\n  ${option.correct?'Respuesta orientativa. ':''}${option.feedback}`).join('\n')}
function experienceMarkdown(e:StudyChapterExperience){
 return [
  `### Caso y actividad · ${e.id}`,e.notice,`Objetivo: ${e.goal}`,e.hook,
  '#### Tu primera decisión',questionMarkdown(e.openingQuestion),
  `#### ${e.caseStudy.title}`,...e.caseStudy.story,
  ...e.caseStudy.rules.map(rule=>`- ${rule.label}: ${rule.value}`),
  '#### Conversación e inspección ficticias',...e.caseStudy.dialogue.map(line=>`**${line.speaker}:** ${line.text}`),
  '#### Evidencias por preparar',...e.caseStudy.evidence.map(item=>`- ${item.id} · ${item.state}: ${item.description}`),
  ...e.diagrams.map(diagram=>{
   const labels=Object.fromEntries(diagram.nodes.map(node=>[node.id,node.label]));
   return [`#### ${diagram.title}`,...diagram.edges.map(edge=>`- ${labels[edge.from]} → ${edge.label} → ${labels[edge.to]}`),diagram.alternative,...(diagram.mermaid?[`\`\`\`mermaid\n${diagram.mermaid}\n\`\`\``]:[])].join('\n\n');
  }),
  `#### ${e.activity.title}`,e.activity.prompt,...e.activity.decisions.map(questionMarkdown),`Respuesta modelo: ${e.activity.modelAnswer}`,
  '#### Transferencia',e.transfer.prompt,...e.transfer.questions.map(item=>`${item.question}\n\n${item.guide}`),
  '#### Recupera lo aprendido',e.closing.summary,`Error frecuente: ${e.closing.pitfall}`,...e.closing.questions.map(question=>'- '+question),
  '#### Glosario',...e.closing.glossary.map(item=>`- ${item.term}: ${item.meaning}`),
  '#### Referencias',...e.closing.sources.map(source=>`- [${source.title}](${source.url}) · ${source.version} · Consultada ${source.consulted}`),
 ].join('\n\n');
}

export function downloadLesson(week:Week,guide:StudyGuide){
  const md=[`# Semana ${week.id} · ${week.title}`,guide.summary,...guide.sections.map(s=>`## ${s.title}\n\n${s.body}\n\n${(s.concepts||[]).map(conceptMarkdown).join('\n\n')}\n\n${s.points.map(x=>'- '+x).join('\n')}${s.experience?'\n\n'+experienceMarkdown(s.experience):''}`),`## Ejemplo: ${guide.example.title}\n\n${guide.example.context}\n\n${guide.example.concepts?guide.example.concepts.map(conceptMarkdown).join('\n\n'):guide.example.steps.map((x,i)=>`${i+1}. ${x}`).join('\n')}`,...(guide.example.code?[`\n\`\`\`${guide.example.language||'text'}\n${guide.example.code}\n\`\`\``]:[]),`## Reto\n\n${guide.activity}\n\n## Respuesta orientativa\n\n${guide.answer}`,`## Error frecuente\n\n${guide.pitfall}`,...(guide.exercise?[`## Ejercicio práctico adicional: ${guide.exercise.title}\n\n${guide.exercise.objective}\n\n${guide.exercise.steps.map((step,i)=>`${i+1}. ${step.action}\n   Esperado: ${step.expected}`).join('\n')}\n\nEntregables: ${guide.exercise.deliverables.join('; ')}\n\nCriterios: ${guide.exercise.rubric.join('; ')}`]:[])].join('\n\n');
  const url=URL.createObjectURL(new Blob([md],{type:'text/markdown;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=`qapath-semana-${week.id}.md`;a.click();URL.revokeObjectURL(url);
}
