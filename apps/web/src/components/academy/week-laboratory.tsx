'use client';
import {useState,type ReactNode} from 'react';
import {PracticePlayground} from './practice-playground';
import {PracticeExecution,type PracticeRun} from './practice-execution';
import {TopicLab} from './topic-lab';
import {GitLab} from './git-lab';
import {AutomationTopicLab} from './automation-topic-lab';
import {PageObjectLab} from './page-object-lab';
import './practice-execution.css';
const guidance:Record<number,string>={
 9:'Escribe funciones, modifica sus entradas y ejecuta aserciones sobre condiciones y fronteras.',10:'Transforma resultados JSON con filter, map y reduce y comprueba el reporte.',11:'Define tipos y valida contratos durante la ejecución; distingue transpilación de comprobación semántica.',12:'Ejecuta promesas, errores HTTP simulados y manejo de rechazos con dobles locales.',
 13:'Construye tu primer escenario UI con datos y una aserción; ejecútalo y descarga el spec para Playwright.',15:'Reproduce el defecto intencional, contrasta el esperado y el obtenido y ejecuta el retest.',16:'Cambia la vista escritorio/móvil y comprueba el mismo escenario con sus dimensiones.',17:'Configura una operación de negocio reutilizable, ejecuta su comportamiento y usa el spec para refactorizarlo a Page Object con el kit.',19:'Configura método, endpoint, datos y autorización; ejecuta solicitudes API reales al sandbox.',20:'Activa una respuesta 503 en la vista, comprueba el error y retira la simulación para validar recuperación.',21:'Configura las etapas de una suite local y revisa su resultado antes de llevar el workflow al repositorio.',22:'Configura repeticiones, conserva resultados y compara duración y tasa de aprobación observadas.',23:'Combina pruebas UI, API, SQL y código para reunir la evidencia de tu proyecto.'
};
export function WeekLaboratory({week,title,initial,onResult,children}:{week:number;title:string;initial?:PracticeRun;children?:ReactNode;onResult:(run:PracticeRun)=>void}){
 const [tool,setTool]=useState(week===7?'http':'sql');
 const summary=week===7?'Laboratorio de apoyo para esta actividad · QA Store':`Laboratorio interactivo · ${title}`;
 const permitted=(mode:string)=>initial?.mode===mode?initial:undefined;
 return <details className="activity-section activity-lab" open><summary>{summary}</summary>
 {week<=6||week===24?<TopicLab week={week} initial={permitted('topic')} onResult={onResult}/>:week===7||week===8?<>
 <p>Herramientas del módulo 03: ejecuta una solicitud, consulta los datos y versiona un caso. Cada herramienta muestra su respuesta y explica para qué sirve.</p>
 <div className="practical-actions" role="group" aria-label="Herramientas del laboratorio">{(week===7?[['http','Postman y HTTP'],['sql','Base de datos SQL'],['git','Comandos Git']]:[['sql','Base de datos SQL'],['git','Comandos Git']]).map(([value,label])=><button key={value} className="button button-outline" aria-pressed={tool===value} onClick={()=>setTool(value)}>{label}</button>)}</div>
 {tool==='http'?<PracticePlayground embedded postman/>:tool==='sql'?<><p>SELECT lee datos; INNER JOIN devuelve coincidencias y LEFT JOIN conserva las filas de la izquierda sin coincidencia. Edita una consulta y revisa sus filas obtenidas.</p><PracticeExecution key="sql" week={8} initial={permitted('sql')} onResult={onResult}/></>:<GitLab week={week} initial={permitted('git')} onResult={onResult}/>}
 </>:week===17?<PageObjectLab initial={permitted('topic')} onResult={onResult}/>:week===14||week===18?<AutomationTopicLab week={week} initial={permitted('topic')} onResult={onResult}/>:<><p>{guidance[week]}</p><PracticeExecution week={week} initial={initial&&initial.mode!=='topic'&&initial.mode!=='git'?initial:undefined} onResult={onResult}/></>}
 {children}
 </details>;
}
