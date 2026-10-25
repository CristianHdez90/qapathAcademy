# Semana 16 · Matriz de navegadores y smoke por etiquetas

Ejecutar cobertura útil en desktop y móvil sin inflar artificialmente los casos.

Herramientas: Chromium, Firefox, WebKit

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

2. Revisa los projects del kit y ejecuta npm run test:smoke.
   Resultado esperado: Los casos @smoke se ejecutan en Chromium, Firefox y WebKit.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Añade un proyecto con viewport 390 × 844 y valida el formulario.
   Resultado esperado: Controles y total permanecen accesibles sin desbordamiento horizontal.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Separa smoke de regresión por tags y compara el número de escenarios lógicos y ejecuciones.
   Resultado esperado: Un caso en 3 navegadores son 3 ejecuciones, no 3 requisitos nuevos.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Explica qué evidencia conservarás cuando falla solo un navegador.
   Resultado esperado: Reporte, navegador, versión, viewport, trace y pasos reproducibles.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Registra cada combinación caso–navegador–viewport con esperado, obtenido y estado propio.
   Resultado esperado: Un navegador no ejecutado queda pendiente; tres ejecuciones del mismo caso no se presentan como tres requisitos.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Configuración de proyectos, filtros y resultados.
- Matriz de cobertura y clasificación de un fallo por navegador.

## Criterios

- Se explican decisiones de cobertura.
- La suite no depende de estado compartido.
- No se marca passed un navegador que no se ejecutó.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
