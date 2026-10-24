"use client";
import {useRef,useState} from 'react';
import {useProgress} from '@/features/progress/progress-provider';
import type {Resource} from '@qapath/contracts';
import {CtflCard} from './ctfl-card';
export function Resources({resources}:{resources:Resource[]}){
 const {state,exportJson,importJson,remote}=useProgress();const input=useRef<HTMLInputElement>(null);const [message,setMessage]=useState('');
 const importFile=async(file?:File)=>{if(!file)return;try{await importJson(file);setMessage(remote?'Notas recuperadas. El avance se calcula con las actividades registradas en tu cuenta.':'Respaldo local recuperado; avance recalculado.')}catch(e){setMessage(e instanceof Error?e.message:'No fue posible importar el archivo.')}};
 return <><div className="page-heading"><div><p className="eyebrow">BIBLIOTECA + CONFIGURACIÓN</p><h1>Recursos y progreso</h1><p className="page-description">Tu caja de herramientas: documentación oficial y copia de seguridad de tus avances.</p></div></div>
 <CtflCard/><div className="section-head compact"><div><p className="eyebrow">FUENTES DE REFERENCIA</p><h2>Biblioteca profesional</h2></div></div><div className="resource-grid">{resources.map(r=><a key={r.url} className="resource-card" href={r.url} target="_blank" rel="noopener noreferrer"><span className="pill">{r.type}</span><h3>{r.title} ↗</h3><p>{r.description}</p></a>)}</div>
 <div className="section-head compact"><div><p className="eyebrow">TUS DATOS</p><h2>Respaldo de aprendizaje</h2></div></div>
 <div className="backup-panel"><div><h3>Tu progreso {remote?'se sincroniza en PostgreSQL':'permanece en este dispositivo'}</h3><p>Has completado {state.weeks.length} semanas y estudiado {state.read.length} clases. Puedes exportar una copia de seguridad de tus avances. {remote?'Tus avances están asociados a tu cuenta.':'Crea una cuenta para sincronizar tus avances en PostgreSQL.'}</p></div><div className="backup-actions"><button className="button button-primary" onClick={exportJson}>↓ Exportar progreso</button><button className="button button-outline" onClick={()=>input.current?.click()}>↑ Importar respaldo</button><input ref={input} type="file" accept="application/json,.json" hidden onChange={e=>{void importFile(e.target.files?.[0]);e.target.value=''}}/>{message&&<p role="status" className="hint">{message}</p>}</div></div>
 </>;
}
