# Semana 13 · Primera suite Playwright ejecutable

Instalar el runner, ejecutar una prueba UI y producir evidencia reproducible.

Herramientas: Playwright, TypeScript

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

2. Crea tests/first-quote.spec.ts con test, expect y page. Identifica Given, When y Then en el código inicial sin usar Page Objects todavía.
   Resultado esperado: El primer test navega a /practice, llena cuatro controles y comprueba el total 35000 COP mediante una aserción con await.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Ejecuta npx playwright test tests/first-quote.spec.ts --project=chromium y después --headed para observarlo.
   Resultado esperado: El runner ejecuta el archivo creado y muestra el resultado; el reporte conserva contexto si la aserción falla.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Ejecuta npm test -- --project=chromium tests/ui.spec.ts.
   Resultado esperado: La cotización mínima muestra 35000 COP y la de descuento/envío 104500 COP.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Localiza controles por label y el botón por role; añade el escenario pro × 2.
   Resultado esperado: La prueba opera controles observables; pro × 2 sin descuento ni envío totaliza 150000 COP.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Cambia un esperado para forzar un fallo y abre npm run report.
   Resultado esperado: El reporte identifica la aserción fallida y conserva trace; después corriges el esperado.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

7. Explica cómo repetir la suite desde una carpeta recién extraída.
   Resultado esperado: README identifica Node, npm install, instalación de browsers y BASE_URL.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Primer spec propio y reporte HTML.
- Evidencia de fallo controlado y corrección.

## Criterios

- No se automatizan cuentas reales.
- Las aserciones usan await.
- El script falla cuando el resultado es incorrecto.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
