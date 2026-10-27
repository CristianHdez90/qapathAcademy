# SPEC-012 — Matriz de trazabilidad AS-IS

## 01. Intención
Vincular capacidades reconstruidas con entrada observable, implementación, evidencia complementaria y límite de verificación.

## 02. Comportamiento
Todas las rutas API llevan prefijo /api/v1. **Las pruebas nombradas existen, pero no fueron ejecutadas en esta fase.** Estado CONFIRMADO corresponde al comportamiento leído en código, no a un test aprobado.

| ID | Requisito AS-IS / Spec | Entrada / UI | Evidencia del repositorio y símbolo | Prueba u observación complementaria | Estado |
|---|---|---|---|---|---|
| AR-01 | Composición y fronteras · 001 | AppModule | `apps/api/src/app.module.ts` — providers/APP_GUARD | `tests/architecture.test.mjs` | CONFIRMADO |
| AR-02 | Proxy y cliente servidor · 001/008 | /api/v1/* | `apps/web/next.config.ts` — rewrites; `apps/web/src/lib/academy-api.ts` — get | Lectura sin HTTP | CONFIRMADO |
| ID-01 | Registro solo estudiante · 002/004 | POST auth/register | `libs/identity/src/application/account-security.ts` — signUp; `packages/contracts/src/auth.ts` — registerSchema | `tests/identity-progress.test.mjs` | CONFIRMADO |
| ID-02 | Correo y etapas previas · 002 | auth/login,verify-email | `libs/identity/src/application/account-security.ts` — signIn; `apps/api/src/infrastructure/adapters/postgres-security.adapter.ts` — consumeVerification | `tests/account-security.test.mjs` | CONFIRMADO |
| ID-03 | Sesión opaca y revocación · 002 | auth/me,logout | `apps/api/src/presentation/controllers/auth.controller.ts`; `apps/api/src/infrastructure/adapters/postgres-identity.adapter.ts` | `apps/web/tests/e2e/student-auth.spec.ts` | CONFIRMADO |
| MF-01 | MFA ADMIN y voluntario · 003 | auth/mfa/setup,activate,verify | `libs/identity/src/application/account-security.ts` — beginMfa,verifyMfa | `tests/account-security.test.mjs` | CONFIRMADO |
| MF-02 | Antirreplay/recovery un uso · 003 | TOTP/recovery | `apps/api/src/infrastructure/adapters/postgres-security.adapter.ts` — claimMfaStep,claimRecoveryCode | `apps/web/tests/e2e/security-comprehensive.spec.ts:122`, condicional | CONFIRMADO |
| RB-01 | Autorización y origen · 004 | Endpoints protegidos | `apps/api/src/presentation/security/session-security.ts` — guards | `tests/ai-settings-http.test.mjs:9` | CONFIRMADO |
| PG-01 | Progreso propio y transacción · 005 | GET/PATCH me/progress | `apps/api/src/infrastructure/adapters/postgres-progress.adapter.ts` — transact | Lectura FOR UPDATE + evento | CONFIRMADO |
| PG-02 | Importar solo notas autenticadas · 005 | POST me/progress/import | Mismo adaptador — import | Contraste con mergeProgress genérico | CONFIRMADO |
| PG-03 | Cuatro etapas y 70% · 005 | Ruta académica | `libs/progress/src/domain/automatic-completion.ts` — automaticCompletion; `libs/progress/src/domain/progress.ts` — progressPercentage | `tests/progress-percentage.test.mjs` | CONFIRMADO |
| PG-04 | Límites 23/24 incompatibles · 005 | Guardar evidencia | `apps/web/src/components/academy/practice-activity.tsx:58`; `packages/contracts/src/auth.ts` — progressCommandSchema | DT-01 | CONTRADICTORIO |
| PG-05 | Práctica genérica no atestada · 005/009 | submit-evidence | `libs/progress/src/domain/practice-completion.ts` — practiceCompleted | `tests/practice-completion.test.mjs` con fixtures | CONFIRMADO |
| CO-01 | 8 módulos/24 semanas · 006 | modules,lessons/:week | `libs/content/src/data/catalog.json`; `apps/api/src/infrastructure/adapters/json-content.adapter.ts` | Conteo estático | CONFIRMADO |
| CO-02 | Proyección pública y evaluación · 006 | modules/:id; quizzes/:id/grade | `libs/learning/src/application/get-module.ts`; `libs/learning/src/domain/quiz.ts` — grade | `tests/domain.test.mjs` | CONFIRMADO |
| AD-01 | CRUD parcial de estudiantes · 007 | admin/students | `apps/api/src/presentation/controllers/admin.controller.ts`; `libs/administration/src/application/manage-students.ts` | `tests/administration.test.mjs` | CONFIRMADO |
| AD-02 | Auditoría y eventos · 007 | admin/audit,students/:id/events | `packages/database/src/schema.ts` — adminAuditEvents,studentProgressEvents | SQL y adaptadores leídos | CONFIRMADO |
| IN-01 | Migraciones con checksum · 008 | db:migrate, no ejecutado | `packages/database/scripts/migrate.mjs` — loop por archivo | Lectura | CONFIRMADO |
| IN-02 | Firebase Auth diferente de correo · 008 | AUTH_PROVIDER/EMAIL_TRANSPORT | `apps/api/src/infrastructure/adapters/firebase-auth.adapter.ts`; `apps/api/src/infrastructure/adapters/firebase-email.adapter.ts` | `tests/firebase-identity.test.mjs`, `tests/firebase-email.test.mjs` | CONFIRMADO |
| IN-03 | Despliegue Vercel efectivo · 008 | Entorno remoto | `apps/api/vercel.json`; `apps/web/vercel.json` solo declaran build | Sin consulta a Vercel ni commit remoto | NO VERIFICADO |
| LB-01 | Dispatch de 24 prácticas · 009 | practice/[week] | `apps/web/src/components/academy/week-laboratory.tsx` — WeekLaboratory | E2E *-mission.spec.ts, sin recorrido completo | CONFIRMADO |
| LB-02 | JS aislado/SQL local/Git local · 009 | Laboratorios | `apps/web/src/features/practice/runtime/code-sandbox.ts` — executeCode; `apps/web/src/features/practice/runtime/sql.worker.ts`; `apps/web/src/features/practice/runtime/git-training-remote.ts` — publishTrainingBranch | Lectura de motores | CONFIRMADO |
| LB-03 | Sandbox HTTP ficticio · 009 | practice/quotes,access,status/:code | `apps/api/src/application/practice-sandbox.ts` — practiceQuote; `apps/api/src/presentation/controllers/practice.controller.ts` | Contrato estático | CONFIRMADO |
| AI-01 | Configuración admin cifrada · 009 | admin/ai-settings | `apps/api/src/infrastructure/adapters/ai-settings.adapter.ts` — save,runtime | `tests/ai-settings.test.mjs` | CONFIRMADO |
| AI-02 | Groq/Gemini y cuota persistente · 009 | assistant/chat | `apps/api/src/infrastructure/adapters/qa-ai.adapter.ts` — answer; `apps/api/src/infrastructure/adapters/qa-quota.adapter.ts` — reserve | `tests/qa-assistant.test.mjs` con dobles | CONFIRMADO |
| AI-03 | Historial por dueño/revisión · 009 | assistant/conversations | `apps/api/src/infrastructure/adapters/qa-conversations.adapter.ts` — get,append,archive | `apps/web/tests/e2e/qa-history.spec.ts` con interceptación | CONFIRMADO |
| CF-01 | CTFL independiente · 009 | certification/istqb | `apps/web/src/components/academy/ctfl-module.tsx` — CtflModule; `apps/web/src/features/certification/ctfl-content.ts` — gradeCtfl | `tests/ctfl.test.mjs` | CONFIRMADO |
| QA-01 | Pipeline y suites declaradas · 010 | GitHub Actions | `.github/workflows/quality.yml`; `apps/web/playwright.config.ts` | Conteo 57/54 archivos, no casos | CONFIRMADO |
| QA-02 | CI verde / todos los tests pasan · 010 | Ejecución actual | No hay ejecución autorizada en esta tarea | Pendiente de evidencia | NO VERIFICADO |
| DOC-01 | Conflicto de versión diagnóstica · 011 | health | `apps/api/src/presentation/controllers/health.controller.ts` vs `package.json` | DT-12 | CONTRADICTORIO |

## 03. Restricciones
Alcance documental; no evidencia de runtime obtenida. Los símbolos/rutas son verificables en esta línea base, que incluye cambios locales. Ausencia de endpoint revisado no prueba inexistencia de procedimientos manuales externos.

## 04. No-Objetivos
No convertir criterios derivados en nuevos requisitos ni presentar esta matriz como cobertura de tests en porcentaje.

## Evidencia y trazabilidad
| Afirmación | Evidencia (ruta + símbolo) | Test/observación | Estado |
|---|---|---|---|
| Requisitos materializados | Filas AR-01 a DOC-01 y Specs enlazados desde índice | Inspección estática y referencias locales | CONFIRMADO |
| Resultados de ejecución | No recogidos en esta tarea | Prohibidos por alcance documental | NO VERIFICADO |

## Preguntas abiertas y deuda técnica
Casos pendientes: despliegue efectivo, controles externos, recorridos completos de cada misión y suites con base/proveedores reales. Consultar backlog DT-01 a DT-16 antes de definir TO-BE.

