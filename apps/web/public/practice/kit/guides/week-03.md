# Semana 3 · Historia de usuario BDD y Gherkin

Analizar una HU, distinguir contexto, acción y resultado, construir un escenario con opciones y validar su coherencia con los criterios de aceptación.

## Historia de usuario

**Como** cliente registrado,  
**Quiero** acceder a mis pedidos con mi cuenta,  
**Para** consultar mis compras de forma segura.

## De la HU al escenario

1. Revisa la historia de usuario y separa actor, necesidad y beneficio de los escenarios que ejemplifican sus criterios.
   Resultado esperado: Como, Quiero y Para describen la HU; Given, When y Then describen un ejemplo de comportamiento.

2. Abre la explicación del .feature: Feature agrupa la funcionalidad y Scenario identifica un comportamiento; Given establece contexto, When ejecuta la acción y Then expresa la salida observable.
   Resultado esperado: Un archivo UTF-8 con Feature: y Scenario:, seguido de pasos Given, When y Then sin dos puntos.

3. Sigue las cuatro piezas del constructor: título, Given, When y Then. Usa Siguiente paso y las pistas, observa el .feature y ejecuta para revisar roles, acciones y resultados.
   Resultado esperado: El validador diferencia errores de rol, acciones fuera de la HU, resultados ambiguos y contradicciones con CA-01, CA-02 o CA-03.

4. Construye una variante de acceso permitido y otra de acceso rechazado por credenciales incorrectas o cuenta inactiva.
   Resultado esperado: Un rechazo del acceso puede ser un escenario correcto cuando ese es el comportamiento esperado por la HU.

5. Descarga tu .feature después de validarlo. En la bitácora revisa el escenario ejecutado, explica tus decisiones con las preguntas y guarda el borrador o descarga el informe. Pulsa Finalizar práctica para completar el recorrido con un escenario válido.
   Resultado esperado: El escenario se conserva en su archivo y en la evidencia; ejecutarlo con Cucumber requiere implementar sus step definitions.

Consulta ../features/acceso-mis-pedidos.feature y la referencia oficial https://cucumber.io/docs/gherkin/reference/. El laboratorio valida opciones contra una regla local; no ejecuta Cucumber ni un acceso real.
