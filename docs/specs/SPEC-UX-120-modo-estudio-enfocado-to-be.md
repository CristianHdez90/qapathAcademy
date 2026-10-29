# SPEC-UX-120 — Modo de estudio enfocado: una tarjeta por pantalla

> **Producto:** QAPath Academy  
> **Tipo:** Especificación UX/UI **TO-BE** — Spec-Driven Development  
> **Estado:** **IMPLEMENTACIÓN LOCAL APROBADA · PILOTO EN VALIDACIÓN**  
> **Versión del SPEC:** 1.0.0  
> **Alcance inicial:** `/study/[week]` (vista de estudio de cada semana)  
> **Referencias:** `SPEC-UX-001` (auditoría AS-IS), `SPEC-UX-100` (mejora UX TO-BE), `SPEC-000` (ingeniería inversa AS-IS)  
> **Repositorio:** `CristianHdez90/qapathAcademy` — examinar el `HEAD` local al ejecutar; no suponer que coincide con una captura o revisión anterior.  
> **Principio rector:** **una unidad de aprendizaje visible a la vez; ninguna pérdida funcional o de progreso.**

## 01. Intención

**Aprobación registrada · 27 de octubre de 2026:** el propietario indicó «esta bien aprobado para implementar» después de revisar el diseño/prototipo y la documentación D1. Autoriza implementar en local el alcance `/study/[week]`; no constituye evidencia de equivalencia geométrica, aprobación de una modificación de dominio ni autorización de despliegue en producción. El piloto permanece optativo hasta cerrar las pruebas D1 y las puertas de liberación. Véase [registro de implementación local](ux/study-focused-implementation.md).

**Checkpoint D1 · 28 de octubre de 2026:** implementado y validado localmente para el catálogo actual, con referencia pasiva y correspondencia de regiones/líneas; 86 casos D1 y 16 de regresión de experiencia satisfactorios en Chromium/WebKit. `pnpm.cmd check` satisfactorio: 219 pruebas Node, tipos, lint y build. Véanse [evidencia, compromiso visual y límites de D1](ux/study-focused-d1-validation.md). El modo sigue optativo; esto no cierra las puertas de accesibilidad integral, QA real, Preview ni aprobación de producción.

Transformar la experiencia de lectura de QAPath Academy en un **modo de estudio enfocado e inmersivo** que ayude al estudiante a concentrarse en un concepto cada vez.

Actualmente, según la pantalla aportada y los componentes revisados, se visualizan en una misma sección varias tarjetas de conceptos (por ejemplo, **QA** y **QC**), además de una barra lateral global, el índice **«En esta clase»** y la ayuda contextual de **MariBug**. Aunque ya existe paginación entre apartados, **no se pagina cada tarjeta de concepto individualmente**.

El resultado deseado es:

1. Presentar **una sola tarjeta de estudio activa** y permitir avanzar o retroceder **tarjeta a tarjeta** hasta llegar al final de la clase.
2. Dar al contenido principal el **espacio útil de la ventana**, eliminando columnas laterales permanentes *solo en el modo de estudio*.
3. Convertir **Menú**, **En esta clase** y **Aliada de estudio** en **controles flotantes discretos**, cada uno con un **diálogo modal centrado** sobre una capa que oscurece y bloquea temporalmente el fondo.
4. Preservar íntegramente los objetivos pedagógicos, ejemplos, demostraciones, actividades, autoevaluación, notas, guardado, progreso, sesiones e integraciones existentes.
5. Mantener una interfaz adaptativa, legible y accesible para teclado, lectores de pantalla y dispositivos móviles.

**Resultado observable:** al entrar en `/study/1`, un estudiante lee un concepto a la vez, ve claramente su posición en la secuencia y puede consultar navegación o asistencia sin perder su lugar.

## 02. Comportamiento

### 2.1. Línea base AS-IS y evidencia a verificar

