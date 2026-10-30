import type {DemonstrationStepDetail} from '@qapath/contracts';
import './concept-step-details.css';

export function StepDetailText({detail}:{detail:DemonstrationStepDetail}){
 return <><p className="step-detail-goal"><strong>Objetivo</strong>{detail.goal}</p>{detail.input&&<p><strong>Entrada</strong>{detail.input}</p>}<h4>Qué hacer</h4><ol>{detail.actions.map((action,i)=><li key={i}>{action}</li>)}</ol><p className="step-detail-evidence"><strong>Evidencia que debes preparar</strong>{detail.evidence}</p>{!!detail.roles?.length&&<p><strong>Quién puede participar</strong>{detail.roles.join(' · ')}</p>}{detail.pitfall&&<p className="step-detail-caution"><strong>Evita esta confusión</strong>{detail.pitfall}</p>}</>;
}
