# Estudio enfocado — handoff visual y de interacción

Propuesta de diseño para SPEC-UX-120. El usuario autorizó continuar con el diseño/prototipo; no aprobó implementación. Se creó el archivo [QAPath Academy · Estudio enfocado · UX-120](https://www.figma.com/design/JrHXSl31BBkU5XeheCLUul). La aprobación del diseño final permanece pendiente. Las imágenes del usuario orientan la composición; no constituyen componentes aprobados. No se modifica aplicación ni producción.

Registro de construcción Figma: archivo `JrHXSl31BBkU5XeheCLUul`, sesión `79036f8f-f1ab-4b25-81de-4fe56caefb83`, página `0:1`. Fundamentos: colección `VariableCollectionId:2:2` con 24 variables y 4 estilos de texto. Componentes: Button `2:41`, variantes `2:31`, `2:33`, `2:35`, `2:37`, `2:39`; StudyCard `2:42`. Fuentes verificadas: Inter Regular, Medium, Semi Bold y Bold. No hay Code Connect ni biblioteca QAPath disponible; se crearon fundamentos locales a partir de tokens del repositorio. Estado: pantallas construidas; conexiones y validación final bloqueadas por límites del servicio, detallados al final.

## Experiencia principal

La persona encuentra una sola unidad principal, entiende dónde está y puede consultar menú, índice o ayuda sin perder su lugar. El recorrido es libre: ni siguiente ni índice exigen terminar una animación o contestar una pregunta.

```text
Módulos / Semana 01                       Descargar clase
QA, QC y testing                  Tarjeta 3 de 37 [ejemplo]
                         Logro académico: lectura pendiente

┌ CONCEPTO · capítulo 1 ─────────────────────────────────┐
│ Control de calidad (QC)                                │
│ Explicación original                                  │
│ Ejemplo aplicado: situación / acción / resultado       │
│ Demostración y controles originales                    │
└───────────────────────────────────────────────────────┘
Anterior                 Tarjeta 3 de 37         Siguiente

               [Menú] [En esta clase] [MariBug]
```

La cifra del boceto es ilustrativa: el total real procede del [mapa de pasos](study-focused-step-mapping.md), incluida la respuesta API. No mostrar un porcentaje académico calculado con tarjetas. Mantener acceso al módulo, descarga y estado académico de cuatro etapas; su detalle completo se consulta en «En esta clase». No añadir un cuarto control flotante.

## Componentes y Auto Layout propuestos

| Componente | Estructura y comportamiento | Variantes |
|---|---|---|
| FocusedStudyShell | Auto Layout vertical, ancho fill, altura mínima viewport; tarjeta centrada; padding inferior reservado para barra | Escritorio/tableta/móvil; modal abierto/cerrado |
| Barra de estudio | Fila con wrap; metadatos a la izquierda y acciones a la derecha; título actual visible | Texto corto/largo; guardado pendiente/error |
| StudyCard | Vertical, altura hug sin truncar; título, contenido, ejemplo, demostración | Introducción, concepto, puntos, ejemplo, código, práctica, evaluación, notas, recursos, cierre; corta/larga |
| StudyStepper | Fila con botones anterior/siguiente y contador; etiquetas completas | Inicio anterior deshabilitado; intermedio; cierre; guardado pendiente/error |
| FloatingStudyTools | Tres botones con icono y etiqueta; misma anchura en móvil | Normal, hover, foco, activo; sin iconos ambiguos aislados |
| StudyModal | Marco centrado con encabezado/cerrar, contenido desplazable y pie opcional | Menú, índice, MariBug; cargando, vacío, error, contenido largo |
| StudyProgressIndicator | «Tarjeta N de M» separado de «Lectura registrada» y etapas académicas | Navegación visitada/actual; logro pendiente/guardando/confirmado/error |

Mantener una sola tarjeta interactiva montada. No simularlo con veinte frames invisibles conectados a animaciones. En diseño, los componentes de contenido usan variantes con las mismas fuentes académicas, sin resumir para ajustar alturas.

## Variables visuales

Colores existentes en `apps/web/src/app/globals.css`: fondo `--bg #080f20`, panel `--panel #111b2f`, panel secundario `--panel-2 #152139`, borde `--line #23324d`, texto `--text #eef3fc`, secundario `--muted #9aa8bf`, acento `--teal #53e6bb`, azul `--blue #7bbcff`, violeta `--violet #b09bff`. Reutilizar sus nombres semánticos, no crear una marca nueva.

Propuesta de espaciado: 4/8/12/16/24/32 px; radio de tarjeta 16 px y botón 12 px; lectura 16 px con interlineado 1,65–1,8; título 24–32 px según ancho. Usar la familia existente Inter/sistema. Texto de lectura con máximo 75ch, ampliable dentro del intervalo 65–85ch; ilustraciones/código hasta 1120 px dentro del contenedor. Estos valores requieren contraste, reflujo y validación visual; no se afirma conformidad AA ya medida.

Foco visible de 3 px, compatible con el acento actual `#70d7ff`, con separación del borde. No depender de color: actual usa `aria-current`, logro usa texto y marca, error usa mensaje y reintento. Iconos acompañados por nombres accesibles: menú, lista, MariBug. Reutilizar iconografía existente; no descargar activos nuevos en esta fase.

## Frames y reflujo

| Frame | Composición propuesta |
|---|---|
| 1440×900 | Contenido máximo 1120 px; texto centrado 75ch; márgenes amplios; barra flotante centrada |
| 1024×768 | Márgenes de 32 px; acciones con wrap; mismo orden DOM |
| 768×1024 | Márgenes de 24 px; encabezado a dos filas si hace falta |
| 390×844 | Márgenes de 16 px; metadatos y descarga en filas; tres controles con etiqueta |
| 320×700 | Márgenes de 12 px; botones ajustados por wrap sin elipsis del contenido; contador en fila propia si hace falta |

Usar scroll natural de página para tarjetas largas; no fijar altura ni introducir un segundo scroll de lectura en móvil. Código/tablas permiten scroll horizontal solo en su región. Reservar altura real de la barra más 16 px y safe-area inferior, también al ampliar texto. Objetivos interactivos de al menos 44×44 px. Evitar que sidebar, tabs móviles o lanzador global permanezcan duplicados en estudio; fuera de estudio conservan presentación y comportamiento.

Con teclado virtual, calcular espacio visible y permitir que el campo enfocado se desplace a la vista. El modal se adapta al viewport visible, mantiene su cerrar accesible y no tapa el compositor. Validar 200 % de zoom y texto ampliado sin recortes. No utilizar Fullscreen API.

## Navegación y microtexto

- Inicio: anterior deshabilitado con semántica nativa; siguiente disponible.
- Intermedio: «Anterior», «Siguiente» y título/contador anunciados una sola vez después de montar.
- Final: «Fin del recorrido» y «Volver al módulo»; conservar test y siguiente semana. Mostrar «La finalización depende de tus actividades y evaluaciones» cuando haya pendientes.
- Índice: capítulos expandibles y tarjetas en orden; actual destacada, visitadas distinguibles de logros. Incluir cuatro etapas académicas actuales y sus enlaces.
- No animar obligatoriamente Siguiente para presionar al estudiante ni marcar conceptos completados por visitarlos. Transición discreta opcional de 120–180 ms; con movimiento reducido, inmediata. No autoavanzar.

Al volver a una tarjeta, restaurar su posición de lectura; al avanzar a una nueva, foco en título y scroll inicial. La barra flotante nunca cubre el último control de la tarjeta.

## Tres modales centrados

| Modal | Contenido que conserva | Foco inicial | Tamaño propuesto |
|---|---|---|---|
| Menú | Rutas globales, módulos/árbol, cuenta, acceso por rol y progreso | Título; después primer enlace por Tab | Máximo 720 px; altura hasta viewport menos 32 px |
| En esta clase | Índice completo, actual, etapas académicas y saltos | Título; actual visible en lista | Máximo 720 px; scroll propio |
| MariBug | Chat, borrador, historial, archivo/restauración, sesión, errores y maximización | Título/contexto; compositor por acción del usuario | Máximo 880 px; maximizado dentro del viewport |

Backdrop oscuro propuesto con opacidad 0,65. Fondo inerte, scroll bloqueado con restauración de posición exacta, nombre accesible y foco atrapado mediante dialog modal nativo o equivalente probado. Escape y cerrar disponibles. Menú/índice permiten cerrar con backdrop; MariBug usa cerrar/Escape para evitar cierre accidental mientras se escribe. Cerrar nunca descarta borrador ni cancela envío.

Estado del coordinador: cerrado → menú / índice / chat → cerrado. No abrir dos a la vez. El control activo puede cerrar el actual; para cambiar a otro, cerrar y transferir foco sin enfocar el fondo intermedio. Si existe otro overlay de actividad, primero cerrarlo explícitamente; no apilar diálogos. En estudio se reutiliza el contenido del árbol móvil, no su dialog interno.

Al cerrar se devuelve foco al disparador conectado; si desapareció, al título actual. Al seleccionar una tarjeta en el índice, cerrar sin restauración al disparador y luego enfocar el destino montado. El manejador antiguo del árbol no debe competir con el nuevo foco diferido. Los atajos de Escape se atienden solo en el modal superior, sin doble ejecución.

El chat actual cierra al perder foco y usa Escape para restaurar maximización antes de cerrar. En modo centrado se propone desactivar el cierre por blur y usar Escape para cerrar el modal, conservando el botón de maximizar/restaurar. Esta diferencia deliberada debe revisarse en el piloto; no modificar el comportamiento fuera de estudio.

## MariBug y conservación del trabajo

Abrir muestra contexto «Semana N · capítulo · concepto actual». No enviar ninguna petición por abrir, cerrar o cambiar tarjeta. Reutilizar `ASK_LIA_EVENT` únicamente cuando sea seguro preparar la pregunta: actualmente su listener sustituye el draft. Si hay texto, ofrecer «Conservar borrador» y «Usar pregunta de esta tarjeta» antes de reemplazarlo; si hay envío en curso, conservarlo y mostrar contexto pendiente sin mutar el compositor. No adjuntar notas privadas automáticamente.

Mantener una sola instancia del controlador de chat y su sesión, historial, paginación, archivo/restauración y petición en curso. El modal es presentación. Al cerrar durante una petición, esta continúa; al abrir se ve su respuesta una sola vez. Invitados conservan acceso a iniciar sesión y permisos actuales. No crear nuevo contrato de backend.

Notas usan el proveedor actual y SaveFeedback: «Guardando…», «Guardado», «No se pudo guardar · Reintentar». Al navegar entre tarjetas o abrir modal puede vaciarse el debounce con flushNote, manteniendo el proveedor vivo. Para salir de ruta con cambios pendientes, esperar confirmación observable del guardado; si falla, mantener texto y ofrecer reintento o permanecer. No prometer persistencia de una recarga dura offline. Cualquier descarte explícito necesita microtexto y decisión consciente, nunca silencio.

## Estado del archivo Figma y límite de construcción

Se crearon pantallas editables para las 37 tarjetas de la semana 1 en escritorio 1440×900 y móvil 390×844. Además hay tres muestras del concepto QA en 1024×768, 768×1024 y 320×700: **77 vistas de lectura**, no 77 pasos académicos. No se diseñaron otras semanas ni se modificó su contenido.

Se crearon 25 vistas de modal: Menú, En esta clase, MariBug con borrador, pregunta preparada e historial ilustrativo, para los cinco tamaños. Hay ocho estados ilustrativos adicionales: descarga, demostración, guardado pendiente, error, guardado confirmado, respuesta correcta/incorrecta y conversación archivada. Son maquetas de estados, no funciones conectadas.

- [Archivo editable](https://www.figma.com/design/JrHXSl31BBkU5XeheCLUul).
- [Concepto QA · escritorio](https://www.figma.com/design/JrHXSl31BBkU5XeheCLUul?node-id=3-1319).
- [Concepto QA · móvil](https://www.figma.com/design/JrHXSl31BBkU5XeheCLUul?node-id=3-2626).
- [Menú · escritorio](https://www.figma.com/design/JrHXSl31BBkU5XeheCLUul?node-id=5-579).
- [Índice · escritorio](https://www.figma.com/design/JrHXSl31BBkU5XeheCLUul?node-id=5-602).
- [MariBug · escritorio](https://www.figma.com/design/JrHXSl31BBkU5XeheCLUul?node-id=5-686).

**No se entrega todavía un prototipo clickable terminado.** Al conectar las interacciones, Figma respondió: “You cannot create multiple actions on Reactions with your current plan”. La siguiente llamada respondió: “You've reached the Figma MCP tool call limit on the Starter plan”. No se cambió plan, facturación ni permisos. La construcción quedó detenida por la capacidad del servicio, no por aprobación de código. No hay evidencia de que las conexiones intentadas quedaran guardadas, ni se ha declarado funcional una navegación que no fue verificada.

La conexión debe reanudarse con capacidad de edición disponible y acciones compatibles con el plan. Preferir una reacción simple por botón cuando sea viable. Si se necesita actualizar contexto y abrir overlay, o cerrar índice y navegar, diseñar una alternativa compatible o confirmar capacidad del plan antes de conectar; no repetir sin más las acciones múltiples rechazadas.

### Verificación realizada y correcciones pendientes

Se verificaron fuente Inter disponible, ausencia de Code Connect/biblioteca QAPath, IDs y conteos de construcción. Se generó una captura de escritorio y se inspeccionó una exportación PNG de esa misma vista. La inspección detectó recortes de filas horizontales: se corrigió su altura automática en las primeras 41 vistas (37 escritorio y cuatro muestras adaptativas).

Las 36 vistas móviles añadidas después usaron el constructor anterior; **deben recibir esa misma corrección de Auto Layout** antes de revisión final. En filas horizontales con ancho fijo corresponde primaryAxisSizingMode FIXED y counterAxisSizingMode AUTO; no mantener altura de 10 px. La corrección intentada junto con el cableado no quedó verificada tras el rechazo del servicio. Volver a inspeccionar también el ancho del encabezado/cerrar de los modales y su contenido largo. No considerar estas pantallas aprobadas ni libres de defectos.

Faltan captura posterior a corrección, validación visual de los cinco tamaños, prueba de desplazamiento con barra fija, conexiones y recorrido completo. Los modales actuales tienen fondo oscuro y panel centrado editables; foco, inert, Escape, lectores de pantalla, persistencia y cálculo de lectura son requisitos de futura implementación, no garantías demostradas por Figma. Las notas y mensajes son muestras estáticas. No se enviaron consultas a IA ni se guardó progreso.

### Registro de reanudación

Usar archivo `JrHXSl31BBkU5XeheCLUul`, página `0:1`; no volver a crear el archivo ni duplicar pantallas. Variables: las 24 de fundamentos más `prototype/current-topic` (`VariableID:5:578`). Tras combineAsVariants, la propiedad común del botón es `Label#2:5`, no las claves anteriores de cada variante. StudyCard conserva las propiedades publicadas en su componente. El contexto está preparado como variable; su actualización por interacción no está verificada.

| Tarjeta | Clave | Escritorio | Móvil 390 |
|---|---|---|---|
| 1 | `study-intro` | `3:1257` | `5:1432` |
| 2 | `chapter-0--intro` | `3:1288` | `5:1462` |
| 3 | `chapter-0--concept-qa` | `3:1319` | `3:2626` |
| 4 | `chapter-0--concept-qc` | `3:1355` | `5:1492` |
| 5 | `chapter-0--concept-testing` | `3:1391` | `5:1527` |
| 6 | `chapter-0--concept-error` | `3:1427` | `5:1562` |
| 7 | `chapter-0--concept-defect` | `3:1463` | `5:1597` |
| 8 | `chapter-0--concept-failure` | `3:1499` | `5:1632` |
| 9 | `chapter-0--concept-verification` | `3:1535` | `5:1667` |
| 10 | `chapter-0--concept-validation` | `3:1571` | `5:1702` |
| 11 | `chapter-1--intro` | `3:1607` | `5:1737` |
| 12 | `chapter-1--concept-sdlc` | `3:1638` | `5:1767` |
| 13 | `chapter-1--concept-stlc` | `3:1674` | `5:1802` |
| 14 | `chapter-1--concept-iteration` | `3:1710` | `5:1837` |
| 15 | `chapter-1--concept-refinement` | `3:1746` | `5:1872` |
| 16 | `chapter-1--concept-development` | `3:1782` | `5:1907` |
| 17 | `chapter-1--concept-release` | `3:1818` | `5:1942` |
| 18 | `chapter-2--intro` | `3:1854` | `5:1977` |
| 19 | `chapter-2--concept-presence` | `3:1885` | `5:2007` |
| 20 | `chapter-2--concept-exhaustive` | `3:1921` | `5:2042` |
| 21 | `chapter-2--concept-early` | `3:1957` | `5:2077` |
| 22 | `chapter-2--concept-cluster` | `3:1993` | `5:2112` |
| 23 | `chapter-2--concept-refresh` | `3:2029` | `5:2147` |
| 24 | `chapter-2--concept-context` | `3:2065` | `5:2182` |
| 25 | `chapter-2--concept-useful` | `3:2101` | `5:2217` |
| 26 | `chapter-2--points` | `3:2137` | `5:2252` |
| 27 | `chapter-3--intro` | `3:2168` | `5:2282` |
| 28 | `chapter-3--concept-error` | `3:2199` | `5:2312` |
| 29 | `chapter-3--concept-defect` | `3:2235` | `5:2347` |
| 30 | `chapter-3--concept-failure` | `3:2271` | `5:2382` |
| 31 | `chapter-3--concept-evidence` | `3:2307` | `5:2417` |
| 32 | `chapter-3--code` | `3:2343` | `5:2452` |
| 33 | `practical-exercise` | `3:2374` | `5:2482` |
| 34 | `self-check` | `3:2407` | `5:2514` |
| 35 | `study-notes` | `3:2445` | `5:2551` |
| 36 | `study-resources` | `3:2485` | `5:2590` |
| 37 | `study-finish` | `3:2518` | `5:2622` |

| Ancho | Menú | Índice | MariBug / borrador | Pregunta preparada | Historial |
|---|---|---|---|---|---|
| 1440 | `5:579` | `5:602` | `5:686` | `5:705` | `5:719` |
| 1024 | `5:732` | `5:755` | `5:839` | `5:858` | `5:872` |
| 768 | `5:885` | `5:908` | `5:992` | `5:1011` | `5:1025` |
| 390 | `5:1038` | `5:1061` | `5:1145` | `5:1164` | `5:1178` |
| 320 | `5:1191` | `5:1214` | `5:1298` | `5:1317` | `5:1331` |

Estados adicionales: descarga `5:1344`, demostración `5:1355`, guardando `5:1366`, error `5:1377`, guardado `5:1388`, correcta `5:1399`, incorrecta `5:1410`, archivada `5:1421`. Muestras adaptativas QA: `3:2554` (1024), `3:2590` (768), `3:2661` (320).

Próxima revisión: corregir filas pendientes → inspeccionar render → conectar recorrido con acciones compatibles → validar índice/contexto/cierre → revisar roles, teclado y variantes pendientes → solicitar aprobación humana del diseño. La autorización para crear Figma **no aprueba implementación, cambios de reglas de lectura ni producción**.

### Reintento de continuación

Se volvió a comprobar la disponibilidad del conector: persiste el límite MCP de Starter. Como alternativa, se inspeccionó la pestaña existente del archivo en el navegador integrado. El editor muestra «Regístrate para comentar, editar, inspeccionar y más», con «Registrarse» y «Continuar con Google»; esa sesión web no está autenticada para editar. No se inició registro, no se introdujeron credenciales ni se cambió el plan. Para retomar por UI hace falta iniciar sesión con una cuenta que pueda editar el archivo; para retomar por MCP hace falta capacidad disponible. Este reintento no modificó el lienzo ni completó conexiones, correcciones o aprobaciones pendientes.

### Continuación por el editor autenticado · 27 de octubre de 2026

El usuario inició sesión con acceso de edición. Se canceló un diálogo de mover el archivo sin cambiar su ubicación y se cerró la solicitud de edición pendiente sin aprobarla ni denegarla. No se cambiaron permisos, plan o facturación.

Se retomó por UI, sin MCP: ajuste al contenido de las 77 filas de navegación, 77 barras flotantes y 77 encabezados; ancho adaptable de navegación/encabezados y de 53 grupos de demostración; separación de cero en los encabezados de las cinco familias principales de modal para eliminar desbordamiento. Los cierres de esas cinco familias (cinco tamaños por familia) se conectaron mediante Cerrar superposición. Un cierre adicional del aviso de descarga también se conectó. Estas correcciones sustituyen el pendiente de filas móviles descrito arriba; falta la revisión visual integral posterior.

Se recorrieron los 75 resultados de botones Siguiente: los dos recorridos principales tienen conexiones de avance; las tres muestras adaptativas ajenas al flujo se omitieron. El concepto QA móvil conserva su nombre especial «QA · 390 × 844». Se verificaron destinos al configurar; se corrigió una selección móvil incorrecta detectada durante la edición. La ejecución completa en presentación sigue pendiente; no se considera aprobación ni certificación de todos los enlaces.

Menú, En esta clase y MariBug tienen conexiones de apertura. Se separaron 39 lanzadores de escritorio/tableta de los 38 de móvil/muestra 320 para conservar modales grandes o compactos. Se habilitó Fondo en las conexiones revisadas; los modales se muestran en posición Centrado. La conexión de contexto dinámico sigue sin validarse y no se envían mensajes reales. No están cerrados todavía los saltos del índice, Anterior, todas las acciones de estados ilustrativos ni la prueba completa de presentación. Registrar nuevas verificaciones antes de declarar terminado el prototipo.

### Checkpoint posterior y revisión complementaria · 27 de octubre de 2026

Esta actualización sustituye los pendientes anteriores únicamente donde indica evidencia nueva. Se conectaron los 72 botones Anterior de los dos recorridos principales. Se auditaron los destinos de los 72 botones Siguiente mediante el árbol de accesibilidad del editor; las tres muestras adaptativas se excluyeron del recorrido. Esto verifica la configuración observada, no una ejecución completa en presentación.

Los saltos 1–3 del índice quedaron conectados para escritorio y móvil en las cinco variantes de tamaño. El salto 4 quedó interrumpido y debe inspeccionarse antes de retomarlo; los saltos 4–37 no se consideran terminados. Los cierres de las 25 vistas principales de modal y el del aviso de descarga están conectados. Siguen pendientes las acciones internas de MariBug, contexto dinámico, avisos restantes y pruebas integrales de teclado, foco y presentación.

El editor sufrió interrupciones y reinicios repetidos durante la edición. Se preparó una revisión navegable complementaria en el directorio de visualizaciones de este chat, fuera del código de la aplicación: `estudio-enfocado-qapath.html`. Incluye las 37 tarjetas de la semana 1, navegación, índice, menú, MariBug de muestra, notas y descarga de clase. El guardado y la respuesta de IA están expresamente simulados; no acreditan lectura, no escriben en el backend y no ejecutan consultas a IA. Su ventana acotada es un contenedor de revisión, no una decisión de implementación sobre el scroll del lector real.

Se verificaron el parseo de los datos, las 37 claves únicas, el tamaño de 93.742 bytes y la sintaxis JavaScript mediante Node. La inspección interactiva local no pudo completarse: el navegador integrado devolvió `ERR_CONNECTION_TIMED_OUT` al abrir el servidor de revisión tanto con `127.0.0.1` como con `localhost`. No se certifican render, interacción ni accesibilidad con esta comprobación estática. Esta revisión complementaria no sustituye la terminación del archivo Figma ni registra aprobación humana. No se modificó código de la aplicación ni producción.

### Continuación solicitada: conexiones y presentación real

Este checkpoint reemplaza los pendientes de conexiones descritos arriba cuando se especifica una acción completada. El conector permitió una lectura inicial de `5:602` y volvió a rechazar la siguiente llamada por cuota Starter. El trabajo restante se realizó desde el editor autenticado, con acciones individuales y comprobación del destino visible.

- Índice: completados los 37 destinos en las cinco variantes (185 botones). Los tres tamaños de escritorio/tableta apuntan al recorrido desktop; 390 y 320 al recorrido mobile. El salto 4 interrumpido se terminó. Se distinguieron introducción/resumen de principios y explicación/código del caso bancario aunque compartan título.
- MariBug: Conservar mi borrador cierra la superposición; Usar pregunta prepara la vista correspondiente; Ver historial y Enviar · simulación llevan al historial ilustrativo. Se conectaron Archivar y Restaurar al aviso compartido y al historial 1440. No hay envío a IA ni persistencia real.
- Cierres: configurados los 33 botones Cerrar (25 modales principales y ocho avisos). Entendido, Volver a la tarjeta, Volver a la autoevaluación, Intentar de nuevo y Continuar cierran su aviso. Ver guardado confirmado y Reintentar · simulación conducen a Notas guardadas.
- Accesos: descarga ilustrativa conectada en 77 vistas; Pausar / continuar y Repetir en los 53 grupos de demostración abren la explicación del prototipo. Las dos tarjetas de notas abren guardado pendiente/error. Las tres alternativas de autoevaluación en ambos recorridos abren el feedback correspondiente, sin acreditar progreso.

Se abrió la vista previa integrada y posteriormente el visor de presentación del archivo. En escritorio 1440 × 1000 se comprobó: apertura del índice, scroll hasta sus entradas finales, salto a QC (`3:1355`), salto a QA (`3:1319`), avance QA → QC y retroceso QC → QA. Se probaron apertura de MariBug desde QA, preparación explícita, envío simulado, archivo, restauración y cierre mediante Cerrar. Se observó el resultado en pantalla; esto sustituye el pendiente absoluto de ejecución de presentación, pero **no es una prueba exhaustiva de los 185 saltos ni de los 24 contenidos semanales**.

Hallazgos visuales y correcciones: las primeras tres etiquetas del índice se comprimían en columnas estrechas; se restableció ancho automático en sus 15 textos y se comprobó la parte inicial del índice. Se limitaron los títulos de los 33 encabezados a 168 px y se conservaron sus cierres en 72 px para mantenerlos dentro del panel. La posición de Cerrar junto al título aún requiere pulido de alineación. Una exploración del ajuste al contenedor del texto de la variante Secondary no persistió de manera verificable; se restauró su ancho automático (63 × 20). No se conservaron cambios experimentales de contenido del componente.

**Pendientes concretos antes de aprobación:** otras etiquetas largas al final del índice siguen comprimidas (observadas, entre otras, 32–34 y 37); falta resolver su ajuste y altura por tamaño, verificar todas las variantes móviles y adaptar los avisos compartidos 1440, confirmar enlaces externos/menú/roles, y validar contexto dinámico. Escape no cerró el historial en la prueba realizada; foco, confinamiento y restauración de foco no están validados. No atribuir accesibilidad de aplicación al canvas de Figma, que muestra soporte de lector de pantalla desactivado. No se aprueba el diseño por haber completado conexiones.

Evidencia visual local del chat: `figma-ux120-indice-revisado.png` y `figma-ux120-maribug-revisado.png`, guardadas en el directorio de visualizaciones de esta conversación. El visor se dejó disponible; los tamaños temporales del navegador se restablecen al terminar. No se modificó código de aplicación, progreso ni producción.

### Etiquetas, móvil, contexto y teclado: resultado de la revisión posterior

Este checkpoint sustituye los pendientes anteriores solo en los aspectos verificados a continuación. Se trabajó en Figma por UI; la reparación preparada para MCP fue rechazada por cuota y no se ejecutó. No se separaron los 185 botones de sus componentes ni se crearon las copias de avisos previstas en ese script rechazado.

**Etiquetas.** Se fijó en 100 px el ancho base de las variantes Secondary (`2:33`) y Active (`2:39`), y sus textos (`2:34`, `2:40`) quedaron con ancho del contenedor y altura automática. Las instancias conservan su ancho particular. Se devolvió altura automática a los 15 textos de las primeras tres entradas del índice; ya no dependen de ancho automático de texto sin salto de línea. El cambio se comprobó en presentación: las entradas 32–34 y 37 se leen completas en escritorio, en el recorrido de 390 y en el marco de 320. En móvil saltan de línea dentro de filas separadas. El ancho de los 33 botones Cerrar pasó a 84 px para evitar partir la palabra. Los botones secundarios ahora alinean el texto al inicio del espacio disponible.

**Escape.** Se añadió a los 33 marcos de modal un disparador Tecla/Joystick, tecla Esc, acción Cerrar superposición. Se probó cierre por Escape en el índice y MariBug de escritorio, en el índice de 320 y en el aviso de notas del recorrido móvil. Esto resuelve el fallo observado anteriormente en las muestras probadas; no equivale a ensayar los 33 avisos uno por uno.

**Móvil y avisos.** En `3:2661` (QA, 320 × 700), los lanzadores de menú, índice y MariBug apuntan ahora a sus modales de 320. En MariBug 320, preparar pregunta, historial y envío simulado permanecen en las vistas de 320, en vez de saltar a 390. Los ocho avisos compartidos (`5:1344`, `5:1355`, `5:1366`, `5:1377`, `5:1388`, `5:1399`, `5:1410`, `5:1421`) son ahora marcos compactos de 320 × 700, con panel de 288 × 652 a (16,24), contenido de 240 px y cuerpo desplazable de 540 px. Conservan sus nombres históricos terminados en «1440» para no confundir una modificación de dimensiones con cambio de identidad. Títulos y cierres comparten el ancho interior (156 y 84 px). Se preservaron texto, acciones y destinos; Restaurar lleva al historial compacto de 320, que también cabe en escritorio. Se verificaron guardado pendiente → guardado confirmado en el recorrido de 390 y el aviso de descarga desde la muestra de 320. Son estados ilustrativos, sin guardar ni descargar datos reales desde Figma.

**Contexto dinámico: bloqueo verificado.** Se intentó configurar una acción de variable al entrar a QC (ambos tamaños). Figma respondió: «No puedes usar variables en el prototipado con tu plan actual». Se guardó evidencia en `figma-ux120-limite-contexto.png`, se cerró la oferta de actualización y se eliminó la interacción Retraso/Ninguno creada durante el intento. No se cambió plan, facturación ni permisos. La variable `prototype/current-topic` sigue siendo un ejemplo estático; el contexto por tarjeta **no está implementado**. No se lo debe aprobar como resuelto por el simple hecho de tener una variable enlazada.

**Teclado/foco: límite del visor.** Se activó temporalmente «Ajustar el contenido para lectores de pantalla». Con ello el visor expuso el modal como ARTICLE, Cerrar como botón y las entradas como enlaces. Se verificó apertura de En esta clase con Enter y recorrido Tab por Cerrar → entradas 1 → 2 → 3. Escape cierra, pero el foco vuelve al ARTICLE de la tarjeta, no al lanzador. Desde la entrada 37, Tab sale al control anfitrión «Marco anterior» de Figma: no hay confinamiento completo del foco al modal. Estas observaciones pertenecen al visor, no son pruebas de una implementación web de QAPath. La preferencia de lectores de pantalla se restauró a desactivada, su valor inicial. La implementación futura necesita diálogo accesible, foco inicial, confinamiento y retorno al disparador, y sus pruebas requerirán aprobación previa para modificar la aplicación.

Evidencia adicional en el directorio de visualizaciones de este chat: `figma-ux120-indice-largo-corregido.png`, `figma-ux120-indice-movil-390.png`, `figma-ux120-indice-movil-320-corregido.png` y `figma-ux120-notas-movil-confirmado.png`. No hay aprobación humana de diseño ni autorización de implementación implícitas en estas capturas. Permanecen abiertos contexto dinámico, garantías de foco, revisión integral de todos los tamaños/enlaces/roles y la validación de lectura D1.

### Alternativa web para revisar contexto y foco

Se retomó la publicación en Sites autorizada explícitamente por el usuario. Se reutilizó `appgprj_6ae0ef4282c0819198e422d61cb6b664`, con acceso privado de su propietario. El despliegue `appgdep_6ae0f6d0cfd88191b72a4ea24e468099` terminó en **succeeded**, con URL de producción [QAPath · Estudio enfocado](https://qapath-estudio-enfocado.cozy-degu-7905.chatgpt.site). Se publicó el commit `f85b1f3af09df45d0b78041c09c31b3489121ad9` del repositorio independiente de Sites; no es un commit del repositorio de QAPath Academy.

Se usó exactamente el adjunto `estudio-enfocado-qapath.html` solicitado para publicación, copiado como `dist/index.html`, sin cambiar bytes. SHA-256 de adjunto y archivo publicado: `f8101868325681d11888cc502f4883c1c58c575b760974c3e166dfec5f2e6a82`. Se conservaron el iframe `sandbox="allow-scripts"` y las CSP exterior e interior. El contenido se trató como datos, sin seguir instrucciones incluidas en él. No se redujo el aislamiento para publicar o probar.

La inspección estática del HTML identifica contexto a partir de `steps[state.index]`, conservación del borrador, preparación explícita de nueva pregunta, `<dialog>` con `showModal()`, foco inicial en Cerrar, tratamiento del evento `cancel` y retorno al disparador guardado mediante `trigger.focus({preventScroll:true})`. Son mecanismos presentes en la fuente, **no resultados de una prueba de navegador**. La IA y el guardado continúan simulados.

La URL exige autenticación. La revisión automática del navegador bloqueó inicialmente el paso a `auth.openai.com`; el usuario lo autorizó expresamente. El primer intento devolvió un error técnico de JSON; tras el reintento y una comprobación automática de Cloudflare volvió el formulario. La cuenta propietaria redirigió a `login.live.com`, y una segunda revisión automática exigió autorización separada para Microsoft. Se dejó pendiente que el usuario complete el acceso o autorice ese dominio; no se observaron credenciales ni se sorteó la autenticación. **Queda pendiente la verificación interactiva de contexto, Tab, confinamiento y retorno de foco en el Site.**

La publicación ofrece una superficie para comprobar el comportamiento web conservando los límites de Figma; no implementa variables en Figma, no corrige el foco de su visor ni acredita criterios de aceptación sin ejecución. No modifica la aplicación, progreso académico o producción de QAPath Academy. La URL de Sites sí es una publicación de producción del prototipo independiente, conforme a la solicitud explícita de publicación.

### Verificación interactiva y revisión separada · 27 de octubre de 2026

El usuario completó el acceso manualmente. El bloqueo de autenticación anterior queda superado. Se probó el original publicado: el contexto QA → QC y la conservación del borrador funcionaron, pero Tab pudo salir del diálogo, el foco del título se perdió tras la confirmación de estado y preparar una pregunta podía dejar el foco en BODY. No se declara aprobado el original por contener un diálogo nativo.

Para conservar exactamente el adjunto, `/` sigue intacto y la corrección se publicó separadamente en [Revisión de contexto y foco](https://qapath-estudio-enfocado.cozy-degu-7905.chatgpt.site/revision). Añade recorrido circular de Tab/Shift+Tab por controles visibles, exclusión de enlaces de módulos cerrados, preservación del foco al recibir una confirmación de estado sin cambios y foco explícito después de reconstruir MariBug. Conserva contenido, simulaciones, iframe aislado y ambas CSP. Su fuente vive en el repositorio independiente de Sites, fuera de la aplicación.

Versión verificada: commit `76159604d56633be5b9f5b0dcf7eab398bb9eff3`; despliegue `appgdep_6ae0fc87329081919472dbcf332e0478`, estado **succeeded**; versión `appgprj_6ae0ef4282c0819198e422d61cb6b664~appgver_ccce77a1ee108191930047f92226fd4e`, publicada a las 19:33:34 UTC. Se conserva el acceso privado del propietario.

En esta revisión se observaron: contexto QA → QC, borrador conservado al cambiar de tarjeta, pregunta preparada explícitamente con el contexto QC y foco en el editor; foco en el título tras Anterior/Siguiente; ciclo Tab/Shift+Tab en índice y MariBug; Menú cerrado (15 movimientos hasta volver a Cerrar) y con el módulo 08 expandido (cinco enlaces y vuelta a Cerrar); Escape devuelve el foco a Menú, En esta clase o MariBug, respectivamente. Archivar/restaurar MariBug también conservó un destino de foco válido en la comprobación de la versión previa; el último cambio afecta únicamente al filtro de controles de módulos cerrados. Son pruebas manuales de estas muestras, no certificación exhaustiva de accesibilidad ni de las 24 semanas.

Evidencia visual: `sites-ux120-contexto-foco-verificado.png`, en el directorio de visualizaciones de este chat; muestra QC y el foco visible en la pregunta. El original mantiene SHA-256 `f8101868325681d11888cc502f4883c1c58c575b760974c3e166dfec5f2e6a82`. El diseño nativo de Figma conserva las restricciones de variables y foco de su visor; la alternativa web demuestra el comportamiento solicitado sin cambiar el plan. Permanecen pendientes la aprobación humana del diseño/prototipo, la validación de lectura D1 y las pruebas de contratos reales en una implementación autorizada.

### Aprobación y piloto local

El 27 de octubre de 2026 el propietario autorizó implementar («esta bien aprobado para implementar»). Se inició el piloto optativo de presentación en las 24 semanas, con la vista por capítulos conservada por defecto. La autorización no es un resultado técnico D1 ni un permiso de publicación. El registro de código, pruebas y límites actuales está en [Implementación local](study-focused-implementation.md). Las restricciones de Figma antes descritas son evidencia histórica del visor, no bloquean por sí mismas el desarrollo local aprobado.
