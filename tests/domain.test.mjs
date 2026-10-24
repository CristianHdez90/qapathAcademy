import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {Quiz,WeekNumber,ValidationError,GradeQuiz,GetLesson}=require('../libs/learning/dist/index.js');
const {fromUnknown,UpdateProgress,emptyProgress}=require('../libs/progress/dist/index.js');
const {EmailAddress}=require('../libs/identity/dist/index.js');
const questions=[{q:'Ejemplo',a:['A','B'],correct:1,why:'B es la respuesta correcta'}];
test('Aggregate Quiz calcula porcentaje y rechaza opciones inválidas',()=>{
 assert.equal(Quiz.from(questions).grade([1]).percent,100);
 assert.equal(Quiz.from(questions).grade([0]).percent,0);
 assert.throws(()=>Quiz.from(questions).grade([2]),ValidationError);
 assert.throws(()=>Quiz.from([]),ValidationError);
});
test('El caso de uso GradeQuiz no depende de NestJS ni DB',()=>{
 const repo={quiz:id=>id==='fundamentos'?questions:undefined,scrum:()=>({quiz:questions})};
 assert.equal(new GradeQuiz(repo).execute('fundamentos',[1]).score,1);
 assert.equal(new GradeQuiz(repo).execute('scrum',[0]).score,0);
});
test('Value Objects validan invariantes',()=>{
 assert.equal(WeekNumber.create(12).value,12);
 assert.throws(()=>WeekNumber.create(0),ValidationError);
 assert.equal(EmailAddress.create('  ESTUDIANTE@EXAMPLE.COM ').value,'estudiante@example.com');
 assert.throws(()=>EmailAddress.create('invalido'));
});
test('Caso de uso lección obtiene semana y guía desde puerto mock',()=>{
 const repo={week:n=>n===1?{id:1}:undefined,guide:n=>n===1?{summary:'demo'}:undefined};
 assert.equal(new GetLesson(repo).execute(1).week.id,1);
 assert.throws(()=>new GetLesson(repo).execute(2));
});
test('Progress mantiene datos versionados y adapter injectable',()=>{
 let state=emptyProgress();const repo={read:()=>state,save:value=>{state=value}};
 new UpdateProgress(repo).toggle('weeks',1);
 assert.deepEqual(state.weeks,[1]);
 assert.deepEqual(fromUnknown({weeks:[1,'x',-3]}).weeks,[1]);
});
