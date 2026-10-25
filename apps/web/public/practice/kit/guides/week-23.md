# Semana 23 · Proyecto QA integrador trazable

Reunir análisis, pruebas manuales, SQL y automatización UI/API con Playwright en una entrega coherente.

Herramientas: QA Store, Playwright, SQL

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

2. Elige 5 riesgos del cotizador y crea una matriz HU/criterio/caso/spec/evidencia.
   Resultado esperado: Cada riesgo tiene al menos una validación y se explican límites del sandbox.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Integra escenarios UI, API, negativos, permiso y límites; conserva la lectura y retos anteriores.
   Resultado esperado: El conjunto incluye 200/204/401/403/404/409/422 y evidencia del defecto de cálculo.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Cruza los reportes API con el conjunto SQL sintético sin afirmar que comparten una base real.
   Resultado esperado: Se identifica qué evidencia viene de fixtures SQL y cuál del sandbox stateless.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Ejecuta el pipeline y presenta una decisión de liberación basada en riesgo.
   Resultado esperado: Se adjuntan reportes reales y se señalan casos no automatizados y limitaciones.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Entrega la matriz de casos, historial de BUG-01, pruebas API de Playwright ejecutadas, resultados Q1–Q9 y un spec UI propio.
   Resultado esperado: Cada herramienta aporta evidencia acorde a su objetivo; los fixtures SQL no se presentan como datos persistidos por el sandbox.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Repositorio con tests UI/API, datos y matriz trazable.
- Informe de calidad y enlace al pipeline.

## Criterios

- La cantidad de tests no reemplaza cobertura.
- Se puede reproducir sin secretos.
- No hay resultados inventados ni credenciales de producción.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
