/** DTOs de lectura públicos. La API no expone entidades internas directamente. */
export type Module = {
  id: string; number: string; title: string; range: string; icon: string;
  track: string; color: string; summary: string; outcome: string;
  weeks: number[]; skills: string[]; project: string; minutes: number;
};
export type Week = {
  id: number; module: string; title: string; goal: string;
  topics: string[]; tasks: string[]; evidence: string;
};
export type Question = { q: string; a: string[]; correct: number; why: string };
export type PublicQuestion = Pick<Question, 'q'|'a'>;
export type StudyGuide = {
  duration: number; level: string; summary: string;
  sections: {title:string;body:string;points:string[]}[];
  example: {title:string;context:string;steps:string[];code?:string;language?:string};
  activity:string; answer:string; pitfall:string;
  question:{q:string;options:string[];correct:number;why:string};
  links: string[][];
};
export type Lab = {id:string;module:string;level:string;title:string;time:string;desc:string;criteria:string[]};
export type Resource = {title:string;type:string;description:string;url:string;module:string};
export type ScrumRole = {id:string;name:string;short:string;category:string;glyph:string;responsibility:string;inStory:string;artifact:string;question:string;accent:string};
export type ScrumStep = {title:string;phase:string;who:string[];main:string;qa:string;evidence:string};
export type ScrumEvent = {id:string;title:string;time:string;people:string;goal:string;detail:string};
export type ScrumData = {roles:ScrumRole[];steps:ScrumStep[];events:ScrumEvent[];questions:PublicQuestion[]};
export type QuizFeedback = {correct:boolean;expected:number;reason:string};
export type QuizResult = {score:number;total:number;percent:number;feedback:QuizFeedback[]};

export {gradeQuizRequestSchema} from './schemas';

export {registerSchema,loginSchema,progressCommandSchema,verifyEmailSchema,verificationResendSchema,changeInitialPasswordSchema,mfaSetupSchema,mfaCodeSchema} from './auth';
export type {AuthUserDTO} from './auth';

export {listStudentsSchema,newStudentSchema,changeStudentSchema,auditQuerySchema} from './admin';

export type {LoginOutcomeDTO} from './auth';
