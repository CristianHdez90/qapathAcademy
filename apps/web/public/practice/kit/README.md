# QAPath · kit práctico de 24 semanas

Trabaja en una carpeta propia. Todos los datos son ficticios; los tokens demo-reader y demo-admin son públicos y solo funcionan en `/api/v1/practice/access`.

## Empieza sin instalar nada

En `/practice/1` a `/practice/24` encontrarás «Configura y ejecuta en la plataforma», junto a la preparación y las instrucciones de la semana. Puedes ejecutar solicitudes HTTP del sandbox, consultas SQL en PostgreSQL en memoria, código JavaScript/TypeScript aislado y escenarios sobre la interfaz de QA Store. Guarda la evidencia para conservar configuración y último resultado. Este kit sigue disponible como alternativa de trabajo con las herramientas externas.

Los escenarios UI del sitio usan el navegador y permiten descargar su spec para Playwright. No sustituyen una ejecución del runner Playwright o un job de GitHub Actions. El editor TypeScript transpila y ejecuta aserciones; para comprobar tipos con strict usa tsc desde tu proyecto del kit.

Abre `/practice` en tu academia. El cotizador permite ejecutar casos manuales y el explorador devuelve códigos HTTP reales sobre el protocolo, con contenido simulado. Las cotizaciones NO crean pedidos ni persisten datos.

Reglas: basic = 35000 COP; pro = 75000 COP; sold-out sin cupos. Cantidad entera 1–5. Cupón QA10 descuenta 10 % del subtotal desde 100000 COP. Recogida gratis; delivery 10000 COP sin descuento. Basic × 3 + QA10 + delivery = **104500 COP**.

La opción «Activar defecto de cálculo» introduce intencionalmente un error en el total mostrado (103500 en ese escenario). La API conserva el total correcto. Desactívala para el retest; no es un defecto de cobro real.

## Postman · solo módulo 03 (semanas 7–8)

Importa `qapath.postman_collection.json`. Cambia su variable baseUrl por la URL de tu academia sin barra final ni `/api/v1`. El botón de descarga del entorno web ya pone la URL de la página actual.

1. Ejecuta Códigos HTTP, Cotizaciones y Autorización. 204 no tiene cuerpo; 429 y 503 incluyen Retry-After: 5. Un 201 en el simulador solo demuestra el protocolo; no crea un recurso persistente.
2. Para datos variables, selecciona solamente la carpeta Datos en el runner y agrega `data/quote-cases.csv`.
3. Revisa las aserciones en Scripts → Post-response. Cambia una para observar un fallo controlado y luego restáurala.
4. No cambies los tokens por credenciales de la academia ni dirijas estos casos negativos a APIs de terceros.

## Node.js y Playwright (desde la semana 9)

Requiere Node.js 22 o posterior. Abre una terminal en esta carpeta:

```sh
npm install
npm run test:unit
npx playwright install chromium firefox webkit
```

Configura el destino. En PowerShell:

```powershell
$env:BASE_URL = "https://qapath-academy-vvfw.vercel.app"
npm test -- --project=chromium
npm run test:smoke
npm run report
```

En Bash: `BASE_URL=https://tu-academia.vercel.app npm test`.
Para tu copia local de la academia usa `http://127.0.0.1:3000`. El kit no levanta un backend propio: utiliza el sandbox de la academia indicada en BASE_URL.

Se incluyen ejemplos iniciales funcionales: amplíalos con los casos propios pedidos en cada semana. No basta con entregar el código inicial sin explicar ni ejecutar pruebas nuevas. Guarda el resultado observado y la fecha/versión.

## SQL (semana 8)

Ejecuta `data/training.sql` completo en PostgreSQL de práctica. Usa tablas TEMP con nombres qa_training_* y ROLLBACK; no son los usuarios ni pedidos de la academia. Los totales esperados aparecen como comentarios. No lo ejecutes en una base de negocio.

Las consultas Q1–Q9 avanzan desde SELECT, WHERE y ORDER BY hasta INNER JOIN, LEFT JOIN, IS NULL, GROUP BY, HAVING y EXISTS. Q10 relaciona pedidos, detalles y productos; Q11 concilia los totales de los pedidos. Antes de ejecutar cada consulta, escribe sus filas esperadas. Después registra el obtenido y explica la cardinalidad y el tratamiento de NULL. Compara el filtro de pagos en ON con el mismo filtro en WHERE.

La base de práctica contiene 8 clientes, 12 pedidos, 6 productos y 14 líneas de detalle. `data/training-data.json` describe las columnas, claves, relaciones y registros que muestra la pista de la plataforma. Clientes → pedidos → detalle de pedidos ← productos son relaciones de uno a muchos. Luis y Eva no tienen pedidos. Los importes están en COP; los totales de pedidos coinciden con la suma de cantidad × precio unitario de sus líneas. En la plataforma cada ejecución restaura los datos iniciales; puedes escribir una consulta libre o modificar un ejemplo.

## Primera prueba Playwright (semana 13)

Empieza por `tests/first-quote.spec.ts`: usa `page` directamente, con Given/When/Then y una aserción del total. Después de configurar BASE_URL, ejecuta `npx playwright test tests/first-quote.spec.ts --project=chromium`. Repite con `--headed`. Cambia temporalmente el esperado para ver un fallo, restaura el valor y revisa `npm run report`. En arquitectura (semana 17), refactoriza ese mismo caso a QuotePage.

## Matriz de casos y ciclo de vida del bug (semanas 1–6)

Completa `templates/case-matrix.csv` y revisa `templates/case-and-bug-guide.md`. Define el esperado antes de ejecutar y registra el obtenido después. Si confirmas un defecto, completa `templates/bug-report.md` y enlaza el caso con `templates/bug-lifecycle.csv`. Practica cierre tras retest aprobado y reapertura si persiste. La matriz editable del sitio se guarda con la evidencia de su semana.

## Actividad específica por semana

Abre `guides/week-01.md` a `guides/week-24.md`. Cada guía indica herramienta, preparación, acciones, esperado y entregables del tema correspondiente. Las pruebas externas se ejecutan en Postman, PostgreSQL o tu terminal; los formularios del sitio registran la evidencia.

## GitHub Actions (semana 21)

1. Crea un repositorio de práctica y versiona el package-lock.json que genera npm install.
2. Incluye la carpeta `.github` del kit (puede estar oculta en el explorador).
3. Configura la variable de repositorio QA_BASE_URL con tu entorno de entrenamiento. Si no se define, Playwright usa el dominio público de QAPath del archivo de configuración.
4. El workflow ejecuta npm ci y publica reportes incluso cuando falla. Respeta los límites de uso de tu cuenta; el kit no habilita servicios ni suscripciones.

## Evidencia

Usa `data/test-cases.csv` y `data/results.json` como punto de partida. Adjunta código, solicitudes/respuestas, reporte y conclusiones en el ejercicio de la semana. No incluyas secretos, datos personales ni storageState real.
