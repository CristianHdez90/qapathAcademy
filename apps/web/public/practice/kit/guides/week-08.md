# Semana 8 · SQL y evidencia técnica con Git

Verificar datos con agregaciones y JOIN y dejar un cambio revisable.

Herramientas: PostgreSQL de práctica, Git, DevTools

## Preparación

- Opción integrada: usa «Configura y ejecuta en la plataforma» para practicar consultas SQL sobre PostgreSQL en memoria. Puedes conservar también el trabajo externo con el kit de apoyo.
- Usa una base PostgreSQL de práctica. Abre data/training.sql del kit; crea tablas TEMP y finaliza con ROLLBACK.
- Crea un repositorio propio y una rama practica/sql; no uses la base ni el repositorio de producción de la academia.

## Ejecución

1. En el ejecutor de esta semana, configura consultas SQL sobre PostgreSQL en memoria y pulsa Ejecutar práctica. Compara la salida y guarda la evidencia con su fecha.
   Resultado esperado: La consulta inicial INNER JOIN devuelve tres pedidos: dos de Ana y uno de Sol; puedes editarla o elegir LEFT JOIN.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Ejecuta Q1 y Q2: SELECT de columnas, WHERE y ORDER BY. Anota las filas esperadas antes de consultar.
   Resultado esperado: Q1 devuelve tres clientes; Q2 devuelve los pedidos pagados 3 (104500) y 1 (35000), ordenados por total descendente.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Ejecuta el archivo SQL completo y compara las agrupaciones por estado.
   Resultado esperado: paid tiene 2 pedidos y 139500 COP; pending tiene 1 y 75000 COP.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Usa LEFT JOIN para incluir clientes sin pedidos pagados; compara con INNER JOIN.
   Resultado esperado: Ana Demo 35000, Luis Demo 0 y Sol Demo 104500. INNER JOIN excluye al cliente sin pago.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Inspecciona en Network la cotización con QA10 y envío. Exporta solo datos ficticios.
   Resultado esperado: El JSON confirma total 104500 y se registra método, ruta, status y payload.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Añade consultas y evidencias con git diff, commit y una descripción de cambio.
   Resultado esperado: El diff contiene solo archivos de práctica; no aparecen .env, credenciales ni datos reales.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

7. Ejecuta Q3–Q5: compara INNER JOIN con LEFT JOIN y encuentra clientes sin pedidos usando IS NULL.
   Resultado esperado: INNER JOIN devuelve tres pedidos; LEFT JOIN conserva cuatro filas, incluida Luis con pedido NULL; el anti-join devuelve solo Luis.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

8. Ejecuta Q8 y Q9 y mueve el filtro paid de ON a WHERE en una copia de Q7. Explica COUNT(o.id), HAVING y EXISTS.
   Resultado esperado: HAVING devuelve Ana con dos pedidos; EXISTS devuelve Ana y Sol. El filtro en WHERE elimina a Luis; en ON lo conserva con total cero.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- 3 consultas adicionales con su resultado esperado.
- Diff y descripción tipo PR que explique qué validaste.
- Hoja Q1–Q9: consulta, resultado esperado, resultado obtenido y explicación de NULL y cardinalidad.

## Criterios

- Se explica el tratamiento de NULL.
- Las consultas no alteran tablas permanentes.
- El repositorio tiene instrucciones reproducibles.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
