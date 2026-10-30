# 07 · Plan de migración técnica y regresión (propuesta G3)

Fase G1 · solo documentación · 2026-10-29. **Nada de esto se ejecuta sin aprobación explícita.**

## 1. Alcance técnico

| Incluido | Excluido |
|---|---|
| Datos y vista de estudio de las semanas 1–2 · regla de completitud de Fundamentos · minitests · globos · vista de módulo y árbol (bloques de RQ-02 a RQ-04 en los 8 módulos) · traslado del test de los otros 7 módulos (D-10) | Contenido de los otros 7 módulos · prácticas semanales (D-09) · infraestructura, autenticación, base de datos (salvo lo que se indica en §3) · despliegue |

## 2. Contrato de datos

### 2.1 Fuente

Hay un archivo nuevo, `libs/content/src/data/fundamentals-v2.json`, con autoría manual (sin generador de código) y validado por esquema. `study-guides.json` conserva las claves `"1"` y `"2"` sin cambios hasta el lote L6, en el que se retiran sus secciones (D-02). El adaptador de contenido sirve la v2 para las semanas 1 y 2.

### 2.2 Identificadores

| Elemento | Formato | Ejemplo |
|---|---|---|
| Capítulo | `FND-Cnn` | `FND-C03` |
| Tarjeta | `FND-Wss-Cnn-Tnn` | `FND-W01-C03-T05`, `FND-W02-C07-T03` |
| Pregunta de minitest | `<tarjeta>-Qn` | `FND-W01-C01-T01-Q2` |
| Opción | `a`, `b`, `c`: ID estable, independiente del orden en que se muestra | |
| Estado de globo | `<capítulo>-Sn` | `FND-C03-S2` |

Los IDs no se reutilizan nunca. Si se reescribe una tarjeta conserva su ID; si se elimina, su ID queda retirado.

### 2.3 Tipos propuestos (añadidos al contrato, sin tocar `ReadingConcept`)

```ts
// Propuesta: aún no aplicada
type FoundationCard = {
  id: string; chapter: string; title: string; objective: string; context: string;
  explanation: string;
  example: {situation: string; qaDecision: string; evidence: string};
  check: {id: string; question: string; options: {id: string; text: string}[]}[]; // público, sin solución
};
type FoundationCheckKey = {questionId: string; correct: string; feedback: Record<string, string>}; // solo servidor
type BalloonState = {id: string; title: string; actions: string[]; owner: string; evidence: string; result?: string};
type FoundationChapter = {
  id: string; week: 1 | 2; number: number; title: string; opening: string; objectives: string[];
  cards: FoundationCard[]; teamCase: {step: string; who: string; what: string; evidence: string}[];
  diagrams: {id: string; title: string; svg: string; alternative: string; mermaidSource: string}[];
  balloons: {flowTitle: string; states: BalloonState[]};
  activity: unknown; // un tipo discriminado por cada interacción de 06 §4
  transfer: {prompt: string; rubric: string[]; template?: string};
  closing: {summary: string[]; glossary: {term: string; meaning: string}[]};
  sources: {id: string; title: string; url: string; version: string; consulted: string}[];
};
```

- La clave de respuestas (`FoundationCheckKey`) vive en un archivo que **no se expone** en el endpoint de lectura: el feedback se envía solo después de responder.
- `svg` se pregenera en el build con `mmdc`, se sanea (sin `<script>` ni `foreignObject`) y se muestra como imagen con `alt` o descripción enlazada.
- La descarga de la clase incluye el texto completo, la fuente Mermaid y la alternativa textual (AC-18).

## 3. Progreso (sin migración SQL)

El progreso es un documento serializado. Los campos nuevos son **aditivos y opcionales**.

| Campo nuevo | Contenido |
|---|---|
| `foundationCards` | `{ "<cardId>": true }`: lecturas verificadas de tarjetas v2 |
| `foundationChecks` | `{ "<questionId>": true }`: mejor resultado por pregunta (solo `true`) |

| Comando | Quién lo emite | Validación |
|---|---|---|
| `foundation-card-read {cardId}` | Rastreador de lectura | El ID debe existir en la v2 |
| *(ninguno del cliente para notas)* | — | El cliente **no** puede enviar `foundationChecks`: el esquema lo rechaza, igual que `grade` |
| `POST /me/foundation-checks/:questionId` `{optionId}` | Estudiante autenticado | El servidor corrige, devuelve el feedback y, si la respuesta es correcta y la tarjeta está leída, aplica `foundation-check-passed` internamente |

