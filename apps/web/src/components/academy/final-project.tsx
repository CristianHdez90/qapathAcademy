"use client";
import Link from 'next/link';
import {useProgress} from '@/features/progress/progress-provider';
export function FinalProject({checklist}:{checklist:string[]}){
 const {state,toggle}=useProgress();return <><div className="page-heading"><div><p className="eyebrow">PROYECTO CAPSTONE · SEMANAS 23–24</p><h1>De aprender a demostrar.</h1><p className="page-description">Tu objetivo: crear y documentar una suite E2E y API con Playwright, ejecutable desde CI/CD y defendible ante un equipo técnico.</p></div></div>
 <section className="feature-banner"><span className="feature-icon">⌘</span><div><p className="eyebrow">ESCENARIO DE NEGOCIO</p><h2>Prueba un comercio electrónico</h2><p>Analiza login, catálogo y checkout. Define los riesgos, redacta casos manuales, automatiza recorridos críticos y comunica resultados con evidencia.</p></div><Link href="/study/23" className="button button-outline">Ir a semana 23 ↗</Link></section>
 <div className="section-head compact"><div><p className="eyebrow">ENTREGABLES</p><h2>Checklist profesional</h2></div><span className="pill">{state.final.length} / {checklist.length}</span></div>
 <div className="final-list">{checklist.map((item,i)=><label className="final-row" key={i}><input type="checkbox" checked={state.final.includes(i)} onChange={()=>toggle('final',i)}/><span className="final-num">{String(i+1).padStart(2,'0')}</span><span>{item}</span></label>)}</div>
 <div className="callout-info"><strong>Definition of Done del proyecto</strong><p>Debe ejecutarse desde un clon limpio del repositorio, sin secretos, con instrucciones reproducibles, pruebas estables, pipeline y riesgos conocidos documentados.</p></div>
 </>;
}
