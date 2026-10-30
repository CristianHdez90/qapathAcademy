'use client';
import type {OutlineCard} from '@qapath/contracts';
import {LessonBody} from '@/components/study/lesson-body';
/** Tarjeta de lectura: texto (Markdown) a la izquierda y gráficas (.mmd/.json/.svg y bloques mermaid) a la derecha. */
export function OutlineCardView({card}:{card:Pick<OutlineCard,'title'|'text'|'visuals'>}){
 const files=[...(card.text.trim()?[{kind:'markdown' as const,filename:'tarjeta.md',content:card.text}]:[]),...card.visuals.map(v=>({kind:v.kind??'mermaid',filename:v.filename,content:v.content}))];
 if(!files.length)return <p className="hint">Esta tarjeta aún no tiene contenido.</p>;
 return <LessonBody files={files} title={card.title}/>;
}
