# Estudio enfocado — matriz de aceptación propuesta

Estado: plan, no resultados de pruebas. No se ejecutaron ni editaron tests en esta tarea. REQ abrevia `REQ-UX-120`; CA corresponde a la SPEC de entrada. Las ubicaciones existentes se verifican en [AS-IS](study-focused-as-is-evidence.md).

## Trazabilidad completa

| REQ | CA | Verificación propuesta y resultado exigido | Base existente |
|---|---|---|---|
| 01 · modelo | 01,02 | Inventariar las 24 guías enriquecidas; cada campo visible/exportado conserva contenido y orden, sin colisiones; un concepto por paso | reading-concepts.spec.ts; JSON/adaptador |
| 02 · montaje | 01,14 | Inspeccionar DOM, observers y efectos: solo un paso interactivo activo; conceptos inactivos no animan ni quedan en árbol accesible | reading-concepts.spec.ts |
| 03 · avance | 02,03 | Anterior deshabilitado al comienzo; recorrido completo en orden; final no envía comandos académicos | lesson-pagination.spec.ts |
| 04 · scroll | 11,14 | Tarjeta larga completa, restauración de posición, título enfocado y un anuncio; sin truncar a 200 % | reading-concepts.spec.ts |
| 05 · URL/reanudación | 08 | Alias, IDs nuevos, reload, back/forward, hash desconocido, nueva pestaña; enlace directo gana a reanudación | lesson-pagination.spec.ts |
| 06 · libertad | 02,05,10 | Saltar a notas/práctica desde índice sin visitar anteriores y sin crédito por clic | lesson-pagination.spec.ts |
| 07 · layout | 11 | Sin sidebar/aside permanentes solo en estudio; rutas restantes conservan shell; sin overflow global | learning-ux.spec.ts como regresión |
| 08 · barra | 03,13 | Descarga completa y salida al módulo; contador no reemplaza logro, nota pendiente visible | reading-concepts.spec.ts, descarga |
| 09 · controles | 04,05,06,11 | Exactamente tres accesos, etiquetas y objetivos táctiles; sin doble lanzador/chat o tabs solapadas | Nuevo caso de composición |
| 10 · modales | 07,11,14 | Cada modal centrado, Tab/Shift+Tab dentro, Escape/cerrar, fondo inerte, scroll y foco restaurados | Nuevos casos de diálogo |
| 11 · exclusión | 04,07 | Cambio rápido entre modales, árbol móvil, overlay existente, maximización y Escape; nunca dos modales abiertos | Nuevos casos del coordinador |
| 12 · asistente | 06,12,13 | Contexto exacto, cero POST al abrir, no sustituir borrador, un envío, historial y roles intactos | qa-history.spec.ts |
| 13 · lectura | 05,10,12 | Comparar exposición/tiempo por capítulo con baseline; navegación rápida no registra; exposición válida registra una vez | reading-coverage.test.mjs; reading-concepts.spec.ts |
| 14 · borradores | 09,12 | Notas offline, cambio tarjeta/modal, volver, reintentar y confirmar; selección y pausa sobreviven desmontaje | lesson-pagination.spec.ts; proveedor |
| 15 · compatibilidad | 08,12,13,14 | API y permisos sin cambios; módulos, test, práctica, enlaces, descarga y accesibilidad regresan correctamente | Suite actual + check futuro |

## Casos específicos que deberá añadir o adaptar la implementación aprobada

| ID | Preparación / acción | Evidencia exigida |
|---|---|---|
| T01 | Recorrer semana 1, 7, 9 y 24; comparar todas las guías mediante prueba de datos | Campos originales conservados; código completo; último curso sin enlace a semana 25 |
| T02 | Abrir capítulo con varios conceptos; avanzar y retroceder | Una unidad montada; ninguna animación fuera de ella; pausa manual conservada |
| T03 | Clics rápidos siguiente/índice y cambios de hash | Sin reading-section por navegación; ningún paso omitido por carreras |
| T04 | Entrar por todos los chapter-i, self-check, notes, resources y practical-exercise | Alias correcto; foco tras montaje; back/forward sin entradas extra |
| T05 | Sesión con tarjeta reanudada y enlace a otra | Gana hash; identidad distinta no hereda posición privada ni borradores |
| T06 | Modales con teclado y lector de pantalla | Nombre/rol, foco atrapado, background inerte, restauración al disparador o nuevo título tras salto |
| T07 | Menú con invitado, STUDENT, ADMIN e INSTRUCTOR | Mismos enlaces autorizados; no ampliar permisos de progreso/chat |
| T08 | Escribir nota, cortar red antes de debounce, cambiar tarjeta, abrir modal y volver | Texto exacto conservado, error y reintento; recuperación confirmada sin doble guardado |
| T09 | Intentar salir de ruta con guardado pendiente/fallido | No asumir flushNote confirmado; aviso recuperable y texto preservado mientras se resuelve |
| T10 | Elegir respuesta incorrecta, paginar y volver | Opción/explicación idénticas, sin nuevo lesson-answer por remonte |
| T11 | Chat con draft, historial archivado o petición lenta; abrir contexto y cerrar/reabrir | Sin sobrescritura, abort ni POST duplicado; respuesta única y controles actuales disponibles |
| T12 | Contar listeners de ASK_LIA_EVENT tras cambios de tarjeta/modal | Un consumidor efectivo, contexto del paso activo, no notas privadas |
| T13 | Descargar clase desde distintas tarjetas | Mismo nombre y contenido completo; conserva activity/answer, código y ejercicio enriquecido |
| T14 | Cerrar sesión/entrar; repetir con otra cuenta | Progreso/notas confirmados según contrato; cachés UI aisladas; no mostrar borrador anterior |
| T15 | Leer capítulo largo en móvil; cambiar tamaño/zoom | Geometría/cobertura coherente; no perder ni regalar crédito por reflujo |
| T16 | Escape con chat maximizado, blur y cambios entre los tres modales | Un solo cierre, estado preservado; foco correcto; fuera de estudio conserva UX actual |

