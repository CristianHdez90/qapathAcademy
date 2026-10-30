import {PRESET_TOKENS,type AppearanceTokens} from '@qapath/contracts';
import colors from './theme-colors.json';

/**
 * SPEC-UX-310 · Tema en toda la plataforma.
 * Reasigna cada color de las hojas de estilo (variables `--q-<hex>`) a partir de los tokens publicados:
 * se conserva la posición de cada color entre «fondo» y «texto» del diseño original (luminancia perceptual OKLab)
 * y se trasladan los acentos fríos al tono primario / de foco del tema. Los cálidos (errores, avisos) conservan su tono.
 */
type Lab={L:number;a:number;b:number};
const toLinear=(c:number)=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4;
const toGamma=(c:number)=>c<=0.0031308?12.92*c:1.055*c**(1/2.4)-0.055;
function hexToLab(hex:string):Lab{
 const [r,g,b]=[0,2,4].map(i=>toLinear(parseInt(hex.slice(i,i+2),16)/255));
 const l=Math.cbrt(0.4122214708*r+0.5363325363*g+0.0514459929*b),m=Math.cbrt(0.2119034982*r+0.6806995451*g+0.1073969566*b),s=Math.cbrt(0.0883024619*r+0.2817188376*g+0.6299787005*b);
 return {L:0.2104542553*l+0.793617785*m-0.0040720468*s,a:1.9779984951*l-2.428592205*m+0.4505937099*s,b:0.0259040371*l+0.7827717662*m-0.808675766*s};
}
function labToRgb({L,a,b}:Lab){
 const l=(L+0.3963377774*a+0.2158037573*b)**3,m=(L-0.1055613458*a-0.0638541728*b)**3,s=(L-0.0894841775*a-1.291485548*b)**3;
 return [4.0767416621*l-3.3077115913*m+0.2309699292*s,-1.2684380046*l+2.6097574011*m-0.3413193965*s,-0.0041960863*l-0.7034186147*m+1.707614701*s];
}
const inGamut=(rgb:number[])=>rgb.every(c=>c>=-0.0005&&c<=1.0005);
function labToHex(lab:Lab){
 let {a,b}=lab;let rgb=labToRgb(lab);
 for(let i=0;i<24&&!inGamut(rgb);i++){a*=0.9;b*=0.9;rgb=labToRgb({L:lab.L,a,b});}
 return rgb.map(c=>Math.round(Math.min(1,Math.max(0,toGamma(Math.min(1,Math.max(0,c)))))*255).toString(16).padStart(2,'0')).join('');
}
const chroma=(lab:Lab)=>Math.hypot(lab.a,lab.b);
const hue=(lab:Lab)=>((Math.atan2(lab.b,lab.a)*180/Math.PI)+360)%360;
const lerp=(x:number,y:number,t:number)=>x+(y-x)*t;
const ORIGINAL=PRESET_TOKENS['qapath-original'];

export function themeColorMap(tokens:AppearanceTokens):Record<string,string>{
 const bg0=hexToLab(ORIGINAL.background.slice(1)),text0=hexToLab(ORIGINAL.textPrimary.slice(1));
 const bg=hexToLab(tokens.background.slice(1)),text=hexToLab(tokens.textPrimary.slice(1));
 const primary=hexToLab(tokens.primary.slice(1)),focus=hexToLab(tokens.focus.slice(1));
 const exact=new Map<string,string>(Object.entries(ORIGINAL).map(([key,value])=>[value.slice(1).toLowerCase(),tokens[key as keyof AppearanceTokens].slice(1).toLowerCase()]));
 const map:Record<string,string>={};
 for(const code of colors as string[]){
  const rgb=code.slice(0,6),alpha=code.slice(6);
  let mapped=exact.get(rgb);
  if(!mapped){
   const c=hexToLab(rgb),p=Math.min(1.25,Math.max(-0.25,(c.L-bg0.L)/(text0.L-bg0.L)));
   const L=Math.min(0.99,Math.max(0.02,lerp(bg.L,text.L,p))),C=chroma(c),h=hue(c);
   if(C<0.045){const t=Math.min(1,Math.max(0,p));mapped=labToHex({L,a:lerp(bg.a,text.a,t)+c.a*0.3,b:lerp(bg.b,text.b,t)+c.b*0.3});}
   else if(h<110||h>=330)mapped=labToHex({L,a:c.a,b:c.b});
   else{const target=h<200?primary:focus,th=hue(target)*Math.PI/180,tc=Math.max(0.04,Math.min(C,chroma(target)*1.15));mapped=labToHex({L,a:tc*Math.cos(th),b:tc*Math.sin(th)});}
  }
  map[code]=`#${mapped}${alpha}`;
 }
 return map;
}
const cache=new Map<string,string>();
/** Hoja `:root{--q-…}` del tema publicado; cacheada por combinación de tokens (cambia al publicar, sin redeploy). */
export function themeColorStyle(tokens:AppearanceTokens){
 const key=JSON.stringify(tokens);const hit=cache.get(key);if(hit)return hit;
 const css=`:root{${Object.entries(themeColorMap(tokens)).map(([code,value])=>`--q-${code}:${value}`).join(';')}}`;
 if(cache.size>8)cache.clear();cache.set(key,css);return css;
}
