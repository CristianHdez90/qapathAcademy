# Semana 21 · Pipeline QA que produce evidencia útil

Crear un workflow reproducible que falle con una regresión y publique evidencia aun cuando falla.

Herramientas: GitHub Actions, Playwright

## Preparación

- Opción integrada: recorre cinco desafíos con progreso visible. Comprueba el workflow, ejecuta la base, provoca UI roja con esperado 34000 COP, corrige a 35000 COP y revisa las tres capturas. Son comprobaciones locales; el CI externo se documenta por separado.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.
- Ejecuta npx playwright install chromium firefox webkit. Configura BASE_URL con la dirección de tu academia o el servidor local.
- Las pruebas usan exclusivamente /practice y /api/v1/practice. No uses cuentas ni endpoints reales de usuarios.
- Ejecuta npm install y versiona package-lock.json del kit en un repositorio de práctica. Configura la variable QA_BASE_URL con el entorno de entrenamiento. No publiques secretos.

## Ejecución

1. Comprueba if: always() y conserva el código de salida. Ejecuta base, rojo y corrección en el laboratorio.
   Resultado esperado: base y corrección pasan las tres etapas; rojo pasa unitarias y API y falla UI por esperado 34000 frente a obtenido 35000 COP. Revisa, descarga y guarda el informe local. No es un HTML report, trace ni artifact publicado.

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
