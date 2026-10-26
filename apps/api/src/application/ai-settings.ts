import {z} from 'zod';
export const AI_BASE_URLS={groq:'https://api.groq.com/openai/v1',gemini:'https://generativelanguage.googleapis.com/v1beta'} as const;
export const aiSettingsSchema=z.object({
 revision:z.number().int().min(0),enabled:z.boolean(),provider:z.enum(['groq','gemini']),
 model:z.string().trim().min(1).max(120).regex(/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/),
 baseUrl:z.string().trim().max(150).transform(value=>value.replace(/\/$/,'')),
 temperature:z.number().min(0).max(1),maxOutputTokens:z.number().int().min(256).max(8192),
 apiKey:z.string().trim().min(8).max(512).regex(/^[!-~]+$/).optional(),removeSavedKey:z.boolean().optional()
}).strict().superRefine((value,ctx)=>{
 if(value.baseUrl!==AI_BASE_URLS[value.provider])ctx.addIssue({code:'custom',path:['baseUrl'],message:'Usa la URL oficial del proveedor seleccionado.'});
 if(value.apiKey&&value.removeSavedKey)ctx.addIssue({code:'custom',message:'Elige reemplazar o quitar la clave guardada.'});
 if(value.provider==='gemini'&&!/^[a-zA-Z0-9.-]+$/.test(value.model))ctx.addIssue({code:'custom',path:['model'],message:'Modelo Gemini inválido.'});
});
export type AiSettingsInput=z.infer<typeof aiSettingsSchema>;
export type AiRuntime={enabled:boolean;provider:'groq'|'gemini';model:string;baseUrl:string;key:string;temperature:number;maxOutputTokens:number};
