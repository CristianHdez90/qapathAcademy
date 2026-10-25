'use client';
import {type ReactNode} from 'react';
import {ToolsMissionLab} from './tools-mission-lab';
import {PracticeExecution,type PracticeRun} from './practice-execution';
import {RiskMissionLab} from './risk-mission-lab';
import {PasswordLab} from './password-lab';
import {SprintLab} from './sprint-lab';
import {BugLab} from './bug-lab';
import {GherkinLab} from './gherkin-lab';
import {TopicLab} from './topic-lab';
import {ProgrammingLab} from './programming-lab';
import {AutomationTopicLab} from './automation-topic-lab';
import {PageObjectLab} from './page-object-lab';
import './practice-execution.css';
const guidance:Record<number,string>={
 9:'Escribe funciones, modifica sus entradas y ejecuta aserciones sobre condiciones y fronteras.',10:'Transforma resultados JSON con filter, map y reduce y comprueba el reporte.',11:'Define tipos y valida contratos durante la ejecución; distingue transpilación de comprobación semántica.',12:'Ejecuta promesas, errores HTTP simulados y manejo de rechazos con dobles locales.',
 13:'Construye tu primer escenario UI con datos y una aserción; ejecútalo y descarga el spec para Playwright.',15:'Reproduce el defecto intencional, contrasta el esperado y el obtenido y ejecuta el retest.',16:'Cambia la vista escritorio/móvil y comprueba el mismo escenario con sus dimensiones.',17:'Configura una operación de negocio reutilizable, ejecuta su comportamiento y usa el spec para refactorizarlo a Page Object con el kit.',19:'Configura método, endpoint, datos y autorización; ejecuta solicitudes API reales al sandbox.',20:'Activa una respuesta 503 en la vista, comprueba el error y retira la simulación para validar recuperación.',21:'Configura las etapas de una suite local y revisa su resultado antes de llevar el workflow al repositorio.',22:'Configura repeticiones, conserva resultados y compara duración y tasa de aprobación observadas.',23:'Combina pruebas UI, API, SQL y código para reunir la evidencia de tu proyecto.'
};
export function WeekLaboratory({week,title,initial,onResult,children}:{week:number;title:string;initial?:PracticeRun;children?:ReactNode;onResult:(run:PracticeRun)=>void}){
 const summary=week===7?'Laboratorio de apoyo para esta actividad · QA Store':`Laboratorio interactivo · ${title}`;
 const permitted=(mode:string)=>initial?.mode===mode?initial:undefined;
 return <details className="activity-section activity-lab" open><summary>{summary}</summary>
 {week===1?<p>Analiza la HU, diseña tus casos en la tabla y ejecútalos. Completa un caso por cada ejemplo para validar esta práctica.</p>:week===2?<RiskMissionLab initial={permitted('topic')} onResult={onResult}/>:week===3?<GherkinLab initial={permitted('topic')} onResult={onResult}/>:week===4?<PasswordLab initial={permitted('topic')} onResult={onResult}/>:week===5?<BugLab initial={permitted('topic')} onResult={onResult}/>:week===6?<SprintLab initial={permitted('topic')} onResult={onResult}/>:week===24?<TopicLab week={week} initial={permitted('topic')} onResult={onResult}/>:week===7?<ToolsMissionLab initial={initial} onResult={onResult}/>:week===8?<PracticeExecution week={8} initial={permitted('sql')} onResult={onResult}/>:week===9?<ProgrammingLab initial={initial} onResult={onResult}/>:week===17?<PageObjectLab initial={permitted('topic')} onResult={onResult}/>:week===14||week===18?<AutomationTopicLab week={week} initial={permitted('topic')} onResult={onResult}/>:<><p>{guidance[week]}</p><PracticeExecution week={week} initial={initial&&initial.mode!=='topic'&&initial.mode!=='git'?initial:undefined} onResult={onResult}/></>}
 {children}
 </details>;
}
