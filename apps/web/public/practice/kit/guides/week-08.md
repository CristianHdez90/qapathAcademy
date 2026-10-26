# Semana 8 · SQL: consultas, relaciones y resultados

Verificar datos con filtros, agregaciones, JOIN y subconsultas.

## Preparación
- Opción integrada: usa «Configura y ejecuta en la plataforma» para practicar consultas SQL sobre PostgreSQL en memoria. Puedes conservar también el trabajo externo con el kit de apoyo.
- Usa una base PostgreSQL de práctica. Abre data/training.sql del kit; crea tablas TEMP y finaliza con ROLLBACK.

## Actividad
1. Resuelve las cuatro misiones del laboratorio: Sigue los pagos, Pon nombre a cada pedido, Encuentra a quienes faltan y Descubre clientes recurrentes. Consulta las pistas y compara las tablas antes de guardar.
   Resultado esperado: La consulta inicial INNER JOIN devuelve doce pedidos: dos de Ana y uno de Sol; puedes editarla o elegir LEFT JOIN.

2. Ejecuta Q1 y Q2: SELECT de columnas, WHERE y ORDER BY. Anota las filas esperadas antes de consultar.
   Resultado esperado: Q1 devuelve ocho clientes; Q2 devuelve seis pedidos pagados, ordenados por total descendente.

3. Ejecuta el archivo SQL completo y compara las agrupaciones por estado.
   Resultado esperado: paid tiene 6 pedidos y 419500 COP; pending tiene 3 y 170000 COP.

4. Usa LEFT JOIN para incluir clientes sin pedidos pagados; compara con INNER JOIN.
   Resultado esperado: Ana Demo 35000, Luis Demo 0, Sol Demo 204500, Diego Demo 0, Mía Demo 70000, Leo Demo 110000, Sara Demo 0 y Eva Demo 0. INNER JOIN excluye a clientes sin pago.

5. Ejecuta Q3–Q5: compara INNER JOIN con LEFT JOIN y encuentra clientes sin pedidos usando IS NULL.
   Resultado esperado: INNER JOIN devuelve doce pedidos; LEFT JOIN conserva catorce filas, incluidos Luis y Eva con pedido NULL; el anti-join devuelve a Luis y Eva.

6. Ejecuta Q8 y Q9 y mueve el filtro paid de ON a WHERE en una copia de Q7. Explica COUNT(o.id), HAVING y EXISTS.
   Resultado esperado: HAVING devuelve Ana con tres pedidos, y Sol, Diego, Mía y Leo con dos. EXISTS devuelve Ana, Sol, Mía y Leo. El filtro en WHERE excluye a clientes sin pagos; en ON los conserva con total cero.

## Entregables
- 3 consultas adicionales con su resultado esperado.
- Hoja Q1–Q9: consulta, resultado esperado, resultado obtenido y explicación de NULL y cardinalidad.

## Misiones SQL en la plataforma

El laboratorio compara los resultados de cuatro misiones: filtros de pagos, INNER JOIN, LEFT JOIN con IS NULL y GROUP BY con HAVING. Puedes consultar el diagrama y los registros, guardar borradores y experimentar con SQL libre. La evidencia adjunta consulta, fecha y tabla de resultados por misión. Completa los cuatro objetivos y pulsa Finalizar práctica para registrar la etapa del recorrido. Las prácticas completadas anteriormente conservan su estado.
