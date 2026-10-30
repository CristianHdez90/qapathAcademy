# Estudio enfocado — modelo y compatibilidad de pasos

Estado: diseño aprobado para implementación local el 27 de octubre de 2026; validación geométrica D1 pendiente. Base y evidencia: [AS-IS](study-focused-as-is-evidence.md). El modelo es de presentación; no añade comandos académicos ni campos a la API. Véase [piloto implementado y límites](study-focused-implementation.md).

## Orden determinista

Un `StudyStep` propuesto identifica semana, clave estable, tipo, título, origen de contenido, capítulo académico opcional y alias anteriores. El índice visual se calcula del orden; nunca se usa como identidad persistente. Un solo paso interactivo está montado; los demás son datos.

| Orden / tipo | Fuente íntegra | Clave / destino propuesto | Tratamiento |
|---|---|---|---|
| 1 · introducción | week.title/goal, guide.level/duration/summary | `study-intro` | Título y metadatos compactos; resumen en tarjeta, sin repetirlo en todas |
| Por cada sección i · introducción de capítulo | sections[i].title/body | `chapter-i--intro` | Conserva explicación inicial antes de conceptos |
| Por cada concepto, en orden | id/title/description/example/demonstration | `chapter-i--concept-{id}` | Una tarjeta por concepto; situación, acción, resultado y secuencia juntos |
| Después de conceptos · puntos clave | sections[i].points, si no vacío | `chapter-i--points` | Lista completa en orden; no inventar resumen |
| Ejemplo guiado · contexto | example.title/context | `chapter-S--intro`, S=sections.length | Sigue perteneciendo a la sección académica S |
| Conceptos guiados, si existen | example.concepts | `chapter-S--concept-{id}` | Igual formato de concepto; IDs prefijados evitan colisiones |
| Secuencia guiada alternativa | example.steps, solo si no hay concepts | `chapter-S--steps` | Una lista ordenada completa, no convertirla en nuevos criterios |
| Código guiado, si existe | example.code/language | `chapter-S--code` | Código íntegro, monoespaciado y scroll horizontal contenido |
| Práctica adicional, si llega en API | guide.exercise y panel actual | `practical-exercise` | Mantener objetivo, herramientas, entregables/enlaces; laboratorio en /practice |
| Autoevaluación | guide.question y opciones/explicación | `self-check` | Selección y feedback conservados; no enviar por navegar |
| Notas | state.notes[week], SaveFeedback | `study-notes` | Mantener etiqueta, estado de sincronización y reintento |
| Recursos | guide.links y pitfall | `study-resources` | Enlaces íntegros y advertencia actual; mismo destino y seguridad |
| Cierre de recorrido | Estado académico, enlace al test y siguiente semana | `study-finish` | «Fin del recorrido» no significa semana completada |

Si body o contexto se vuelven vacíos, omitir tarjeta vacía manteniendo el alias dirigido al primer descendiente existente. Ante ID repetido en un mismo capítulo, exigir diagnóstico de contenido, no sobrescribir silenciosamente una tarjeta. Encabezados/etiquetas pueden cambiar de formato, nunca el significado ni los textos académicos.

`example.steps` cuando existen concepts, y `activity`/`answer`, conservan exactamente la visibilidad/descarga actual. Mostrar contenido alternativo que hoy no se renderiza requeriría decisión explícita; no se añade para inflar el recorrido. Descargar clase sigue exportando la clase completa con su lógica actual, no la tarjeta activa.

## Inventario de las 24 semanas

Generado por lectura del JSON en el SHA base. S=secciones, C=conceptos de secciones, P=listas de puntos no vacías, G=conceptos guiados. Todas las guías tienen conceptos guiados; no se activa hoy la alternativa de steps. La cantidad propuesta incluye introducción, contextos, puntos, código y cuatro pasos finales; el ejercicio incorporado por API añade una tarjeta cuando existe. Las cifras no son porcentajes académicos.

