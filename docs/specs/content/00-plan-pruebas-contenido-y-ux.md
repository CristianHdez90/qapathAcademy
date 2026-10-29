# G2 · Plan de validación de contenido y UX — NO EJECUTADO

2026-10-28 · CONTENT-210 · Solo diseño documental. **Cero pruebas ejecutadas en G0–G2**. Leer archivos de tests, contar el currículo y reconciliar cifras de datos estáticos no demuestra que el producto pase una prueba.

## 1. Momento de ejecución y condiciones

Instrucción del propietario: «Las pruebas las realizas al final cuando ya todo esté implementado del SPEC». Se respeta: no ejecutar ahora unitarias, Playwright, `pnpm check`, pruebas manuales de UI/accesibilidad ni experimentos con estudiantes. Tampoco crear/editar archivos de tests en esta fase.

El plan se ejecutará **al final de la implementación aprobada de CONTENT-210**. La aprobación de un piloto no autoriza implementar todo el currículo. Si el alcance aprobado sigue siendo parcial, registrar qué falta y pedir el alcance restante antes de declarar implementado todo el SPEC. La recomendación original G4/G5 de probar antes de cada lote se aparta de la secuencia solicitada; el riesgo de feedback tardío y la compatibilidad con CI se registran en D07.

No modificar ni desactivar `.github/workflows/quality.yml`: ya ejecuta controles en push/PR. Esta fase no crea PR, push o ejecución CI; la instrucción de posponer pruebas no autoriza omitir controles de una futura rama protegida ni ocultar un fallo.

Antes de ejecutar al final: fijar SHA del candidato y baseline de comparación, obtener revisión editorial independiente, resolver D01–D07, confirmar destinos/datos ficticios y permisos. Todo resultado deberá identificar versión, motor, tamaño, configuración y si usa API simulada o real. No reciclar capturas de UX-120 como evidencia de globos inexistentes.

## 2. Correspondencia CA → verificación futura

Estado común de todas las filas: **DISEÑADA / NO EJECUTADA / NO APROBADA**. Una inspección de este Markdown no convierte un CA de interacción en aprobado.

