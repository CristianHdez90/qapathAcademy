import type {PracticeRun} from '@/components/academy/practice-execution';
export type LocatorConfig={kind:'label'|'role'|'css';name:string;expected:string;wrapped:boolean;focusConfirmed:boolean};
export type KeyboardObservation={seen:string[];tabs:number;activated:boolean};
export type LocatorRecord={locatorLabVersion:1;page:number;config:LocatorConfig;keyboard?:KeyboardObservation};
const base:LocatorConfig={kind:'label',name:'Cantidad',expected:'1',wrapped:false,focusConfirmed:false};
type LocatorChallenge={id:string;title:string;goal:string;steps:string[];expected:string;hintTitle:string;hint:string;snippet:string;config:LocatorConfig};
export const locatorChallenges:LocatorChallenge[]=[
 {id:'label',title:'Encuentra por etiqueta',goal:'Localiza Cantidad por su nombre accesible y comprueba que hay una única coincidencia en el cotizador.',steps:['Inspecciona el locator por etiqueta con el valor Cantidad.','Observa el contorno que resalta el control encontrado.','Cambia el nombre o la expectativa y vuelve a inspeccionar para contrastar el resultado.'],expected:'Una coincidencia · campo Cantidad',hintTitle:'La etiqueta expresa la intención',hint:'Cantidad nombra el campo que utiliza el estudiante. No necesitas conocer su posición ni su clase visual. Un nombre inexistente debe encontrar cero controles, no seleccionar otro silenciosamente.',snippet:"const form = page.getByRole('region', { name: 'Cotizador QA Store' });\nawait expect(form.getByLabel('Cantidad', { exact: true })).toHaveCount(1);",config:{...base}},
 {id:'role',title:'Encuentra por rol y nombre',goal:'Identifica el botón Cotizar por su rol y texto, dentro del cotizador.',steps:['Selecciona Rol button y nombre con el valor Cotizar.','Inspecciona y observa el botón resaltado.','Comprueba una coincidencia antes de usar el locator para una acción.'],expected:'Un botón con nombre Cotizar',hintTitle:'El rol dice qué hace el elemento',hint:'button identifica una acción; el nombre Cotizar la distingue. El alcance del cotizador evita confundir botones de otras secciones. Esta inspección DOM integrada no sustituye al motor de locators de Playwright.',snippet:"form.getByRole('button', { name: 'Cotizar', exact: true });",config:{...base,kind:'role',name:'Cotizar'}},
 {id:'ambiguity',title:'Resuelve ambigüedad y cambios',goal:'Compara un CSS amplio con una etiqueta y comprueba qué ocurre al cambiar el envoltorio de un fixture local.',steps:['Inspecciona input en el fixture: hay más de una coincidencia. No elijas first arbitrariamente.','Usa la etiqueta Cantidad y cambia el envoltorio visual del fixture.','Inspecciona otra vez: la etiqueta debe conservar una coincidencia. Compara también label > input antes y después.'],expected:'Etiqueta Cantidad única después de cambiar el envoltorio',hintTitle:'Un envoltorio no debería cambiar la intención',hint:'El fixture tiene Cantidad y Cupón. input encuentra ambos. Al envolverlos en un span, label > input deja de encontrarlos; la etiqueta sigue asociada al control. Cambia a Cantidad por etiqueta para resolver la ambigüedad.',snippet:"// Frágil ante un envoltorio nuevo:\nform.locator('label > input');\n// Conserva la intención:\nform.getByLabel('Cantidad', { exact: true });",config:{...base,kind:'css',name:'input'}},
 {id:'validation',title:'Comprueba el error vigente',goal:'Ejecuta una cotización válida y luego cantidad 0. Comprueba el alert HTTP 422 y que desaparezca el total anterior.',steps:['Pulsa Ejecutar caso de validación para cotizar primero una unidad.','El laboratorio cambia Cantidad a 0 y vuelve a cotizar.','Revisa el alert vigente y la comprobación de que ya no existe el total anterior.'],expected:'HTTP 422 · mensaje de Cantidad · total anterior ausente',hintTitle:'Un total anterior no valida la petición nueva',hint:'Espera un estado observable: el alert de validación. Comprueba además que quote-total desapareció. Así un éxito anterior no oculta un fallo de los datos actuales.',snippet:"await form.getByLabel('Cantidad', { exact: true }).fill('0');\nawait form.getByRole('button', { name: 'Cotizar', exact: true }).click();\nawait expect(form.getByRole('alert')).toContainText('HTTP 422');\nawait expect(form.getByTestId('quote-total')).toHaveCount(0);",config:{...base}},
 {id:'keyboard',title:'Recorre con teclado',goal:'Navega el cotizador con Tab, activa Cotizar con Enter y revisa manualmente que el foco sea visible.',steps:['Inicia el recorrido: el foco se coloca en Producto ficticio.','Sin hacer clic en los campos, pulsa Tab hasta Cotizar y luego Enter.','Observa el foco, confirma tu revisión y pulsa Verificar recorrido. Prueba también la vista móvil.'],expected:'Recorrido con Tab · activación por teclado · 35000 COP · foco revisado',hintTitle:'El foco y la activación son observables distintos',hint:'Tab pasa por Cantidad, Cupón, Envío, el checkbox del defecto y Cotizar. Mantén el defecto desactivado. Enter sobre Cotizar solicita la cotización. La casilla de foco es tu revisión manual; no certifica accesibilidad completa.',snippet:"await form.getByLabel('Producto ficticio').focus();\nawait page.keyboard.press('Tab');\nawait expect(form.getByLabel('Cantidad', { exact: true })).toBeFocused();",config:{...base}}
];
export function normalizeLocatorText(value:string){return value.replace(/\s+/g,' ').trim()}
export function keyboardComplete(value:KeyboardObservation,confirmed:boolean,total:string){let last=-1;return confirmed&&value.activated&&value.tabs>=4&&total==='35000 COP'&&['Producto ficticio','Cantidad','Cupón','Envío','Cotizar'].every(name=>{const index=value.seen.indexOf(name);if(index<=last)return false;last=index;return true})}
export function controlName(element:Element){
 const aria=element.getAttribute('aria-label');if(aria)return normalizeLocatorText(aria);
 const labelled=element.getAttribute('aria-labelledby');if(labelled)return normalizeLocatorText(labelled.split(/\s+/).map(id=>element.ownerDocument.getElementById(id)?.textContent||'').join(' '));
 const labels=(element as HTMLInputElement).labels;if(labels?.length)return normalizeLocatorText(Array.from(labels).map(label=>label.textContent||'').join(' '));
 return normalizeLocatorText(element.closest('label')?.textContent||element.textContent||'');
}
export function inspectLocator(scope:Element,config:LocatorConfig){
 if(!config.name.trim())throw Error('Escribe una etiqueta, nombre o selector.');
 if(!/^\d{1,2}$/.test(config.expected)||Number(config.expected)>20)throw Error('Usa una cantidad esperada de 0 a 20.');
 if(config.kind==='css'){try{return Array.from(scope.querySelectorAll(config.name))}catch{throw Error('El selector CSS no es válido. Revisa su sintaxis.')}}
 return Array.from(scope.querySelectorAll(config.kind==='role'?'button,[role="button"]':'input,select,textarea')).filter(element=>controlName(element)===config.name.trim());
}
export function highlightLocator(scope:Element,matches:Element[]){
 scope.querySelectorAll('[data-qapath-locator-match]').forEach(element=>element.removeAttribute('data-qapath-locator-match'));
 const doc=scope.ownerDocument;if(!doc.getElementById('qapath-locator-outline')){const style=doc.createElement('style');style.id='qapath-locator-outline';style.textContent='[data-qapath-locator-match]{outline:3px solid #e5c47c!important;outline-offset:4px!important}';doc.head.append(style)}
 matches.slice(0,20).forEach(element=>element.setAttribute('data-qapath-locator-match','true'));
}
export function readLocatorRecord(run?:PracticeRun):LocatorRecord|undefined{
 try{const value=JSON.parse(run?.mode==='topic'?run.source:'{}');if(value.locatorLabVersion!==1||!Number.isInteger(value.page)||value.page<0||value.page>4)return;
  const c=value.config;if(!c||!['label','role','css'].includes(c.kind)||typeof c.name!=='string'||c.name.length>180||typeof c.expected!=='string'||typeof c.wrapped!=='boolean'||typeof c.focusConfirmed!=='boolean')return;
  return {locatorLabVersion:1,page:value.page,config:c};
 }catch{return}
}
export function locatorSpec(config:LocatorConfig){
 const locator=config.kind==='css'?`form.locator(${JSON.stringify(config.name)})`:config.kind==='role'?`form.getByRole('button', {name: ${JSON.stringify(config.name)}, exact: true})`:`form.getByLabel(${JSON.stringify(config.name)}, {exact: true})`;
 const count=/^\d{1,2}$/.test(config.expected)&&Number(config.expected)<=20?Number(config.expected):1;
 return `import {test, expect} from '@playwright/test';
// Copia en tests del kit. BASE_URL se configura en playwright.config.ts.
test('locator con alcance explícito', async ({page}) => {
  await page.goto('/practice#qa-store-quote');
  const form = page.getByRole('region', {name: 'Cotizador QA Store'});
  await expect(${locator}).toHaveCount(${count});
});
test('validación vigente sin total anterior', async ({page}) => {
  await page.goto('/practice#qa-store-quote');
  const form = page.getByRole('region', {name: 'Cotizador QA Store'});
  await form.getByLabel('Cantidad', {exact: true}).fill('1');
  await form.getByRole('button', {name: 'Cotizar', exact: true}).click();
  await expect(form.getByTestId('quote-total')).toHaveText('35000 COP');
  await form.getByLabel('Cantidad', {exact: true}).fill('0');
  await form.getByRole('button', {name: 'Cotizar', exact: true}).click();
  await expect(form.getByRole('alert')).toContainText('HTTP 422');
  await expect(form.getByTestId('quote-total')).toHaveCount(0);
});
test('recorrido de teclado en el formulario', async ({page}) => {
  await page.goto('/practice#qa-store-quote');
  const form = page.getByRole('region', {name: 'Cotizador QA Store'});
  await form.getByLabel('Producto ficticio').focus();
  // Espera cada foco observable; no uses pausas para sincronizar.
  for (const name of ['Cantidad', 'Cupón', 'Envío', 'Activar defecto de cálculo (solo práctica)']) {
    await page.keyboard.press('Tab');
    await expect(form.getByLabel(name, {exact: true})).toBeFocused();
  }
  await page.keyboard.press('Tab');
  await expect(form.getByRole('button', {name: 'Cotizar', exact: true})).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(form.getByTestId('quote-total')).toHaveText('35000 COP');
});
// Esta revisión limitada no declara conformidad WCAG completa.
`;
}
export const locatorReflections=[
 {title:'¿Qué locator conservó la intención?',help:'Describe estrategia, nombre, alcance y coincidencias. Explica cómo resolviste una búsqueda ambigua.',hint:'Compara input o label > input con la etiqueta Cantidad. Relaciona las coincidencias observadas con el cambio de envoltorio; no uses first solo para esconder duplicados.',placeholder:'Busqué… Encontré… Lo acoté mediante…'},
 {title:'¿Qué observaste con Tab y el foco?',help:'Cuenta qué controles recorriste, cómo activaste Cotizar y qué revisaste manualmente del foco.',hint:'El laboratorio registra los eventos Tab y Enter/espacio sobre Cotizar. La visibilidad del foco es una revisión manual. Indica vista, límites y lo que quedó pendiente.',placeholder:'Con Tab recorrí… El foco… Activé… Queda pendiente…'},
 {title:'¿Qué resultado y evidencia conservaste?',help:'Separa inspección integrada, validación HTTP 422 y ejecución externa del spec si la realizaste.',hint:'Anota coincidencias o alert y ausencia del total anterior. Descargar el spec no ejecuta Playwright. Añade navegador, comando y reporte externo solo cuando los hayas ejecutado.',placeholder:'Esperaba… Obtuve… Guardé… Comando o reporte externo…'}
];
export function locatorEvidence(run:PracticeRun|undefined,values:string[],labels:string[]){const record=readLocatorRecord(run);return ['# Semana 14 · Locators y navegación accesible','Inspección DOM y acciones sobre QA Store integradas en el navegador. La revisión de foco es manual y no certifica conformidad WCAG completa. El spec generado se ejecuta aparte con Playwright.',...(run?['Fecha: '+run.at,'Resultado integrado: '+(run.ok?'Correcto':'Por revisar'),'## Configuración y observaciones','```json',run.source,'```','## Salida real','```text',run.output,'```',...(record?['## Spec generado · no demuestra ejecución externa','```typescript',locatorSpec(record.config),'```']:[])]:['Sin comprobaciones registradas.']),...labels.flatMap((label,i)=>['## '+label,values[i]?.trim()||'Reflexión opcional pendiente.'])].join('\n\n')}
