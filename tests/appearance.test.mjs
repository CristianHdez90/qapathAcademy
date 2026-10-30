import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const c=require('../packages/contracts/dist/index.js');
const {ManageAppearance,AppearanceConflict,AppearanceInvalid}=require('../libs/administration/dist/index.js');

test('SPEC-UX-310: los cuatro presets cumplen el contraste mínimo y QAPath Original reproduce el diseño actual',()=>{
 assert.deepEqual([...c.APPEARANCE_PRESETS],['qapath-original','midnight-violet','indigo-digital','coral-studio','ocean-depths','forest-night','graphite-pro','sunset-dusk','arctic-light','mint-fresh','lavender-calm','sand-paper','high-contrast','mac-light','mac-dark']);
 for(const preset of c.APPEARANCE_PRESETS){assert.ok(c.PRESET_LABELS[preset],preset);assert.ok(c.PRESET_DESCRIPTIONS[preset],preset);assert.equal(c.appearanceTokensSchema.safeParse(c.PRESET_TOKENS[preset]).success,true,preset)}
 for(const preset of c.APPEARANCE_PRESETS)assert.deepEqual(c.contrastIssues(c.PRESET_TOKENS[preset]),[],preset);
 assert.equal(c.DEFAULT_APPEARANCE.preset,'qapath-original');assert.equal(c.DEFAULT_APPEARANCE.home.title,'Explora cursos');
 assert.equal(c.isLightTheme(c.PRESET_TOKENS['indigo-digital']),true);assert.equal(c.isLightTheme(c.PRESET_TOKENS['qapath-original']),false);
 assert.equal(c.contrastRatio('#000000','#ffffff'),21);
});

test('SPEC-UX-310: el contrato rechaza CSS, HTML, URLs, tokens desconocidos y cursos duplicados',()=>{
 const ok=c.appearanceConfigSchema.safeParse(c.DEFAULT_APPEARANCE);assert.equal(ok.success,true);
 const bad=[
  {...c.DEFAULT_APPEARANCE,tokens:{...c.DEFAULT_APPEARANCE.tokens,background:'red'}},
  {...c.DEFAULT_APPEARANCE,tokens:{...c.DEFAULT_APPEARANCE.tokens,shadow:'#000000'}},
  {...c.DEFAULT_APPEARANCE,home:{...c.DEFAULT_APPEARANCE.home,title:'<img src=x onerror=alert(1)>'}},
  {...c.DEFAULT_APPEARANCE,home:{...c.DEFAULT_APPEARANCE.home,subtitle:'Visita javascript:alert(1)'}},
  {...c.DEFAULT_APPEARANCE,home:{...c.DEFAULT_APPEARANCE.home,ctaLabel:'a{color:red}'}},
  {...c.DEFAULT_APPEARANCE,css:'body{}'},
  {...c.DEFAULT_APPEARANCE,courses:[{courseId:'00000000-0000-4000-8000-000000000001',displayOrder:1,accent:'auto',illustration:'auto'},{courseId:'00000000-0000-4000-8000-000000000001',displayOrder:2,accent:'auto',illustration:'auto'}]},
  {...c.DEFAULT_APPEARANCE,courses:[{courseId:'00000000-0000-4000-8000-000000000001',displayOrder:1,accent:'auto',illustration:'https://evil.test/x.svg'}]},
 ];
 for(const value of bad)assert.equal(c.appearanceConfigSchema.safeParse(value).success,false,JSON.stringify(value).slice(0,80));
});

function memoryRepo(){
 const s={draft:null,draftRevision:0,draftUpdatedAt:null,published:null,publishedRevision:0,publishedAt:null},versions=[];
 return {s,versions,repo:{
  load:async()=>({...s}),
  saveDraft:async(config,expected)=>{if(s.draftRevision!==expected)return null;s.draft=config;s.draftRevision++;return s.draftRevision},
  publish:async(config,expected,actor,action)=>{if(s.draftRevision!==expected)return null;s.published=config;s.publishedRevision++;s.draft=config;s.draftRevision++;versions.push({version:s.publishedRevision,action,config,createdAt:new Date(),actorEmail:actor});return s.publishedRevision},
  versions:async()=>[...versions].reverse(),version:async v=>versions.find(x=>x.version===v)??null}};
}
test('SPEC-UX-310: borrador ≠ publicado, 409 por revisión obsoleta, contraste bloquea y restaurar crea nueva versión',async()=>{
 const {repo}=memoryRepo();const app=new ManageAppearance(repo,{defaults:c.DEFAULT_APPEARANCE,issues:config=>c.contrastIssues(config.tokens)});
 assert.equal((await app.published()).fallback,true);
 const indigo={...c.DEFAULT_APPEARANCE,preset:'indigo-digital',tokens:c.PRESET_TOKENS['indigo-digital']};
 assert.equal((await app.saveDraft(indigo,0,'a1')).draftRevision,1);
 assert.equal((await app.published()).config.preset,'qapath-original','el borrador no es público');
 await assert.rejects(app.saveDraft(indigo,0,'a2'),AppearanceConflict);
 const low={...indigo,tokens:{...indigo.tokens,textSecondary:'#eeeeee'}};
 const saved=await app.saveDraft(low,1,'a1');assert.ok(saved.issues.length>0);
 await assert.rejects(app.publish(2,'a1'),AppearanceInvalid);
 assert.equal((await app.published()).config.preset,'qapath-original');
 await app.saveDraft(indigo,2,'a1');assert.deepEqual(await app.publish(3,'a1'),{version:1});
 await assert.rejects(app.publish(3,'a1'),AppearanceConflict,'revisión obsoleta');
 const violet={...c.DEFAULT_APPEARANCE,preset:'midnight-violet',tokens:c.PRESET_TOKENS['midnight-violet']};
 await app.saveDraft(violet,4,'a1');await app.publish(5,'a1');
 assert.deepEqual(await app.restore(1,6,'a1'),{version:3});
 assert.equal((await app.published()).config.preset,'indigo-digital');
 await assert.rejects(app.restore(99,7,'a1'),AppearanceInvalid);
});
test('SPEC-UX-310: si la lectura falla, el Home recibe el preset inicial (fallback legible)',async()=>{
 const app=new ManageAppearance({load:async()=>{throw new Error('db down')}},{defaults:c.DEFAULT_APPEARANCE,issues:()=>[]});
 const value=await app.published();assert.equal(value.fallback,true);assert.equal(value.config.preset,'qapath-original');
});
