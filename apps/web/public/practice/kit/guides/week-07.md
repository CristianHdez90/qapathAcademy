# Semana 7 · Postman: contratos, códigos HTTP y autorización

Ejecutar solicitudes reales contra el sandbox y automatizar sus validaciones, más allá de comprobar 200.

Herramientas: Postman, Explorador HTTP, PostgreSQL en navegador, Git aislado

## Preparación

- Opción integrada: usa «Configura y ejecuta en la plataforma» para practicar solicitudes HTTP reales al sandbox. Puedes conservar también el trabajo externo con el kit de apoyo.
- Descarga la colección desde el entorno de práctica; ya incluye el baseUrl de la página actual.
- Importa el JSON en Postman. Abre Scripts → Post-response para revisar los tests. Los tokens demo-reader y demo-admin son públicos y solo sirven en este simulador.

## Ejecución

1. En el ejecutor de esta semana, configura solicitudes HTTP reales al sandbox y pulsa Ejecutar práctica. Compara la salida y guarda la evidencia con su fecha.
   Resultado esperado: La solicitud devuelve estado, cabeceras y cuerpo; el estado obtenido se compara con el esperado configurado.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Ejecuta la carpeta Códigos HTTP y registra status, headers y cuerpo.
   Resultado esperado: Se reproducen 200, 201, 202, 204, 400, 401, 403, 404, 409, 422, 429, 500 y 503. El 204 no contiene cuerpo; no se llama a json() en ese caso.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Ejecuta Autorización: sin token, reader/write y admin/write.
   Resultado esperado: Se obtienen 401, 403 y 200 respectivamente; 401 incluye WWW-Authenticate.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Ejecuta Cotizaciones con cantidad válida, 0, producto desconocido, agotado y cupón inválido.
   Resultado esperado: Se validan 200, 422, 404, 409 y 422 con mensaje y estructura, no solo status.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Cambia intencionalmente una aserción a un esperado incorrecto y luego restáurala.
   Resultado esperado: El runner demuestra un fallo real; después queda verde. 429 y 503 incluyen Retry-After: 5 como simulación controlada.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Importa data/quote-cases.csv y ejecuta solo la carpeta Datos del runner.
   Resultado esperado: Cada fila controla sus datos y expectedStatus; los totales se verifican únicamente para respuestas 200.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

7. Ejecuta manualmente cada solicitud en Postman antes del runner y exporta la colección con sus aserciones.
   Resultado esperado: Hay evidencia de Send y del runner; se conservan los archivos Postman existentes, sus carpetas y los datos CSV.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

8. En este mismo laboratorio, abre Base de datos SQL. Ejecuta SELECT, INNER JOIN y LEFT JOIN sobre clientes y pedidos ficticios.
   Resultado esperado: INNER JOIN devuelve tres pedidos; LEFT JOIN conserva a Luis aunque no tenga pedidos. La salida muestra filas reales del PostgreSQL en memoria.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

9. Abre Comandos Git: ejecuta init, guarda caso.md, revisa status, añade el archivo, crea commit y consulta log.
   Resultado esperado: Cada comando modifica o consulta un repositorio Git aislado, muestra su respuesta y explica para qué sirve. El commit devuelve un SHA real.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Colección exportada y resultado del runner con datos.
- Matriz endpoint/método/datos/status/aserciones y una evidencia de fallo corregido.

## Criterios

- Se diferencia simulación de estado HTTP de un proceso persistente.
- 401 y 403 tienen causas distintas.
- No se usan tokens ni cuentas de producción.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