Los nombres de casos nuevos son identificadores del plan; no se han creado archivos de pruebas. Adaptar los tests que hoy esperan todos los capítulos montados/ocultos para comprobar ausencia del paso inactivo, conservando la intención de no perder estado.

## Caracterización bloqueante de lectura

Antes de aprobar el adaptador virtual, registrar en entorno local/QA la secuencia de intervalos, tiempo atento e índice enviado por baseline y candidato, con los mismos contenidos, viewport y acciones. No guardar texto privado ni tokens en las trazas.

Escenarios mínimos: capítulo corto/largo; salto de cabecera a final sin leer medio; 79 % y 80 % de cobertura; final 97 % y 98 %; tiempo inferior/igual a 3 segundos; varias visitas; foco perdido; pestaña oculta; modal abierto; resize, fuentes y movimiento reducido; error/reintento de guardado. Validar límites temporales con reloj controlado y margen de muestreo documentado, no sleeps arbitrarios.

Comparar las decisiones académicas, no solo porcentajes de interfaz. No aceptar por equivalencia: 3 segundos por tarjeta, todas las tarjetas visitadas, pesos iguales o crédito al siguiente. Si el candidato no reproduce decisiones justificables bajo geometría equivalente, detener y resolver R1 antes de programar el flujo definitivo. No tocar el dominio para hacer pasar pruebas.

## Matriz visual y accesibilidad

Validar 320×700, 390×844, 768×1024, 1024×768, 1440×900; zoom 200 %, texto ampliado, teclado virtual y safe-area. Probar tarjeta corta/larga, código, notas y cada modal con contenido largo. Capturas antes/después por viewport en ejecución futura, sin datos personales. Automatización de contraste/semántica complementada con revisión manual de lector de pantalla, orden de foco, anuncios y movimiento reducido; objetivo WCAG 2.2 AA, no certificación obtenida.

## Puertas de salida futuras

1. Aprobación de diseño, decisiones de riesgos y prototipo aún pendiente.
2. Caracterización de lectura y prueba de preservación de estado antes de cambiar montajes.
3. Piloto en semana 1, más semana con código/contenido largo; comparar descarga y progreso.
4. `pnpm check` y E2E focalizados en entorno autorizado; ampliar regresión a módulos, /practice y asistente global fuera de estudio.
5. Preview revisada por persona responsable, evidencia adjunta y decisión separada de publicación.

Ninguna puerta se considera superada por la mera entrega de estos documentos.

## Ampliación D1 · Prueba diferencial y oráculo

Oráculo de decisión: `chapterWasTraversed` y `READING_SECTION_SECONDS` del SHA base, alimentados con la misma secuencia de intervalos normalizados y deltas válidos que el candidato. No reutilizar el candidato como su propio oráculo. La prueba de datos debe separar cálculo, geometría, atención y guardado.

