# Semana 19 · Automatización API basada en contrato y datos

Implementar pruebas API independientes con Playwright, contratos explícitos y aserciones de negocio.

Herramientas: Playwright APIRequestContext, JSON

## Preparación

- Opción integrada: sigue los cinco pasos de contratos API. Predice, ejecuta y comprueba diez escenarios con status, headers, tipos y valores de negocio. Conserva sus capturas y descarga datos y spec para repetirlos con Playwright.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.
- Ejecuta npx playwright install chromium firefox webkit. Configura BASE_URL con la dirección de tu academia o el servidor local.
- Las pruebas usan exclusivamente /practice y /api/v1/practice. No uses cuentas ni endpoints reales de usuarios.

## Ejecución

1. Selecciona el escenario, revisa método y datos, escribe tu predicción y ejecuta la solicitud. Completa catálogo, cotización, negativos, permisos y respuesta sin contenido.
   Resultado esperado: Cada escenario cumple su contrato completo; un status correcto no aprueba un error distinto, un importe con tipo incorrecto ni un total equivocado.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Descarga data/api-cases.training.ts y tests/api-contract.training.spec.ts. Cópialos en el kit y ejecuta npx playwright test tests/api-contract.training.spec.ts --project chromium.
   Resultado esperado: Se ejecutan API-01 a API-10 con aserciones explícitas; el reporte externo conserva resultado por escenario.
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

## Recorrido integrado y trazabilidad

Las predicciones no se rellenan automáticamente. El catálogo valida tipos, identificadores, precio y disponibilidad. La cotización comprueba tipos numéricos y el total esperado; los negativos requieren el error específico. Los tokens demo-reader y demo-admin son ficticios. La respuesta 204 se lee como texto vacío, sin parsear JSON.

Cada captura conserva fecha, headers, status y cuerpo. Cambiar una predicción, payload, total o token invalida la comprobación de ese caso. El mapa API-01 a API-10 identifica el test equivalente en el archivo descargado. Los archivos .training no reemplazan los originales del kit y descargarlos no genera un reporte externo.
