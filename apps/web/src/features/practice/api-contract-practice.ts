export type ApiKey='catalog'|'quote'|'shape'|'missing'|'soldOut'|'coupon'|'noToken'|'reader'|'admin'|'empty';
export type DemoToken=''|'demo-reader'|'demo-admin';
export type ApiDraft={prediction:string;payload?:string;total?:string;token?:DemoToken};
export type ApiRecord={status:number;ct:string;tag:string;auth?:string;body:string;at:string;cut:boolean};
export type ApiMission={apiLabVersion:1;page:number;selected?:ApiKey;drafts:Partial<Record<ApiKey,ApiDraft>>;records:Partial<Record<ApiKey,ApiRecord>>};
export type ApiCase={key:ApiKey;id:string;title:string;page:number;path:string;method:'GET'|'POST';status:number;kind:'catalog'|'quote'|'error'|'access'|'empty';payload?:Record<string,unknown>;token?:DemoToken;error?:string;goal:string};
const quote={productId:'basic',quantity:1,coupon:'',shipping:'pickup'};
export const apiCases:ApiCase[]=[
 {key:'catalog',id:'API-01',title:'Descubre el catálogo',page:0,path:'/api/v1/practice/products',method:'GET',status:200,kind:'catalog',goal:'Comprueba que los productos tienen identificador, nombre, precio numérico y disponibilidad booleana.'},
 {key:'quote',id:'API-02',title:'Cotización con descuento',page:1,path:'/api/v1/practice/quotes',method:'POST',status:200,kind:'quote',payload:{...quote,quantity:3,coupon:'QA10',shipping:'delivery'},goal:'Valida el contrato y el total: subtotal menos descuento más entrega. Esta operación no crea pedidos.'},
 {key:'shape',id:'API-03',title:'Campos incompletos',page:2,path:'/api/v1/practice/quotes',method:'POST',status:400,kind:'error',payload:{quantity:1},error:'Campos requeridos: productId (texto), quantity (número), shipping (pickup o delivery), coupon opcional.',goal:'Faltan campos del contrato de entrada. Comprueba status y error específico.'},
 {key:'missing',id:'API-04',title:'Producto inexistente',page:2,path:'/api/v1/practice/quotes',method:'POST',status:404,kind:'error',payload:{...quote,productId:'unknown'},error:'Producto ficticio no encontrado.',goal:'Una estructura válida también puede referirse a un producto que no existe.'},
 {key:'soldOut',id:'API-05',title:'Producto sin cupos',page:2,path:'/api/v1/practice/quotes',method:'POST',status:409,kind:'error',payload:{...quote,productId:'sold-out'},error:'El producto ficticio no tiene cupos.',goal:'Distingue un conflicto de disponibilidad de un producto inexistente.'},
 {key:'coupon',id:'API-06',title:'Cupón no admitido',page:2,path:'/api/v1/practice/quotes',method:'POST',status:422,kind:'error',payload:{...quote,coupon:'INVALIDO'},error:'Cupón ficticio inválido.',goal:'La petición se entiende, pero el cupón incumple la regla de negocio.'},
 {key:'noToken',id:'API-07',title:'Sin autenticación',page:3,path:'/api/v1/practice/access?scope=write',method:'GET',status:401,kind:'error',token:'',error:'Usa un token de demostración: demo-reader o demo-admin. No envíes credenciales reales.',goal:'Sin token de demostración debe indicarse falta de autenticación y un desafío Bearer en el header.'},
 {key:'reader',id:'API-08',title:'Reader sin permiso',page:3,path:'/api/v1/practice/access?scope=write',method:'GET',status:403,kind:'error',token:'demo-reader',error:'El rol ficticio reader no puede escribir.',goal:'El token ficticio se reconoce, pero no autoriza escritura. No equivale a no tener autenticación.'},
 {key:'admin',id:'API-09',title:'Admin autorizado',page:3,path:'/api/v1/practice/access?scope=write',method:'GET',status:200,kind:'access',token:'demo-admin',goal:'Comprueba el permiso de escritura y el rol admin del sandbox; no representa una sesión real.'},
 {key:'empty',id:'API-10',title:'Respuesta sin contenido',page:4,path:'/api/v1/practice/status/204',method:'GET',status:204,kind:'empty',goal:'Esta respuesta controlada no tiene cuerpo. Comprueba texto vacío sin intentar parsearlo como JSON.'}
];
export const apiSteps=[{title:'Lee el contrato',goal:'Descubre el catálogo y contrasta status, headers y estructura antes de automatizar.'},{title:'Valida el negocio',goal:'Una cotización necesita tipos y valores correctos: no basta con recibir un status exitoso.'},{title:'Diseña negativos',goal:'Cada error cubre un riesgo distinto. Valida el código exacto y el mensaje de su contrato.'},{title:'Distingue permisos',goal:'Compara autenticación ausente, permiso insuficiente y acceso autorizado con tokens ficticios.'},{title:'Cierra la suite',goal:'Comprueba una respuesta sin contenido y prepara diez escenarios trazables para Playwright.'}];
export const apiDraft=(book:ApiMission,key:ApiKey):ApiDraft=>({prediction:'',...book.drafts[key]});
export const apiPayload=(book:ApiMission,item:ApiCase)=>apiDraft(book,item.key).payload??JSON.stringify(item.payload,null,2);
export const apiToken=(book:ApiMission,item:ApiCase)=>apiDraft(book,item.key).token??item.token??'';
export function apiInputError(book:ApiMission,item:ApiCase){const draft=apiDraft(book,item.key);if(!/^\d{3}$/.test(draft.prediction)||Number(draft.prediction)<100||Number(draft.prediction)>599)return 'Escribe un código HTTP entero entre 100 y 599. Consulta la pista si necesitas contexto.';if(item.kind==='quote'&&!/^\d{1,8}$/.test(draft.total||''))return 'Escribe el total esperado en COP como un número entero sin separadores.';if(item.method==='POST'){try{JSON.parse(apiPayload(book,item))}catch{return 'El cuerpo debe ser JSON válido. Los errores de campos del desafío se envían dentro de un JSON válido.'}}return ''}
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==='object'&&!Array.isArray(value);
const number=(value:unknown):value is number=>typeof value==='number'&&Number.isFinite(value);
export function apiChecks(book:ApiMission,item:ApiCase,record=book.records[item.key]){if(!record)return [];const add=(label:string,ok:boolean)=>({label,ok}),draft=apiDraft(book,item.key),checks=[add('Status coincide con tu predicción',Number(draft.prediction)===record.status&&/^\d{3}$/.test(draft.prediction)),add('Status cumple el contrato del desafío',record.status===item.status),add('Header X-QAPath-Sandbox identifica el entorno',record.tag==='true'),add('Respuesta completa disponible para validar',!record.cut)];
 if(item.page===3)checks.push(add('Token ficticio corresponde al escenario',apiToken(book,item)===(item.token||'')));
 if(item.kind==='empty')return [...checks,add('Cuerpo vacío: no se interpreta como JSON',record.body==='')];
 checks.push(add('Content-Type informa application/json',record.ct.toLowerCase().includes('application/json')));let body:unknown;try{body=JSON.parse(record.body)}catch{}
 checks.push(add('Cuerpo es un objeto JSON del sandbox',object(body)&&body.sandbox===true));if(!object(body))return [...checks,add('Contrato de contenido presente',false)];
 if(item.kind==='catalog'){const products=body.data,valid=Array.isArray(products)&&products.length>=3&&products.every(value=>object(value)&&typeof value.id==='string'&&!!value.id&&typeof value.name==='string'&&!!value.name&&number(value.price)&&value.price>0&&typeof value.available==='boolean');checks.push(add('Productos: id, nombre, precio numérico y disponibilidad booleana',valid));checks.push(add('Identificadores únicos y productos de entrenamiento presentes',Array.isArray(products)&&new Set(products.map(value=>object(value)?value.id:null)).size===products.length&&['basic','pro','sold-out'].every(id=>products.some(value=>object(value)&&value.id===id))));checks.push(add('Precio básico y disponibilidad del producto sin cupos',Array.isArray(products)&&products.some(value=>object(value)&&value.id==='basic'&&value.price===35000&&value.available===true)&&products.some(value=>object(value)&&value.id==='sold-out'&&value.available===false)))}
 else if(item.kind==='quote'){const data=body.data;let sent:unknown;try{sent=JSON.parse(apiPayload(book,item))}catch{}const valid=object(data)&&['quantity','subtotal','discount','shipping','total'].every(key=>number(data[key]));checks.push(add('Cantidad e importes tienen tipo number',valid));const price=object(sent)?sent.productId==='basic'?35000:sent.productId==='pro'?75000:NaN:NaN,quantity=object(sent)&&number(sent.quantity)?sent.quantity:NaN,subtotal=price*quantity,discount=object(sent)&&sent.coupon==='QA10'?Math.round(subtotal*0.1):0,shipping=object(sent)&&sent.shipping==='delivery'?10000:0;checks.push(add('Entrada cumple tipos y límites de una cotización positiva',object(sent)&&['basic','pro'].includes(String(sent.productId))&&number(sent.quantity)&&Number.isInteger(sent.quantity)&&sent.quantity>=1&&sent.quantity<=5&&['pickup','delivery'].includes(String(sent.shipping))&&[undefined,'','QA10'].includes(sent.coupon as string|undefined)&&Object.keys(sent).every(key=>['productId','quantity','coupon','shipping'].includes(key))&&(sent.coupon!=='QA10'||subtotal>=100000)));checks.push(add('Producto, cantidad y moneda corresponden a la petición',object(data)&&object(sent)&&data.productId===sent.productId&&data.quantity===sent.quantity&&data.currency==='COP'));checks.push(add('Subtotal, descuento y entrega cumplen la regla',object(data)&&data.subtotal===subtotal&&data.discount===discount&&data.shipping===shipping));checks.push(add('Total coincide con tu esperado y con la regla de negocio',object(data)&&number(data.total)&&/^\d{1,8}$/.test(draft.total||'')&&data.total===Number(draft.total)&&data.total===subtotal-discount+shipping))}
 else if(item.kind==='access')checks.push(add('Contrato autoriza scope write con rol admin',object(body.data)&&body.data.scope==='write'&&body.data.role==='admin'));
 else {checks.push(add('Error es texto y coincide con el riesgo del caso',typeof body.error==='string'&&body.error===item.error));if(item.status===401)checks.push(add('WWW-Authenticate presenta un desafío Bearer',/^Bearer\b/.test(record.auth||'')))}
 return checks;
}
export const apiPassed=(book:ApiMission,item:ApiCase)=>!!book.records[item.key]&&Number.isFinite(Date.parse(book.records[item.key]!.at))&&!apiInputError(book,item)&&apiChecks(book,item).every(check=>check.ok);
export const apiPageReady=(book:ApiMission,page:number)=>apiCases.filter(item=>item.page===page).every(item=>apiPassed(book,item));
export const apiComplete=(book:ApiMission)=>apiCases.every(item=>apiPassed(book,item));
export function readApiMission(source?:string):ApiMission{const empty:ApiMission={apiLabVersion:1,page:0,drafts:{},records:{}};try{const raw=JSON.parse(source||'{}');if(raw.apiLabVersion!==1){if(raw&&typeof raw.productId==='string'&&typeof raw.quantity==='number'&&typeof raw.shipping==='string'){const payload=JSON.stringify(raw,null,2);if(payload.length<=600)empty.drafts.quote={prediction:'',payload}}return empty;}empty.page=Number.isInteger(raw.page)?Math.max(0,Math.min(4,raw.page)):0;if(apiCases.some(item=>item.key===raw.selected&&item.page===empty.page))empty.selected=raw.selected;for(const item of apiCases){const draft=raw.drafts?.[item.key],record=raw.records?.[item.key];if(draft&&typeof draft.prediction==='string')empty.drafts[item.key]={prediction:draft.prediction.slice(0,3),...(typeof draft.payload==='string'?{payload:draft.payload.slice(0,600)}:{}),...(typeof draft.total==='string'?{total:draft.total.slice(0,8)}:{}),...(['','demo-reader','demo-admin'].includes(draft.token)?{token:draft.token as DemoToken}:{})};if(record&&Number.isInteger(record.status)&&record.status>=100&&record.status<=599&&['ct','tag','body','at'].every(key=>typeof record[key]==='string')&&Number.isFinite(Date.parse(record.at))&&typeof record.cut==='boolean')empty.records[item.key]={status:record.status,ct:record.ct.slice(0,80),tag:record.tag.slice(0,20),body:record.body.slice(0,700),at:record.at,cut:record.cut||record.body.length>700,...(typeof record.auth==='string'?{auth:record.auth.slice(0,120)}:{})}}return empty}catch{return empty}}
export const apiReflections=[{title:'¿Qué contrato validaste además del status?',hint:'Relaciona método, ruta, campos de entrada, tipos de salida y regla del total. Una cantidad numérica no equivale a una cadena con dígitos.'},{title:'¿Qué riesgo distinto cubre cada negativo?',hint:'Compara campos incompletos, producto inexistente, falta de cupos y cupón inválido. Distingue también 401 de 403 y explica por qué 204 no se parsea como JSON.'},{title:'¿Cómo se repite y entrega la suite?',hint:'Relaciona API-01 a API-10 con los datos y el spec descargado. Registra el reporte externo cuando lo ejecutes. Cotizar en este sandbox no crea pedidos persistentes.'}];
export function apiEvidence(source:string|undefined,output:string,values:string[],labels:string[]){const book=readApiMission(source);return ['# Semana 19 · Automatización API por contrato','Solicitudes reales al sandbox stateless. No crean pedidos ni usuarios. El reporte de Playwright queda pendiente hasta ejecutar la suite externa.',...apiCases.flatMap(item=>{const record=book.records[item.key],draft=apiDraft(book,item.key);return ['## '+item.id+' · '+item.title,`${item.method} ${item.path}\nPredicción: ${draft.prediction||'pendiente'}\nContrato: HTTP ${item.status}\nSpec: tests/api-contract.training.spec.ts · ${item.id}`,...(item.method==='POST'?['Payload: '+apiPayload(book,item)]:[]),...(record?[`Fecha: ${record.at}\nObtenido: HTTP ${record.status}\nContent-Type: ${record.ct}\nX-QAPath-Sandbox: ${record.tag}`,...(record.auth?['WWW-Authenticate: '+record.auth]:[]),'Cuerpo observado: '+(record.body||'(vacío)'),...apiChecks(book,item).map(check=>(check.ok?'✓ ':'× ')+check.label)]:['Sin ejecución registrada.'])]}),'## Última salida',output,...labels.flatMap((label,i)=>['## '+label,values[i]?.trim()||'Reflexión opcional pendiente.'])].join('\n\n')}
export function apiFiles(book:ApiMission){const cases=apiCases.map(item=>{let data;try{data=item.method==='POST'?JSON.parse(apiPayload(book,item)):undefined}catch{data=item.payload}return {id:item.id,title:item.title,path:item.path,method:item.method,status:item.status,kind:item.kind,...(data!==undefined?{data}:{}),...(item.kind==='quote'?{total:Number(apiDraft(book,item.key).total)||104500}:{}),...(item.error?{error:item.error}:{}),...(apiToken(book,item)?{token:apiToken(book,item)}:{})}});return [{name:'data/api-cases.training.ts',source:`// Datos ficticios. Cada fila cubre un contrato y un riesgo identificables.
export type ContractCase={id:string;title:string;path:string;method:'GET'|'POST';status:number;kind:'catalog'|'quote'|'error'|'access'|'empty';data?:unknown;total?:number;error?:string;token?:string};
export const apiCases:readonly ContractCase[]=${JSON.stringify(cases,null,2)};
`},{name:'tests/api-contract.training.spec.ts',source:`import {test,expect} from '@playwright/test';
import {apiCases} from '../data/api-cases.training';
for(const item of apiCases){
 test(item.id+' '+item.title,async({request})=>{
  const response=await request.fetch(item.path,{
   method:item.method,headers:{Accept:'application/json',...(item.method==='POST'?{'Content-Type':'application/json'}:{}),...(item.token?{Authorization:'Bearer '+item.token}:{})},
   ...(item.method==='POST'?{data:JSON.stringify(item.data)}:{})
  });
  expect(response.status()).toBe(item.status);
  expect(response.headers()['x-qapath-sandbox']).toBe('true');
  // Una respuesta 204 no se interpreta como JSON.
  if(item.kind==='empty'){expect(await response.text()).toBe('');return;}
  expect(response.headers()['content-type']).toContain('application/json');
  const body=await response.json();
  expect(body.sandbox).toBe(true);
  if(item.kind==='catalog'){
   expect(Array.isArray(body.data)).toBe(true);
   expect(body.data.length).toBeGreaterThanOrEqual(3);
   for(const product of body.data){
    expect(typeof product.id).toBe('string');expect(product.id.length).toBeGreaterThan(0);
    expect(typeof product.name).toBe('string');expect(product.name.length).toBeGreaterThan(0);
    expect(typeof product.price).toBe('number');expect(Number.isFinite(product.price)).toBe(true);expect(product.price).toBeGreaterThan(0);
    expect(typeof product.available).toBe('boolean');
   }
   expect(new Set(body.data.map((product:{id:string})=>product.id)).size).toBe(body.data.length);
   for(const id of ['basic','pro','sold-out'])expect(body.data.some((product:{id:string})=>product.id===id)).toBe(true);
   expect(body.data.find((product:{id:string})=>product.id==='basic')).toMatchObject({price:35000,available:true});
   expect(body.data.find((product:{id:string})=>product.id==='sold-out')).toMatchObject({available:false});
  }else if(item.kind==='quote'){
   const sent=item.data as {productId:string;quantity:number;coupon:string;shipping:string};
   for(const field of ['quantity','subtotal','discount','shipping','total']){expect(typeof body.data[field]).toBe('number');expect(Number.isFinite(body.data[field])).toBe(true);}
   expect(body.data).toMatchObject({productId:sent.productId,quantity:sent.quantity,currency:'COP'});
   expect(['basic','pro']).toContain(sent.productId);expect(Number.isInteger(sent.quantity)).toBe(true);expect(sent.quantity).toBeGreaterThanOrEqual(1);expect(sent.quantity).toBeLessThanOrEqual(5);
   expect(['pickup','delivery']).toContain(sent.shipping);expect(['','QA10']).toContain(sent.coupon||'');
   const subtotal=(sent.productId==='basic'?35000:75000)*sent.quantity;
   if(sent.coupon==='QA10')expect(subtotal).toBeGreaterThanOrEqual(100000);
   const discount=sent.coupon==='QA10'?Math.round(subtotal*0.1):0;
   const shipping=sent.shipping==='delivery'?10000:0;
   expect(body.data.subtotal).toBe(subtotal);expect(body.data.discount).toBe(discount);expect(body.data.shipping).toBe(shipping);
   expect(body.data.total).toBe(subtotal-discount+shipping);expect(body.data.total).toBe(item.total);
  }else if(item.kind==='access'){
   expect(body.data).toMatchObject({scope:'write',role:'admin'});
  }else{
   expect(typeof body.error).toBe('string');expect(body.error).toBe(item.error);
   if(item.status===401)expect(response.headers()['www-authenticate']).toMatch(/^Bearer\\b/);
  }
 });
}
`}];}
