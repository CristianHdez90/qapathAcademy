import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript'),module={exports:{}};
new Function('module','exports',ts.transpileModule(readFileSync(new URL('../apps/web/src/features/progress/reading-coverage.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports);
const {addReadingExposure,chapterWasTraversed}=module.exports;
test('a chapter header or a jump to its bottom cannot complete the reading',()=>{
 let ranges=addReadingExposure([],0,10000,10000,700);assert.equal(chapterWasTraversed(ranges),false);
 ranges=addReadingExposure(ranges,-9300,700,10000,700);assert.equal(chapterWasTraversed(ranges),false);
});
test('continuous coverage must reach the final part of the chapter',()=>{
 let ranges=[];for(let top=0;top>=-800;top-=100)ranges=addReadingExposure(ranges,top,2000+top,2000,700);assert.equal(chapterWasTraversed(ranges),false);
 for(let top=-900;top>=-1300;top-=100)ranges=addReadingExposure(ranges,top,2000+top,2000,700);assert.equal(chapterWasTraversed(ranges),true);
 assert.equal(ranges.length,1);
});
test('revisiting the same viewport does not fabricate more coverage; short chapters work',()=>{
 let ranges=[];for(let n=0;n<30;n++)ranges=addReadingExposure(ranges,0,10000,10000,700);assert.equal(chapterWasTraversed(ranges),false);assert.equal(chapterWasTraversed(addReadingExposure([],100,500,400,700)),true);
});