**Completitud (`automatic-completion.ts`):** para las semanas 1–2, `read` = todas las tarjetas de la semana leídas; `weeks` = `read` + 4 capítulos aprobados + práctica. El test del módulo y `lessonChecks` dejan de exigirse **solo para Fundamentos**.

**Compatibilidad (D-03):**

- `weeks` ya completadas se respetan. La regla actual recalcula `weeks`, así que la nueva regla debe tratar como completada cualquier semana 1–2 que estuviera completa **antes de la fecha de corte**. Se propone el campo `foundationLegacyComplete: [1,2]`, calculado una vez en la carga.
- `readingSections["1"|"2"]`, `lessonChecks`, `quizzes.fundamentos`, notas y evidencias se conservan sin modificarse.
- Fusión e importación: unión de `foundationCards`. `foundationChecks` **no se importa** desde invitados (06 §3.1).

## 4. Enlaces y navegación

| Antiguo | Nuevo |
|---|---|
| `/study/1#chapter-0..2` | `#FND-W01-C01` (redirección a la portada del capítulo equivalente según 02 §2: chapter-0 → C01, chapter-1 → C04, chapter-2 → C05; S2: chapter-0 → C03, chapter-1 → C02, chapter-2 → C02-T09) |
| `/study/1#chapter-3` (ejemplo guiado) | `#FND-W01-C01` con el aviso «El ejemplo guiado se sustituyó por el caso ReservaYa» |
| `#self-check` | Primer minitest pendiente de la semana |
| `/modules/fundamentos#module-quiz` | `/study/1#FND-W01-C01` (o el primer minitest pendiente) |
| `/modules/:otro#module-quiz` | Tarjeta «Test de cierre» de la última semana de ese módulo (D-10) |
| `?curriculum=legacy` / `current` (Codex) | Se ignoran y se eliminan con la reversión (§7) |

Además:

- `learning-navigation.ts`: los pasos de Fundamentos pasan a Lectura → Minitests → Práctica. En los demás módulos, el último paso pasa a ser el «Test de cierre».
- `prepare-learning-navigation.mjs`: genera los capítulos y tarjetas de Fundamentos desde la v2.

## 5. Vista de módulo en los 8 módulos y D-10

1. `module-detail.tsx`: se eliminan `module-summary`, el estado y `AskLia` de `module-guidance`, y `<Quiz>`. «Continuar» se mueve al encabezado de «CONTENIDO DE ESTUDIO» (06 §7.1).
2. Fundamentos: la lista de «CONTENIDO DE ESTUDIO» muestra 8 capítulos con su estado.
3. Otros 7 módulos (D-10): un componente `ClosingTest` en la página de estudio de su **última semana** reutiliza `quizzes[moduleId]`, el endpoint `/me/quizzes/:id/grade` y `QUIZ_PASS_PERCENT`. **Las reglas de completitud no cambian.**
4. `learning-tree.tsx`: se retiran la categoría «CONSOLIDA LO APRENDIDO» y los enlaces `#module-quiz`.

## 6. Pruebas: expectativas nuevas (no se borran para «poner verde»)

| Prueba actual | Expectativa TO-BE |
|---|---|
| `tests/reading-concepts.test.mjs` (48 tarjetas, `sections.length 3`) | Excluir las semanas 1–2 del conteo antiguo. Nueva `tests/foundation-v2.test.mjs`: 8 capítulos, 68 tarjetas, 69 preguntas, IDs únicos, cada pregunta con 1 clave y feedback por opción, 10 diagramas con alternativa, 28 estados de globo, fuentes con URL y fecha |
| `tests/automatic-progress.test.mjs:15` | La regla de las semanas 1–2 se basa en tarjetas y capítulos; las demás semanas siguen igual |
| `tests/content.test.mjs:15` | `sections.length >= 3` en las semanas 3–24; las semanas 1–2 validan la v2 |
| `tests/learning-navigation.test.mjs` | Hrefs `#FND-W01-C01`, minitests y la ausencia de `#module-quiz` en Fundamentos |
| `tests/learning-tree.test.mjs` | Fundamentos lista los capítulos v2 y no hay `CONSOLIDA` |
| `domain`, `identity-progress`, `progress-percentage` | `quizzes.fundamentos` se conserva como dato histórico. Los porcentajes de Fundamentos se calculan con la regla nueva |
| E2E con `/study/1` y `#self-check` (`academy`, `lesson-pagination`, `learning-ux`, `practice-progress`, `practical-exercises`, `reading-concepts`, `student-auth`, `admin`, `firebase-auth`) | Reescribir los recorridos de Fundamentos con tarjetas y minitests, y conservar las verificaciones de notas, sesión y MFA. Las comprobaciones de paginación antigua pasan a una semana de otro módulo (por ejemplo, la 3) |
| E2E `firebase-auth:41–46` (test del módulo `fundamentos`) | Aprobar los minitests de la semana 1 y verificar «Semana completada» |
| E2E `learning-tree-completion:12` (`manual#module-quiz`) | «Test de cierre» de la última semana de `manual` |
| **Nuevas** | `foundation-cards.spec.ts` (una tarjeta a la vez, 320 px), `foundation-checks.spec.ts` (sin respuestas en el payload, feedback, reintento, el aprobado exige lectura, el invitado no se importa), `foundation-balloons.spec.ts` (matriz de 06 §2 y AC-16), `module-view.spec.ts` (los 8 módulos sin resumen, MariBug ni test; con «Test de cierre» en 7), `foundation-legacy-progress.spec.ts` (fixture con las semanas 1–2 completas sigue completa; notas visibles) |

