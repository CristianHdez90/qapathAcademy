import {z} from 'zod';
/**
 * SPEC-UX-310 · Apariencia del Home de cursos administrable.
 * Solo tokens semánticos autorizados, textos acotados y presentación de tarjetas: nunca CSS, HTML ni URLs libres.
 */
export const APPEARANCE_TOKEN_KEYS=['background','surface','textPrimary','textSecondary','border','primary','primaryText','accent','focus','success','error','ctaBackground'] as const;
export type AppearanceTokenKey=typeof APPEARANCE_TOKEN_KEYS[number];
export const APPEARANCE_PRESETS=['qapath-original','midnight-violet','indigo-digital','coral-studio','ocean-depths','forest-night','graphite-pro','sunset-dusk','arctic-light','mint-fresh','lavender-calm','sand-paper','high-contrast'] as const;
export type AppearancePreset=typeof APPEARANCE_PRESETS[number];
export const COURSE_ACCENTS=['auto','teal','blue','violet','pink','orange','gold','lime'] as const;
export const COURSE_ILLUSTRATIONS=['auto','checklist','inspect','api','code','browser','gear','team','certificate','default'] as const;

const hex=z.string().regex(/^#[0-9a-fA-F]{6}$/,'Usa un color hexadecimal #RRGGBB.');
/** Texto plano de una línea: sin etiquetas, sin protocolos peligrosos y sin caracteres de control. */
const plain=(max:number,min=0)=>z.string().trim().min(min).max(max).refine(value=>!/[<>{}]|javascript:|data:|url\(|expression\(|[\u0000-\u001f\u007f]/i.test(value),'Solo texto plano: sin HTML, CSS ni URLs.');
export const appearanceTokensSchema=z.object(Object.fromEntries(APPEARANCE_TOKEN_KEYS.map(key=>[key,hex])) as Record<AppearanceTokenKey,typeof hex>).strict();
export const homeTextsSchema=z.object({
 title:plain(60,3),subtitle:plain(160),ctaLabel:plain(30,3),searchLabel:plain(60,3),emptyText:plain(160,3),
 showBreadcrumb:z.boolean(),showSubtitle:z.boolean(),
}).strict();
export const coursePresentationSchema=z.object({
 courseId:z.string().uuid(),displayOrder:z.number().int().min(0).max(999),
 summary:plain(200).optional(),tags:z.array(plain(40,1)).max(6).optional(),
 accent:z.enum(COURSE_ACCENTS),illustration:z.enum(COURSE_ILLUSTRATIONS),
}).strict();
export const appearanceConfigSchema=z.object({
 preset:z.enum(APPEARANCE_PRESETS),tokens:appearanceTokensSchema,home:homeTextsSchema,
 courses:z.array(coursePresentationSchema).max(100).refine(list=>new Set(list.map(item=>item.courseId)).size===list.length,'Cada curso solo puede configurarse una vez.'),
}).strict();
export type AppearanceTokens=z.infer<typeof appearanceTokensSchema>;
export type HomeTexts=z.infer<typeof homeTextsSchema>;
export type CoursePresentation=z.infer<typeof coursePresentationSchema>;
export type AppearanceConfig=z.infer<typeof appearanceConfigSchema>;
export const appearanceDraftRequestSchema=z.object({expectedRevision:z.number().int().min(0),config:appearanceConfigSchema}).strict();
export const appearancePublishRequestSchema=z.object({expectedRevision:z.number().int().min(0)}).strict();
export const appearanceRestoreRequestSchema=z.object({version:z.number().int().min(1),expectedRevision:z.number().int().min(0)}).strict();
export type PublishedAppearanceDTO={revision:number;publishedAt:string|null;config:AppearanceConfig;fallback:boolean};
export type AppearanceVersionDTO={version:number;action:'PUBLISHED'|'RESTORED';createdAt:string;actorEmail:string|null;preset:AppearancePreset};
export type AdminAppearanceDTO={draft:AppearanceConfig;draftRevision:number;draftUpdatedAt:string|null;published:PublishedAppearanceDTO;issues:ContrastIssue[]};

export const PRESET_TOKENS:Record<AppearancePreset,AppearanceTokens>={
 'qapath-original':{background:'#080f20',surface:'#141f36',textPrimary:'#e8f1fb',textSecondary:'#a9b9cc',border:'#22324d',primary:'#52dfb7',primaryText:'#0a1d2a',accent:'#77e7cb',focus:'#80dfff',success:'#7ce7bb',error:'#ffb4a8',ctaBackground:'#0f1a2e'},
 'midnight-violet':{background:'#0e0a1d',surface:'#1b1533',textPrimary:'#f3efff',textSecondary:'#bdb4da',border:'#3a2f63',primary:'#a78bfa',primaryText:'#140b2e',accent:'#5eead4',focus:'#c4b5fd',success:'#5eead4',error:'#fda4af',ctaBackground:'#161029'},
 'indigo-digital':{background:'#f4f6ff',surface:'#ffffff',textPrimary:'#141a3d',textSecondary:'#475071',border:'#d5dbf2',primary:'#4338ca',primaryText:'#ffffff',accent:'#4d7c0f',focus:'#4f46e5',success:'#15803d',error:'#b91c1c',ctaBackground:'#eef1ff'},
 'coral-studio':{background:'#fff7f2',surface:'#ffffff',textPrimary:'#2b1a14',textSecondary:'#694b40',border:'#efd6c8',primary:'#b9381f',primaryText:'#ffffff',accent:'#93580a',focus:'#ea580c',success:'#15803d',error:'#b91c1c',ctaBackground:'#fff0e6'},
 'ocean-depths':{background:'#061a24',surface:'#0d2a38',textPrimary:'#e6f6fb',textSecondary:'#9fc3d1',border:'#1d4456',primary:'#38bdf8',primaryText:'#04202d',accent:'#5eead4',focus:'#7dd3fc',success:'#6ee7b7',error:'#fca5a5',ctaBackground:'#0a2230'},
 'forest-night':{background:'#0b1510',surface:'#13241b',textPrimary:'#eaf5ee',textSecondary:'#a9c4b3',border:'#24412f',primary:'#4ade80',primaryText:'#062012',accent:'#fbbf24',focus:'#86efac',success:'#86efac',error:'#fda4af',ctaBackground:'#0f1e16'},
 'graphite-pro':{background:'#111317',surface:'#1b1e24',textPrimary:'#f1f3f6',textSecondary:'#aab2bf',border:'#2f343d',primary:'#60a5fa',primaryText:'#0b1424',accent:'#f59e0b',focus:'#93c5fd',success:'#4ade80',error:'#f87171',ctaBackground:'#171a1f'},
 'sunset-dusk':{background:'#1a0f1c',surface:'#2a1830',textPrimary:'#fbeff6',textSecondary:'#d6b6c8',border:'#47294f',primary:'#f472b6',primaryText:'#2a0a1c',accent:'#fdba74',focus:'#f9a8d4',success:'#86efac',error:'#fca5a5',ctaBackground:'#221326'},
 'arctic-light':{background:'#f3f8fc',surface:'#ffffff',textPrimary:'#0f2233',textSecondary:'#44596b',border:'#d3e2ee',primary:'#0369a1',primaryText:'#ffffff',accent:'#0f766e',focus:'#0284c7',success:'#15803d',error:'#b91c1c',ctaBackground:'#e8f2fa'},
 'mint-fresh':{background:'#f2fbf7',surface:'#ffffff',textPrimary:'#10261d',textSecondary:'#41594d',border:'#cfe9dc',primary:'#047857',primaryText:'#ffffff',accent:'#1d4ed8',focus:'#059669',success:'#15803d',error:'#b91c1c',ctaBackground:'#e6f6ee'},
 'lavender-calm':{background:'#f8f6fd',surface:'#ffffff',textPrimary:'#221a36',textSecondary:'#564c70',border:'#e3dcf3',primary:'#6d28d9',primaryText:'#ffffff',accent:'#be185d',focus:'#7c3aed',success:'#15803d',error:'#b91c1c',ctaBackground:'#f1ecfb'},
 'sand-paper':{background:'#faf6ee',surface:'#fffdf8',textPrimary:'#2a2418',textSecondary:'#5f5440',border:'#e8dfcc',primary:'#8a5a00',primaryText:'#ffffff',accent:'#0f766e',focus:'#b45309',success:'#3f6212',error:'#b91c1c',ctaBackground:'#f3ecdc'},
 'high-contrast':{background:'#000000',surface:'#0d0d0d',textPrimary:'#ffffff',textSecondary:'#e5e5e5',border:'#737373',primary:'#ffd60a',primaryText:'#000000',accent:'#ffd60a',focus:'#00e5ff',success:'#4ade80',error:'#ff8a80',ctaBackground:'#141414'},
};
export const PRESET_LABELS:Record<AppearancePreset,string>={'qapath-original':'QAPath Original','midnight-violet':'Midnight Violet','indigo-digital':'Indigo Digital','coral-studio':'Coral Studio','ocean-depths':'Ocean Depths','forest-night':'Forest Night','graphite-pro':'Graphite Pro','sunset-dusk':'Sunset Dusk','arctic-light':'Arctic Light','mint-fresh':'Mint Fresh','lavender-calm':'Lavender Calm','sand-paper':'Sand Paper','high-contrast':'Alto contraste'};
/** Descripción corta de cada preset en el editor (todos validados con contraste WCAG 2.2 AA). */
export const PRESET_DESCRIPTIONS:Record<AppearancePreset,string>={'qapath-original':'Diseño actual: azul noche + turquesa','midnight-violet':'Oscuro + violeta + aqua','indigo-digital':'Claro + índigo + lima','coral-studio':'Claro cálido + coral + dorado','ocean-depths':'Oscuro + azul océano + aqua','forest-night':'Oscuro + verde bosque + ámbar','graphite-pro':'Oscuro neutro + azul + naranja','sunset-dusk':'Oscuro + rosa + durazno','arctic-light':'Claro + azul glaciar + teal','mint-fresh':'Claro + verde menta + azul','lavender-calm':'Claro + lavanda + frambuesa','sand-paper':'Claro arena + ocre + teal','high-contrast':'Accesible: negro + amarillo + cian'};
export const DEFAULT_HOME_TEXTS:HomeTexts={title:'Explora cursos',subtitle:'Elige qué aprender y organiza una ruta que se adapte a tus objetivos.',ctaLabel:'Crear mi ruta',searchLabel:'Buscar cursos',emptyText:'No encontramos cursos con esa búsqueda. Prueba otro título o habilidad.',showBreadcrumb:true,showSubtitle:true};
export const DEFAULT_APPEARANCE:AppearanceConfig={preset:'qapath-original',tokens:PRESET_TOKENS['qapath-original'],home:DEFAULT_HOME_TEXTS,courses:[]};

/** Luminancia relativa y contraste WCAG 2.2. */
function luminance(color:string){const [r,g,b]=[1,3,5].map(i=>parseInt(color.slice(i,i+2),16)/255).map(c=>c<=0.03928?c/12.92:((c+0.055)/1.055)**2.4);return 0.2126*r+0.7152*g+0.0722*b;}
export function contrastRatio(a:string,b:string){const [x,y]=[luminance(a),luminance(b)].sort((m,n)=>n-m);return Math.round(((x+0.05)/(y+0.05))*100)/100;}
export const isLightTheme=(tokens:AppearanceTokens)=>luminance(tokens.background)>0.4;
export type ContrastIssue={pair:string;ratio:number;minimum:number};
/** Pares que el Home usa como texto/fondo. Texto normal ≥ 4.5:1; foco ≥ 3:1. */
export const CONTRAST_RULES:[AppearanceTokenKey,AppearanceTokenKey,number,string][]=[
 ['textPrimary','background',4.5,'Texto principal sobre fondo'],['textPrimary','surface',4.5,'Texto principal sobre superficie'],
 ['textSecondary','background',4.5,'Texto secundario sobre fondo'],['textSecondary','surface',4.5,'Texto secundario sobre superficie'],
 ['primaryText','primary',4.5,'Texto del botón primario'],['accent','surface',4.5,'Acento sobre superficie'],['accent','background',4.5,'Acento sobre fondo'],
 ['textPrimary','ctaBackground',4.5,'Texto del botón secundario'],['focus','background',3,'Indicador de foco'],
 ['success','surface',4.5,'Éxito sobre superficie'],['error','surface',4.5,'Error sobre superficie'],
];
export function contrastIssues(tokens:AppearanceTokens):ContrastIssue[]{
 return CONTRAST_RULES.map(([fg,bg,minimum,pair])=>({pair,ratio:contrastRatio(tokens[fg],tokens[bg]),minimum})).filter(item=>item.ratio<item.minimum);
}
/** Paleta de acentos por curso: variante clara y oscura para mantener el contraste en ambos tipos de tema. */
export const COURSE_ACCENT_COLORS:Record<Exclude<typeof COURSE_ACCENTS[number],'auto'>,{dark:string;light:string}>={
 teal:{dark:'#5dd8c2',light:'#0f766e'},blue:{dark:'#7cc5ff',light:'#1d4ed8'},violet:{dark:'#b195ff',light:'#6d28d9'},pink:{dark:'#e4a2f5',light:'#a21caf'},
 orange:{dark:'#ffbf83',light:'#c2410c'},gold:{dark:'#f3c94c',light:'#a16207'},lime:{dark:'#a3e635',light:'#4d7c0f'},
};
