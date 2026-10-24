import {z} from 'zod';
/** Contrato versionado de entrada a la evaluación pública. */
export const gradeQuizRequestSchema=z.object({answers:z.array(z.number().int().min(0).max(20)).min(1).max(30)}).strict();
export type GradeQuizRequest=z.infer<typeof gradeQuizRequestSchema>;
export type ApiEnvelope<T>={data:T};
export type ApiFailure={error:{code:string;message:string}};
