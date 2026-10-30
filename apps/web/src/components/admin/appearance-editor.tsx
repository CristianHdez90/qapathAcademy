'use client';
import Link from 'next/link';
import {useCallback,useEffect,useMemo,useState} from 'react';
import type {CSSProperties} from 'react';
import {APPEARANCE_PRESETS,APPEARANCE_TOKEN_KEYS,COURSE_ACCENTS,COURSE_ILLUSTRATIONS,CONTRAST_RULES,PRESET_DESCRIPTIONS,PRESET_LABELS,PRESET_TOKENS,contrastRatio,type AdminAppearanceDTO,type AppearanceConfig,type AppearancePreset,type AppearanceTokenKey,type AppearanceVersionDTO,type CourseDTO,type CoursePageDTO,type CoursePresentation} from '@qapath/contracts';
import {useAuth} from '@/features/auth/auth-provider';
import {courseRequest,CourseApiError} from '@/features/courses/course-api';
import {courseAccent,orderCourses,themeVars} from '@/features/appearance/appearance';
import {CourseCard,prettyTrack,useModuleMeta} from '@/components/courses/course-catalog';
import '@/components/courses/courses.css';
import '@/components/courses/home-theme.css';
import './appearance-editor.css';

const TOKEN_LABELS:Record<AppearanceTokenKey,string>={background:'Fondo',surface:'Superficie (tarjetas)',textPrimary:'Texto principal',textSecondary:'Texto secundario',border:'Borde',primary:'Primario',primaryText:'Texto sobre primario',accent:'Acento',focus:'Foco',success:'Éxito',error:'Error',ctaBackground:'Fondo de CTA secundario'};
const ACCENT_LABELS:Record<typeof COURSE_ACCENTS[number],string>={auto:'Automático (color del curso)',teal:'Turquesa',blue:'Azul',violet:'Violeta',pink:'Rosa',orange:'Naranja',gold:'Dorado',lime:'Lima'};
const ART_LABELS:Record<typeof COURSE_ILLUSTRATIONS[number],string>={auto:'Automática',checklist:'Lista de verificación',inspect:'Lupa',api:'API y datos',code:'Código',browser:'Navegador',gear:'Engranaje',team:'Equipo',certificate:'Certificado',default:'Genérica'};
const TABS=[['palette','Paleta y tema'],['cards','Tarjetas'],['texts','Textos del Home'],['publish','Vista previa y publicación']] as const;
type Tab=typeof TABS[number][0];
const DEVICES=[['desktop','Escritorio',1200,4],['tablet','Tablet',834,2],['mobile','Móvil',390,1]] as const;
const fmt=(iso:string|null)=>iso?new Date(iso).toLocaleString('es-CO',{dateStyle:'medium',timeStyle:'short'}):'—';
async function api<T>(path:string,method='GET',body?:unknown):Promise<T>{return courseRequest<T>(`/admin/appearance/home${path}`,method,body)}

