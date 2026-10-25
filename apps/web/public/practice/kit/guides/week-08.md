# Semana 8 · SQL: consultas, relaciones y resultados

Verificar datos con filtros, agregaciones, JOIN y subconsultas.

## Preparación
- Opción integrada: usa «Configura y ejecuta en la plataforma» para practicar consultas SQL sobre PostgreSQL en memoria. Puedes conservar también el trabajo externo con el kit de apoyo.
- Usa una base PostgreSQL de práctica. Abre data/training.sql del kit; crea tablas TEMP y finaliza con ROLLBACK.

## Actividad
1. En el ejecutor de esta semana, configura consultas SQL sobre PostgreSQL en memoria y pulsa Ejecutar práctica. Compara la salida y guarda la evidencia con su fecha.
   Resultado esperado: La consulta inicial INNER JOIN devuelve tres pedidos: dos de Ana y uno de Sol; puedes editarla o elegir LEFT JOIN.

2. Ejecuta Q1 y Q2: SELECT de columnas, WHERE y ORDER BY. Anota las filas esperadas antes de consultar.
   Resultado esperado: Q1 devuelve tres clientes; Q2 devuelve los pedidos pagados 3 (104500) y 1 (35000), ordenados por total descendente.

3. Ejecuta el archivo SQL completo y compara las agrupaciones por estado.
   Resultado esperado: paid tiene 2 pedidos y 139500 COP; pending tiene 1 y 75000 COP.

4. Usa LEFT JOIN para incluir clientes sin pedidos pagados; compara con INNER JOIN.
   Resultado esperado: Ana Demo 35000, Luis Demo 0 y Sol Demo 104500. INNER JOIN excluye al cliente sin pago.

5. Ejecuta Q3–Q5: compara INNER JOIN con LEFT JOIN y encuentra clientes sin pedidos usando IS NULL.
   Resultado esperado: INNER JOIN devuelve tres pedidos; LEFT JOIN conserva cuatro filas, incluida Luis con pedido NULL; el anti-join devuelve solo Luis.

6. Ejecuta Q8 y Q9 y mueve el filtro paid de ON a WHERE en una copia de Q7. Explica COUNT(o.id), HAVING y EXISTS.
   Resultado esperado: HAVING devuelve Ana con dos pedidos; EXISTS devuelve Ana y Sol. El filtro en WHERE elimina a Luis; en ON lo conserva con total cero.

## Entregables
- 3 consultas adicionales con su resultado esperado.
- Hoja Q1–Q9: consulta, resultado esperado, resultado obtenido y explicación de NULL y cardinalidad.