| Elemento actual | Evidencia en el código | Implicación TO-BE |
|---|---|---|
| Página de semana | `apps/web/src/app/study/[week]/page.tsx` | Conservar ruta, carga SSR/API y manejo de errores. |
| Composición de estudio | `apps/web/src/components/academy/lesson-study.tsx` | Reorganizar **presentación**, sin sustituir casos de uso ni contratos. |
| Paginación entre apartados | `apps/web/src/components/academy/lesson-pagination.tsx` y `apps/web/src/features/progress/use-lesson-pagination.ts` | Extender la secuencia a unidades individuales y preservar historial/hash. |
| Varias tarjetas por capítulo | `apps/web/src/components/academy/reading-concepts.tsx` realiza un `map` de conceptos | La vista enfocada debe montar/presentar **solo el concepto activo**. |
| Menú lateral y árbol | `apps/web/src/components/layout/sidebar.tsx` | Ocultar barra permanente en `/study/[week]` y exponer su contenido en modal. |
| «En esta clase» y MariBug | `lesson-study.tsx`, `apps/web/src/components/assistant/ask-lia.tsx` y `qa-assistant.tsx` | Mover sus puntos de entrada a controles flotantes sin perder acciones ni contexto. |
| Registro de lectura | `apps/web/src/features/progress/use-reading-tracker.ts` | Adaptar medición al nuevo patrón sin otorgar progreso por simple navegación. |
| Guardado y ejercicios | `progress-provider`, `LearningDisclosure`, `SaveFeedback`, componentes de ejercicios | Proteger valores, intentos, errores y persistencia. |
| Pruebas UX existentes | `apps/web/tests/e2e/learning-ux.spec.ts` | Conservarlas/adaptarlas y añadir escenarios de regresión. |

**Regla de evidencia:** antes de implementar, Codex debe volver a inspeccionar el código y registrar la revisión Git exacta. Esta tabla es un punto de partida, no una afirmación de que las rutas o implementaciones nunca cambien.

### 2.2. Unidad de paginación: tarjeta individual

**REQ-UX-120-01 — Una unidad visible.** La clase se representa mediante una secuencia ordenada de `StudyStep` derivada del contenido ya disponible. Cada paso presenta **una unidad pedagógica principal**:

- Introducción del capítulo, cuando tenga texto instructivo independiente.
- **Cada tarjeta `ReadingConcept` por separado**, incluyendo su definición, ejemplo y demostración; no mostrar tarjetas hermanas juntas.
- Contenido complementario o puntos clave, cuando corresponda, sin omitirlo.
- Práctica guiada y, si existe, ejercicio práctico.
- Autoevaluación, notas, recursos y estado de cierre de la semana, respetando el flujo actual.

La secuencia debe ser **determinista** a partir del orden de `guide.sections`, `section.concepts`, `guide.example`, `guide.exercise` y las actividades existentes. No inventar conceptos ni alterar su orden sin aprobación pedagógica. El número total de pasos puede variar por semana.

**REQ-UX-120-02 — Renderizado enfocado.** En el área principal solo se monta/renderiza el contenido interactivo de **un `StudyStep` a la vez**. No es suficiente ocultar visualmente veinte tarjetas mediante CSS manteniendo animaciones, controles y lectores de pantalla expuestos. Se admite precargar datos necesarios, pero no activar efectos ni medios de tarjetas inactivas. Componentes que deban conservar borradores deben mantener su estado mediante el proveedor actual o una estrategia comprobada antes de desmontarse.

**REQ-UX-120-03 — Controles de avance.** Mostrar **«Anterior»**, **«Siguiente»**, contador accesible (`Tarjeta 3 de 12`) y nombre breve de la unidad. El botón anterior se deshabilita al inicio. En la última unidad, sustituir «Siguiente» por una acción clara de **final de recorrido** que no marque artificialmente completadas tareas o evaluaciones.

**REQ-UX-120-04 — Desplazamiento.** Si una tarjeta contiene una demostración extensa, la tarjeta o su contenido puede desplazarse verticalmente; **no cortar el contenido para forzar que quepa en una sola altura**. Al cambiar de paso, anunciar el título y restituir foco/posición de lectura apropiados; respetar zoom y preferencias de movimiento reducido.

**REQ-UX-120-05 — Retomar y enlaces.** Conservar enlaces y anclas existentes (`#chapter-0`, `#self-check`, `#study-notes`, `#practical-exercise`, etc.) mediante un mapa explícito de compatibilidad hacia el nuevo paso. La navegación «Atrás/Adelante» del navegador debe mantener el paso correcto. Restaurar la última unidad visitada por semana únicamente si no existe un enlace directo que tenga prioridad. No persistir datos personales ni secretos en la URL.

**REQ-UX-120-06 — Sin bloqueo pedagógico accidental.** Permitir revisar tarjetas anteriores y acceder desde «En esta clase» a un apartado concreto. La recomendación es navegación libre: **visualizar una tarjeta no equivale a completarla**. No exigir marcar cada tarjeta mediante clic ni bloquear actividades que hoy son accesibles, salvo nueva especificación pedagógica aprobada.

