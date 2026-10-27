# SPEC-004 — Usuarios y autorización

## 01. Intención
Separar acceso público, progreso propio de estudiantes, funciones de instructor y administración restringida.

## 02. Comportamiento
### Matriz de permisos observada
| Superficie bajo /api/v1 | Visitante | STUDENT | INSTRUCTOR | ADMIN |
|---|---|---|---|---|
| health, catálogo, quizzes públicos, sandbox practice, auth público | Pública | Pública | Pública | Pública |
| auth/me y auth/logout | 401 | Sesión propia | Sesión propia | Sesión propia |
| me/progress y me/quizzes/:moduleId/grade | 401 | Propio | 403 | 403 |
| instructor/status | 401 | 403 | Permitido | Permitido |
| admin y admin/ai-settings | 401 | 403 | 403 | Permitido |
| assistant/* | 401 | Permitido | Permitido | Permitido |

Los permisos efectivos los calculan SessionGuard y RolesGuard; el asistente no tiene restricción de rol adicional. Public solo omite la resolución de sesión/roles. OriginGuard sigue actuando en métodos mutativos.

### Reglas
- No hay parámetro de usuario destino en progreso propio: se usa request.user.id.
- Registro público siempre STUDENT. La modificación administrativa solo admite email/isActive y actúa sobre estudiantes; no permite asignar roles por cuerpo.
- assertStudentMutation impide autoedición y editar roles distintos de STUDENT.
- ADMIN requiere MFA antes de sesión completa, según SPEC-002/003.
- INSTRUCTOR tiene un endpoint de status; el indicador contentManagementAccess no demuestra un editor ni CRUD de contenidos.

### Criterios de aceptación derivados
- R-001: anónimo en un recurso protegido recibe 401; usuario autenticado sin rol recibe 403.
- R-002: STUDENT no puede leer ni mutar administración.
- R-003: editar el identificador de una conversación no debe permitir leer otra cuenta: consultas filtran por user_id.
- R-004: una escritura con Origin ajeno o sec-fetch-site cross-site debe ser rechazada por OriginGuard.

## 03. Restricciones
OriginGuard contrasta WEB_ORIGIN y cabeceras Fetch Metadata; escrituras con cookie y sin Origin requieren same-origin. No es una prueba de seguridad completa ni un escáner de todas las rutas. La matriz procede de los decoradores y guards inspeccionados.

## 04. No-Objetivos
No incorporar jerarquías de permisos, gestión de roles ni nuevas facultades de instructor. No autenticar cuentas reales para comprobar la matriz.

## Evidencia y trazabilidad
| Afirmación | Evidencia (ruta + símbolo) | Test/observación | Estado |
|---|---|---|---|
| Roles y reglas de cuenta | `libs/identity/src/domain/identity.ts` — UserRole; `libs/administration/src/domain/admin.ts` — assertStudentMutation | `tests/administration.test.mjs` | CONFIRMADO |
| Guard global y origen | `apps/api/src/presentation/security/session-security.ts` — Public, Roles, OriginGuard, SessionGuard, RolesGuard | `tests/ai-settings-http.test.mjs:9` usa guards y servicios simulados | CONFIRMADO |
| Rol estudiante | `apps/api/src/presentation/controllers/progress.controller.ts:10`; `apps/api/src/presentation/controllers/student-quiz.controller.ts` | `apps/web/tests/e2e/student-auth.spec.ts` existente | CONFIRMADO |
| Admin e instructor | `apps/api/src/presentation/controllers/admin.controller.ts`; `apps/api/src/presentation/controllers/instructor.controller.ts` | `apps/web/tests/e2e/admin.spec.ts` existente | CONFIRMADO |
| Conversaciones propias | `apps/api/src/infrastructure/adapters/qa-conversations.adapter.ts` — get, append, archive | `apps/web/tests/e2e/qa-history.spec.ts` simula rutas | CONFIRMADO |

## Preguntas abiertas y deuda técnica
DT-10: permiso nominal de gestión de contenidos sin operaciones CRUD en InstructorController. Determinar si es placeholder intencional; no convertirlo en requisito implementado.

