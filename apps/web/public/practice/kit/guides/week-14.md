# Semana 14 · Locators estables y accesibilidad básica

Reemplazar selectores frágiles por contratos accesibles y verificar el uso por teclado.

Herramientas: Playwright, DevTools

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

2. Busca selectores por posición o clase en un spec de prueba y reemplázalos con getByLabel/getByRole.
   Resultado esperado: Los controles Producto ficticio, Cantidad, Cupón, Envío y Cotizar se identifican sin depender del orden.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Añade una aserción sobre el mensaje 422 tras enviar cantidad 0.
   Resultado esperado: El alert aparece y no se acepta un total anterior como resultado vigente.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Recorre el formulario con Tab y comprueba foco visible y etiquetas.
   Resultado esperado: Cada campo tiene nombre accesible; se puede cotizar sin ratón.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Cambia un envoltorio visual o tamaño de ventana y repite las pruebas.
   Resultado esperado: La prueba sigue operando; no se utilizan sleeps fijos para sincronizar.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Compara dos locators del mismo control: uno por clase y otro por rol; modifica un envoltorio en un fixture local.
   Resultado esperado: La evidencia explica qué selector conserva intención y cómo se resuelve una coincidencia múltiple sin first arbitrario.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Spec refactorizado y comparación de selectores.
- Checklist de teclado y nombres accesibles con evidencias.

## Criterios

- No se usan nth ni clases CSS como primera opción.
- Las aserciones esperan estado observable.
- No se declara conformidad WCAG completa con esta revisión limitada.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
