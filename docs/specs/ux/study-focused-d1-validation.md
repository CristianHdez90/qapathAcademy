# D1 · Registro de equivalencia de lectura

Fecha: 28 de octubre de 2026. Alcance: implementación local aprobada de UX-120, catálogo actual de 24 semanas. Base Git: `5dcbdf45b5b21b43d8f99ae01e0e62dbaa6c60c2`. Estado: D1 implementado y validado localmente en el alcance descrito; esta entrada no autoriza producción ni cambia el modo predeterminado.

Este registro distingue dos versiones: el checkpoint inicial de ancho fijo (86 casos) y la actualización posterior de conceptos de ancho completo (22 casos, muestra de cinco semanas). La evidencia vigente de esta última está al final; no interpretar las dimensiones originales descritas en el primer checkpoint como una restricción visual actual de los conceptos.

## Contrato conservado

El rastreador enfocado utiliza los mismos índices enteros de capítulo y el mismo comando `reading-section`. El ejemplo guiado conserva el índice `guide.sections.length`. Introducción de semana, ejercicios, autoevaluación, notas, recursos, índice y botones de navegación no son secciones de lectura.

Se conservan el mínimo de atención exportado por `@qapath/progress` (3.000 ms), cobertura acumulada >= 0,80 y exposición del extremo >= 0,98. La decisión utiliza `chapterWasTraversed` sin modificar sus umbrales ni añadir una tolerancia para aprobar. Los intervalos se fusionan por unión; saltar al final y repetir un fragmento no cubren el centro.

## Referencia y correspondencia verificable

`ReadingReference` produce exclusivamente el capítulo original: etiqueta, título, explicación, conceptos, listas y código, con sus clases de layout. Reutiliza `ReadingConcepts` y la vista pura `DemonstrationFrame`; no monta los controladores de demostración inactivos. La plantilla está oculta, inerte y fuera del árbol accesible, sin IDs. Sus botones están deshabilitados y carecen de handlers.

Para medir se clona esa plantilla en una estructura de layout con el ancho del documento. El host es invisible, inerte, sin eventos, sin animaciones y sin recursos nuevos; se elimina en `finally` al terminar. Se conservan solamente medidas y una plantilla pasiva del capítulo activo, no una segunda clase interactiva. Las pruebas comprueban ausencia de IDs/controles habilitados y que ningún host de medición queda en el DOM.

Los límites de cada región proceden de rectángulos reales del navegador, incluyendo los espacios originales. Se usan como regiones: introducción del capítulo, cada celda de concepto, puntos, secuencia alternativa y código. Los márgenes y el final de sección se asignan una vez. El nuevo encabezado, contador, padding de la tarjeta, navegación y herramientas flotantes quedan fuera del eje académico.

La región activa conserva el ancho de su región original, sus estilos de texto y su altura de origen. Se comprueban etiquetas, texto, cajas y **cada línea de texto** mediante `Range.getClientRects()`. También se comprueban ancho y altura del contenedor de exposición. El desplazamiento horizontal del código se normaliza para comparar layout; no se inventa una exigencia horizontal que no existía en el rastreador anterior.

La comparación de layout cuantiza diferencias a unidades de 1/64 px para evitar cancelación numérica de coordenadas `DOMRect`. Esto solo decide si las geometrías corresponden: los intervalos de origen y la decisión 80 % / 98 % mantienen sus valores sin redondear. No se añade epsilon a los umbrales académicos. Las alturas completas se comparan además contra el lector anterior en navegador, no solo contra el propio candidato.

**Checkpoint visual inicial:** la primera implementación conservaba el ancho de una columna del capítulo anterior. El propietario solicitó después corregir la tarjeta estrecha de escritorio para ocupar el ancho disponible. La actualización «Conceptos de ancho completo» al final de este documento sustituye esa restricción visual mediante un mapeo de fragmentos de texto; no declara iguales los rectángulos de dos textos con distinto reflujo.

## Filas, reflujo e historia de exposición