| Semana | S | C | P | G | Código | Pasos sin ejercicio API |
|---|---:|---:|---:|---:|---|---:|
| 1 | 3 | 21 | 1 | 4 | Sí | 36 |
| 2 | 3 | 19 | 0 | 4 | No | 32 |
| 3 | 3 | 6 | 3 | 4 | No | 22 |
| 4 | 3 | 6 | 3 | 4 | No | 22 |
| 5 | 3 | 7 | 3 | 5 | No | 24 |
| 6 | 3 | 6 | 3 | 4 | No | 22 |
| 7 | 4 | 9 | 4 | 4 | Sí | 28 |
| 8 | 3 | 6 | 3 | 3 | Sí | 22 |
| 9 | 4 | 8 | 4 | 3 | Sí | 26 |
| 10 | 3 | 6 | 3 | 3 | Sí | 22 |
| 11 | 3 | 6 | 3 | 3 | Sí | 22 |
| 12 | 3 | 6 | 3 | 4 | Sí | 23 |
| 13 | 3 | 6 | 3 | 4 | Sí | 23 |
| 14 | 3 | 6 | 3 | 3 | Sí | 22 |
| 15 | 3 | 6 | 3 | 3 | Sí | 22 |
| 16 | 3 | 6 | 3 | 3 | Sí | 22 |
| 17 | 3 | 6 | 3 | 3 | Sí | 22 |
| 18 | 3 | 6 | 3 | 3 | Sí | 22 |
| 19 | 3 | 6 | 3 | 3 | Sí | 22 |
| 20 | 3 | 6 | 3 | 3 | Sí | 22 |
| 21 | 3 | 6 | 3 | 4 | Sí | 23 |
| 22 | 3 | 6 | 3 | 4 | Sí | 23 |
| 23 | 3 | 6 | 3 | 5 | No | 23 |
| 24 | 3 | 6 | 3 | 5 | No | 23 |

Fórmula reproducible: 1 + S + C + P + 1 + G + (código ? 1 : 0) + 4; después sumar ejercicio condicional. Verificar también la respuesta enriquecida del adaptador antes del piloto.

El archivo `practical-exercises.json` contiene entradas para las semanas 1–24 en esta base; el adaptador las incorpora. Por ello, con el catálogo actual completo, el total enriquecido propuesto es la última columna más uno: semana 1 tiene 37 pasos, semana 2 tiene 33, etc. Mantener la condición en el modelo para respuestas futuras sin ejercicio; no acoplar el contador a una cifra fija.

### Ejemplo exacto de orden: semana 1

1. `study-intro`.
2. `chapter-0--intro`; conceptos `qa`, `qc`, `testing`, `error`, `defect`, `failure`, `verification`, `validation`.
3. `chapter-1--intro`; conceptos `sdlc`, `stlc`, `iteration`, `refinement`, `development`, `release`.
4. `chapter-2--intro`; conceptos `presence`, `exhaustive`, `early`, `cluster`, `refresh`, `context`, `useful`; `chapter-2--points` con sus dos puntos.
5. `chapter-3--intro`; conceptos guiados `error`, `defect`, `failure`, `evidence`; `chapter-3--code`.
6. Ejercicio API cuando esté disponible; `self-check`, `study-notes`, `study-resources`, `study-finish`.

Cada concepto de la lista usa el prefijo de su capítulo. Así `chapter-0--concept-error` y `chapter-3--concept-error` son distintos y conservan sus textos propios.

## Mapa de enlaces

| Entrada anterior / nueva | Resolución |
|---|---|
| `/study/{week}#chapter-i`, 0 ≤ i < S | Primer paso existente de esa sección; normalmente `chapter-i--intro` |
| `/study/{week}#chapter-S` | Contexto del ejemplo guiado |
| `#practical-exercise` | Tarjeta del panel; si no existe, aviso recuperable y primera tarjeta, sin fabricar actividad |
| `#self-check`, `#study-notes`, `#study-resources` | Mismos IDs y función |
| Nuevo ID fino válido | Tarjeta exacta |
| `#contenido` | Mantener salto accesible al main; no interpretarlo como logro o tarjeta inexistente |
| `/practice/{week}`, `/modules/{module}#module-quiz`, enlaces externos | Navegación original; no interceptar como pasos |
| Hash desconocido | Aviso no bloqueante y comienzo; no modificar datos de progreso |

