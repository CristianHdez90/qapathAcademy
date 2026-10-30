import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {checkStudyFile,suggestLessonTitle,lessonUpdateSchema,lessonInputSchema,lessonLibraryQuerySchema}=require('../packages/contracts/dist/index.js');
const {ManageCourseLessons,CatalogError}=require('../libs/learning/dist/index.js');
const graph={type:'graph',title:'Niveles',nodes:[{id:'a',label:'A',detail:{text:'Globo'}},{id:'b',label:'B'}],edges:[{from:'a',to:'b'}]};
const chart={type:'chart',title:'Defectos',chart:'bar',xKey:'sprint',series:[{key:'bugs',label:'Bugs'}],data:[{sprint:'S1',bugs:3}]};
test('SPEC-CONTENT-320: accepts .md, .mmd, .json (graph/chart) and .svg study files',()=>{
 assert.equal(checkStudyFile('leccion.md','# Título\n\n```mermaid\nflowchart LR\nA-->B\n```').kind,'markdown');
 assert.equal(checkStudyFile('flujo.mmd','%% comentario\nsequenceDiagram\nA->>B: hola').kind,'mermaid');
 assert.equal(checkStudyFile('mapa.json',JSON.stringify(graph)).kind,'interaction');
 assert.equal(checkStudyFile('grafica.json',JSON.stringify(chart)).kind,'interaction');
 assert.equal(checkStudyFile('drawio-export.svg','<?xml version="1.0"?>\n<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">\n<svg xmlns="http://www.w3.org/2000/svg"><foreignObject/></svg>').kind,'svg');
 assert.equal(checkStudyFile('crlf.md','# A\r\nB\r\n').content,'# A\nB\n');
});
test('SPEC-CONTENT-320: rejects drawio/puml (asks for SVG export), unsafe or malformed files',()=>{
 for(const [name,body,hint] of [['a.drawio','<mxfile/>',/Exportar como → SVG/],['a.puml','@startuml',/plantuml -tsvg/],['a.pdf','x',/no admitido/],['vacio.md','  ',/vacío/],['x.mmd','hola',/tipo de diagrama/],['x.mmd','%%{init: {"theme":"dark"}}%%\nflowchart LR\nA-->B',/init/],
  ['x.svg','<svg><script>alert(1)</script></svg>',/scripts/],['x.svg','<svg onload="x()"></svg>',/scripts/],['x.svg','<!DOCTYPE svg [<!ENTITY a "b">]><svg></svg>',/entidades|<svg>/],['x.svg','<html></html>',/<svg>/],
  ['x.md','<script>alert(1)</script>',/scripts/],['x.json','{',/JSON inválido/],['x.json','{"type":"table"}',/graph|chart/],
  ['x.json',JSON.stringify({...graph,edges:[{from:'a',to:'z'}]}),/inexistente/],['x.json',JSON.stringify({...chart,data:[{sprint:'S1',bugs:'tres'}]}),/numérico/],['x.json',JSON.stringify({...graph,extra:1}),/no permitidos/],
  ['../x.md','# a',/Nombre/]]){const result=checkStudyFile(name,body);assert.equal(result.ok,false,name);assert.match(result.message,hint,name)}
 assert.equal(checkStudyFile('grande.md','a'.repeat(200_001)).ok,false);
});
test('lesson schemas: ordered mix of existing and new files, status on create, no forged fields',()=>{
 assert.equal(lessonUpdateSchema.safeParse({revision:1,title:'Lección',summary:'',status:'PUBLISHED',files:[{id:'6f1c3a52-3e1b-4c55-9d0e-1a2b3c4d5e6f'},{filename:'a.md',content:'# a'}]}).success,true);
 assert.equal(lessonUpdateSchema.safeParse({revision:1,title:'Lección',summary:'',status:'ARCHIVED',files:[]}).success,false);
 assert.equal(lessonInputSchema.parse({title:'Lección'}).status,'DRAFT');
 assert.equal(lessonInputSchema.safeParse({title:'Lección',files:[],courseId:'forjado'}).success,false);
 assert.equal(lessonLibraryQuerySchema.safeParse({deleted:'true'}).success,true);assert.equal(lessonLibraryQuerySchema.safeParse({deleted:'1'}).success,false);
 assert.equal(suggestLessonTitle('01-intro.md','texto\n# Ciclo de **vida**\n'),'Ciclo de vida');assert.equal(suggestLessonTitle('mapa_niveles.json','{}'),'mapa niveles');
});
test('ManageCourseLessons (biblioteca) valida con el verificador inyectado antes del repositorio',async()=>{
 const calls=[];const repo={create:async(...args)=>{calls.push(['create',...args]);return {}},update:async(...args)=>{calls.push(['update',...args]);return {}},get:async()=>undefined,library:async q=>{calls.push(['library',q]);return []},forCourse:async()=>[],getForCourse:async()=>undefined,remove:async(...args)=>{calls.push(['remove',...args]);return {}},restore:async()=>({})};
 const lessons=new ManageCourseLessons(repo,checkStudyFile);
 await lessons.create('admin',{title:'  Lección uno ',summary:'',files:[{filename:'a.md',content:'# A\r\n'}]});
 assert.deepEqual(calls[0][2],{title:'Lección uno',summary:'',status:'DRAFT',files:[{kind:'markdown',filename:'a.md',content:'# A\n'}]});
 await assert.rejects(lessons.create('admin',{title:'Lección',summary:'',files:[{filename:'a.puml',content:'@startuml'}]}),error=>error instanceof CatalogError&&/a\.puml/.test(error.message));
 await assert.rejects(lessons.create('admin',{title:'Lección',summary:'',status:'PUBLISHED',files:[]}),/al menos un archivo/);
 await assert.rejects(lessons.create('admin',{title:'Lección',summary:'',files:[{id:'x'}]}),/solo admite archivos nuevos/);
 await assert.rejects(lessons.update('admin','l',1,{title:'Lección',summary:'',status:'DRAFT',files:[{id:'x'},{id:'x'}]}),/repetidos/);
 await lessons.update('admin','l',2,{title:'Lección',summary:'',status:'DRAFT',files:[{id:'x'},{filename:'b.mmd',content:'flowchart LR\nA-->B'}]});
 assert.deepEqual(calls.at(-1)[4].files,[{id:'x'},{kind:'mermaid',filename:'b.mmd',content:'flowchart LR\nA-->B'}]);
 await lessons.library({search:'  abc  ',deleted:true});assert.deepEqual(calls.at(-1)[1],{search:'abc',deleted:true});
 await lessons.remove('admin','l',3);assert.deepEqual(calls.at(-1),['remove','admin','l',3]);
 await assert.rejects(lessons.get('nope'),/no disponible/);
});