Una fila original con dos columnas no se acredita viendo solo una de ellas. Cada región aporta su intervalo expuesto al eje normalizado del capítulo; la fila aporta la intersección de los intervalos de sus columnas homólogas. Esto evita acreditar el concepto vecino que todavía no se mostró. Los pesos proceden de geometría, no de contar tarjetas, palabras o conceptos. No existe una condición de «todas las tarjetas visitadas».

La historia confirmada de intervalos y el tiempo viven por capítulo en memoria. Al cambiar geometría se mide de nuevo, sin reescalar los intervalos históricos ni conceder automáticamente antiguas exposiciones de una columna sin su pareja. Solo una nueva muestra visible puede añadir crédito. Se conserva la limitación heredada del lector anterior: intervalos normalizados históricos pueden coexistir después de un reflujo. No se promete equivalencia pixel a pixel entre secuencias físicas de scroll distintas.

## Atención y fallos

Se muestrea cada 250 ms, con delta máximo de 500 ms y una sola suma de tiempo por capítulo y tick. El timer empieza después de `ready` y de verificar geometría; las transiciones no reciben tiempo previo. La guarda de visibilidad se aplica a la región activa según el diseño D1 aprobado: al menos el 15 % del menor entre región y viewport, además de ancho positivo e intersección horizontal.

Documento oculto o sin foco, diálogo abierto, región desconectada/oculta/invisible/inerta, proveedor no listo o geometría diferente no aportan atención ni exposición. La parte tapada por la barra flotante se excluye. Fuentes, resize y cambios de dimensiones disparan nueva medición. Una discrepancia impide registrar lectura y mantiene disponible la vista por capítulos; no reduce umbrales para completar.

Elegible, pendiente y confirmado son estados distintos. Se envía una operación por sección y se reutilizan la cola, errores y `retrySave` del proveedor. El contador de capítulos proviene exclusivamente de `state.readingSections`, no del marcador local de envío. No hay nueva cola, persistencia paralela, permiso de escritura o cambio de dominio.

## Evidencia ejecutable

- `tests/focused-reading.test.mjs`: proyección por longitudes medidas, filas con columnas, huecos, repeticiones, reflujo y límites de tiempo/cobertura con el oráculo anterior.
- `apps/web/tests/e2e/focused-reading.spec.ts`: regiones de las 24 semanas en Chromium y WebKit; comparación con capítulos reales de semanas 1/7/9 en 320, 390, 768, 1024 y 1440 px; demostraciones, código horizontal y bloqueo por alteraciones.
- Pruebas de registro efectivo, documento sin foco/oculto, modales, resize y fallo remoto con reintento. Las APIs privadas se simulan en contextos aislados; no se modifica el progreso del propietario.
- `qapath:reading-observation`: evento local con datos públicos de región y muestras numéricas, sin identidad, notas, mensajes o credenciales. El producto no almacena ni envía esas observaciones. Los tests adjuntan copias de sus muestras ficticias y verifican cada decisión contra `chapterWasTraversed` y el mínimo de atención.

La pérdida de foco y el documento oculto se ejercitan sobrescribiendo esas dos propiedades del DOM únicamente en el contexto aislado de prueba. Playwright sin ventana puede mantener el foco de una página aunque se abra otra pestaña: no se presenta esa simulación como una certificación del cambio de foco del sistema operativo. Los modales, navegación, geometría y guardado sí se ejercitan mediante controles reales del candidato.

## Resultados de navegador · 28 de octubre

Se ejecutaron **86 casos D1 distintos, todos satisfactorios** entre Chromium y WebKit, en lotes separados, sin omisiones:

| Grupo | Casos | Evidencia local de este chat |
|---|---:|---|
| Todas las regiones de las 24 semanas, por motor | 48 | `d1-geometry-final` (24 Chromium) y `d1-webkit-confirmed` (24 WebKit) |
| Capítulo guiado real frente a referencia: semanas 1/7/9 × 320/390/768/1024/1440 px × ambos motores | 30 | `d1-matrix-confirmed`: alturas completas idénticas, líneas verificadas, sin overflow horizontal |
| Registro positivo, modales/sin foco/oculto, resize, demostraciones/código/alteraciones y guardado con reintento | 8 | `d1-runtime-confirmed` y repetición de confirmación en `d1-matrix-confirmed` |

