import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url),ts=require('typescript'),module={exports:{}};
new Function('module','exports',ts.transpileModule(readFileSync(new URL('../apps/web/src/features/study/demonstration-details.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText)(module,module.exports);
const {demonstrationDetails}=module.exports;
const guides=JSON.parse(readFileSync(new URL('../libs/content/src/data/study-guides.json',import.meta.url),'utf8'));

test('W01-C01 provides 24 concise lists without discarding the full instructions',()=>{
 const concepts=guides[1].sections[0].concepts;assert.equal(concepts.length,8);
 let count=0;
 for(const concept of concepts){
  const details=demonstrationDetails(concept.demonstration.stepDetails,concept.demonstration.steps.length);
  assert.ok(details,concept.id);
  for(const detail of details){count++;assert.equal(detail.briefActions.length,detail.actions.length);assert.ok(detail.briefActions.every(action=>action.length<=105));assert.ok(detail.evidence.trim());}
 }
 assert.equal(count,24);
 for(const [week,guide] of Object.entries(guides))for(const [chapter,section] of guide.sections.entries())if(week!=='1'||chapter!==0){assert.equal(section.experience,undefined);for(const concept of section.concepts||[])assert.equal(concept.demonstration.stepDetails,undefined);}
});

test('malformed optional details preserve the legacy fallback as a whole',()=>{
 const valid=guides[1].sections[0].concepts[1].demonstration.stepDetails;
 assert.equal(demonstrationDetails(undefined,3),null);
 assert.equal(demonstrationDetails(valid,2),null);
 for(const change of [d=>{d[1].actions=['Only one'];},d=>{d[0].evidence=' ';},d=>{d[2].briefActions=['Mismatched list'];},d=>{d[0].briefActions[0]='';}]){
  const invalid=structuredClone(valid);change(invalid);assert.equal(demonstrationDetails(invalid,3),null);
 }
 const legacyDetails=structuredClone(valid);legacyDetails.forEach(detail=>delete detail.briefActions);assert.ok(demonstrationDetails(legacyDetails,3));
});

test('the formative case keeps confirmation pending and diagram references valid',()=>{
 const e=guides[1].sections[0].experience;
 assert.match(e.caseStudy.evidence.find(item=>item.id==='E04').state,/PENDIENTE/);
 for(const question of [e.openingQuestion,...e.activity.decisions])assert.equal(question.options.filter(option=>option.correct).length,1);
 for(const diagram of e.diagrams){const ids=new Set(diagram.nodes.map(node=>node.id));assert.equal(ids.size,diagram.nodes.length);assert.ok(diagram.alternative.length>80);for(const edge of diagram.edges){assert.ok(ids.has(edge.from));assert.ok(ids.has(edge.to));}}
});
