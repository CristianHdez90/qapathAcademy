# 00 · Inventario AS-IS del módulo Fundamentos

| Campo | Valor |
|---|---|
| SPEC de origen | `docs/specs/SPEC-CONTENT-220-Fundamentos-del-Testing-TO-BE.md` v1.0.0 |
| Fase | **G0 · Solo documentación**: no se modifica código, JSON, pruebas ni producción |
| Fecha de auditoría | 2026-10-29 |
| Rama | `codex/fix-ci-lint` |
| Commit base (HEAD) | `5dcbdf45b5b21b43d8f99ae01e0e62dbaa6c60c2` |
| Revisión | Versión nueva, rehecha desde cero. Sustituye la edición anterior de esta carpeta, que el responsable rechazó |

> **Regla de lectura.** El AS-IS se toma del **commit HEAD**. El árbol de trabajo tiene, además, cambios sin commit que no forman parte del producto publicado. Se inventarían en el §6 porque afectan la migración.

---

## 1. Ubicación del módulo

| Elemento | Archivo | Estado en HEAD |
|---|---|---|
| Módulo | `libs/content/src/data/catalog.json` → `modules[id=fundamentos]` | Número `01`, «Fundamentos del Testing», `weeks:[1,2]`, `outcome`: «Comprendes qué probar, por qué hacerlo y cómo medir el riesgo.» |
| Semana 1 | `catalog.json` → `weeks[id=1]` | «Mentalidad QA y ciclo de vida del software». Objetivo: diferenciar calidad, testing, verificación y validación |
| Semana 2 | `catalog.json` → `weeks[id=2]` | «Niveles, tipos y gestión de riesgos». Objetivo: seleccionar tipos de prueba según el impacto del fallo |
| Guías | `libs/content/src/data/study-guides.json` → claves `"1"` y `"2"` | 3 secciones y 1 ejemplo guiado por semana |
| Práctica semanal | `libs/content/src/data/practical-exercises.json` → `"1"`, `"2"` | S1: «De la historia de usuario al diseño de casos de prueba». S2: «Riesgos y niveles de prueba · misión de lanzamiento» |
| Laboratorio | `catalog.json` → `labs[id=l1]` | «Detective de defectos» (ya no es obligatorio para completar la semana) |
| Test del módulo | `catalog.json` → `quizzes.fundamentos` | 3 preguntas de opción única |
| Regla académica | `libs/progress/src/domain/learning-rules.ts` | Semanas 1 y 2: `sections: 4` (3 secciones + ejemplo), `tasks: 2`, `labs:["l1"]`, `answer: 1`, `options: 3` |

## 2. Contenido actual (48 tarjetas)

### Semana 1 · 25 tarjetas

| Región | Título | Tarjetas (`id`) |
|---|---|---|
| `chapter-0` | QA, QC y testing: conceptos diferentes | `qa`, `qc`, `testing`, `error`, `defect`, `failure`, `verification`, `validation` (8) |
| `chapter-1` | Cómo se relacionan SDLC y STLC | `sdlc`, `stlc`, `iteration`, `refinement`, `development`, `release` (6) |
| `chapter-2` | Los siete principios del testing | `presence`, `exhaustive`, `early`, `cluster`, `refresh`, `context`, `useful` (7) + 2 puntos |
| `chapter-3` | Caso guiado · saldo bancario incorrecto | 4 tarjetas de ejemplo |
| `self-check` | ¿Qué demuestra una suite que pasa al 100 %? | 3 opciones |

### Semana 2 · 23 tarjetas

| Región | Título | Tarjetas (`id`) |
|---|---|---|
| `chapter-0` | Niveles de prueba | `unit`, `integration`, `system`, `acceptance` (**4 niveles: falta integración de sistemas**) |
| `chapter-1` | Tipos y objetivos de pruebas | `functional`, `nonfunctional`, `smoke`, `regression`, `explore`, `e2e`, `sanity`, `automation` (8) |
| `chapter-2` | Priorización basada en riesgos | `risk`, `measure`, `impact`, `identify`, `estimate`, `controls`, `reevaluate` (7) |
| `chapter-3` | Caso guiado · priorizar cinco funcionalidades | 4 tarjetas de ejemplo |
| `self-check` | ¿Qué escenario suele merecer ejecución prioritaria? | 3 opciones |

### Test del módulo (`quizzes.fundamentos`)

1. ¿Qué describe mejor el objetivo del testing? → correcta: «Reducir riesgos aportando información de calidad».
2. ¿Cuál es un nivel de prueba? → correcta: «Integración».
3. ¿Cuál debería probarse antes? → correcta: «Transferencia de dinero con riesgo alto».

### Hallazgos de auditoría pedagógica (ISTQB CTFL v4.0.1)

