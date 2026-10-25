# Semana 9 · JavaScript y entrega con Git

Aplicar condicionales, validación y aritmética a una función de cotización y conservar cambios revisables con Git.

## Preparación
- Opción integrada: usa «Configura y ejecuta en la plataforma» para practicar código y aserciones en el editor aislado. Puedes conservar también el trabajo externo con el kit de apoyo.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.
- Git está en las pestañas de esta actividad. El repositorio de entrenamiento es independiente del proyecto de la academia.

## Actividad
1. En el ejecutor de esta semana, configura código y aserciones en el editor aislado y pulsa Ejecutar práctica. Compara la salida y guarda la evidencia con su fecha.
   Resultado esperado: El editor ejecuta las aserciones y muestra su salida o el error real; conserva el código al guardar la evidencia.

2. Ejecuta npm run test:unit y revisa pricing.mjs antes de modificarlo.
   Resultado esperado: Las pruebas iniciales pasan; el resultado con básico × 3, QA10 y envío es 104500.

3. Añade casos quantity -1, 0, 1, 5, 6 y 1.5.
   Resultado esperado: Solo enteros entre 1 y 5 se aceptan; las entradas inválidas lanzan RangeError.

4. Añade casos sin cupón, QA10 bajo el mínimo y cupón desconocido.
   Resultado esperado: Se aceptan reglas válidas y se rechazan las demás sin convertir errores en total cero.

5. Introduce descuento sobre el envío, observa el fallo y corrige la implementación.
   Resultado esperado: La prueba detecta 103500 en vez de 104500 y vuelve a pasar tras la corrección.

6. Relaciona cada prueba de la función con una partición de cantidad o una regla de cupón y registra el fallo de la mutación.
   Resultado esperado: La tabla entrada–esperado–obtenido enlaza cada regla con una aserción ejecutada en node:test.

7. En Comandos Git inicializa el repositorio, guarda caso.md, revisa status, prepara con add, crea commit y consulta log.
   Resultado esperado: El repositorio aislado conserva un commit con SHA y permite revisar el cambio sin publicar archivos ni secretos.

## Entregables
- pricing.test.mjs ampliado y salida de node --test.
- Explicación de una prueba que realmente detectó una mutación.
- Respuesta de Git con identificador del commit.
