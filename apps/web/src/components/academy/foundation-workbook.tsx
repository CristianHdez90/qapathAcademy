'use client';
import {useState} from 'react';
import {caseFingerprint,executeTransfer,foundationExamples,foundationStory,parseTransferData,validateFoundationPractice,type FoundationCase} from '@qapath/progress';
import './foundation-workbook.css';
export function emptyFoundationCase(id:string,exampleId=''):FoundationCase{return {id,exampleId,criterion:'',title:'',preconditions:'',data:'',steps:'',expected:'',observed:'',status:'No ejecutado',bug:''}}
export function readFoundationCases(text:string|undefined):FoundationCase[]{
 try{const data=JSON.parse(text||'{}');if(Array.isArray(data.caseMatrix)&&data.caseMatrix.length<=100)return data.caseMatrix.map((row:Record<string,unknown>,i:number)=>{
  const result=emptyFoundationCase(typeof row?.id==='string'?row.id:`TC-${String(i+1).padStart(2,'0')}`);
  for(const key of ['exampleId','criterion','title','preconditions','data','steps','expected','observed','status','bug'] as const)if(typeof row?.[key]==='string')result[key]=row[key].slice(0,4000);
  const execution=row?.execution as FoundationCase['execution'];if(execution&&typeof execution.fingerprint==='string'&&typeof execution.obtained==='string')result.execution=execution;
  return result;
 })}catch{}
 return foundationExamples.map((example,i)=>emptyFoundationCase(`TC-${String(i+1).padStart(2,'0')}`,example.id));
}
const columns=[['title','Título'],['preconditions','Precondiciones'],['data','Datos de prueba (JSON)'],['steps','Pasos de ejecución (acciones numeradas)'],['expected','Resultado esperado']] as const;
const referenceCases=foundationExamples.map((example,i)=>({
 id:'REF-'+example.id,exampleId:example.id,criterion:example.criterion,
 title:['Transferir un importe válido dentro del saldo','Rechazar un importe cero sin alterar el saldo','Aceptar el importe mínimo permitido','Rechazar una transferencia desde cuenta inactiva','Actualizar el saldo entre dos transferencias'][i],
 preconditions:`Cuenta de entrenamiento ${example.data.active?'activa':'inactiva'} con saldo inicial ${example.data.balance}.`,
 data:JSON.stringify(example.data),steps:example.steps.map((step,index)=>`${index+1}. ${step}`).join('\n'),
 expected:example.expected,observed:executeTransfer({...example.data,amounts:[...example.data.amounts]}).outcome,status:'Aprobado · demostración',bug:'No aplica'
}));
export function FoundationWorkbook({rows,onChange,disabled,validated,onValidate}:{rows:FoundationCase[];onChange:(rows:FoundationCase[])=>void;disabled:boolean;validated:boolean;onValidate:()=>Promise<boolean>}){
 const [defect,setDefect]=useState(false),[notice,setNotice]=useState(''),[showErrors,setShowErrors]=useState(false);
 const assessment=validateFoundationPractice(rows);
 const update=(id:string,key:keyof FoundationCase,value:string)=>onChange(rows.map(row=>row.id===id?{...row,[key]:value}:row));
 const execute=(row:FoundationCase)=>{if(!row.expected.trim())throw Error(`${row.id}: define el esperado antes de ejecutar.`);const data=parseTransferData(row.data);const result=executeTransfer(data,defect);return {...row,observed:result.outcome,status:row.expected.trim().toLowerCase().replace(/\s+/g,' ')===result.outcome.toLowerCase()?'Aprobado':'Fallido',execution:{fingerprint:caseFingerprint(row),obtained:result.outcome,defect}}};
 const run=(id?:string)=>{const errors:string[]=[];onChange(rows.map(row=>{if(id&&row.id!==id)return row;try{return execute(row)}catch(error){errors.push(error instanceof Error?error.message:'Revisa el caso.');return row}}));setNotice(errors.length?errors.join('\n'):'Ejecución registrada: compara el esperado con el obtenido.');};
 const add=()=>{const next=Math.max(0,...rows.map(r=>Number(r.id.replace(/^TC-/,''))||0))+1;onChange([...rows,emptyFoundationCase('TC-'+String(next).padStart(2,'0'))]);};
 const download=()=>{
  const encode=(value:string)=>'"'+(/^[\s]*[=+@-]/.test(value)?"'"+value:value).replaceAll('"','""')+'"';
  const csv='\uFEFF'+[['ID','Ejemplo / técnica','Criterio',...columns.map(([,label])=>label),'Resultado obtenido (observado)','Estado','Bug relacionado'],...[...referenceCases,...rows].map(row=>[row.id,row.exampleId,row.criterion,...columns.map(([key])=>row[key]),row.observed,row.status,row.bug])].map(line=>line.map(encode).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='practice-1-matriz-casos.csv';a.click();URL.revokeObjectURL(url);
 };
 return <div className="foundation-workbook"><h2>De la HU a los casos de prueba</h2>
 <article className="foundation-story" aria-label="Historia de usuario BDD"><h3>{foundationStory.id} · {foundationStory.title}</h3><p><b>Descripción:</b> {foundationStory.description}</p><div className="foundation-user-story"><p><strong>Como</strong> {foundationStory.as},</p><p><strong>quiero</strong> {foundationStory.want},</p><p><strong>para</strong> {foundationStory.so}.</p></div><h4>Criterios de aceptación</h4><ul>{foundationStory.criteria.map(c=><li key={c.id}><b>{c.id}:</b> {c.text}</li>)}</ul><details><summary>Escenarios BDD en lenguaje Gherkin</summary><pre className="execution-output">{`Feature: Transferir dinero de una cuenta de entrenamiento

  Scenario: Transferencia válida (CA-01)
    Given una cuenta activa con saldo 200
    When transfiero 50
    Then la operación es aceptada y el saldo es 150

  Scenario Outline: Rechazar un importe inválido (CA-02)
    Given una cuenta activa con saldo 200
    When transfiero <importe>
    Then la operación es rechazada y el saldo permanece en 200
    Examples:
      | importe |
      | 0       |
      | -1      |
      | 1.5     |
      | 201     |

  Scenario: Transferir el importe mínimo (CA-01)
    Given una cuenta activa con saldo 200
    When transfiero 1
    Then la operación es aceptada y el saldo es 199

  Scenario: Cuenta inactiva (CA-03)
    Given una cuenta inactiva con saldo 200
    When transfiero 50
    Then la operación es rechazada y el saldo permanece en 200

  Scenario: Dos transferencias consecutivas (CA-04)
    Given una cuenta activa con saldo 200
    When transfiero 50 y después transfiero 100
    Then ambas operaciones son aceptadas y el saldo final es 50`}</pre></details></article>
 <div className="foundation-design"><h3>Cómo analizar la HU y diseñar los casos</h3><ol><li>Identifica reglas, entradas y estados: importe, saldo disponible y cuenta activa/inactiva.</li><li>Define el oráculo de prueba: los criterios de aceptación indican qué debe aceptarse, rechazarse y cómo debe quedar el saldo.</li><li>Aplica la técnica adecuada y elige datos que ejerciten esa condición.</li><li>Escribe un caso por objetivo, con precondiciones y acciones numeradas. Given/When/Then describe el escenario BDD; los pasos del caso indican cómo probarlo.</li><li>Calcula el esperado, ejecuta, registra el obtenido y compara. Si hay un defecto, vincula el bug y realiza retest.</li></ol>
 {foundationExamples.map(example=><details className="foundation-example" key={example.id}><summary>{example.id} · {example.technique} · {example.criterion}</summary><p>{example.analysis}</p><p><b>Datos del ejemplo:</b> <code>{JSON.stringify(example.data)}</code></p><p><b>Esperado según la HU:</b> {example.expected}</p><p><b>Acciones del caso de ejemplo:</b></p><ol>{example.steps.map(step=><li key={step}>{step}</li>)}</ol><p>Esta información también está diligenciada en la fila REF-{example.id} de la tabla, de solo lectura. Usa el ejemplo para diseñar y ejecutar tu propio caso en las filas TC.</p></details>)}
 </div>
 <h3>Matriz de casos de prueba</h3><p>Las filas REF son ejemplos de referencia de solo lectura, con resultados calculados en el simulador sin defecto. No se pueden modificar ni eliminar y no cuentan como tus entregas. Completa y ejecuta tus propias filas TC para cubrir los cinco ejemplos.</p><p>Los pasos son acciones numeradas, una por línea: 1. Preparar…, 2. Ejecutar…, 3. Comprobar…. Escribe el esperado con el formato <code>Saldo 150; aceptada</code> o <code>Saldo 200; rechazada</code>. El obtenido y el estado se registran al ejecutar, sin copiar el esperado.</p>
 <div className="practical-actions"><button className="button button-outline" type="button" disabled={disabled||rows.length>=100} onClick={add}>Agregar caso de prueba</button><button className="button button-outline" type="button" disabled={disabled||!rows.length} onClick={()=>run()}>Ejecutar todos los casos</button><button className="button button-outline" type="button" onClick={download}>Descargar matriz CSV</button><label><input type="checkbox" checked={defect} disabled={disabled} onChange={e=>setDefect(e.target.checked)}/>Simular defecto: restar 5 en lugar del importe</label></div>
 <div className="foundation-table-scroll" role="region" aria-label="Tabla de casos de prueba" tabIndex={0}><table><caption>HU-TR-01 · Casos, trazabilidad y resultados de ejecución</caption><thead><tr><th scope="col">ID</th><th scope="col">Ejemplo / técnica</th><th scope="col">Criterio</th>{columns.map(([,label])=><th scope="col" key={label}>{label}</th>)}<th scope="col">Resultado obtenido (observado)</th><th scope="col">Estado</th><th scope="col">Bug relacionado</th><th scope="col">Acciones</th></tr></thead><tbody aria-label="Ejemplos diligenciados de solo lectura">{referenceCases.map((row,index)=><tr key={row.id} className="foundation-reference"><th scope="row">{row.id}<small>Solo lectura</small></th><td><b>{foundationExamples[index].technique}</b><p>{foundationExamples[index].analysis}</p></td><td>{row.criterion}</td>{columns.map(([key])=><td key={key}><div className="foundation-reference-value">{row[key]}</div></td>)}<td>{row.observed}</td><td>{row.status}</td><td>{row.bug}</td><td>Ejemplo bloqueado</td></tr>)}</tbody><tbody aria-label="Mis casos de prueba"><tr className="foundation-student-divider"><th colSpan={12}>Tus casos · completa un caso por cada ejemplo</th></tr>{rows.map(row=><tr key={row.id}><th scope="row">{row.id}</th><td><select aria-label={`${row.id} · Ejemplo / técnica`} disabled={disabled} value={row.exampleId} onChange={e=>update(row.id,'exampleId',e.target.value)}><option value="">Selecciona</option>{foundationExamples.map(example=><option key={example.id} value={example.id}>{example.id} · {example.technique}</option>)}</select></td><td><select aria-label={`${row.id} · Criterio`} disabled={disabled} value={row.criterion} onChange={e=>update(row.id,'criterion',e.target.value)}><option value="">Selecciona</option>{foundationStory.criteria.map(c=><option key={c.id}>{c.id}</option>)}</select></td>{columns.map(([key,label])=><td key={key}><textarea aria-label={`${row.id} · ${label}`} disabled={disabled} maxLength={key==='steps'?2000:1000} value={row[key]} onChange={e=>update(row.id,key,e.target.value)} placeholder={key==='steps'?'1. Preparar…\n2. Ejecutar…\n3. Comprobar…':key==='data'?'{"balance":200,"active":true,"amounts":[50]}':undefined}/></td>)}<td><textarea aria-label={`${row.id} · Resultado obtenido (observado)`} value={row.observed} readOnly/></td><td><output aria-label={`${row.id} · Estado`}>{row.status}</output></td><td><input aria-label={`${row.id} · Bug relacionado`} disabled={disabled} maxLength={200} value={row.bug} onChange={e=>update(row.id,'bug',e.target.value)}/></td><td><div className="foundation-row-actions"><button className="button button-outline" type="button" disabled={disabled} onClick={()=>run(row.id)}>Ejecutar {row.id}</button><button className="button button-outline" type="button" disabled={disabled} onClick={()=>onChange(rows.filter(r=>r.id!==row.id))}>Eliminar {row.id}</button></div></td></tr>)}</tbody></table></div>
 {notice&&<p role="status" className="foundation-notice">{notice}</p>}<p className="foundation-coverage" role="status">Cobertura: {assessment.covered.length}/{assessment.required} ejemplos con caso completo y ejecutado.</p>
 <ul className="foundation-checklist">{foundationExamples.map(example=><li key={example.id}>{assessment.covered.includes(example.id)?'✓':'Pendiente'} · {example.id} · {example.technique}</li>)}</ul>
 <button className="button button-primary" type="button" disabled={disabled} onClick={()=>{setShowErrors(true);if(!assessment.complete){setNotice('Completa un caso ejecutado por cada ejemplo antes de validar.');return}void onValidate().then(ok=>setNotice(ok?'Práctica validada y guardada.':'No se pudo guardar la validación. Revisa el tamaño de la evidencia o inténtalo otra vez.'))}}>Validar práctica</button>
 {validated&&assessment.complete&&<p className="feedback good" role="status">Práctica completada: cinco ejemplos cubiertos con casos ejecutados.</p>}{showErrors&&!assessment.complete&&<ul className="foundation-errors" aria-label="Pendientes para validar">{assessment.errors.slice(0,25).map((error,i)=><li key={i}>{error}</li>)}</ul>}
 </div>;
}
