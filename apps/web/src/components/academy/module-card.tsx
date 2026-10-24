import Link from 'next/link';
import type {CSSProperties} from 'react';
import type {Module} from '@qapath/contracts';
export function ModuleCard({module,complete=0}:{module:Module;complete?:number}){
  const pct=Math.round(100*complete/module.weeks.length);
  return <Link href={`/modules/${module.id}`} className="module-card" style={{'--accent':module.color} as CSSProperties}>
    <div className="module-meta"><span className="module-id">MÓDULO {module.number}</span><span className="pill">{module.range}</span></div>
    <div className="module-symbol">{module.icon==='book'?'◈':module.icon==='terminal'?'⌘':module.icon==='code'?'⌥':'◆'}</div>
    <h3>{module.title}</h3><p>{module.summary}</p><div className="chip-row">{module.skills.slice(0,3).map(skill=><span className="skill-chip" key={skill}>{skill}</span>)}</div>
    <div className="module-bottom"><div><span>{complete} / {module.weeks.length} semanas</span><span>{pct}%</span></div><div className="progress-line"><i style={{width:`${pct}%`}}/></div></div>
  </Link>;
}
