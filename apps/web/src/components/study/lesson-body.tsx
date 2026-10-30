'use client';
import type {StudyFileKind} from '@qapath/contracts';
import {StudyMarkdown} from './study-markdown';
import {StudyFileView} from './study-file-view';
type File={kind:StudyFileKind;filename:string;content:string};
type Section={key:string;text?:string;visuals:File[]};
const FENCE=/```mermaid[^\n]*\n([\s\S]*?)```/g;
/**
 * Estructura de lectura como en Fundamentos: texto a la izquierda y gráficas a la derecha.
 * Cada .md abre una sección; sus bloques ```mermaid y los .mmd/.json/.svg que lo siguen forman la columna derecha.
 */
export function lessonSections(files:File[],title?:string):Section[]{
 const sections:Section[]=[];
 files.forEach((file,index)=>{
  if(file.kind==='markdown'){
   const visuals:File[]=[];
   const text=file.content.replace(FENCE,(_,code:string)=>{visuals.push({kind:'mermaid',filename:'',content:code.trim()});return ''}).replace(/\n{3,}/g,'\n\n');
   // Si el .md repite el título de la lección como «# Título», no se duplica bajo el h1 de la página.
   const heading=/^\s*#\s+(.+)\n?/.exec(text);
   sections.push({key:`s${index}`,text:title&&heading&&heading[1].replace(/[*_`]/g,'').trim()===title.trim()?text.slice(heading[0].length):text,visuals});
  }else{
   const last=sections.at(-1);
   if(last?.text!==undefined)last.visuals.push(file);else sections.push({key:`s${index}`,visuals:[file]});
  }
 });
 return sections;
}
export function LessonBody({files,title}:{files:File[];title?:string}){
 return <div className="study-lesson-files">{lessonSections(files,title).map(section=>{
  const visuals=section.visuals.map((file,i)=><StudyFileView key={i} file={file}/>);
  if(section.text===undefined)return <section key={section.key} className="study-section">{visuals}</section>;
  if(!section.visuals.length)return <section key={section.key} className="study-section"><StudyMarkdown source={section.text}/></section>;
  return <section key={section.key} className="study-section has-aside"><div className="study-section-text"><StudyMarkdown source={section.text}/></div><aside className="study-section-aside" aria-label="Gráficas de la sección">{visuals}</aside></section>;
 })}</div>;
}
