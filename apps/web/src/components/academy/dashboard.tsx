"use client";
import Link from 'next/link';
import {useProgress} from '@/features/progress/progress-provider';
import {progressPercentage} from '@qapath/progress';
import {ModuleCard} from './module-card';
import type {Module,Week} from '@qapath/contracts';
export function Dashboard({modules,weeks}:{modules:Module[];weeks:Week[]}){
 const {state}=useProgress();const next=weeks.find(w=>!state.weeks.includes(w.id))||weeks.at(-1)!;const progress=progressPercentage(state);
 return <>
  <div className="topbar"><span>✦ RUTA FORMATIVA 2026</span><span className="online"><i/> Formación autodirigida</span></div>
  <section className="hero"><div className="hero-copy"><div className="hero-label">UNA RUTA. UN NUEVO NIVEL.</div><h1>Domina el <em>testing.</em><br/>Construye calidad.</h1><p>De QA Manual a Automation Engineer con Playwright y TypeScript. Aprende como lo harías en un equipo real de producto.</p><div className="hero-actions"><Link className="button button-primary" href={`/study/${next.id}`}>Continuar aprendiendo <span>↗</span></Link><Link className="button button-outline" href="/scrum">Explorar Scrum</Link></div></div><div className="hero-visual" aria-hidden="true"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-code"><div><span className="dot salmon"/><span className="dot gold"/><span className="dot green"/><small>login.spec.ts</small></div><code><span className="accent-purple">test</span>(<span className="accent-green">&apos;login válido&apos;</span>, async () =&gt; &#123;<br/> &nbsp; await page.<span className="accent-purple">goto</span>(url);<br/> &nbsp; await <span className="accent-blue">expect</span>(page)<br/> &nbsp; &nbsp; .toHaveURL(<span className="accent-green">/dashboard/</span>);<br/>&#125;);</code></div></div></section>
  <div className="metrics"><div className="metric"><span>MÓDULOS</span><strong>08</strong><small>De fundamentos a CI/CD</small></div><div className="metric"><span>LECCIONES</span><strong>24</strong><small>Contenido práctico</small></div><div className="metric"><span>PROGRESO</span><strong>{progress}%</strong><small>{state.weeks.length} semanas terminadas</small></div><div className="metric"><span>LABORATORIOS</span><strong>12</strong><small>Retos reales</small></div></div>
  <div className="section-head"><div><p className="eyebrow">TU HOJA DE RUTA</p><h2>Aprende a tu ritmo</h2><p>Una progresión técnica que conecta el análisis de riesgos con la automatización profesional.</p></div><Link className="text-link" href="/modules">Ver todos los módulos ↗</Link></div>
  <div className="module-grid">{modules.slice(0,4).map(module=><ModuleCard key={module.id} module={module} complete={module.weeks.filter(w=>state.weeks.includes(w)).length}/>)}</div>
  <section className="feature-banner"><span className="feature-icon">◈</span><div><p className="eyebrow">CLASE INTRODUCTORIA · SCRUM</p><h2>Antes del primer test, entiende cómo trabaja tu equipo.</h2><p>Explora un equipo interdisciplinario, su organigrama, las ceremonias y el recorrido completo de una historia de usuario.</p></div><Link href="/scrum" className="button button-outline">Explorar clase ↗</Link></section>
 </>;
}
