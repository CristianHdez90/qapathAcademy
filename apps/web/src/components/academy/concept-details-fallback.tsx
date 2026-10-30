import type {StudyGuide} from '@qapath/contracts';
import {demonstrationDetails} from '@/features/study/demonstration-details';
import {StepDetailText} from './concept-step-details';

/** Outside all measured chapters; an equivalent readable route when scripting is unavailable. */
export function ConceptDetailsFallback({guide}:{guide:StudyGuide}){
 const concepts=guide.sections.flatMap(section=>section.concepts||[]).filter(concept=>demonstrationDetails(concept.demonstration?.stepDetails,concept.demonstration?.steps.length||0));
 if(!concepts.length)return null;
 return <noscript><aside className="concept-details-fallback" aria-label="Acciones y evidencias sin JavaScript"><h2>Consulta las acciones de cada estado</h2><p>Material de apoyo. Consultarlo no equivale a una ejecución ni registra progreso adicional.</p>{concepts.map(concept=><section key={concept.id}><h3>{concept.title}</h3>{concept.example&&<p>{concept.example.context}</p>}{demonstrationDetails(concept.demonstration!.stepDetails,concept.demonstration!.steps.length)!.map((detail,i)=><details key={i}><summary>Paso {i+1}: {concept.demonstration!.steps[i]}</summary><StepDetailText detail={detail}/></details>)}</section>)}</aside></noscript>;
}