### 2.3. Diseño inmersivo y aprovechamiento de pantalla

**REQ-UX-120-07 — Layout de estudio.** Solo para rutas `/study/[week]`, reemplazar el layout permanente de tres columnas (menú + contenido + panel auxiliar) por un **lienzo de aprendizaje principal**, con lectura centrada. Utilizar la anchura disponible del viewport, pero limitar el ancho de texto a una medida legible (aprox. 65–85 caracteres por línea); ejemplos, diagramas y tarjetas podrán usar mayor ancho.

**REQ-UX-120-08 — Barra de estudio compacta.** Mantener en una franja discreta el nombre de la semana, título de la unidad actual, progreso **de navegación** (no de logro), acceso para salir a módulos y el acceso a «Descargar clase». No reemplazar ni mezclar el porcentaje académico real con el contador de tarjetas.

**REQ-UX-120-09 — Controles flotantes.** Mostrar tres botones accesibles y agrupados, sin tapar contenido ni colisionar con la navegación inferior:

1. **Menú de la plataforma** — abre el árbol de módulos, las rutas globales y la cuenta correspondiente al rol.
2. **En esta clase** — abre un índice de capítulos/unidades, con la tarjeta actual destacada; permite ir directamente a una unidad.
3. **Aliada de estudio (MariBug)** — abre acceso al asistente con la semana y **el tema actualmente visible**, sin enviar mensajes automáticamente.

En móvil el grupo puede compactarse en una barra flotante o menú de acciones; los tres accesos deben seguir visibles o alcanzables en un único paso. Evitar duplicar simultáneamente el lanzador global de MariBug y el lanzador contextual del modo de estudio.

### 2.4. Diálogos modales centrados

**REQ-UX-120-10 — Interacción uniforme.** Al activar uno de los tres botones:

- Abrir **un solo diálogo centrado**, con título claro y acción de cerrar; tamaño máximo adaptable y desplazamiento **dentro del modal** si su contenido excede la pantalla.
- Dibujar un **backdrop oscuro o semitransparente** que atenúe la tarjeta de fondo y evite interacción accidental con ella.
- Gestionar foco: moverlo al diálogo, mantenerlo en él mientras está abierto y devolverlo al botón iniciador al cerrar.
- Permitir cerrar con **Escape** y botón «Cerrar»; clicar fuera puede cerrar si no hay riesgo de perder contenido no guardado.
- Bloquear el desplazamiento de fondo mientras el modal está activo, sin ocultar/descartar el estado de la tarjeta.
- Mantener la unidad de estudio exactamente donde estaba al cerrar.
- Utilizar semántica real de `<dialog>` o equivalente accesible (`role="dialog"`, `aria-modal="true"`, nombre accesible, gestión de foco y fondo inerte). No depender solo de `z-index` y opacidad.

**REQ-UX-120-11 — Exclusión mutua.** Solo uno de los tres diálogos puede estar abierto a la vez. Evitar diálogos anidados o conflicto con el chat global, el árbol móvil existente y los ejercicios que ya usan overlays. Definir una política de prioridad y de cierre antes de implementar.

**REQ-UX-120-12 — MariBug.** Reutilizar el flujo actual de `ASK_LIA_EVENT` y el asistente existente. Si ya había texto escrito, historial o una petición en curso, la apertura/cierre del modal no debe borrar el borrador ni duplicar envíos; el usuario decide si enviar la pregunta. Mantener los controles de sesión y permisos.

### 2.5. Progreso, semántica de lectura y preservación del estado

**REQ-UX-120-13 — Progreso académico intacto.** La paginación por tarjetas **no debe modificar arbitrariamente** la semántica de `reading-section`, `lesson-answer`, finalización de semana, notas o calificaciones. El rastreador actual combina tiempo visible y cobertura de lectura del capítulo; al fragmentar en tarjetas se debe especificar cómo se suma cobertura real de sus unidades y cuándo se registra una sección existente. No marcar un capítulo como leído al pulsar «Siguiente» ni al abrir el índice.

**REQ-UX-120-14 — Borradores y persistencia.** Navegar entre tarjetas o abrir modales no debe eliminar respuestas de autoevaluación, notas sin sincronizar, selecciones ni resultados de ejercicios. Antes de abandonar una tarjeta con cambios pendientes, coordinar `flushNote` / persistencia actual; ante fallo mostrar un aviso recuperable sin hacer perder los datos escritos.

