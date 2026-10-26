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

## Misión integrada: JavaScript y Git

1. Elige Tu primera comprobación y ejecuta las aserciones. Después explora límites e inválidos.
2. En Atrapa el descuento incorrecto, investiga la diferencia 103500 frente a 104500. Corrige la línea o carga Comprueba la corrección para ejecutar el retest. El fallo previo queda conservado.
3. En Comandos Git, inicializa el repositorio, guarda caso.md, revisa status, prepara con add y crea un commit. Consulta log. Las marcas reflejan el estado real observado: guardar o seleccionar un comando no equivale a un commit.
4. Revisa la bitácora: código, salida, fallo investigado y archivo/commit se adjuntan automáticamente. Guarda un borrador o descarga el informe.
5. Para finalizar el nuevo recorrido, verifica una ejecución JavaScript con aserciones correctas y un archivo confirmado que coincida con el editor, con árbol limpio. Luego pulsa Finalizar práctica. Las prácticas completadas anteriormente se conservan.

El código del navegador usa assert en un entorno aislado. Los archivos del kit permiten ejecutar node:test en tu equipo. El repositorio Git de la plataforma vive en este navegador; la evidencia puede sincronizarse con tu cuenta.
