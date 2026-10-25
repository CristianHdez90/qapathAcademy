# Semana 19 · Automatización API basada en contrato y datos

Implementar pruebas API independientes con Playwright, contratos explícitos y aserciones de negocio.

Herramientas: Playwright APIRequestContext, JSON

## Preparación

- Opción integrada: usa «Configura y ejecuta en la plataforma» para practicar contratos API mediante solicitudes HTTP. Puedes conservar también el trabajo externo con el kit de apoyo.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.
- Ejecuta npx playwright install chromium firefox webkit. Configura BASE_URL con la dirección de tu academia o el servidor local.
- Las pruebas usan exclusivamente /practice y /api/v1/practice. No uses cuentas ni endpoints reales de usuarios.

## Ejecución

1. En el ejecutor de esta semana, configura contratos API mediante solicitudes HTTP y pulsa Ejecutar práctica. Compara la salida y guarda la evidencia con su fecha.
   Resultado esperado: La solicitud devuelve estado, cabeceras y cuerpo; el estado obtenido se compara con el esperado configurado.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Ejecuta npm run test:api -- --project=chromium.
   Resultado esperado: Se verifican catálogo, total y códigos HTTP del simulador.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Añade pruebas de quotes para 400, 404, 409 y 422.
   Resultado esperado: Se validan tanto status como error; el 204 no se parsea como JSON.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Parametriza las filas de quote-cases.json y verifica total solo en los éxitos.
   Resultado esperado: Cada fila produce su esperado; un mensaje de error no pasa por tener un status dentro de cualquier 4xx.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Añade las tres variantes de access y relaciona cada caso de autorización con su spec de Playwright.
   Resultado esperado: Sin token 401, reader/write 403 y admin/write 200. No se requiere identidad real.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Traza cada caso de la matriz de contratos a una prueba request de Playwright con datos y resultado del reporte.
   Resultado esperado: La matriz identifica equivalencias y nuevos riesgos; un status correcto no reemplaza las aserciones de contrato.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Suite API con 8 o más escenarios propios y contrato explícito.
- Matriz de contrato, caso y spec de Playwright con su reporte.

## Criterios

- No se duplican requests sin variar cobertura.
- Se valida tipo y valor de campos de negocio.
- Se distingue servicio stateless de un CRUD persistente.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.