| CA | Escenario / oráculo futuro | Método y evidencia a producir |
|---|---|---|
| 01 | Cada capítulo aprobado tiene objetivo observable, prerrequisitos, versión y fuente | Revisión editorial de unidad y trazabilidad de fuente |
| 02 | Corregir únicamente brechas aprobadas, conservando B03/B04 y decisiones rastreables | Comparación documental de cambios frente a matriz G1 |
| 03 | W01-C01 diferencia QA/QC/testing y no confunde fallo con causa | Revisión QA independiente + actividad de clasificación razonada |
| 04 | Caso incluye QA/negocio/desarrollo sin rol Scrum universal inventado | Revisión de conversación y Scrum Guide; no buscar una ceremonia inexistente |
| 05 | Diagrama y alternativa textual contienen mismas relaciones y etiquetas | Inspección editorial y lectura con tecnología asistiva de representación final |
| 06 | Cada elección tiene feedback; corregir una respuesta no requiere reiniciar la clase | Prueba de microactividad y revisión de comprensión; sin nota académica nueva |
| 07 | qc conserva ID, título y tres etiquetas/índices; demás conceptos conservan su fuente | Integridad de datos contra snapshot aprobado |
| 08 | Montar la tarjeta con demo visible deja todos los globos cerrados | Playwright antes de gesto y después de layout/media/fonts |
| 09 | Hover en cada nodo abre exactamente su detalle después del umbral | Reloj controlado + índice/objetivo/acciones/evidencia, tres nodos |
| 10 | Puntero puede cruzar de nodo a globo y leer sin desaparición | Recorrido de puntero en ambos sentidos y persistencia mientras se mantiene |
| 11 | Tab/foco/Enter/Espacio según D03; Escape no provoca reapertura inmediata | Teclado completo, foco visible y retorno al invocador; sin trampa de Tab |
| 12 | Tap abre, cambia nodo y cierra fuera; desplazamiento vertical sigue natural | Dispositivo/emulación táctil 320/390, incluyendo botón Cerrar |
| 13 | ≥60 % estable ≥350 ms tras scroll real abre una invitación; scroll rápido no abre | Visibilidad, estabilización, dismiss y reentrada; comprobar límite D04 y prioridad manual |
| 14 | Pausa temporal no sustituye pausa manual ni reinicia done | Matriz de estados §3; capturar estado anterior, durante y posterior |
| 15 | Reduced mantiene detalles consultables, aunque control de reproducción esté deshabilitado | Media query al cargar y cambiada en sesión; texto equivalente |
| 16 | Sin recorte ni overflow global en 320/390/768/1280/1920; zoom y herramientas no tapan controles | Capturas por tamaño y verificación DOM; revisar contenido largo real |
| 17 | Lector accede a paso/detalle y no recibe anuncios de cada transición | NVDA/Firefox o Chromium, VoiceOver/Safari reales; registro manual de recorrido |
| 18 | Sin stepDetails o con arreglo inválido no hay globo vacío ni fallo de render | Unitarias de guardas/fallback + muestra visual de conceptos no enriquecidos |
| 19 | Abrir/cerrar no emite progreso y pausa atención; ACK previo legítimo se conserva | Observar comandos y estado estable con reloj; no confundir navegación con logro |
| 20 | Hash, anterior/siguiente, índice y descarga preservan contenido y nota | E2E en ambos lectores; inspeccionar Markdown descargado completo |
| 21 | Pruebas vigentes y nuevas pasan con aserciones correctas, sin reducir umbrales | Regresión al final; corrección aprobada de deuda estática, nunca borrar casos para declarar éxito |
| 22 | QA técnico, edición, accesibilidad y producto aceptan el piloto | Firmas/decisiones y resultados finales; no autoaprobar por score del autor |
| 23 | Fuente → capítulo → concepto → nodo → actividad → evidencia → PR | Inventario por lote, IDs existentes y enlace al commit realmente validado |
| 24 | Cambio editorial no altera identidad, backend o infraestructura | Revisión de diff y comparación de contratos/rutas fuera del alcance |

## 3. Matriz de estados y prioridades

### Reproducción × detalle

| Antes de abrir | Mientras se consulta | Al cerrar, si sigue visible |
|---|---|---|
| idle | Detalle legible, sin iniciar reproducción por sí mismo | idle |
| playing | Pausa temporal, conservar fase/tiempo y selección | Reanudar únicamente si no hay otra razón de pausa |
| paused explícito | Seguir pausada | Seguir pausada |
| paused por visibilidad | Pausada; sin invitación automática fuera de vista | Solo la política de visibilidad puede habilitar reproducción |
| done | Conservar completada; consultar cualquier nodo | done, sin reinicio automático |
| reduced efectivo | Sin movimiento, todos los detalles disponibles | Sin movimiento |
| Documento oculto / modal abierto | Sin nuevas invitaciones ni atención de lectura | Reevaluar visibilidad/razones, sin robar foco |

Cubrir: manual sobre hover, foco dentro del panel sobre hover ajeno, manual sobre scroll, Escape bajo hover persistente, cambio de tarjeta, back/forward, recarga, identidad, listeners/timers desmontados y dos demostraciones visibles en lector anterior. No debe haber dos globos ni un invocador de otra tarjeta reteniendo el foco.

### Datos y casos negativos

- Ausente, vacío, longitud desigual, orden cruzado, goal/evidence vacíos, acciones insuficientes/excesivas, roles/entrada ausentes, texto largo y caracteres especiales.
- Contenido con apariencia HTML/JS se muestra como texto o se rechaza según esquema; nunca se ejecuta. Grafo con IDs duplicados, aristas huérfanas o alternativa incompleta no se publica.
- No generar un globo genérico si falta dato. No usar `innerHTML` ni descargar recursos remotos desde etiquetas del currículo.
- Las tres etiquetas QC deben permanecer exactas. Error/defecto/fallo son secuencias causales, no instrucciones para introducir errores reales.

## 4. D1 y persistencia: escenarios discriminantes

