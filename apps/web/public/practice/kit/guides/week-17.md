# Semana 17 · Page Objects con responsabilidades claras

Refactorizar interacciones repetidas sin esconder el propósito de cada prueba.

Herramientas: Playwright, Page Object Model

## Preparación

- Opción integrada: sigue los cinco pasos de Page Objects: reparte responsabilidades, ejecuta tres casos, practica mantenimiento en el fixture local y compara defecto y retest. Descarga los archivos para repetirlo con el kit.
- Extrae el kit, instala Node.js 22 o posterior y abre una terminal en esa carpeta.
- Ejecuta npm install. No ejecutes scripts en el repositorio de producción de la academia.
- Ejecuta npx playwright install chromium firefox webkit. Configura BASE_URL con la dirección de tu academia o el servidor local.
- Las pruebas usan exclusivamente /practice y /api/v1/practice. No uses cuentas ni endpoints reales de usuarios.

## Ejecución

1. Configura clase y método en Construye y cotiza. Ejecuta el caso válido y los dos negativos; conserva esperado, obtenido y estado HTTP de cada uno.
   Resultado esperado: El caso válido cumple su total; cupón inválido y sin cupos se comprueban con HTTP 422 y 409. Un 503 deja pendiente el objetivo.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Revisa pages/QuotePage.ts y localiza qué pertenece a navegación, interacción y aserción.
   Resultado esperado: Los nombres describen comportamientos de negocio; el test conserva el escenario visible.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Crea casos válido, cupón inválido y agotado reutilizando la página.
   Resultado esperado: Cada test tiene datos y aserciones propias; no se comparte una instancia de Page entre tests.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Cambia el label de un control en una copia del entorno o un fixture controlado.
   Resultado esperado: La corrección del locator se centraliza; no se duplican selectores en cinco specs.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

5. Explica por qué no creaste una clase base genérica con decenas de métodos.
   Resultado esperado: Se favorece composición, legibilidad y responsabilidades pequeñas.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

6. Refactoriza el test básico first-quote.spec.ts a QuotePage y compara la legibilidad y los selectores duplicados.
   Resultado esperado: El refactor conserva las aserciones de negocio y la capacidad de detectar el defecto de cálculo.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Page Object y tres specs refactorizados.
- Decisión técnica sobre límites del patrón.

## Criterios

- El test sigue mostrando qué se valida.
- No hay page global mutable.
- El refactor conserva la capacidad de detectar fallos.
- La evidencia identifica caso, herramienta, fecha/versión y resultado esperado frente al obtenido; no se inventan ejecuciones.

## Recorrido integrado y archivos nuevos

El mantenimiento de Cantidad a Unidades ocurre solo en el fixture local. QA Store conserva Cantidad. La reproducción del defecto espera 104500 COP y observa 103500 COP; el retest conserva 104500 COP sin el defecto.

Los archivos generados usan pages/QuotePage.training.ts (o el nombre de clase configurado) y tests/pom-*.spec.ts para no reemplazar pages/QuotePage.ts del kit. Copia cada archivo en su carpeta. La reproducción BUG-01 debe fallar; conserva el trace real al ejecutarla externamente.
