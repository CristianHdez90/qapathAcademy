# Semana 7 · Postman y DevTools: contratos, HTTP y diagnóstico

Ejecutar solicitudes reales contra el sandbox y automatizar sus validaciones, más allá de comprobar 200. Investigar peticiones y respuestas con DevTools.

## Preparación
- Abre la misión guiada y elige Postman y HTTP, Base de datos SQL. Cada herramienta tiene desafíos y pistas; puedes ejecutarlas directamente en la plataforma.
- Descarga la colección desde el entorno de práctica; ya incluye el baseUrl de la página actual.
- Importa el JSON en Postman. Abre Scripts → Post-response para revisar los tests. Los tokens demo-reader y demo-admin son públicos y solo sirven en este simulador.

## Actividad
1. En Postman y HTTP, prepara los desafíos de autorización, predice el status y pulsa Ejecutar solicitud HTTP. Revisa la comparación, headers y cuerpo.
   Resultado esperado: La salida compara esperado y obtenido. Se comprueba cuerpo vacío en 204, WWW-Authenticate en 401 y Retry-After: 5 en 429 y 503.

2. Ejecuta la carpeta Códigos HTTP y registra status, headers y cuerpo.
   Resultado esperado: Se reproducen 200, 201, 202, 204, 400, 401, 403, 404, 409, 422, 429, 500 y 503. El 204 no contiene cuerpo; no se llama a json() en ese caso.

3. Ejecuta Autorización: sin token, reader/write y admin/write.
   Resultado esperado: Se obtienen 401, 403 y 200 respectivamente; 401 incluye WWW-Authenticate.

4. Ejecuta Cotizaciones con cantidad válida, 0, producto desconocido, agotado y cupón inválido.
   Resultado esperado: Se validan 200, 422, 404, 409 y 422 con mensaje y estructura, no solo status.

5. Cambia intencionalmente una aserción a un esperado incorrecto y luego restáurala.
   Resultado esperado: El runner demuestra un fallo real; después queda verde. 429 y 503 incluyen Retry-After: 5 como simulación controlada.

6. Importa data/quote-cases.csv y ejecuta solo la carpeta Datos del runner.
   Resultado esperado: Cada fila controla sus datos y expectedStatus; los totales se verifican únicamente para respuestas 200.

7. Ejecuta manualmente cada solicitud en Postman antes del runner y exporta la colección con sus aserciones.
   Resultado esperado: Hay evidencia de Send y del runner; se conservan los archivos Postman existentes, sus carpetas y los datos CSV.

8. En este mismo laboratorio, abre Base de datos SQL. Ejecuta SELECT, INNER JOIN y LEFT JOIN sobre clientes y pedidos ficticios.
   Resultado esperado: INNER JOIN devuelve tres pedidos; LEFT JOIN conserva a Luis aunque no tenga pedidos. La salida muestra filas reales del PostgreSQL en memoria.

9. Abre Preparar mi evidencia, revisa la última ejecución de cada herramienta y agrega reflexiones o enlaces externos opcionales. Guarda o descarga la bitácora.
   Resultado esperado: Cambiar de herramienta no borra los otros resultados. El informe identifica configuración, respuesta, fecha y estado; no inventa una ejecución externa de Postman.

10. Abre DevTools y reproduce la cotización ficticia. Compara Network, el mensaje de Console y el total mostrado por la interfaz.
   Resultado esperado: La respuesta conserva 104500 COP; con el defecto de interfaz activado se muestran 103500. La diferencia se investiga sin atribuirla a la API.

## Entregables
- Colección exportada y resultado del runner con datos.
- Matriz endpoint/método/datos/status/aserciones y una evidencia de fallo corregido.
- Diagnóstico de Network y Console con esperado y obtenido.
