# Semana 12 · Asincronía: status HTTP, error de red y timeout

Construir un cliente que distinga fallos y libere los recursos de cada consulta.

Herramientas: Node.js, fetch, AbortController

## Preparación

- Opción integrada: usa «Configura y ejecuta en la plataforma» para practicar código y aserciones en el editor aislado. Puedes conservar también el trabajo externo con el kit de apoyo.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.

## Ejecución

1. En el ejecutor de esta semana, configura código y aserciones en el editor aislado y pulsa Ejecutar práctica. Compara la salida y guarda la evidencia con su fecha.
   Resultado esperado: El editor ejecuta las aserciones y muestra su salida o el error real; conserva el código al guardar la evidencia.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Consulta products con fetch y comprueba response.ok antes de leer el contrato.
   Resultado esperado: 200 se procesa como éxito con 3 productos; fetch no lanza automáticamente por un 404.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Consulta status/404 y status/503; informa código y mensaje sin tratar el cuerpo como producto.
   Resultado esperado: Se obtienen errores HTTP diferenciados, no errores de red ficticios.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Prueba un timeout con un fetch inyectado pendiente que se cancele con AbortSignal.
   Resultado esperado: Se registra cancelación sin usar endpoints externos impredecibles.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Usa try/finally para limpiar el timer y un test con fetch mock para un rechazo de red.
   Resultado esperado: Error HTTP, timeout y error de red tienen resultados verificables diferentes.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Construye una matriz con éxito, HTTP 404, HTTP 503, error de red y cancelación mediante fetch inyectado.
   Resultado esperado: Cada escenario tiene una aserción y una causa identificable; el timer se limpia aunque la promesa falle.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Cliente con dependencia fetch inyectable.
- Tests deterministas de éxito, HTTP, timeout y red.

## Criterios

- No se reintenta indefinidamente.
- Los timers se limpian.
- No se registran secretos en mensajes.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