Los directorios son subcarpetas de `C:/Users/ingcr/.codex/visualizations/2026/10/24/01a16b4f-61a0-7942-86a7-5e0a94117322/`. Los dos lotes iniciales de geometría también contienen intentos fallidos de otras pruebas: **no se atribuye un exit code global satisfactorio a esos lotes**. Solo sus 24 casos de catálogo por motor forman el resultado de la primera fila. La batería final de matriz y confirmación sí terminó con `32 passed`, exit code 0 (6,2 minutos).

El primer reintento remoto en WebKit falló al comprobar el hash antes de terminar la inicialización de identidad. Se añadió espera explícita del proveedor antes de recorrer la lectura; la repetición final pasó en ambos motores, conservando las aserciones de un solo intento fallido, contador no confirmado y un solo reintento. Los cambios de hash públicos se resuelven sin esperar a la identidad; el caché por cuenta sí espera esa carga.

Comandos reproducibles desde `apps/web/`, con el servidor local en 3012 y las librerías compiladas:

```powershell
$env:E2E_BASE_URL='http://localhost:3012'
node node_modules/@playwright/test/cli.js test focused-reading.spec.ts --grep 'every source region' --workers=1 --reporter=line --output '<directorio nuevo para catálogo>'
node node_modules/@playwright/test/cli.js test focused-reading.spec.ts --grep 'source geometry|confirmation' --workers=2 --reporter=line --output '<directorio nuevo para matriz>'
node node_modules/@playwright/test/cli.js test focused-reading.spec.ts --grep 'covering|attention pauses|live demonstration' --workers=1 --reporter=line --output '<directorio nuevo para atención>'
```

Los tests de atención escriben y adjuntan `d1-source-samples.json`. La repetición final con archivos persistentes terminó **6/6 satisfactoria**, exit code 0, 1,7 minutos, en `d1-samples-final`; resumen estructurado `d1-samples-results.json`. Son repeticiones de casos ya incluidos en los 86, no seis casos adicionales. Cada muestra comprueba el límite de delta, mínimo de atención, intervalo local y la decisión del oráculo original. Captura positiva inspeccionada: `d1-lectura-registrada.png` en la raíz de visualizaciones; muestra 1 de 4 capítulos registrados. No demuestra una semana completa ni una conexión real al backend.

La aprobación de D1 no sustituye las demás puertas de UX-120: accesibilidad integral, revisión del compromiso visual, sesión real en QA, Preview y autorización de producción.

## Regresión de experiencia

`focused-study.spec.ts` y `lesson-pagination.spec.ts`: repetición final **16/16 casos satisfactorios**, exit code 0, 2,1 minutos, directorio `d1-regression-final`. Conserva navegación/historial, notas y autoevaluación al desmontar, contexto/borrador de MariBug sin envío automático, teclado/foco, cinco anchos, recursos fuera del layout enfocado y guardado de notas con reintento.

Una ejecución anterior tuvo 15/16: el selector genérico de sidebar encontraba también la plantilla pasiva, correctamente oculta. Se delimitó el selector al menú real con su nombre accesible, manteniendo las aserciones de visibilidad y foco. No se alteró el producto para hacer pasar esa prueba. La repetición final ejecutó los 16 casos, sin omitir el que había fallado.

## Verificación del proyecto y cierre local

`pnpm.cmd check` terminó con exit code 0: **219/219 pruebas Node**, comprobación de tipos de API/frontend, ESLint y compilación de API/frontend satisfactorias. `git diff --check` no informa errores de espacios. Los avisos de conversión LF/CRLF corresponden al entorno Windows, sin diferencias de contenido generadas en `next-env.d.ts` o `learning-tree.json`.

D1 queda validado **localmente para el catálogo y estilos actuales**, con equivalencia de contrato, predicado y regiones verificadas, dentro de los límites descritos. No constituye una certificación de scroll físico idéntico, una auditoría integral de accesibilidad o una aprobación de producción. No se hicieron commit, push, migraciones, cambios en dominio/API ni despliegues. No se cambia la vista predeterminada.

## Conceptos de ancho completo · actualización posterior del 28 de octubre

