# Semana 11 · TypeScript: modela contratos y errores

Modelar los resultados de una API con tipos discriminados y validar lo que llega desde la red.

Herramientas: TypeScript, Node.js

## Preparación

- Opción integrada: usa «Configura y ejecuta en la plataforma» para practicar código y aserciones en el editor aislado. Puedes conservar también el trabajo externo con el kit de apoyo.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.

## Ejecución

1. En el ejecutor de esta semana, configura código y aserciones en el editor aislado y pulsa Ejecutar práctica. Compara la salida y guarda la evidencia con su fecha.
   Resultado esperado: El editor ejecuta las aserciones y muestra su salida o el error real; conserva el código al guardar la evidencia.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Crea QuoteInput, QuoteResult y ApiResult<T> con una unión success/error.
   Resultado esperado: TypeScript obliga a comprobar la rama antes de leer data.total.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Compila con strict y agrega una asignación inválida quantity:"3".
   Resultado esperado: La compilación falla con la asignación inválida; luego la eliminas.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Recibe JSON como unknown y valida sus campos antes de convertirlo en QuoteResult.
   Resultado esperado: Un objeto sin total o con total texto se rechaza en tiempo de ejecución; un cast as no cuenta como validación.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Separa una clase cliente del cálculo y prueba su resultado con datos ficticios.
   Resultado esperado: No se mezcla presentación con transporte y el contrato válido contiene currency COP.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Diseña una tabla de contratos válidos e inválidos y ejecuta la validación de runtime con cada objeto.
   Resultado esperado: Se rechazan total ausente, total de tipo texto y moneda no acordada sin depender únicamente de un cast.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Tipos, validador de runtime y evidencia de compilación.
- Tests de datos válidos e inválidos.

## Criterios

- No se usa any para esconder errores.
- Se distingue chequeo estático de validación runtime.
- Los errores son parte del contrato.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
