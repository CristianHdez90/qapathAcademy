import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),{validateCourse,courseTransition,validatePath,normalizeCourseSearch}=require('../libs/learning/dist/index.js');
const {courseInputSchema,courseUpdateSchema,learningPathInputSchema}=require('../packages/contracts/dist/index.js');
const input={slug:'curso-demo',title:'Curso de pruebas',summary:'Objetivo de aprendizaje',description:'Descripción',category:'QA',skills:['Pruebas'],position:9,cover:null,contentKind:'LEGACY_MODULE',assignments:[{kind:'LEGACY_MODULE',ref:'manual'}]};
test('course invariants reject unsafe slugs, covers, references and unusable publication',()=>{
 assert.doesNotThrow(()=>validateCourse(input,'PUBLISHED'));
 for(const change of [{slug:'../x'},{cover:'https://untrusted.example/a.svg'},{title:'x'},{position:-1},{assignments:[{kind:'LEGACY_MODULE',ref:'unknown'}]},{assignments:[...input.assignments,...input.assignments]}])assert.throws(()=>validateCourse({...input,...change},'PUBLISHED'));
 assert.throws(()=>validateCourse({...input,assignments:[]},'PUBLISHED'));assert.doesNotThrow(()=>validateCourse({...input,assignments:[]},'DRAFT'));
 // SPEC-CONTENT-321: lecciones de la biblioteca como contenido asignado (en cualquier tipo de curso).
 const lesson={kind:'LESSON',ref:'6f1c3a52-3e1b-4c55-9d0e-1a2b3c4d5e6f'},curated={...input,contentKind:'CURATED',assignments:[lesson]};
 assert.throws(()=>validateCourse({...curated,assignments:[]},'PUBLISHED',0));assert.throws(()=>validateCourse(curated,'PUBLISHED',0));
 assert.doesNotThrow(()=>validateCourse(curated,'PUBLISHED',1));assert.throws(()=>validateCourse({...curated,summary:''},'PUBLISHED',1));
 assert.doesNotThrow(()=>validateCourse({...input,assignments:[...input.assignments,lesson]},'PUBLISHED',0));
 assert.throws(()=>validateCourse({...curated,assignments:[{kind:'LESSON',ref:'../etc'}]},'DRAFT'));
 assert.throws(()=>validateCourse({...input,assignments:[...input.assignments,{kind:'LEGACY_MODULE',ref:'fundamentos'}]},'DRAFT'));
 assert.equal(courseInputSchema.safeParse({...input,userId:'forged'}).success,false);
 assert.equal(courseUpdateSchema.safeParse({...input,status:'ARCHIVED',revision:1}).success,false);
});
test('archive is reversible only through DRAFT and route selection has no academic side effects',()=>{
 const archived={...input,id:'x',status:'ARCHIVED'};
 assert.throws(()=>courseTransition(archived,'PUBLISHED'));assert.doesNotThrow(()=>courseTransition(archived,'DRAFT',true));
 assert.throws(()=>courseTransition({...archived,status:'PUBLISHED'},'DRAFT',true));
 assert.doesNotThrow(()=>validatePath('Mi ruta',['a','b']));for(const ids of [[],['a','a'],Array.from({length:25},(_,i)=>String(i))])assert.throws(()=>validatePath('Mi ruta',ids));
 assert.equal(learningPathInputSchema.safeParse({title:'Mi ruta',courseIds:['bad-id'],active:true}).success,false);
 assert.equal(normalizeCourseSearch('  Automatización ÁGIL '),'automatizacion agil');
});