Prioridad: hash explícito válido → última unidad válida de la semana → introducción. Un hash explícito desconocido no se sustituye silenciosamente por una posición antigua. Al cargar alias legado se conserva la URL hasta la siguiente navegación voluntaria. Siguiente/anterior e índice añaden una entrada por acción; popstate/hashchange restauran sin añadir otra. Conservar clic modificado, nueva pestaña, destino y origen externos.

Reanudación propuesta en sessionStorage, por identidad/rol/semana y versión de claves, solo posición de interfaz. No notas, preguntas, tokens ni correos. Al cambiar de identidad se elimina caché de sesión anterior; un ID retirado cae al capítulo compatible o inicio. Esta reanudación no existe actualmente y requiere aprobación del diseño.

Tras montar: enfocar título con tabindex=-1 y anunciar título/contador una sola vez. Volver a tarjeta visitada restaura scroll; entrada nueva comienza arriba. Saltar desde índice prioriza foco del nuevo título sobre devolverlo al disparador del modal.

## Lectura y estado: contrato del adaptador propuesto

Los pasos de cada sección conservan su índice académico original; ejemplo usa S. Introducción semanal, práctica, notas, recursos y cierre no añaden secciones académicas. Nunca emitir `reading-section` desde el stepper ni desde el índice.

La propuesta se concreta en la resolución documental D1 siguiente. Conserva índices y predicado académico; la equivalencia geométrica en navegador debe demostrarse antes de aprobar el adaptador. No se considera una implementación probada.

El estado UI vive por encima del paso activo: respuesta elegida, demostración/pausa, posiciones y expansión del árbol. El proveedor actual sigue siendo la fuente de notas/logro/errores. Cambiar semana o cuenta reinicia solamente el estado de interfaz correspondiente. Cerrar un modal no desmonta ni proveedor ni controlador de chat.

## D1 · Resolución documental de equivalencia de lectura

### 1. Qué significa equivalencia

Se distinguen tres afirmaciones:

1. **Contrato académico:** mismas secciones enteras, mismo comando `reading-section`, mismas reglas de finalización y ningún cambio de API o dominio. Se conserva por diseño.
2. **Decisión del cálculo:** para una misma secuencia de intervalos normalizados expuestos y deltas de atención, baseline y candidato deben producir exactamente la misma decisión. Se demuestra mediante la unión de intervalos descrita abajo.
3. **Equivalencia perceptual/geométrica:** que ver una tarjeta produzca los mismos intervalos que ver ese contenido en el capítulo anterior. Requiere medir el render real. No está demostrada por conservar 3 s/80 %/98 %, ni por esta documentación.

No es posible exigir igualdad para la misma secuencia de clics/scroll físico entre ambas pantallas: cambian las unidades visibles, el alto y los controles. La comparación válida usa exposición al mismo contenido, no posiciones de scroll idénticas. Tampoco el baseline verifica comprensión: en un capítulo corto que cabe entero, 3 segundos atentos pueden bastar.

**Recomendación:** aprobar como objetivo la equivalencia del contrato y de la decisión sobre exposición proyectada, condicionada a una caracterización geométrica satisfactoria. No declarar equivalencia pixel a pixel para todos los estados sin medirla. Una relajación de cobertura o tiempo sería otra decisión pedagógica, no una solución técnica implícita.

### 2. Referencia geométrica sin efectos inactivos

Para cada capítulo, definir una referencia de lectura con el contenido y orden del render AS-IS, al mismo ancho de lectura, tipografía, idioma, zoom y estado de recursos. Su altura H y los tramos de origen deben provenir de geometría de navegador, nunca de número de conceptos, palabras o tarjetas.

