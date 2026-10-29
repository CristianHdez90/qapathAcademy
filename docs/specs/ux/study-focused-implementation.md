# UX-120 · Registro de implementación local

Fecha: 27 de octubre de 2026. Base: `5dcbdf45b5b21b43d8f99ae01e0e62dbaa6c60c2`. Autorización del propietario: «esta bien aprobado para implementar». Alcance: interfaz local de `/study/[week]`, sin modificar dominio, API, base de datos ni desplegar QAPath Academy o el Site de revisión.

## Activación y reversión

- Entrada optativa: `/study/1?view=focused` (también semanas 2–24). La vista existente incorpora «Probar estudio enfocado».
- El lector por capítulos sigue siendo la vista predeterminada y conserva su rastreador real. «Abrir vista por capítulos» vuelve al capítulo académico correspondiente.
- Eliminar `view=focused` revierte la presentación sin tocar datos. No se han creado flags en servidor, migraciones o cambios de contratos.
- El servidor de comprobación se inicia en 3012 para no detener el servidor del propietario en 3000. Esto es una revisión local, no una URL publicada.

## Componentes y comportamiento

El modelo `study-steps.ts` deriva las unidades del contenido existente; conserva orden, conceptos, puntos, código, ejercicio opcional y cierre. El inventario de las 24 semanas se comprueba con tests. Las claves finas incluyen el capítulo para evitar colisiones de IDs. El ejemplo no duplica `steps` cuando ya contiene conceptos, igual que el lector anterior.

`FocusedStudy` monta únicamente el contenido del paso activo. Mantiene por encima de ese paso respuesta de autoevaluación y modo de demostración; las notas, errores y reintentos permanecen en ProgressProvider. El cambio de tarjeta solicita `flushNote`; el guardado fallido conserva el texto. La descarga usa el mismo generador Markdown en ambas presentaciones y sigue exportando la clase completa.

La navegación conserva aliases `chapter-i`, actividades, historial y hashes finos. Un hash válido tiene prioridad sobre la posición de sesión. Un hash desconocido avisa y vuelve al inicio. La posición se almacena por identidad/rol/semana; no incluye notas, mensajes o credenciales. La limpieza de posiciones de otra identidad espera a que termine la carga de autenticación. La navegación restaura scroll de tarjetas visitadas y enfoca su título.

Tres accesos flotantes abren diálogos nativos: Menú reutiliza Sidebar/LearningTree y su control de roles; el índice enumera pasos; MariBug conserva el controlador e historial existentes. ASK_LIA_EVENT prepara contexto sin enviar, respeta un borrador previo y ofrece reemplazarlo explícitamente por la pregunta de la tarjeta. Cerrar no cancela ni duplica una petición. Los diálogos contienen Tab/Shift+Tab, cierran con Escape y restauran el disparador. Los lanzadores toman foco explícito antes de abrir, incluido WebKit. El chat global se oculta únicamente en el modo enfocado.

## D1: decisión de seguridad del piloto · checkpoint histórico del 27 de octubre

Este apartado conserva el diagnóstico del primer piloto. La implementación posterior y el estado vigente de D1 se registran en [validación D1 del 28 de octubre](study-focused-d1-validation.md); no interpretar las restricciones históricas siguientes como el comportamiento del candidato posterior.

La aprobación autoriza implementar la estrategia, pero no sustituye su validación técnica. Se comparó el mismo concepto QC en el navegador local con el mismo viewport: el lector existente produjo aproximadamente **302,98 × 864,30 px**, texto de 14 px; la tarjeta enfocada **707,25 × 560,22 px**, texto de 16 px. Cambian ancho y saltos de línea: una proyección lineal del rectángulo completo **no queda validada**. Estas cifras son una muestra de geometría real, no una prueba diferencial exhaustiva ni una referencia estática implementada.

No se introdujeron pesos por tarjeta, crédito por clic, cambios de umbral ni un espejo de componentes activos ocultos. La vista enfocada no emite `reading-section`. Para registrar lectura durante el piloto se conserva el lector AS-IS con sus reglas de exposición. La UI informa esta limitación. Esto permite revisar la experiencia sin inventar equivalencia; **CA-10 positivo del lector enfocado permanece abierto**, junto con la referencia estática, correspondencia por regiones y pruebas diferenciales propuestas en D1. No habilitar el modo por defecto ni liberar a producción hasta cerrarlo o aprobar otra SPEC que resuelva la política de lectura.

## Validación

- Pruebas del modelo: inventario de las 24 semanas, orden, IDs únicos, aliases y ausencia de tarjetas fabricadas; 37 pasos enriquecidos para semana 1.
- Regresión general de Node: 214 pruebas pasaron con conexiones localhost habilitadas. Un primer intento restringido falló por EACCES de red; no se modificaron pruebas para ocultar ese error.
- TypeScript y ESLint de frontend pasaron en la primera comprobación del piloto; se repiten dentro del check final.
- Playwright: navegación, unidad única, historial, drafts de notas y respuestas, contexto/draft de MariBug sin envío automático, cinco anchos, teclado y aislamiento respecto a recursos; se añade error remoto/reintento de notas. El resultado final y los límites se registran al completar la ejecución.

