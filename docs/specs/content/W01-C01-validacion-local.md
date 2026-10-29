# W01-C01 · validación local

**Cambio posterior solicitado:** el usuario pidió retirar el globo. Los resultados siguientes describen la versión anterior; el ajuste actual y sus comprobaciones se registran al final. No se mantienen los globos por haber pasado pruebas previamente.

**Resultado final:** 225/225 pruebas Node, 12/12 escenarios Chromium y 19/19 casos WebKit aprobados. Tipos, lint y compilación correctos. Los intentos fallidos y sus correcciones se conservan más abajo; no se cuentan como aprobados. Validación local del alcance W01-C01, no del currículo completo ni autorización de producción.

2026-10-28. Autorización actual: **«ejecuta pruebas y revisa»**. Incluye el ajuste solicitado de globos extensos a listas breves. No autoriza producción, commit o push.

## Alcance

- Globo: título, botón de cierre y 2–4 acciones concisas; ancho máximo 320 px, sin los bloques extensos de contexto/objetivo/entrada/evidencia. Información completa conservada en datos, descarga y fallback.
- Ocho tarjetas / 24 estados, correspondencia de lista con nodo, fuente opcional inválida, actividad formativa y confirmación pendiente.
- Lectura D1, cola y ACK, notas, navegación, modales y ejemplos existentes del área de estudio.

## Controles

`pnpm check` finalizó correctamente: **225 pruebas Node aprobadas**, comprobación de tipos de API y web, lint de API y web, y compilación de bibliotecas/API/web. La primera ejecución había detectado tres errores de lint en refs; fueron corregidos y el control completo se repitió con éxito.

Pruebas añadidas: `tests/concept-details.test.mjs` y `apps/web/tests/e2e/concept-details.spec.ts`. Navegadores: Chromium y WebKit de Playwright, en servidores compilados aislados, puertos 3013/4013. No equivalen a Safari físico ni a una auditoría WCAG completa.

## Hallazgos y correcciones de navegador

La primera selección amplia ejecutó 44 casos con dos trabajadores: **37 aprobados y 7 fallidos en WebKit**. Los errores incluían esperas de carga de 5 segundos y agotamiento del tiempo total. No se declara esa ejecución aprobada. Log conservado: `C:/Users/ingcr/.codex/visualizations/2026/10/24/01a16b4f-61a0-7942-86a7-5e0a94117322/content210-e2e-inicial.log`.

Se añadieron esperas explícitas por la tarjeta restaurada/avance inicializado. En las pruebas con reloj virtual se entregan los frames de navegación/layout antes de comprobar D1, como ya hacían otras pruebas de ese archivo. No se redujeron umbrales, cobertura, restricciones académicas ni validaciones de geometría.

La inspección de capturas detectó numeración oculta por el reset CSS y un globo que podía quedar en la cabecera si el nodo estaba junto a la barra inferior. Se corrigieron `list-style` y el posicionamiento. En movimiento reducido, las tarjetas con secuencia vertical indican «Lee los estados en orden».

La repetición serial destapó un defecto real: WebKit no da foco al botón al activarlo con puntero y Escape no volvía al invocador si el foco estaba fuera del globo. La devolución ahora se hace siempre para Escape/Cerrar; clic exterior/navegación siguen sin mover foco. Se detuvo esa repetición para reconstruir la corrección, sin presentarla como suite aprobada. Diagnóstico preservado en `content210-fallo-foco-webkit.md`, en el mismo directorio externo de evidencias.

Captura de revisión visual local: `C:/Users/ingcr/.codex/visualizations/2026/10/24/01a16b4f-61a0-7942-86a7-5e0a94117322/w01-c01-lista-breve.png`.

**Plan utilizado para la validación final:** inicialmente se seleccionaron 24 casos, en serie: cinco escenarios de las listas (incluido toque) y siete controles de lectura/navegación/guardado, por cada motor. No es la suite E2E completa del repositorio ni una revisión independiente pedagógica o de accesibilidad.

### Seguimiento de la ejecución final