## 7. Retirada del código de Codex (D-11, lote L0)

Es un PR propio, previo a todo lo demás.

1. Eliminar: `libs/content/src/data/fundamentals-curriculum.json`, `scripts/generate-fundamentals-curriculum.mjs`, `libs/progress/src/domain/curriculum-reading.ts`, `apps/web/src/components/academy/fundamentals-experience.*`, `chapter-experience.*`, `lesson-study-legacy.tsx`, `apps/web/public/practice/templates/reservaya-plan-qa.md` (se rehace en L5), `tests/fundamentals-curriculum.test.mjs`, `apps/web/tests/e2e/fundamentals-curriculum.spec.ts`.
2. Revertir los hunks de Codex en: `progress.ts`, `progress-commands.ts`, `automatic-completion.ts`, `progress/index.ts`, `contracts/auth.ts`, `json-content.adapter.ts`, `postgres-progress.adapter.ts`, `learning-navigation.ts`, `learning-tree.tsx`, `prepare-learning-navigation.mjs`, `lesson-study.tsx`, `study/[week]/page.tsx`, `use-focused-reading.ts`, `use-study-navigation.ts`, `lesson-download.ts`, `reading-reference.tsx`, `content/index.ts`, `focused-study.tsx` (enlaces *legacy*) y las pruebas adaptadas el 2026-10-29.
3. **No tocar** el trabajo independiente de SPEC-UX-120 y SPEC-CONTENT-210 (00 §6). Revisar cada hunk, porque ambos comparten archivos como `lesson-study.tsx` y `focused-study.tsx`.
4. Criterio de salida: `pnpm check` en verde y la semana 1 igual que en HEAD más el trabajo de SPEC-UX-120.

## 8. Lotes de implementación (G4, uno por PR)

| Lote | Contenido | Depende de |
|---|---|---|
| L0 | Retirada del código de Codex | Aprobación de G3 |
| L1 | Esquema + `fundamentals-v2.json` con **C01** + clave de respuestas + `tests/foundation-v2.test.mjs` | L0 |
| L2 | Vista de tarjetas v2 + rastreador por tarjeta + minitests (endpoint y servidor) + regla de completitud con `foundationLegacyComplete` | L1 |
| L3 | Globos + diagramas SVG | L2 |
| L4 | Vista de módulo en 8 módulos + árbol + «Test de cierre» (D-10) | L2 |
| L5 | C02–C08 en lotes de dos capítulos + interacciones + plantillas | L3 |
| L6 | Retirar las secciones antiguas de las semanas 1–2 en `study-guides.json` y las redirecciones de hashes | L5 |

## 9. Validación (G5)

`pnpm check` · Playwright en Chromium y WebKit, en escritorio, 768 px y 320 px · prueba de lectura real con teclado y lector de pantalla (NVDA o VoiceOver) · fixture de progreso histórico · preview de Vercel revisada por el responsable antes de promover. Sin migraciones de PostgreSQL ni despliegues automáticos.

## 10. Reversión

- Cada lote se revierte con su PR (`git revert`).
- Los campos de progreso son aditivos: revertir el código no borra datos, y la regla antigua ignora los campos nuevos.
- Si se revierte L4, vuelve el test del módulo en la vista. Las notas obtenidas con «Test de cierre» siguen en `quizzes[moduleId]`, la misma clave.
