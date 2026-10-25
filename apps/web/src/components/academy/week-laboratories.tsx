'use client';
import type {Lab} from '@qapath/contracts';
import {LearningEvidence} from './learning-evidence';
import {LearningDisclosure} from './learning-disclosure';
export function WeekLaboratories({labs}:{labs:Lab[]}){
 if(!labs.length)return null;
 return <LearningDisclosure id="week-laboratories" title="Laboratorios de esta semana" description="Aplica lo aprendido y adjunta tu evidencia. Los laboratorios compartidos conservan el mismo registro entre semanas del módulo."><div className="lab-grid">{labs.map(lab=><article id={`lab-${lab.id}`} tabIndex={-1} className="lab-card" key={lab.id}><div className="lab-header"><span className="pill">{lab.level}</span><span>{lab.time}</span></div><h3>{lab.title}</h3><p>{lab.desc}</p><ul className="bullet-list">{lab.criteria.map(criterion=><li key={criterion}>{criterion}</li>)}</ul><LearningEvidence kind="lab" id={lab.id} title={lab.title}/></article>)}</div></LearningDisclosure>;
}