1. **Exposición insuficiente:** abrir todos los globos después de ver solo un fragmento no completa lectura ni suma cobertura de sus textos auxiliares.
2. **Tiempo:** mantener un globo abierto más de 3 segundos no aporta atención. Cerrarlo reanuda el criterio existente, sin recontar visitas ni dar crédito por Escape.
3. **Referencia estática:** no hay IDs duplicados, handlers/controladores activos ni overlays medidos en ReadingReference; identidad del texto académico consistente al cambiar ancho/reduced/fuentes.
4. **Save pendiente:** establecer baseline sin operaciones previas; después abrir/cerrar y verificar cero comandos nuevos. En otro caso, permitir llegar un ACK previo sin cancelarlo ni atribuirlo al globo.
5. **Error/reintento:** conservar nota, cola y capítulo en error; cerrar detalles no duplica guardado ni limpia evidencia. Reintentar usa proveedor existente.
6. **Identidad:** consultar un paso como invitado y cambiar cuenta no comparte selección sensible ni inventa logro. No serializar acciones del alumno o borrador IA dentro de URL.

Los tres umbrales de lectura no se modifican. Si el nuevo botón o el detalle rompen la correspondencia de D1, resolverlo antes de activar; no reemplazar la regla por «visitó todos los nodos».

## 5. Pruebas existentes: lectura estática, no ejecución

| Archivo | Cobertura que se conservará / deuda que revisar |
|---|---|
| `tests/content.test.mjs` | 8 módulos/24 semanas/guías y estructura académica |
| `tests/reading-concepts.test.mjs` | 266 conceptos; 48 de fundamentos; ejemplo/steps/icons. Extender opcionales sin obligar detalle en todos |
| `apps/web/tests/e2e/reading-concepts.spec.ts` | Animación, reduced, exportación, móvil. Cantidades W7/W9 obsoletas y escenario de lectura insuficientemente caracterizado, B05 |
| `apps/web/tests/e2e/learning-ux.spec.ts` | Acción recomendada, notas/error/reintento y contexto de asistente |
| `tests/study-steps.test.mjs`, `focused-study.spec.ts`, `lesson-pagination.spec.ts` | Inventario/navegación y estado en ambos lectores locales |
| `tests/focused-reading.test.mjs`, `reading-coverage.test.mjs`, `focused-reading.spec.ts` | Proyección/cobertura/tiempo y guardas; incluir el nuevo motivo de pausa de UI |
| Suites académicas/de progreso | Confirmación de que no cambian comandos, criterios de finalización o límites de evidencia |

Diseñar posteriormente pruebas de `stepDetails`, coordinador, precedencias y pausa por razones; enumerar sus rutas en la SPEC individual. No se crean ni ejecutan ahora. Corregir B05 requiere aserciones que correspondan al inventario/semántica reales, no bajar cantidades arbitrariamente o saltar la prueba.

## 6. Accesibilidad, evidencia y aceptación final

Matriz mínima: Chromium/WebKit; tamaños requeridos del SPEC; teclado, mouse, toque, reduced, zoom 200/400 %, lector de pantalla real y textos largos. No afirmar Safari/iOS certificado por ejecutar solo WebKit. Revisar contraste, foco, objetivos táctiles, orden de lectura y reflow, incluida la coexistencia con los tres modales de UX-120.

Conservar capturas antes/después, informe del comando/motor/SHA, errores iniciales y repetición justificada; distinguir fallo de producto, test, datos o entorno. No sumar reintentos como casos distintos ni presentar un lote con fallos como globalmente satisfactorio. Revisar que no haya petición de red o recurso pesado por abrir un detalle; presupuesto de rendimiento comparativo se fija en G3, no se inventa un resultado medido ahora.

Al terminar toda la implementación aprobada, ejecutar la regresión acordada, incluyendo `pnpm.cmd check` y suites afectadas. No despliega ni autoriza una liberación. Un CA pendiente, defecto crítico, revisión no firmada o fuente no verificada impide declarar DoD; la aprobación de producción sigue siendo independiente.
