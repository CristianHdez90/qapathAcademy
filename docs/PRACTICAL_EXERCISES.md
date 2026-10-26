# Ejercicios prácticos adicionales

## Semana 5 · Misión de reporte y ciclo del bug

El laboratorio guía reproducción (200 − 50, esperado 150, obtenido 195), reporte en tres partes, triage, asignación y corrección. La primera entrega conserva el fallo para practicar una reapertura; después se aplica la corrección simulada, se verifica el retest original y se comprueba otro importe antes de cerrar. Las transiciones legales y la finalización se recalculan desde el reporte y los eventos en @qapath/progress, tanto en la interfaz como en la API. Reportar o asignar no completa la actividad.

La bitácora adjunta reporte, responsable, historial con fechas, ambos retests y regresión. Las seis reflexiones son opcionales y conservan el orden de los campos anteriores. Se pueden guardar borradores sin reproducir ni cerrar todavía; el informe Markdown reúne la evidencia registrada. La matriz desaparece de la práctica y de sus archivos, pero las matrices y ejecuciones anteriores se conservan en el registro. El límite de exercise:5 pasa a 32000 caracteres para admitir reporte, historial y trabajo previo, sin cambiar la base de datos. El resto de semanas mantiene sus límites. No requiere migración ni crea tickets externos.

## Semana 4 · Explorador de particiones y fronteras

La semana 4 sustituye el formulario genérico por siete desafíos de contraseña: longitudes 7, 8, 20 y 21 con dígito, representante interior de 12 con dígito, 12 letras sin dígitos y entrada vacía. El estudiante prepara el dato, predice aceptar/rechazar y ejecuta. La regla y la cobertura viven en @qapath/progress y se recalculan también al validar la evidencia en la API. El dato debe corresponder al desafío y la predicción debe coincidir con la regla; un rechazo esperado puede ser correcto. Solo cubrir los siete habilita finalizar la práctica.

La bitácora guía revisión, reflexión con pistas y guardado/exportación Markdown. Conserva la última ejecución por desafío, con predicción, obtenido y fecha; permite guardar intentos y reflexiones incompletas. Las observaciones antiguas se conservan por posición y la matriz antigua queda almacenada, sin mostrarse ni otorgar avance. No hay matriz de casos ni archivos de matriz en esta práctica. El kit sigue disponible con su guía actualizada. No requiere migración.

Se añade un ejercicio por cada una de las 24 semanas. Las lecturas, los ejemplos de práctica guiada y las preguntas de selección se conservan. El avance práctico depende exclusivamente de completar la actividad /practice de esa semana; retos, entregables antiguos y laboratorios dejan de ser requisitos del recorrido.

Los ejercicios viven en `libs/content/src/data/practical-exercises.json` y se combinan con la guía al consultar una lección. Cada módulo enlaza a las prácticas de sus semanas. La clase permite expandir el ejercicio y descargar el material; su exportación Markdown incluye también los pasos adicionales.

| Semanas | Ejecución y entregables |
| --- | --- |
| 1–2 | Resultados esperados/observados, matriz de casos y priorización por riesgo. |
| 3–6 | Criterios verificables, límites, decisiones, bug reproducible, retest y trabajo de Sprint. |
| 7 | Postman: códigos HTTP, permisos ficticios, contrato, errores y CSV. |
| 8 | SQL con tablas temporales, JOIN, agregaciones, DevTools y Git. |
| 9–12 | Unit tests, JSON, TypeScript estricto, validación runtime y errores asíncronos. |
| 13–16 | Playwright UI, locators accesibles, debugging y matriz de navegadores. |
| 17–20 | Page Objects, fixtures, aislamiento, API y mocks con recuperación. |
| 21–24 | Pipeline, artifacts, métricas, trazabilidad, proyecto integrador y demo profesional. |

## Entorno ejecutable

`/practice` ofrece QA Store: cotizador ficticio y explorador HTTP. `/api/v1/practice/*` es un sandbox público y stateless, separado de usuarios y pedidos reales. Solo devuelve fixtures y cálculos; no consulta PostgreSQL ni procesa pagos. No acepta una URL de destino, código o SQL para ejecutar en el servidor.

