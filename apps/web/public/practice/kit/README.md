# QAPath · kit práctico de 24 semanas

Trabaja en una carpeta propia. Todos los datos son ficticios; los tokens demo-reader y demo-admin son públicos y solo funcionan en `/api/v1/practice/access`.

## Empieza sin instalar nada

Abre `/practice` en tu academia. El cotizador permite ejecutar casos manuales y el explorador devuelve códigos HTTP reales sobre el protocolo, con contenido simulado. Las cotizaciones NO crean pedidos ni persisten datos.

Reglas: basic = 35000 COP; pro = 75000 COP; sold-out sin cupos. Cantidad entera 1–5. Cupón QA10 descuenta 10 % del subtotal desde 100000 COP. Recogida gratis; delivery 10000 COP sin descuento. Basic × 3 + QA10 + delivery = **104500 COP**.

La opción «Activar defecto de cálculo» introduce intencionalmente un error en el total mostrado (103500 en ese escenario). La API conserva el total correcto. Desactívala para el retest; no es un defecto de cobro real.

## Postman

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

## GitHub Actions (semana 21)

1. Crea un repositorio de práctica y versiona el package-lock.json que genera npm install.
2. Incluye la carpeta `.github` del kit (puede estar oculta en el explorador).
3. Configura la variable de repositorio QA_BASE_URL con tu entorno de entrenamiento. Si no se define, Playwright usa el dominio público de QAPath del archivo de configuración.
4. El workflow ejecuta npm ci y publica reportes incluso cuando falla. Respeta los límites de uso de tu cuenta; el kit no habilita servicios ni suscripciones.

## Evidencia

Usa `data/test-cases.csv` y `data/results.json` como punto de partida. Adjunta código, solicitudes/respuestas, reporte y conclusiones en el ejercicio de la semana. No incluyas secretos, datos personales ni storageState real.
