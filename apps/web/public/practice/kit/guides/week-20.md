# Semana 20 · Mocks de error y recuperación sin dependencia externa

Validar un fallo de red controlado y la recuperación conservando el contrato.

Herramientas: Playwright route, Arquitectura de pruebas

## Preparación

- Opción integrada: sigue cinco pasos para delimitar mocks, comprobar una base real, distinguir HTTP 503, contrato incompleto y transporte, y validar recuperación real. Conserva las capturas y descarga los specs separados.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.
- Ejecuta npx playwright install chromium firefox webkit. Configura BASE_URL con la dirección de tu academia o el servidor local.
- Las pruebas usan exclusivamente /practice y /api/v1/practice. No uses cuentas ni endpoints reales de usuarios.

## Ejecución

1. Delimita la intercepción y comprueba una cotización real. Ejecuta las tres simulaciones y compara status, alerta, ausencia de total y limpieza de la intercepción.
   Resultado esperado: HTTP 503 es una respuesta de error; un contrato 200 incompleto se rechaza; transporte no tiene status HTTP. Las simulaciones se identifican como locales y se retiran al terminar.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Descarga los tres archivos network-*.training.spec.ts y cópialos en tests del kit. Ejecuta primero network-mocks.training.spec.ts con --project chromium --trace on.
   Resultado esperado: La UI informa el error y no muestra un total de éxito.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. En Recupera y confirma, prepara un error en la vista actual, ejecuta la recuperación real y comprueba otra cotización de dos unidades.
   Resultado esperado: La alerta desaparece y el backend real responde 35000 COP; la segunda cotización devuelve 70000 COP. Una simulación verde no demuestra disponibilidad del backend.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Añade una variante con contrato incompleto y documenta cómo debe responder la interfaz.
   Resultado esperado: La interfaz informa Contrato de cotización inválido y no presenta un total de éxito; el test verifica ese comportamiento.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Separa pruebas con mocks de las de integración real y registra sus límites.
   Resultado esperado: Un mock verde no se reporta como evidencia de disponibilidad del backend real.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Agrega un fallo de transporte con route.abort y compáralo con el 503 HTTP simulado y con la recuperación real.
   Resultado esperado: El reporte distingue falta de respuesta de una respuesta HTTP de error y no atribuye disponibilidad al mock.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Spec de fallo/recuperación y contrato del mock.
- ADR corto sobre límites y separación de capas.

## Criterios

- Los mocks se limitan a la ruta exacta.
- Se prueba la recuperación.
- No se desactiva seguridad para hacer pasar el test.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.

## Origen, limpieza y retest

La plataforma intercepta únicamente POST de quotes dentro del iframe y restaura fetch al terminar cada ejecución, también si falla. Las capturas separan red real, HTTP simulado, contrato simulado y transporte sin respuesta. El estado de error permanece en la UI hasta volver a cotizar. Tras recargar, prepara el error otra vez para validar la recuperación en la vista actual.

Los tres specs descargados separan reacciones con mocks, recuperación mixta e integración real. Los archivos .training no reemplazan el spec original del kit. Descargar archivos no genera un reporte; conserva el reporte externo solo después de ejecutarlos.
