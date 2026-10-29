# Estudio enfocado — evidencia AS-IS

Estado: análisis documental; no autoriza implementación. Fecha local: 26 de octubre de 2026.

Base: `5dcbdf45b5b21b43d8f99ae01e0e62dbaa6c60c2`, rama `codex/fix-ci-lint`. Evidencia obtenida mediante lectura de fuentes, inventario JSON y pruebas existentes; no mediante una sesión de navegador ni ejecución de pruebas en esta tarea. Las capturas aportadas son referencias conceptuales, no prueba del comportamiento de este SHA.

## Alcance y fuentes

Se aplica `docs/specs/SPEC-UX-120-modo-estudio-enfocado-to-be.md`, propuesta 1.0.0. No se localizaron archivos SPEC-UX-001 ni SPEC-UX-100 en `docs/`; quedan pendientes como antecedentes, sin inventar sus conclusiones. Los cinco documentos de esta carpeta forman una propuesta complementaria, no una aprobación de esa SPEC.

| Evidencia verificable | Comportamiento observado | Implicación de diseño |
|---|---|---|
| `apps/web/src/app/study/[week]/page.tsx`, `LessonStudy` | Carga dinámica por semana; validación numérica; 404/422 llevan a notFound | Mantener rutas, errores y carga desde API |
| `apps/web/src/components/academy/lesson-study.tsx:20`, `LessonStudy` | Paginación por capítulos; resumen permanente; secciones hermanas montadas con `hidden` | Una tarjeta montada requiere cambiar la propiedad del estado antes de desmontar |
| Mismo archivo:25, `chapters` | Secciones, ejemplo guiado, ejercicio condicional, autoevaluación, notas y recursos | No limitar el nuevo recorrido a conceptos |
| Mismo archivo:29, `download` | Markdown completo, ejemplos, código y contenido adicional; no solo apartado activo | Conservar salida y nombre del archivo |
| `apps/web/src/components/academy/reading-concepts.tsx`, `ReadingConcepts` | Cada concepto incluye descripción, ejemplo y demostración opcionales | Mantenerlos juntos en la tarjeta correspondiente |
| `apps/web/src/components/academy/concept-demonstration.tsx`, `ConceptDemonstration` | Estados idle/playing/paused/done, observación de visibilidad, pausa manual y movimiento reducido | Desmontar pierde estado local; un modal debe suspender la reproducción explícitamente |
| `apps/web/src/features/progress/use-lesson-pagination.ts`, `go` | Hash, historial, apertura de disclosures y foco; sin reanudación persistente por tarjeta | Resolver hash antes de montar; no consultar un destino DOM inexistente |
| `apps/web/src/features/progress/use-reading-tracker.ts:23` | Observa las secciones existentes al iniciar el efecto | Observar de nuevo el nodo activo tras cada montaje |
| Mismo archivo:27–38; `reading-coverage.ts` | Tiempo atento y cobertura física, sin crédito con documento oculto, sin foco o `dialog[open]` | No sustituir por número de clics o tarjetas visitadas |
| `libs/progress/src/domain/automatic-completion.ts:5` | `READING_SECTION_SECONDS=3` | Mantener umbral por sección académica |
| `apps/web/src/features/progress/progress-provider.tsx`, `SessionProgressProvider` | Cola de guardados, reintentos, estados por acción, identidad; notas con debounce de 650 ms | Mantener proveedor y contrato; un fallo de red no debe borrar el texto |
| Mismo archivo, `flushNote` | Retorno void; inicia guardado asíncrono | Invocarlo no demuestra persistencia confirmada |
| `apps/web/src/components/academy/learning-steps.tsx`; `features/progress/learning-navigation.ts` | Lectura, práctica, autoevaluación y test del módulo según logro real | Distinguir etapas académicas de posición en tarjetas |
| `apps/web/src/components/academy/practical-exercise.tsx` | Presenta objetivo, recursos y enlaces a `/practice/{week}` y kit | No trasladar el laboratorio ni sus evidencias al estudio |
| `apps/web/src/app/layout.tsx` | Sidebar y ProgressProvider; QaAssistant bajo AuthProvider, fuera de ProgressProvider | No reinstanciar el asistente por tarjeta ni cambiar sus permisos |
| `apps/web/src/components/layout/sidebar.tsx`; `learning-tree.tsx` | Rutas, árbol, cuenta, ADMIN, progreso y diálogo móvil propio | Reutilizar contenido de navegación, evitando diálogos anidados |
| `apps/web/src/components/assistant/ask-lia.tsx`, `ASK_LIA_EVENT` | Prepara pregunta contextual sin POST automático | Contextualizar con concepto activo |
| `apps/web/src/components/assistant/qa-assistant.tsx` | Historial, borrador, petición abortable, archivo/restauración y maximización; evento contextual sustituye draft | Apertura debe proteger texto previo y petición en curso |
| Mismo archivo:63, `close` | Cierra, restaura tamaño y foco; no desmonta el controlador de conversación | Conservar controlador único al cambiar presentación |
| `apps/web/src/app/globals.css`; `learning-ux.css` | Tema oscuro; sidebar fija, panel auxiliar y barras móviles; estilos sucesivos | Cambiar únicamente layout de estudio, con espacio reservado para la nueva barra |

