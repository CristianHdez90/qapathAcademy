# Semana 18 · Fixtures y datos aislados entre pruebas

Preparar escenarios repetibles y evitar dependencias de orden o sesiones compartidas.

Herramientas: Playwright fixtures, Datos sintéticos

## Preparación

- Opción integrada: sigue los cinco pasos de Fixtures y aislamiento. Prepara datos propios, observa contaminación, ejecuta ambos órdenes y lanza dos vistas separadas. Usa los archivos descargados para repetirlo con workers reales.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.
- Ejecuta npx playwright install chromium firefox webkit. Configura BASE_URL con la dirección de tu academia o el servidor local.
- Las pruebas usan exclusivamente /practice y /api/v1/practice. No uses cuentas ni endpoints reales de usuarios.

## Ejecución

1. Reparte los alcances y prepara de dos a cuatro casos. Observa la contaminación controlada, ejecuta los casos en vistas nuevas y compara el orden original con el inverso.
   Resultado esperado: Cada caso conserva su esperado en ambos órdenes y parte de un formulario limpio. Dos vistas diferentes no representan por sí solas BrowserContext ni workers de Playwright.
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

## Experimentos integrados y archivos nuevos

El experimento compartido conserva QA10, delivery y un defecto de presentación intencional. El siguiente intento de una unidad recibe HTTP 422, en lugar de la cotización independiente de 35000 COP. Los experimentos aislados observan campos iniciales limpios y vistas distintas. Comparten origen, cookies y storage; no crean BrowserContext ni workers de Playwright.

Descarga los cuatro archivos .training del último paso y cópialos en sus carpetas: pages, fixtures y tests. No reemplazan los archivos originales del kit. Ejecuta el nuevo spec con --workers=2 --repeat-each=3 y conserva reporte, comando y resultados reales.
