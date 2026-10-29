import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript');
function load(file){const m={exports:{}};new Function('module','exports','require',ts.transpileModule(readFileSync(new URL('../apps/web/src/features/progress/'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(m,m.exports,dep=>load(dep.replace('./','')+'.ts'));return m.exports}
const {creditReadingExposure,unionRanges}=load('focused-reading-geometry.ts'),{chapterWasTraversed,readingEligible}=load('reading-coverage.ts');
const piece=(id,start,end,peers=[])=>({id,start,end,peers});
const {exposeTextBands}=load('reading-text-map.ts');

test('reflow credits a source band only after every original glyph is exposed',()=>{
 const reference={signature:'same',bands:[{start:0,end:50,ids:[0,1],topEdge:false,bottomEdge:false},{start:50,end:100,ids:[2],topEdge:false,bottomEdge:false}]};
 const actual={signature:'same',glyphs:[{id:0,top:0,bottom:10},{id:1,top:20,bottom:30},{id:2,top:40,bottom:50}]},history=new Set(),edges={top:false,bottom:false};
 assert.deepEqual(exposeTextBands(reference,actual,[0,10],50,history,edges),[]);
 assert.deepEqual(exposeTextBands(reference,actual,[20,30],50,history,edges),[[0,50]]);
 assert.deepEqual(exposeTextBands(reference,actual,[40,50],50,history,edges),[[0,50],[50,100]]);
});

test('reflow does not credit partially clipped glyphs, hidden text or changed content',()=>{
 const reference={signature:'same',bands:[{start:0,end:100,ids:[0],topEdge:false,bottomEdge:false}]},history=new Set(),edges={top:false,bottom:false};
 const actual={signature:'same',glyphs:[{id:0,top:0,bottom:20}]};
 assert.deepEqual(exposeTextBands(reference,actual,[0,19],20,history,edges),[]);
 assert.deepEqual(exposeTextBands(reference,{signature:'changed',glyphs:actual.glyphs},[0,20],20,history,edges),[]);
 assert.deepEqual(exposeTextBands(reference,{signature:'same',glyphs:[]},[0,20],20,history,edges),[]);
});

test('leading and trailing source spaces also require the real outer card edges',()=>{
 const reference={signature:'same',bands:[{start:0,end:10,ids:[0],topEdge:true,bottomEdge:false},{start:10,end:90,ids:[0],topEdge:false,bottomEdge:false},{start:90,end:100,ids:[0],topEdge:false,bottomEdge:true}]};
 const actual={signature:'same',glyphs:[{id:0,top:40,bottom:60}]},history=new Set(),edges={top:false,bottom:false};
 assert.deepEqual(exposeTextBands(reference,actual,[40,60],100,history,edges),[[10,90]]);
 assert.deepEqual(exposeTextBands(reference,actual,[0,40],100,history,edges),[[0,10],[10,90]]);
 assert.deepEqual(exposeTextBands(reference,actual,[60,100],100,history,edges),[[0,10],[10,90],[90,100]]);
});
test('projection uses measured source lengths and union, not equal card weights',()=>{
 const a=piece('a',0,100),b=piece('b',100,1000),geometry={height:1000,pieces:[a,b]},channels=new Map();
 let ranges=creditReadingExposure(geometry,a,[0,1],channels,[]);assert.deepEqual(ranges,[[0,.1]]);
 for(let i=0;i<40;i++)ranges=creditReadingExposure(geometry,a,[0,1],channels,ranges);
 assert.equal(chapterWasTraversed(ranges),false);assert.deepEqual(ranges,[[0,.1]]);
 ranges=creditReadingExposure(geometry,b,[0,1],channels,ranges);assert.deepEqual(ranges,[[0,1]]);
});
test('a side-by-side row requires both homologous regions and retains real gaps',()=>{
 const a=piece('left',0,100,['left','right']),b=piece('right',0,100,['left','right']),g={height:100,pieces:[a,b]},channels=new Map();
 let ranges=creditReadingExposure(g,a,[0,1],channels,[]);assert.deepEqual(ranges,[]);
 ranges=creditReadingExposure(g,b,[0,.2],channels,ranges);assert.deepEqual(ranges,[[0,.2]]);
 ranges=creditReadingExposure(g,b,[.8,1],channels,ranges);assert.deepEqual(ranges,[[0,.2],[.8,1]]);assert.equal(chapterWasTraversed(ranges),false);
});
test('resize retains historical source intervals without crediting old unpaired columns',()=>{
 const channels=new Map(),left=piece('left',0,100,['left','right']),old={height:100,pieces:[left]};
 let ranges=creditReadingExposure(old,left,[0,1],channels,[]);assert.deepEqual(ranges,[]);
 const resized=piece('left',0,100),newGeometry={height:200,pieces:[resized]};
 ranges=creditReadingExposure(newGeometry,resized,[0,.2],channels,ranges);assert.deepEqual(ranges,[[0,.1]]);
 const before=structuredClone(ranges);ranges=creditReadingExposure(newGeometry,resized,[.8,1],channels,ranges);assert.deepEqual(ranges,[...before,[.4,.5]]);
});
test('projected boundaries use the unchanged baseline oracle without a completion epsilon',()=>{
 for(const raw of [[[0,.79]],[[0,.8]],[[0,.79],[.99,1]],[[0,.6],[.8,.98]],[[0,1]],[[0,.1],[.9,1]]]){
  const p=piece('body',0,1000),g={height:1000,pieces:[p]},channels=new Map();let actual=[];
  for(const r of raw)actual=creditReadingExposure(g,p,r,channels,actual);
  assert.deepEqual(actual,unionRanges(raw));assert.equal(chapterWasTraversed(actual),chapterWasTraversed(raw));
 }
});

test('attention boundary is cumulative per chapter and cannot compensate missing coverage',()=>{
 assert.equal(readingEligible([[0,1]],2999,3000),false);
 assert.equal(readingEligible([[0,1]],3000,3000),true);
 assert.equal(readingEligible([[0,.8]],10000,3000),false);
 assert.equal(readingEligible([[0,.79],[.99,1]],3000,3000),true);
});
