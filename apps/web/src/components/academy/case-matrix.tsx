'use client';
export const caseColumns=['Título','Precondiciones','Pasos · Given / When / Then','Resultado esperado','Resultado obtenido (observado)','Estado','Bug relacionado'] as const;
export type PracticeCase={title:string;preconditions:string;steps:string;expected:string;observed:string;status:string;bug:string};
const keys=['title','preconditions','steps','expected','observed','status','bug'] as const;
export const emptyCase=():PracticeCase=>({title:'',preconditions:'',steps:'',expected:'',observed:'',status:'No ejecutado',bug:''});
export function readCaseMatrix(text:string|undefined):PracticeCase[]{
 try{const rows=JSON.parse(text||'{}').caseMatrix;if(Array.isArray(rows)&&rows.length<=4&&rows.every(row=>row&&keys.every(key=>typeof row[key]==='string'&&row[key].length<=180)))return rows}catch{}
 return [emptyCase(),emptyCase(),emptyCase(),emptyCase()];
}
export function CaseMatrix({rows,onChange,disabled}:{rows:PracticeCase[];onChange:(rows:PracticeCase[])=>void;disabled:boolean}){
 const csv=()=>{
  const encode=(value:string)=>'"'+value.replaceAll('"','""')+'"';
  // Spreadsheet software must not interpret user-entered formulas as executable cells.
  const safe=(value:string)=>/^[\s]*[=+@-]/.test(value)?"'"+value:value;
  const text='\uFEFF'+[['ID',...caseColumns],...rows.map((row,i)=>[`TC-${i+1}`,...keys.map(key=>safe(row[key]))])].map(line=>line.map(encode).join(',')).join('\r\n');
  const url=URL.createObjectURL(new Blob([text],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='matriz-casos-ejecucion.csv';a.click();URL.revokeObjectURL(url);
 };
 return <div className="case-matrix"><h3>Completa tu matriz de casos de prueba</h3><p>Define el esperado antes de ejecutar. Registra el obtenido únicamente después de probar. La matriz se guarda junto con la evidencia de esta actividad al pulsar Guardar evidencia.</p><details><summary>Ejemplo de un caso y qué hacer si falla</summary><p><b>Título:</b> TC-01 · Transferencia con saldo correcto. <b>Precondiciones:</b> cuenta de prueba con saldo 200, defecto desactivado. <b>Given:</b> saldo 200 e importe 50; <b>When:</b> transfiero 50; <b>Then:</b> el saldo debe quedar en 150.</p><p>Resultado esperado: 150. El resultado obtenido queda pendiente hasta ejecutar. Si difiere, comprueba datos y ambiente, reproduce el fallo, conserva evidencia y reporta un bug vinculado al caso. Un rechazo esperado de una entrada inválida puede ser un caso aprobado.</p><p><b>Flujo ilustrativo:</b> Nuevo → En análisis / triage → Asignado → En corrección → Resuelto / listo para retest → Cerrado si pasa, o Reabierto si persiste. Registra responsable, fecha y evidencia en cada transición. Duplicado, rechazado o diferido requieren una razón; los nombres de estados dependen del equipo.</p></details>
 <div className="case-matrix-cards">{rows.map((row,i)=><fieldset key={i} disabled={disabled}><legend>Caso TC-{String(i+1).padStart(2,'0')}</legend>{keys.map((key,j)=><label key={key}>{caseColumns[j]}{key==='status'?<select aria-label={`Caso ${i+1} · ${caseColumns[j]}`} value={row[key]} onChange={event=>onChange(rows.map((r,index)=>index===i?{...r,[key]:event.target.value}:r))}>{['No ejecutado','Aprobado','Fallido','Bloqueado'].map(status=><option key={status}>{status}</option>)}</select>:<textarea aria-label={`Caso ${i+1} · ${caseColumns[j]}`} maxLength={180} value={row[key]} onChange={event=>onChange(rows.map((r,index)=>index===i?{...r,[key]:event.target.value}:r))}/>}</label>)}{row.status==='Fallido'&&!row.bug&&<p className="hint">Comprueba si es un defecto y vincula el bug o explica por qué no corresponde reportarlo.</p>}</fieldset>)}</div><button type="button" className="button button-outline" onClick={csv}>Descargar matriz CSV</button><p className="hint">Hasta 180 caracteres por celda. Guarda los detalles largos en tus archivos y enlázalos en la evidencia.</p></div>;
}
