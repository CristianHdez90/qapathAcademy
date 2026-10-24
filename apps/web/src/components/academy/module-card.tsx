import Link from 'next/link';
import type {CSSProperties} from 'react';
import type {Module} from '@qapath/contracts';
import type {Progress} from '@qapath/progress';
import {learningModuleStatus,nextLearningAction} from '@/features/progress/learning-navigation';
export function ModuleCard({module,complete=0,progress}:{module:Module;complete?:number;progress?:Progress}){
  const pct=Math.round(100*complete/module.weeks.length);
  const status=progress?learningModuleStatus(progress,module.weeks):complete===module.weeks.length?'Completado':complete?'En curso':'Sin iniciar';
  const next=progress?nextLearningAction(progress,module.weeks):null;
  return <Link href={`/modules/${module.id}`} className="module-card" style={{'--accent':module.color} as CSSProperties}>
    <div className="module-meta"><span className="module-id">MÓDULO {module.number}</span><span className="pill">{module.range}</span></div>
    <div className="module-symbol">{module.icon==='book'?'◈':module.icon==='terminal'?'⌘':module.icon==='code'?'⌥':'◆'}</div>
    <h3>{module.title}</h3><span className={'module-state '+(status==='Completado'?'done':status==='En curso'?'started':'')}><span aria-hidden="true">{status==='Completado'?'✓':status==='En curso'?'◔':'○'}</span> {status}</span><p>{module.summary}</p><div className="chip-row">{module.skills.slice(0,3).map(skill=><span className="skill-chip" key={skill}>{skill}</span>)}</div>
    {next&&<p className="module-next">Siguiente: {next.label} · Semana {next.week}</p>}
    <div className="module-bottom"><div><span>{complete} / {module.weeks.length} semanas</span><span>{pct}%</span></div><div className="progress-line"><i style={{width:`${pct}%`}}/></div></div>
  </Link>;
}
