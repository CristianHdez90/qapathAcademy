# Semana 9 · Lógica de negocio con pruebas unitarias

Aplicar condicionales, validación y aritmética a una función de cotización.

Herramientas: Node.js, node:test

## Preparación

- Opción integrada: usa «Configura y ejecuta en la plataforma» para practicar código y aserciones en el editor aislado. Puedes conservar también el trabajo externo con el kit de apoyo.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.

## Ejecución

1. En el ejecutor de esta semana, configura código y aserciones en el editor aislado y pulsa Ejecutar práctica. Compara la salida y guarda la evidencia con su fecha.
   Resultado esperado: El editor ejecuta las aserciones y muestra su salida o el error real; conserva el código al guardar la evidencia.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Ejecuta npm run test:unit y revisa pricing.mjs antes de modificarlo.
   Resultado esperado: Las pruebas iniciales pasan; el resultado con básico × 3, QA10 y envío es 104500.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Añade casos quantity -1, 0, 1, 5, 6 y 1.5.
   Resultado esperado: Solo enteros entre 1 y 5 se aceptan; las entradas inválidas lanzan RangeError.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Añade casos sin cupón, QA10 bajo el mínimo y cupón desconocido.
   Resultado esperado: Se aceptan reglas válidas y se rechazan las demás sin convertir errores en total cero.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Introduce descuento sobre el envío, observa el fallo y corrige la implementación.
   Resultado esperado: La prueba detecta 103500 en vez de 104500 y vuelve a pasar tras la corrección.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Relaciona cada prueba de la función con una partición de cantidad o una regla de cupón y registra el fallo de la mutación.
   Resultado esperado: La tabla entrada–esperado–obtenido enlaza cada regla con una aserción ejecutada en node:test.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- pricing.test.mjs ampliado y salida de node --test.
- Explicación de una prueba que realmente detectó una mutación.

## Criterios

- Los tests son independientes y deterministas.
- Se comprueba comportamiento observable.
- No se reemplazan aserciones por console.log.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
