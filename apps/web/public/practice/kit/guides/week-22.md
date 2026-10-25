# Semana 22 · Diagnóstico de flakiness y métricas honestas

Investigar intermitencias sin maquillar resultados con retries ni sleeps arbitrarios.

Herramientas: Playwright, Reportes

## Preparación

- Opción integrada: usa «Configura y ejecuta en la plataforma» para practicar etapas unitarias, API y UI con repeticiones y métricas. Puedes conservar también el trabajo externo con el kit de apoyo.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.
- Ejecuta npx playwright install chromium firefox webkit. Configura BASE_URL con la dirección de tu academia o el servidor local.
- Las pruebas usan exclusivamente /practice y /api/v1/practice. No uses cuentas ni endpoints reales de usuarios.

## Ejecución

1. En el ejecutor de esta semana, configura etapas unitarias, API y UI con repeticiones y métricas y pulsa Ejecutar práctica. Compara la salida y guarda la evidencia con su fecha.
   Resultado esperado: El informe muestra comprobaciones aprobadas, intentos y duración medidos en el navegador; las ejecuciones de CI externo se documentan por separado.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Repite smoke 10 veces en Chromium con --repeat-each=10 y conserva cada resultado.
   Resultado esperado: Se informa primera ejecución, duración y fallos; si no hay flakiness observada, se declara.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Compara el mock de 503 con una aserción de UI que espera un resultado observable.
   Resultado esperado: La sincronización depende del resultado o la respuesta, no de un sleep elegido al azar.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Diseña una tabla con pass rate inicial, flake rate y duración mediana usando denominadores explícitos.
   Resultado esperado: Un test que solo pasa al reintentar no se cuenta como estable.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Propón un cambio, repite la medición y compara evidencia antes/después.
   Resultado esperado: La conclusión indica tamaño de muestra y límites; no declara una mejora no medida.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Clasifica cada fallo observado por datos, sincronización, producto o ambiente y asigna una acción de seguimiento.
   Resultado esperado: Las hipótesis se sustentan en traces y ejecuciones; si no se reprodujo la intermitencia, se declara el límite.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Datos crudos, reporte de métricas y análisis.
- Corrección justificada o plan de investigación si no se reprodujo.

## Criterios

- Los retries no borran el primer fallo.
- Se distingue causa de correlación.
- El reporte mantiene fallos y casos bloqueados.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