| # | Hallazgo | Gravedad |
|---|---|---|
| H-01 | Solo se enseñan **4 niveles**. CTFL v4.0.1 §2.2.1 enumera 5: componente, integración de componentes, sistema, integración de sistemas y aceptación | Alta (AC-03/AC-04) |
| H-02 | En S2 se mezclan en una misma lista objetivo (funcional/no funcional), alcance (E2E), propósito (smoke, sanity, regresión), estilo (exploratoria) y forma de ejecución (automatización). Esto refuerza la confusión que el SPEC quiere eliminar | Alta (AC-02/AC-07) |
| H-03 | No se enseñan caja negra, caja blanca, técnicas basadas en experiencia ni pruebas estáticas y dinámicas | Alta |
| H-04 | No hay re-test o prueba de confirmación como concepto propio. CTFL §2.2.3 la distingue de la regresión | Alta (AC-08) |
| H-05 | No aparecen la pirámide de Cohn, los cuadrantes, BDD, deployment/release, feature flags ni ambientes | Alta (capítulos 04, 07 y 08 inexistentes) |
| H-06 | Los ejemplos guiados (banco, tienda) no comparten un caso transversal, de modo que no hay continuidad narrativa | Media |
| H-07 | Solo hay 1 autoevaluación por semana y 3 preguntas en el test del módulo: no se evalúa cada objetivo | Alta |
| H-08 | Lo que **sí está bien y debe conservarse**: QA/QC/testing, error→defecto→fallo, verificación/validación, SDLC/STLC, siete principios y priorización por riesgo. Son correctos y se reubican (ver 02) | — |

## 3. Contratos y código que dependen del módulo (HEAD)

| Área | Archivo | Dependencia real |
|---|---|---|
| DTO | `packages/contracts/src/index.ts` (líneas 12–28) | `PublicQuestion = Pick<Question,'q'\|'a'>`. `ReadingConcept` tiene `example?{context,action,result}` y `demonstration?{steps,icons?}`. `StudyGuide.sections[]`. `example.concepts?` |
| Modelo de dominio | `libs/learning/src/domain/models.ts` | Copia del contrato de lectura |
| API de contenido | `apps/api/src/infrastructure/adapters/json-content.adapter.ts` | Devuelve `guide` + `exercise` por semana |
| Corrección del test | `apps/api/src/presentation/controllers/student-quiz.controller.ts` → `POST /me/quizzes/:moduleId/grade` | Corrige en el servidor y aplica `{type:'grade',moduleId,score}` |
| Esquema de comandos | `packages/contracts` (`progressCommandSchema`) | **Rechaza** `grade` enviado por el cliente, así que nadie puede fabricar notas |
| Completitud | `libs/progress/src/domain/automatic-completion.ts` | Semana completa = lectura de todas las regiones + `lessonChecks` + práctica validada + `quizzes[module] ≥ 70` (`QUIZ_PASS_PERCENT`) |
| Lectura | `apps/web/src/features/progress/use-reading-tracker.ts`, `READING_SECTION_SECONDS=3` | Registra `reading-section` por región `0..sections-1` |
| Paginación | `apps/web/src/features/progress/use-lesson-pagination.ts` | Hashes `#chapter-N`, `#practical-exercise`, `#self-check`, `#study-notes`, `#study-resources` |
| Siguiente acción | `apps/web/src/features/progress/learning-navigation.ts` | Pasos Lectura → Práctica → Autoevaluación → **Test del módulo** (`/modules/:id#module-quiz`) |
| Vista de módulo | `apps/web/src/components/academy/module-detail.tsx` | Muestra `module-summary` (OBJETIVO DEL MÓDULO + AVANCE), `module-guidance` (estado «Completado», «Continuar» y `AskLia` «Preguntar a MariBug sobre este tema»), «CONTENIDO DE ESTUDIO», práctica, `Quiz` y recursos. **Es la misma para los 8 módulos** |
| Test del módulo (interfaz) | `apps/web/src/components/academy/quiz.tsx` | Encabezado «CONSOLIDA LO APRENDIDO · Evaluación del módulo» |
| Árbol de ruta | `apps/web/src/components/layout/learning-tree.tsx` (+ `features/navigation/learning-tree.json`, generado por `apps/web/scripts/prepare-learning-navigation.mjs`) | Categoría «CONTENIDO DE ESTUDIO» con capítulos de `guides[w].sections`. Enlaces «Test del módulo» (l. 44) y categoría «CONSOLIDA LO APRENDIDO · Evaluación del módulo» (l. 50–51) |

## 4. Pruebas acopladas a la estructura actual

| Prueba | Acoplamiento |
|---|---|
| `tests/reading-concepts.test.mjs:5–16` | **48 tarjetas** en S1–S2 y `sections.length === 3` |
| `tests/reading-concepts.test.mjs:24` | 3 secciones, salvo las semanas 7 y 9 |
| `tests/automatic-progress.test.mjs:15` | `rule.sections === guide.sections.length + 1` |
| `tests/content.test.mjs:15` | `sections.length >= 3` en las 24 guías |
| `tests/learning-navigation.test.mjs:17–38` | Hrefs `#chapter-0`, `#self-check`, `/modules/fundamentos#module-quiz` |
| `tests/learning-tree.test.mjs` | Capítulos del árbol = títulos de `guides[w].sections` |
| `tests/domain.test.mjs:16`, `identity-progress`, `progress-percentage` | Clave `quizzes.fundamentos` |
| E2E `academy`, `firebase-auth:41–46`, `learning-tree`, `learning-ux`, `lesson-pagination`, `reading-concepts`, `practical-exercises`, `practice-activities`, `student-auth`, `admin` | Usan `/study/1`, el selector «Ir a un apartado», `#self-check`, `.reading-concept-qa` y el test del módulo `fundamentos` |
| E2E `learning-tree-completion.spec.ts:12` | Enlace `#module-quiz` de otro módulo (`manual`) |

