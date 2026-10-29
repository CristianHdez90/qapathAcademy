import type {CSSProperties} from 'react';
import {COURSE_ACCENT_COLORS,PRESET_TOKENS,isLightTheme,type AppearanceTokens,type CoursePresentation} from '@qapath/contracts';
/** «QAPath Original» sin cambios de tokens = el diseño actual exacto: no se aplica ningún override. */
export const isOriginalDesign=(tokens:AppearanceTokens)=>Object.entries(PRESET_TOKENS['qapath-original']).every(([key,value])=>tokens[key as keyof AppearanceTokens]?.toLowerCase()===value.toLowerCase());
/** Tokens → propiedades CSS con ámbito `data-home-theme` (sin sustituir colores globales). */
export function themeVars(tokens:AppearanceTokens):Record<string,string>{
 const light=isLightTheme(tokens);
 return {'--home-bg':tokens.background,'--home-surface':tokens.surface,'--home-text':tokens.textPrimary,'--home-muted':tokens.textSecondary,'--home-border':tokens.border,
  '--home-primary':tokens.primary,'--home-primary-text':tokens.primaryText,'--home-accent':tokens.accent,'--home-focus':tokens.focus,'--home-success':tokens.success,
  '--home-error':tokens.error,'--home-cta-bg':tokens.ctaBackground,'--home-sidebar':light?tokens.surface:tokens.background,'--home-chip':light?tokens.ctaBackground:tokens.ctaBackground,
  '--home-scheme':light?'light':'dark'};
}
export const themeStyle=(tokens:AppearanceTokens)=>themeVars(tokens) as CSSProperties;
const MODULE_ACCENT:Record<string,keyof typeof COURSE_ACCENT_COLORS>={'#5dd8c2':'teal','#7cc5ff':'blue','#74b6ff':'blue','#b195ff':'violet','#e4a2f5':'pink','#ffbf83':'orange','#c9a2ff':'violet','#5aa9ff':'blue','#ffc17b':'orange','#69dfb3':'teal'};
/** Acento de la tarjeta: «auto» conserva el color del curso en temas oscuros y usa su variante legible en temas claros. */
export function courseAccent(base:string,presentation:CoursePresentation|undefined,tokens:AppearanceTokens){
 const light=isLightTheme(tokens);
 const key=presentation&&presentation.accent!=='auto'?presentation.accent:MODULE_ACCENT[base.toLowerCase()];
 if(!key)return light?tokens.accent:base;
 if(!presentation||presentation.accent==='auto')return light?COURSE_ACCENT_COLORS[key].light:base;
 return COURSE_ACCENT_COLORS[key][light?'light':'dark'];
}
/** Orden publicado: displayOrder configurado y, a igualdad o sin configuración, el orden del catálogo (determinista). */
export function orderCourses<T extends {id:string;title:string}>(items:T[],presentations:CoursePresentation[]){
 const order=new Map(presentations.map(item=>[item.courseId,item.displayOrder]));
 return items.map((item,index)=>({item,index})).sort((a,b)=>(order.get(a.item.id)??1000+a.index)-(order.get(b.item.id)??1000+b.index)||a.item.title.localeCompare(b.item.title,'es')||a.item.id.localeCompare(b.item.id)).map(entry=>entry.item);
}
