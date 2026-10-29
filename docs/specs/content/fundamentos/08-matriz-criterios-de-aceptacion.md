# 08 · Matriz de criterios de aceptación

Fase G1 · 2026-10-29. Esta matriz vincula cada criterio con el contenido que lo cubre, la actividad que lo evalúa y la prueba prevista (07 §6). El estado de todos los criterios es **«Diseñado»**: no hay nada implementado.

## Criterios del SPEC

| AC | Contenido (doc) | Actividad o evidencia | Prueba prevista |
|---|---|---|---|
| AC-01 | 01 §1: ocho capítulos con objetivos | Matriz curricular | `foundation-v2.test.mjs`: 8 capítulos y objetivos no vacíos |
| AC-02 | 03 T02–T05 y T08 | Minitests C01-T04 y C01-T08 · clasificador C01 | Unitaria de las claves de esos minitests + E2E del clasificador |
| AC-03 | 04 C03 T02–T06 | Minitest C03-T01 · asignación de 7 ejemplos | `foundation-v2.test.mjs`: los 5 niveles presentes; E2E |
| AC-04 | 04 C03-T07 · 01 §4.2 | Minitest C03-T07 | Revisión editorial + test de que el texto «simplificación» existe |
| AC-05 | 04 C04-T06 y T08 · C03-T08 | Distribuir 12 escenarios | E2E de la interacción C04 |
| AC-06 | 04 C05 T01–T07 · 01 §4.3 | «Decide con criterio» (7 microescenarios) | Unitaria: 7 principios con títulos v4.0.1 + E2E |
| AC-07 | 04 C06 (T04, T07) | Clasificador multidimensional | E2E: etiquetas múltiples aceptadas y condición explicada |
| AC-08 | 04 C02 T05–T06 · 05 §C02 | Simulador «30 minutos» + árbol | E2E: exige re-test y regresión con objetivos distintos |
| AC-09 | 04 C07 T01–T02 · 06 §6 | Constructor de Gherkin + rúbrica | E2E del constructor + revisión de la rúbrica |
| AC-10 | 04 C08 T01–T04 · 05 §C08 | Simulador «release o rollback» | E2E: el deployment con flag OFF no expone la función |
| AC-11 | 04 C08 T05–T07 | Minitests C08-T05 a T07 · checklist | Unitaria + revisión editorial |
| AC-12 | 06 §1 | Una tarjeta a la vez | `foundation-cards.spec.ts` en escritorio y 320 px |
| AC-13 | 06 §2 (mouse, teclado, touch) · 05 globos | 28 estados | `foundation-balloons.spec.ts` (matriz) |
| AC-14 | 06 §2 (scroll) | Apertura única por visita | E2E con `IntersectionObserver` y desplazamiento simulado |
| AC-15 | 06 §2 (animación) | Lista ordenada sin animación | E2E con `reducedMotion: 'reduce'` |
| AC-16 | 05 (reglas comunes) · 06 §2 y §3.2 | — | E2E negativo: abrir los 28 globos no cambia `weeks`, `foundationCards` ni `foundationChecks` |
| AC-17 | 07 §3 (D-03, `foundationLegacyComplete`) | — | `foundation-legacy-progress.spec.ts` |
| AC-18 | 01 §4 · `sources` (07 §2.3) · descarga | Cierre del capítulo | Unitaria: cada fuente con URL https, versión y fecha |
| AC-19 | 06 §4 (alternativas sin arrastrar) | C03, C04, C07 | E2E con teclado y toque |
| AC-20 | 04 C08 · 06 §6 | Plan QA de ReservaYa | Revisión de la rúbrica (formativa; D-09) |
| AC-21 | 07 §9 | — | `pnpm check` |
| AC-22 | 07 §9 | — | Playwright: MFA, rutas, notas, asistente + revisión manual en preview |

## Criterios añadidos por los requerimientos del responsable

| AC | Dado / Cuando / Entonces | Doc | Prueba prevista |
|---|---|---|---|
| AC-23 (RQ-01) | Dado Fundamentos, cuando se abre la vista del módulo, el árbol o `/study/1–2`, entonces solo aparecen los 8 capítulos nuevos y sus tarjetas; no hay secciones, ejemplos guiados ni vista anterior | 06 §7 | `module-view.spec.ts`, `learning-tree.test.mjs` |
| AC-24 (RQ-02) | Dado cualquiera de los 8 módulos, entonces no se muestra «OBJETIVO DEL MÓDULO» ni el bloque AVANCE | 06 §7.1 · 07 §5 | `module-view.spec.ts` × 8 módulos |
| AC-25 (RQ-03) | Dado cualquier módulo, entonces no se muestran el estado «Completado» ni «Preguntar a MariBug sobre este tema» en la vista del módulo; MariBug sigue disponible en el estudio | 06 §7.1 | `module-view.spec.ts` + `learning-ux.spec.ts` |
| AC-26 (RQ-04) | Dado cualquier módulo, entonces no existe «CONSOLIDA LO APRENDIDO · Evaluación del módulo» en la vista ni en el árbol; los 7 módulos distintos de Fundamentos ofrecen «Test de cierre» en su última semana y se pueden completar | 06 §7 · 07 §5 (D-10) | `module-view.spec.ts` + `learning-tree-completion.spec.ts` |
| AC-27 (RQ-05) | Cuando se verifica la lectura de una tarjeta, entonces aparece su minitest; la corrección es del servidor, el payload no contiene respuestas antes de enviar, hay feedback explicativo y reintento, y el capítulo se aprueba con ⌈70 %⌉ | 06 §3 · 07 §3 | `foundation-checks.spec.ts` + unitarias del endpoint |
| AC-28 (RQ-05) | Cuando un alumno responde bien sin haber leído la tarjeta, o importa resultados como invitado, entonces el minitest no cuenta para completar | 06 §3.2 · 07 §3 | Unitaria de la regla de completitud + E2E |

## Decisiones que bloquean la implementación

D-01 a D-11 (02 §4) y la verificación **V-01** (nombres en español de ISO/IEC 25010:2023). Al aprobarlas se autoriza G3; cada lote de G4 requiere después su propia aprobación.
