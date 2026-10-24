import {z} from 'zod';
export const registerSchema=z.object({email:z.string().email().max(254),password:z.string().min(12).max(128)}).strict();
export const loginSchema=z.object({email:z.string().email().max(254),password:z.string().min(1).max(128)}).strict();
export const progressCommandSchema=z.union([
 z.object({type:z.literal('toggle'),key:z.literal('final'),value:z.number().int().min(0).max(9)}).strict(),
 z.object({type:z.literal('reading-section'),week:z.number().int().min(1).max(24),section:z.number().int().min(0).max(19)}).strict(),
 z.object({type:z.literal('lesson-answer'),week:z.number().int().min(1).max(24),answer:z.number().int().min(0).max(10)}).strict(),
 z.object({type:z.literal('submit-evidence'),kind:z.enum(['task','lab','exercise','certification']),id:z.string().min(1).max(80),text:z.string().trim().min(40).max(8000)}).strict(),
 z.object({type:z.literal('note'),week:z.number().int().min(1).max(24),text:z.string().max(8000)}).strict(),
 z.object({type:z.literal('scrum-intro')}).strict()
]);
export type AuthUserDTO={id:string;email:string;role:'STUDENT'|'INSTRUCTOR'|'ADMIN';mfaEnabled:boolean};

export const verifyEmailSchema=z.object({token:z.string().regex(/^[A-Za-z0-9_-]{16,2048}$/)}).strict();
export const verificationResendSchema=z.object({email:z.string().email().max(254),password:z.string().min(1).max(128).optional()}).strict();
export const changeInitialPasswordSchema=z.object({newPassword:z.string().min(12).max(128)}).strict();
export const mfaSetupSchema=z.object({password:z.string().min(1).max(128).optional()}).strict();
export const mfaCodeSchema=z.object({code:z.string().min(6).max(40)}).strict();
export type LoginOutcomeDTO={stage:'AUTHENTICATED'|'VERIFY_EMAIL'|'CHANGE_PASSWORD'|'MFA_SETUP'|'MFA_VERIFY';user?:AuthUserDTO};
