import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {courseOutlineSchema,outlineGradeSchema,checkStudyFile}=require('../packages/contracts/dist/index.js');
const {normalizeOutline,publicOutline,gradeChapter,ManageCourseOutline,CatalogError}=require('../libs/learning/dist/index.js');
const card=(id,extra={})=>({id,title:'Tarjeta '+id,text:'# Hola\r\nTexto',visuals:[],...extra});
const outline={weeks:[{id:'w1',title:'Semana uno',summary:'',chapters:[{id:'c1',title:'Capítulo uno',outcome:'',cards:[card('k1',{visuals:[{filename:'flujo.mmd',content:'flowchart LR\nA-->B'}]}),card('k2')],quiz:[{id:'q1',question:'¿Qué es un fallo?',options:['Un error','Lo observable'],correct:1,explanation:'Es lo observable al ejecutar.'},{id:'q2',question:'¿Y un defecto?',options:['En el código','Nada'],correct:0,explanation:''}]}]}]};
test('SPEC-CONTENT-330: outline schema validates structure, unique ids and correct option index',()=>{
 assert.equal(courseOutlineSchema.safeParse(outline).success,true);
 const dup=structuredClone(outline);dup.weeks[0].chapters[0].cards[1].id='k1';assert.match(courseOutlineSchema.safeParse(dup).error.issues[0].message,/repetido/);
 const bad=structuredClone(outline);bad.weeks[0].chapters[0].quiz[0].correct=5;assert.equal(courseOutlineSchema.safeParse(bad).success,false);
 const forged=structuredClone(outline);forged.weeks[0].html='<script>';assert.equal(courseOutlineSchema.safeParse(forged).success,false);
 assert.equal(outlineGradeSchema.safeParse({answers:{q1:1}}).success,true);assert.equal(outlineGradeSchema.safeParse({answers:{'../x':1}}).success,false);
});
test('normalizeOutline validates visuals with the study-file checker and rejects markdown as a visual',()=>{
 const normalized=normalizeOutline(outline,checkStudyFile);
 assert.equal(normalized.weeks[0].chapters[0].cards[0].visuals[0].kind,'mermaid');assert.equal(normalized.weeks[0].chapters[0].cards[0].text,'# Hola\nTexto');
 const md=structuredClone(outline);md.weeks[0].chapters[0].cards[0].visuals=[{filename:'a.md',content:'# a'}];assert.throws(()=>normalizeOutline(md,checkStudyFile),/cuerpo de la tarjeta/);
 const svg=structuredClone(outline);svg.weeks[0].chapters[0].cards[0].visuals=[{filename:'x.svg',content:'<svg onload="x()"></svg>'}];assert.throws(()=>normalizeOutline(svg,checkStudyFile),CatalogError);
});
test('public outline hides answers; grading reports score, pass at 70 % and explanations',()=>{
 const pub=publicOutline(outline);assert.deepEqual(Object.keys(pub[0].chapters[0].quiz[0]).sort(),['id','options','question']);
 const chapter=outline.weeks[0].chapters[0];
 assert.deepEqual({...gradeChapter(chapter,{q1:1,q2:0}),feedback:undefined},{score:2,total:2,percent:100,passed:true,feedback:undefined});
 const half=gradeChapter(chapter,{q1:0,q2:0});assert.equal(half.passed,false);assert.equal(half.feedback[0].expected,1);assert.equal(half.feedback[0].explanation,'Es lo observable al ejecutar.');
 assert.throws(()=>gradeChapter({...chapter,quiz:[]},{}),/no tiene minitest/);
});
test('ManageCourseOutline: draft → publish rules, read/grade only published, progress only for known cards',async()=>{
 let state={courseId:'c',title:'Curso',draft:null,draftRevision:0,draftUpdatedAt:null,published:null,publishedRevision:0,publishedAt:null};const calls=[];
 const repo={load:async()=>state,saveDraft:async(actor,id,rev,o,action)=>{calls.push(action);if(rev!==state.draftRevision)throw new CatalogError('CONFLICT','x');state={...state,draft:o,draftRevision:rev+1};return rev+1},
  publish:async()=>{state={...state,published:state.draft,publishedRevision:state.publishedRevision+1,publishedAt:new Date()}},unpublish:async()=>{state={...state,published:null,publishedAt:null}},
  published:async slug=>slug==='curso'&&state.published?{courseId:'c',slug,title:'Curso',revision:1,outline:state.published}:undefined,
  progress:async()=>({readCards:[],passedChapters:{}}),markRead:async(u,c,ids)=>({readCards:ids,passedChapters:{}}),recordQuiz:async(u,c,ch,p)=>{calls.push(['quiz',u,ch,p]);return {readCards:[],passedChapters:{[ch]:p}}}};
 const m=new ManageCourseOutline(repo,checkStudyFile),owner={kind:'course',id:'c'};
 await assert.rejects(m.publish('a',owner,0),/al menos una tarjeta/);
 const empty={weeks:[{...outline.weeks[0],chapters:[outline.weeks[0].chapters[0],{...outline.weeks[0].chapters[0],id:'c2',title:'Vacío',cards:[],quiz:[]}]}]};await m.saveDraft('a',owner,0,empty);await assert.rejects(m.publish('a',owner,1),/no tiene tarjetas/);
 const saved=await m.saveDraft('a',owner,1,outline);assert.equal(saved.dirty,true);await assert.rejects(m.saveDraft('a',owner,1,outline),/x/);
 await assert.rejects(m.read('curso'),/no tiene contenido publicado/);
 const published=await m.publish('a',owner,2);assert.equal(published.dirty,false);
 const read=await m.read('curso');assert.equal(read.weeks[0].chapters[0].quiz[0].correct,undefined);
 assert.equal((await m.grade('curso','c1',{q1:1,q2:0},'student')).percent,100);assert.deepEqual(calls.at(-1),['quiz','student','c1',100]);
 await m.grade('curso','c1',{q1:1});assert.equal(calls.at(-1)[0],'quiz');
 await assert.rejects(m.grade('curso','nope',{}),/Capítulo no disponible/);
 assert.deepEqual((await m.markRead('u','curso',['k1','inventada'])).readCards,['k1']);
 assert.equal((await m.admin(owner)).ownerKind,'course');
 await m.unpublish('a',owner);await assert.rejects(m.read('curso'),/no tiene contenido/);
});