La medición propuesta es una representación estática de geometría, sin componentes interactivos, listeners, observers de lectura, IDs duplicados, tabuladores, llamadas de red o reproducción de medios; fuera del árbol accesible e inerte. No es una segunda clase montada/oculta. Los textos provienen del contenido original y las cajas de controles/demostración deben reproducir sus dimensiones verificadas. Se mide por capítulo cuando sea necesario, se descarta la representación y se retienen solo medidas en memoria. La tarjeta activa sigue siendo la única unidad interactiva montada.

Si no se pueden reproducir las dimensiones de un bloque dinámico mediante representación estática, no estimarlas como si fueran exactas. Registrar la discrepancia y bloquear aceptación de D1 para ese tipo. Un espejo con ConceptDemonstration u otros componentes vivos vulneraría REQ-02 y queda descartado. La viabilidad de esta medición es una hipótesis de implementación pendiente de autorización, no un recurso ya existente.

Dividir [0,H] en tramos contiguos que cubran título, body, conceptos, listas, código y espacios originales. Cada tramo pertenece a un paso o a una región estática visible de ese paso. Títulos y márgenes originales se asignan una sola vez; chrome nuevo, contador, barra flotante y relleno añadido no generan exposición. Si un espacio original no tiene una región homóloga visible, su medida no se acredita automáticamente ni se elimina del denominador: el piloto debe resolver el mapeo o declarar discrepancia. No conceder cobertura a tramos sin correspondencia verificable.

### 3. Proyección y predicado

Para un tramo original [a,b] y una región homóloga de la tarjeta, medir el intervalo realmente visible dentro de esa región como fracciones locales [u,v], con 0 ≤ u < v ≤ 1. Su exposición proyectada es:

```text
I = [(a + (b-a)*u)/H, (a + (b-a)*v)/H]
U = unión de todos los I acreditados al capítulo, sin duplicados
C = suma de las longitudes de los intervalos disjuntos de U
F = existe un intervalo de U cuyo extremo final sea >= 0.98
elegible = T >= 3000 ms AND C >= 0.80 AND F
```

La transformación lineal solo es admisible donde se demuestre correspondencia de contenido/geometría; no debe comprimir una tarjeta entera con cabecera nueva dentro de un concepto ni convertir una línea visible en varias líneas originales. Si cambia el salto de líneas, subdividir por regiones homólogas comprobables o rechazar la medición. No inventar un porcentaje de tolerancia que pueda cambiar decisiones en los límites.

Prueba algebraica limitada: proyectar cada exposición una vez al eje [0,1], fusionar por unión y aplicar el mismo predicado reproduce la decisión actual para esos mismos intervalos y T. El orden de visitas no altera U; repetir una vista no incrementa C; conservar huecos impide que ver principio y final equivalga a leer el centro. Esta prueba no demuestra que las regiones medidas sean correctas: eso corresponde a la caracterización visual.

### 4. Atención y ciclo de vida

- Mantener un acumulador T por capítulo académico, no por tarjeta. No exigir 3 segundos a cada concepto.
- Muestreo de 250 ms, delta máximo 500 ms, usando reloj monótono como el actual. Solo incrementar si proveedor listo, documento visible y enfocado, sin modal abierto y con nodo activo conectado y exposición válida.
- Conservar la guarda actual de visibilidad: ancho positivo, intersección horizontal y alto mostrado al menos `0.15 * min(alto de la región de lectura activa, alto del viewport)`. Aplicarla al contenido de lectura, no al relleno de la tarjeta. Su equivalencia respecto al capítulo completo es un punto de comparación obligatorio en el piloto.
- En transición: desobservar nodo anterior, montar el nuevo y observarlo tras commit. Establecer una nueva referencia temporal para no atribuir al destino tiempo transcurrido entre nodos. No acumular durante medición de geometría, carga sin texto visible o transición.
- No sumar tiempo por cada subregión simultáneamente visible: como máximo un delta por capítulo y tick. Los tramos aportan cobertura, no multiplican tiempo.
- Abrir índice/chat/menú pausa T y exposición; cerrar conserva U y T. Cambiar de paso conserva acumuladores en memoria. Cambiar semana/identidad los reinicia según el ciclo actual; progreso ya confirmado sigue en proveedor.

