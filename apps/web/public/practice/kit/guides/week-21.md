# Semana 21 · Pipeline QA que produce evidencia útil

Crear un workflow reproducible que falle con una regresión y publique evidencia aun cuando falla.

Herramientas: GitHub Actions, Playwright

## Preparación

- Opción integrada: usa «Configura y ejecuta en la plataforma» para practicar etapas unitarias, API y UI con repeticiones y métricas. Puedes conservar también el trabajo externo con el kit de apoyo.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.
- Ejecuta npx playwright install chromium firefox webkit. Configura BASE_URL con la dirección de tu academia o el servidor local.
- Las pruebas usan exclusivamente /practice y /api/v1/practice. No uses cuentas ni endpoints reales de usuarios.
- Ejecuta npm install y versiona package-lock.json del kit en un repositorio de práctica. Configura la variable QA_BASE_URL con el entorno de entrenamiento. No publiques secretos.

## Ejecución

1. En el ejecutor de esta semana, configura etapas unitarias, API y UI con repeticiones y métricas y pulsa Ejecutar práctica. Compara la salida y guarda la evidencia con su fecha.
   Resultado esperado: El informe muestra comprobaciones aprobadas, intentos y duración medidos en el navegador; las ejecuciones de CI externo se documentan por separado.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Copia .github/workflows/qa.yml a tu repositorio y revisa cada paso.
   Resultado esperado: Node 22, npm ci, tests unitarios, instalación de browsers y suite se ejecutan en ese orden.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Abre un PR con un esperado intencionalmente incorrecto.
   Resultado esperado: El job queda rojo por una aserción, no por ocultar el exit code.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Descarga los artifacts aunque el job falle y encuentra el trace.
   Resultado esperado: HTML report y test-results quedan disponibles mediante if: always().
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Corrige el esperado y repite; registra el enlace a ambas ejecuciones.
   Resultado esperado: Hay evidencia roja/verde y no se usó continue-on-error para esconder el fallo.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Relaciona el commit del PR, el resultado rojo, el cambio de corrección y el resultado verde con sus artefactos.
   Resultado esperado: El informe permite revisar el fallo original y confirmar que la corrección no ocultó la aserción ni el exit code.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Workflow, lockfile, dos ejecuciones y artifacts.
- README con cómo configurar QA_BASE_URL.

## Criterios

- La instalación es reproducible con lockfile.
- Se conserva el código de salida de los tests.
- No se publican cookies ni tokens reales.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
