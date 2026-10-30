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
export type PracticalExercise={
 title:string;objective:string;minutes:number;tools:string[];setup:string[];
 steps:{action:string;expected:string}[];deliverables:string[];rubric:string[];
 starter?:{filename:string;language:string;code:string};
 files?:{label:string;href:string;description:string}[];links:string[][];
};
export type DemonstrationStepDetail = {
 goal:string;actions:string[];briefActions?:string[];input?:string;evidence:string;roles?:string[];pitfall?:string;
};
export type ChapterChoice = {text:string;feedback:string;correct:boolean};
export type ChapterQuestion = {question:string;options:ChapterChoice[]};
export type StudyChapterExperience = {
 id:string;goal:string;hook:string;notice:string;
 openingQuestion:ChapterQuestion;
 caseStudy:{title:string;story:string[];rules:{label:string;value:string}[];
  dialogue:{speaker:string;text:string}[];evidence:{id:string;description:string;state:string}[]};
 diagrams:{id:string;title:string;nodes:{id:string;label:string}[];
  edges:{from:string;to:string;label:string}[];alternative:string;mermaid?:string}[];
 activity:{title:string;prompt:string;decisions:ChapterQuestion[];modelAnswer:string};
 transfer:{prompt:string;questions:{question:string;guide:string}[]};
 closing:{summary:string;pitfall:string;questions:string[];glossary:{term:string;meaning:string}[];
  sources:{title:string;url:string;version:string;consulted:string}[]};
};
/** Fundamentos v2 (SPEC-CONTENT-220). Contenido público: nunca incluye la respuesta correcta de los minitests. */
export type FoundationOption={id:string;text:string};
export type FoundationCheck={id:string;question:string;options:FoundationOption[]};
/** Bloques de lectura enriquecida (SPEC-CONTENT-240). `**texto**` marca énfasis; nunca HTML. */
export type FoundationBlock=
 |{kind:'h';text:string}
 |{kind:'p';text:string}
 |{kind:'list';title?:string;items:string[];ordered?:boolean}
 |{kind:'table';caption:string;columns:string[];rows:string[][]}
 |{kind:'callout';tone:'note'|'key'|'warn';title:string;text:string}
 |{kind:'flow';caption:string;steps:string[]}
 |{kind:'code';caption:string;code:string}
 |{kind:'facts';items:[label:string,value:string][]}
 |{kind:'gherkin';caption:string;variants:{label:string;filename:string;code:string}[]};
export type FoundationLevelFocus='component'|'componentIntegration'|'system'|'systemIntegration'|'acceptance'|'roles';
export type FoundationTypesFocus='functional'|'nonfunctional'|'blackbox'|'whitebox'|'static'|'scope'|'purpose'|'changes'|'approach';
export type FoundationCard={id:string;title:string;objective:string;context:string;explanation:string;content?:FoundationBlock[];focus?:FoundationTypesFocus[];levelFocus?:FoundationLevelFocus;aside?:FoundationBlock[];
 example:{situation:string;qaDecision:string;evidence:string};checks:FoundationCheck[]};
export type FoundationBalloonState={id:string;title:string;actions:string[];owner:string;evidence:string;result:string};
export type FoundationClassifier={kind:'classifier';title:string;prompt:string;
 axes:{id:string;label:string;options:{id:string;label:string}[]}[];
 items:{id:string;text:string;answers:Record<string,string>;feedback:string}[]};
export type FoundationChapter={id:string;week:number;number:number;title:string;status:'published'|'pending';outcome:string;typesMap?:boolean;levelsMap?:boolean;intro?:FoundationBlock[];
 opening?:{story:string[];question:string;answer:string};objectives?:string[];cards:FoundationCard[];
 teamCase?:{who:string;what:string;evidence:string}[];
 diagram?:{id:string;title:string;relations:{from:string;to:string[]}[];alternative:string;mermaid:string;groups?:{title:string;hint?:string;options:string[]}[];flow?:boolean};
 balloons?:{title:string;states:FoundationBalloonState[]};activity?:FoundationClassifier;
 transfer?:{prompt:string;rubric:string[]};
 closing?:{summary:string[];glossary:{term:string;meaning:string}[];next:string};
 sources?:{title:string;url:string;version:string;consulted:string}[]};
export type FoundationWeek={version:string;week:number;title:string;summary:string;chapters:FoundationChapter[]};
export type FoundationCheckResult={questionId:string;correct:boolean;feedback:string;credited:boolean};
export type ReadingConcept = {
 id:string;title:string;description:string;
 example?:{context:string;action:string;result:string;counterexample?:string};
 demonstration?:{steps:string[];icons?:string[];stepDetails?:DemonstrationStepDetail[]};
};
export type StudyGuide = {
  foundation?:FoundationWeek;
  /** D-10: el test de los módulos sin minitests se presenta al final de su última semana. */
  closingTest?:{moduleId:string;moduleTitle:string;questions:PublicQuestion[]};
  exercise?:PracticalExercise;
  duration: number; level: string; summary: string;
  sections: {title:string;body:string;points:string[];concepts?:ReadingConcept[];experience?:StudyChapterExperience}[];
  example: {title:string;context:string;steps:string[];code?:string;language?:string;concepts?:ReadingConcept[]};
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

export {gradeQuizRequestSchema,foundationCheckRequestSchema} from './schemas';

export {registerSchema,loginSchema,progressCommandSchema,verifyEmailSchema,verificationResendSchema,changeInitialPasswordSchema,mfaSetupSchema,mfaCodeSchema,mfaResetConfirmSchema,adminMfaResetSchema} from './auth';
export type {AuthUserDTO} from './auth';

export {listStudentsSchema,newStudentSchema,changeStudentSchema,auditQuerySchema} from './admin';

export type {LoginOutcomeDTO} from './auth';
export * from './course-catalog';
export * from './appearance';
export * from './course-lessons';
export * from './course-outline';