| Capa | Ensayo futuro | Condición de aceptación |
|---|---|---|
| Proyección | Tramos de distinto tamaño, exposición parcial, solapada, repetida y fuera de orden | Unión idéntica a intervalos de referencia; sin sobrecontar ni cubrir huecos |
| Límites | Casos analíticos D1, 79/80 %, 97/98 %, 2999/3000 ms y precisión de punto flotante | Misma decisión del oráculo; no añadir epsilon que cambie el umbral |
| Geometría | Capturar límites del capítulo AS-IS y referencia estática al mismo ancho, fuente/zoom y contenido | Correspondencia verificable de regiones; no sustituir por estimaciones; cualquier diferencia que cambie decisión bloquea |
| Chrome | Variar padding, títulos nuevos, contador y botones de la tarjeta | Ninguno añade exposición a contenido original no visto |
| Ciclo | Remontar rápido, pausar por modal/foco, cargar fuentes, resize y cambiar semana | Sin tiempo de transición, sin doble delta; acumuladores con ciclo documentado |
| Inactividad | Inspeccionar representación de medida y tarjetas ausentes | Sin efectos, controles accesibles, requests, IDs duplicados o medios activos |
| Persistencia | Rechazar guardado y luego reintentar desde proveedor | Estado guardando/error separado de logro; un comando simultáneo; confirmado solo tras estado del proveedor |

Trazas propuestas: SHA baseline/candidato, semana/sección, versión de geometría, viewport/ancho/zoom/fuente, timestamp/delta aceptado, motivo de descarte, tramos y rangos proyectados, unión C/F/T, decisión y resultado de guardado. Usar fixtures de contenido público, sin mensajes, notas, tokens o identidad personal.

Para aceptar geometría se necesitan escenarios de exposición homóloga, no repetir iguales clics y asumir que exponen lo mismo. En ambas presentaciones mostrar la misma región de origen; comparar proyección y decisión. Ejecutar además visitas reales del flujo nuevo para comprobar que todos los tramos requeridos se pueden exponer sin huecos inaccesibles. Probar como mínimo semana 1 con listas/demostraciones y semana 7 o 9 con código largo, y el inventario de tipos de las 24 semanas.

Si se mantienen diferencias por disposición, guardas de visibilidad o reflujo, registrar su efecto exacto y someter una desviación a aprobación; no certificar equivalencia por una captura parecida. Esta ampliación especifica ensayos futuros: no se ejecutó código de prueba ni se creó un adaptador en esta tarea.

## Estado de revisión de Figma

Checkpoint posterior: se corrigieron las filas de las 77 vistas, se conectaron 72 retrocesos y se auditaron los 72 avances principales en el editor. Aperturas y 25 cierres de los modales principales están conectados; índice 1–3 conectado, 4 interrumpido y 4–37 pendientes de cierre. No se ejecutó el recorrido completo en presentación. Los detalles y límites actualizados están en el último checkpoint del handoff; el párrafo siguiente conserva la evidencia histórica inicial.

Se creó un archivo editable con 37 vistas de escritorio, 37 móviles, tres muestras adaptativas y vistas de modales/estados. Véanse enlaces e IDs en el handoff. Existe una inspección visual inicial de escritorio y corrección de filas en las primeras 41 vistas; faltan correcciones en las otras 36 móviles y revisión visual posterior. No se ejecutó el recorrido clickable: Figma rechazó acciones múltiples por plan y agotó cuota MCP antes de completar conexiones. Esto no satisface CA-01–CA-14 ni sustituye tests del navegador. No marcar como verificados foco, Escape, persistencia, contexto dinámico, permisos o equivalencia de lectura basándose en estas maquetas.

La revisión complementaria del chat pasó comprobaciones estáticas de sintaxis y datos (37 tarjetas con claves únicas). Los intentos de inspección mediante servidor local terminaron por timeout del navegador integrado. No hay evidencia de ejecución visual, teclado, persistencia ni cumplimiento de CA a partir de esa revisión; sus simulaciones de guardado e IA no prueban contratos reales.

### Resultado posterior en el visor de Figma

Se completaron los 185 botones del índice, los 33 cierres y los enlaces de estados descritos en el último checkpoint del handoff. En presentación de escritorio se observaron índice abierto y desplazable, saltos a QA/QC, Siguiente QA → QC y Anterior QC → QA. MariBug pasó por preparar pregunta, historial simulado, archivar, restaurar y cerrar explícitamente. Son comprobaciones manuales del prototipo, sin ejecución de tests de aplicación ni confirmación de guardado/IA reales.

Resultado negativo: Escape no cerró el historial. Resultado visual parcial: se corrigieron las primeras tres etiquetas del índice, pero persisten textos largos comprimidos al final. Pendientes: distribución adaptativa de etiquetas/avisos, recorrido móvil, contexto por tarjeta, enlaces externos y acceso por rol, foco y navegación completa con teclado. Ningún CA se declara aprobado globalmente con estas muestras. Las capturas guardadas muestran el índice inicial corregido y el historial ilustrativo; no prueban las zonas todavía defectuosas ni todo el recorrido.

### Actualización: muestras de 390/320 y cierre por teclado

