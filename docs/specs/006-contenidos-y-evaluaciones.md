# SPEC-006 — Contenidos y evaluaciones

## 01. Intención
Ofrecer una ruta de 24 semanas, contenidos de Scrum, recursos, proyecto y evaluaciones, con catálogo independiente de las cuentas.

## 02. Comportamiento
### Inventario obtenido por lectura de JSON
| Módulo | Id | Semanas | Preguntas del quiz |
|---|---|---|---|
| Fundamentos del Testing | fundamentos | 1–2 | 3 |
| QA Manual profesional | manual | 3–6 | 3 |
| HTTP, REST, Postman, DevTools y SQL | herramientas | 7–8 | 4 |
| JavaScript, TypeScript y Git | typescript | 9–12 | 4 |
| Automatización con Playwright | playwright | 13–16 | 3 |
| Framework y automatización API | arquitectura | 17–20 | 3 |
| CI/CD y calidad de la suite | cicd | 21–22 | 3 |
| Proyecto final y portafolio | portafolio | 23–24 | 3 |

Snapshot: 8 módulos, 24 semanas, 24 guías, 24 ejercicios, 12 laboratorios y 12 recursos. Son cantidades de objetos del repositorio, no métricas de uso.

### Superficie pública /api/v1
GET modules; GET modules/:moduleId; GET lessons/:week; GET scrum; GET resources; GET project/checklist. JsonContentAdapter combina guías y ejercicios por número de semana. GetModule filtra semanas/labs/recursos por id y publica las preguntas sin correct/why. GetScrum hace proyección similar.

POST quizzes/:moduleId/grade es público y devuelve score,total,percent y feedback por pregunta (correct,expected,reason). POST me/quizzes/:moduleId/grade requiere STUDENT y persiste resultado propio. Scrum dispone del id especial scrum.

Quiz.from verifica preguntas/opciones; grade exige exactamente todas las respuestas y cada índice válido. Puntaje porcentual redondeado, sin crédito parcial. El contrato admite entre 1 y 30 respuestas; la cantidad exacta la decide el quiz real. Módulo o guía ausente produce error de no encontrado mediante los casos de uso/filtro.

### Pantallas detectadas
Inicio, modules, modules/[moduleId], study/[week], practice, practice/[week], scrum, project, resources, certification/istqb, registro/login/verificación/continuación, account, admin, api-status. Existencia de página no implica que sus rutas privadas se protejan solo en frontend: permisos de datos están en el API.

### Criterios de aceptación derivados
- C-001: leer detalle de módulo no entrega el índice de respuesta correcta del quiz.
- C-002: evaluar un quiz incompleto o con un índice inválido devuelve error.
- C-003: una lectura de semana debe combinar guía y ejercicio de esa semana.
- C-004: el id scrum obtiene preguntas desde el snapshot Scrum y no desde un módulo inventado.

## 03. Restricciones
Contenido en JSON versionado con el código. learningRules mantiene otra representación de módulos, secciones y respuestas de autoevaluación. No se validaron enlaces externos ni la precisión pedagógica completa de cada texto. Los feedback de evaluación sí entregan la respuesta esperada al evaluar; no se presupone confidencialidad posterior de las respuestas.

## 04. No-Objetivos
No editar contenidos, redistribuir semanas ni abrir recursos externos. No convertir tablas iniciales de cursos en CMS ni afirmar que existe publicación editorial por instructor.

## Evidencia y trazabilidad
| Afirmación | Evidencia (ruta + símbolo) | Test/observación | Estado |
|---|---|---|---|
| Inventario y distribución | `libs/content/src/data/catalog.json` — modules,weeks,quizzes,labs,resources; `libs/content/src/data/study-guides.json`; `libs/content/src/data/practical-exercises.json` | Conteo estático de claves/arrays | CONFIRMADO |
| Rutas públicas | `apps/api/src/presentation/controllers/catalog.controller.ts` — CatalogController | `tests/content.test.mjs` | CONFIRMADO |
| Ocultar respuesta en consulta | `libs/learning/src/application/get-module.ts` — execute; `libs/learning/src/application/get-scrum.ts` — execute | Proyección {q,a} | CONFIRMADO |
| Evaluación y feedback | `libs/learning/src/domain/quiz.ts` — Quiz; `libs/learning/src/application/grade-quiz.ts` — execute | `tests/domain.test.mjs` | CONFIRMADO |
| Público frente a persistido | `apps/api/src/presentation/controllers/quiz.controller.ts`; `apps/api/src/presentation/controllers/student-quiz.controller.ts` | Guards y DTO inspeccionados | CONFIRMADO |
| Consistencia curricular | `libs/progress/src/domain/learning-rules.ts`; `tests/module-topic-distribution.test.mjs`; `tests/reading-concepts.test.mjs` | Tests existentes, no ejecutados | NO VERIFICADO |

## Preguntas abiertas y deuda técnica
DT-11: mantener sincronizadas las representaciones JSON, reglas de dominio y materiales del kit. La revisión confirma inventario y ruta de datos, no revisión editorial exhaustiva de las 24 semanas.

