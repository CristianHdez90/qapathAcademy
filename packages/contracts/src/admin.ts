import {z} from 'zod';
export const listStudentsSchema=z.object({search:z.string().max(120).optional().default(''),status:z.enum(['all','active','inactive']).optional().default('all'),page:z.coerce.number().int().min(1).max(100000).default(1),limit:z.coerce.number().int().min(1).max(50).default(15)}).strict();
export const newStudentSchema=z.object({email:z.string().email().max(254),password:z.string().min(12).max(128)}).strict();
export const changeStudentSchema=z.object({email:z.string().email().max(254).optional(),isActive:z.boolean().optional()}).strict().refine(x=>Object.keys(x).length>0);
export const auditQuerySchema=z.object({studentId:z.uuid().optional(),page:z.coerce.number().int().min(1).max(100000).default(1),limit:z.coerce.number().int().min(1).max(50).default(30)}).strict();
