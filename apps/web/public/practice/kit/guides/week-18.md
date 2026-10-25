# Semana 18 · Fixtures y datos aislados entre pruebas

Preparar escenarios repetibles y evitar dependencias de orden o sesiones compartidas.

Herramientas: Playwright fixtures, Datos sintéticos

## Preparación

- Opción integrada: usa «Configura y ejecuta en la plataforma» para practicar escenarios configurables sobre QA Store. Puedes conservar también el trabajo externo con el kit de apoyo.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.
- Ejecuta npx playwright install chromium firefox webkit. Configura BASE_URL con la dirección de tu academia o el servidor local.
- Las pruebas usan exclusivamente /practice y /api/v1/practice. No uses cuentas ni endpoints reales de usuarios.

## Ejecución

1. En el ejecutor de esta semana, configura escenarios configurables sobre QA Store y pulsa Ejecutar práctica. Compara la salida y guarda la evidencia con su fecha.
   Resultado esperado: La cotización por defecto responde 35000 COP; al cambiar datos o esperado se detectan diferencias y se registra el obtenido.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Inspecciona fixtures/training.ts y crea una fixture de datos de cotización.
   Resultado esperado: Cada test recibe datos propios y un QuotePage asociado a su Page.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Ejecuta la suite con --workers=2 y --repeat-each=3.
   Resultado esperado: Las pruebas no modifican un arreglo global ni dependen de la anterior.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Añade casos con y sin cupón y comprueba su independencia.
   Resultado esperado: El segundo caso no hereda QA10 ni el defecto del primero.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Documenta cómo aislarías cuentas y storageState en un sistema real.
   Resultado esperado: No se presenta demo-reader como una sesión real ni se publica un storageState con credenciales.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Diseña un experimento con dos casos que cambien cupón y cantidad en paralelo y compara sus resultados.
   Resultado esperado: Cada caso mantiene datos y contexto propios; se explica el alcance test frente a worker sin depender del orden.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Fixtures, datos y reporte de ejecuciones repetidas.
- Explicación de aislamiento y limpieza.

## Criterios

- Se distingue fixture de test de fixture de worker.
- Los datos personales se sustituyen por ficticios.
- No se arreglan carreras imponiendo orden de ejecución.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