## 5. Estado del producto publicado

La versión publicada coincide con HEAD: 6 regiones de lectura más ejemplos y el test del módulo en la vista de módulo. No hay migraciones de base de datos asociadas a Fundamentos. El progreso se guarda como documento serializado (`student_progress`) con eventos (`student_progress_events`).

## 6. Cambios sin commit en el árbol de trabajo (no publicados)

| Grupo | Archivos | Situación propuesta |
|---|---|---|
| **G3 de Codex** (rechazada) | `libs/content/src/data/fundamentals-curriculum.json`, `scripts/generate-fundamentals-curriculum.mjs`, `libs/progress/src/domain/curriculum-reading.ts`, cambios en `progress.ts`, `progress-commands.ts`, `automatic-completion.ts`, `progress/index.ts`, `contracts/auth.ts`, `json-content.adapter.ts`, `postgres-progress.adapter.ts` (1 línea), `fundamentals-experience.tsx/.css`, `chapter-experience.*`, `lesson-download.ts`, `reading-reference.tsx`, `learning-navigation.ts`, `use-focused-reading.ts`, `use-study-navigation.ts`, `study/[week]/page.tsx`, `lesson-study.tsx`, `lesson-study-legacy.tsx`, `public/practice/templates/reservaya-plan-qa.md`, `tests/fundamentals-curriculum.test.mjs`, `apps/web/tests/e2e/fundamentals-curriculum.spec.ts`, y las adaptaciones de pruebas hechas el 2026-10-29 (`tests/learning-navigation`, `tests/learning-tree`, e2e `learning-tree`, `lesson-pagination`, `learning-ux`, `practice-progress`) | **Retirar al aprobar G3** (plan en 07 §7). No sirve como base: separa el «contenido anterior» en una vista aparte en lugar de sustituirlo y descarta los globos |
| Modo de estudio enfocado (SPEC-UX-120) y detalles de concepto (SPEC-CONTENT-210) | `focused-study.*`, `study-steps.ts`, `use-focused-study-mode.ts`, `study-dialog.tsx`, `concept-step-details.*`, `focused-reading-geometry.ts`, `reading-text-map.ts`, `features/study/`, E2E `focused-*`, `concept-details` | **Trabajo previo independiente**: no se revierte a ciegas. El TO-BE reutiliza su mecánica de «una tarjeta a la vez» (AC-12) |
| Retirada global de «Así se aplica» | `concept-demonstration.tsx/.css` eliminados; `reading-concepts.*`; `docs/specs/content/ajuste-global-sin-asi-se-aplica.md` | **Conflicto con SPEC-220 §2.6**: este pedido vuelve a solicitar globos por estado. Se propone reintroducirlos **solo en Fundamentos** con un componente nuevo (decisión D-07 en 02) |
| Carpeta `dist/` de librerías | Recompilada el 2026-10-29 para resolver `newCurriculumReading is not a function` | Está ignorada por git; se regenera con `pnpm build:libs` |
| Archivos ajenos | `.claude-e2e-transfer.tgz`, `.claude-head.tar.gz` (temporales de pruebas) y el archivo `ion inicial de QAPath Academy 6.1"…` (comando de commit mal formado) | Borrar manualmente; no forman parte del producto |

## 7. Requerimientos adicionales del responsable (2026-10-29)

Se incorporan al alcance de esta documentación:

| ID | Requerimiento | Alcance confirmado |
|---|---|---|
| RQ-01 | «CONTENIDO DE ESTUDIO» debe mostrar la nueva propuesta completa: nada del estándar anterior | Fundamentos (vista de módulo, árbol de ruta y página de estudio) |
| RQ-02 | Quitar la tarjeta «OBJETIVO DEL MÓDULO / AVANCE x % · n/n semanas completadas» | **Los 8 módulos** |
| RQ-03 | Quitar el estado «Completado» y «✦ Preguntar a MariBug sobre este tema ↗» de la vista de módulo | **Los 8 módulos** |
| RQ-04 | Quitar el bloque «CONSOLIDA LO APRENDIDO · Evaluación del módulo» | **Los 8 módulos** |
| RQ-05 | La evaluación se hace con **minitest al terminar la lectura de cada tarjeta** | Fundamentos. Es **requisito académico**: sustituye al test del módulo y a la autoevaluación semanal |

El impacto de RQ-02 a RQ-04 en los otros 7 módulos (que pierden su test del módulo) se analiza en 02 (riesgo R-09) y 07 §5.
