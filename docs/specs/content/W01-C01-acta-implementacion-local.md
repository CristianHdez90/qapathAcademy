# W01-C01 · implementación local autorizada

2026-10-28. G3: el usuario respondió **«Todo W01-C01: ocho tarjetas y 24 fichas»** a la distinción entre piloto QC y capítulo completo. Autoriza código y contenido local de este capítulo; no publicación ni el resto del currículo.

Se aplica la propuesta editorial W01-C01 y el contrato de grafos/globos. Se conservan ocho IDs, títulos, 24 estados, navegación, ejemplo bancario, práctica, notas y comandos de progreso. Caso BT-14 ficticio, E04 pendiente, actividades formativas sin calificación ni envío. Grafos HTML/CSS con alternativa textual, sin motor Mermaid ni dependencia nueva.

Decisiones D03/D04: foco abre consulta transitoria; primera activación la fija, segunda la cierra. Puntero abre tras 200 ms. Scroll deliberado, visibilidad de 60 % y reposo de 350 ms permiten una invitación por demostración/sesión. Prioridad manual/foco > hover > scroll. Escape cierra sin reapertura inmediata. Un solo globo, sin atrapamiento de foco. Consultar pausa animación y contabilización de lectura; no crea progreso.

D1: portal fuera del árbol medido, referencia pasiva con la misma estructura de nodos y sin controladores; pausa temporal por CSS sin sustituir el estado de reproducción. Caso y actividad fuera de la región académica; consulta abierta pausa atención. Guardas en ambos lectores. Sin JavaScript, alternativa textual completa fuera de la región medida y descarga ampliada. Datos ausentes o inválidos conservan secuencia anterior.

Rutas del cambio: tipos opcionales en `packages/contracts/src/index.ts` y `libs/learning/src/domain/models.ts`; solo `1.sections[0]` en `libs/content/src/data/study-guides.json`; componentes `concept-demonstration`, `reading-concepts`, `lesson-study`, `lesson-study-legacy`, `focused-study`, `lesson-download`; nuevas vistas/CSS `concept-step-details`, `chapter-experience`, `concept-details-fallback`; helpers `features/study/demonstration-details`, `concept-detail-state`, `use-concept-details`; guardas en `features/progress/use-focused-reading` y `use-reading-tracker`. Documentación de entrega en este directorio. Se preservan cambios UX-120 preexistentes.

## Verificación diferida

Por instrucción del usuario, **no ejecutar tests, build, lint ni pruebas de navegador ahora**. Quedan pendientes mapeo de 24 fichas, teclado/toque/Escape/foco, prioridades, scroll, reducido, móvil, descarga, fallback, ausencia de mutaciones académicas y equivalencia D1 en ambos lectores. Implementación local no equivale a aceptación técnica, docente o de accesibilidad. No se reutilizan resultados de pruebas UX-120 para acreditar este cambio.

D01 (fuentes históricas no disponibles), revisión independiente y ampliación curricular permanecen pendientes. Deuda SQL/métricas fuera de alcance. Sin commit, push, despliegue, cambios de dependencias o de backend.

## Cierre del lote local

Implementación descrita en [entrega](W01-C01-entrega-local.md). Aclaración editorial al trasladar `qa[0]`: el capítulo detalla BT-14, pero no entrega dos reportes previos. Se pide buscar reportes relacionados y registrar su ausencia, en lugar de presuponer dos adjuntos disponibles; un caso aislado no demuestra recurrencia. No cambia el objetivo, estado o regla académica.

El contraejemplo de cada tarjeta se conserva en `example.counterexample` opcional, con etiqueta propia; `result` mantiene el resultado o limitación del ejemplo. Ambos tipos compartidos y la descarga contemplan ese campo. No se presenta el contraejemplo como si fuera un resultado logrado.

G4 local implementado; G5, revisión independiente y producción pendientes. No se ejecutaron las pruebas diferidas.

## Ajuste y autorización posteriores

El usuario pidió sustituir el globo extenso por **una lista reducida de pasos** y después indicó **«ejecuta pruebas y revisa»**. Esto sustituye la instrucción temporal de diferir pruebas para este lote.

El globo muestra solo el título, Cerrar y 2–4 acciones breves (`briefActions` opcional). Se mantienen las acciones completas, objetivos, entradas y evidencias en la fuente, descarga y alternativa sin JavaScript. El ajuste conserva la coordinación y los controles de lectura. Se completó el CSS compacto que había quedado interrumpido por la cuota de la herramienta.

La revisión inicial encontró tres errores de lint del compilador React al manejar referencias; se corrigieron mediante referencias DOM explícitas y nombres de refs reconocidos, sin desactivar reglas. Resultados y limitaciones de la validación se registran en [informe](W01-C01-validacion-local.md).

Validación local terminada: 225 pruebas Node, 12 escenarios Chromium y 19 casos WebKit aprobados, con tipos/lint/build correctos. Incluye la corrección de retorno de foco en WebKit y la versión compacta numerada del globo. Las revisiones humanas independientes y la autorización para ampliar el currículo o publicar siguen pendientes.

## Cambio posterior: retirar el globo

El usuario indicó **«quitar ese globo»**. Esta instrucción sustituye la interacción de globos aprobada antes: se retiran el portal, los botones de los nodos, el controlador y las aperturas por hover/foco/scroll. Se conserva la secuencia original de tres estados como explicación estática, con su animación existente. No se añade otra ventana o panel sustituto.

Las fichas completas permanecen en los datos, la descarga y la alternativa sin JavaScript. Caso, actividad, progreso y notas se conservan. Las guardas de atención siguen protegiendo los apoyos de capítulo abiertos; se elimina la coordinación que solo correspondía al globo. Se actualizan las pruebas para verificar ausencia de elementos flotantes y conservación de la descarga; los resultados anteriores de la interacción retirada quedan como historia, no como validación de la nueva presentación.

## Cambio global posterior

El usuario pidió quitar toda la sección «Así se aplica» de todas las tarjetas y módulos. Se aplica esa instrucción también al modo enfocado y referencia pasiva; la secuencia visual deja de mostrarse. Ver [alcance y validación global](ajuste-global-sin-asi-se-aplica.md): 266 tarjetas verificadas, 226 pruebas Node y 24 de navegador aprobadas.