Chromium aprobó los 12 escenarios seleccionados sobre la corrección compilada. WebKit recorrió las ocho tarjetas y sus listas, pero agotó el límite total de 120 segundos en la última comprobación de referencia pasiva. Se amplió a 180 segundos únicamente ese test agregado de ocho cargas de página y 24 recorridos de teclado/puntero; las aserciones y reglas académicas no cambiaron. WebKit se repitió con un trabajador y los mismos 12 escenarios; no se cuenta como aprobado el recorrido interrumpido por timeout.

El agregado volvió a agotar 180 segundos en el último estado de Validación. Se descartó seguir elevando ese límite: cada concepto tiene ahora una prueba independiente de sus tres estados, con un contexto nuevo. Se mantienen las mismas comprobaciones de contenido, foco y referencia. La selección de WebKit pasa de 12 a 19 casos por esa separación de granularidad, no por añadir cobertura curricular. La ejecución aislada terminó con el resultado indicado a continuación.

## Resultado final de la selección

| Control | Resultado |
|---|---|
| Pruebas Node del repositorio | 225/225 aprobadas |
| API/web: tipos y lint; bibliotecas/API/web: build | Aprobados con `pnpm check` |
| Última corrección de foco/texto: tipos, lint y build web | Aprobados de nuevo |
| Chromium | 12/12 escenarios aprobados; el recorrido de las ocho tarjetas estaba agrupado |
| WebKit | 19/19 casos aprobados, 10,8 minutos; las ocho tarjetas se verificaron por separado |

La ejecución WebKit final valida los 24 estados, Escape/retorno al invocador, listas numeradas compactas sin desbordamiento en 1440/768/390/320 px, entrada por teclado, toque y cierre exterior, pausa de atención, descarga completa, actividades sin calificación adicional, referencia pasiva sin IDs/controles activos, geometría de fuente, registro de lectura por cobertura, cola/ACK y reintento, navegación y borrador de MariBug sin envío automático. Chromium aprobó los escenarios equivalentes en su selección final. No se cambió el límite de 3 segundos ni la elegibilidad de lectura para hacer pasar pruebas.

Evidencias persistidas fuera del código:

- `C:/Users/ingcr/.codex/visualizations/2026/10/24/01a16b4f-61a0-7942-86a7-5e0a94117322/content210-check.log`: control completo y 225 pruebas.
- `content210-web-controles-finales.log`: recompilación tras corregir foco.
- `content210-e2e-grupo-120s.log`: contiene los 12 escenarios Chromium aprobados y el agotamiento del agregado WebKit.
- `content210-webkit-aprobado.log`: ejecución final WebKit, 19 aprobados, salida 0.
- `w01-c01-lista-breve.png`: revisión visual en el servidor local de uso del usuario.

Los nombres sin directorio anterior corresponden al mismo directorio externo de evidencias. El HTML de Playwright y las capturas por tamaño de la última ejecución están en `apps/web/playwright-report/` y `apps/web/test-results/` (artefactos regenerables).

La API local de uso en 4000 se recargó con el contenido compilado; los servidores de pruebas se ejecutaron aparte en 3013/4013. No se modificaron producción, dependencias, reglas de negocio o base de datos ni se hizo commit/push. Persisten la revisión pedagógica independiente, una auditoría completa de accesibilidad/rendimiento y la aprobación para ampliar otros capítulos.

## Ajuste posterior: sin globo

Se eliminó la presentación flotante y sus disparadores automáticos/manuales. Los tres estados originales quedan como lista visual estática, con la animación previa. Se conserva la información completa para descarga/fallback, sin añadir otro panel que sustituya al globo.

La versión final sin controlador pasó tipos, lint y compilación web. Se reemplazaron las pruebas de interacción retirada por comprobaciones de ausencia de popover/botones en los nodos, lectura D1 verificada y descarga completa. Pruebas de navegador de este ajuste: **4/4 aprobadas**, dos por motor (Chromium/WebKit), salida 0. Las 31 comprobaciones de navegador anteriores corresponden a la presentación retirada y no sustituyen esta revisión.

Captura y logs persistidos en el directorio externo de evidencias indicado antes: `w01-c01-sin-globo.png`, `content210-sin-globo-e2e.log` y `content210-sin-globo-controles.log`. No se publicaron cambios.