/** SPEC-UX-310 · Administración > Apariencia > Home de cursos. Borrador privado, vista previa, publicación y versiones. */
export function AppearanceEditor(){
 const {user,loading}=useAuth();
 if(loading)return <p role="status">Verificando sesión…</p>;
 if(!user)return <section className="appearance-editor"><h1>Apariencia del Home</h1><p role="alert" className="feedback bad">Inicia sesión con una cuenta de administrador (ADMIN) para configurar la apariencia del Home.</p><div className="course-toolbar"><Link className="button button-primary" href="/login">Iniciar sesión</Link><Link className="button button-outline" href="/courses">Volver a cursos</Link></div></section>;
 if(user.role!=='ADMIN')return <section className="appearance-editor"><h1>Apariencia del Home</h1><p role="alert" className="feedback bad">Tu sesión es de {user.role==='STUDENT'?'estudiante':user.role.toLowerCase()} ({user.email}). Solo una cuenta ADMIN puede configurar la apariencia. Cierra sesión en «Mi cuenta» y entra con el administrador.</p><div className="course-toolbar"><Link className="button button-primary" href="/account">Ir a Mi cuenta</Link><Link className="button button-outline" href="/courses">Volver a cursos</Link></div></section>;
 return <Editor/>;
}
function Editor(){
 const [tab,setTab]=useState<Tab>('palette'),[state,setState]=useState<AdminAppearanceDTO|null>(null),[config,setConfig]=useState<AppearanceConfig|null>(null);
 const [courses,setCourses]=useState<CourseDTO[]>([]),[versions,setVersions]=useState<AppearanceVersionDTO[]>([]),[busy,setBusy]=useState(false);
 const [message,setMessage]=useState(''),[error,setError]=useState(''),[conflict,setConflict]=useState(false),[confirm,setConfirm]=useState<null|{kind:'publish'}|{kind:'restore';version:number}>(null);
 const [device,setDevice]=useState<typeof DEVICES[number][0]>('desktop'),[simulate,setSimulate]=useState(false);
 const {metaOf}=useModuleMeta();
 const apply=useCallback(([view,list,history]:[AdminAppearanceDTO,CoursePageDTO,AppearanceVersionDTO[]])=>{setState(view);setConfig(view.draft);setCourses(list.items);setVersions(history)},[]);
 const fetchAll=()=>Promise.all([api<AdminAppearanceDTO>(''),courseRequest<CoursePageDTO>('/courses?search=&page=1&limit=50'),api<AppearanceVersionDTO[]>('/versions')]);
 const load=async()=>{setError('');setConflict(false);apply(await fetchAll())};
 useEffect(()=>{let live=true;void fetchAll().then(data=>{if(live)apply(data)}).catch(e=>{if(live)setError(e instanceof Error?e.message:'No se pudo cargar la apariencia.')});return()=>{live=false}},[apply]);
 const dirty=useMemo(()=>!!state&&!!config&&JSON.stringify(state.draft)!==JSON.stringify(config),[state,config]);
 const rules=useMemo(()=>config?CONTRAST_RULES.map(([fg,bg,minimum,pair])=>({pair,fg,bg,minimum,ratio:contrastRatio(config.tokens[fg],config.tokens[bg])})):[],[config]);
 const failing=rules.filter(rule=>rule.ratio<rule.minimum);
 if(error&&!state)return <section className="appearance-editor"><h1>Apariencia del Home</h1><p role="alert" className="feedback bad">{error}</p><button className="button button-outline" onClick={()=>void load()}>Reintentar</button></section>;
 if(!state||!config)return <p role="status">Cargando apariencia…</p>;
 const update=(change:Partial<AppearanceConfig>)=>{setConfig({...config,...change});setMessage('')};
 const setPreset=(preset:AppearancePreset)=>update({preset,tokens:{...PRESET_TOKENS[preset]}});
 const presentation=(id:string)=>config.courses.find(item=>item.courseId===id);
 const setPresentation=(course:CourseDTO,index:number,change:Partial<CoursePresentation>|null)=>{
  const rest=config.courses.filter(item=>item.courseId!==course.id);
  if(change===null)return update({courses:rest});
  const current=presentation(course.id)??{courseId:course.id,displayOrder:index,accent:'auto' as const,illustration:'auto' as const};
  update({courses:[...rest,{...current,...change}]});
 };
 const run=async(action:()=>Promise<void>)=>{setBusy(true);setError('');setMessage('');setConflict(false);try{await action()}catch(e){if(e instanceof CourseApiError&&e.status===409)setConflict(true);setError(e instanceof Error?e.message:'No se pudo completar la acción.')}finally{setBusy(false)}};
 const saveDraft=()=>run(async()=>{const result=await api<{draftRevision:number}>('/draft','PATCH',{expectedRevision:state.draftRevision,config});await load();setMessage(`Borrador guardado (revisión ${result.draftRevision}). El Home público no cambia hasta publicar.`)});
 const publish=()=>run(async()=>{if(dirty)throw new Error('Guarda el borrador antes de publicar.');const result=await api<{version:number}>('/publish','POST',{expectedRevision:state.draftRevision});setConfirm(null);await load();setMessage(`Publicada la versión ${result.version}. El Home público ya muestra esta apariencia.`)});
 const restore=(version:number)=>run(async()=>{const result=await api<{version:number}>('/restore','POST',{version,expectedRevision:state.draftRevision});setConfirm(null);await load();setMessage(`Versión ${version} restaurada como nueva publicación (versión ${result.version}).`)});
 const ordered=orderCourses(courses,config.courses);
 const deviceInfo=DEVICES.find(item=>item[0]===device)!;
 return <section className="appearance-editor" aria-labelledby="appearance-title">
  <nav className="course-breadcrumb" aria-label="Ruta de navegación"><Link href="/admin">Administración</Link><span aria-hidden="true">›</span><span>Apariencia</span><span aria-hidden="true">›</span><span aria-current="page">Home de cursos</span></nav>
  <header className="appearance-head"><div><h1 id="appearance-title">Apariencia del Home de cursos</h1><p className="page-description">Configura la paleta de toda la plataforma y las tarjetas y textos del Home. Los cambios se guardan como borrador privado y solo se ven al publicar.</p></div>
   <dl className="appearance-status"><div><dt>Borrador</dt><dd>Revisión {state.draftRevision}{dirty?' · cambios sin guardar':''}</dd></div><div><dt>Publicado</dt><dd>{state.published.fallback?'Preset inicial (sin publicaciones)':`Versión ${state.published.revision} · ${fmt(state.published.publishedAt)}`}</dd></div><div><dt>Tema publicado</dt><dd>{PRESET_LABELS[state.published.config.preset]}</dd></div></dl></header>
  {message&&<p role="status" className="feedback good">{message}</p>}
  {error&&<div role="alert" className="feedback bad"><p>{error}</p>{conflict&&<button className="button button-outline" onClick={()=>void load()}>Recargar la última versión</button>}</div>}
  <div className="appearance-tabs" role="tablist" aria-label="Secciones de apariencia">{TABS.map(([id,label])=><button key={id} id={`tab-${id}`} type="button" role="tab" aria-selected={tab===id} aria-controls={`panel-${id}`} className={tab===id?'is-active':undefined} onClick={()=>setTab(id)}>{label}</button>)}</div>

  {tab==='palette'&&<div role="tabpanel" id="panel-palette" aria-labelledby="tab-palette" className="appearance-panel">
   <h2>Presets de diseño</h2>
   <div className="appearance-presets" role="radiogroup" aria-label="Preset de diseño">{APPEARANCE_PRESETS.map(preset=>{const tokens=PRESET_TOKENS[preset];return <button key={preset} type="button" role="radio" aria-checked={config.preset===preset} className={`appearance-preset${config.preset===preset?' is-active':''}`} onClick={()=>setPreset(preset)}>
    <span className="appearance-swatch" style={{background:tokens.background,borderColor:tokens.border}}><i style={{background:tokens.surface}}/><i style={{background:tokens.primary}}/><i style={{background:tokens.accent}}/><i style={{background:tokens.textPrimary}}/></span>
    <strong>{PRESET_LABELS[preset]}</strong><small>{PRESET_DESCRIPTIONS[preset]}</small>{config.preset===preset&&<span className="types-here">Seleccionado</span>}</button>})}</div>
   <div className="appearance-row"><h2>Ajuste de tokens</h2><button type="button" className="button button-outline" onClick={()=>setPreset(config.preset)}>Restablecer preset</button></div>
   <p className="hint">El tema publicado se aplica en toda la plataforma: Home, cursos, lecciones, prácticas, cuenta y administración. Solo colores hexadecimales de tokens autorizados; no se aceptan estilos CSS libres.</p>
   <div className="appearance-tokens">{APPEARANCE_TOKEN_KEYS.map(key=><label key={key} className="appearance-token"><span>{TOKEN_LABELS[key]}</span><span className="appearance-token-inputs"><input type="color" value={config.tokens[key]} onChange={e=>update({tokens:{...config.tokens,[key]:e.target.value}})} aria-label={`${TOKEN_LABELS[key]} (selector)`}/><input type="text" value={config.tokens[key]} maxLength={7} pattern="#[0-9a-fA-F]{6}" onChange={e=>update({tokens:{...config.tokens,[key]:e.target.value}})} aria-label={`${TOKEN_LABELS[key]} (hexadecimal)`}/></span></label>)}</div>
   <h2>Contraste (WCAG 2.2 AA)</h2>
   <p className={failing.length?'feedback bad':'feedback good'} role="status">{failing.length?`${failing.length} combinación(es) no alcanzan el mínimo: no se podrá publicar hasta corregirlas.`:'Todas las combinaciones cumplen el contraste mínimo.'}</p>
   <div className="foundation-table-scroll appearance-contrast" tabIndex={0} role="region" aria-label="Tabla de contraste"><table><thead><tr><th scope="col">Uso</th><th scope="col">Muestra</th><th scope="col">Contraste</th><th scope="col">Mínimo</th><th scope="col">Estado</th></tr></thead><tbody>{rules.map(rule=><tr key={rule.pair}><th scope="row">{rule.pair}</th><td><span className="appearance-sample" style={{color:config.tokens[rule.fg],background:config.tokens[rule.bg]}}>Aa</span></td><td>{rule.ratio}:1</td><td>{rule.minimum}:1</td><td className={rule.ratio>=rule.minimum?'is-yes':'is-no'}>{rule.ratio>=rule.minimum?'✓ Cumple':'✗ Insuficiente'}</td></tr>)}</tbody></table></div>
  </div>}

  {tab==='cards'&&<div role="tabpanel" id="panel-cards" aria-labelledby="tab-cards" className="appearance-panel">
   <h2>Presentación de las tarjetas</h2>
   <p className="hint">Solo presentación: el título oficial, el slug, el currículo y el progreso se gestionan en el catálogo y no cambian aquí. Los cursos no publicados no aparecen en el Home.</p>
   <ol className="appearance-courses">{ordered.map((course,index)=>{const item=presentation(course.id),meta=metaOf(course);return <li key={course.id} className="appearance-course">
    <div className="appearance-course-head"><strong>{course.title}</strong><small>{prettyTrack(meta?.track??course.category)} · {course.status==='PUBLISHED'?'Publicado':'No publicado'}</small>{item&&<button type="button" className="text-link" onClick={()=>setPresentation(course,index,null)}>Restablecer</button>}</div>
    <div className="appearance-course-fields">
     <label>Orden<input type="number" min={0} max={999} value={item?.displayOrder??index} onChange={e=>setPresentation(course,index,{displayOrder:Math.max(0,Math.min(999,Number(e.target.value)||0))})}/></label>
     <label>Acento<select value={item?.accent??'auto'} onChange={e=>setPresentation(course,index,{accent:e.target.value as CoursePresentation['accent']})}>{COURSE_ACCENTS.map(accent=><option key={accent} value={accent}>{ACCENT_LABELS[accent]}</option>)}</select></label>
     <label>Ilustración<select value={item?.illustration??'auto'} onChange={e=>setPresentation(course,index,{illustration:e.target.value as CoursePresentation['illustration']})}>{COURSE_ILLUSTRATIONS.map(art=><option key={art} value={art}>{ART_LABELS[art]}</option>)}</select></label>
     <label className="appearance-wide">Texto corto de exhibición<textarea maxLength={200} rows={2} placeholder={course.summary} value={item?.summary??''} onChange={e=>setPresentation(course,index,{summary:e.target.value||undefined})}/></label>
     <label className="appearance-wide">Etiquetas (separadas por coma, máximo 6)<input type="text" maxLength={260} placeholder={course.skills.slice(0,3).join(', ')} value={item?.tags?.join(', ')??''} onChange={e=>{const tags=e.target.value.split(',').map(tag=>tag.trim()).filter(Boolean).slice(0,6);setPresentation(course,index,{tags:tags.length?tags:undefined})}}/></label>
    </div></li>})}</ol>
  </div>}

  {tab==='texts'&&<div role="tabpanel" id="panel-texts" aria-labelledby="tab-texts" className="appearance-panel">
   <h2>Textos y disposición del Home</h2>
   <p className="hint">Texto plano: sin HTML ni enlaces. La sección de cursos, el buscador, la navegación y «Mi cuenta» siempre están visibles; las columnas se adaptan solas al dispositivo.</p>
   <div className="appearance-texts">
    {([['title','Título del Home',60],['subtitle','Subtítulo',160],['ctaLabel','Texto del botón «Crear mi ruta»',30],['searchLabel','Etiqueta del buscador (lectores de pantalla)',60],['emptyText','Texto cuando no hay resultados',160]] as const).map(([key,label,max])=><label key={key}>{label}<input type="text" maxLength={max} value={config.home[key]} onChange={e=>update({home:{...config.home,[key]:e.target.value}})}/><small>{config.home[key].length}/{max}</small></label>)}
    <label className="appearance-check"><input type="checkbox" checked={config.home.showBreadcrumb} onChange={e=>update({home:{...config.home,showBreadcrumb:e.target.checked}})}/>Mostrar migas de navegación</label>
    <label className="appearance-check"><input type="checkbox" checked={config.home.showSubtitle} onChange={e=>update({home:{...config.home,showSubtitle:e.target.checked}})}/>Mostrar subtítulo</label>
    <p className="hint">Disposición: cuadrícula responsive (4 · 3 · 2 · 1 columnas). No se ofrece arrastrar regiones ni tamaños individuales.</p>
   </div>
  </div>}

  {tab==='publish'&&<div role="tabpanel" id="panel-publish" aria-labelledby="tab-publish" className="appearance-panel">
   <div className="appearance-row"><h2>Vista previa privada</h2><div className="appearance-devices" role="group" aria-label="Dispositivo">{DEVICES.map(([id,label,width])=><button key={id} type="button" aria-pressed={device===id} className={device===id?'is-active':undefined} onClick={()=>setDevice(id)}>{label} · {width}px</button>)}<label className="appearance-check"><input type="checkbox" checked={simulate} onChange={e=>setSimulate(e.target.checked)}/>Simular progreso (solo diseño)</label></div></div>
   <p className="hint">La vista previa usa el borrador actual sin publicarlo. El progreso simulado no se guarda.</p>
   <div className="appearance-preview-scroll"><div className="appearance-preview" style={{width:deviceInfo[2]}}>
    <div className="course-home appearance-preview-home" data-home-theme={config.preset} style={{...themeVars(config.tokens),background:config.tokens.background} as CSSProperties}>
     {config.home.showBreadcrumb&&<nav className="course-breadcrumb" aria-label="Vista previa: ruta"><span>QAPath Academy</span><span aria-hidden="true">›</span><span aria-current="page">Cursos</span></nav>}
     <header className="course-home-head"><div><h1>{config.home.title}</h1>{config.home.showSubtitle&&config.home.subtitle&&<p className="page-description">{config.home.subtitle}</p>}</div><span className="button button-primary course-home-cta"><span aria-hidden="true">＋</span> {config.home.ctaLabel}</span></header>
     <div className="course-home-toolbar"><div className="course-home-search"><input type="search" readOnly tabIndex={-1} aria-label={`Vista previa: ${config.home.searchLabel}`} placeholder="Buscar cursos por título, habilidad o tecnología…"/></div><div className="course-home-filters" aria-hidden="true"><button type="button" tabIndex={-1} className="is-active">Todos</button><button type="button" tabIndex={-1}>QA Manual</button><button type="button" tabIndex={-1}>Programación</button></div></div>
     <div className="course-grid course-home-grid appearance-preview-grid" style={{gridTemplateColumns:`repeat(${deviceInfo[3]},minmax(0,1fr))`}} inert>{ordered.filter(course=>course.status==='PUBLISHED').map((course,i)=>{const meta=metaOf(course),item=presentation(course.id);return <CourseCard key={course.id} course={course} meta={meta} presentation={item} accent={courseAccent(meta?.color??(course.contentKind==='CTFL'?'#c9a2ff':course.contentKind==='SCRUM'?'#5aa9ff':'#5dd8c2'),item,config.tokens)} previewProgress={simulate&&i===0?40:simulate&&i===1?100:0}/>})}</div>
    </div>
   </div></div>
   <div className="appearance-row"><h2>Publicación</h2></div>
   <div className="appearance-actions">
    <button type="button" className="button button-outline" disabled={busy||!dirty} onClick={()=>void saveDraft()}>Guardar borrador</button>
    <button type="button" className="button button-primary" disabled={busy||dirty||failing.length>0} onClick={()=>setConfirm({kind:'publish'})}>Publicar</button>
    {dirty&&<span className="hint">Guarda el borrador para poder publicarlo.</span>}{failing.length>0&&<span className="hint">Corrige el contraste en «Paleta y tema».</span>}
   </div>
   {confirm&&<div className="appearance-confirm" role="alertdialog" aria-labelledby="appearance-confirm-title" aria-describedby="appearance-confirm-text">
    <p id="appearance-confirm-title"><strong>{confirm.kind==='publish'?'¿Publicar el borrador?':`¿Restaurar la versión ${confirm.version}?`}</strong></p>
    <p id="appearance-confirm-text">{confirm.kind==='publish'?'Todos los visitantes verán esta apariencia en el Home. Se creará una nueva versión auditada.':'Se creará una nueva publicación con esa configuración; el historial se conserva.'}</p>
    <div className="appearance-actions"><button type="button" autoFocus className="button button-primary" disabled={busy} onClick={()=>void (confirm.kind==='publish'?publish():restore(confirm.version))}>{busy?'Procesando…':'Confirmar'}</button><button type="button" className="button button-outline" onClick={()=>setConfirm(null)}>Cancelar</button></div>
   </div>}
   <h2>Versiones publicadas</h2>
   {!versions.length?<p className="hint">Aún no hay versiones publicadas: el Home usa el preset inicial «QAPath Original».</p>:<div className="foundation-table-scroll" tabIndex={0} role="region" aria-label="Historial de versiones"><table><thead><tr><th scope="col">Versión</th><th scope="col">Acción</th><th scope="col">Preset</th><th scope="col">Fecha</th><th scope="col">Por</th><th scope="col"><span className="sr-only">Acciones</span></th></tr></thead><tbody>{versions.map(item=><tr key={item.version}><th scope="row">v{item.version}{item.version===state.published.revision?' · actual':''}</th><td>{item.action==='PUBLISHED'?'Publicación':'Restauración'}</td><td>{PRESET_LABELS[item.preset]}</td><td>{fmt(item.createdAt)}</td><td>{item.actorEmail??'—'}</td><td>{item.version!==state.published.revision&&<button type="button" className="button button-outline" disabled={busy} onClick={()=>setConfirm({kind:'restore',version:item.version})}>Restaurar versión</button>}</td></tr>)}</tbody></table></div>}
  </div>}
  <div className="appearance-footer"><span className="hint">{dirty?'Tienes cambios sin guardar.':'Sin cambios pendientes.'}</span><button type="button" className="button button-outline" disabled={busy||!dirty} onClick={()=>void saveDraft()}>Guardar borrador</button><button type="button" className="button button-outline" onClick={()=>setTab('publish')}>Previsualizar y publicar</button></div>
 </section>;
}
