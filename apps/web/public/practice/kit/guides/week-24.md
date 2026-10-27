# Semana 24 · Entrega profesional y demo técnica de cinco minutos

Explicar decisiones y evidencias como QA Engineer, con una demostración reproducible.

Herramientas: Repositorio, Demo, Reportes

## Preparación

- Opción integrada: recorre cinco desafíos: historia y README, cinco resultados UI/API, arquitectura, guion de 300 segundos y checklist manual. El cronómetro opcional guarda el tiempo real al pausar y guardar la evidencia; no inventa una demo de cinco minutos.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.
- Ejecuta npx playwright install chromium firefox webkit. Configura BASE_URL con la dirección de tu academia o el servidor local.
- Las pruebas usan exclusivamente /practice y /api/v1/practice. No uses cuentas ni endpoints reales de usuarios.
- Prepara una copia limpia del repositorio de práctica y revisa su contenido antes de hacerlo público.

## Ejecución

1. Prepara tu historia y ejecuta la demo integrada: caso válido, 401/403, BUG-01 y retest. Completa decisiones técnicas, guion y revisión de entrega.
   Resultado esperado: base 35000 COP; bug 103500 frente a esperado 104500; retest 104500. Se conservan capturas y fechas, README, guion, checklist declarado y siguiente mejora. La revisión no ejecuta npm ci, no verifica enlaces y no publica el repositorio.

2. Instala desde una carpeta limpia con npm ci y ejecuta smoke.
   Resultado esperado: Las instrucciones funcionan usando el lockfile y la variable BASE_URL documentada.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Demuestra un caso válido, 401/403 y el defecto intencional con su retest.
   Resultado esperado: Cada resultado se relaciona con una regla y una evidencia; los tokens son de demostración.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Explica POM, fixtures, mocks, pipeline y un compromiso de diseño en cinco minutos.
   Resultado esperado: Se distingue qué se probó de lo que se supone y se presentan límites del enfoque.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Revisa historial Git, artifacts y archivos antes de publicar y prepara una mejora siguiente.
   Resultado esperado: No hay .env, contraseñas, storageState real ni datos personales; README incluye arquitectura y próximos pasos.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Presenta un caso fallido, su reporte de bug, el historial y el retest, junto a consultas SQL y pruebas UI/API de Playwright.
   Resultado esperado: La demo distingue evidencia obtenida, expectativas, limitaciones y estado real de los defectos.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- README profesional, demo y enlaces verificables a reportes.
- Checklist de entrega y propuesta priorizada de mejoras.

## Criterios

- La demo es repetible y no depende de cuentas privadas.
- Se justifican decisiones con evidencia.
- El portafolio comunica el alcance real sin exagerarlo.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
