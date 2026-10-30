import type {FoundationCard,FoundationChapter} from '@qapath/contracts';

/** Pregunta sugerida a MariBug: etiqueta corta del botón y texto completo que se envía. */
export type ReadingSuggestion=[label:string,prompt:string];
export const ASK_LIA_CONTEXT_EVENT='qapath:ask-lia-context';
export type ReadingContext={topic:string;week:number;prompt:string;suggestions:ReadingSuggestion[]};

const clip=(text:string,max=220)=>{const value=text.replace(/\s+/g,' ').trim();return value.length>max?value.slice(0,max-1)+'…':value};
const guard=' No me des la respuesta de los minitests de la plataforma.';

/** Sugerencias para una tarjeta de Fundamentos: usan su objetivo, su ejemplo y su evidencia, nunca las respuestas del minitest. */
export function cardSuggestions(course:string,card:FoundationCard):ReadingSuggestion[]{
 const where=`En el curso «${course}», tarjeta «${card.title}».`;
 return [
  ['Explícamelo con otro ejemplo',`${where} Explícame con un ejemplo distinto al de la lectura: ${clip(card.objective)}`],
  ['¿Por qué esa decisión de QA?',`${where} En la situación «${clip(card.example.situation)}» la decisión de QA fue «${clip(card.example.qaDecision)}». ¿Por qué es adecuada y qué alternativa sería un error?`],
  ['¿Qué evidencia guardo?',`${where} ¿Qué evidencia debería guardar en un caso así y por qué «${clip(card.example.evidence,160)}» es suficiente o insuficiente?`],
  ['Hazme una pregunta de práctica',`${where} Hazme una pregunta de práctica nueva sobre este tema y corrígeme después de que responda.${guard}`],
 ];
}

/** Sugerencias para las demás partes de un capítulo de Fundamentos (presentación, caso, mapa, globos, actividad, cierre). */
export function chapterSuggestions(course:string,chapter:FoundationChapter,part:string):ReadingSuggestion[]{
 const where=`En el curso «${course}», capítulo «${chapter.title}».`;
 const byPart:Record<string,ReadingSuggestion>={
  case:['¿Qué haría yo en este caso?',`${where} Dame un caso parecido al del equipo y pregúntame qué haría como QA, paso a paso.`],
  map:['Explícame el mapa',`${where} Explícame las relaciones del mapa del capítulo con un ejemplo de un equipo Scrum.`],
  apply:['¿Qué evidencia hay en cada estado?',`${where} Para el flujo «${clip(chapter.balloons?.title??chapter.title)}», ¿qué evidencia debería existir en cada estado y quién la produce?`],
  activity:['Dame más ejemplos para clasificar',`${where} Dame tres situaciones nuevas para clasificar según lo que aprendí y corrígeme cuando responda.`],
  transfer:['Revisa mi entregable',`${where} Voy a escribir mi entregable del capítulo. Revísalo con estos criterios: ${clip((chapter.transfer?.rubric??[]).join('; '),300)}`],
  closing:['Resume lo esencial',`${where} Resume en cinco ideas lo esencial y dime cuál es el error más frecuente al aplicarlo.`],
 };
 const list:ReadingSuggestion[]=[
  ...(byPart[part]?[byPart[part]]:[]),
  ['Explícame el capítulo',`${where} Explícame el objetivo «${clip(chapter.outcome)}» con un ejemplo real de QA.`],
  ['¿Cómo se aplica en un equipo Scrum?',`${where} ¿Cómo se aplica esto en el día a día de un equipo Scrum (refinamiento, sprint, review)?`],
  ['Hazme una pregunta de práctica',`${where} Hazme una pregunta de práctica y corrígeme después de que responda.${guard}`],
 ];
 return list.slice(0,4);
}

/** Sugerencias genéricas para la lectura enfocada del resto de cursos. */
export function stepSuggestions(course:string,week:number,title:string,detail?:string):ReadingSuggestion[]{
 const where=`En el curso «${course}», semana ${week}, tema «${title}».`;
 return [
  ['Explícamelo con un ejemplo',`${where} Explícamelo con un ejemplo práctico de QA${detail?`, partiendo de esto: ${clip(detail)}`:''}.`],
  ['Errores frecuentes',`${where} ¿Cuáles son los errores más frecuentes al aplicarlo y cómo los detecto?`],
  ['¿Cómo lo uso en mi equipo?',`${where} ¿Cómo lo aplico en un equipo Scrum y qué evidencia debería dejar?`],
  ['Hazme una pregunta de práctica',`${where} Hazme una pregunta de práctica y corrígeme después de que responda.`],
 ];
}

/** Publica el contexto de lectura actual para que MariBug actualice sus sugerencias sin abrirse ni tocar el borrador. */
export function publishReadingContext(context:ReadingContext){
 if(typeof window!=='undefined')window.dispatchEvent(new CustomEvent(ASK_LIA_CONTEXT_EVENT,{detail:context}));
}
