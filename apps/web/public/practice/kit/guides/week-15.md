# Semana 15 · Depura un defecto con trace y Network

Investigar causa, reproducir y separar el síntoma de la evidencia técnica.

Herramientas: Playwright Trace Viewer, QA Store

## Preparación

- Opción integrada: usa «Configura y ejecuta en la plataforma» para practicar escenarios configurables sobre QA Store. Puedes conservar también el trabajo externo con el kit de apoyo.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.
- Ejecuta npx playwright install chromium firefox webkit. Configura BASE_URL con la dirección de tu academia o el servidor local.
- Las pruebas usan exclusivamente /practice y /api/v1/practice. No uses cuentas ni endpoints reales de usuarios.

## Ejecución

1. En el ejecutor de esta semana, configura escenarios configurables sobre QA Store y pulsa Ejecutar práctica. Compara la salida y guarda la evidencia con su fecha.
   Resultado esperado: El modo defectuoso permite detectar la diferencia: esperado 104500 COP y obtenido 103500 COP. Desactívalo para el retest.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Añade un caso que active el defecto del cotizador y espere el total correcto 104500.
   Resultado esperado: La prueba falla mostrando 103500; es una variante con defecto intencional.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Ejecuta con --trace on y abre el trace generado.
   Resultado esperado: Se ve el paso que activó el defecto, los datos enviados y la aserción fallida.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Compara respuesta de quotes con el DOM.
   Resultado esperado: La API responde 104500; la interfaz defectuosa diverge 1000 COP.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Desactiva el defecto, repite y registra retest/regresión.
   Resultado esperado: La suite queda verde sin aumentar timeouts ni borrar la aserción.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Vincula el fallo automatizado con TC-02 y BUG-01, adjuntando el trace y la respuesta HTTP.
   Resultado esperado: El reporte separa el total correcto de API (104500) del mostrado en modo defectuoso (103500).
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Trace del fallo y análisis breve de causa.
- Bug, retest y captura de resultado corregido.

## Criterios

- Se preserva una aserción que detecta el bug.
- La evidencia separa UI y API.
- Se documenta cómo reproducir el modo defectuoso.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
