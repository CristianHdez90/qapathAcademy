import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const catalog=JSON.parse(readFileSync(new URL('../../../libs/content/src/data/catalog.json',import.meta.url),'utf8'));
const guides=JSON.parse(readFileSync(new URL('../../../libs/content/src/data/study-guides.json',import.meta.url),'utf8'));
const foundation=JSON.parse(readFileSync(new URL('../../../libs/content/src/data/fundamentals-v2.json',import.meta.url),'utf8'));
// Fundamentos v2 (semanas 1–2) sustituye capítulos y ejemplo guiado; nunca se publican preguntas ni respuestas.
const chaptersOf=week=>foundation.weeks[String(week)]?foundation.weeks[String(week)].chapters.map(c=>({id:c.id,anchor:`FND-W0${week}-C${String(c.number).padStart(2,'0')}`,number:c.number,title:c.title,status:c.status,cards:c.cards.map(card=>({id:card.id,title:card.title}))})):null;
const modules=catalog.modules.map(module=>({id:module.id,number:module.number,title:module.title,weeks:module.weeks.map(id=>{const week=catalog.weeks.find(w=>w.id===id),guide=guides[String(id)],v2=chaptersOf(id);return {id,title:week.title,chapters:v2?v2.map(c=>c.title):guide.sections.map(s=>s.title),guided:v2?null:guide.example.title,foundation:v2}}),labs:catalog.labs.filter(l=>l.module===module.id).map(l=>({id:l.id,title:l.title}))}));
const target=new URL('../src/features/navigation/learning-tree.json',import.meta.url);mkdirSync(new URL('.',target),{recursive:true});writeFileSync(target,JSON.stringify(modules,null,2)+'\n');
