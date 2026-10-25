# Semana 20 · Mocks de error y recuperación sin dependencia externa

Validar un fallo de red controlado y la recuperación conservando el contrato.

Herramientas: Playwright route, Arquitectura de pruebas

## Preparación

- Opción integrada: usa «Configura y ejecuta en la plataforma» para practicar escenarios configurables sobre QA Store. Puedes conservar también el trabajo externo con el kit de apoyo.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.
- Ejecuta npx playwright install chromium firefox webkit. Configura BASE_URL con la dirección de tu academia o el servidor local.
- Las pruebas usan exclusivamente /practice y /api/v1/practice. No uses cuentas ni endpoints reales de usuarios.

## Ejecución

1. En el ejecutor de esta semana, configura escenarios configurables sobre QA Store y pulsa Ejecutar práctica. Compara la salida y guarda la evidencia con su fecha.
   Resultado esperado: La respuesta simulada 503 aparece como error en la interfaz; desactiva la simulación y espera 35000 COP para comprobar recuperación.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Ejecuta tests/network.spec.ts para simular 503 en quotes.
   Resultado esperado: La UI informa el error y no muestra un total de éxito.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Retira el mock y pulsa Cotizar otra vez.
   Resultado esperado: Se recupera la respuesta real y el total 35000 COP.
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
