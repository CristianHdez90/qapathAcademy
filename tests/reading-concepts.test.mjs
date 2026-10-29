import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const guides=JSON.parse(readFileSync(new URL('../libs/content/src/data/study-guides.json',import.meta.url),'utf8'));

test('all 266 rendered cards retain their examples without Así se aplica or animation controls',()=>{
 const require=createRequire(import.meta.url),webRequire=createRequire(new URL('../apps/web/package.json',import.meta.url));
 const ts=require('typescript'),React=webRequire('react'),{renderToStaticMarkup}=webRequire('react-dom/server');
 const cache=new Map();
 const load=name=>{
  if(cache.has(name))return cache.get(name);
  const module={exports:{}};
  const source=readFileSync(new URL(`../apps/web/src/components/academy/${name}.tsx`,import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX,target:ts.ScriptTarget.ES2022}}).outputText;
  const localRequire=id=>id.endsWith('.css')?{}:id==='./concept-step-icon'?load('concept-step-icon'):webRequire(id);
  new Function('require','module','exports',code)(localRequire,module,module.exports);cache.set(name,module.exports);return module.exports;
 };
 const {ReadingConcepts}=load('reading-concepts');let total=0;
 for(const [week,guide] of Object.entries(guides)){
  const concepts=[...guide.sections.flatMap(section=>section.concepts||[]),...(guide.example.concepts||[])];
  const html=renderToStaticMarkup(React.createElement(ReadingConcepts,{concepts}));
  assert.equal((html.match(/class="concept-example"/g)||[]).length,concepts.length,`examples week ${week}`);
  assert.doesNotMatch(html,/class="concept-demo(?:[\s"])/);
  assert.doesNotMatch(html,/Así se aplica|<button\b|data-motion=/);
  for(const concept of concepts)assert.ok(html.includes(`reading-concept-${concept.id}`));
  total+=concepts.length;
 }
 assert.equal(total,266);
});
test('all 48 foundation cards have specific examples and three explanatory steps',()=>{
 let count=0;const examples=new Set();
 for(const week of [1,2]){
  assert.equal(guides[week].sections.length,3);
  for(const c of [...guides[week].sections.flatMap(s=>s.concepts),...guides[week].example.concepts]){
   count++;assert.ok(c.description.length>80,c.title);
   for(const key of ['context','action','result'])assert.ok(c.example[key].length>30,`${c.title}/${key}`);
   assert.equal(c.demonstration.steps.length,3);assert.equal(new Set(c.demonstration.steps).size,3);
   examples.add(JSON.stringify(c.example));
  }
 }
 assert.equal(count,48);assert.equal(examples.size,48);
});

test('all 24 weeks provide specific chapter and guided cards with valid step icons',()=>{
 const iconSource=readFileSync(new URL('../apps/web/src/components/academy/concept-step-icon.tsx',import.meta.url),'utf8').split('satisfies')[0];
 const allowed=new Set([...iconSource.matchAll(/^ (\w+):/gm)].map(match=>match[1]));
 const ids=new Set(),examples=new Set();let total=0;
 for(let week=1;week<=24;week++){
  const guide=guides[week];assert.equal(guide.sections.length,[7,9].includes(week)?4:3);
  for(const section of guide.sections)assert.ok(section.concepts.length>=2,`${week}/${section.title}`);
  assert.ok(guide.example.concepts.length>=3,`guided example ${week}`);
  for(const c of [...guide.sections.flatMap(s=>s.concepts),...guide.example.concepts]){
   total++;if(week>2){assert.ok(!ids.has(c.id),c.id);ids.add(c.id);}
   assert.ok(c.description.length>60,c.title);
   for(const key of ['context','action','result'])assert.ok(c.example[key].length>30,`${week}/${c.title}/${key}`);
   assert.equal(c.demonstration.steps.length,3);assert.equal(new Set(c.demonstration.steps).size,3);
   if(week>2){assert.equal(c.demonstration.icons.length,3);for(const icon of c.demonstration.icons)assert.ok(allowed.has(icon),`${c.id}/${icon}`);}
   const example=JSON.stringify(c.example);assert.ok(!examples.has(example),c.id);examples.add(example);
  }
  if(week>2)guide.example.steps.forEach((step,i)=>assert.ok(guide.example.concepts[i].description.startsWith(step),`${week}/original guided step ${i}`));
 }
 assert.equal(total,266);
});