**REQ-UX-120-15 — Compatibilidad.** Mantener contratos de API, rutas, identidad, permisos, ejercicios, posibilidad de descargar clase, accesibilidad de recursos y lógica académica actual. Cualquier necesidad real de cambiar `@qapath/progress` o una migración deberá producir una **SPEC independiente**, aprobarse y contar con pruebas de compatibilidad antes de tocar esos paquetes.

### 2.6. Experiencia y sistema de diseño para Figma

Diseñar primero los estados en Figma con **Auto Layout**, variables semánticas, componentes reutilizables y variantes. Respetar el sistema visual existente de QAPath Academy (tema oscuro, acento turquesa) sin imponer una identidad de marca nueva:

| Componente propuesto | Estados/variantes mínimos |
|---|---|
| `FocusedStudyShell` | escritorio, tableta, móvil; con/sin diálogo |
| `StudyCard` | introducción, concepto, ejemplo, práctica, evaluación, notas, recursos; corta/larga |
| `StudyStepper` | inicio, intermedia, final, pendiente/error de guardado |
| `FloatingStudyTools` | normal, foco de teclado, activo, móvil |
| `StudyModal` | menú, índice, MariBug; vacío, cargando, error y contenido largo |
| `StudyProgressIndicator` | navegación y logro diferenciados |

**Frames de referencia:** 1440×900, 1024×768, 768×1024, 390×844 y 320×700; también validar reflujo, zoom del 200 % y texto ampliado. Los tokens de color/espaciado/tipografía serán propuestas, no valores definitivos hasta revisar la auditoría AS-IS. Ofrecer prototipo clickable para flujo completo y estados de modal antes de implementar.

### 2.7. Criterios de aceptación verificables

| ID | Dado / Cuando / Entonces | Evidencia |
|---|---|---|
| **CA-01** | **Dado** un capítulo con 3 conceptos, **cuando** entro, **entonces** solo se muestra/monta la unidad actual; las otras 2 no aparecen simultáneamente ni reproducen animaciones. | Playwright, DOM y captura. |
| **CA-02** | **Cuando** pulso «Siguiente» sucesivamente, **entonces** observo las tarjetas en orden y llego a práctica/evaluación/notas/recursos sin saltos ni pérdida de contenido. | E2E para semanas con distinto contenido. |
| **CA-03** | **Dado** el primer/último paso, **entonces** «Anterior» se deshabilita al inicio y la última acción indica claramente el fin de la clase. | E2E accesible. |
| **CA-04** | **Cuando** abro Menú, **entonces** el menú se centra en un modal, oscurece el fondo y conserva rutas/roles anteriores. | E2E desktop y móvil. |
| **CA-05** | **Cuando** abro «En esta clase», **entonces** veo el índice, identifico el paso actual y salto a uno específico sin completar automáticamente nada. | E2E navegación + estado académico. |
| **CA-06** | **Cuando** abro MariBug, **entonces** el contexto corresponde a la tarjeta visible, la pregunta se prepara pero no se envía hasta mi acción. | E2E con API simulada. |
| **CA-07** | **Cuando** un modal está abierto, **entonces** `Tab` permanece dentro, `Escape` cierra, el fondo no responde y el foco regresa al disparador. | E2E teclado/a11y. |
| **CA-08** | **Cuando** navego adelante/atrás del navegador o abro `#self-check`/`#practical-exercise`, **entonces** el paso correcto es visible. | E2E compatibilidad hash. |
| **CA-09** | **Cuando** abandono notas sin conexión y vuelvo, **entonces** el contenido no se pierde y existe opción de reintento. | E2E con error de red. |
| **CA-10** | **Cuando** recorro tarjetas sin leerlas, **entonces** no se registra artificialmente la sección como leída; al cumplir las reglas actuales de exposición, sí se registra. | Tests del rastreador + E2E. |
| **CA-11** | **En** 320, 390, 768, 1024 y 1440 px, **entonces** no existe scroll horizontal no intencional, los controles no se superponen y el contenido sigue legible. | Playwright viewport/screenshot. |
| **CA-12** | **Dado** un usuario autenticado, **cuando** cambia de tarjetas, cierra sesión y vuelve a entrar, **entonces** conserva el progreso y las notas según las reglas existentes. | E2E de persistencia en entorno de QA. |
| **CA-13** | **Cuando** ejecuto la suite de regresión, **entonces** continúan funcionando módulos, ejercicios, calificaciones, descargas, autorización y asistente. | `pnpm check` + E2E focalizado. |
| **CA-14** | **Dado** un lector de pantalla o modo movimiento reducido, **entonces** títulos, contador, navegación, diálogo y demostraciones son comprensibles y operables. | Auditoría WCAG 2.2 AA y pruebas manuales. |