Al cambiar ancho, fuentes o geometría, recalcular medidas antes de aceptar nuevas muestras. Conservar intervalos normalizados históricos y T: el baseline también conserva esos intervalos al redimensionar. No resetearlos silenciosamente, pues exigiría más lectura; no transformarlos en contenido nunca visto. Los efectos de mezclar mediciones antes/después de reflujo son una limitación heredada que debe quedar en la traza comparativa. Una política nueva de invalidación o seguimiento semántico requiere decisión explícita y no se introduce en esta propuesta.

### 5. Guardado sin falsos logros

Estados del adaptador: pendiente → elegible → guardando → confirmado; ante error, error recuperable. Elegible no significa guardado. Emitir una sola operación simultánea por identidad/semana/sección usando el comando actual; usar la cola y `retrySave` existentes en fallo, sin crear otra cola paralela.

El tracker actual añade `queued` antes de resolver `recordLearning`; el nuevo diseño no debe interpretar ese marcador como ACK. Mostrar «Lectura registrada» únicamente a partir del estado académico confirmado del proveedor; en error conservar U/T durante la sesión y el reintento. Guardar en una tarjeta no exige quedarse en ella ni completar de nuevo la lectura. ADMIN/INSTRUCTOR no adquieren permisos de escritura por el adaptador.

### 6. Ejemplos analíticos de decisión

Estos son cálculos documentales, no tests ejecutados ni mediciones de navegador. Los intervalos representan exposición ya proyectada.

| Exposición U | T | C / final | Decisión actual y propuesta |
|---|---:|---|---|
| [0,0.10] y [0.90,1] | 3000 ms | 20 % / sí | No elegible: falta el centro |
| [0,0.79] y [0.99,1] | 3000 ms | 80 % / sí | Elegible; la regla actual admite huecos |
| [0,0.80] | 3000 ms | 80 % / no | No elegible: falta final |
| [0,0.60] y [0.80,0.98] | 3000 ms | 78 % / sí | No elegible: falta cobertura |
| [0,0.60] y [0.78,0.98] | 3000 ms | 80 % / sí | Elegible en aritmética exacta; comprobar precisión en código futuro |
| [0,1] | 2999 ms | 100 % / sí | No elegible: falta tiempo |
| [0,1] | 3000 ms | 100 % / sí | Elegible |
| [0,0.10] repetido 30 veces | 7500 ms | 10 % / no | No elegible; unión, no suma de visitas |

No exigir todas las tarjetas: el 80 % existente puede permitir omitir una unidad pequeña y aun alcanzar el extremo final. Si producto desea que cada concepto sea obligatorio, debe aprobar una regla académica distinta. La recomendación enfocada mantiene navegación libre y el predicado existente.

### 7. Estado de resolución y aceptación

**Actualización posterior:** el párrafo siguiente describe el cierre documental inicial. Véase [validación D1 del 28 de octubre](study-focused-d1-validation.md) para el candidato implementado, medición por líneas, evidencia ejecutable y límites vigentes.

**Resuelto en documentación:** unidad de acumulación, proyección, predicado, tiempo, efectos de navegación/modales, reflujo, guardado y escenarios discriminantes. **Pendiente de aprobación/validación técnica:** factibilidad de referencia estática, correspondencia geométrica y pruebas diferenciales de navegador. No existe código candidato, prototipo instrumentado ni traza de ejecución en esta tarea.

Rechazar la implementación si hay crédito por navegación, huecos inventados, pesos iguales, efectos inactivos, cambios de umbral o secciones nuevas. Si no es viable demostrar la correspondencia, mantener la lectura AS-IS hasta aprobar otra SPEC; no publicar una equivalencia declarada sin evidencia. La matriz concreta los ensayos que cerrarán R1.