- `GET products`: tres productos ficticios.
- `POST quotes`: 200 para cotizaciones válidas, 400 para tipos/campos inválidos, 404 para producto inexistente, 409 para agotado y 422 para reglas de negocio.
- `GET status/:code`: simulación controlada de 200/201/202/204/400/401/403/404/409/422/429/500/503. 204 sin cuerpo; 429/503 con Retry-After: 5. 201 no crea un recurso persistente.
- `GET access?scope=read|write`: los tokens públicos `demo-reader` y `demo-admin` ilustran 401/403/200. No son JWT, sesiones ni permisos reales de la academia.

El defecto opcional afecta solo al total mostrado en la UI del cotizador. Para basic × 3 + QA10 + delivery, la API calcula 104500 COP; la variante defectuosa muestra 103500 COP. Se puede desactivar para realizar el retest.

## Kit descargable

`apps/web/public/practice/kit/` contiene una colección Postman de 27 solicitudes, 8 filas CSV/JSON, plantillas de casos, resultados sintéticos, SQL, funciones Node.js, pruebas unitarias, specs UI/API/network, Page Object, fixture, configuración de tres navegadores, README y workflow de GitHub Actions.

La colección descargada desde el entorno web utiliza el origen actual como baseUrl. El kit estático usa el dominio de QAPath como ejemplo y explica cómo cambiar BASE_URL. La instalación del alumno genera su package-lock.json; debe versionarlo para usar npm ci en CI.

Tras editar los archivos del kit, regenerar el ZIP desde PowerShell en la raíz:

```powershell
Compress-Archive -Path apps/web/public/practice/kit/* -DestinationPath apps/web/public/practice/qapath-practice-kit.zip -Force
```

## Evidencia y compatibilidad

Se guarda mediante `submit-evidence`, `kind: exercise`, ID de semana 1–24, en `evidence["exercise:7"]`. Se reutilizan almacenamiento JSONB, guardado/reintento y separación por cuenta existentes. No requiere migraciones SQL.

La etapa Práctica depende exclusivamente de la evidencia exercise de cada semana con completion validated. La semana 1 exige su matriz validada; las demás exigen una ejecución correcta del tipo correspondiente, guardada al finalizar la práctica. Los borradores y las evidencias task/lab anteriores se conservan pero no conceden esta etapa. El porcentaje se recalcula sobre cuatro etapas: lectura, práctica, autoevaluación y test. Importar un respaldo autenticado continúa recuperando solo notas, sin otorgar finalización ni evidencia no verificada.

La plataforma registra lo entregado; no certifica automáticamente que un estudiante ejecutó Postman o una terminal externa. Los criterios de calidad y entregables permiten revisar ese trabajo.

## Validación

- `node --test tests/*.test.mjs`: cobertura, contratos, preservación de avance y reglas existentes.
- `pnpm test:e2e:firebase`: base local desechable, persistencia en PostgreSQL, regresiones y pruebas Chromium/WebKit.
- `pnpm test:e2e:firebase --practice-only`: colección Postman contra HTTP real local, fixtures de datos, evidencia, responsive y ejecución de los propios specs descargables del kit.

El runner rechaza Neon y producción. Los fixtures SQL se ejecutan en una base de práctica con tablas TEMP y ROLLBACK; no son tablas de la academia.