El resultado negativo anterior de Escape queda sustituido en las muestras repetidas: se configuró Esc → Cerrar superposición en 33 modales y se observó cierre en índice/MariBug de escritorio, índice 320 y aviso de notas móvil. Se verificó legibilidad de las entradas largas 32–34 y 37 en escritorio, 390 y 320 después de ajustar los componentes y los textos iniciales. Se comprobó scroll del índice hasta la entrada 37. En 390 se probó guardado pendiente → confirmado; en 320, apertura y legibilidad del aviso de descarga. Los ocho avisos compartidos tienen una composición compacta, sin alterar el texto ni el guardado real de la aplicación.

Prueba de foco con estructura accesible del visor habilitada temporalmente: Enter abre el índice; Tab recorre Cerrar y las primeras entradas. **No pasa confinamiento:** Tab desde la última entrada llega a Marco anterior del anfitrión Figma. **No pasa retorno exacto:** Escape devuelve foco al ARTICLE de la tarjeta y no al botón de apertura. La preferencia temporal se restauró. No extrapolar estas muestras a accesibilidad del frontend; conservar pruebas de diálogo nativo y retorno al disparador en el plan de implementación.

La prueba de contexto no pudo configurarse: Figma rechazó las variables de prototipado por el plan actual. Se retiró la interacción sin acción resultante. Contexto sigue estático y no pasa la aceptación de actualización por tarjeta. No se ejecutaron tests del repositorio ni se certificó el recorrido completo de 24 semanas.

### Prototipo web publicado: ejecución pendiente

El despliegue independiente de Sites terminó correctamente y el archivo coincide byte por byte con el adjunto autorizado, incluido su iframe aislado y ambas CSP. La fuente contiene contexto de la tarjeta activa, conservación de borrador y un diálogo nativo con foco inicial, cancelación y retorno al disparador. Esta revisión es estática; no marca como aprobados el confinamiento ni el retorno de foco.

La prueba interactiva quedó detenida en el inicio de sesión: `auth.openai.com` fue autorizado por el usuario, pero su proveedor redirigió a `login.live.com`, pendiente de autorización específica o acceso manual. Después del acceso se debe probar, al menos: QA → MariBug (contexto QA) → cerrar → QC → MariBug (contexto QC, borrador conservado); abrir los tres modales con teclado; Tab/Shift+Tab desde primer/último control sin escapar al fondo; Escape y retorno al mismo disparador; y cambio de tarjeta desde el índice con foco en el título. No confundir el estado succeeded del despliegue con esos resultados funcionales.

### Verificación posterior en Sites · 27 de octubre de 2026

El usuario completó el acceso manualmente. En el original se detectaron escapes de foco y pérdida de foco tras reconstruir contenido. Se conservaron sus bytes y se corrigió una revisión independiente en /revision, commit 76159604d56633be5b9f5b0dcf7eab398bb9eff3. El despliegue terminó en succeeded; véanse identificadores y captura en el último checkpoint del handoff.

| Muestra manual | Resultado en la revisión web |
| --- | --- |
| QA → QC con MariBug | Cambia contexto, conserva borrador y prepara explícitamente una pregunta QC |
| Menú cerrado | Tab recorre seis enlaces y ocho resúmenes y vuelve a Cerrar; Shift+Tab recorre el límite inverso |
| Módulo 08 expandido | Sus cinco enlaces entran en el recorrido circular sin escapar del diálogo |
| Índice | Shift+Tab desde Cerrar llega a tarjeta 37; Tab vuelve a Cerrar |
| MariBug | Shift+Tab desde Cerrar llega a Archivar; Tab vuelve a Cerrar; preparar pregunta enfoca el editor |
| Escape en los tres modales | Cierra y devuelve foco al botón de apertura correspondiente |
| Anterior/Siguiente QA/QC | Foco conservado en el título de la tarjeta activa |

En la versión previa también se verificaron salto del índice al título y archivar/restaurar con foco válido. El último cambio solo excluye del recorrido los enlaces de módulos cerrados. Estas muestras no certifican todos los CA ni los 24 contenidos. Guardado e IA siguen simulados; D1 y aprobación humana pendientes. El original / no hereda la corrección de /revision. No se modificó ni ejecutó código de aplicación.

### Implementación local aprobada

El piloto inicial del 27 de octubre se validó mediante `tests/study-steps.test.mjs` y `apps/web/tests/e2e/focused-study.spec.ts`, con regresión de `lesson-pagination.spec.ts`. En ese checkpoint D1 positivo permanecía abierto. **Actualización del 28 de octubre:** el candidato enfocado sí registra `reading-section` cuando cumple la política original y verifica geometría; [validación D1](study-focused-d1-validation.md) reúne 86 casos distintos satisfactorios, muestras numéricas y límites. El registro positivo y el ACK remoto se ejercitan; navegación sin crédito sigue siendo una prueba independiente. El lector anterior conserva su rastreador y la activación predeterminada.
