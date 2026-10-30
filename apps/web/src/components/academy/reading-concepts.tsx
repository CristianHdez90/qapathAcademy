import type {ReactNode} from 'react';
import type {ReadingConcept} from '@qapath/contracts';
import {ConceptStepIcon} from './concept-step-icon';
import './reading-concepts.css';
const symbols:Record<string,ReactNode>={
 cycle:<><path d="M20 8a9 9 0 0 0-15-3L2 8m0-5v5h5m-3 8a9 9 0 0 0 15 3l3-3m0 5v-5h-5"/></>,
 layers:<><path d="m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5"/></>,
 code:<><path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-15-2 18"/></>,
 team:<><circle cx="8" cy="7" r="3"/><path d="M2 21v-3a6 6 0 0 1 12 0v3m2-17a3 3 0 0 1 0 6m1 3a6 6 0 0 1 5 5v3"/></>,
 clock:<><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
 chart:<><path d="M4 3v18h17M8 16v-4m5 4V8m5 8V5"/></>,
 launch:<><path d="M14 4h6v6m0-6L9 15m1-11H4v16h16v-6"/></>,
 grid:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
 qa:<><path d="M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z"/><path d="m8 12 3 3 5-6"/></>,
 qc:<><rect x="5" y="5" width="14" height="16" rx="2"/><path d="M9 3h6v4H9zM9 12h6m-6 4h4"/></>,
 testing:<><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6m-14-11 2 2 4-4"/></>,
 error:<><circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3m-7-6v3m0 3h.01"/></>,
 defect:<><path d="m8 5-2-2m10 2 2-2M3 10h4m10 0h4M3 16h4m10 0h4M12 8v12"/><rect x="7" y="5" width="10" height="15" rx="5"/></>,
 failure:<><path d="m12 3 10 18H2L12 3Zm0 6v5m0 3h.01"/></>,
 verification:<><path d="m4 7 2 2 3-4m-5 10 2 2 3-4m4-6h7m-7 8h7"/></>,
 validation:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="m10 12 2 2 4-5"/></>,
};
const aliases:Record<string,string>={
 sdlc:'cycle',stlc:'verification',iteration:'cycle',refinement:'team',development:'code',release:'launch',
 presence:'testing',exhaustive:'grid',early:'clock',cluster:'grid',refresh:'cycle',context:'layers',useful:'validation',
 unit:'code',integration:'layers',system:'grid',acceptance:'validation',functional:'verification',nonfunctional:'chart',
 smoke:'qa',regression:'cycle',explore:'testing',e2e:'launch',sanity:'team',automation:'code',
 risk:'failure',measure:'chart',impact:'layers',identify:'testing',estimate:'chart',controls:'qa',reevaluate:'cycle',
 high:'failure',medium:'chart',low:'verification',priority:'layers',evidence:'qc',
};
export function ReadingConcepts({concepts}:{concepts:ReadingConcept[]}){
 return <dl className="reading-concepts">{concepts.map(concept=><div className={`reading-concept reading-concept-${concept.id}`} key={concept.id}><dt><span className="reading-concept-icon" aria-hidden="true">{concept.demonstration?.icons?<ConceptStepIcon conceptId={concept.id} index={0} icon={concept.demonstration.icons[0]}/>:<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" focusable="false">{symbols[concept.id]||symbols[aliases[concept.id]]||<path d="M4 4h7v16H4zm9 0h7v16h-7"/>}</svg>}</span><span className="reading-concept-title">{concept.title}</span></dt><dd>{concept.description}{concept.example&&<span className="concept-example"><span className="concept-example-title">Ejemplo aplicado · situación de trabajo</span><span><b>Situación:</b> {concept.example.context}</span><span><b>Qué hace QA:</b> {concept.example.action}</span><span><b>Resultado:</b> {concept.example.result}</span>{concept.example.counterexample&&<span><b>Contraejemplo:</b> {concept.example.counterexample}</span>}</span>}</dd></div>)}</dl>;
}
