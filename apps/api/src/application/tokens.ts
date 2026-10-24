export const CONTENT_REPOSITORY=Symbol('CONTENT_REPOSITORY');
export const USE_CASES={
 listModules:Symbol('LIST_MODULES'),getModule:Symbol('GET_MODULE'),getLesson:Symbol('GET_LESSON'),
 getScrum:Symbol('GET_SCRUM'),gradeQuiz:Symbol('GRADE_QUIZ'),
 listResources:Symbol('LIST_RESOURCES'),getProjectChecklist:Symbol('GET_PROJECT_CHECKLIST')
} as const;

export const IDENTITY_REPOSITORY=Symbol('IDENTITY_REPOSITORY');
export const PROGRESS_REPOSITORY=Symbol('PROGRESS_REPOSITORY');

export const ADMIN_REPOSITORY=Symbol('ADMIN_REPOSITORY');
