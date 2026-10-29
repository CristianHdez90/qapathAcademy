import {z} from 'zod';
export const courseStatusSchema=z.enum(['DRAFT','PUBLISHED','ARCHIVED']);
const reference=z.object({kind:z.enum(['LEGACY_MODULE','SCRUM','CTFL']),ref:z.string().min(1).max(100)}).strict();
export const courseInputSchema=z.object({
 slug:z.string().min(3).max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),title:z.string().trim().min(3).max(250),
 summary:z.string().trim().max(500),description:z.string().trim().max(8000),category:z.string().trim().min(1).max(80),
 skills:z.array(z.string().trim().min(1).max(80)).max(24),position:z.number().int().min(0).max(10000),
 cover:z.string().max(300).regex(/^\/course-covers\/[a-zA-Z0-9_-]+\.(svg|png|webp|jpg)$/).nullable(),
 contentKind:z.enum(['LEGACY_MODULE','SCRUM','CTFL','CURATED']),assignments:z.array(reference).max(24),
 /** «En construcción»: visible en el catálogo con aviso, sin ofrecer aún el contenido. */
 comingSoon:z.boolean().optional(),
}).strict();
export const courseUpdateSchema=courseInputSchema.extend({revision:z.number().int().positive(),status:z.enum(['DRAFT','PUBLISHED'])}).strict();
export const catalogRevisionSchema=z.object({revision:z.number().int().positive()}).strict();
export const catalogUuidSchema=z.string().uuid();
const paging={search:z.string().max(120).default(''),category:z.string().max(80).optional(),page:z.coerce.number().int().min(1).max(10000).default(1),limit:z.coerce.number().int().min(1).max(50).default(24)};
export const courseQuerySchema=z.object(paging).strict();
export const adminCourseQuerySchema=z.object({...paging,status:courseStatusSchema.optional()}).strict();
export const learningPathInputSchema=z.object({title:z.string().trim().min(3).max(120),courseIds:z.array(z.string().uuid()).min(1).max(24),active:z.boolean()}).strict();
export const learningPathUpdateSchema=learningPathInputSchema.extend({revision:z.number().int().positive()}).strict();
export type CourseInputDTO=z.infer<typeof courseInputSchema>;
export type CourseDTO=CourseInputDTO&{id:string;status:z.infer<typeof courseStatusSchema>;revision:number;createdAt:string;updatedAt:string;weeks?:number[];usageCount?:number};
export type CoursePageDTO={items:CourseDTO[];total:number;page:number;limit:number};
export type LearningPathDTO={id:string;title:string;active:boolean;revision:number;courses:{id:string;slug:string;title:string;status:CourseDTO['status']}[];createdAt:string;updatedAt:string};