### 2.8. Implementación propuesta por etapas (solo después de aprobar)

1. **Diseño / G0:** aprobar este SPEC, inventario exacto AS-IS y prototipo Figma con flujo de principio a fin.
2. **Modelo / G1:** diseñar `StudyStep` y mapeo de anclas **sin cambiar DTO/API**; crear pruebas de orden y ausencia de pérdida de unidades.
3. **Paginación / G2:** migrar una semana piloto a una tarjeta por paso; adaptar lectura y pruebas; conservar la navegación antigua como vía de retroceso durante QA.
4. **Layout / G3:** implementar `FocusedStudyShell` aislado a `/study/[week]`; barra y controles flotantes sin afectar `/modules`, `/practice`, `/admin` u otras rutas.
5. **Modales / G4:** integrar Menú, índice y MariBug con exclusión mutua, semántica y foco correctos.
6. **Regresión / G5:** ejecutar unitarias, arquitectura, lint, typecheck, build, Playwright desktop/móvil, accesibilidad y persistencia.
7. **Liberación / G6:** probar en Preview de Vercel, revisar capturas antes/después, obtener aprobación humana y desplegar con plan de reversión.

### 2.9. Métricas UX propuestas (no afirmaciones del estado actual)

- **Visibilidad:** exactamente una unidad pedagógica principal por paso.
- **Continuidad:** 100 % de conceptos y actividades existentes accesibles en orden.
- **Accesibilidad:** objetivo WCAG 2.2 **AA**, evaluado mediante herramientas y pruebas manuales.
- **Navegación:** llegar a cualquier capítulo con un único modal de índice, sin perder contexto.
- **Calidad:** 0 regresiones de progreso, MFA, rol, guardado y funciones evaluativas atribuibles al cambio.
- **Rendimiento:** no iniciar efectos, vídeos o animaciones de tarjetas inactivas; medir rendimiento antes/después, no inventar mejoras numéricas.

## 03. Restricciones

1. **APROBACIÓN OBLIGATORIA:** este SPEC es una propuesta TO-BE. Codex puede **analizar y documentar**, pero **NO modificar código** ni publicar cambios hasta que el propietario apruebe explícitamente la implementación de `SPEC-UX-120` o sus tareas individuales.
2. **No alterar el dominio:** preservar Clean Architecture + Hexagonal + DDD. La solución debe concentrarse en presentación/estado UI; cualquier cambio de dominio requiere otra SPEC.
3. **No perder contenido:** todas las definiciones, ejemplos, diagramas, animaciones, ejercicios, cuestionarios, notas y recursos actuales deben seguir disponibles.
4. **No degradar aprendizaje:** el simple avance de página no es una señal de lectura completada. Respetar las reglas de exposición/tiempo actuales o especificar una equivalencia verificable.
5. **No perder estado:** las operaciones de guardado remoto/local, sincronización, recuperación de errores y login/logout deben continuar.
6. **Rutas compatibles:** no romper enlaces compartidos, hashes internos, navegación del árbol, botones de continuación ni bookmarks existentes.
7. **Accesibilidad primero:** teclado, lectores de pantalla, foco visible, buen contraste, objetivos táctiles adecuados, reflujo y movimiento reducido. Modal centrado no significa modal inaccesible.
8. **Responsive real:** sin solapamiento por notch, teclado virtual, barras del sistema, orientación o zoom; sin cortar contenido largo.
9. **No duplicar asistencia:** conservar MariBug y su flujo de autorización y datos; no crear otra instancia de chat que envíe solicitudes duplicadas.
10. **Sin cambios de infraestructura:** no modificar backend NestJS, PostgreSQL, Firebase, Vercel, variables privadas, dependencias ni migraciones salvo necesidad comprobada y aprobación en SPEC independiente.
11. **No trabajar directamente en producción:** implementar y validar en rama/PR y Preview; promover a `main` solo después de pruebas y revisión.
12. **Privacidad:** no incluir correos, tokens, sesiones, prompts privados ni datos reales en archivos de diseño, capturas o tests.
13. **Trazabilidad:** cada cambio implementado debe vincularse al `REQ` y `CA` correspondiente; registrar desviaciones y decisiones de diseño mediante documentación.

