export type FoundationCase={id:string;exampleId:string;criterion:string;title:string;preconditions:string;data:string;steps:string;expected:string;observed:string;status:string;bug:string;execution?:{fingerprint:string;obtained:string;defect?:boolean}};
export const foundationStory={id:'HU-TR-01',title:'Transferir dinero respetando saldo y estado de la cuenta',description:'Una persona necesita transferir dinero desde su cuenta de entrenamiento sin dejar un saldo negativo y con información clara cuando una operación se rechaza.',as:'titular de una cuenta',want:'transferir un importe entero positivo que no supere mi saldo disponible',so:'enviar dinero y conservar un saldo correcto',criteria:[
 {id:'CA-01',text:'Una cuenta activa acepta importes enteros desde 1 hasta el saldo disponible, ambos incluidos, y descuenta exactamente el importe.'},
 {id:'CA-02',text:'Un importe cero, negativo, fraccionario o superior al saldo se rechaza sin cambiar el saldo.'},
 {id:'CA-03',text:'Una cuenta inactiva rechaza la transferencia aunque el importe sea válido; el saldo permanece igual.'},
 {id:'CA-04',text:'Después de una transferencia aceptada, la siguiente utiliza el saldo actualizado, no el saldo inicial.'}
]};
export const foundationExamples=[
 {id:'EP-01',technique:'Partición de equivalencia · válida',criterion:'CA-01',analysis:'Agrupa importes enteros dentro del rango válido. Elige un representante interior, sin confundirlo con una frontera.',data:{balance:200,active:true,amounts:[50]},expected:'Saldo 150; aceptada',steps:['Abrir la cuenta de entrenamiento con saldo 200 y estado activo.','Introducir el importe 50 y confirmar una transferencia.','Consultar el saldo y el estado de la operación.']},
 {id:'EP-02',technique:'Partición de equivalencia · inválida',criterion:'CA-02',analysis:'Agrupa importes que no cumplen la regla. Un representante como 0 debe rechazarse sin alterar el saldo.',data:{balance:200,active:true,amounts:[0]},expected:'Saldo 200; rechazada',steps:['Abrir la cuenta activa con saldo 200.','Introducir el importe 0 y solicitar la transferencia.','Revisar el rechazo y consultar que el saldo no cambió.']},
 {id:'VL-01',technique:'Análisis de valores límite',criterion:'CA-01',analysis:'Identifica la frontera mínima 1. El caso de ejemplo la comprueba; añade otros para 0, saldo y saldo + 1 si amplías la cobertura.',data:{balance:200,active:true,amounts:[1]},expected:'Saldo 199; aceptada',steps:['Abrir la cuenta activa con saldo 200.','Introducir el importe mínimo permitido 1 y confirmar.','Revisar aceptación y saldo restante.']},
 {id:'TD-01',technique:'Tabla de decisión',criterion:'CA-03',analysis:'Cruza cuenta activa/inactiva e importe válido/inválido. Esta regla aísla cuenta inactiva e importe válido; el acceso a la operación debe rechazarse.',data:{balance:200,active:false,amounts:[50]},expected:'Saldo 200; rechazada',steps:['Preparar una cuenta inactiva con saldo 200.','Solicitar una transferencia de 50.','Revisar el rechazo por estado de cuenta y comprobar el saldo.']},
 {id:'TE-01',technique:'Transición de estado',criterion:'CA-04',analysis:'Sigue dos operaciones consecutivas. El estado cambia de saldo 200 a 150 y después a 50; la segunda operación debe usar 150.',data:{balance:200,active:true,amounts:[50,100]},expected:'Saldo 50; aceptada',steps:['Abrir una cuenta activa con saldo 200.','Transferir 50 y consultar el saldo 150.','Transferir 100 desde esa misma cuenta y revisar el saldo final 50.']}
] as const;
export type TransferData={balance:number;active:boolean;amounts:number[]};
export function parseTransferData(text:string):TransferData{
 const value=JSON.parse(text);
 if(!value||typeof value.balance!=='number'||!Number.isFinite(value.balance)||value.balance<0||typeof value.active!=='boolean'||!Array.isArray(value.amounts)||value.amounts.length<1||value.amounts.length>10||value.amounts.some((n:unknown)=>typeof n!=='number'||!Number.isFinite(n)))throw Error('Datos: usa balance numérico no negativo, active booleano y amounts con 1 a 10 importes numéricos.');
 return value;
}
export function executeTransfer(data:TransferData,defect=false){
 let balance=data.balance;const events=data.amounts.map(amount=>{const accepted=data.active&&Number.isInteger(amount)&&amount>=1&&amount<=balance;if(accepted)balance-=defect?5:amount;return {amount,accepted,balance}});
 return {outcome:`Saldo ${balance}; ${events.every(e=>e.accepted)?'aceptada':'rechazada'}`,events};
}
const normalize=(value:string)=>value.trim().toLowerCase().replace(/\s+/g,' ');
export function caseFingerprint(row:FoundationCase){return JSON.stringify([row.exampleId,row.criterion,row.title,row.preconditions,row.data,row.steps,row.expected])}
export function validateFoundationPractice(rows:FoundationCase[]){
 const errors:string[]=[];const covered=new Set<string>();const ids=new Set<string>();
 if(!rows.length)errors.push('Agrega al menos un caso por cada uno de los cinco ejemplos.');
 for(const row of rows){
  const prefix=row.id||'Caso sin ID';const before=errors.length;
  if(!row.id||ids.has(row.id))errors.push(`${prefix}: el ID debe ser único.`);ids.add(row.id);
  const example=foundationExamples.find(e=>e.id===row.exampleId);if(!example)errors.push(`${prefix}: relaciona un ejemplo/técnica.`);
  if(example&&row.criterion!==example.criterion)errors.push(`${prefix}: debe estar trazado a ${example.criterion}.`);
  for(const key of ['title','preconditions','expected','observed'] as const)if(!row[key]?.trim())errors.push(`${prefix}: completa ${key==='title'?'título':key==='preconditions'?'precondiciones':key==='expected'?'resultado esperado':'resultado obtenido'}.`);
  if((row.steps?.split('\n').filter(line=>/^\s*\d+[.)]\s+\S/.test(line)).length||0)<3)errors.push(`${prefix}: escribe al menos tres acciones numeradas, una por línea; los pasos no son Given/When/Then.`);
  if(!['Aprobado','Fallido'].includes(row.status))errors.push(`${prefix}: ejecuta el caso y registra Aprobado o Fallido.`);
  if(row.status==='Fallido'&&!row.bug?.trim())errors.push(`${prefix}: vincula el bug del caso fallido.`);
  try{
   const data=parseTransferData(row.data),first=data.amounts[0];
   const matches=row.exampleId==='EP-01'?data.active&&data.amounts.length===1&&Number.isInteger(first)&&first>1&&first<data.balance:row.exampleId==='EP-02'?data.active&&data.amounts.length===1&&(!Number.isInteger(first)||first<1||first>data.balance):row.exampleId==='VL-01'?data.active&&data.amounts.length===1&&first===1:row.exampleId==='TD-01'?!data.active&&data.amounts.length===1&&Number.isInteger(first)&&first>=1&&first<=data.balance:row.exampleId==='TE-01'?data.active&&data.amounts.length>=2&&executeTransfer(data).events.every(e=>e.accepted):false;
   if(!matches)errors.push(`${prefix}: los datos no ejercitan el ejemplo seleccionado.`);
   const expected=executeTransfer(data).outcome;if(normalize(row.expected)!==normalize(expected))errors.push(`${prefix}: el esperado no corresponde a la regla de la HU para esos datos (formato: Saldo N; aceptada/rechazada).`);
   if(!row.execution||row.execution.fingerprint!==caseFingerprint(row)||row.execution.obtained!==row.observed)errors.push(`${prefix}: ejecuta de nuevo después de definir o cambiar el caso.`);
   else if(row.observed!==executeTransfer(data,row.execution.defect===true).outcome)errors.push(`${prefix}: el obtenido no corresponde a la ejecución de los datos.`);
   else if((normalize(row.observed)===normalize(row.expected))!==(row.status==='Aprobado'))errors.push(`${prefix}: el estado no coincide con la comparación de resultados.`);
  }catch{errors.push(`${prefix}: revisa los datos JSON de la transferencia.`)}
  if(errors.length===before&&example)covered.add(example.id);
 }
 for(const example of foundationExamples)if(!covered.has(example.id))errors.push(`Falta un caso completo y ejecutado para ${example.id}: ${example.technique}.`);
 return {complete:errors.length===0,covered:[...covered],required:foundationExamples.length,errors};
}
export function assessFoundationEvidence(text:string){
 try{const data=JSON.parse(text),rows=data.caseMatrix;
  if(!Array.isArray(rows)||rows.length>100||rows.some(row=>!row||!['id','exampleId','criterion','title','preconditions','data','steps','expected','observed','status','bug'].every(key=>typeof row[key]==='string'&&row[key].length<=4000)))throw Error('Matriz inválida');
  return validateFoundationPractice(rows);
 }catch{return {complete:false,covered:[] as string[],required:foundationExamples.length,errors:['La matriz de la práctica está incompleta o tiene un formato inválido.']}}
}