Solicitud del propietario: «en desktop se muestra … la tarjeta debe quedar en toda la pantalla». Se elimina el tope de ancho del contenedor enfocado y los conceptos usan el 100 % del espacio interior de su tarjeta. Su altura es natural, con tipografía adaptable; desaparece la columna estrecha y el espacio reservado a su altura anterior. En móvil se ajustan al viewport sin desbordamiento. Introducciones, listas y código conservan la correspondencia geométrica anterior.

Para conceptos con distinto reflujo, `reading-text-map.ts` identifica los caracteres no blancos por orden de texto dentro del mismo DOM y conserva la firma de etiquetas y textos. La referencia pasiva sigue siendo el **capítulo anterior real**, con su altura, intervalos y columnas. No se sustituye por una referencia de una columna ancha ni se reparten pesos iguales.

La referencia divide el eje de origen en bandas por los límites verticales de sus glifos. Para acreditar una banda deben haberse expuesto **todos** sus caracteres homólogos en la tarjeta visible, aunque ahora ocupen otras líneas. Solo se toman glifos completamente visibles; texto oculto, inerte o transparente no aporta. Los espacios entre líneas requieren las dos líneas vecinas; los espacios exteriores requieren además haber expuesto el borde real superior/inferior de la tarjeta. Las bandas se proyectan al intervalo original y pasan por la misma intersección de columnas y unión histórica de D1. No se proyecta linealmente toda la altura nueva sobre la anterior.

El historial de caracteres se separa por tarjeta, firma y geometría de referencia. Al cambiar esa geometría se conservan los intervalos ya confirmados y el tiempo, pero no se reproyectan automáticamente caracteres pendientes. Cada muestra sigue usando los umbrales originales, pausas y ACK del proveedor. La verificación bloquea un contenido cambiado o un contenedor que recorta el concepto. El mapeo es conservador: puede exigir exponer por completo una línea que el rastreador anterior aceptaba parcialmente; no se afirma identidad de secuencias físicas de scroll.

Los 86 casos anteriores documentan la versión de ancho fijo. Los resultados de esta actualización se registran por separado; no se atribuyen automáticamente al nuevo mapeo.

### Evidencia de ancho completo

**22 casos distintos satisfactorios en Chromium y WebKit**, agrupados en:

- Ancho útil superior a 1.500 px en viewport de 1.920 px; adaptación a 1.440, 390 y 320 px; bloqueo por contenido cambiado o contenedor recortado.
- Todas las regiones de semanas 1, 4, 7, 9 y 24, con referencia pasiva sin IDs/controles activos/hosts residuales.
- Lectura positiva, modal, foco/visibilidad simulados, resize, demostración en sus estados, código horizontal y error/reintento con ACK.
- Regresión del menú, teclado y aislamiento de la vista en cinco anchos.

`fullwidth-verified` obtuvo 17 satisfactorios y cinco recorridos WebKit agotaron el presupuesto total de 60 segundos. Los cinco recorridos se repitieron completos con 120 segundos por guía y un worker en `fullwidth-webkit-final`: **5/5 satisfactorios**, exit code 0, 4,6 minutos. No se cambiaron las aserciones por región ni los 3.000 ms / 80 % / 98 % académicos. Resúmenes estructurados: `fullwidth-verified-results.json` y `fullwidth-webkit-results.json`, en la raíz de visualizaciones de este chat. No se afirma que el primer lote completo terminara con éxito.

Se agregaron tres pruebas unitarias de proyección conservadora: todos los caracteres de una banda, recorte/texto oculto/cambiado, y exposición de los bordes exteriores. La captura inspeccionada `estudio-tarjeta-ancho-completo.png` muestra el concepto de particiones de semana 4 extendido en escritorio. Las APIs de cuenta continúan simuladas en los E2E. Para esta actualización no se repitió el inventario completo de las 24 semanas en ambos motores; se declara la muestra ejecutada, además de la validación histórica anterior.

Verificación final de esta actualización: **`pnpm.cmd check` satisfactorio**, exit code 0: 222/222 pruebas Node, tipos, ESLint y compilación de API/frontend. El cambio continúa únicamente en local; sin publicación ni activación predeterminada.
