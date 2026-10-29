# W01-C01 · entrega local pendiente de validación

**Actualización posterior:** el usuario autorizó ejecutar pruebas. La validación local final está aprobada en la selección descrita en el [informe](W01-C01-validacion-local.md): 225 Node, 12 escenarios Chromium y 19 WebKit. También se sustituyó el globo extenso por listas breves numeradas. Los estados «pendiente» de esta entrega original se conservan como registro histórico, no como estado final de esos controles.

2026-10-28 · Aprobación: **«Todo W01-C01: ocho tarjetas y 24 fichas»**. Referencias: [acta](W01-C01-acta-implementacion-local.md), [propuesta editorial](W01-C01-propuesta-capitulo.md), [contrato de interacción](00-contrato-grafos-y-globos.md).

## Implementación

- Fuente curricular: únicamente `study-guides.json#/1/sections/0`. Ocho conceptos QA/QC/testing/error/defecto/fallo/verificación/validación, con sus títulos, IDs, orden y tres estados existentes. Cada estado tiene objetivo, 2–4 acciones, entrada, evidencia y participación; advertencia cuando corresponde. Caso narrativo separado de una ejecución real.
- Experiencia opcional de capítulo: decisión inicial con feedback, historia Scrum BT-14, cálculo independiente, conversación bajo demanda, bitácora E01–E04, dos grafos de relaciones con alternativa textual, tres decisiones formativas, transferencia a reservas, recuperación y glosario con fuentes.
- Renderizado de grafos en HTML/CSS; fuentes Mermaid conservadas en el documento editorial. Sin motor gráfico, scripts en contenido, HTML arbitrario ni dependencias nuevas.
- Globos no modales: foco, activación, hover diferido y una invitación tras scroll deliberado. Coordinación para uno solo, cierre con Escape/Cerrar, supresión de reapertura inmediata y retorno al invocador cuando el foco estaba dentro. Flecha abajo desde el invocador permite entrar a Cerrar sin recorrer todo el portal; no hay trampa de foco. La selección no cambia el hash. Posicionamiento lateral o en el espacio sobre/bajo el invocador, desplazamiento interno y controles de herramientas independientes. Pantallas extremas y navegación secuencial pendientes de validación.
- La consulta pausa temporalmente animación por CSS y atención de lectura; conserva reproducción/pausa manual. En movimiento reducido, los detalles siguen disponibles. La referencia D1 usa la misma estructura de estados, pasiva, sin montar controladores ni portales.
- El caso y la actividad están fuera de la región académica medida de ambos lectores. No llaman progreso, notas, IA ni red; la decisión formativa vive solo en memoria de UI. Abrir paneles no aprueba el candidato ni completa lectura.
- Descarga Markdown compartida ampliada con las fichas y todos los apoyos; alternativa `noscript` para los detalles. Sin datos opcionales o con arreglo inválido, se mantiene la secuencia anterior; diagnóstico de desarrollo sin datos del estudiante.

## Rutas

Tipos opcionales: `packages/contracts/src/index.ts`, `libs/learning/src/domain/models.ts`. Fuente: `libs/content/src/data/study-guides.json`.

Componentes: `apps/web/src/components/academy/{concept-demonstration,reading-concepts,lesson-study,lesson-study-legacy,focused-study,lesson-download}.tsx` (la descarga es `.ts`), nuevos `chapter-experience.tsx/.css`, `concept-step-details.tsx/.css`, `concept-details-fallback.tsx`.

Coordinación/validación opcional: `apps/web/src/features/study/{concept-detail-state,demonstration-details,use-concept-details}.ts`. Guardas de atención: `apps/web/src/features/progress/{use-focused-reading,use-reading-tracker}.ts`.

Se conservan los cambios UX-120 preexistentes en el árbol local. No se atribuye a este lote todo el diff de la rama. No se alteraron el ejemplo bancario posterior, prácticas, rúbricas, preguntas calificadas, API, base de datos, dependencias ni reglas de elegibilidad.

## Evidencia disponible y límites

Inspección de fuente y diff: los cambios del JSON se concentran en el bloque original de los ocho conceptos y la adición `experience` de la primera sección. La referencia pasiva solo recibe datos opcionales del mismo componente de vista; los portales y apoyos están fuera de sus árboles medidos. Las rutas existentes de descarga y progreso se conservan.

**No se ejecutaron tests, build, lint ni verificaciones de navegador de CONTENT-210**, conforme a la instrucción de realizarlas al final. Esta inspección no demuestra equivalencia D1, ausencia de regresiones, conformidad WCAG ni comprensión pedagógica. No se reutilizan resultados UX-120 anteriores como validación de este cambio.

Pendientes finales: correspondencia 24/24, fallback inválido y otros capítulos, exportación completa, teclado/toque/Escape/retorno de foco, prioridad y cancelación de invitaciones, pantallas pequeñas/zoom/reduced, lectura sin JS, ausencia de mutaciones académicas y equivalencia D1 con los controles de cola/ACK existentes. Ver [plan](00-plan-pruebas-contenido-y-ux.md). Sin commit, push, PR o despliegue de este lote.

## Acceso local para revisión cuando corresponda

`/study/1?view=focused#chapter-0--intro`: bloques de caso y actividad. Las ocho tarjetas siguientes conservan su navegación; sus estados abren las fichas. `/study/1#chapter-0`: vista por capítulos con los mismos apoyos. Ninguna ruta se ha declarado probada en esta entrega.

## Seguimiento: el usuario no veía cambios

2026-10-28. El endpoint local aún devolvía el texto QC anterior y no incluía `experience`: `@qapath/content` carga `dist/index.js`, no el JSON fuente editado. Para hacer visible el lote aprobado se compilaron únicamente `@qapath/contracts`, `@qapath/learning` y `@qapath/content` (las tres compilaciones finalizaron correctamente) y se reinició la API local de este repositorio en el puerto 4000 usando `apps/api/.env`. No se cambiaron fuentes ni configuración por esta corrección operativa.

La pestaña existente de QC en 3012 mostró después el nuevo texto, el contraejemplo y los tres botones de estado con acciones/evidencias. Captura local: `C:/Users/ingcr/.codex/visualizations/2026/10/24/01a16b4f-61a0-7942-86a7-5e0a94117322/w01-c01-qc-visible.png`. Esta comprobación de visibilidad responde al aviso del usuario; no es la suite final ni valida D1, teclado, accesibilidad o regresiones. Estas pruebas continúan diferidas.