## 04. No-Objetivos

- No cambiar el contenido curricular ni reescribir conceptos de QA, QC o testing.
- No modificar la cantidad de módulos, semanas, actividades, calificaciones o reglas de aprobación.
- No crear rutas nuevas obligatorias para completar cursos ni bloquear apartados que hoy son accesibles.
- No rediseñar globalmente todas las páginas (`/admin`, `/account`, `/modules`, etc.) en esta iteración.
- No añadir un nuevo proveedor de IA, una nueva base de datos o un nuevo sistema de autenticación.
- No reescribir los casos de uso, contratos API ni persistencia solo para conseguir un efecto visual.
- No registrar progreso académico por pulsar «Siguiente» ni por abrir un modal.
- No obligar a utilizar pantalla completa del navegador (`Fullscreen API`): el objetivo es aprovechar el viewport disponible, no tomar control de la ventana.
- No eliminar definitivamente la navegación, el árbol de la ruta o MariBug: se **reubican**, conservando sus capacidades.
- No implementar ni desplegar automáticamente el TO-BE por el solo hecho de aprobar su documentación.

---

## 05. Entregables antes de programar

Dentro de `docs/specs/ux/`, Codex deberá preparar **solo Markdown** hasta recibir autorización:

1. `study-focused-as-is-evidence.md`: inventario de tarjetas/capítulos, rutas, anclas, progreso, componentes y pruebas, con rutas de archivo y SHA.
2. `study-focused-step-mapping.md`: tabla completa de cada tipo de `StudyStep` y mapeo de IDs/hash antiguo → nuevo.
3. `study-focused-figma-handoff.md`: especificación de Auto Layout, tokens, variantes, estados, modales, accesibilidad y enlaces a prototipos si están disponibles.
4. `study-focused-test-matrix.md`: trazabilidad REQ ↔ CA ↔ test y criterios de regresión de persistencia/lectura.
5. `study-focused-risks.md`: riesgos, mitigaciones, plan de rollback y decisiones pendientes de aprobación.

**No afirmar que los archivos de Figma, pruebas o implementación existen hasta que se creen y validen.**

## 06. Instrucción lista para Codex — etapa de análisis y diseño

> Lee `docs/specs/SPEC-UX-120-modo-estudio-enfocado-to-be.md` y los SPEC UX AS-IS / TO-BE previos. Audita el comportamiento actual de `/study/[week]` a partir del código real y el SHA de `HEAD`. Diseña la nueva experiencia «una tarjeta de concepto por paso», con menú global, índice «En esta clase» y MariBug en tres accesos flotantes que abren diálogos modales centrados, con backdrop. Preserva lectura, progreso, enlaces, evaluaciones, notas y accesibilidad. Genera únicamente los cinco entregables Markdown en `docs/specs/ux/`. **No modifiques ningún archivo de aplicación, pruebas, dependencias o infraestructura. No implementes ni hagas commit/deploy hasta mi aprobación explícita.** Señala riesgos y decisiones no resueltas sin asumirlas.

## 07. Decisiones que requieren aprobación antes de implementar

| Decisión | Propuesta por defecto | Responsable |
|---|---|---|
| Alcance | Solo `/study/[week]` | Propietario de producto |
| Una tarjeta | Cada `ReadingConcept` es un paso propio; el texto introductorio se conserva | UX + propietario |
| Navegación | Libre entre pasos; leer no implica completar | QA + propietario |
| Distribución flotante | Tres iconos accesibles, sin tapar contenido | UX / Figma |
| Modal | Centrado, backdrop, foco contenido, Escape y cierre | UX / accesibilidad |
| Lectura registrada | Equivalencia verificable con criterio vigente, sin falsos completados | QA + ingeniería |
| Rollout | Semana piloto → E2E → Preview → resto de semanas | Ingeniería + propietario |

**Definition of Ready:** spec y diseño aprobados, secuencia sin pérdida de contenido, estrategia de progreso definida, mapeo de hashes y matriz de regresión listos.  
**Definition of Done:** criterios CA-01 a CA-14 satisfechos con evidencia, aprobaciones registradas, CI verde y validación de Preview antes de producción.
