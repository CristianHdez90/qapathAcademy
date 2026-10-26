import {basicScenario,scenarioSpec} from './runtime/browser-scenario';
export type MatrixObservation={width:number;height:number;api:number;ui:number;status:number;layout:boolean;agent:string;at:string};
export type MatrixMission={matrixVersion:1;page:number;prepared:boolean;desktop?:MatrixObservation;mobile?:MatrixObservation;tags:boolean};
export const matrixSteps=[
 {title:'Diseña tu cobertura',goal:'Un escenario lógico puede ejecutarse en varias combinaciones. Elige cobertura útil sin contar requisitos nuevos.',steps:['TC-01: cotización básica, una unidad y recogida → 35000 COP.','TC-02: tres unidades, QA10 y entrega → 104500 COP.','Usa @smoke para TC-01; @regression incluye ambos casos.'],hint:'Con tres proyectos desktop y uno móvil, TC-01 produce cuatro ejecuciones. Siguen siendo un solo caso lógico.'},
 {title:'Comprueba escritorio',goal:'Ejecuta TC-01 en una vista de 1100 × 800. Conserva API, total visible y revisión horizontal.',steps:['La vista pertenece al navegador que estás usando.','Ejecuta la cotización y compara con 35000 COP.','Si la API falla o la vista desborda, revisa la salida y vuelve a ejecutar.'],hint:'Cambiar el ancho de un iframe no inicia Chromium, Firefox ni WebKit. El motor real se conserva en la evidencia mediante su user agent.'},
 {title:'Comprueba móvil',goal:'Repite el mismo TC-01 a 390 × 844 y compara su comportamiento.',steps:['Conserva los mismos datos para aislar el efecto del viewport.','Ejecuta la vista móvil y comprueba controles y total.','Se permite desplazamiento vertical; no debe haber desbordamiento horizontal.'],hint:'Es una vista estrecha del navegador actual, no un dispositivo físico ni una ejecución en otro motor. La comprobación mide el DOM; revisa también la legibilidad visualmente.'},
 {title:'Filtra con etiquetas',goal:'Distingue casos lógicos de ejecuciones antes de lanzar una suite.',steps:['@smoke selecciona TC-01: un caso lógico.','@regression selecciona TC-01 y TC-02: dos casos lógicos.','Cada caso seleccionado se repite en cuatro proyectos configurados.'],hint:'Multiplica casos seleccionados por proyectos: smoke = 1 × 4; regression = 2 × 4. Las etiquetas filtran pruebas; no crean requisitos.'},
 {title:'Prepara la matriz externa',goal:'Lleva la misma cobertura al kit y conserva evidencia por navegador.',steps:['Descarga playwright.config.ts y matrix-quote.spec.ts. Coloca el spec en tests del kit.','Configura BASE_URL e instala los tres motores antes de ejecutar.','Guarda reporte, proyecto, versión, viewport y trace si falla una combinación.'],hint:'Las filas externas quedan pendientes aquí: descargar o leer un comando no demuestra una ejecución. Documenta después los resultados reales de tu terminal.'}
];
export const matrixPassed=(value:MatrixObservation|undefined,width:number)=>!!value&&value.width===width&&value.height===(width===390?844:800)&&value.status===200&&value.api===35000&&value.ui===35000&&value.layout;
export const matrixComplete=(value:MatrixMission)=>value.prepared&&matrixPassed(value.desktop,1100)&&matrixPassed(value.mobile,390)&&value.tags;
export function readMatrix(source?:string):MatrixMission{
 const empty:MatrixMission={matrixVersion:1,page:0,prepared:false,tags:false};
 try{const value=JSON.parse(source||'{}');if(value.matrixVersion!==1)return empty;
 const observation=(item:MatrixObservation|undefined):MatrixObservation|undefined=>item&&[item.width,item.height,item.api,item.ui,item.status].every(Number.isFinite)&&typeof item.layout==='boolean'&&typeof item.agent==='string'&&typeof item.at==='string'&&Number.isFinite(Date.parse(item.at))?{width:item.width,height:item.height,api:item.api,ui:item.ui,status:item.status,layout:item.layout,agent:item.agent.slice(0,300),at:item.at}:undefined;
 return {...empty,page:Math.max(0,Math.min(4,Number.isInteger(value.page)?value.page:0)),prepared:value.prepared===true,tags:value.tags===true,desktop:observation(value.desktop),mobile:observation(value.mobile)};
 }catch{return empty}
}
export function matrixConfig(){return `import {defineConfig,devices} from '@playwright/test';
export default defineConfig({
 testDir:'./tests',retries:0,
 reporter:[['list'],['html',{open:'never'}]],
 use:{baseURL:process.env.BASE_URL||'http://localhost:3000',trace:'retain-on-failure'},
 projects:[
  {name:'chromium',use:{...devices['Desktop Chrome']}},
  {name:'firefox',use:{...devices['Desktop Firefox']}},
  {name:'webkit',use:{...devices['Desktop Safari']}},
  // Vista móvil en Chromium: no representa un teléfono físico.
  {name:'chromium-mobile',use:{...devices['Desktop Chrome'],viewport:{width:390,height:844}}}
 ]
});`}
export function matrixSpec(){
 const cases=[{config:basicScenario,title:'TC-01 cotizacion basica @smoke @regression',comment:'Smoke: valida la ruta principal con una unidad y recogida.'},{config:{...basicScenario,quantity:'3',coupon:'QA10',shipping:'delivery',expected:'104500 COP'},title:'TC-02 descuento y entrega @regression',comment:'Regresion: cubre descuento y envio sin alterar el caso smoke.'}];
 return cases.map((item,i)=>'// '+item.comment+'\n'+scenarioSpec(item.config).replace(i?"import {test,expect} from '@playwright/test';\n":'__unused__','').replace("'cotización configurada'",JSON.stringify(item.title)).replace("page.goto('/practice')","page.goto('/practice#qa-store-quote')").replace(/\n\}\);$/,"\n // Revisa el ancho real, ademas del importe.\n expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);\n});")).join('\n\n');
}
export const matrixReflections=[
 {title:'¿Por qué elegiste esa cobertura?',hint:'Distingue 2 casos lógicos, 4 proyectos y el número de ejecuciones de cada filtro. Explica el riesgo que cubre cada caso.'},
 {title:'¿Qué observaste al cambiar de vista?',hint:'Compara esperado, API, UI y desbordamiento de las dos capturas. El motor no cambia al estrechar la vista.'},
 {title:'¿Cómo investigarías un fallo de un solo navegador?',hint:'Conserva proyecto, versión, sistema, viewport, pasos, esperado, obtenido, reporte y trace. Indica pendiente si todavía no ejecutaste la matriz externa.'}
];
export function matrixEvidence(source:string|undefined,output:string,values:string[],labels:string[]){const mission=readMatrix(source);return ['# Semana 16 · Matriz de navegadores y smoke','Comprobaciones integradas en el navegador actual. La matriz externa queda pendiente hasta ejecutar Playwright.',...([['Escritorio',mission.desktop],['Móvil',mission.mobile]] as const).flatMap(([title,item])=>['## '+title,item?`${item.width} × ${item.height}\nFecha: ${item.at}\nUser agent: ${item.agent}\nEsperado: 35000 COP\nAPI: ${item.api} COP\nUI: ${item.ui} COP\nHTTP: ${item.status}\nSin desbordamiento horizontal: ${item.layout?'sí':'no'}`:'Pendiente']), '## Matriz externa','Chromium desktop: pendiente\nFirefox desktop: pendiente\nWebKit desktop: pendiente\nChromium 390 × 844: pendiente','## Última salida',output,...labels.flatMap((label,i)=>['## '+label,values[i]?.trim()||'Reflexión opcional pendiente.'])].join('\n\n')}
