'use client';
import Link from 'next/link';
import {useCallback,useEffect,useMemo,useState} from 'react';
import {courseOutlineSchema,OUTLINE_LIMITS,OUTLINE_PASS_PERCENT,type AdminCourseOutlineDTO,type CourseDTO,type CourseOutline,type OutlineCard,type OutlineChapter,type OutlineGradeDTO,type OutlineQuestion,type OutlineWeek} from '@qapath/contracts';
import {useAuth} from '@/features/auth/auth-provider';
import {courseRequest} from '@/features/courses/course-api';
import {StudyFilesField,type StudyItem} from '@/components/study/study-files-field';
import {OutlineCardView} from './outline-card';
import {FocusedReader} from './focused-reader';
import '@/components/courses/courses.css';
import '@/components/study/admin-course-lessons.css';
import './outline.css';
type Sel={week:string;chapter?:string;card?:string;quiz?:boolean}|null;
const newId=(prefix:string)=>`${prefix}-${Date.now().toString(36)}${Math.random().toString(36).slice(2,6)}`;
const move=<T,>(list:T[],index:number,delta:number)=>{const next=[...list];const [item]=next.splice(index,1);next.splice(index+delta,0,item);return next};
const blankCard=():OutlineCard=>({id:newId('card'),title:'Nueva tarjeta',text:'',visuals:[]});
const blankChapter=():OutlineChapter=>({id:newId('cap'),title:'Nuevo capítulo',outcome:'',cards:[blankCard()],quiz:[]});
const blankWeek=():OutlineWeek=>({id:newId('sem'),title:'Nueva semana',summary:'',chapters:[blankChapter()]});
const blankQuestion=():OutlineQuestion=>({id:newId('q'),question:'',options:['',''],correct:0,explanation:''});
/** Corrección local para la vista previa (no guarda avance). */
function localGrade(outline:CourseOutline,chapterId:string,answers:Record<string,number>):OutlineGradeDTO{
 const chapter=outline.weeks.flatMap(w=>w.chapters).find(c=>c.id===chapterId)!;
 const feedback=chapter.quiz.map(q=>({questionId:q.id,correct:answers[q.id]===q.correct,expected:q.correct,explanation:q.explanation}));
 const score=feedback.filter(f=>f.correct).length,percent=Math.round(score*100/Math.max(1,chapter.quiz.length));
 return {score,total:chapter.quiz.length,percent,passed:percent>=OUTLINE_PASS_PERCENT,feedback};
}
/** «weeks.0.chapters.1.cards.2.title» → «Semana 1 › Capítulo 2 › Tarjeta 3 › título». */
function humanPath(path:PropertyKey[]){
 const names:Record<string,string>={weeks:'Semana',chapters:'Capítulo',cards:'Tarjeta',quiz:'Pregunta',options:'Opción',visuals:'Gráfica'};
 const fields:Record<string,string>={title:'título',question:'pregunta',summary:'resumen',outcome:'resultado',correct:'respuesta correcta',text:'texto'};
 const out:string[]=[];for(let i=0;i<path.length;i++){const key=String(path[i]);if(names[key]&&typeof path[i+1]==='number'){out.push(`${names[key]} ${Number(path[i+1])+1}`);i++}else out.push(fields[key]??key)}
 return out.join(' › ');
}
export function OutlineEditorPage({courseId}:{courseId:string}){
 const {user,loading}=useAuth();
 if(loading)return <p role="status">Verificando permisos…</p>;
 if(!user)return <><h1>Contenido del curso</h1><Link href="/login">Inicia sesión con una cuenta ADMIN</Link></>;
 if(user.role!=='ADMIN')return <p role="alert">No tienes permisos para editar el contenido de los cursos.</p>;
 return <OutlineEditor courseId={courseId}/>;
}
/** SPEC-CONTENT-330 · Editor del contenido del curso: semanas, capítulos, tarjetas y minitests con vista previa. */
function OutlineEditor({courseId}:{courseId:string}){
 const [course,setCourse]=useState<CourseDTO|null>(null),[state,setState]=useState<AdminCourseOutlineDTO|null>(null),[outline,setOutline]=useState<CourseOutline>({weeks:[]});
 const [sel,setSel]=useState<Sel>(null),[busy,setBusy]=useState(false),[error,setError]=useState(''),[message,setMessage]=useState(''),[fullPreview,setFullPreview]=useState(false);
 const apply=useCallback((data:AdminCourseOutlineDTO)=>{setState(data);setOutline(data.draft);setSel(old=>old??(data.draft.weeks[0]?{week:data.draft.weeks[0].id,chapter:data.draft.weeks[0].chapters[0]?.id,card:data.draft.weeks[0].chapters[0]?.cards[0]?.id}:null))},[]);
 useEffect(()=>{let alive=true;void Promise.all([courseRequest<CourseDTO>(`/admin/courses/${courseId}`),courseRequest<AdminCourseOutlineDTO>(`/admin/courses/${courseId}/outline`)]).then(([c,o])=>{if(!alive)return;setCourse(c);apply(o)}).catch(e=>{if(alive)setError(e instanceof Error?e.message:'No se pudo cargar el contenido.')});return()=>{alive=false}},[courseId,apply]);
 const dirty=!!state&&JSON.stringify(outline)!==JSON.stringify(state.draft);
 useEffect(()=>{if(!dirty)return;const warn=(e:BeforeUnloadEvent)=>{e.preventDefault()};window.addEventListener('beforeunload',warn);return()=>window.removeEventListener('beforeunload',warn)},[dirty]);
 const run=async(work:()=>Promise<AdminCourseOutlineDTO>,done:string)=>{setBusy(true);setError('');setMessage('');try{apply(await work());setMessage(done)}catch(e){setError(e instanceof Error?e.message:'No se pudo completar la acción.')}finally{setBusy(false)}};
 const save=useCallback(async()=>{
  if(!state)return;const parsed=courseOutlineSchema.safeParse(outline);
  if(!parsed.success){const issue=parsed.error.issues[0];setError(`Revisa ${humanPath(issue.path)}: ${issue.message}`);return}
  await run(()=>courseRequest<AdminCourseOutlineDTO>(`/admin/courses/${courseId}/outline/draft`,'PUT',{expectedRevision:state.draftRevision,outline}),'Borrador guardado. Publícalo cuando esté listo.');
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[state,outline,courseId]);
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();if(dirty&&!busy)void save()}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key)},[dirty,busy,save]);
 const publish=()=>{if(!state)return;if(dirty){setError('Guarda el borrador antes de publicar.');return}
  if(!window.confirm(`¿Publicar el contenido de «${course?.title}»?\n\nLos estudiantes verán estas semanas, capítulos y tarjetas en el índice del curso.${course?.slug==='fundamentos'?'\nEl avance guardado en la versión anterior de Fundamentos no se transfiere a esta versión.':''}`))return;
  void run(()=>courseRequest(`/admin/courses/${courseId}/outline/publish`,'POST',{expectedRevision:state.draftRevision}),'Contenido publicado.')};
 const unpublish=()=>{if(!window.confirm('¿Despublicar el contenido? El curso vuelve a mostrar su contenido anterior. El borrador se conserva.'))return;void run(()=>courseRequest(`/admin/courses/${courseId}/outline/unpublish`,'POST'),'Contenido despublicado; el borrador se conserva.')};
 const discard=()=>{if(!state)return;if(!window.confirm('¿Descartar el borrador y volver a la versión publicada? Se perderán los cambios no publicados.'))return;void run(()=>courseRequest(`/admin/courses/${courseId}/outline/discard`,'POST',{expectedRevision:state.draftRevision}),'Borrador descartado.')};
 const importFundamentals=()=>{if(!state)return;if(outline.weeks.length&&!window.confirm('El borrador actual se reemplazará por una copia de Fundamentos. ¿Continuar?'))return;void run(()=>courseRequest(`/admin/courses/${courseId}/outline/import-fundamentals`,'POST',{expectedRevision:state.draftRevision}),'Copia de Fundamentos cargada como borrador. Lo publicado no cambia hasta que publiques.')};
 // Edición inmutable por id
 const updWeek=(id:string,fn:(w:OutlineWeek)=>OutlineWeek)=>setOutline(o=>({weeks:o.weeks.map(w=>w.id===id?fn(w):w)}));
 const updChapter=(weekId:string,id:string,fn:(c:OutlineChapter)=>OutlineChapter)=>updWeek(weekId,w=>({...w,chapters:w.chapters.map(c=>c.id===id?fn(c):c)}));
 const updCard=(weekId:string,chapterId:string,id:string,fn:(c:OutlineCard)=>OutlineCard)=>updChapter(weekId,chapterId,c=>({...c,cards:c.cards.map(card=>card.id===id?fn(card):card)}));
 const confirmRemove=(label:string,children:number)=>window.confirm(`¿Eliminar ${label}?${children?` Incluye ${children} elemento(s) dentro.`:''}\nEl cambio se aplica al guardar el borrador; puedes descartarlo antes de publicar.`);
 const week=outline.weeks.find(w=>w.id===sel?.week),chapter=week?.chapters.find(c=>c.id===sel?.chapter),card=chapter?.cards.find(c=>c.id===sel?.card);
 const previewWeeks=useMemo(()=>outline.weeks.map(w=>({...w,chapters:w.chapters.map(c=>({...c,quiz:c.quiz.map(q=>({id:q.id,question:q.question,options:q.options}))}))})),[outline]);
 if(error&&!state)return <p role="alert" className="feedback bad">{error}</p>;
 if(!state||!course)return <p className="hint" aria-busy="true">Cargando contenido…</p>;
 const isFundamentals=course.slug==='fundamentos'||course.assignments.some(a=>a.kind==='LEGACY_MODULE'&&a.ref==='fundamentos');
 return <section className="course-editor outline-editor" aria-labelledby="outline-editor-title">
  <Link href="/admin/courses">← Gestionar cursos</Link>
  <p className="eyebrow">CONTENIDO DEL CURSO · MODO ENFOCADO</p><h1 id="outline-editor-title">{course.title}</h1>
  <p>Organiza el curso en <strong>semanas → capítulos → tarjetas</strong>. Cada tarjeta se lee sola: el texto (Markdown) a la izquierda y las gráficas (.mmd, .json, .svg) a la derecha. Agrega un minitest al final de cada capítulo (aprobación {OUTLINE_PASS_PERCENT} %).</p>
  <div className="outline-editor-bar">
   <span className="hint">{state.publishedAt?`Publicado (versión ${state.publishedRevision})`:'Sin publicar'} · borrador rev. {state.draftRevision}{dirty?' · cambios sin guardar':state.dirty?' · borrador con cambios no publicados':''}</span>
   <div className="course-toolbar">
    <button type="button" className="button button-primary" disabled={busy||!dirty} onClick={()=>void save()}>{busy?'Guardando…':'Guardar borrador'}</button>
    <button type="button" className="button button-outline" disabled={busy||dirty||!state.dirty} onClick={publish}>Publicar</button>
    <button type="button" className="button button-outline" disabled={busy||!outline.weeks.length} onClick={()=>setFullPreview(true)}>Vista previa del curso</button>
    {dirty&&<button type="button" className="button button-outline" onClick={()=>setOutline(state.draft)}>Deshacer cambios</button>}
    {!dirty&&state.dirty&&state.publishedAt&&<button type="button" className="button button-outline" disabled={busy} onClick={discard}>Descartar borrador</button>}
    {state.publishedAt&&<button type="button" className="button button-outline" disabled={busy} onClick={unpublish}>Despublicar</button>}
    {isFundamentals&&<button type="button" className="button button-outline" disabled={busy||dirty} onClick={importFundamentals}>Importar copia de Fundamentos</button>}
   </div>
  </div>
  {error&&<p role="alert" className="feedback bad">{error}</p>}{message&&<p role="status" className="feedback good">{message}</p>}
  <div className="outline-editor-grid">
   <nav className="outline-tree" aria-label="Estructura del curso">
    {!outline.weeks.length&&<p className="hint">El curso aún no tiene contenido. Crea la primera semana{isFundamentals?' o importa la copia de Fundamentos':''}.</p>}
    <ul>{outline.weeks.map((w,wi)=><li key={w.id}>
     <div className={`outline-node${sel?.week===w.id&&!sel.chapter?' is-selected':''}`}><button type="button" onClick={()=>setSel({week:w.id})}>Semana {wi+1} · {w.title}</button>
      <button type="button" className="tiny" disabled={wi===0} aria-label={`Subir semana ${wi+1}`} onClick={()=>setOutline(o=>({weeks:move(o.weeks,wi,-1)}))}>↑</button><button type="button" className="tiny" disabled={wi===outline.weeks.length-1} aria-label={`Bajar semana ${wi+1}`} onClick={()=>setOutline(o=>({weeks:move(o.weeks,wi,1)}))}>↓</button>
      <button type="button" className="tiny" aria-label={`Eliminar semana ${wi+1}`} onClick={()=>{if(confirmRemove(`la semana «${w.title}»`,w.chapters.length)){setOutline(o=>({weeks:o.weeks.filter(x=>x.id!==w.id)}));setSel(null)}}}>✕</button></div>
     <ul>{w.chapters.map((c,ci)=><li key={c.id}>
      <div className={`outline-node${sel?.chapter===c.id&&!sel.card&&!sel.quiz?' is-selected':''}`}><button type="button" onClick={()=>setSel({week:w.id,chapter:c.id})}>{c.title}</button>
       <button type="button" className="tiny" disabled={ci===0} aria-label={`Subir ${c.title}`} onClick={()=>updWeek(w.id,x=>({...x,chapters:move(x.chapters,ci,-1)}))}>↑</button><button type="button" className="tiny" disabled={ci===w.chapters.length-1} aria-label={`Bajar ${c.title}`} onClick={()=>updWeek(w.id,x=>({...x,chapters:move(x.chapters,ci,1)}))}>↓</button>
       <button type="button" className="tiny" aria-label={`Eliminar ${c.title}`} onClick={()=>{if(confirmRemove(`el capítulo «${c.title}»`,c.cards.length)){updWeek(w.id,x=>({...x,chapters:x.chapters.filter(y=>y.id!==c.id)}));setSel({week:w.id})}}}>✕</button></div>
      <ul>{c.cards.map((k,ki)=><li key={k.id}><div className={`outline-node${sel?.card===k.id?' is-selected':''}`}><button type="button" onClick={()=>setSel({week:w.id,chapter:c.id,card:k.id})}>▢ {k.title}</button>
        <button type="button" className="tiny" disabled={ki===0} aria-label={`Subir ${k.title}`} onClick={()=>updChapter(w.id,c.id,x=>({...x,cards:move(x.cards,ki,-1)}))}>↑</button><button type="button" className="tiny" disabled={ki===c.cards.length-1} aria-label={`Bajar ${k.title}`} onClick={()=>updChapter(w.id,c.id,x=>({...x,cards:move(x.cards,ki,1)}))}>↓</button>
        <button type="button" className="tiny" aria-label={`Eliminar ${k.title}`} onClick={()=>{if(confirmRemove(`la tarjeta «${k.title}»`,0)){updChapter(w.id,c.id,x=>({...x,cards:x.cards.filter(y=>y.id!==k.id)}));setSel({week:w.id,chapter:c.id})}}}>✕</button></div></li>)}
       <li><div className={`outline-node${sel?.chapter===c.id&&sel.quiz?' is-selected':''}`}><button type="button" onClick={()=>setSel({week:w.id,chapter:c.id,quiz:true})}>✎ Minitest ({c.quiz.length})</button></div></li>
       <li><button type="button" className="outline-add" disabled={c.cards.length>=OUTLINE_LIMITS.cards} onClick={()=>{const k=blankCard();updChapter(w.id,c.id,x=>({...x,cards:[...x.cards,k]}));setSel({week:w.id,chapter:c.id,card:k.id})}}>＋ Tarjeta</button></li></ul>
     </li>)}
      <li><button type="button" className="outline-add" disabled={w.chapters.length>=OUTLINE_LIMITS.chapters} onClick={()=>{const c=blankChapter();updWeek(w.id,x=>({...x,chapters:[...x.chapters,c]}));setSel({week:w.id,chapter:c.id,card:c.cards[0].id})}}>＋ Capítulo</button></li></ul>
    </li>)}</ul>
    <button type="button" className="outline-add" disabled={outline.weeks.length>=OUTLINE_LIMITS.weeks} onClick={()=>{const w=blankWeek();setOutline(o=>({weeks:[...o.weeks,w]}));setSel({week:w.id,chapter:w.chapters[0].id,card:w.chapters[0].cards[0].id})}}>＋ Semana</button>
   </nav>
   <div className="outline-form">
    {!sel||!week?<p className="hint">Selecciona una semana, un capítulo o una tarjeta para editarla.</p>
    :card&&chapter?<CardForm key={card.id} card={card} onChange={next=>updCard(week.id,chapter.id,card.id,()=>next)}/>
    :chapter&&sel.quiz?<QuizForm key={chapter.id+'quiz'} chapter={chapter} onChange={quiz=>updChapter(week.id,chapter.id,c=>({...c,quiz}))}/>
    :chapter?<div><h2>Capítulo</h2><label>Título<input maxLength={160} value={chapter.title} onChange={e=>updChapter(week.id,chapter.id,c=>({...c,title:e.target.value}))}/></label><label>Resultado de aprendizaje<textarea maxLength={400} value={chapter.outcome} onChange={e=>updChapter(week.id,chapter.id,c=>({...c,outcome:e.target.value}))}/></label><p className="hint">{chapter.cards.length} tarjetas · minitest con {chapter.quiz.length} preguntas.</p></div>
    :<div><h2>Semana {outline.weeks.indexOf(week)+1}</h2><label>Título<input maxLength={160} value={week.title} onChange={e=>updWeek(week.id,w=>({...w,title:e.target.value}))}/></label><label>Resumen<textarea maxLength={400} value={week.summary} onChange={e=>updWeek(week.id,w=>({...w,summary:e.target.value}))}/></label><p className="hint">Se muestra en el índice del curso como «SEMANA {String(outline.weeks.indexOf(week)+1).padStart(2,'0')}», con {week.chapters.length} capítulo(s).</p></div>}
   </div>
  </div>
  {fullPreview&&<div className="lesson-modal" role="dialog" aria-modal="true" aria-label="Vista previa del curso"><div className="lesson-modal-card course-editor">
   <div className="course-toolbar"><button type="button" className="button button-outline" onClick={()=>setFullPreview(false)}>Cerrar vista previa</button></div>
   <FocusedReader preview courseTitle={course.title} weeks={previewWeeks} initialChapter={sel?.chapter} grade={async(id,answers)=>localGrade(outline,id,answers)}/>
  </div></div>}
 </section>;
}
function CardForm({card,onChange}:{card:OutlineCard;onChange:(card:OutlineCard)=>void}){
 const [items,setItems]=useState<StudyItem[]>(()=>card.visuals.map((v,i)=>({key:`${card.id}-${i}`,filename:v.filename,kind:v.kind,content:v.content})));
 // Los .md cargados se vuelven el texto de la tarjeta; las gráficas válidas quedan a la derecha.
 const change=(next:StudyItem[])=>{const md=next.filter(i=>i.kind==='markdown');const visuals=next.filter(i=>i.kind!=='markdown');setItems(visuals);
  onChange({...card,text:md.length?[card.text,...md.map(i=>i.content)].filter(t=>t.trim()).join('\n\n'):card.text,visuals:visuals.filter(i=>!i.error&&i.kind).map(i=>({filename:i.filename,kind:i.kind as 'mermaid'|'interaction'|'svg',content:i.content}))})};
 return <div className="split">
  <div><h2>Tarjeta</h2>
   <label>Título<input maxLength={160} value={card.title} onChange={e=>onChange({...card,title:e.target.value})}/></label>
   <label>Texto (Markdown: **negrita**, listas, tablas, &gt; citas y bloques ```mermaid)<textarea className="markdown" maxLength={OUTLINE_LIMITS.text} value={card.text} onChange={e=>onChange({...card,text:e.target.value})}/></label>
   <p className="hint">{card.text.length.toLocaleString('es')} / {OUTLINE_LIMITS.text.toLocaleString('es')} caracteres</p>
   <fieldset><legend>Gráficas de la derecha ({card.visuals.length}/{OUTLINE_LIMITS.visuals})</legend><p className="hint">Arrastra .mmd, .json (mapa con globos o gráfica) o .svg. Si arrastras un .md, su texto se agrega al cuerpo de la tarjeta.</p><StudyFilesField items={items} onChange={change} label="Cargar gráficas de la tarjeta"/></fieldset>
  </div>
  <div className="outline-preview" aria-label="Vista previa de la tarjeta"><p className="eyebrow">VISTA PREVIA · ASÍ LA VERÁ EL ESTUDIANTE</p><h1>{card.title||'Tarjeta sin título'}</h1><OutlineCardView card={card}/></div>
 </div>;
}
function QuizForm({chapter,onChange}:{chapter:OutlineChapter;onChange:(quiz:OutlineQuestion[])=>void}){
 const quiz=chapter.quiz;const set=(i:number,q:OutlineQuestion)=>onChange(quiz.map((x,j)=>j===i?q:x));
 return <div><h2>Minitest · {chapter.title}</h2><p className="hint">Opcional. El estudiante lo responde al terminar las tarjetas del capítulo y aprueba con {OUTLINE_PASS_PERCENT} %. Marca la opción correcta y escribe la explicación que verá al calificar.</p>
  {quiz.map((q,i)=><div key={q.id} className="outline-question"><label>Pregunta {i+1}<input maxLength={400} value={q.question} onChange={e=>set(i,{...q,question:e.target.value})}/></label>
   <div role="radiogroup" aria-label={`Opciones de la pregunta ${i+1}`}>{q.options.map((o,oi)=><div key={oi} className="option"><input type="radio" name={`${q.id}-correct`} aria-label={`Opción ${oi+1} es la correcta`} checked={q.correct===oi} onChange={()=>set(i,{...q,correct:oi})}/><input type="text" aria-label={`Opción ${oi+1}`} maxLength={240} value={o} onChange={e=>set(i,{...q,options:q.options.map((x,k)=>k===oi?e.target.value:x)})}/>
    <button type="button" className="button button-outline" disabled={q.options.length<=2} aria-label={`Quitar opción ${oi+1}`} onClick={()=>set(i,{...q,options:q.options.filter((_,k)=>k!==oi),correct:q.correct===oi?0:q.correct>oi?q.correct-1:q.correct})}>✕</button></div>)}</div>
   <div className="course-toolbar"><button type="button" className="button button-outline" disabled={q.options.length>=OUTLINE_LIMITS.options} onClick={()=>set(i,{...q,options:[...q.options,'']})}>＋ Opción</button></div>
   <label>Explicación (se muestra al calificar)<textarea maxLength={600} value={q.explanation} onChange={e=>set(i,{...q,explanation:e.target.value})}/></label>
   <div className="course-toolbar"><button type="button" className="button button-outline" disabled={i===0} onClick={()=>onChange(move(quiz,i,-1))}>↑ Subir</button><button type="button" className="button button-outline" disabled={i===quiz.length-1} onClick={()=>onChange(move(quiz,i,1))}>↓ Bajar</button><button type="button" className="button button-outline" onClick={()=>{if(window.confirm('¿Eliminar esta pregunta?'))onChange(quiz.filter(x=>x.id!==q.id))}}>Eliminar pregunta</button></div>
  </div>)}
  <button type="button" className="button button-primary" disabled={quiz.length>=OUTLINE_LIMITS.questions} onClick={()=>onChange([...quiz,blankQuestion()])}>＋ Agregar pregunta</button>
 </div>;
}
