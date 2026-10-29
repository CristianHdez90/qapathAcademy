import type {StudyGuide} from '@qapath/contracts';

export type StudyStep={id:string;title:string;kind:'intro'|'chapter'|'concept'|'points'|'steps'|'code'|'exercise'|'check'|'notes'|'resources'|'finish'|'foundation'|'closing';chapter?:number;concept?:number};

/** Presentation identities never become academic section identifiers. */
export function studySteps(guide:StudyGuide):StudyStep[]{
 const result:StudyStep[]=[{id:'study-intro',title:'Comienza esta clase',kind:'intro'}];
 const chapter=(index:number,title:string,body:string,concepts=guide.sections[index]?.concepts,points:string[]=[])=>{
  if(body.trim())result.push({id:`chapter-${index}--intro`,title,kind:'chapter',chapter:index});
  const seen=new Set<string>();
  concepts?.forEach((concept,i)=>{
   if(seen.has(concept.id))throw new Error(`Concepto duplicado en capítulo ${index}: ${concept.id}`);
   seen.add(concept.id);result.push({id:`chapter-${index}--concept-${concept.id}`,title:concept.title,kind:'concept',chapter:index,concept:i});
  });
  if(points.length)result.push({id:`chapter-${index}--points`,title:`Puntos clave · ${title}`,kind:'points',chapter:index});
 };
 guide.sections.forEach((section,i)=>chapter(i,section.title,section.body,section.concepts,section.points));
 const i=guide.sections.length;
 chapter(i,guide.example.title,guide.example.context,guide.example.concepts);
 if(!guide.example.concepts&&guide.example.steps.length)result.push({id:`chapter-${i}--steps`,title:'Secuencia del ejemplo',kind:'steps',chapter:i});
 if(guide.example.code)result.push({id:`chapter-${i}--code`,title:`Código · ${guide.example.title}`,kind:'code',chapter:i});
 if(guide.exercise)result.push({id:'practical-exercise',title:`Ejercicio práctico · ${guide.exercise.title}`,kind:'exercise'});
 result.push({id:'self-check',title:'Autoevaluación',kind:'check'});
 if(guide.closingTest)result.push({id:'closing-test',title:`Test de cierre · ${guide.closingTest.moduleTitle}`,kind:'closing'});
 result.push({id:'study-notes',title:'Mis notas',kind:'notes'},{id:'study-resources',title:'Recursos para profundizar',kind:'resources'},{id:'study-finish',title:'Fin del recorrido',kind:'finish'});
 return result;
}

export function resolveStudyStep(hash:string,steps:readonly StudyStep[]):string|undefined{
 const id=hash.replace(/^#/,'');
 if(steps.some(step=>step.id===id))return id;
 if(/^chapter-\d+$/.test(id))return steps.find(step=>`chapter-${step.chapter}`===id)?.id;
 return undefined;
}