## Inventario de contenido y estado

`libs/content/src/data/study-guides.json` contiene 24 guías. Los ejercicios no están incrustados en ese JSON: `apps/api/src/infrastructure/adapters/json-content.adapter.ts`, método `guide`, incorpora `libs/content/src/data/practical-exercises.json`. No confundir ausencia del campo bruto con ausencia del ejercicio en pantalla. El inventario detallado y las reglas de partición están en [step-mapping](study-focused-step-mapping.md).

`guide.example.concepts` sustituye visualmente a `example.steps` cuando existe. Descargar clase usa la misma alternativa. `activity` y `answer` se incluyen en la descarga actual; no corresponde convertirlos automáticamente en nuevas pantallas obligatorias. Notas, pregunta y recursos tienen pasos propios; el cierre incluye estado de semana, test y siguiente semana cuando existe.

| Estado actual | Propietario | Preservación requerida |
|---|---|---|
| Respuesta elegida y feedback | `LessonStudy.selected` + comando `lesson-answer` | Elección en sesión por semana; logro solo del proveedor |
| Notas, guardado y reintentos | ProgressProvider | Conservar misma instancia y estados; no duplicar notas en otra fuente |
| Demostración y pausa manual | ConceptDemonstration | Caché de sesión por identidad/semana/concepto; no activar efectos inactivos |
| Borrador, historial, archivo, envío de chat | AssistantChat | Controlador único persistente; no abortar por cerrar modal |
| Apartado activo | Hook de paginación / URL | Añadir IDs finos compatibles; historial sin bucles |
| Expansión del árbol, scroll, foco | DOM y componentes de navegación | Preservar al cerrar y reabrir modal |

## Línea base de lectura

La unidad académica es el índice entero de sección, incluyendo el ejemplo guiado. El rastreador acumula tiempo visible y rangos físicos normalizados del capítulo; exige al menos 80 % de cobertura y alcanzar el 98 % final, además de 3 segundos atentos. Muestrea cada 250 ms con delta limitado a 500 ms. Una transición de tarjeta no puede producir `reading-section` por sí sola. La regla de equivalencia propuesta sigue pendiente de caracterización: véase [riesgos R1](study-focused-risks.md).

Las notas autenticadas fallidas permanecen en memoria y en los reintentos mientras vive la sesión; no hay evidencia de recuperación automática de ese borrador después de recarga dura sin conexión. No se promete esa capacidad nueva como si ya existiera.

## Pruebas existentes consultadas

- `apps/web/tests/e2e/lesson-pagination.spec.ts`: límites, enlaces directos, historial, notas y selección al paginar, anchura móvil y capítulos ocultos sin crédito.
- `apps/web/tests/e2e/reading-concepts.spec.ts`: ejemplos, secuencias, descarga avanzada, animación/pausa, movimiento reducido y capítulo largo en móvil.
- `apps/web/tests/e2e/qa-history.spec.ts`: conversación tras recarga, archivo/restauración y separación de cuentas.
- `tests/reading-coverage.test.mjs` y `tests/reading-concepts.test.mjs`: referencias para cobertura y contenido.

Existencia de pruebas no significa que hayan pasado en esta tarea. Los nuevos casos están propuestos en [test-matrix](study-focused-test-matrix.md).

## Control de alcance

Antes de escribir: únicamente estaba sin seguimiento la SPEC de entrada. Se registró una huella SHA-256 agregada de 623 archivos existentes fuera de `docs/specs/ux/`: `4f8afa7f969e13605e145692488bfd79b2ca9c371b2e4c01679a30e9571858dc`. Incluye rutas y hashes de contenido; excluye archivos ignorados, secretos y extensiones de claves. La verificación final debe repetir exactamente este conjunto y comprobar que solo aparezcan los cinco Markdown nuevos. No se ejecutaron builds, migraciones, instalaciones, commits ni despliegues.

Verificación de cierre realizada: mismo HEAD, mismos 623 archivos y misma huella externa. El estado de Git solo añade los cinco documentos solicitados a la SPEC de entrada que ya estaba sin seguimiento. Se comprobaron los enlaces Markdown entre entregables. No se modificó la SPEC de entrada ni archivos de aplicación. Esta comprobación no cubre archivos ignorados/secretos ni constituye una validación funcional o de producción.
