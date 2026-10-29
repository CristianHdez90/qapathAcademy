'use client';
/**
 * Colores para gráficos dibujados por librerías (Mermaid, React Flow, Recharts).
 * Tinta/superficie siguen el tema publicado (variables `--q-<hex>` de SPEC-UX-310);
 * las series usan una paleta categórica validada (CVD) con su variante clara u oscura.
 */
const SERIES={dark:['#3987e5','#d95926','#199e70','#c98500','#d55181','#9085e9'],light:['#2a78d6','#eb6834','#1baf7a','#eda100','#e87ba4','#6250d6']};
function cssColor(hex:string){if(typeof document==='undefined')return '#'+hex;const value=getComputedStyle(document.documentElement).getPropertyValue(`--q-${hex}`).trim();return value||'#'+hex}
function luminance(color:string){const match=/rgba?\((\d+),\s*(\d+),\s*(\d+)/.exec(color);if(!match)return 0;const [r,g,b]=match.slice(1,4).map(v=>Number(v)/255).map(c=>c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4);return 0.2126*r+0.7152*g+0.0722*b}
export type StudyPalette={light:boolean;background:string;surface:string;text:string;muted:string;border:string;primary:string;series:string[]};
export function studyPalette():StudyPalette{
 const light=typeof document!=='undefined'&&luminance(getComputedStyle(document.body).backgroundColor)>0.4;
 return {light,background:cssColor('080f20'),surface:cssColor('141f36'),text:cssColor('e8f1fb'),muted:cssColor('a9b9cc'),border:cssColor('22324d'),primary:cssColor('52dfb7'),series:light?SERIES.light:SERIES.dark};
}
