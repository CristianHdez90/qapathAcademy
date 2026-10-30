'use client';
import {useRef,useState} from 'react';
import {checkStudyFile,MAX_FILES_PER_LESSON,STUDY_FILE_ACCEPT,type StudyFileKind} from '@qapath/contracts';
import {KIND_LABEL} from './course-lessons';
/** Archivo en un editor: existente (id) o recién cargado (pendiente de guardar). */
export type StudyItem={key:string;id?:string;filename:string;kind?:StudyFileKind;content:string;error?:string};
const kb=(text:string)=>`${Math.max(1,Math.round(new TextEncoder().encode(text).length/1000))} KB`;
/** Lee y valida en el navegador (mismo validador que la API) para avisar antes de guardar. */
export async function readStudyFiles(list:FileList|File[]):Promise<StudyItem[]>{
 return Promise.all([...list].map(async file=>{
  const raw=file.size>400_000?'':await file.text(),result=raw?checkStudyFile(file.name,raw):{ok:false as const,message:'El archivo supera 400 KB.'};
  return result.ok?{key:crypto.randomUUID(),filename:file.name,kind:result.kind,content:result.content}:{key:crypto.randomUUID(),filename:file.name,content:'',error:result.message};
 }));
}
/** Zona para arrastrar o seleccionar archivos .md/.mmd/.json/.svg, con orden y retiro. */
export function StudyFilesField({items,onChange,onAdded,label='Cargar archivos de estudio'}:{items:StudyItem[];onChange:(items:StudyItem[])=>void;onAdded?:(added:StudyItem[])=>void;label?:string}){
 const input=useRef<HTMLInputElement>(null),[dragging,setDragging]=useState(false);
 const add=async(list:FileList|File[])=>{const read=await readStudyFiles(list);onChange([...items,...read].slice(0,MAX_FILES_PER_LESSON));onAdded?.(read)};
 const move=(index:number,delta:number)=>{const next=[...items];const [item]=next.splice(index,1);next.splice(index+delta,0,item);onChange(next)};
 return <>
  <div className={`lesson-dropzone${dragging?' is-dragging':''}`} onDragOver={e=>{e.preventDefault();setDragging(true)}} onDragLeave={()=>setDragging(false)} onDrop={e=>{e.preventDefault();setDragging(false);void add(e.dataTransfer.files)}}>
   <svg viewBox="0 0 24 24" aria-hidden="true" width="34" height="34"><path d="M12 15V4m0 0L8 8m4-4 4 4M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/></svg>
   <p><strong>Arrastra aquí tus archivos</strong> o</p>
   <button type="button" className="button button-outline" onClick={()=>input.current?.click()}>Seleccionar archivos</button>
   <input ref={input} className="sr-only" type="file" multiple accept={`${STUDY_FILE_ACCEPT},.drawio,.puml`} aria-label={label} onChange={e=>{if(e.target.files)void add(e.target.files);e.target.value=''}}/>
   <p className="hint">.md (texto, a la izquierda) · .mmd, .json y .svg (gráficas, a la derecha) — hasta {MAX_FILES_PER_LESSON} archivos.</p>
  </div>
  {items.length>0&&<ol className="lesson-file-list">{items.map((item,index)=><li key={item.key} className={item.error?'has-error':undefined}>
   <div><strong>{item.filename}</strong><small>{item.error?<span role="alert">{item.error}</span>:<>{KIND_LABEL[item.kind!]} · {kb(item.content)}{!item.id&&' · nuevo'}</>}</small></div>
   <div className="course-toolbar"><button type="button" className="button button-outline" disabled={index===0} aria-label={`Subir ${item.filename}`} onClick={()=>move(index,-1)}>↑</button><button type="button" className="button button-outline" disabled={index===items.length-1} aria-label={`Bajar ${item.filename}`} onClick={()=>move(index,1)}>↓</button><button type="button" className="button button-outline" aria-label={`Retirar ${item.filename}`} onClick={()=>onChange(items.filter(i=>i.key!==item.key))}>Retirar</button></div>
  </li>)}</ol>}
 </>;
}
