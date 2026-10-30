# 10 · Acta de implementación local L0–L2

Fecha: 2026-10-29. El responsable aceptó las recomendaciones D-01 a D-11 (02 §4). El alcance de esta entrega es **L0 + L1 + L2 con el Capítulo 01**, en local: sin commit, sin push, sin migración de base de datos y sin despliegue. **L3 a L6 esperan la revisión del responsable.**

## Qué se hizo

| Lote | Cambio | Archivos principales |
|---|---|---|
| L0 | Se retiró la implementación de Codex: currículo *legacy*/*current*, `curriculumReadingSections`, `fundamentals-curriculum.json`, generador, `FundamentalsExperience`, plantilla y pruebas asociadas. Se restauraron a HEAD los archivos que solo tenían cambios de Codex y se limpiaron a mano los hunks en archivos compartidos con SPEC-UX-120/210 | Ver §Archivos. Copia de seguridad previa: `.git/claude-backup-pre-L0.tgz` |
| L1 | Contenido v2: `fundamentals-v2.json` (semanas 1–2, 8 capítulos; C01 publicado y C02–C08 `pending`) y `fundamentals-v2-keys.json` (respuestas y feedback, **solo servidor**). Reglas en `libs/progress/src/domain/foundation-rules.ts`. Prueba `tests/foundation-v2.test.mjs` | `libs/content`, `libs/progress`, `packages/contracts`, `libs/learning` |
| L2 | Estudio de las semanas 1–2 con `FoundationStudy`: una tarjeta a la vez, lectura verificada por tarjeta (`foundation-card-read`), minitest corregido en el servidor (`POST /api/v1/me/foundation/checks/:id` para estudiantes y `POST /api/v1/foundation/checks/:id` para invitados), regla de completitud D-05, etapas Lectura → Minitests → Práctica, árbol con capítulos y tarjetas, títulos nuevos de semana en el catálogo | `apps/web/src/components/academy/foundation-*.tsx/.css`, `use-card-reading.ts`, `learning-navigation.ts`, `learning-tree.tsx`, `prepare-learning-navigation.mjs`, `lesson-study.tsx`, `foundation-check.controller.ts` |

## Corrección a 07 §7

`lesson-study-legacy.tsx` **no** es de Codex: se creó a las 04:44 UTC con el trabajo de SPEC-UX-120 y se conserva. La retirada se basó en las marcas de tiempo (Codex G3 trabajó entre las 05:43 y las 06:52 UTC).

## Desviaciones temporales (se resuelven en lotes posteriores)

| # | Desviación | Lote |
|---|---|---|
| T-01 | «Así se aplica» se muestra como lista ordenada de estados, sin globos interactivos | L3 |
| T-02 | El diagrama se muestra como lista estructurada de relaciones más alternativa textual. No hay SVG | L3 |
| T-03 | La vista de módulo sigue mostrando resumen, MariBug y test en los 8 módulos. Para Fundamentos se ocultaron en el árbol «Autoevaluación», «Test del módulo» y «Consolida lo aprendido» | L4 |
| T-04 | C02–C08 aparecen como «En preparación», así que la semana no puede completarse con la regla nueva | L5 |
| T-05 | La regla histórica sigue siendo válida para completar las semanas 1–2 (D-03). La API todavía acepta `reading-section`, `lesson-answer` y la corrección del test `fundamentos`, aunque la interfaz ya no los ofrece | L6 |
| T-06 | El borrador de la actividad formativa vive en memoria, no en `localStorage`. Las opciones del minitest rotan al reintentar, no se barajan | L5 |
| T-07 | Los hashes antiguos `#chapter-N` muestran el aviso «Este enlace ya no identifica una tarjeta» y abren el inicio de la semana, sin redirigir a su equivalente | L6 |

## Validación (2026-10-29)

| Verificación | Resultado |
|---|---|
| Pruebas Node (`node --test tests/*.test.mjs`) | **231/231** (incluye 5 nuevas de `foundation-v2` y las de navegación y árbol adaptadas) |
| Typecheck API y web · lint · build | Correctos |
| E2E nueva `foundation-v2.spec.ts` (Chromium) | **5/5**: una tarjeta a la vez; sin autoevaluación, test del módulo ni vista anterior; el payload no expone respuestas; el minitest no cuenta sin lectura; feedback y reintento; la actividad no cambia el progreso; sin desbordamiento a 320 px; árbol con tarjetas |
| Suite E2E completa (Chromium) | 144 correctas · 55 fallidas · 9 omitidas. Fallos de base (ya fallaban en HEAD o por un navegador ausente en el entorno de prueba): 28. **Fallos esperados por el cambio de Fundamentos: 27** pruebas que recorren la vista antigua de las semanas 1–2 (`academy:3`, `concept-details`, `focused-reading`, `focused-study`, `learning-tree`, `learning-ux`, `lesson-pagination`, `practice-progress:3`, `reading-concepts`). Hay que migrarlas a otra semana según 07 §6 (pendiente **L2b**) |

## Archivos

- **Eliminados:** `libs/content/src/data/fundamentals-curriculum.json`, `scripts/generate-fundamentals-curriculum.mjs`, `libs/progress/src/domain/curriculum-reading.ts`, `apps/web/src/components/academy/fundamentals-experience.tsx/.css`, `tests/fundamentals-curriculum.test.mjs`, `apps/web/tests/e2e/fundamentals-curriculum.spec.ts`, `apps/web/public/practice/templates/reservaya-plan-qa.md`.
- **Nuevos:** `libs/content/src/data/fundamentals-v2.json`, `libs/content/src/data/fundamentals-v2-keys.json`, `libs/progress/src/domain/foundation-rules.ts`, `libs/learning/src/application/grade-foundation-check.ts`, `apps/api/src/presentation/controllers/foundation-check.controller.ts`, `apps/web/src/components/academy/foundation-study.tsx/.css`, `apps/web/src/components/academy/foundation-check.tsx`, `apps/web/src/features/progress/use-card-reading.ts`, `tests/foundation-v2.test.mjs`, `apps/web/tests/e2e/foundation-v2.spec.ts`.

## Cómo revisarlo

1. Detén y vuelve a iniciar `pnpm dev`, que recompila las librerías.
2. Abre `/study/1` y avanza por las tarjetas del Capítulo 01.
3. Responde un minitest antes y después de terminar de leer la tarjeta: solo cuenta después.
4. Revisa el árbol de ruta en la vista del módulo Fundamentos.
