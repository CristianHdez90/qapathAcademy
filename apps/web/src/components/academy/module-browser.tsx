"use client";
import {useState} from 'react';
import type {Module} from '@qapath/contracts';
import {ModuleCard} from './module-card';
import {useProgress} from '@/features/progress/progress-provider';
export function ModuleBrowser({modules}:{modules:Module[]}){
 const [search,setSearch]=useState('');const [track,setTrack]=useState('Todos');const {state}=useProgress();
 const tracks=['Todos',...Array.from(new Set(modules.map(m=>m.track)))];
 const visible=modules.filter(m=>(track==='Todos'||m.track===track)&&[m.title,m.summary,...m.skills].join(' ').toLowerCase().includes(search.toLowerCase()));
 return <><div className="toolbar"><input className="search-field" type="search" placeholder="Buscar tema, técnica o herramienta..." value={search} onChange={e=>setSearch(e.target.value)} aria-label="Buscar módulos"/><div className="filter-buttons">{tracks.map(t=><button key={t} className={track===t?'filter-button current':'filter-button'} onClick={()=>setTrack(t)}>{t}</button>)}</div></div><div className="module-grid">{visible.map(m=><ModuleCard key={m.id} module={m} complete={m.weeks.filter(w=>state.weeks.includes(w)).length}/>)}</div>{visible.length===0&&<div className="empty-state">No hay módulos que coincidan con la búsqueda.</div>}</>;
}