Referencias: [Postman scripts](https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-examples/), [Playwright assertions](https://playwright.dev/docs/test-assertions), [GitHub Actions con Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs).
# Actividades específicas por semana

Los botones de cada lectura abren `/practice/1` a `/practice/24`. Cada página obtiene su ejercicio desde la API, presenta instrucciones, entregables y criterios de esa semana y ofrece campos adecuados a su tarea: Gherkin, riesgos, historia, diseño, reporte de bug, Postman, SQL, código, automatización, pipeline, métricas o entrega. QA Store permanece como laboratorio compartido y se puede abrir dentro de las actividades que lo necesitan; las tareas locales de SQL, código y CI explican las herramientas de ejecución externas.

El trabajo se guarda en `evidence["exercise:N"]`, reutilizando la persistencia existente, con descarga Markdown del borrador. Las evidencias anteriores se conservan y pueden consultarse; no se modifican los requisitos ni porcentajes de la ruta. No requiere migración SQL.

## Práctica 1 · HU y matriz interactiva

`/practice/1` separa la HU BDD y sus escenarios Gherkin de los pasos de ejecución del caso (acciones numeradas). Presenta cinco ejemplos trazados a criterios: partición válida, partición inválida, valores límite, tabla de decisión y transición de estado.

La tabla permite agregar/eliminar casos y exportar CSV. El laboratorio calcula el obtenido desde datos JSON de transferencia; no copia el esperado. Simular el defecto permite practicar el reporte de bug. Cada caso fallido requiere un bug relacionado. Cambiar la definición exige volver a ejecutar.

Guardar evidencia permite conservar borradores. Validar práctica requiere al menos un caso completo y ejecutado por cada ejemplo; la misma regla se comprueba en el dominio al recibir `completion: validated`. La evidencia de esta práctica admite hasta 32000 caracteres y se conserva al recargar; el resto mantiene sus límites anteriores. La validación de este ejercicio completa la etapa Práctica. Lectura, autoevaluación y test del módulo conservan sus requisitos. No requiere migración de base de datos.

Guía descargable: `apps/web/public/practice/kit/guides/foundation-hu-design.md`. Para reconstruir el kit preservando archivos ocultos: `powershell -NoProfile -ExecutionPolicy Bypass -File scripts/build-practice-kit.ps1`.

La evidencia de la semana 1 usa una guía de tres pasos: inspeccionar los casos TC y comparar esperado/obtenido, explicar decisiones con preguntas y pistas, y revisar/guardar/exportar la entrega. Reutiliza la matriz, señala ejecuciones desactualizadas y orienta sobre bugs y retest; las referencias REF no cuentan como entregas. Mantiene las reflexiones previas por posición, permite borradores y conserva la validación existente al guardar observaciones si los casos siguen válidos. El informe Markdown incluye la matriz y los bugs, sin inventar fechas de ejecución. No requiere migración.

## Semana 3 · HU BDD y constructor Gherkin

El constructor guía cuatro piezas (título, Given, When y Then), una a la vez, con pistas y un .feature que refleja las selecciones. El contador indica piezas seleccionadas, no validez. Ejecutar compara el Then con el resultado de la regla y explica errores de rol, alcance o criterio. Editar deshabilita la descarga hasta ejecutar de nuevo.

Guardar y revisar evidencia presenta una bitácora en tres pasos: escenario ejecutado con esperado/obtenido, reflexión sobre HU/criterio y roles con pistas, y vista previa/guardado/exportación Markdown. Adjunta el último escenario ejecutado, su criterio, fecha y resultado; no incorpora cambios sin ejecutar ni completa automáticamente las reflexiones. Permite borradores parciales, conserva las observaciones previas por posición y mantiene la finalización en el botón Finalizar práctica con un escenario válido. No cambia la base de datos ni exige una matriz de casos.

`/practice/3` muestra una HU de acceso a pedidos en un bloque Como / Quiero / Para y un bloque separado con un escenario Given / When / Then. Explica cómo derivar un archivo `.feature` de sus criterios y enlaza la referencia oficial de Cucumber.

El constructor ofrece frases seleccionables, algunas deliberadamente incorrectas para el rol o fuera de la HU. Valida campos, roles, acción de acceso, salida observable y concordancia con las reglas de cuenta activa/credenciales válidas. Un acceso rechazado puede ser un escenario correcto si ese es el Then esperado. Es una validación semántica y un simulador de regla local, no un parser general de Gherkin, una ejecución de Cucumber ni un inicio de sesión real.

Se exporta el `.feature` después de una validación correcta. La última selección ejecutada se guarda como `PracticeRun` de tipo `topic` con `gherkinVersion: 1`; los campos narrativos siguen disponibles en Guardar y revisar evidencia. La matriz de casos se retira de esta práctica para distinguir especificación BDD de diseño de casos. El kit conserva las plantillas compartidas para otros temas, pero la lista de archivos de la semana 3 solo ofrece su guía y `features/acceso-mis-pedidos.feature`.

## Semana 2 · Misión de lanzamiento y riesgo

`/practice/2` propone una tienda con tres riesgos y dos turnos de pruebas. Las tarjetas muestran consecuencias, controles de probabilidad/impacto de 1 a 5, exposición calculada, clasificación didáctica y una mitigación reversible. La lista de prioridad y el mapa 5×5 reflejan los cambios inmediatamente.

La mitigación reduce dos puntos de probabilidad con mínimo 1 y conserva impacto; es una hipótesis de aprendizaje, no una comprobación de eficacia. La priorización valida las dos exposiciones más altas de la configuración actual; en un empate en el corte se acepta cualquiera de los riesgos empatados. Cuatro situaciones distinguen componente/unitaria, integración, sistema y aceptación. Validar la estrategia muestra hasta cinco decisiones acertadas y explicaciones que permiten reintentar.

La última validación usa `PracticeRun` de tipo `topic` y `riskMissionVersion: 1`; guarda parámetros, mitigaciones, prioridades y niveles. Conserva el flujo de evidencia existente. Cambiar controles no modifica por sí mismo la finalización semanal. Se retiran la matriz de casos y sus archivos de esta práctica; permanecen las cuatro secciones principales y el kit de apoyo.

Guardar y revisar evidencia guía en tres pasos: revisar la última estrategia ejecutada, responder preguntas de reflexión y previsualizar/guardar. Adjunta automáticamente los cálculos de esa ejecución y ofrece pistas que no rellenan las respuestas. Permite guardar solo la validación o reflexiones parciales, editarlas después y descargar un informe Markdown con ambos contenidos. Conserva los campos y la evidencia anteriores; no requiere migración. Navegar por la guía no concede progreso de la ruta.

## Semana 6 · Misión de Sprint QA

La práctica tiene tres pasos: objetivo y eventos de Scrum, predicción de métricas desde un tablero configurable y cierre contra una DoD de entrenamiento con mejora para Retrospective. Se distinguen ejecutados (aprobados + fallidos), bloqueados sin ejecutar y otros no ejecutados; la aprobación no aplica si el denominador es cero.

El modelo compartido valida cantidades, respuestas y conclusión; solo una misión validada permite Finalizar práctica. Editar la configuración invalida la validación. La bitácora adjunta datos y resultados y admite reflexiones opcionales, borradores y descarga Markdown. Las notas anteriores, la matriz histórica y la ejecución anterior se conservan al guardar, aunque la matriz ya no se muestra ni cuenta para completar esta semana. Se mantienen el kit, preparación, instrucciones y archivos específicos. No requiere migración de base de datos.

Referencia pedagógica: [Scrum Guide](https://scrumguides.org/scrum-guide.html). La DoD del ejercicio es un criterio local explícito, no una regla universal sobre porcentajes de prueba.

## Semana 7 · API, SQL y Git guiados

Se conservan el explorador HTTP, la colección Postman, PostgreSQL en el navegador y el repositorio isomorphic-git. La misión añade desafíos, pistas y navegación por herramienta. Las vistas permanecen montadas al cambiar de pestaña. La bitácora guiada conserva la última ejecución de cada herramienta (incluidos fallos), configuración, fecha, salida y reflexiones opcionales; exporta Markdown y permite borradores. No representa ejecuciones externas de Postman.

Los resultados adicionales se guardan en execution.toolRuns sin duplicar el resultado principal. El límite de exercise:7 es 32000 caracteres, tanto en cliente como contrato, dominio y restauración. La finalización mantiene el requisito actual de una última ejecución correcta y confirmación explícita. No requiere migración de base de datos.

## Reorganización de módulos 03 y 04

El módulo 03 contiene HTTP/REST/Postman (semana 7) y SQL (semana 8). DevTools y Git se trasladan a la semana 9 del módulo 04, junto con sus tarjetas originales, prácticas y preguntas de evaluación. Se conservan las 24 semanas y sus IDs; la semana 9 suma dos capítulos y conserva JavaScript. Las evidencias antiguas permanecen almacenadas; el módulo 03 ya no ofrece Git como ejercicio. El seguimiento incorpora los capítulos añadidos a los requisitos de lectura. No requiere migración de base de datos.

## Ajuste de DevTools

DevTools vuelve al módulo 03, en lectura y práctica de la semana 8, con su pregunta en el test del módulo. SQL conserva sus capítulos y consultas. La semana 9 del módulo 04 conserva JavaScript y Git; DevTools ya no aparece allí. Los capítulos y reglas de lectura se actualizan sin renumerar semanas ni eliminar evidencias previas.

## Ubicación final de DevTools

DevTools se imparte en la semana 7 junto con Postman: lectura, práctica y evidencia independiente (execution.toolKey = devtools). La semana 8 queda dedicada a SQL. Git permanece en la semana 9 del módulo 04. La evaluación de DevTools sigue perteneciendo al módulo 03.

## Respuesta manual del explorador HTTP

En la semana 7, el campo «¿Qué resultado crees que se debe obtener?» comienza vacío y se limpia al cambiar de desafío o configuración. El estudiante escribe el código; la pista desplegable muestra su significado. Una respuesta vacía no ejecuta ni valida la solicitud. La comparación usa el valor escrito, oculta resultados de otra configuración y distingue prueba correcta de prueba fallida.

## Pista SQL y datos relacionales

El ejecutor SQL compartido muestra una pista desplegable con diagrama, PK/FK y registros seleccionables por tabla. La base incluye 8 clientes, 12 pedidos, 6 productos y 14 líneas de detalle, con clientes sin pedidos y cinco estados. Admite consultas libres y ejemplos de tres tablas, ventas por producto y conciliación de totales. Cada ejecución restaura la semilla inicial.

`apps/web/public/practice/kit/data/training-data.json` define el esquema y los registros de la pista. Después de editarlo, ejecutar `node scripts/generate-sql-training.mjs` para actualizar training.sql y el código inicial de la semana 8; reconstruir el kit con `scripts/build-practice-kit.ps1`. La prueba `tests/sql-training.test.mjs` compara los datos de la pista con PostgreSQL, verifica referencias y concilia importes.

## Investigación guiada de DevTools

La semana 7 propone una misión de cuatro pasos: preparar los paneles nativos, reproducir una diferencia entre API e interfaz, validar una hipótesis y ejecutar el retest. Las tarjetas comparan regla de negocio, respuesta real y presentación de entrenamiento. Las pistas cambian según el paso; Network, Console y Application tienen explicaciones seleccionables. Se elimina el bloque duplicado de instrucciones de DevTools.

La evidencia conserva reproducción, diagnóstico y retest. La investigación solo se valida si se reprodujo el defecto, se identificó la presentación como causa y el retest sin defecto devuelve 104500 COP tanto en API como en interfaz. Cambiar la hipótesis o la configuración invalida el retest. Los fallos de red y los importes inesperados no permiten avanzar. La plataforma no detecta si se abrieron los paneles nativos.

## Semana 8 · detective de datos

El laboratorio incorpora cuatro misiones SQL y un espacio libre. PostgreSQL ejecuta las consultas sobre la misma semilla de la pista; cada misión compara columnas, valores y cantidad de filas con su objetivo. El orden también se valida en el reto de pagos. Consultas con errores o resultados diferentes conservan evidencia, pero no marcan la misión como comprobada. Volver a ejecutar actualiza únicamente el registro de ese reto.

La bitácora SQL tiene tres pasos: revisar las consultas y tablas, explicar hallazgos con pistas opcionales y guardar o descargar Markdown con tablas. `execution.sqlNotebook` conserva la última ejecución por misión y la última consulta libre. El nuevo laboratorio exige los cuatro objetivos para finalizar; los registros anteriores sin sqlNotebook mantienen su criterio de finalización. Guardar borrador no completa la práctica. El límite de evidencia de la semana 8 es 32000 caracteres en contrato, dominio y cliente. No requiere migración de base de datos.

## Semana 9 · código, pruebas y entrega

La misión integra experimentos de cotización, fronteras, descuento incorrecto y retest, además del editor libre. Todos se ejecutan en el sandbox JavaScript existente. Los borradores por experimento se conservan mientras se navega dentro de la actividad; la evidencia conserva la última ejecución de JavaScript, el fallo del experimento de descuento y el último resultado de Git por separado en `execution.programmingNotebook`.

Git mantiene su repositorio real en LightningFS/isomorphic-git. Tras cada operación inspecciona HEAD, el archivo confirmado y statusMatrix; las marcas representan inicialización, archivo guardado, preparación y commit. Para comprobar la entrega, el archivo del editor debe coincidir con HEAD y con el archivo guardado, y el árbol debe estar limpio. Una selección de comando, git status o Guardar archivo no crean por sí solos esa evidencia.

El nuevo recorrido exige JavaScript correcto con al menos una aserción ejecutada y una entrega Git verificada. El fallo intencional del experimento se conserva para comparar, pero no sustituye el retest. Los registros anteriores sin programmingNotebook conservan su finalización. La bitácora guía revisión, reflexión opcional y guardado/descarga. La evidencia de la semana 9 admite 32000 caracteres en cliente, contrato y dominio; no requiere migración de base de datos.