Pendientes de liberación: D1 positivo y caracterización geométrica; lectura con todos los estados de contenido dinámico; sesión real login/logout en QA; auditoría con lector de pantalla y zoom 200 %; preview y aprobación para producción. Las simulaciones de API de los E2E no certifican una conexión real a PostgreSQL ni al proveedor IA.

### Correcciones obtenidas durante la validación

Se mantuvo Maximizar/Restaurar de MariBug dentro del diálogo, sin añadir un segundo bloqueo de scroll. Se corrigió la competencia entre el router y el paginador anterior para los hashes del mismo documento: se intercepta una sola navegación no modificada, conservando otras consultas y clics modificados. La posición de una visita no se sobrescribe por recibir tanto popstate como hashchange.

La inicialización de identidad no debe quitar foco a un estudiante que ya está interactuando. Se estabilizó la referencia de flushNote para no reiniciar la navegación cuando cambia la disponibilidad del proveedor; los movimientos de foco pendientes se cancelan al abrir un modal. El menú conserva su estado de expansión al cerrarse.

En WebKit, el test de ciclo de foco espera a que termine la carga de la cuenta antes de suponer una lista de controles estable. Existe además una prueba independiente que retiene deliberadamente la respuesta de identidad y comprueba el foco al liberarla después de cerrar Menú. La prueba de cinco tamaños dispone de 90 segundos para recorrer cinco páginas; no se relajaron aserciones de foco o contenido. Se descartó una ejecución con evidencias dañadas por compartir output entre dos procesos: las repeticiones finales se ejecutan secuencialmente, en un directorio aislado.

### Resultado final de esta entrega

- `pnpm check`: ejecución completa satisfactoria (214 pruebas Node, tipos, lint y build). Después de las correcciones de UI se repitieron tipos/lint y la compilación del frontend; la batería E2E final usa el código actual del servidor local.
- Ejecución secuencial final: **16/16 E2E pasaron**, ocho escenarios por motor (Chromium y WebKit), incluyendo la vista anterior por capítulos. Duración informada: 1,4 minutos. No hay pruebas omitidas en esa batería.
- Evidencias finales: directorio `ux120-e2e-confirmed` en las visualizaciones de este chat. Captura manual del piloto: `ux120-piloto-local.png` en el mismo directorio raíz de visualizaciones.
- `git diff --check` sin errores de espacios. Sin commit, push, migraciones o despliegue.

El piloto local está disponible para revisión. Esto no cierra D1 ni CA-10 positivo de la lectura enfocada, la auditoría integral de accesibilidad, las pruebas reales de sesión ni la autorización de producción. Se conserva el modo por capítulos por defecto y su rastreador intacto.

## Actualización vigente · D1 · 28 de octubre de 2026

El checkpoint anterior queda superado para D1 por [el registro de validación](study-focused-d1-validation.md). Se implementó una referencia estática sin controladores inactivos y una correspondencia por regiones y líneas con el layout anterior. El candidato enfocado ahora emite el comando original de lectura cuando cumple la unión de exposición, 3.000 ms, 80 % y extremo 98 %; espera el ACK del mismo proveedor para mostrarlo como registrado. Modales, documento sin foco/oculto y geometría no coincidente detienen el cómputo. Se conserva la historia confirmada al cambiar de tarjeta o tamaño durante la sesión.

Resultado: **86 casos D1 distintos y 16 de regresión de experiencia satisfactorios** entre Chromium y WebKit; `pnpm.cmd check` completo satisfactorio con 219 pruebas Node, tipos, lint y build. Los grupos, repeticiones, comandos, muestras y limitaciones están en el registro D1. Se cierra la comprobación local positiva de lectura del candidato en el catálogo actual; no se declara cerrada toda la aceptación de UX-120.

En ese checkpoint se conservó el ancho original de los conceptos. **Actualización posterior solicitada por el propietario:** los conceptos ocupan ahora todo el ancho interior de la tarjeta y el contenedor enfocado no tiene un máximo de escritorio. El [registro D1, apartado «Conceptos de ancho completo»](study-focused-d1-validation.md) explica el nuevo mapeo de glifos hacia bandas del capítulo original, las pruebas específicas y sus límites. Los resultados del checkpoint anterior no se atribuyen automáticamente a esa actualización.

Siguen pendientes accesibilidad integral/zoom, sesión real en QA, Preview y autorización de producción. La entrada sigue siendo `/study/1?view=focused`, también semanas 2–24; `/study/[week]` continúa por capítulos. Sin commit, push, cambios de dominio/API/migración o despliegue.
