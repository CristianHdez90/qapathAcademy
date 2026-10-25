import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
const catalog=JSON.parse(readFileSync(new URL('../../../libs/content/src/data/catalog.json',import.meta.url),'utf8'));
const guides=JSON.parse(readFileSync(new URL('../../../libs/content/src/data/study-guides.json',import.meta.url),'utf8'));
const modules=catalog.modules.map(module=>({id:module.id,number:module.number,title:module.title,weeks:module.weeks.map(id=>{const week=catalog.weeks.find(w=>w.id===id),guide=guides[String(id)];return {id,title:week.title,chapters:guide.sections.map(s=>s.title),guided:guide.example.title}}),labs:catalog.labs.filter(l=>l.module===module.id).map(l=>({id:l.id,title:l.title}))}));
const target=new URL('../src/features/navigation/learning-tree.json',import.meta.url);mkdirSync(new URL('.',target),{recursive:true});writeFileSync(target,JSON.stringify(modules,null,2)+'\n');
