'use client';
import type {OutlineCard} from '@qapath/contracts';
import {LessonBody} from '@/components/study/lesson-body';
import type {HrefResolver} from '@/components/study/study-markdown';
/** Tarjeta de lectura: texto (Markdown) a la izquierda y gráficas (.mmd/.json/.svg y bloques mermaid) a la derecha. */
export function OutlineCardView({card,resolveHref}:{card:Pick<OutlineCard,'title'|'text'|'visuals'>;resolveHref?:HrefResolver}){
 const files=[...(card.text.trim()?[{kind:'markdown' as const,filename:'tarjeta.md',content:card.text}]:[]),...card.visuals.map(v=>({kind:v.kind??'mermaid',filename:v.filename,content:v.content}))];
 if(!files.length)return <p className="hint">Esta tarjeta aún no tiene contenido.</p>;
 return <LessonBody files={files} title={card.title} resolveHref={resolveHref}/>;
}
