# Semana 10 · Arrays y JSON: construye un reporte de pruebas

Procesar resultados de ejecución sin alterar el conjunto original ni ocultar errores.

Herramientas: Node.js, JSON

## Preparación

- Opción integrada: usa «Configura y ejecuta en la plataforma» para practicar código y aserciones en el editor aislado. Puedes conservar también el trabajo externo con el kit de apoyo.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.

## Ejecución

1. En el ejecutor de esta semana, configura código y aserciones en el editor aislado y pulsa Ejecutar práctica. Compara la salida y guarda la evidencia con su fecha.
   Resultado esperado: El editor ejecuta las aserciones y muestra su salida o el error real; conserva el código al guardar la evidencia.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Lee data/results.json y calcula passed, failed, blocked y total con reduce.
   Resultado esperado: Hay 6 casos: 3 passed, 2 failed y 1 blocked.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Filtra failed y ordénalos por id sin mutar el arreglo de entrada.
   Resultado esperado: Se obtienen TC-03 y TC-05; el JSON original conserva su orden.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Calcula tasa de aprobación sobre ejecutados, documentando que blocked no se ejecutó.
   Resultado esperado: 3 / (3 + 2) = 60 %; 3 / 6 = 50 % mide otra cosa y debe nombrarse distinto.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Genera summary.json y añade asserts para totales, tasa y lista de defectos.
   Resultado esperado: Un resultado con estado desconocido se rechaza en vez de contarse como aprobado.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Añade casos para reporte vacío, un estado desconocido y resultados desordenados; compara el JSON antes y después.
   Resultado esperado: El reporte vacío evita división por cero, el estado desconocido se rechaza y el arreglo original no cambia.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Script de reporte y summary.json.
- Tests de conteo, orden y estado desconocido.

## Criterios

- Se usan datos, no contadores escritos a mano.
- Los denominadores se explican.
- No se muta el fixture original.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
