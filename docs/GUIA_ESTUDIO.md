# QAPath Academy · Guía de estudio completa

Clase introductoria + 24 clases, de QA Manual a QA Automation con Playwright y TypeScript.

# Clase introductoria · Cómo trabaja un equipo de desarrollo con Scrum

**QAPath Academy · Aprendizaje previo al módulo 1 · Tiempo sugerido: 60–90 minutos**

## 1. Cómo se construye software actualmente

En muchos productos digitales, un equipo interdisciplinario entrega incrementos de valor en ciclos breves. La organización puede combinar descubrimiento de necesidades, diseño, programación, testing, despliegue y seguimiento. No todas las empresas usan Scrum: también existen Kanban, enfoques híbridos y otros marcos de trabajo. En este caso estudiaremos un equipo que trabaja con **Scrum**.

El flujo ilustrativo es: **necesidad de usuario → Product Backlog → refinamiento → Sprint Planning → trabajo conjunto durante el Sprint → incremento verificable → Sprint Review y feedback → adaptación del Product Backlog y mejora en la retrospectiva**. Es un ciclo de aprendizaje; no debe entenderse como una cadena rígida de departamentos ni como una fase de QA al final.

## 2. Organigrama funcional (no jerárquico)

```text
                 USUARIOS FINALES Y STAKEHOLDERS
                       necesidades / feedback
                                ↕
┌──────────────────────────────────────────────────────┐
│                  SCRUM TEAM                          │
│           Un objetivo de producto común              │
│                                                      │
│    PRODUCT OWNER       DEVELOPERS      SCRUM MASTER  │
│    Valor y backlog     Incremento      Eficacia de   │
│                       de producto     Scrum         │
│                       ┌───────────┐                  │
│                       │ Front-end │                  │
│                       │ Back-end  │                  │
│                       │ QA/Test   │                  │
│                       │ UX / DevOps cuando aportan  │
│                       │ a construir el Incremento  │
│                       └───────────┘                  │
└──────────────────────────────────────────────────────┘
```

**Nota fundamental de la Guía Scrum 2020:** Scrum define tres responsabilidades (accountabilities) dentro del Scrum Team: **Product Owner, Scrum Master y Developers**. QA no es una cuarta responsabilidad formal: en el ejemplo, la persona QA participa dentro de **Developers**, aportando competencias de calidad. Usuarios finales, patrocinadores y otros stakeholders colaboran con el equipo, pero no forman parte necesariamente del Scrum Team. No hay subequipos ni jerarquías internas prescriptas por Scrum; el equipo es multifuncional y autogestionado. Un Scrum Team suele tener 10 personas o menos.

| Participante | Qué aporta | Responsabilidad / participación ante la historia de usuario |
|---|---|---|
| Usuario final / stakeholder | Necesidad, contexto, feedback, uso real | Explica el problema y valida que el resultado aporta valor; no suele decidir la implementación técnica. |
| Product Owner (PO) | Valor, priorización, objetivo de producto | Gestiona eficazmente el Product Backlog, ordena el trabajo y explica qué resultado es valioso. Puede delegar trabajo de refinamiento, pero conserva su accountability. |
| Ingeniería (front-end / back-end) | Solución técnica, código, integraciones | Colabora en la estimación y el plan; diseña, implementa y verifica la solución, cuidando la Definition of Done. |
| QA / testing dentro de Developers | Riesgos, ejemplos, pruebas y evidencia | Plantea preguntas tempranas, diseña escenarios positivos/negativos/borde, automatiza donde conviene, ayuda a garantizar calidad durante todo el Sprint. No es un aprobador ajeno al equipo ni el único responsable de la calidad. |
| Scrum Master | Eficacia del equipo y Scrum | Ayuda a que se entiendan y apliquen Scrum, facilita aprendizaje, colaboración y remoción de impedimentos. No es el jefe de Developers. |
| UX / Diseño / DevOps (según el equipo) | Usabilidad, accesibilidad, plataforma, entrega | Pueden integrar Developers u ofrecer colaboración especializada según el contexto. No son responsabilidades adicionales obligatorias en Scrum. |

## 3. Caso realista: HU-LOGIN-001

**Historia de usuario**

> Como cliente registrado, quiero iniciar sesión con mi correo y contraseña, para consultar mi información personal de manera segura.

**Criterios de aceptación, pactados para este ejemplo**

- **CA-01 · Acceso exitoso.** Dado un usuario activo con credenciales correctas, cuando envía el formulario, entonces accede al área privada.
- **CA-02 · Credenciales inválidas.** Dadas credenciales incorrectas, cuando intenta autenticarse, entonces permanece fuera y ve un mensaje genérico sin revelar si el correo existe.
- **CA-03 · Validaciones.** Dados campos obligatorios vacíos o correo con sintaxis inválida, cuando intenta continuar, entonces el sistema muestra validaciones y no envía la solicitud de acceso.
- **CA-04 · Protección ante intentos.** Dado el umbral de intentos fallidos acordado con seguridad, cuando el usuario lo alcanza, entonces se aplica la protección configurada. **El número y tiempo exactos NO están definidos**: deben acordarse antes de implementar y probar.

Los criterios de aceptación son condiciones para la funcionalidad concreta. La **Definition of Done (DoD)** es el estándar compartido para considerar el incremento terminado (por ejemplo: revisión de código, pruebas ejecutadas, seguridad, accesibilidad, integración y documentación pertinente). **Cumplir CA no equivale automáticamente a cumplir DoD**, ni viceversa.

## 4. Cómo evoluciona HU-LOGIN-001 durante el Sprint

1. **Necesidad y descubrimiento.** Usuarios y negocio exponen el problema de acceso; el PO decide si aporta al objetivo del producto. Salida: necesidad comprendida y una idea de valor.
2. **Product Backlog y refinamiento.** El PO ordena el ítem. Developers —incluidos ingeniería y QA— cuestionan ambigüedades, dependencias, seguridad y tamaño. Salida: historia y criterios claros; posibles ejemplos Gherkin.
3. **Sprint Planning.** Todo Scrum Team acuerda por qué el Sprint será valioso. Developers seleccionan con el PO los ítems abordables, crean el plan del Sprint Backlog y definen el Sprint Goal. No es el Scrum Master quien asigna tareas individualmente.
4. **Construcción y testing continuos.** Ingeniería y QA trabajan juntos: arquitectura, UI, API, unit tests, pruebas de integración, manuales exploratorias y Playwright E2E; se corrigen defectos en cuanto aparecen. QA participa desde antes del desarrollo, no solo al cierre.
5. **Integración y Definition of Done.** El equipo demuestra un incremento utilizable e integrado que cumple DoD. Si el ítem no alcanza DoD, no se considera parte del incremento terminado.
6. **Sprint Review.** Scrum Team y stakeholders inspeccionan el resultado, conversan sobre el valor entregado y adaptan el Product Backlog. **No es simplemente una demo ni una aprobación formal para lanzar**.
7. **Sprint Retrospective.** Scrum Team analiza colaboración, herramientas, calidad y flujo; acuerda mejoras concretas para siguientes iteraciones.

### Ejemplo de colaboración real (día a día)

- PO: «¿Con este flujo el cliente realmente puede acceder sin fricción?»
- QA: «¿Qué ocurre si el correo no existe, la contraseña está mal o el servicio de autenticación no responde?»
- Ingeniería: «Podemos mostrar un mensaje genérico, usar controles de errores y automatizar los contratos críticos».
- Scrum Master: «Hay un bloqueo con el ambiente de autenticación; coordinemos para resolverlo sin perder el objetivo».
- Stakeholder: «El mensaje tiene que ser claro y accesible en móvil».

## 5. Los 5 eventos oficiales de Scrum

Scrum define cinco eventos: **Sprint, Sprint Planning, Daily Scrum, Sprint Review y Sprint Retrospective**. El Sprint contiene los otros eventos. El refinamiento del Product Backlog es una actividad continua y útil, **pero no es un sexto evento oficial**.

| Evento | Para qué sirve | Participación principal | Límite temporal Scrum |
|---|---|---|---|
| Sprint | Convertir trabajo en valor e inspeccionar progreso regularmente | Scrum Team | Máximo 1 mes |
| Sprint Planning | Acordar por qué, qué y cómo se abordará el Sprint | Scrum Team | Máximo 8 h para Sprint de 1 mes |
| Daily Scrum | Inspeccionar avance hacia Sprint Goal y adaptar plan | Developers | 15 min cada día de trabajo |
| Sprint Review | Revisar incremento y adaptar futuros pasos según feedback | Scrum Team y stakeholders | Máximo 4 h para Sprint de 1 mes |
| Sprint Retrospective | Planear mejoras de calidad y eficacia | Scrum Team | Máximo 3 h para Sprint de 1 mes |

Los límites para Planning/Review/Retro suelen ser menores con Sprints más cortos; un Sprint de dos semanas **no** tiene por obligación ceremonias de duración fija a la mitad. Un Daily no es un reporte de estado al Scrum Master: Developers coordinan cómo avanzar al Sprint Goal. La Sprint Review **no** es una autorización de despliegue; un incremento que cumple DoD puede entregarse cuando resulte útil.

## 6. Ejemplo ilustrativo de un Sprint de 2 semanas

- **Día 1:** Sprint Planning; objetivo: «El cliente puede autenticarse de forma segura». Revisar criterios, riesgos, dependencias y plan.
- **Días 2 a 4:** implementación y pruebas simultáneas; Daily Scrum diaria de 15 minutos; revisión de escenarios de QA y ambientes.
- **Días 5 a 7:** integración, pruebas API y UI, exploración, revisión de código, correcciones de defectos; refinamiento de nuevos ítems cuando conviene.
- **Días 8 a 9:** pruebas de regresión enfocada, accesibilidad, seguridad y verificación de DoD. El equipo puede entregar incrementos que ya estén terminados.
- **Día 10:** Sprint Review con stakeholders y Sprint Retrospective del equipo. El siguiente Sprint comienza inmediatamente después del anterior.

Este calendario es un **ejemplo didáctico**, no una prescripción de Scrum. Un equipo puede inspeccionar, adaptar, probar, liberar y refinar continuamente dentro del Sprint.

## 7. Actividad práctica (rol QA)

Lee HU-LOGIN-001 y responde:

1. ¿Qué criterios faltan para casos de usuario suspendido, recuperación de contraseña, caducidad de sesión y seguridad? ¿Son parte del alcance actual o nuevas historias?
2. Propón 5 escenarios de prueba: 1 positivo, 2 negativos, 1 de borde y 1 no funcional relevante.
3. Indica qué escenarios automatizarías con Playwright y cuáles requieren pruebas exploratorias, API o herramientas adicionales.
4. En la Sprint Planning, ¿qué riesgos comunicarías? ¿Cómo reaccionarías si el proveedor de identidad no funciona?
5. ¿Qué evidencia presentarías en la Review y qué mejora propondrías en la Retrospective?

**Respuesta orientativa:** pedir claridad antes de inventar reglas; un escenario por CA más negativos de sesiones/tokens y accesibilidad; Playwright para flujos críticos deterministas, API tests para errores/contratos; registrar impedimento de entorno y plan de mitigación; mostrar la funcionalidad y el nivel de confianza, no solo «tests verdes».

## 8. Autoevaluación y recordatorios

- ¿Quién prioriza y gestiona el Product Backlog? **Product Owner**.
- ¿QA es una cuarta accountability formal? **No**; en este ejemplo QA es una especialidad dentro de Developers.
- ¿Quién participa en el Daily Scrum? **Developers** (PO o SM solo cuando trabajan en el Sprint Backlog como Developers).
- ¿El refinamiento es un evento oficial? **No**, es una actividad continua.
- ¿Sprint Review sirve para recibir feedback y adaptar Product Backlog? **Sí**.

## 9. Lecturas oficiales

- [Scrum Guide 2020, edición oficial](https://scrumguides.org/scrum-guide.html)
- [Traducciones oficiales de Scrum Guide](https://scrumguides.org/download.html)
- [Scrum.org: eventos de Scrum](https://www.scrum.org/resources/introduction-scrum-events)
- [ISTQB Certified Tester Foundation Level](https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)

> Esta clase presenta Scrum conforme a la guía oficial de noviembre de 2020 e incorpora un caso didáctico aplicado a QA. Las responsabilidades técnicas y prácticas mostradas son ejemplos de implementación, no nuevas reglas impuestas por Scrum.


---

# Semana 01 — Mentalidad QA y ciclo de vida del software

Módulo: Fundamentos del Testing · Tiempo de lectura: 25 min

> La calidad se construye durante el desarrollo. Testing aporta evidencia sobre riesgos; no consiste únicamente en buscar errores al final.

## 1. QA, QC y testing: conceptos diferentes

Distingue el enfoque de procesos, la evaluación del producto y la actividad de probar. Estos conceptos se complementan para construir calidad y aportar evidencia.

### Aseguramiento de calidad (QA)

QA mejora la forma de trabajar para prevenir defectos, no se limita a revisar una pantalla terminada. Incluye acordar criterios, revisar riesgos y mejorar el proceso con lo aprendido.

**Ejemplo aplicado**

- Situación: Un equipo publica descuentos sin revisar las reglas y repite errores en cada campaña.
- Qué hace QA: Propone una revisión conjunta de ejemplos antes de desarrollar y añade criterios a la Definition of Done.
- Resultado: La regla de descuento y sus pruebas quedan acordadas antes de escribir el código.

Secuencia: Detectar problema recurrente → Mejorar el proceso → Prevenir nuevos defectos

### Control de calidad (QC)

QC evalúa si el producto cumple las características y criterios acordados. Examina evidencias del producto y ayuda a identificar discrepancias; el testing es una actividad que puede contribuir a ese control.

**Ejemplo aplicado**

- Situación: Un candidato de una tienda debe calcular bien precios y mostrar mensajes comprensibles.
- Qué hace QA: Compara el candidato con los criterios de aceptación y registra las diferencias encontradas.
- Resultado: El reporte identifica qué características cumplen y cuáles requieren corrección.

Secuencia: Recibir producto → Comparar con criterios → Registrar conformidad

### Testing

Testing diseña y realiza evaluaciones para obtener información del producto. Compara resultados obtenidos con los esperados y comunica hallazgos y riesgos, sin prometer ausencia total de defectos.

**Ejemplo aplicado**

- Situación: QA10 debe descontar 10% del subtotal, sin afectar el envío.
- Qué hace QA: Prueba 3 productos de 35000 COP con QA10 y envío de 10000 COP.
- Resultado: El total esperado es 104500 COP; una diferencia se investiga con la petición y respuesta.

Secuencia: Preparar caso y datos → Ejecutar la prueba → Comparar esperado y obtenido

### Error

Un error es una acción humana equivocada. Puede aparecer al interpretar, diseñar o implementar, pero no debe atribuirse a una persona sin investigar la causa.

**Ejemplo aplicado**

- Situación: La regla dice excluir el envío del descuento, pero se interpreta que aplica al total completo.
- Qué hace QA: Contrasta la interpretación con el criterio escrito y solicita ejemplos al negocio.
- Resultado: Se aclara la regla; si ya existe una implementación incorrecta, se rastrea el defecto.

Secuencia: Leer una regla → Interpretarla mal → Aclarar con evidencia

### Defecto

Un defecto es una imperfección en un artefacto, como código, requisito o diseño. Puede permanecer oculto hasta que una entrada o condición lo activa.

**Ejemplo aplicado**

- Situación: La fórmula usa (subtotal + envío) × 0.9 aunque el descuento solo aplica al subtotal.
- Qué hace QA: Documenta la condición incorrecta y un conjunto de datos que permite evidenciarla.
- Resultado: Se identifica una fórmula defectuosa que debe cambiar a subtotal × 0.9 + envío.

Secuencia: Regla de negocio → Fórmula incorrecta → Defecto identificado

### Fallo

Un fallo es una desviación observable durante la ejecución. Describe lo que hizo el sistema frente a lo esperado; el defecto que lo provoca todavía debe investigarse.

**Ejemplo aplicado**

- Situación: La UI muestra 103500 COP para una cotización cuyo esperado es 104500 COP.
- Qué hace QA: Conserva datos, versión, captura y respuesta de API para reproducir la diferencia.
- Resultado: El fallo queda demostrado sin asumir todavía cuál componente contiene el defecto.

Secuencia: Ejecutar datos concretos → Observar 103500 COP → Contrastar con 104500 COP

### Verificación

La verificación comprueba conformidad con requisitos o especificaciones. Puede realizarse mediante revisiones o comprobaciones de un producto ejecutable.

**Ejemplo aplicado**

- Situación: El requisito indica que la cantidad permitida es un entero entre 1 y 5.
- Qué hace QA: Revisa la regla e intenta cantidades 0, 1, 5 y 6.
- Resultado: La implementación debe aceptar 1 y 5 y rechazar 0 y 6 según lo especificado.

Secuencia: Consultar especificación → Comprobar implementación → Evaluar conformidad

### Validación

La validación comprueba si el producto satisface necesidades reales de uso. Cumplir una especificación no garantiza que la solución sea adecuada para su usuario.

**Ejemplo aplicado**

- Situación: El formulario cumple todos los campos definidos, pero los compradores no entienden el costo final.
- Qué hace QA: Observa una sesión de compra con usuarios representativos y recopila las dificultades.
- Resultado: Se propone mostrar subtotal, descuento y envío antes de confirmar; se comprueba si mejora la comprensión.

Secuencia: Observar necesidad → Probar con usuarios → Validar utilidad



## 2. Cómo se relacionan SDLC y STLC

El SDLC y el STLC se relacionan durante todo el desarrollo. Diferencia el propósito de cada uno y la participación de QA en cada momento.

### SDLC · Ciclo de vida del software

El SDLC organiza la evolución del software desde la necesidad hasta su operación y mantenimiento. QA participa a lo largo de ese recorrido, no únicamente al terminar el código.

**Ejemplo aplicado**

- Situación: Una tienda necesita permitir cupones de campaña.
- Qué hace QA: Revisa la necesidad, colabora en el diseño, prepara pruebas, evalúa el candidato y observa la operación.
- Resultado: Cada etapa aporta decisiones y evidencias para entregar la capacidad con riesgos conocidos.

Secuencia: Definir y diseñar → Construir y probar → Entregar y operar

### STLC · Actividades de pruebas

El STLC organiza actividades de prueba: planificación, análisis, diseño, implementación, ejecución, seguimiento y cierre. Estas actividades pueden solaparse y repetirse según el contexto.

**Ejemplo aplicado**

- Situación: Se debe evaluar una nueva regla de cupones antes de una campaña.
- Qué hace QA: Define alcance y riesgos, diseña datos y casos, prepara el entorno, ejecuta y comunica resultados.
- Resultado: Se entrega un reporte de cobertura, defectos y riesgos pendientes, relacionado con la regla.

Secuencia: Planificar y diseñar → Preparar y ejecutar → Evaluar y cerrar

### En equipos ágiles

En un ciclo iterativo se construyen y evalúan incrementos. Las actividades de desarrollo y pruebas se repiten dentro de las iteraciones, con retroalimentación frecuente.

**Ejemplo aplicado**

- Situación: En el primer Sprint se entrega el cupón básico y en el siguiente se añaden restricciones por producto.
- Qué hace QA: Ajusta ejemplos y pruebas del incremento nuevo y conserva regresión de lo ya entregado.
- Resultado: Cada incremento incorpora nuevas comprobaciones sin abandonar las reglas anteriores.

Secuencia: Construir incremento → Recibir retroalimentación → Ajustar siguiente iteración

### En refinamiento

QA ayuda a hacer comprobable una historia antes de desarrollarla. Busca ambigüedades, propone ejemplos y aclara datos, límites y resultados esperados con el equipo.

**Ejemplo aplicado**

- Situación: La historia dice: «el descuento aplica a compras grandes».
- Qué hace QA: Pregunta por el umbral y si el envío forma parte del importe elegible.
- Resultado: El equipo acuerda subtotal mínimo de 100000 COP y exclusión del envío.

Secuencia: Leer historia → Plantear ejemplos y dudas → Acordar criterios claros

### Durante el desarrollo

Durante el desarrollo, QA revisa ejemplos, contratos y riesgos junto con desarrollo. La retroalimentación temprana permite ajustar pruebas e implementación antes de integrar todo el flujo.

**Ejemplo aplicado**

- Situación: La API devuelve discount como texto y la UI espera un número.
- Qué hace QA: Contrasta el contrato y un ejemplo de respuesta con ambos equipos.
- Resultado: Se corrige la incompatibilidad y se añade una comprobación del tipo de dato.

Secuencia: Revisar contrato → Detectar discrepancia → Ajustar implementación

### Antes de liberar

Antes de liberar, QA comunica cobertura, resultados, bloqueos y riesgos residuales. La decisión de liberar corresponde a las personas responsables según los criterios acordados.

**Ejemplo aplicado**

- Situación: El candidato pasa catálogo y cotización, pero una prueba crítica de pago sigue bloqueada.
- Qué hace QA: Destaca la cobertura pendiente y las opciones de mitigación en el reporte de salida.
- Resultado: La decisión de go/no-go considera el riesgo de pagos y no solo el porcentaje global de aprobación.

Secuencia: Ejecutar cobertura priorizada → Comunicar riesgo residual → Apoyar decisión de salida



## 3. Los siete principios del testing

Estos siete principios orientan el diseño, la ejecución y la interpretación de las pruebas. Úsalos para decidir qué evidencia necesitas y qué límites tiene.

### 1. Presencia de defectos

Una prueba puede demostrar un defecto cuando encuentra una desviación. Si pasa, solo aporta evidencia sobre los casos, datos y versión comprobados.

**Ejemplo aplicado**

- Situación: Doscientos casos de login pasan, pero ninguno usa un nombre con caracteres acentuados.
- Qué hace QA: Añade el escenario no cubierto y conserva el alcance de la suite en el reporte.
- Resultado: La suite aprobada no se interpreta como prueba de que todos los logins posibles funcionan.

Secuencia: Ejecutar casos conocidos → Obtener evidencia limitada → Investigar casos no cubiertos

### 2. Pruebas exhaustivas inviables

Las combinaciones de entradas, estados y entornos suelen superar el tiempo disponible. Se seleccionan casos con técnicas de diseño y riesgos explícitos.

**Ejemplo aplicado**

- Situación: Un formulario tiene edad, país, cupón, moneda y varias formas de pago.
- Qué hace QA: Prioriza reglas críticas, particiones, límites y combinaciones relevantes.
- Resultado: Se obtiene cobertura razonada y se registra qué combinaciones quedan fuera.

Secuencia: Enumerar combinaciones → Seleccionar por técnica y riesgo → Documentar cobertura

### 3. Pruebas tempranas

Revisar y preparar pruebas pronto permite descubrir problemas antes de que se propaguen. El ahorro depende del contexto, pero corregir una regla antes de implementarla evita retrabajo.

**Ejemplo aplicado**

- Situación: Dos criterios de aceptación dan resultados distintos para el mismo cupón.
- Qué hace QA: Detecta la contradicción durante refinamiento, antes de desarrollar la fórmula.
- Resultado: El equipo acuerda una única regla y evita implementar versiones incompatibles.

Secuencia: Revisar temprano → Aclarar contradicción → Evitar retrabajo

### 4. Concentración de defectos

Los defectos pueden concentrarse en ciertos componentes o flujos. Los datos históricos y los cambios recientes ayudan a orientar la exploración, sin ignorar el resto del sistema.

**Ejemplo aplicado**

- Situación: Varios incidentes recientes provienen de cálculo de impuestos y redondeos.
- Qué hace QA: Refuerza casos de monedas, límites y cambios en ese componente.
- Resultado: La prioridad se adapta a evidencia histórica y se mantiene cobertura de otras áreas.

Secuencia: Revisar historial → Detectar concentración → Reforzar cobertura

### 5. Las pruebas pierden eficacia

Una suite estable puede seguir detectando regresiones, pero repetir siempre los mismos casos puede dejar de descubrir problemas nuevos. Conviene renovar datos, hipótesis y escenarios.

**Ejemplo aplicado**

- Situación: Las pruebas de cupón solo usan clientes nuevos y siempre el mismo importe.
- Qué hace QA: Agrega clientes existentes, restricciones y montos cercanos al umbral.
- Resultado: Se amplían las oportunidades de descubrir defectos sin eliminar la regresión útil.

Secuencia: Revisar suite actual → Variar datos e hipótesis → Buscar nuevos problemas

### 6. Dependencia del contexto

La estrategia depende del producto, sus usuarios, riesgos, regulación y forma de entrega. Las mismas prioridades no sirven automáticamente para todos los proyectos.

**Ejemplo aplicado**

- Situación: Una pantalla informativa y un servicio de transferencias tienen riesgos diferentes.
- Qué hace QA: Compara consecuencias de un fallo y ajusta alcance, rigor y evidencia de las pruebas.
- Resultado: Las transferencias reciben comprobaciones reforzadas de importes, permisos y recuperación.

Secuencia: Analizar contexto → Identificar riesgos relevantes → Adaptar estrategia

### 7. Ausencia de errores no garantiza utilidad

Un producto puede cumplir comprobaciones técnicas y aun así no resolver la necesidad. Evaluar utilidad y uso real complementa las pruebas de conformidad.

**Ejemplo aplicado**

- Situación: Una app de reservas no falla, pero obliga al usuario a llamar para confirmar cada reserva.
- Qué hace QA: Contrasta el flujo con la necesidad original de reservar sin intervención telefónica.
- Resultado: Se identifica una brecha de utilidad aunque los casos técnicos ejecutados pasen.

Secuencia: Cumplir comprobaciones → Contrastar necesidad → Detectar brecha de utilidad

- Ejemplo: 200 pruebas exitosas de login no garantizan que el producto sea útil.
- Pregunta de QA: ¿cuál es el riesgo más relevante y qué evidencia lo reduciría?

## Ejemplo trabajado: Caso guiado · saldo bancario incorrecto

Requisito: al transferir $50 de una cuenta con $200, el saldo debe quedar en $150. El programador resta 5 por error.

### 1. Error humano

El error humano es una decisión o acción equivocada que puede originar un defecto. En este caso se escribió una resta distinta de la transferencia solicitada.

**Ejemplo aplicado**

- Situación: La regla pide restar 50 a un saldo inicial de 200.
- Qué hace QA: Contrasta la regla con la operación escrita y describe la diferencia sin atribuir intenciones.
- Resultado: Se detecta que se escribió 5 donde debía utilizarse el importe 50.

Secuencia: Leer transferencia de 50 → Escribir resta de 5 → Detectar equivocación

### 2. Defecto

El defecto está en la fórmula almacenada en el código: usa un valor fijo incorrecto. Puede existir antes de ejecutar la transferencia.

**Ejemplo aplicado**

- Situación: El código contiene saldoInicial - 5.
- Qué hace QA: Identifica la operación defectuosa y propone comprobar el uso del importe real de transferencia.
- Resultado: El defecto queda localizado; la fórmula correcta del ejemplo es saldoInicial - transferencia.

Secuencia: Inspeccionar fórmula → Encontrar constante incorrecta → Relacionar con requisito

### 3. Fallo observable

El fallo aparece cuando se ejecuta el caso y el sistema muestra un saldo distinto del esperado. Esa observación permite documentar una discrepancia reproducible.

**Ejemplo aplicado**

- Situación: La cuenta empieza con 200 y se ejecuta una transferencia de 50.
- Qué hace QA: Compara el saldo obtenido de 195 con el esperado de 150.
- Resultado: La diferencia de 45 demuestra el fallo de este ejemplo de entrenamiento.

Secuencia: Ejecutar transferencia → Observar saldo 195 → Comparar con saldo 150

### 4. Evidencia

La evidencia conserva información suficiente para comprender y repetir una prueba. Debe relacionar datos, acciones, esperado, obtenido y versión, sin incluir información sensible de cuentas reales.

**Ejemplo aplicado**

- Situación: Se prepara un reporte del saldo incorrecto en un entorno con datos ficticios.
- Qué hace QA: Registra saldo 200, transferencia 50, esperado 150, obtenido 195, pasos, fecha y versión.
- Resultado: El equipo puede reproducir el caso y comprobar la corrección con los mismos datos.

Secuencia: Registrar entrada y pasos → Adjuntar esperado y obtenido → Facilitar reproducción

```javascript
// Ejemplo de defecto de lógica
const saldoInicial = 200;
const transferencia = 50;
const saldoIncorrecto = saldoInicial - 5;
const saldoEsperado = saldoInicial - transferencia;
console.log({ saldoIncorrecto, saldoEsperado });
```

## Ejercicio de aplicación

Dibuja un sprint de 2 semanas y marca al menos cinco momentos en los que QA puede intervenir antes de ejecutar la primera prueba.

### Respuesta orientativa

Una solución posible: refinamiento de la HU, revisión de criterios, ejemplos de negocio, diseño de datos, revisión de API, ejecución, evaluación de resultados y retrospectiva.

### Error frecuente

Confundir calidad con cantidad de bugs encontrados. La meta es aportar confianza y detectar riesgos oportunamente.

## Autoevaluación

**¿Qué demuestra una suite que pasa al 100 %?**

A. Que no quedan defectos
B. Que se cumplieron las comprobaciones ejecutadas, con su alcance y limitaciones
C. Que no hace falta hablar con el usuario

**Respuesta:** B. Las pruebas cubren una parte del espacio de comportamientos y aportan evidencia, no garantía absoluta.

## Lecturas adicionales

- [ISTQB CTFL – material y temario](https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)

---


# Semana 02 — Niveles, tipos y gestión de riesgos

Módulo: Fundamentos del Testing · Tiempo de lectura: 25 min

> Selecciona niveles, tipos y objetivos de prueba según el riesgo. Priorizar es más útil que ejecutar un número arbitrario de casos.

## 1. Niveles de prueba

Cada nivel tiene un alcance distinto y puede utilizar diferentes herramientas. Identifica qué parte del producto se evalúa antes de seleccionar los casos.

### Componente o unidad

La prueba de componente o unidad se centra en una parte acotada del software. Aísla dependencias cuando conviene y permite localizar rápidamente errores de lógica.

**Ejemplo aplicado**

- Situación: Una función calcula el descuento del subtotal.
- Qué hace QA: Ejecuta entradas de 99999 y 100000 COP con QA10, sin abrir el navegador.
- Resultado: El descuento esperado cambia de 0 a 10000 COP al alcanzar el umbral.

Secuencia: Preparar entrada → Ejecutar función aislada → Verificar salida

### Integración

La integración comprueba interacciones, contratos e intercambio de datos. Un componente puede funcionar solo y fallar al colaborar con otro.

**Ejemplo aplicado**

- Situación: El cotizador consulta el precio vigente al servicio de catálogo.
- Qué hace QA: Comprueba identificadores, tipos de datos y tratamiento de una respuesta de producto inexistente.
- Resultado: La colaboración respeta el contrato y no cotiza con un precio ausente o incorrecto.

Secuencia: Conectar componentes → Intercambiar datos → Validar contrato

### Sistema

Las pruebas de sistema evalúan el comportamiento del producto integrado frente a requisitos. Consideran funciones y características relevantes del sistema completo.

**Ejemplo aplicado**

- Situación: Un comprador selecciona producto, cantidad, cupón y envío en la tienda.
- Qué hace QA: Recorre el flujo y contrasta el total mostrado con las reglas y respuestas del sistema.
- Resultado: La cotización integrada presenta datos consistentes y los errores esperados cuando corresponde.

Secuencia: Preparar sistema integrado → Ejecutar flujo → Evaluar comportamiento global

### Aceptación

La aceptación evalúa si el producto está listo para cubrir necesidades y criterios del negocio o usuarios. Su propósito y participantes se acuerdan según el contexto.

**Ejemplo aplicado**

- Situación: El negocio define que una devolución parcial debe conservar el historial de la compra.
- Qué hace QA: Colabora con el representante de negocio para ejecutar un ejemplo acordado.
- Resultado: Se determina si la funcionalidad satisface el criterio de aceptación de devolución.

Secuencia: Acordar necesidad → Ejecutar ejemplo de negocio → Evaluar aceptación



## 2. Tipos y objetivos de pruebas

Distingue el propósito, la selección de la suite y el alcance del flujo: son perspectivas complementarias para diseñar las pruebas.

### Pruebas funcionales

Una prueba funcional comprueba qué hace el sistema frente a una regla o comportamiento especificado. Sus resultados esperados deben ser observables y concretos.

**Ejemplo aplicado**

- Situación: QA10 debe descontar 10% cuando el subtotal llega a 100000 COP.
- Qué hace QA: Cotiza 3 cursos básicos de 35000 COP con envío de 10000 COP.
- Resultado: Se espera subtotal 105000, descuento 10500 y total 104500 COP.

Secuencia: Identificar regla → Ejecutar escenario → Comprobar función

### Pruebas no funcionales

Las pruebas no funcionales evalúan cómo se comporta el sistema: rendimiento, seguridad, accesibilidad o usabilidad, entre otras características. Cada objetivo necesita criterios medibles adecuados.

**Ejemplo aplicado**

- Situación: El equipo acuerda un tiempo de respuesta y una carga representativa para cotizar.
- Qué hace QA: Ejecuta una prueba de carga y mide el percentil 95 con el entorno y volumen documentados.
- Resultado: Se compara la medición con el umbral acordado; el resultado no se generaliza a cualquier carga.

Secuencia: Definir característica y umbral → Medir bajo condiciones → Comparar con objetivo

### Smoke

Smoke selecciona comprobaciones breves para decidir si un candidato tiene estabilidad básica suficiente para continuar evaluándolo. No sustituye una regresión completa.

**Ejemplo aplicado**

- Situación: Se despliega un build antes de iniciar la jornada de pruebas.
- Qué hace QA: Comprueba salud, catálogo y una cotización mínima.
- Resultado: Si un flujo básico falla, se informa el bloqueo antes de invertir tiempo en pruebas más extensas.

Secuencia: Recibir build → Comprobar flujos básicos → Continuar o bloquear

### Regresión

La regresión busca efectos adversos de cambios sobre comportamientos que ya funcionaban. Se selecciona según impacto, dependencias y riesgos; no es solo repetir el bug corregido.

**Ejemplo aplicado**

- Situación: Se cambia la fórmula de QA10 para excluir el envío.
- Qué hace QA: Además de confirmar la corrección, prueba cotización sin cupón, recogida y otros importes relevantes.
- Resultado: Se comprueba que los cambios no dañaron esos comportamientos relacionados.

Secuencia: Introducir cambio → Reprobar funciones relacionadas → Investigar efectos adversos

### Prueba exploratoria

La exploración combina aprendizaje, diseño y ejecución a medida que aparece información. Una misión, un tiempo y notas de evidencia ayudan a mantener foco y explicar resultados.

**Ejemplo aplicado**

- Situación: La misión de 20 minutos es investigar cambios rápidos de cantidad y cupón.
- Qué hace QA: Observa respuestas y estados de la UI, cambia hipótesis y registra los pasos relevantes.
- Resultado: Se documentan hallazgos y preguntas, junto con lo explorado y lo pendiente.

Secuencia: Definir misión → Explorar y aprender → Registrar hallazgos

### E2E · Extremo a extremo

E2E describe un flujo de extremo a extremo a través de sus partes relevantes. Sirve para comprobar colaboración y experiencia completa, pero no reemplaza pruebas más acotadas.

**Ejemplo aplicado**

- Situación: Se debe comprobar una compra desde catálogo hasta confirmación en un entorno de prueba.
- Qué hace QA: Usa datos ficticios y un proveedor de pago simulado para completar el recorrido.
- Resultado: Se comprueba la consistencia del pedido y la confirmación a lo largo del flujo completo.

Secuencia: Iniciar recorrido → Atravesar integraciones → Comprobar resultado final

### Sanity

Sanity es un término informal cuyo alcance debe acordarse con el equipo. En algunos equipos se usa para una revisión focalizada de un cambio, pero esa definición no es universal.

**Ejemplo aplicado**

- Situación: El equipo llama sanity a comprobar rápidamente la nueva restricción de un cupón.
- Qué hace QA: Aclara por escrito qué casos incluye, qué excluye y qué decisión permite tomar.
- Resultado: La selección queda entendida por todos y no se confunde con una regresión completa.

Secuencia: Acordar significado → Ejecutar selección focalizada → Comunicar alcance

### Automatización

Automatizar consiste en usar herramientas para ejecutar o apoyar actividades repetibles. El propósito de la prueba, y no la herramienta, determina si es funcional o no funcional.

**Ejemplo aplicado**

- Situación: El cálculo de cotización debe comprobarse en cada cambio.
- Qué hace QA: Implementa aserciones de totales y de errores en una suite de API con datos controlados.
- Resultado: El pipeline ofrece evidencia repetible; los fallos necesitan investigación y la suite requiere mantenimiento.

Secuencia: Diseñar comprobación → Ejecutar con herramienta → Interpretar evidencia



## 3. Priorización basada en riesgos

Prioriza según el riesgo para reducir la incertidumbre más importante. La valoración debe discutirse con el equipo y revisarse cuando cambia el producto.

### Riesgo

Un riesgo es un evento incierto que podría afectar objetivos. Identificar su causa, probabilidad y consecuencia permite decidir cómo tratarlo.

**Ejemplo aplicado**

- Situación: Un reintento de pago podría generar un cobro duplicado.
- Qué hace QA: Documenta el evento, sus condiciones y el impacto económico para el comprador.
- Resultado: El equipo puede priorizar pruebas y controles sobre reintentos e idempotencia.

Secuencia: Identificar evento incierto → Evaluar consecuencia → Decidir tratamiento

### Valoración de probabilidad e impacto

Una matriz cualitativa puede combinar probabilidad e impacto usando escalas acordadas, por ejemplo de 1 a 5. Multiplicar puntuaciones ayuda a ordenar riesgos, pero no representa una probabilidad exacta ni una pérdida monetaria.

**Ejemplo aplicado**

- Situación: El equipo puntúa cobro duplicado con probabilidad 4 e impacto 5.
- Qué hace QA: Calcula 4 × 5 = 20 y explica qué significa cada puntuación según la escala del equipo.
- Resultado: La exposición orientativa de 20 se compara con otros riesgos usando la misma escala.

Secuencia: Acordar escala → Valorar P e I → Calcular exposición orientativa

### Dimensiones del impacto

El impacto describe consecuencias si el evento ocurre: económicas, operativas, legales o de seguridad. La frecuencia de uso puede ayudar a analizar exposición, pero no reemplaza la definición de probabilidad.

**Ejemplo aplicado**

- Situación: Un error de redondeo afecta pagos frecuentes y uno visual afecta una pantalla poco usada.
- Qué hace QA: Compara pérdida potencial, alcance y consecuencias para usuarios y operación.
- Resultado: La discusión prioriza consecuencias importantes en lugar de contar únicamente pantallas afectadas.

Secuencia: Identificar consecuencias → Analizar alcance → Justificar impacto

### 1. Identificar

Identificar riesgos consiste en proponer eventos plausibles apoyándose en requisitos, arquitectura, cambios, incidentes y conversaciones con el equipo. No es afirmar que esos fallos ya existen.

**Ejemplo aplicado**

- Situación: La tienda incorpora un proveedor nuevo de pagos.
- Qué hace QA: Plantea riesgos de timeout, respuesta duplicada y rechazo, con sus posibles consecuencias.
- Resultado: Se obtiene una lista de hipótesis de riesgo que orienta las pruebas del cambio.

Secuencia: Revisar cambio → Plantear fallos plausibles → Registrar riesgos

### 2. Estimar

La estimación de riesgo debe reunir perspectivas y explicitar supuestos. Conviene revisar desacuerdos y usar datos disponibles en lugar de imponer una puntuación arbitraria.

**Ejemplo aplicado**

- Situación: QA propone probabilidad 4 por antecedentes; desarrollo propone 2 por un control nuevo.
- Qué hace QA: Revisa incidentes, evidencia del control y condiciones que podrían evitarlo.
- Resultado: El equipo acuerda una valoración justificada y anota la incertidumbre restante.

Secuencia: Reunir evidencia → Discutir supuestos → Acordar valoración

### 3. Reducir incertidumbre

Los controles buscan reducir probabilidad o impacto, y las pruebas aportan evidencia de su funcionamiento. Después debe evaluarse el riesgo residual.

**Ejemplo aplicado**

- Situación: Los pagos admiten reintentos de una misma solicitud.
- Qué hace QA: Propone una clave de idempotencia y prueba que repetir la solicitud no duplique el pedido.
- Resultado: La evidencia indica si ese control reduce el riesgo bajo las condiciones comprobadas.

Secuencia: Priorizar riesgo → Definir control y pruebas → Evaluar mitigación

### 4. Reevaluar

Un riesgo cambia cuando cambian el producto, el uso o sus controles. La valoración y la selección de pruebas deben actualizarse con evidencia nueva.

**Ejemplo aplicado**

- Situación: Una actualización reemplaza el proveedor de pagos de una tienda.
- Qué hace QA: Revisa contratos, errores y recuperación; ajusta probabilidad, impacto y cobertura relevante.
- Resultado: La matriz refleja el nuevo contexto y evita confiar ciegamente en una valoración anterior.

Secuencia: Detectar cambio → Revisar valoración y pruebas → Actualizar riesgo residual



## Ejemplo trabajado: Caso guiado · priorizar cinco funcionalidades

Una tienda tendrá un lanzamiento mañana. Con poco tiempo, el equipo pondera las áreas.

### 1. Pago · Prioridad alta

La prioridad alta del ejemplo se basa en una exposición orientativa de 20 dentro de una escala compartida. No significa certeza de que el pago vaya a fallar.

**Ejemplo aplicado**

- Situación: Para pagos se acuerdan impacto 5 y probabilidad 4.
- Qué hace QA: Calcula 5 × 4 y selecciona casos de importe incorrecto, duplicado y rechazo.
- Resultado: Pago se prueba primero en esta planificación por su mayor exposición relativa.

Secuencia: Valorar pago: I5 y P4 → Calcular exposición 20 → Priorizar casos críticos

### 2. Registro · Prioridad media

Registro obtiene exposición 9 bajo la misma escala. Su posición se compara con los demás riesgos y puede cambiar por el contexto del negocio.

**Ejemplo aplicado**

- Situación: El registro tiene impacto 3 y probabilidad 3.
- Qué hace QA: Calcula 3 × 3 y define pruebas de datos inválidos y creación correcta.
- Resultado: Se agenda después de pago en este ejemplo; un bloqueo comercial podría cambiar el orden.

Secuencia: Valorar registro: I3 y P3 → Calcular exposición 9 → Asignar orden relativo

### 3. Cambio de tema · Prioridad baja

Una prioridad baja refleja menor exposición relativa en este ejemplo, no ausencia de importancia ni permiso para ignorar requisitos.

**Ejemplo aplicado**

- Situación: Cambiar el tema visual tiene impacto 1 y probabilidad 2.
- Qué hace QA: Calcula 1 × 2 y registra la cobertura que podría diferirse.
- Resultado: El tema se pospone si falta tiempo, informando la limitación de la evaluación.

Secuencia: Valorar tema: I1 y P2 → Calcular exposición 2 → Documentar cobertura diferida

### 4. Decidir y comunicar

Priorizar convierte la valoración de riesgos en un orden de trabajo, considerando dependencias, tiempo y cobertura pendiente. La decisión debe comunicarse con sus supuestos.

**Ejemplo aplicado**

- Situación: Queda una jornada antes del lanzamiento y no cabe toda la suite.
- Qué hace QA: Ejecuta pago primero, luego registro y registra el tema visual pendiente.
- Resultado: El reporte explica qué se comprobó, qué falta y qué riesgo queda por aceptar.

Secuencia: Comparar exposiciones → Ordenar pruebas factibles → Comunicar riesgo pendiente

## Ejercicio de aplicación

Construye una matriz para login, carrito, pago, búsqueda y perfil; asigna impacto, probabilidad, justificación y pruebas recomendadas.

### Respuesta orientativa

No hay una matriz universal. Lo importante es argumentar el impacto y priorizar, por ejemplo, pagos duplicados antes que una diferencia cosmética.

### Error frecuente

Tratar “smoke”, “regresión” y “sistema” como categorías equivalentes: responden a preguntas diferentes.

## Autoevaluación

**¿Qué escenario suele merecer ejecución prioritaria?**

A. Cambio de color con poco impacto
B. Cobro duplicado en transacción frecuente
C. Ordenamiento visual de iconos

**Respuesta:** B. Tiene alto impacto económico y es importante reducir ese riesgo antes de liberar.

## Lecturas adicionales

- [ISTQB CTFL – niveles, tipos y riesgos](https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)

---


# Semana 03 — Historias de usuario y criterios de aceptación

Módulo: QA Manual profesional · Tiempo de lectura: 30 min

> Transforma requisitos de negocio en reglas concretas que puedas observar, medir y probar.

## 1. Estructura de una historia de usuario

Una historia comunica una necesidad desde la perspectiva de quien obtiene valor: “Como [rol], quiero [capacidad] para [beneficio]”. Es un elemento de conversación, no una especificación completa. Debe acompañarse de ejemplos y criterios de aceptación suficientes para evitar interpretaciones contradictorias.

### Rol y necesidad de usuario

Una historia describe quién necesita una capacidad y para qué. Identificar al actor evita diseñar únicamente desde la perspectiva técnica.

**Ejemplo aplicado**

- Situación: Una tienda recibe consultas de compradores que no pueden consultar pedidos anteriores.
- Qué hace QA: Redacta «Como cliente registrado quiero consultar mis pedidos para conocer su estado» y confirma la necesidad con negocio.
- Resultado: El actor, la capacidad y el beneficio quedan explícitos sin imponer una solución de implementación.

Secuencia: Identificar actor → Describir capacidad → Confirmar beneficio

### Historia y conversación

La frase de una historia no contiene por sí sola todas las reglas. Se completa con ejemplos, decisiones y preguntas abiertas antes de construir.

**Ejemplo aplicado**

- Situación: Consultar pedidos podría incluir compras canceladas o solo compras activas.
- Qué hace QA: Pregunta qué estados se muestran y aporta ejemplos de ambas alternativas durante refinamiento.
- Resultado: La historia incorpora reglas y exclusiones acordadas, en lugar de interpretaciones distintas por persona.

Secuencia: Leer historia → Discutir ejemplos → Acordar reglas

- Rol: quién necesita el comportamiento.
- Capacidad: qué quiere lograr sin describir la implementación.
- Beneficio: por qué aporta valor.
- Preguntas abiertas: decisiones que aún debe aclarar negocio.

## 2. Criterios de aceptación comprobables

Describe condiciones observables, idealmente con entrada, regla y resultado. Given/When/Then ayuda a redactar escenarios: Dado que existe una cuenta activa, cuando ingreso credenciales válidas, entonces accedo al panel. Evita criterios vagos como “funciona rápido” o “interfaz bonita”.

### Escenarios Given, When, Then

Given establece contexto, When la acción y Then un resultado observable. Un escenario comprobable evita adjetivos vagos sin criterios de evaluación.

**Ejemplo aplicado**

- Situación: Una cuenta activa debe acceder a su panel con credenciales correctas.
- Qué hace QA: Escribe Given cuenta activa, When envío credenciales válidas, Then se muestra el panel de pedidos.
- Resultado: El comportamiento esperado puede compararse con lo obtenido al ejecutar.

Secuencia: Definir contexto → Ejecutar acción → Comparar resultado

### Alternativas y alcance

Los criterios deben contemplar restricciones y respuestas alternativas relevantes. También conviene acordar qué comportamientos quedan fuera de la historia.

**Ejemplo aplicado**

- Situación: Un usuario envía una contraseña errónea o deja vacío el correo.
- Qué hace QA: Define rechazo genérico de credenciales y validación de campos requeridos, sin revelar si existe una cuenta.
- Resultado: Los casos negativos tienen expectativas claras y no se confunden con fallos inesperados.

Secuencia: Identificar alternativa → Definir respuesta → Precisar alcance

- Incluye escenarios felices y alternativos.
- Establece mensajes, límites, restricciones y estados.
- Aclara comportamientos de seguridad sin exponer información sensible.
- Define qué queda fuera del alcance de la HU.

## 3. Revisión temprana y refinamiento

QA examina las historias antes del desarrollo: ambigüedad, omisiones, inconsistencias, casos negativos y dependencias. Una pregunta a tiempo evita que cada miembro implemente una regla diferente.

### Preguntas tempranas de QA

La revisión temprana busca omisiones, contradicciones y dependencias antes de implementar. Una pregunta concreta puede ahorrar versiones incompatibles del mismo flujo.

**Ejemplo aplicado**

- Situación: La historia de login no define bloqueo ni expiración de sesión.
- Qué hace QA: Pregunta qué política aplica a intentos fallidos y cuánto dura la sesión; registra la respuesta de negocio y seguridad.
- Resultado: Las decisiones quedan documentadas antes de diseñar los escenarios correspondientes.

Secuencia: Detectar omisión → Consultar responsables → Registrar decisión

### Dependencias y errores externos

Los criterios deben explicar el comportamiento ante dependencias no disponibles. Un fallo de red no debería interpretarse como una contraseña incorrecta.

**Ejemplo aplicado**

- Situación: El servicio de autenticación deja de responder durante el envío del formulario.
- Qué hace QA: Solicita un criterio para timeout y recuperación, y diseña el escenario sin asumir el mensaje de error.
- Resultado: La UI tiene un comportamiento acordado para el problema técnico, separado del rechazo de credenciales.

Secuencia: Identificar dependencia → Simular indisponibilidad → Comprobar respuesta acordada

- ¿Se bloquea la cuenta tras intentos fallidos?
- ¿El correo distingue mayúsculas y minúsculas?
- ¿La sesión expira? ¿En cuánto tiempo?
- ¿Cómo se comporta el sistema cuando la API no responde?

## Ejemplo trabajado: Ejemplo trabajado · acceso a una plataforma

HU: Como cliente registrado quiero iniciar sesión para revisar mis pedidos.

### Paso 1 · Acceso válido

CA-01: Dado usuario activo y credenciales correctas, al enviar el formulario se muestra el panel. El criterio debe describir una precondición verificable y una salida observable.

**Ejemplo aplicado**

- Situación: HU: Como cliente registrado quiero iniciar sesión para revisar mis pedidos.
- Qué hace QA: Usa una cuenta activa y comprueba que el panel corresponde al usuario autenticado.
- Resultado: El panel se muestra para el usuario correcto, con evidencia del acceso autorizado.

Secuencia: Preparar cuenta activa → Enviar credenciales válidas → Comprobar el panel

### Paso 2 · Credencial incorrecta

CA-02: Con contraseña incorrecta se rechaza el acceso sin revelar cuál dato fue incorrecto. El rechazo debe respetar el criterio de seguridad acordado sin facilitar la enumeración de cuentas.

**Ejemplo aplicado**

- Situación: HU: Como cliente registrado quiero iniciar sesión para revisar mis pedidos.
- Qué hace QA: Prueba una clave inválida y revisa que no exista sesión y que el mensaje no identifique qué dato falló.
- Resultado: El acceso se rechaza con un mensaje genérico y no se crea una sesión válida.

Secuencia: Cambiar la contraseña → Intentar el acceso → Revisar rechazo y sesión

### Paso 3 · Campo obligatorio

CA-03: Si falta un campo requerido, se presenta una validación comprensible. Una validación comprensible indica cómo corregir el dato sin perder el contexto del formulario.

**Ejemplo aplicado**

- Situación: HU: Como cliente registrado quiero iniciar sesión para revisar mis pedidos.
- Qué hace QA: Deja vacío un campo requerido y comprueba su mensaje y la ausencia de acceso.
- Resultado: El formulario informa el campo pendiente y conserva un estado que permite corregirlo.

Secuencia: Omitir un campo → Enviar el formulario → Revisar la validación

### Paso 4 · Expiración de sesión

CA-04: La sesión respeta las políticas de expiración definidas. La política debe definir duración y comportamiento; no basta con observar que la cookie existe.

**Ejemplo aplicado**

- Situación: HU: Como cliente registrado quiero iniciar sesión para revisar mis pedidos.
- Qué hace QA: Usa la política temporal del ambiente de prueba y comprueba el acceso antes y después de expirar.
- Resultado: Una sesión expirada no permite consultar recursos privados sin volver a autenticarse.

Secuencia: Establecer la política → Alcanzar la expiración → Revisar el acceso privado

## Ejercicio de aplicación

Redacta una HU para recuperar contraseña, ocho criterios verificables y cinco preguntas que llevarías al PO.

### Respuesta orientativa

Pregunta por expiración del enlace, unicidad, reuso, confirmación, enumeración de usuarios, número de intentos y envío cuando el correo no existe.

### Error frecuente

Escribir criterios de aceptación que describen acciones técnicas de la implementación en lugar de resultados de negocio.

## Autoevaluación

**¿Cuál es un criterio verificable?**

A. La app debe ser intuitiva
B. Al enviar un correo no válido se muestra “Formato de correo inválido”
C. La app debe funcionar bien

**Respuesta:** B. Tiene una condición de entrada y un resultado observable.

## Lecturas adicionales

- [ISTQB – análisis y diseño de pruebas](https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)

---


# Semana 04 — Técnicas de diseño de pruebas

Módulo: QA Manual profesional · Tiempo de lectura: 35 min

> Usa técnicas sistemáticas para maximizar la cobertura relevante y reducir pruebas redundantes.

## 1. Partición de equivalencia

Divide entradas en grupos cuyo comportamiento esperado es comparable. De cada partición representativa seleccionas valores adecuados. Para una edad válida entre 18 y 65 años, existen al menos tres particiones: menores de 18, entre 18 y 65, mayores de 65.

### Particiones válidas e inválidas

La partición de equivalencia agrupa entradas cuyo comportamiento esperado es similar. Elegir representantes reduce casos sin afirmar que se probaron todos los valores.

**Ejemplo aplicado**

- Situación: Una inscripción permite edades enteras entre 18 y 65, inclusive.
- Qué hace QA: Separa menores de 18, de 18 a 65 y mayores de 65; selecciona 17, 32 y 66 como representantes.
- Resultado: Se cubren las tres particiones respecto al rango con datos trazables a la regla.

Secuencia: Modelar grupos → Seleccionar representantes → Verificar cada partición

### Formato y ausencia de datos

El rango no cubre necesariamente errores de formato o campos vacíos. Estas condiciones se añaden cuando son relevantes para el contrato de entrada.

**Ejemplo aplicado**

- Situación: El campo edad puede recibir texto, un valor vacío o un número decimal.
- Qué hace QA: Consulta qué tipos admite y agrega casos para entradas no numéricas o ausentes según lo acordado.
- Resultado: La cobertura distingue restricciones de tipo, presencia y rango en lugar de mezclarlas.

Secuencia: Revisar contrato → Probar formatos → Registrar restricciones

- Partición inválida inferior: 0, 17.
- Partición válida: 18, 32, 65.
- Partición inválida superior: 66, 100.
- Añade entradas vacías y no numéricas si el contrato lo requiere.

## 2. Análisis de valores límite

Muchos defectos aparecen en los bordes: usar < en vez de <= o viceversa. Con límites inclusivos de 18 y 65, prueba 17, 18, 19 y 64, 65, 66. El método exacto (dos o tres valores por límite) depende de la estrategia.

### Fronteras inclusivas

Los defectos de comparación suelen aparecer al aceptar o excluir los extremos. El esperado debe proceder de la regla, no de la salida actual del sistema.

**Ejemplo aplicado**

- Situación: La edad máxima permitida es 65 y debe aceptarse.
- Qué hace QA: Prueba 64, 65 y 66; espera aceptación para 64 y 65 y rechazo para 66.
- Resultado: Un uso incorrecto de menor que 65 puede descubrirse con el caso exacto del límite.

Secuencia: Identificar frontera → Probar vecinos → Comparar aceptación

### Dos y tres valores por límite

La estrategia define qué vecinos examinar. Para enteros de 18 a 65, dos valores cubren 17,18,65,66; tres añaden 19 y 64.

**Ejemplo aplicado**

- Situación: Se necesita justificar la cobertura de límites de una validación de edad.
- Qué hace QA: Documenta la técnica seleccionada y la lista de entradas con su esperado antes de ejecutar.
- Resultado: La revisión puede comprobar la cobertura del modelo, sin limitarse a contar casos.

Secuencia: Elegir técnica → Enumerar límites → Justificar cobertura

- 17 debe rechazarse; 18 y 19 aceptarse.
- 64 y 65 deben aceptarse; 66 rechazarse.
- Los valores esperados son parte del oráculo: deben respaldarse con reglas de negocio.

## 3. Tablas de decisión y transiciones

Una tabla de decisión conecta combinaciones de condiciones y acciones. Es útil en descuentos, autorizaciones y promociones. Una transición de estados valida cambios permitidos o prohibidos: nuevo → activo → bloqueado → rehabilitado.

### Tabla de decisión

Una tabla relaciona combinaciones factibles de condiciones con acciones. Cada regla permite comprobar cómo se combinan los criterios del negocio.

**Ejemplo aplicado**

- Situación: El acceso requiere cuenta activa y contraseña válida.
- Qué hace QA: Enumera las cuatro combinaciones de dos condiciones booleanas; solo activa y válida permite entrar.
- Resultado: Cada combinación tiene una acción esperada y puede vincularse a un caso.

Secuencia: Combinar condiciones → Asignar acciones → Cubrir reglas

### Transiciones de estado

El resultado puede depender de la historia previa, no solo de los datos actuales. Un modelo de estados ayuda a probar cambios permitidos y prohibidos.

**Ejemplo aplicado**

- Situación: Una cuenta bloqueada conserva credenciales válidas.
- Qué hace QA: Intenta iniciar sesión y verifica que ese intento no reactive la cuenta sin el proceso de desbloqueo definido.
- Resultado: El estado bloqueado se mantiene hasta una transición autorizada.

Secuencia: Identificar estado inicial → Intentar transición → Verificar estado final

- Tabla: usuario activo y contraseña correcta → acceso permitido.
- Tabla: usuario bloqueado, aunque la clave sea correcta → acceso denegado.
- Estado: bloqueado → acceso no debe reactivar la cuenta.

## Ejemplo trabajado: Tabla de decisión · inicio de sesión

El acceso depende del estado de la cuenta y de la validez de la contraseña.

### Paso 1 · Cuenta activa y clave válida

Regla 1: Activo=SÍ y Clave válida=SÍ → permitir. Esta combinación representa la única regla que permite entrar en la tabla definida.

**Ejemplo aplicado**

- Situación: El acceso depende del estado de la cuenta y de la validez de la contraseña.
- Qué hace QA: Prepara una cuenta activa, ingresa su clave correcta y comprueba el panel.
- Resultado: El acceso se permite exclusivamente cuando se cumplen ambas condiciones.

Secuencia: Activar la cuenta → Usar la clave válida → Comprobar el acceso

### Paso 2 · Cuenta activa y clave inválida

Regla 2: Activo=SÍ y Clave válida=NO → rechazar. Cambiar una condición respecto al caso positivo permite aislar el efecto de la credencial.

**Ejemplo aplicado**

- Situación: El acceso depende del estado de la cuenta y de la validez de la contraseña.
- Qué hace QA: Mantén la cuenta activa, usa una clave incorrecta y revisa el rechazo.
- Resultado: La validez de la cuenta no permite omitir la comprobación de contraseña.

Secuencia: Mantener cuenta activa → Cambiar la clave → Comprobar el rechazo

### Paso 3 · Cuenta inactiva y clave válida

Regla 3: Activo=NO y Clave válida=SÍ → rechazar. Una clave correcta no debe eludir la restricción de estado de la cuenta.

**Ejemplo aplicado**

- Situación: El acceso depende del estado de la cuenta y de la validez de la contraseña.
- Qué hace QA: Desactiva la cuenta de prueba por un mecanismo autorizado y conserva su clave correcta.
- Resultado: El acceso permanece rechazado por la regla de estado aunque la contraseña coincida.

Secuencia: Desactivar la cuenta → Enviar su clave válida → Comprobar la restricción

### Paso 4 · Ambas condiciones inválidas

Regla 4: Activo=NO y Clave válida=NO → rechazar. La tabla debe cubrir también la combinación en que ninguna condición habilita la operación.

**Ejemplo aplicado**

- Situación: El acceso depende del estado de la cuenta y de la validez de la contraseña.
- Qué hace QA: Usa una cuenta inactiva y una clave errónea y verifica que no se establece sesión.
- Resultado: La cuarta regla confirma el rechazo sin depender de cuál validación se evalúe primero.

Secuencia: Preparar cuenta inactiva → Usar una clave errónea → Revisar ausencia de sesión

## Ejercicio de aplicación

Diseña al menos 12 casos para descuentos: total mínimo $100, cupón vigente, cliente elegible y fecha válida. Justifica particiones y reglas.

### Respuesta orientativa

Incluye $99/$100/$101, cupón vencido/vigente, elegible/no elegible y combinaciones donde el descuento se bloquea por una condición.

### Error frecuente

Confundir alta cantidad de casos con buena cobertura. Usa una técnica y explica qué combinación representa cada caso.

## Autoevaluación

**Para un rango inclusivo de 18 a 65, ¿qué dato verifica el borde superior inválido?**

A. 65
B. 64
C. 66

**Respuesta:** C. 66 es el primer valor mayor que el máximo permitido.

## Lecturas adicionales

- [ISTQB CTFL – técnicas caja negra](https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)

---


# Semana 05 — Ejecución, defectos y evidencias

Módulo: QA Manual profesional · Tiempo de lectura: 30 min

> Un hallazgo solo es útil si otra persona puede entenderlo, reproducirlo y decidir qué hacer.

## 1. Anatomía de un buen caso de prueba

Identifica ID, objetivo, requisito asociado, precondiciones, datos, pasos, resultado esperado, resultado obtenido, estado y evidencia. Separar el esperado del obtenido permite evitar conclusiones subjetivas.

### Definición del caso de prueba

Un caso especifica objetivo, requisito, precondiciones, datos, acciones y resultados esperados. Debe permitir a otra persona repetir la comprobación.

**Ejemplo aplicado**

- Situación: Se quiere validar el subtotal de un carrito inicialmente vacío.
- Qué hace QA: Define usuario activo, producto de 50 y paso de agregar una unidad; el esperado es cantidad 1 y subtotal 50.
- Resultado: El caso queda definido antes de conocer el resultado de la ejecución.

Secuencia: Definir precondiciones → Describir acciones → Fijar esperado

### Registro de ejecución

La ejecución agrega lo observado, estado, fecha, entorno y versión a un caso. No se cambia el esperado para que coincida con un comportamiento defectuoso.

**Ejemplo aplicado**

- Situación: Al agregar el producto, el carrito muestra subtotal 100 en lugar de 50.
- Qué hace QA: Registra esperado 50, obtenido 100 y evidencia de la versión evaluada.
- Resultado: La discrepancia es verificable y puede relacionarse con un reporte de defecto.

Secuencia: Ejecutar caso → Registrar obtenido → Conservar evidencia

- Precondición: usuario activo con carrito vacío.
- Paso: agregar un producto de $50.
- Esperado: carrito muestra cantidad 1 y subtotal $50.
- Obtenido: se registra con fecha, ambiente y versión.

## 2. Ciclo de vida del defecto

Un reporte atraviesa normalmente estados como nuevo, triage, asignado, en curso, resuelto, reabierto y cerrado. La nomenclatura exacta es del equipo. Cada reporte debe incluir título específico, ambiente, versión, pasos, esperado, actual, evidencia y condiciones para reproducir.

### Reporte reproducible de bug

Un reporte necesita título preciso, condiciones, pasos, esperado, obtenido y evidencia. Los estados del flujo se acuerdan con el equipo y no son universales.

**Ejemplo aplicado**

- Situación: El checkout aplica dos veces un cupón al pulsar una sola vez.
- Qué hace QA: Describe entorno, datos y acciones; adjunta la comparación del descuento y conserva la frecuencia observada.
- Resultado: Desarrollo y triage tienen información para reproducir e investigar el problema.

Secuencia: Reproducir fallo → Documentar diferencia → Enviar a triage

### Severidad y prioridad

La severidad comunica impacto; la prioridad orienta el orden de atención. Un mismo impacto puede recibir diferente prioridad según alcance y momento.

**Ejemplo aplicado**

- Situación: Un descuento duplicado genera una diferencia económica en una campaña próxima a publicarse.
- Qué hace QA: Propone severidad según el impacto y discute prioridad con responsables del producto.
- Resultado: El reporte justifica ambas clasificaciones sin tratar sus nombres como equivalentes.

Secuencia: Evaluar impacto → Acordar urgencia → Ordenar atención

### Confirmación y reapertura

Después de una corrección se repite la comprobación que evidenció el fallo. Si sigue ocurriendo, se aporta evidencia para reabrirlo según el flujo acordado.

**Ejemplo aplicado**

- Situación: El equipo entrega una versión que pretende corregir el cupón duplicado.
- Qué hace QA: Repite los datos originales y conserva el nuevo resultado junto con la versión.
- Resultado: Se confirma la corrección o se documenta por qué el defecto continúa reproducible.

Secuencia: Recibir corrección → Repetir caso original → Confirmar o reabrir

- Severidad: impacto del defecto en la funcionalidad o negocio.
- Prioridad: urgencia de atención relativa a otros trabajos.
- Si no puedes reproducirlo, registra frecuencia y condiciones observadas.

## 3. Evidencias y trazabilidad

Relaciona historia → criterio → caso → ejecución → defecto. La evidencia debe aportar contexto sin exponer secretos, datos personales ni tokens. Una captura de pantalla sola casi nunca reemplaza pasos reproducibles.

### Cadena de trazabilidad

Relacionar historia, criterio, caso, ejecución y defecto hace visible qué necesidad cubre cada evidencia. Los identificadores deben conservarse al actualizar resultados.

**Ejemplo aplicado**

- Situación: Un criterio CA-03 exige que el cupón se aplique una sola vez.
- Qué hace QA: Vincula HU-02, CA-03, CP-014, RUN-08 y BUG-05 en el repositorio de pruebas.
- Resultado: Un cambio de regla permite localizar casos, ejecuciones y defectos relacionados.

Secuencia: Vincular requisito → Relacionar ejecución → Rastrear defecto

### Evidencia con contexto

Capturas, trazas y logs complementan los pasos, pero no sustituyen el contexto de reproducción. Deben excluir secretos y datos personales innecesarios.

**Ejemplo aplicado**

- Situación: La captura muestra un total incorrecto sin indicar producto ni cantidad.
- Qué hace QA: Añade los datos ficticios, navegador, build y respuesta relevante; elimina tokens de la evidencia compartida.
- Resultado: El reporte resulta comprensible y reproducible sin exponer credenciales.

Secuencia: Capturar información útil → Añadir contexto → Revisar datos sensibles

- Adjunta una captura o trace cuando aplique.
- Menciona navegador, ambiente y build.
- Anonimiza datos y elimina tokens o contraseñas de capturas.

## Ejemplo trabajado: Bug escrito correctamente

Título: “Checkout aplica doble descuento al seleccionar cupón NUEVO10 en carrito de $120”.

### Paso 1 · Identificar ambiente y versión

Ambiente: QA, build 1.4.2, Chromium. El contexto técnico permite saber dónde reproducir el defecto y evita comparar versiones diferentes.

**Ejemplo aplicado**

- Situación: Título: “Checkout aplica doble descuento al seleccionar cupón NUEVO10 en carrito de $120”.
- Qué hace QA: Registra QA, build 1.4.2 y Chromium junto con fecha y datos relevantes del entorno.
- Resultado: Otra persona puede preparar el mismo contexto antes de investigar el descuento duplicado.

Secuencia: Identificar el ambiente → Registrar la versión → Adjuntar el contexto

### Paso 2 · Preparar el carrito

Precondición: usuario elegible con carrito de $120. Una precondición precisa hace reproducible el cálculo y delimita la elegibilidad del cupón.

**Ejemplo aplicado**

- Situación: Título: “Checkout aplica doble descuento al seleccionar cupón NUEVO10 en carrito de $120”.
- Qué hace QA: Crea un usuario elegible y confirma que el carrito tiene subtotal 120 antes de aplicar NUEVO10.
- Resultado: El reporte deja claro que el fallo no depende de un subtotal distinto o de un usuario no elegible.

Secuencia: Preparar usuario elegible → Crear carrito de 120 → Confirmar la precondición

### Paso 3 · Reproducir la acción mínima

Pasos: abrir checkout, ingresar NUEVO10, aplicar una vez. Los pasos deben indicar una secuencia suficiente sin agregar acciones que cambien la causa del problema.

**Ejemplo aplicado**

- Situación: Título: “Checkout aplica doble descuento al seleccionar cupón NUEVO10 en carrito de $120”.
- Qué hace QA: Abre checkout, ingresa NUEVO10 y aplícalo una única vez conservando la evidencia.
- Resultado: El equipo puede repetir la secuencia y comprobar si el descuento se duplica con una sola aplicación.

Secuencia: Abrir checkout → Ingresar NUEVO10 → Aplicar una sola vez

### Paso 4 · Comparar esperado y obtenido

Esperado: descuento de $12; total $108. Actual: descuento $24; total $96. Mostrar ambos resultados permite entender la diferencia económica y comprobar la corrección después.

**Ejemplo aplicado**

- Situación: Título: “Checkout aplica doble descuento al seleccionar cupón NUEVO10 en carrito de $120”.
- Qué hace QA: Calcula 10 % de 120 y contrasta descuento 12 y total 108 con los valores observados 24 y 96.
- Resultado: La evidencia demuestra una diferencia de 12 frente al total esperado del caso.

Secuencia: Calcular el esperado → Capturar el obtenido → Comparar la diferencia

### Paso 5 · Valorar impacto y prioridad

Severidad: alta por diferencia económica; prioridad a acordar en triage. Severidad describe impacto; prioridad expresa el orden de atención acordado considerando el contexto.

**Ejemplo aplicado**

- Situación: Título: “Checkout aplica doble descuento al seleccionar cupón NUEVO10 en carrito de $120”.
- Qué hace QA: Explica el perjuicio económico y lleva el defecto a triage para acordar prioridad y responsable.
- Resultado: El reporte justifica el impacto sin confundir una valoración técnica con una decisión de planificación.

Secuencia: Describir el impacto → Revisar en triage → Acordar el seguimiento

## Ejercicio de aplicación

Elige tres fallos de una demo y documenta cada uno con precondición, pasos exactos, esperado, actual, versión y evidencia.

### Respuesta orientativa

Valida tu reporte pidiendo a alguien que siga las instrucciones sin hablar contigo. Si necesita aclaraciones, agrega contexto.

### Error frecuente

Usar “no funciona” como título o escribir severidad igual a prioridad sin discutir el impacto.

## Autoevaluación

**¿Qué información hace reproducible un defecto?**

A. Únicamente la captura
B. Precondiciones, pasos y diferencia entre resultado esperado y actual
C. El nombre del tester

**Respuesta:** B. La secuencia y el oráculo permiten repetir y verificar el problema.

## Lecturas adicionales

- [ISTQB CTFL – gestión de defectos](https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)

---


# Semana 06 — Agile QA y estrategia de pruebas

Módulo: QA Manual profesional · Tiempo de lectura: 30 min

> QA participa en las decisiones de un sprint y comunica calidad, cobertura y riesgos antes de la liberación.

## 1. QA dentro de Scrum

Refinamiento: formular preguntas y estimar riesgos. Planning: dimensionar pruebas, datos y dependencias. Desarrollo: colaborar con ejemplos, realizar pruebas tempranas y revisar cambios. Review: mostrar comportamiento. Retrospectiva: mejorar la estrategia y el feedback.

### QA durante el Sprint

Las pruebas y la conversación sobre calidad acompañan al incremento. QA puede contribuir en refinamiento, planificación, desarrollo, Review y Retrospectiva.

**Ejemplo aplicado**

- Situación: Un Sprint incorpora devoluciones parciales a una tienda.
- Qué hace QA: Aclara ejemplos antes de implementar, prepara datos y muestra en la Review los resultados relevantes.
- Resultado: El equipo obtiene retroalimentación durante el trabajo y no únicamente al final.

Secuencia: Acordar ejemplos → Evaluar incremento → Compartir resultados

### Definition of Done compartida

La definición de terminado hace explícitas condiciones de calidad para el incremento. Debe conocerse y revisarse con el equipo antes de declarar finalizado el trabajo.

**Ejemplo aplicado**

- Situación: La historia funciona manualmente pero todavía no tiene pruebas ni documentación acordadas.
- Qué hace QA: Contrasta la entrega con la Definition of Done y hace visible lo pendiente.
- Resultado: La conversación sobre terminado utiliza un acuerdo compartido, no solo la impresión de que funciona.

Secuencia: Consultar acuerdo → Comprobar entrega → Visibilizar pendientes

- No esperes a que el desarrollador “termine todo” para iniciar QA.
- Invita a conversaciones de tres amigos: negocio, desarrollo y QA.
- La definición de terminado debe ser conocida antes de ejecutar.

## 2. Diseña una estrategia ligera

Un plan útil incluye objetivo, alcance, supuestos, riesgos, ambiente, datos, enfoque, tipos de prueba, responsables, criterios de entrada/salida y evidencias. No tiene que ser largo; debe permitir que el equipo tome decisiones.

### Plan ligero orientado a decisiones

Un plan describe alcance, riesgos, enfoque, recursos y criterios para evaluar la entrega. Su utilidad depende de aclarar decisiones, no de acumular páginas.

**Ejemplo aplicado**

- Situación: Una campaña de descuentos debe evaluarse en dos días con un entorno limitado.
- Qué hace QA: Define funciones incluidas, exclusiones, datos, responsables y criterios de entrada y salida.
- Resultado: El equipo puede organizar el trabajo y reconocer las limitaciones de la evaluación.

Secuencia: Definir alcance → Planificar recursos → Acordar criterios

### Combinación de comprobaciones

Smoke, regresión y exploración cubren necesidades diferentes. La selección debe responder al cambio y al riesgo, no a ejecutar siempre toda la suite sin criterio.

**Ejemplo aplicado**

- Situación: Se modifica el cálculo de impuestos sin cambiar el formulario de perfil.
- Qué hace QA: Ejecuta smoke del candidato, regresión de importes y una sesión exploratoria de redondeos.
- Resultado: La cobertura prioriza los efectos plausibles del cambio y conserva evidencia de lo excluido.

Secuencia: Analizar cambio → Seleccionar pruebas → Comunicar cobertura

- Incluye smoke para detectar problemas críticos rápidamente.
- Selecciona regresión a partir de cambios y dependencias.
- Reserva sesiones exploratorias para escenarios no previstos.

## 3. Métricas para decidir

Reporta pruebas planificadas, ejecutadas, aprobadas, fallidas y bloqueadas; defectos por severidad; cobertura de riesgos y limitaciones. Una cifra alta de “pasó” no compensa que no se hayan probado funciones críticas.

### Métricas de ejecución y aprobación

El denominador debe quedar claro en cada métrica. Los porcentajes ayudan a describir resultados, pero no sustituyen el análisis de funciones críticas pendientes.

**Ejemplo aplicado**

- Situación: Se planificaron 25 casos y se ejecutaron 20; 17 de esos 20 aprobaron.
- Qué hace QA: Calcula ejecución 20/25 = 80% y aprobación sobre ejecutadas 17/20 = 85%.
- Resultado: El informe presenta ambas medidas sin confundir ejecución con aprobación.

Secuencia: Definir denominadores → Calcular indicadores → Explicar limitaciones

### Comunicación del riesgo residual

Un reporte de cierre debe indicar bloqueos, exclusiones y consecuencias potenciales. La decisión de salida requiere conocer qué incertidumbre permanece.

**Ejemplo aplicado**

- Situación: El ambiente impide validar el flujo crítico de pagos.
- Qué hace QA: Destaca el bloqueo aunque las otras funciones tengan alta aprobación y solicita una decisión de la persona responsable.
- Resultado: La liberación no se justifica únicamente con un porcentaje agregado favorable.

Secuencia: Identificar pendiente crítico → Explicar consecuencia → Apoyar decisión

- Tasa de ejecución = ejecutadas / planificadas × 100.
- Tasa de aprobación = aprobadas / ejecutadas × 100 (si define estados coherentes).
- Nombra bloqueos, exclusiones y riesgos aceptados.

## Ejemplo trabajado: Informe de cierre de sprint

Plan: 25 casos, ejecutados: 20, aprobados: 17, fallidos: 2 y bloqueado: 1.

### Paso 1 · Porcentaje ejecutado

Ejecución: 20/25 = 80 %. La medida debe indicar su denominador y no asumir que ejecutar equivale a aprobar.

**Ejemplo aplicado**

- Situación: Plan: 25 casos, ejecutados: 20, aprobados: 17, fallidos: 2 y bloqueado: 1.
- Qué hace QA: Divide veinte casos ejecutados entre veinticinco planificados y multiplica por cien.
- Resultado: La ejecución es 80 % y quedan cinco casos del plan sin ejecutar.

Secuencia: Contar los planificados → Contar los ejecutados → Calcular veinte entre veinticinco

### Paso 2 · Porcentaje aprobado

Aprobación sobre ejecutadas: 17/20 = 85 %. El denominador de este indicador son los ejecutados definidos en el informe, incluido el bloqueado según su convención.

**Ejemplo aplicado**

- Situación: Plan: 25 casos, ejecutados: 20, aprobados: 17, fallidos: 2 y bloqueado: 1.
- Qué hace QA: Divide diecisiete aprobados entre veinte ejecutados y explica la clasificación utilizada.
- Resultado: La aprobación sobre ese conjunto es 85 %, diferente del porcentaje de ejecución.

Secuencia: Identificar aprobados → Definir el denominador → Calcular diecisiete entre veinte

### Paso 3 · Declarar lo no comprobado

Riesgo: no se pudo validar un pago real por falta de ambiente. Un ambiente no disponible impide producir evidencia de ese riesgo y debe figurar como limitación.

**Ejemplo aplicado**

- Situación: Plan: 25 casos, ejecutados: 20, aprobados: 17, fallidos: 2 y bloqueado: 1.
- Qué hace QA: Registra la imposibilidad de validar el pago y describe el impacto de liberar sin esa comprobación.
- Resultado: El cierre permite distinguir casos aprobados de riesgos que siguen sin evidencia.

Secuencia: Identificar el bloqueo → Explicar su impacto → Registrar el riesgo pendiente

### Paso 4 · Comunicar la decisión

Decisión: no afirmar “listo para producción” sin que el responsable acepte el riesgo. QA aporta información para decidir; no debe convertir falta de evidencia en una garantía de preparación.

**Ejemplo aplicado**

- Situación: Plan: 25 casos, ejecutados: 20, aprobados: 17, fallidos: 2 y bloqueado: 1.
- Qué hace QA: Presenta resultados y pendientes al responsable de liberación para que decida y registre la aceptación del riesgo.
- Resultado: La conclusión del sprint tiene una decisión explícita y límites reconocidos.

Secuencia: Presentar los resultados → Revisar los pendientes → Registrar la decisión

## Ejercicio de aplicación

Redacta un plan de pruebas de una página para una HU de checkout y su reporte de cierre con riesgo explícito.

### Respuesta orientativa

Incluye al menos alcance, fuera de alcance, enfoque, datos, ambiente, criterios, métricas y limitaciones de cobertura.

### Error frecuente

Reportar únicamente “100 % de los casos ejecutados” sin explicar bloqueos, cobertura o criticidad.

## Autoevaluación

**¿Cuál es el mejor reporte para una liberación?**

A. Todo bien
B. 17/20 aprobados; 2 fallidos, 1 bloqueado y riesgo de pago pendiente
C. Se hicieron muchas pruebas

**Respuesta:** B. Permite tomar decisiones informadas sobre riesgos pendientes.

## Lecturas adicionales

- [ISTQB CTFL – actividades y gestión](https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/)

---


# Semana 07 — HTTP, REST y pruebas API con Postman y DevTools

Módulo: HTTP, REST, Postman, DevTools y SQL · Tiempo de lectura: 50 min

> Un QA de API valida contratos, datos y reglas de negocio incluso cuando la interfaz todavía no existe. Investiga la ejecución con Network, Console y Application de DevTools.

## Piezas de una petición HTTP

Una petición incluye método, URL, headers y opcionalmente body. Una respuesta incluye estado, headers y cuerpo. GET consulta recursos; POST suele crear o iniciar operaciones; PUT suele reemplazar; PATCH modifica parcialmente; DELETE solicita eliminación. Los contratos concretos dependen de la API.

- 2xx: éxito según el método y contrato.
- 4xx: problema atribuible a la solicitud (400, 401, 403, 404, 409, 422...).
- 5xx: fallo de servidor o intermediario; investiga contexto.
- No basta validar código 200: comprueba campos y reglas.

### Petición y respuesta HTTP

Una petición combina método, URL, headers y a veces cuerpo; la respuesta tiene estado, headers y contenido. Se evalúan según el contrato del endpoint.

Ejemplo: Una API de práctica acepta cotizaciones mediante POST. Envía producto, cantidad y envío como JSON y revisa estado, Content-Type y estructura del cuerpo. La evaluación diferencia lo enviado de lo respondido y puede localizar una discrepancia contractual.

### Estado HTTP y resultado de negocio

Un código 2xx no demuestra por sí mismo que las reglas se cumplan. Los errores 4xx y 5xx requieren interpretar el contexto y el diseño de la API.

Ejemplo: La API responde 200, pero el total no coincide con subtotal, descuento y envío. Comprueba tanto el código como la relación entre los importes del JSON. La prueba identifica un problema funcional aunque el transporte indique éxito.

### Método según contrato

GET, POST, PUT, PATCH y DELETE expresan intenciones diferentes. El contrato define su comportamiento concreto y los efectos que deben comprobarse.

Ejemplo: Un recurso permite actualizar solo el correo mediante PATCH. Envía el cambio parcial y comprueba que los demás campos permanecen según el contrato. La prueba evalúa el efecto esperado sin asumir que actualizar equivale a reemplazar todo el recurso.

## Casos positivos y negativos de API

Prueba payload válido, propiedades faltantes, tipos incorrectos, límites, acceso sin token, recurso inexistente, duplicados e idempotencia cuando corresponda. Verifica schema, estructura de errores, correlación y datos persistidos.

- 401: no autenticado; 403: autenticado pero sin permisos, según el diseño.
- Evita suponer que cada API usa los mismos mensajes o 422 ante validación.
- Usa colecciones de Postman y variables de ambiente sin compartir secretos.

### Datos válidos e inválidos

Las pruebas API incluyen propiedades ausentes, tipos incorrectos, límites, duplicados y recursos inexistentes. Cada respuesta esperada debe estar respaldada por el contrato.

Ejemplo: Cantidad admite enteros de 1 a 5 en el cotizador de entrenamiento. Prueba 1, 5, 0, 6 y un texto; registra el estado y error esperado para cada condición. Se distingue validación de rango, tipo y presencia sin suponer que todas las APIs usan el mismo código.

### Autenticación y autorización

La identidad y los permisos son controles distintos. Los códigos y mensajes concretos dependen de la API; no deben filtrarse secretos en colecciones compartidas.

Ejemplo: El sandbox ofrece un lector que no puede ejecutar una operación de escritura. Compara la petición sin credencial con la petición del lector a una acción restringida. Se pueden distinguir el rechazo por identidad y el rechazo por permisos según el diseño documentado.

## Validaciones automatizadas en Postman

En scripts post-response puedes inspeccionar el código y el JSON. Aísla los datos en ambientes y documenta el orden de ejecución cuando una prueba crea información que otra consume.

- Comprueba tipos y campos obligatorios.
- Prueba negativas y límites, no solo happy path.
- No confíes en servicios de práctica para datos sensibles.

### Aserciones post-response

Los scripts de Postman evalúan la respuesta recibida. Una comprobación de estado se complementa con tipos, campos y relaciones de negocio relevantes.

Ejemplo: Un endpoint de ejemplo promete id numérico y estado 200. Añade pm.test para el código y para comprobar que id existe y es un número. El runner muestra qué comprobación falló, incluso si el estado fue correcto.

### Datos y orden de ejecución

Las variables y datos del ambiente facilitan reutilizar una colección. Si hay dependencias entre peticiones, deben documentarse y prepararse de forma controlada.

Ejemplo: Una petición crea un recurso y otra necesita su identificador. Guarda el ID en el alcance adecuado y define preparación y limpieza sin compartir credenciales. La colección se puede ejecutar con datos conocidos y sin depender de residuos anteriores.

## Herramientas de desarrollo (DevTools)

Network permite identificar petición, respuesta, estado, headers y tiempos. Console muestra errores de JS y logs. Application permite revisar cookies, storage y otros estados del navegador. No copies credenciales o tokens en informes compartidos.

- Filtra Fetch/XHR para aislar llamadas API.
- Compara request payload y response body con el criterio de aceptación.
- Registra ID de correlación cuando exista.

### Network como evidencia

Network permite relacionar una acción con petición, estado, headers, cuerpo y tiempos. Capturar una respuesta sin saber qué la generó limita el diagnóstico.

Ejemplo: El botón Cotizar muestra un importe inesperado. Filtra Fetch/XHR, reproduce una sola acción y compara el payload y la respuesta con la regla. Se puede distinguir si el importe ya venía incorrecto de la API o cambió en la UI.

### Console y estado del navegador

Console ayuda a investigar errores de JavaScript; Application permite revisar cookies y almacenamiento. Estas evidencias pueden contener datos sensibles.

Ejemplo: Una pantalla no actualiza el usuario después de cerrar sesión. Revisa errores y estado local relevante, ocultando tokens antes de compartir capturas. El diagnóstico aporta contexto sin publicar credenciales ni contenido innecesario.

## Práctica guiada · Script de Postman para validar respuesta

Ejemplo para un endpoint que promete HTTP 200 y un objeto con propiedad id numérica.

Enviar petición GET desde Postman.
Abrir Scripts → Post-response.
Agregar aserciones de estado y contenido.
Adaptar atributos a un contrato real y documentar lo esperado.

## Reto de aprendizaje

Crea una colección de 15 validaciones para una API de práctica: métodos, estado, estructura, autenticación y escenarios negativos. Investiga una cotización con Network y Console y compara la respuesta con la interfaz.

## Autoevaluación

¿Qué aporta una comprobación adicional al código HTTP?

# Semana 08 — SQL para validar datos

Módulo: HTTP, REST, Postman, DevTools y SQL · Tiempo de lectura: 35 min

> Comprueba datos con SELECT, relaciones JOIN, NULL, agregaciones y subconsultas.

## Consultas SQL esenciales

SELECT elige columnas, WHERE filtra filas, JOIN combina relaciones y GROUP BY agrega resultados. En QA se usan para preparar/verificar datos y rastrear una operación. Trabaja preferentemente en ambientes de prueba y evita modificar información sin autorización.

- SELECT id, estado FROM pedidos WHERE estado = 'PENDIENTE';
- INNER JOIN combina coincidencias en ambas tablas.
- LEFT JOIN conserva las filas de la tabla izquierda incluso sin coincidencia.
- COUNT y SUM ofrecen controles de integridad básicos.

### SELECT, filtros y agregaciones

SELECT y WHERE permiten revisar filas concretas; GROUP BY combina filas para calcular medidas como COUNT y SUM. Los resultados necesitan un esperado conocido.

Ejemplo: En una base de práctica existen dos pedidos paid por un total de 139500 COP. Agrupa pedidos por estado y compara cantidad e importe con los datos de la actividad. La consulta confirma o refuta los valores esperados sin modificar registros de producción.

### Relaciones con JOIN

INNER JOIN conserva coincidencias de ambas tablas; LEFT JOIN conserva las filas de la izquierda aunque no tengan coincidencia. Elegir mal el JOIN puede ocultar datos relevantes.

Ejemplo: Se buscan pedidos que no tienen cliente relacionado en un conjunto de prueba. Usa LEFT JOIN y revisa las filas sin identificador del lado cliente. La consulta permite investigar relaciones ausentes que un INNER JOIN habría excluido.

## NULL y cardinalidad en relaciones

Un LEFT JOIN conserva filas sin coincidencias. Las columnas de la derecha contienen NULL y COUNT(columna) no cuenta esos NULL. El número de filas depende de la cardinalidad, no solo de cuántos clientes existen.

- Usa IS NULL para detectar ausencia de relación.
- Revisa si los filtros pertenecen a ON o WHERE.
- Compara COUNT(*) con COUNT(o.id).

### Clientes sin pedidos

LEFT JOIN permite encontrar clientes sin pedidos. Usa IS NULL sobre la clave del pedido y explica por qué un INNER JOIN no muestra esos clientes.

Ejemplo: El conjunto de práctica tiene tres clientes; Luis Demo no tiene pedidos registrados. Relaciona clientes y pedidos y filtra por o.id IS NULL para identificar la ausencia de pedido. Solo Luis aparece en el resultado; la consulta no inventa un pedido de importe cero.

### Evitar conteos engañosos

COUNT(*) cuenta filas del resultado; COUNT(o.id) cuenta identificadores no nulos. Una fila conservada por LEFT JOIN no implica que exista un pedido.

Ejemplo: El LEFT JOIN conserva una fila para Luis aunque su identificador de pedido es NULL. Agrupa por cliente y compara COUNT(*) con COUNT(o.id) usando la misma relación. El conteo de pedidos de Luis es cero al contar su identificador, no la fila conservada.

## Agregaciones y comprobaciones SQL

GROUP BY reúne filas, HAVING filtra grupos y EXISTS comprueba la existencia de una relación. Antes de ejecutar, establece las filas y totales esperados. Documenta diferencias sin alterar datos para forzar un resultado.

- Los pedidos paid suman 139500 COP en el conjunto del kit.
- HAVING COUNT(o.id) > 1 identifica a Ana con dos pedidos.
- EXISTS devuelve clientes con al menos un pedido que cumpla el filtro.

### Filtrar grupos con HAVING

WHERE filtra filas antes de agrupar y HAVING filtra los grupos calculados. Elegir la etapa incorrecta puede cambiar las cantidades y ocultar relaciones relevantes.

Ejemplo: Ana tiene dos pedidos en los datos de entrenamiento y Sol tiene un pedido registrado. Agrupa pedidos por cliente y aplica HAVING COUNT(o.id) > 1 para localizar clientes recurrentes. Solo Ana cumple la condición; el conteo representa pedidos y no clientes duplicados.

### Existencia y resultados esperados

EXISTS expresa si hay al menos una fila relacionada. Contrasta el resultado con los datos base y no confundas existencia de un pago con el total acumulado de pagos.

Ejemplo: Ana y Sol tienen pedidos pagados, mientras Luis no tiene pedidos en el conjunto de práctica. Busca clientes para los que exista un pedido con status paid y compara los identificadores obtenidos. La consulta devuelve Ana y Sol sin multiplicar clientes por el número de sus pedidos.

## Práctica guiada · SQL guiado · contar órdenes por estado

Tablas hipotéticas: pedidos(id, cliente_id, estado, total) y clientes(id, nombre).

Verifica pedidos con cliente existente mediante JOIN.
Cuenta pedidos por estado con GROUP BY.
Investiga órdenes duplicadas antes de reportar un bug.

## Reto de aprendizaje

Escribe 10 consultas que combinen filtros, JOIN, conteo y suma; guarda los resultados esperados y obtenidos con su explicación.

## Autoevaluación

¿Qué logra un LEFT JOIN?

# Semana 09 — JavaScript y Git

Módulo: JavaScript, TypeScript y Git · Tiempo de lectura: 50 min

> Aprende a expresar reglas de negocio con variables, decisiones, iteraciones y funciones comprobables. Conserva cambios revisables en Git.

## Variables y datos

JavaScript trabaja con valores primitivos como string, number, boolean, null y undefined. Usa const cuando no reasignas la variable y let cuando sí lo haces. Evita var en código moderno. Compara valores con === para no depender de coerciones implícitas.

- const correo = "qa@ejemplo.com";
- const intentos = 3;
- const activo = true;
- Number.isFinite(valor) ayuda a validar números reales.

### Tipos y comparación estricta

Un dato recibido de un formulario puede ser texto aunque represente una cantidad. Comprueba su tipo y evita que una conversión implícita oculte errores de entrada.

Ejemplo: Un carrito recibe la cantidad "3" desde un campo y el precio 20 desde el catálogo. Convierte la cantidad de forma explícita, valida que sea finita y compara los resultados con ===. El subtotal es 60; una entrada no numérica se rechaza antes de calcular el cobro.

### const y let según la intención

const impide reasignar la variable, pero no vuelve inmutable el objeto. Usa let cuando el algoritmo necesita cambiar el valor y limita su alcance para evitar estados accidentales.

Ejemplo: La prueba conserva un precio base de 100 y recorre tres cantidades para calcular sus totales. Declara el precio con const y crea los datos de cada iteración sin modificar el objeto compartido. Cada caso comienza con el mismo precio y no depende del orden de ejecución de los demás.

## Condiciones y ciclos

if/else, switch y los operadores lógicos permiten decidir qué hacer. for, for...of y while recorren datos. En pruebas, los criterios de aceptación se pueden trasladar a condiciones concretas y luego evaluar con diferentes entradas.

- && exige que ambas condiciones sean verdaderas.
- || permite que al menos una condición sea verdadera.
- ! invierte un booleano.
- Diseña primero entradas esperadas e inesperadas.

### Condiciones de negocio verificables

Una condición combina reglas concretas. Antes de escribir if o switch, identifica qué combinaciones permiten y cuáles impiden la operación; así puedes diseñar pruebas que ejerciten cada decisión.

Ejemplo: El descuento exige un cliente activo y una compra de al menos 100. Evalúa activo/inactivo con importes 99, 100 y 101; verifica ambos lados del operador &&. Solo un cliente activo con importe igual o superior a 100 obtiene el descuento.

### Recorrer datos sin perder casos

Un ciclo aplica una operación a una colección. Elige una salida y un incremento claros y prueba también la colección vacía para detectar límites mal definidos o resultados incompletos.

Ejemplo: El equipo debe validar cinco correos antes de cargar usuarios de prueba. Recorre los cinco valores con for...of y conserva el resultado de cada uno, incluyendo un correo inválido. El informe contiene cinco resultados y no se detiene silenciosamente al encontrar el inválido.

## Funciones pequeñas, fáciles de probar

Una función debe comunicar un propósito y devolver resultados previsibles. Evita que una función calcule descuentos, llame APIs y modifique UI al mismo tiempo: separar responsabilidades facilita depurar y automatizar.

- Define nombre y parámetros claros.
- Incluye retorno explícito para el resultado.
- Prueba valores límite e inválidos.

### Funciones con una responsabilidad

Una función pequeña expresa una regla y devuelve un resultado sin depender de la interfaz. Separar el cálculo de las llamadas de red facilita encontrar si el fallo está en la regla o en la integración.

Ejemplo: Una tienda aplica un descuento del 10 % a un producto de 200. Extrae el cálculo a una función pura y comprueba que devuelve 180 sin modificar el precio original. El cálculo se puede probar sin abrir el navegador ni conectar con un servicio externo.

### Probar límites y tipos inválidos

Un validador debe establecer qué acepta y qué rechaza. Comprueba el tipo antes de acceder a propiedades y usa ejemplos en las fronteras para evitar excepciones o reglas demasiado permisivas.

Ejemplo: Una contraseña debe tener entre 8 y 20 caracteres y al menos un dígito. Prueba longitudes 7, 8, 20 y 21, una cadena sin dígitos y null antes de integrar el validador. Los límites válidos pasan y las entradas inválidas devuelven false de forma controlada.

## Git como respaldo del trabajo QA

Un repositorio preserva historia de cambios y facilita revisiones. Flujo típico: clonar, crear rama, realizar cambios, git add, git commit, push y pull request. Agrega un README que explique cómo reproducir pruebas y qué archivos no se deben subir.

- git status: cambios pendientes.
- git switch -c qa/login: rama de trabajo.
- git add . && git commit -m "test: casos login": captura el cambio.
- Nunca publiques .env con secretos ni evidencia sensible.

### Rama, commit y revisión

Git conserva cambios y permite revisar una entrega. Preparar archivos y confirmar un commit son pasos diferentes; el contenido debe revisarse antes de publicarlo.

Ejemplo: Se añaden casos de prueba para un checkout en un repositorio propio. Crea una rama, revisa git status y el diff, prepara los archivos y crea un commit descriptivo. La revisión puede identificar exactamente qué cambió y cómo ejecutar sus comprobaciones.

### Repositorio reproducible y limpio

El README y las exclusiones del repositorio forman parte de la entrega. Historial de código no significa almacenar cualquier archivo generado o secreto.

Ejemplo: El proyecto contiene .env, reportes locales y datos de autenticación. Configura exclusiones y documenta variables con valores de ejemplo, sin subir secretos. Otra persona entiende la configuración sin recibir credenciales reales en el repositorio.

## Práctica guiada · Validador de contraseña

La regla de ejemplo permite contraseñas de 8 a 20 caracteres con al menos un dígito.

Se valida el tipo antes de leer .length.
Se separa validación de longitud y validación de dígito.
Se comprueba el resultado con varios datos.

## Reto de aprendizaje

Implementa funciones para calcular descuentos y validar claves; realiza pruebas con entrada vacía, valores límite y tipo incorrecto. Versiona el código con status, add, commit y log.

## Autoevaluación

¿Qué comparación es preferible para evitar coerción de tipo?

# Semana 10 — Objetos, arrays y JSON

Módulo: JavaScript + TypeScript · Tiempo de lectura: 35 min

> Los tests reales manipulan JSON, estructuras anidadas y listas de entidades.

## 1. Objetos y arreglos

Los objetos organizan datos por propiedades; los arrays mantienen colecciones ordenadas. Es habitual recibir un JSON con usuarios, productos o pedidos y transformar los datos para validar condiciones de negocio.

### Objetos con propiedades de negocio

Un objeto agrupa datos relacionados y un arreglo reúne varios elementos. Inspecciona la estructura real de una respuesta antes de acceder a propiedades para distinguir un dato ausente de un error de navegación.

**Ejemplo aplicado**

- Situación: La API devuelve un pedido con cliente, estado y una lista de productos.
- Qué hace QA: Comprueba el identificador del pedido y busca el producto por su id, sin asumir que siempre ocupa la primera posición.
- Resultado: La validación sigue siendo correcta aunque el servidor cambie el orden de los productos.

Secuencia: Inspeccionar el pedido → Identificar el producto → Validar sus propiedades

### Propiedades opcionales

El encadenamiento opcional evita acceder a una propiedad de null o undefined, pero no demuestra que el dato sea válido. Define cuándo su ausencia es aceptable y cuándo debe producir un fallo de contrato.

**Ejemplo aplicado**

- Situación: Un cliente puede no registrar teléfono, pero todo pedido debe incluir un id.
- Qué hace QA: Permite la ausencia del teléfono y crea una comprobación explícita que falle si el id del pedido no existe.
- Resultado: Un dato opcional no rompe la prueba y un campo obligatorio ausente se detecta.

Secuencia: Distinguir campos → Consultar los opcionales → Exigir los obligatorios

- usuario.email lee una propiedad de objeto.
- usuarios[0] obtiene el primer registro.
- El encadenamiento opcional usuario?.perfil?.nombre evita errores cuando faltan nodos.
- Desestructura const { id, estado } = pedido para código conciso.

## 2. map, filter, find y reduce

map produce una lista transformada. filter conserva los elementos que cumplen un predicado. find devuelve la primera coincidencia. reduce acumula una colección en un solo resultado. Estos métodos permiten construir verificaciones sin escribir loops manuales.

### Elegir map, filter y find

map transforma cada elemento, filter conserva los que cumplen una condición y find devuelve la primera coincidencia o undefined. Elegir la operación según la intención vuelve más legibles las validaciones.

**Ejemplo aplicado**

- Situación: Un catálogo contiene productos activos e inactivos y se necesita revisar sus nombres visibles.
- Qué hace QA: Filtra activos, transforma sus nombres con map y usa find para localizar un producto por id.
- Resultado: El resultado contiene únicamente nombres de productos activos y reconoce si el id no existe.

Secuencia: Filtrar activos → Transformar nombres → Buscar por identidad

### Acumulaciones con reduce

reduce combina los elementos en un resultado. Define un acumulador inicial y revisa las cantidades, porque sumar precios sin multiplicar unidades puede producir un total aparentemente razonable pero incorrecto.

**Ejemplo aplicado**

- Situación: Hay dos teclados de 80 y un monitor de 500; un mouse de 30 está inactivo.
- Qué hace QA: Filtra los disponibles y acumula precio por cantidad comenzando en cero.
- Resultado: El subtotal es 660; para un carrito vacío el resultado es cero.

Secuencia: Seleccionar disponibles → Multiplicar por cantidad → Sumar y contrastar

- filter(u => u.activo) devuelve solo usuarios activos.
- map(p => p.precio) obtiene lista de precios.
- find(u => u.id === 5) busca por identificador.
- reduce((acc,p) => acc+p.precio,0) suma precios.

## 3. JSON y operaciones seguras

JSON.parse convierte texto JSON válido en datos de JavaScript y puede fallar si el texto es incorrecto. JSON.stringify serializa un objeto. Recuerda que JSON no admite comentarios ni valores undefined.

### JSON no es un objeto JavaScript

JSON es un formato de texto con reglas propias. JSON.parse puede fallar ante un documento mal formado; JSON.stringify serializa datos, pero no conserva cualquier valor o comportamiento de JavaScript.

**Ejemplo aplicado**

- Situación: Una respuesta de prueba contiene una coma adicional antes de cerrar el objeto.
- Qué hace QA: Intenta parsearla dentro del manejo de error y registra que la respuesta no cumple el formato acordado.
- Resultado: El error de formato se identifica sin confundirlo con una regla de negocio del pedido.

Secuencia: Leer el texto → Interpretar el JSON → Clasificar el error

### Evitar mutaciones entre pruebas

Modificar un objeto compartido puede hacer que una prueba falle solo después de otra. Crea datos independientes y recuerda que una copia superficial sigue compartiendo objetos anidados.

**Ejemplo aplicado**

- Situación: Un caso cambia la dirección de un usuario y el siguiente espera la dirección original.
- Qué hace QA: Genera un usuario nuevo por caso y copia también las estructuras anidadas que se van a modificar.
- Resultado: Ambos casos funcionan por separado y en cualquier orden sin contaminar sus datos.

Secuencia: Crear datos propios → Modificar solo la copia → Repetir en otro orden

- Comprueba que una respuesta tenga la forma esperada antes de acceder a campos anidados.
- Usa try/catch ante cadenas JSON de origen incierto.
- Evita modificar objetos compartidos entre pruebas independientes.

## Ejemplo trabajado: Calcular subtotal desde JSON

Una API de práctica devuelve un carrito con productos y cantidades.

### Paso 1 · Filtrar disponibles

Filtra productos disponibles. El estado activo decide si el producto participa en este cálculo de ejemplo.

**Ejemplo aplicado**

- Situación: Una API de práctica devuelve un carrito con productos y cantidades.
- Qué hace QA: Aplica filter al carrito y comprueba que conserva el teclado y el monitor, excluyendo el mouse.
- Resultado: El conjunto de cálculo tiene dos productos disponibles y no incorpora el precio del mouse.

Secuencia: Leer el carrito → Filtrar por activo → Revisar los incluidos

### Paso 2 · Calcular por cantidad

Multiplica cantidad por precio. El subtotal de una línea depende tanto del precio como del número de unidades.

**Ejemplo aplicado**

- Situación: Una API de práctica devuelve un carrito con productos y cantidades.
- Qué hace QA: Calcula 80 por 2 para el teclado y 500 por 1 para el monitor.
- Resultado: Los importes por línea son 160 y 500, listos para acumular sin perder cantidades.

Secuencia: Leer precio y cantidad → Multiplicar cada línea → Guardar sus subtotales

### Paso 3 · Acumular y contrastar

Suma los subtotales y comprueba el total. El acumulador inicial cero permite manejar también un conjunto vacío de productos.

**Ejemplo aplicado**

- Situación: Una API de práctica devuelve un carrito con productos y cantidades.
- Qué hace QA: Suma 160 y 500, compara con 660 y repite con un carrito vacío.
- Resultado: El caso principal devuelve 660 y el carrito vacío devuelve cero.

Secuencia: Iniciar en cero → Sumar los subtotales → Comprobar el total

```javascript
const productos = [
  {nombre:"Teclado",precio:80,cantidad:2,activo:true},
  {nombre:"Mouse",precio:30,cantidad:1,activo:false},
  {nombre:"Monitor",precio:500,cantidad:1,activo:true}
];
const total = productos
  .filter(p => p.activo)
  .reduce((s,p) => s + p.precio * p.cantidad, 0);
console.assert(total === 660);
```

## Ejercicio de aplicación

Recibe 10 usuarios como JSON y genera un reporte con activos, inactivos, correos inválidos y el primer usuario bloqueado.

### Respuesta orientativa

Usa filter para grupos, find para primer bloqueado y map para extraer correos. Define qué significa “correo válido” según una regla simple y explícita.

### Error frecuente

Suponer que JSON.parse nunca falla o que todos los campos de una API siempre existen.

## Autoevaluación

**¿Qué método devuelve un arreglo con solo los elementos que cumplen una condición?**

A. find
B. filter
C. reduce

**Respuesta:** B. filter recorre una colección y mantiene los elementos aprobados por el predicado.

## Lecturas adicionales

- [MDN – Array](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Global_Objects/Array)

---


# Semana 11 — TypeScript y POO

Módulo: JavaScript + TypeScript · Tiempo de lectura: 40 min

> Tipar el dominio ayuda a detectar errores antes de ejecutar pruebas y facilita refactorizaciones.

## 1. ¿Qué añade TypeScript?

TypeScript incorpora comprobación estática de tipos sobre JavaScript. El compilador detecta usos incoherentes de propiedades y argumentos antes de ejecutar, pero los tipos se eliminan al compilar; no validan automáticamente datos de una API en runtime.

### Tipos que detectan errores temprano

TypeScript comprueba compatibilidad de tipos antes de ejecutar. Ayuda a detectar usos incorrectos de funciones, pero una respuesta externa todavía requiere validación durante la ejecución.

**Ejemplo aplicado**

- Situación: Una función espera un total numérico y recibe el texto "100".
- Qué hace QA: Declara el parámetro como number y ejecuta el compilador para identificar el uso incorrecto.
- Resultado: El error se corrige antes de ejecutar la prueba y no se oculta con una conversión injustificada.

Secuencia: Declarar el contrato → Compilar el código → Corregir el uso

### Uniones y valores permitidos

Las uniones de literales representan un conjunto explícito de estados. Son más precisas que string para una regla cerrada y permiten detectar nombres escritos de forma inconsistente.

**Ejemplo aplicado**

- Situación: Un pedido solo permite los estados pendiente, pagado y cancelado.
- Qué hace QA: Modela esos valores como una unión y evita usar any para aceptar un estado desconocido.
- Resultado: El compilador señala "pagadoo" y el equipo mantiene un vocabulario coherente para los tests.

Secuencia: Enumerar estados → Tipar la operación → Detectar un valor ajeno

- string, number y boolean son tipos básicos.
- Las uniones como "pending" | "paid" restringen estados.
- Los objetos se pueden definir mediante type o interface.
- Evita any como salida fácil: pierdes garantías de tipo.

## 2. Interfaces, opcionales y nulabilidad

Una interface expresa la forma esperada de un objeto y permite documentar contratos en el proyecto. Propiedades con ? son opcionales. Diferencia una propiedad ausente de un valor null según el contrato.

### Interfaces y campos opcionales

Una interfaz describe la forma esperada de los datos. Marca como opcional únicamente lo que realmente puede faltar; si todos los campos se vuelven opcionales, se debilita el contrato que la prueba pretende comprobar.

**Ejemplo aplicado**

- Situación: Un usuario tiene id y correo obligatorios y teléfono opcional.
- Qué hace QA: Define la interfaz y construye datos de prueba con y sin teléfono manteniendo id y correo.
- Resultado: Ambas variantes válidas se pueden usar y un usuario sin id se detecta al compilar.

Secuencia: Definir campos → Crear variantes válidas → Revisar el contrato

### unknown y estrechamiento de tipos

unknown obliga a comprobar un dato antes de utilizarlo. Verifica su forma con condiciones o validadores; afirmar un tipo con as no transforma el valor ni comprueba lo que devolvió el servidor.

**Ejemplo aplicado**

- Situación: Una API externa puede devolver un usuario o un mensaje de error.
- Qué hace QA: Comprueba que existe un objeto y que el campo email es una cadena antes de utilizarlo como correo.
- Resultado: La prueba informa de una estructura inesperada sin asumir que una aserción de tipo la validó.

Secuencia: Recibir un dato desconocido → Comprobar su estructura → Usar el dato validado

- interface Usuario { id: number; nombre: string; activo: boolean }
- email?: string permite ausencia del correo.
- unknown exige comprobar el tipo antes de usarlo.

## 3. Generics y tipos reutilizables

Una función genérica conserva la relación entre sus entradas y su salida. Por ejemplo, una función para seleccionar el primer registro de cualquier arreglo puede ser genérica en lugar de usar any.

### Generics para conservar la relación de tipos

Un genérico permite reutilizar una estructura sin perder el tipo de su contenido. Úsalo cuando una misma envoltura transporta entidades diferentes y evita reemplazar todos sus datos por any.

**Ejemplo aplicado**

- Situación: La API devuelve Respuesta<Usuario> y Respuesta<Pedido> con los mismos metadatos.
- Qué hace QA: Define Respuesta<T> y comprueba que cada consumidor accede únicamente a las propiedades de su entidad.
- Resultado: El código compartido conserva la ayuda del compilador para usuarios y pedidos.

Secuencia: Definir la envoltura → Asignar la entidad → Comprobar sus campos

### Compilación y validación en ejecución

La compilación y las aserciones de prueba cubren problemas distintos. Mantén strict y valida las entradas externas para que un cambio del servidor no pase inadvertido detrás de un tipo declarado.

**Ejemplo aplicado**

- Situación: La interfaz dice que total es number, pero una respuesta real incluye "199.90".
- Qué hace QA: Ejecuta tsc y después una aserción de tipo sobre el JSON recibido.
- Resultado: La compilación puede pasar; la prueba del contrato detecta que el servidor envió una cadena.

Secuencia: Compilar con strict → Consultar el servicio → Validar el valor real

- El tipo no sustituye aserciones funcionales.
- Combina tipos con validación explícita para respuestas externas.
- Activa strict en tsconfig para encontrar problemas antes.

## Ejemplo trabajado: Modelar un resultado API

El servicio devuelve estado y un usuario con atributos conocidos.

### Paso 1 · Definir entidad y envoltura

Declara interfaces para la entidad y la respuesta. Los tipos deben describir qué dato contiene la respuesta y qué estados puede declarar.

**Ejemplo aplicado**

- Situación: El servicio devuelve estado y un usuario con atributos conocidos.
- Qué hace QA: Define Usuario con id, email y activo y Respuesta<T> con data y status limitado a ok o error.
- Resultado: La envoltura conserva el tipo de la entidad que transporta y limita los estados admitidos.

Secuencia: Declarar Usuario → Crear Respuesta genérica → Relacionar ambos tipos

### Paso 2 · Expresar la regla de acceso

Crea una función tipada que reciba el modelo. La función tipada combina el éxito de la respuesta y la actividad del usuario como condiciones diferentes.

**Ejemplo aplicado**

- Situación: El servicio devuelve estado y un usuario con atributos conocidos.
- Qué hace QA: Prueba tieneAcceso con status ok/error y activo true/false mediante objetos tipados.
- Resultado: Solo la combinación de respuesta ok y usuario activo devuelve true en este ejemplo.

Secuencia: Crear las combinaciones → Evaluar tieneAcceso → Comparar el booleano

### Paso 3 · Interpretar el diagnóstico

Identifica en el IDE cuándo intentas leer una propiedad inexistente. El IDE ayuda a explorar el modelo, pero la compilación confirma el diagnóstico antes de ejecutar.

**Ejemplo aplicado**

- Situación: El servicio devuelve estado y un usuario con atributos conocidos.
- Qué hace QA: Intenta acceder a un campo inexistente como usuario.correoAlterno y revisa el error con tsc.
- Resultado: El uso incorrecto se detecta sin cambiar el modelo con any para silenciar el compilador.

Secuencia: Acceder al campo ajeno → Ejecutar el compilador → Corregir la propiedad

```typescript
interface Usuario {
  id: number;
  email: string;
  activo: boolean;
}
interface Respuesta<T> {
  data: T;
  status: "ok" | "error";
}
function tieneAcceso(r: Respuesta<Usuario>): boolean {
  return r.status === "ok" && r.data.activo;
}
```

## Ejercicio de aplicación

Define interfaces para Producto, Pedido, Usuario y RespuestaAPI<T>. Crea una función para validar la elegibilidad de un pedido.

### Respuesta orientativa

Distingue estados literales permitidos, campos opcionales y qué condiciones solo pueden conocerse en ejecución.

### Error frecuente

Asumir que TypeScript confirma datos externos en runtime: un JSON puede incumplir la interface aunque compile.

## Autoevaluación

**¿Para qué sirve una interface en TypeScript?**

A. Asegurar automáticamente el servidor
B. Describir la forma esperada de un objeto durante el desarrollo
C. Crear una base de datos

**Respuesta:** B. La interface ayuda a detectar incompatibilidades de tipos en tiempo de compilación.

## Lecturas adicionales

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---


# Semana 12 — Asincronía y calidad de código

Módulo: JavaScript + TypeScript · Tiempo de lectura: 40 min

> Las aplicaciones modernas son asíncronas; entender Promises, await y manejo de errores es indispensable para Playwright.

## 1. Promesas y await

Una Promise representa el resultado futuro de una operación. async permite que una función retorne una Promise; await espera su resolución dentro de código asíncrono. Las operaciones de Playwright como click(), fill() y goto() normalmente deben esperarse.

### Esperar una promesa con await

Una operación asíncrona termina después de iniciarse. await permite continuar con su resultado y propagar su error; omitirlo puede terminar una prueba antes de que ocurra la comprobación importante.

**Ejemplo aplicado**

- Situación: El test solicita un usuario y revisa su correo antes de terminar la petición.
- Qué hace QA: Espera la petición y la lectura del JSON antes de evaluar la propiedad del usuario.
- Resultado: La aserción utiliza los datos recibidos y un fallo de la petición no queda fuera de la prueba.

Secuencia: Iniciar la petición → Esperar su resultado → Validar el usuario

### Paralelismo solo sin dependencias

Promise.all puede esperar operaciones independientes, pero no sustituye el orden que exige el negocio. Si una petición necesita el id creado por otra, primero debes obtenerlo.

**Ejemplo aplicado**

- Situación: Para revisar un pedido se necesitan el catálogo y la lista de países, que no dependen entre sí.
- Qué hace QA: Consulta ambas listas en paralelo, pero espera a crear el pedido antes de consultar su detalle.
- Resultado: Se reduce la espera sin intentar leer un pedido que todavía no existe.

Secuencia: Identificar dependencias → Ejecutar lo independiente → Respetar el orden necesario

- Omitir await puede producir carreras y fallos intermitentes.
- Promise.all sirve para operaciones independientes que pueden ejecutarse simultáneamente.
- No uses esperas artificiales para “dar tiempo” si puedes observar un resultado.

## 2. Manejo de fallos asíncronos

try/catch captura rechazos de Promise esperada y otras excepciones. Es importante agregar contexto diagnóstico sin ocultar la causa original ni convertir fallos en falsos positivos.

### Clasificar y propagar fallos

Un error esperado del negocio no es igual a una caída de red. Conserva el contexto y permite que la prueba falle cuando no puede validar su objetivo, en lugar de capturar y omitir cualquier excepción.

**Ejemplo aplicado**

- Situación: GET de un usuario responde 404 y otra ejecución no logra conectar con el servidor.
- Qué hace QA: Distingue la ausencia del usuario del fallo de transporte y añade el contexto de la operación al diagnóstico.
- Resultado: El reporte permite saber si falló el escenario o la infraestructura que lo ejecuta.

Secuencia: Capturar el contexto → Clasificar el fallo → Comunicar la causa

### Comprobar HTTP antes del cuerpo

fetch no rechaza automáticamente todas las respuestas HTTP de error. Revisa response.ok o el estado esperado antes de interpretar el cuerpo como una respuesta exitosa.

**Ejemplo aplicado**

- Situación: Un endpoint devuelve 500 con un cuerpo HTML de error.
- Qué hace QA: Comprueba el estado antes de llamar al parser que espera un usuario JSON.
- Resultado: La prueba informa del 500 en lugar de mostrar solamente una excepción de JSON sin contexto.

Secuencia: Recibir la respuesta → Revisar su estado → Interpretar el cuerpo correcto

- No coloques catch vacío en código de tests.
- Propaga errores que impiden validar el resultado.
- Diferencia errores esperados del negocio y errores inesperados del sistema.

## 3. Clases y módulos para organizar el código

export/import permite separar responsabilidades. Una clase agrupa estado y comportamiento; úsala cuando tiene sentido, por ejemplo en un Page Object. Evita abstraer cada línea en una clase solo porque estás automatizando.

### Clases con estado útil

Una clase agrupa estado y operaciones relacionadas. No necesita contener toda la aplicación: una clase de página puede conocer el navegador, mientras una función pura calcula valores sin depender de él.

**Ejemplo aplicado**

- Situación: La suite usa una página de login y un cálculo de descuentos.
- Qué hace QA: Encapsula el formulario en una clase y mantiene el cálculo en una función independiente.
- Resultado: Cada pieza se prueba y se modifica sin introducir dependencias ajenas a su responsabilidad.

Secuencia: Separar responsabilidades → Elegir clase o función → Probar cada pieza

### Módulos con dependencias claras

Los módulos permiten exportar contratos y operaciones reutilizables. Mantén dependencias explícitas y evita importar un archivo que ejecute peticiones o cambie datos solo por ser cargado.

**Ejemplo aplicado**

- Situación: Tres pruebas necesitan el mismo constructor de pedidos de ejemplo.
- Qué hace QA: Exporta una función que genera un pedido nuevo y llámala dentro de la preparación de cada test.
- Resultado: La reutilización no introduce pedidos globales ni efectos secundarios al importar.

Secuencia: Exportar el constructor → Preparar cada test → Revisar el aislamiento

- Una función pura es útil para reglas y datos.
- Una clase puede encapsular acciones de una pantalla.
- Un módulo puede exportar utilidades comunes.

## Ejemplo trabajado: Consultar un servicio con control de error

Se espera recibir una respuesta exitosa con JSON válido; en caso contrario debe informarse el problema.

### Paso 1 · Esperar la respuesta

Await sobre fetch para esperar la respuesta. El resultado de fetch es una promesa y todavía no representa el cuerpo JSON del usuario.

**Ejemplo aplicado**

- Situación: Se espera recibir una respuesta exitosa con JSON válido; en caso contrario debe informarse el problema.
- Qué hace QA: Invoca leerUsuario con un id de prueba y espera la petición antes de consultar sus propiedades.
- Resultado: La función evalúa una Response real en lugar de trabajar sobre una promesa sin resolver.

Secuencia: Invocar fetch → Esperar la promesa → Recibir la Response

### Paso 2 · Revisar el estado HTTP

Comprobar status con response.ok. Un error HTTP puede resolver la promesa de fetch y necesita una comprobación explícita.

**Ejemplo aplicado**

- Situación: Se espera recibir una respuesta exitosa con JSON válido; en caso contrario debe informarse el problema.
- Qué hace QA: Simula una respuesta 404 y verifica que respuesta.ok lleva a la rama de error prevista.
- Resultado: El estado no exitoso se detecta antes de interpretar el cuerpo como un usuario válido.

Secuencia: Recibir el status → Evaluar response.ok → Elegir la rama

### Paso 3 · Leer y devolver el JSON

Esperar la conversión del JSON y devolverlo. La conversión del cuerpo también es asíncrona y puede fallar si no contiene JSON válido.

**Ejemplo aplicado**

- Situación: Se espera recibir una respuesta exitosa con JSON válido; en caso contrario debe informarse el problema.
- Qué hace QA: Prueba una respuesta exitosa con un usuario JSON y espera el valor que devuelve leerUsuario.
- Resultado: El consumidor recibe el cuerpo interpretado y reconoce un error de formato si el JSON no es válido.

Secuencia: Leer el cuerpo → Esperar la conversión → Devolver el dato

### Paso 4 · Propagar el fallo

Propagar un error si el servidor responde con error. El consumidor debe poder detectar que la consulta no cumplió su objetivo en vez de recibir un éxito vacío.

**Ejemplo aplicado**

- Situación: Se espera recibir una respuesta exitosa con JSON válido; en caso contrario debe informarse el problema.
- Qué hace QA: Comprueba que la función rechaza con el status correspondiente y conserva el fallo en la prueba.
- Resultado: El reporte permite relacionar el error con la operación y el estado HTTP que lo provocó.

Secuencia: Provocar un HTTP de error → Propagar la excepción → Comprobar su contexto

```typescript
async function leerUsuario(id: number): Promise<unknown> {
  const respuesta = await fetch(`/api/usuarios/${id}`);
  if (!respuesta.ok) {
    throw new Error(`HTTP ${respuesta.status}`);
  }
  return await respuesta.json();
}
// En un test se esperaría: await leerUsuario(1)
```

## Ejercicio de aplicación

Escribe una función asíncrona que consulte una URL, compruebe el estado HTTP y maneje un error de red sin silenciarlo.

### Respuesta orientativa

La función debe await la petición y la lectura del body; ante respuesta no exitosa debe lanzar error con contexto suficiente.

### Error frecuente

Hacer `page.click()` sin await y asumir que el siguiente paso encontrará la pantalla lista.

## Autoevaluación

**¿Qué efecto tiene olvidar await en una acción de Playwright?**

A. Siempre hace todo más rápido
B. Puede provocar carreras y resultados inconsistentes
C. Desactiva los retries

**Respuesta:** B. La prueba podría continuar antes de que la operación termine.

## Lecturas adicionales

- [MDN – async function](https://developer.mozilla.org/es/docs/Web/JavaScript/Reference/Statements/async_function)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)

---


# Semana 13 — Primer proyecto Playwright

Módulo: Automatización con Playwright · Tiempo de lectura: 40 min

> Prepara el entorno de Playwright Test y construye tu primera prueba automática con estructura reproducible.

## 1. Instalación y arquitectura básica

Playwright Test incluye ejecutor, navegador, aserciones, configuración y reportes. Requiere Node.js compatible y los navegadores de prueba instalados. El comando de inicio crea archivos listos para trabajar; revisa la configuración en lugar de copiar código a ciegas.

### Instalación reproducible

Playwright necesita el paquete de pruebas y los navegadores compatibles con su versión. Versiona el archivo de bloqueo y documenta los requisitos para que el entorno de otra persona no dependa de tu instalación personal.

**Ejemplo aplicado**

- Situación: Un compañero clona la suite de login y no tiene los navegadores instalados.
- Qué hace QA: Sigue los pasos de instalación del README, instala los navegadores y ejecuta la prueba desde un clon limpio.
- Resultado: La suite se prepara con instrucciones repetibles y el error de instalación no se confunde con un defecto de login.

Secuencia: Instalar dependencias → Preparar navegadores → Ejecutar una prueba

### Estructura que comunica intención

Organiza tests, configuración y datos con nombres reconocibles. El archivo de configuración define cómo ejecutar, mientras el escenario describe qué comportamiento del usuario se desea comprobar.

**Ejemplo aplicado**

- Situación: La suite comienza con login.spec.ts y después incorpora pruebas de catálogo.
- Qué hace QA: Separa los archivos por funcionalidad y configura testDir sin colocar casos de negocio dentro de la configuración.
- Resultado: El equipo localiza las pruebas de login y catálogo sin revisar utilidades no relacionadas.

Secuencia: Definir carpetas → Nombrar los escenarios → Localizar la ejecución

- npm init playwright@latest inicia un proyecto recomendado.
- tests/*.spec.ts contiene escenarios.
- playwright.config.ts define proyectos, baseURL, timeouts y reporter.
- npx playwright test ejecuta la suite.

## 2. Estructura de una prueba y aserciones

Una prueba describe escenario, preparación, acción y comprobación. test() registra el caso; page controla una pestaña; expect valida resultados. Prefiere aserciones de locator que esperan condiciones visibles o de URL.

### Preparar, actuar y comprobar

Una prueba debe distinguir sus precondiciones, la acción del usuario y la expectativa observable. Hacer clic sin una aserción demuestra una interacción, pero no confirma el comportamiento de negocio.

**Ejemplo aplicado**

- Situación: Un usuario de demostración entra en SauceDemo con las credenciales públicas del sitio.
- Qué hace QA: Abre el login, completa el formulario y comprueba que aparece la página de inventario.
- Resultado: El test falla si el formulario se envía pero el acceso al catálogo no ocurre.

Secuencia: Preparar el usuario → Enviar el formulario → Comprobar el catálogo

### Aserciones sobre estados observables

Usa las aserciones de Playwright para esperar que la interfaz alcance el estado esperado. El mensaje de fallo debe permitir reconocer qué esperaba el caso y qué encontró durante la ejecución.

**Ejemplo aplicado**

- Situación: El catálogo tarda en mostrar su encabezado después del login.
- Qué hace QA: Comprueba la URL y el encabezado visible con expect, sin sustituir la validación por una pausa fija.
- Resultado: La prueba espera la condición relevante y detecta una navegación incorrecta aunque el clic no falle.

Secuencia: Iniciar la navegación → Esperar el encabezado → Contrastar la expectativa

- El test debe poder ejecutarse sin otro test previo.
- El estado inicial debe ser conocido y controlado.
- Verifica resultado de negocio y no solo que ocurrió un click.

## 3. Primer ciclo de depuración

Ejecuta una prueba, observa error, revisa locator, estado y condición esperada; corrige la causa y vuelve a ejecutar. El modo UI y las trazas facilitan comprender dónde cambió la interfaz.

### Depurar el primer fallo relevante

La ejecución visible y el modo de depuración permiten observar las acciones, pero debes investigar la primera diferencia con lo esperado. Cambiar muchos selectores a la vez dificulta identificar la causa.

**Ejemplo aplicado**

- Situación: El primer test no encuentra el botón de acceso.
- Qué hace QA: Ejecuta con el navegador visible, revisa el locator y confirma si el formulario realmente terminó de cargar.
- Resultado: La corrección corresponde al selector o a la precondición que falló y no a una espera elegida al azar.

Secuencia: Reproducir el fallo → Inspeccionar la acción → Corregir la causa

### Reporte y traza con contexto

Un reporte resume resultados y una traza conserva acciones, estados y peticiones para investigar. Antes de compartir evidencia revisa si contiene tokens, datos de usuarios u otra información sensible.

**Ejemplo aplicado**

- Situación: El test pasa localmente y falla al ejecutarse en otro equipo.
- Qué hace QA: Abre el reporte, identifica la acción fallida y compara su traza con las condiciones del entorno local.
- Resultado: El análisis dispone de evidencia del fallo y no depende únicamente de repetir la prueba.

Secuencia: Abrir el reporte → Examinar la traza → Explicar la diferencia

- npx playwright test --ui: interfaz de ejecución.
- npx playwright test --headed: muestra navegador.
- npx playwright show-report: inspecciona los resultados.

## Ejemplo trabajado: Primera prueba con SauceDemo

El usuario de demostración inicia sesión y llega al inventario de productos.

### Paso 1 · Preparar el proyecto

Inicializa el proyecto y confirma dependencias. La prueba depende tanto de los paquetes como de los navegadores instalados para esa versión.

**Ejemplo aplicado**

- Situación: El usuario de demostración inicia sesión y llega al inventario de productos.
- Qué hace QA: Inicializa el proyecto de práctica, revisa el lockfile e instala los navegadores requeridos.
- Resultado: El entorno puede iniciar el navegador antes de evaluar el login del sitio de demostración.

Secuencia: Crear el proyecto → Instalar dependencias → Preparar el navegador

### Paso 2 · Escribir el escenario

Crea tests/login.spec.ts. El caso debe incluir preparación, acción y una expectativa observable del acceso exitoso.

**Ejemplo aplicado**

- Situación: El usuario de demostración inicia sesión y llega al inventario de productos.
- Qué hace QA: Crea login.spec.ts con las credenciales públicas de SauceDemo y la aserción de URL del inventario.
- Resultado: El archivo expresa el comportamiento esperado sin incluir credenciales privadas del proyecto.

Secuencia: Abrir SauceDemo → Completar el login → Declarar la expectativa

### Paso 3 · Ejecutar y leer resultados

Ejecuta npx playwright test. Un comando que termina debe revisarse por su resultado y no solo por haber abierto el navegador.

**Ejemplo aplicado**

- Situación: El usuario de demostración inicia sesión y llega al inventario de productos.
- Qué hace QA: Ejecuta npx playwright test y abre el reporte si el escenario falla o necesita explicación.
- Resultado: La evidencia identifica el escenario ejecutado y el primer paso que no cumplió lo esperado.

Secuencia: Lanzar la suite → Leer el resultado → Abrir la evidencia

### Paso 4 · Confirmar la navegación

Verifica que la URL corresponde al inventario. El clic exitoso no garantiza que el usuario haya llegado al catálogo.

**Ejemplo aplicado**

- Situación: El usuario de demostración inicia sesión y llega al inventario de productos.
- Qué hace QA: Comprueba con toHaveURL la ruta inventory.html después de enviar las credenciales.
- Resultado: La prueba falla si permanece en login o navega a un destino diferente del inventario.

Secuencia: Enviar el login → Esperar la navegación → Contrastar la URL

```typescript
import { test, expect } from "@playwright/test";

test("login válido", async ({ page }) => {
  await page.goto("https://www.saucedemo.com/");
  await page.getByPlaceholder("Username").fill("standard_user");
  await page.getByPlaceholder("Password").fill("secret_sauce");
  await page.getByRole("button", { name: "Login" }).click();
  await expect(page).toHaveURL(/inventory\.html/);
});
```

## Ejercicio de aplicación

Crea un proyecto Playwright e implementa dos pruebas de login: credenciales correctas y contraseña incorrecta.

### Respuesta orientativa

Prueba positiva: llega al catálogo. Prueba negativa: el usuario permanece sin sesión y ve el error esperado del sitio demo.

### Error frecuente

Ver solo que el botón fue presionado sin comprobar que la funcionalidad cumplió el objetivo.

## Autoevaluación

**¿Cuál es la ventaja de usar Playwright Test?**

A. Reemplazar el análisis QA
B. Combinar runner, aserciones, configuración y reportes
C. Ejecutar sin escribir ninguna validación

**Respuesta:** B. Proporciona un entorno de pruebas integrado; tú todavía defines qué verificar.

## Lecturas adicionales

- [Playwright – Introducción](https://playwright.dev/docs/intro)
- [Playwright – Escribir pruebas](https://playwright.dev/docs/writing-tests)

---


# Semana 14 — Locators y assertions robustos

Módulo: Automatización con Playwright · Tiempo de lectura: 40 min

> Los locators y las aserciones bien escogidas son la base de pruebas estables, accesibles y mantenibles.

## 1. Locators basados en intención de usuario

Prefiere getByRole, getByLabel y getByText cuando la interfaz ofrece atributos accesibles; getByTestId es útil cuando existe un contrato estable explícito. Los CSS/XPath frágiles basados en posición son un recurso menos deseable para la mayoría de acciones.

### Locators por intención del usuario

Los roles y nombres accesibles expresan cómo el usuario reconoce un control. Prefiérelos cuando el nombre sea estable y reserva otros contratos, como test ids, para casos donde aporten claridad.

**Ejemplo aplicado**

- Situación: Un botón de guardar cambia de clase CSS después de rediseñar el perfil.
- Qué hace QA: Localiza el botón por su rol y nombre Guardar, y revisa que el nombre siga representando la acción.
- Resultado: La prueba resiste cambios visuales y continúa comprobando la operación que reconoce el usuario.

Secuencia: Identificar el control → Elegir rol y nombre → Ejecutar la acción

### Acotar antes de interactuar

Un mismo nombre puede aparecer en varios componentes. Reduce el alcance al diálogo, formulario o tarjeta correspondiente, en lugar de elegir una coincidencia por su posición accidental.

**Ejemplo aplicado**

- Situación: Una pantalla muestra dos botones Editar, uno para perfil y otro para dirección.
- Qué hace QA: Localiza la sección Dirección y dentro de ella busca el botón Editar.
- Resultado: El caso modifica la dirección aunque cambie el orden de las tarjetas.

Secuencia: Ubicar la sección → Acotar el locator → Editar el dato correcto

- getByRole("button", { name:"Guardar" }) identifica una acción clara.
- getByLabel("Correo") conecta con la etiqueta de formulario.
- getByTestId("order-total") usa un identificador destinado a pruebas.
- Refina con filter o .getByRole en un contenedor específico.

## 2. Auto-waiting y reintentos automáticos

Playwright comprueba condiciones de acción como visibilidad y posibilidad de interacción antes de actuar. Las aserciones como toBeVisible o toHaveText reintentan hasta cumplir o agotar tiempo. Esto es distinto de fijar un sleep de 5 segundos, que falla según latencia.

### Auto-wait para realizar acciones

Antes de actuar, Playwright espera las condiciones de interacción que corresponden a la acción. Esa espera ayuda con una interfaz en transición, pero no garantiza por sí sola que el negocio haya finalizado correctamente.

**Ejemplo aplicado**

- Situación: El botón Guardar permanece deshabilitado mientras se valida el formulario.
- Qué hace QA: Completa los campos, ejecuta click sobre el locator y añade después una comprobación de confirmación.
- Resultado: El clic ocurre cuando puede ejecutarse y el test verifica también la respuesta del producto.

Secuencia: Completar los campos → Esperar la interacción → Comprobar la confirmación

### Auto-retry para comprobar resultados

Las aserciones sobre locators vuelven a consultar el estado hasta cumplir la expectativa o agotar su tiempo. Una pausa fija puede ser insuficiente o innecesariamente larga y no expresa la condición deseada.

**Ejemplo aplicado**

- Situación: El aviso Cambios guardados aparece después de responder la API.
- Qué hace QA: Usa una aserción sobre el texto del aviso en vez de dormir dos segundos.
- Resultado: El caso continúa cuando existe la confirmación y falla si nunca llega a mostrarse.

Secuencia: Guardar el perfil → Esperar el aviso → Verificar su texto

- No reemplaces aserciones por page.waitForTimeout().
- Espera un estado observable: URL, texto, respuesta o elemento.
- Evita comprobar detalles que no representen reglas del usuario.

## 3. Locators estrictos y debugging

Si un locator encuentra varios elementos, una acción estricta puede fallar. No lo resuelvas automáticamente con .first(): revisa si el selector expresa el elemento correcto o necesita un contenedor.

### Unicidad como señal de diseño

Una acción que espera un elemento debe tener un locator inequívoco. Una coincidencia múltiple obliga a revisar el alcance o el contrato del selector; first puede ocultar que se eligió el control equivocado.

**Ejemplo aplicado**

- Situación: Un diálogo duplica el botón Guardar que ya existía detrás de él.
- Qué hace QA: Acota la búsqueda al diálogo abierto y comprueba el cambio dentro de ese flujo.
- Resultado: La acción no termina guardando el formulario del fondo por un cambio de orden del DOM.

Secuencia: Detectar duplicados → Acotar al diálogo → Confirmar el destino

### Accesibilidad y estabilidad de las pruebas

Un control con etiqueta y nombre comprensible beneficia a las personas y ofrece un contrato de prueba más claro. Encontrar un botón sin nombre es una oportunidad para revisar el producto junto al equipo.

**Ejemplo aplicado**

- Situación: El formulario tiene un icono de búsqueda que no expone un nombre accesible.
- Qué hace QA: Reporta la falta de nombre y propone una etiqueta que permita reconocer la acción de buscar productos.
- Resultado: El control puede localizarse por intención y el hallazgo se documenta como mejora de accesibilidad.

Secuencia: Inspeccionar el nombre → Acordar la etiqueta → Probar por intención

- Selecciona el botón dentro del modal correspondiente.
- Las etiquetas accesibles mejoran testing y usabilidad.
- Fallas de locator pueden revelar problemas de accesibilidad.

## Ejemplo trabajado: Esperar un mensaje de confirmación

Tras guardar un perfil aparece una alerta con el texto “Cambios guardados”.

### Paso 1 · Localizar Guardar

Buscar botón por rol y nombre. El rol y el nombre permiten expresar qué control desea utilizar la persona.

**Ejemplo aplicado**

- Situación: Tras guardar un perfil aparece una alerta con el texto “Cambios guardados”.
- Qué hace QA: Dentro del formulario de perfil, localiza el botón cuyo nombre accesible es Guardar.
- Resultado: La acción no depende de la clase visual del botón ni de su posición accidental.

Secuencia: Ubicar el formulario → Buscar rol button → Identificar Guardar

### Paso 2 · Esperar la acción

Ejecutar la acción con await. La acción debe esperarse antes de comprobar el resultado para mantener el orden del escenario.

**Ejemplo aplicado**

- Situación: Tras guardar un perfil aparece una alerta con el texto “Cambios guardados”.
- Qué hace QA: Completa Nombre con Ana y espera el clic en Guardar con await.
- Resultado: La comprobación del aviso ocurre después de enviar el cambio del formulario.

Secuencia: Completar Nombre → Guardar con await → Continuar tras la acción

### Paso 3 · Comprobar la alerta

Verificar alerta, no dormir el navegador. Una aserción sobre la condición relevante reemplaza la espera fija y expresa el éxito de la operación.

**Ejemplo aplicado**

- Situación: Tras guardar un perfil aparece una alerta con el texto “Cambios guardados”.
- Qué hace QA: Busca el rol alert y comprueba que su texto sea Cambios guardados.
- Resultado: El caso detecta ausencia o contenido incorrecto del aviso sin usar una pausa fija como prueba de éxito.

Secuencia: Localizar la alerta → Esperar el texto → Comprobar la confirmación

```typescript
import { test, expect } from "@playwright/test";

test("actualiza perfil", async ({ page }) => {
  await page.goto("/perfil");
  await page.getByLabel("Nombre").fill("Ana");
  await page.getByRole("button", { name: "Guardar" }).click();
  await expect(page.getByRole("alert")).toHaveText(
    "Cambios guardados"
  );
});
// /perfil es una ruta ilustrativa; requiere baseURL y una app propia.
```

## Ejercicio de aplicación

Refactoriza cinco selectores CSS frágiles para usar roles, labels y test IDs; documenta cuál es la ventaja de cada cambio.

### Respuesta orientativa

Identifica primero el contrato visible del elemento, prueba unicidad del locator y verifica el comportamiento después de cada acción.

### Error frecuente

Utilizar .nth(2) o waitForTimeout() para “hacer pasar” una prueba sin entender su inestabilidad.

## Autoevaluación

**¿Qué locator favorece una acción por intención de usuario?**

A. div > div:nth-child(3) > button
B. getByRole("button", {name:"Guardar"})
C. XPath absoluto desde html

**Respuesta:** B. Un selector semántico refleja accesibilidad e intención de la interfaz.

## Lecturas adicionales

- [Playwright – Locators](https://playwright.dev/docs/locators)
- [Playwright – Assertions](https://playwright.dev/docs/test-assertions)

---


# Semana 15 — Flujos reales y debugging

Módulo: Automatización con Playwright · Tiempo de lectura: 40 min

> Automatiza situaciones complejas con manejo de pestañas, frames, cargas de archivo y diagnóstico con trazas.

## 1. Iframes, pestañas y formularios

Para iframes usa frameLocator y localiza elementos dentro del frame. Para nuevas pestañas, espera el evento popup o page antes de hacer clic. Para archivos, setInputFiles permite cargar archivos conocidos. No accedas a otra pestaña asumiendo que será siempre la segunda.

### Eventos antes de la acción

Cuando una acción abre una ventana, prepara primero la espera del evento. Si comienzas a escuchar después del clic, puedes perder una respuesta rápida y crear fallos intermitentes.

**Ejemplo aplicado**

- Situación: El botón Ver comprobante abre un recibo en otra pestaña.
- Qué hace QA: Registra waitForEvent para popup, pulsa el botón y espera la nueva página antes de comprobar su URL.
- Resultado: El recibo se valida sin depender de que la ventana tarde suficiente en abrirse.

Secuencia: Escuchar el evento → Abrir el comprobante → Validar la nueva página

### Contextos de interfaz distintos

Un iframe tiene su propio contexto y una carga de archivo necesita datos reproducibles. Trata estas interacciones de forma explícita y valida el resultado, no solo que la acción haya sido aceptada.

**Ejemplo aplicado**

- Situación: Un formulario incluye un iframe de datos y permite adjuntar un comprobante de prueba.
- Qué hace QA: Interactúa con el frame correcto y usa un archivo controlado; después verifica que la carga fue registrada.
- Resultado: El caso no busca elementos en el documento equivocado ni depende de un archivo personal de tu equipo.

Secuencia: Identificar el contexto → Usar datos controlados → Comprobar el registro

- frameLocator("#checkout-frame").getByRole(...).
- page.waitForEvent("popup") junto con el click que abre la pestaña.
- locator.setInputFiles("fixtures/documento.pdf") para cargas.
- Combina comprobaciones de UI con la respuesta de API solo cuando sea útil.

## 2. Observabilidad de errores

Trace Viewer permite estudiar capturas, acciones, red y DOM durante una ejecución fallida. Un buen diagnóstico identifica el motivo: selector equivocado, estado imprevisto, datos compartidos, dependencia de ambiente o defecto del producto.

### Diagnóstico a partir de la traza

La traza muestra en qué paso cambió el comportamiento. Revisa primero el error, las acciones previas y las peticiones relacionadas antes de aumentar timeouts o modificar el caso.

**Ejemplo aplicado**

- Situación: El checkout no muestra la confirmación y el reporte señala una aserción agotada.
- Qué hace QA: Abre la traza, localiza la petición de compra y revisa si devolvió un error antes de la aserción.
- Resultado: El fallo se atribuye a la respuesta del servicio o a la UI con evidencia verificable.

Secuencia: Abrir la traza → Relacionar acción y red → Documentar la causa

### Evidencia utilizable y protegida

Una captura aislada puede no explicar un fallo. Conserva los datos necesarios para reproducirlo y evita distribuir secretos presentes en peticiones o almacenamiento del navegador.

**Ejemplo aplicado**

- Situación: Una traza del login contiene una sesión de un usuario de pruebas.
- Qué hace QA: Comparte únicamente la evidencia autorizada y almacena el artefacto con acceso restringido y duración definida.
- Resultado: El equipo puede investigar sin publicar credenciales ni sesiones reutilizables.

Secuencia: Revisar el artefacto → Proteger datos sensibles → Compartir el diagnóstico

- Configura trace: "on-first-retry" si hay retries.
- Conserva reportes como evidencia, sin secretos.
- Reproduce una falla antes de aumentar timeouts sin criterio.

## 3. Diseñar un E2E de valor

Elige un viaje que importe al negocio, por ejemplo comprar un producto. Prepara sus precondiciones, utiliza datos estables, valida cada transición significativa y verifica resultado final de pedido. Evita que una sola prueba cubra todos los caminos posibles.

### Escenarios E2E con objetivo acotado

Un E2E útil comprueba un recorrido de negocio concreto. Separar variantes ayuda a localizar el fallo y evita que una compra exitosa oculte casos de stock insuficiente o dirección inválida.

**Ejemplo aplicado**

- Situación: El checkout permite comprar, pero debe rechazar un producto agotado y una dirección incompleta.
- Qué hace QA: Diseña tres escenarios independientes con sus precondiciones y resultados esperados.
- Resultado: Cada fallo identifica la variante afectada sin depender de ejecutar las otras dos primero.

Secuencia: Separar variantes → Preparar cada caso → Evaluar cada resultado

### Cobertura según riesgo del recorrido

No todo flujo necesita automatizarse por UI en todas sus combinaciones. Prioriza recorridos críticos y combina niveles para obtener evidencia útil con una suite mantenible.

**Ejemplo aplicado**

- Situación: Una compra combina validación de precios, inventario y confirmación visual.
- Qué hace QA: Comprueba cálculos con pruebas de menor nivel y reserva el E2E para la integración crítica de la compra.
- Resultado: La suite conserva evidencia del recorrido sin repetir por UI cada combinación del cálculo.

Secuencia: Identificar el riesgo → Elegir el nivel → Comprobar el recorrido

- Compra válida.
- Stock insuficiente o carrito vacío.
- Datos de envío inválidos.

## Ejemplo trabajado: Abrir una pestaña nueva de forma segura

Una aplicación de ejemplo abre un comprobante en una pestaña distinta.

### Paso 1 · Escuchar primero

Prepara la escucha del evento antes del click. Una ventana que se abre rápido puede aparecer antes de registrar la espera si el orden es incorrecto.

**Ejemplo aplicado**

- Situación: Una aplicación de ejemplo abre un comprobante en una pestaña distinta.
- Qué hace QA: Crea popupPromise con page.waitForEvent antes de pulsar Ver comprobante.
- Resultado: La escucha queda preparada para capturar el evento que producirá la siguiente acción.

Secuencia: Identificar el evento → Preparar popupPromise → Mantener la espera activa

### Paso 2 · Abrir el comprobante

Realiza la acción que abre el popup. La acción debe corresponder al control que abre la ventana, sin confundirlo con un enlace del mismo nombre en otro contexto.

**Ejemplo aplicado**

- Situación: Una aplicación de ejemplo abre un comprobante en una pestaña distinta.
- Qué hace QA: Pulsa el enlace Ver comprobante y espera la promesa preparada en el paso anterior.
- Resultado: El test obtiene una referencia a la nueva página para comprobarla de forma explícita.

Secuencia: Localizar el enlace → Hacer clic → Obtener la nueva página

### Paso 3 · Validar la nueva página

Espera su carga y valida un título relevante. El fragmento comprueba la URL; en la aplicación real añade el título o identificador acordado para el recibo.

**Ejemplo aplicado**

- Situación: Una aplicación de ejemplo abre un comprobante en una pestaña distinta.
- Qué hace QA: Verifica la ruta comprobante y, cuando la app lo soporte, el encabezado del recibo de ese pedido.
- Resultado: La evidencia confirma el destino y el contenido relevante, no solo que se abrió cualquier pestaña.

Secuencia: Esperar el destino → Revisar la URL → Comprobar el recibo

```typescript
const popupPromise = page.waitForEvent("popup");
await page.getByRole("link", {name:"Ver comprobante"}).click();
const comprobante = await popupPromise;
await expect(comprobante).toHaveURL(/comprobante/);
// Es un fragmento para integrar en un test de una app que lo soporte.
```

## Ejercicio de aplicación

Construye un E2E de carrito y checkout; provoca deliberadamente un fallo y explica qué información obtuviste del trace.

### Respuesta orientativa

Debes poder identificar el paso exacto, el locator, el estado UI y si la causa es del test, datos o producto.

### Error frecuente

Aumentar indiscriminadamente timeout y retries para encubrir un defecto de sincronización.

## Autoevaluación

**¿Qué información ayuda más a investigar un fallo E2E?**

A. Una espera fija de 30 segundos
B. Trace Viewer con pasos, UI y red
C. Ejecutar sin reporter

**Respuesta:** B. Permite reconstruir el estado y la secuencia real de acciones.

## Lecturas adicionales

- [Playwright – Trace Viewer](https://playwright.dev/docs/trace-viewer)
- [Playwright – Frames](https://playwright.dev/docs/frames)

---


# Semana 16 — Configuración y pruebas multiplataforma

Módulo: Automatización con Playwright · Tiempo de lectura: 35 min

> Configura el mismo test para distintos navegadores, ambientes y políticas de reintento sin comprometer su independencia.

## 1. playwright.config.ts

La configuración define testDir, timeout, expect timeout, reporter, use y projects. BaseURL evita repetir dominio en cada test y permite cambiar ambientes. Es importante separar opciones de ejecución local y CI.

### Configuración por responsabilidad

La configuración centraliza directorios, tiempos, baseURL y evidencia. Mantén separados los valores de ambiente y los datos del caso para que un cambio de destino no exija editar todos los escenarios.

**Ejemplo aplicado**

- Situación: La suite debe pasar de una instancia local a un entorno de QA.
- Qué hace QA: Configura baseURL desde una variable validada y usa rutas relativas en los tests.
- Resultado: El mismo escenario funciona contra el destino previsto sin URL de producción incrustada en el código.

Secuencia: Definir el ambiente → Configurar la baseURL → Ejecutar la misma ruta

### Timeouts que expresan una necesidad

El tiempo de una prueba y el de una aserción tienen alcances distintos. Ajustarlos requiere entender la operación y su entorno, porque un valor muy alto puede esconder un problema de respuesta.

**Ejemplo aplicado**

- Situación: Un reporte demora más que un formulario sencillo en un ambiente de pruebas.
- Qué hace QA: Mide la operación, define un tiempo justificado para ella y conserva evidencia si se supera.
- Resultado: La suite tolera la espera acordada sin volver lentos todos los fallos de la aplicación.

Secuencia: Medir la operación → Ajustar su límite → Diagnosticar el exceso

- testDir: directorio de especificaciones.
- use.baseURL: dominio base del ambiente.
- use.trace: política de trazas.
- projects: navegadores y perfiles diferentes.

## 2. Cross-browser con sentido

Chromium, Firefox y WebKit implementan motores distintos. Prueba flujos de riesgo en navegadores relevantes para el producto. No necesitas correr cada caso trivial en cada navegador si el costo supera el valor, pero la decisión debe ser explícita.

### Proyectos para navegadores relevantes

Los proyectos permiten ejecutar una suite con distintas configuraciones de navegador. Decide la matriz según el público y el riesgo; tener tres navegadores no sustituye las pruebas de accesibilidad o experiencia real.

**Ejemplo aplicado**

- Situación: El producto admite usuarios de Chromium, Firefox y Safari.
- Qué hace QA: Configura los proyectos de Chromium, Firefox y WebKit y verifica los recorridos críticos en cada uno.
- Resultado: Un fallo específico de motor queda asociado a su proyecto y puede investigarse por separado.

Secuencia: Definir la matriz → Ejecutar los proyectos → Comparar los resultados

### Paralelismo con datos independientes

Varios proyectos o workers pueden usar el mismo servidor al mismo tiempo. El aislamiento del navegador no evita colisiones si todas las pruebas modifican el mismo usuario, pedido o carrito remoto.

**Ejemplo aplicado**

- Situación: Chromium y Firefox intentan editar el mismo perfil simultáneamente.
- Qué hace QA: Asigna usuarios o identificadores únicos por ejecución y limpia solo los registros propios.
- Resultado: El resultado no depende de cuál navegador escribió por última vez en el perfil compartido.

Secuencia: Crear datos únicos → Ejecutar en paralelo → Limpiar solo lo propio

- La matriz de cobertura depende de tus usuarios y contratos.
- Las capturas o trazas de un navegador no representan todos.
- Aísla datos que puedan colisionar en ejecuciones simultáneas.

## 3. Test isolation y retries

Cada test debe disponer de estado inicial controlado. Hooks y fixtures ayudan a prepararlo; una prueba no debe requerir que otra corra primero. Los retries ayudan a diagnosticar una falla intermitente, pero no reemplazan su corrección.

### Fixtures que delimitan el estado

Una fixture prepara lo que el caso necesita y libera sus recursos al terminar. Define su alcance con cuidado para que reutilizar preparación no implique compartir estado mutable entre pruebas.

**Ejemplo aplicado**

- Situación: Cada escenario necesita una sesión nueva de un cliente de demostración.
- Qué hace QA: Prepara el cliente con una fixture de alcance de test y evita almacenar el carrito en una variable global.
- Resultado: Cada ejecución comienza en una condición conocida aunque cambie el orden de los tests.

Secuencia: Preparar la fixture → Usar un estado propio → Liberar sus recursos

### Retries como evidencia de inestabilidad

Un reintento puede distinguir un fallo persistente de uno intermitente, pero no corrige su causa. Conserva el primer fallo y registra qué cambió entre intentos para no normalizar una suite inestable.

**Ejemplo aplicado**

- Situación: Una prueba falla al primer intento y pasa al repetirla en CI.
- Qué hace QA: Examina ambas ejecuciones, registra el caso como inestable e investiga datos, selectores y tiempos.
- Resultado: El reporte conserva la señal de inestabilidad en vez de declarar que el problema desapareció.

Secuencia: Conservar el primer fallo → Comparar el reintento → Investigar la causa

- Evita compartir el mismo usuario mutable en tests paralelos.
- Diferencia test flaky de falla reproducible del producto.
- Ejecuta casos individualmente y en conjunto para revelar acoplamientos.

## Ejemplo trabajado: Configuración multiplataforma

Una suite pequeña valida login en Chromium, Firefox y WebKit.

### Paso 1 · Declarar la configuración

Importa defineConfig y devices. defineConfig ayuda con el contrato de configuración y devices aporta perfiles predefinidos de navegador.

**Ejemplo aplicado**

- Situación: Una suite pequeña valida login en Chromium, Firefox y WebKit.
- Qué hace QA: Importa ambos desde @playwright/test y revisa que el archivo sea reconocido por el runner.
- Resultado: La configuración usa los tipos y perfiles disponibles en la versión instalada del proyecto.

Secuencia: Importar defineConfig → Importar devices → Verificar el archivo

### Paso 2 · Definir proyectos y reporte

Define tres projects y reporter HTML. Cada proyecto identifica una combinación de ejecución y permite localizar fallos específicos de un navegador.

**Ejemplo aplicado**

- Situación: Una suite pequeña valida login en Chromium, Firefox y WebKit.
- Qué hace QA: Configura Chromium, Firefox y WebKit y el reporter HTML con los nombres del ejemplo.
- Resultado: Los resultados se presentan por proyecto y el reporte permite compararlos.

Secuencia: Configurar navegadores → Asignar sus nombres → Activar reporte HTML

### Paso 3 · Aislar una combinación

Ejecuta solo una combinación para depurar. Ejecutar un proyecto específico reduce ruido durante el diagnóstico sin cambiar el alcance total de la suite.

**Ejemplo aplicado**

- Situación: Una suite pequeña valida login en Chromium, Firefox y WebKit.
- Qué hace QA: Usa --project=chromium para investigar el caso y después ejecuta la matriz prevista para validar el cambio.
- Resultado: El diagnóstico se concentra en una combinación y la revisión final conserva la cobertura acordada.

Secuencia: Seleccionar Chromium → Investigar el caso → Revisar la matriz completa

```typescript
import { defineConfig, devices } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  use: { baseURL: "https://www.saucedemo.com" },
  reporter: "html",
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } }
  ]
});
// npx playwright test --project=chromium
```

## Ejercicio de aplicación

Configura tres navegadores; ejecuta una smoke suite; investiga una diferencia y documenta si es defecto o particularidad del motor.

### Respuesta orientativa

Comprueba que las pruebas aisladas terminan correctamente sin depender del orden. Documenta ambiente, navegador y artefacto de fallo.

### Error frecuente

Hacer que test B dependa del login o los datos creados por test A.

## Autoevaluación

**¿Qué propiedad caracteriza un test independiente?**

A. Se ejecuta únicamente después de otro
B. Puede preparar sus datos y pasar individualmente
C. Comparte estados globales de usuario

**Respuesta:** B. La independencia hace posible paralelizar y depurar de forma confiable.

## Lecturas adicionales

- [Playwright – Configuration](https://playwright.dev/docs/test-configuration)
- [Playwright – Projects](https://playwright.dev/docs/test-projects)

---


# Semana 17 — Page Object Model y modularidad

Módulo: Framework y automatización API · Tiempo de lectura: 40 min

> El diseño del framework determina cuánto cuesta mantener cada caso cuando cambia la aplicación.

## 1. Qué resuelve Page Object Model

Page Object Model (POM) encapsula los locators y operaciones de una pantalla o componente. Los tests describen el flujo y sus expectativas, mientras la clase de página conoce cómo interactuar con la UI. Esta separación reduce duplicación y mejora la refactorización.

### POM separa interacción y expectativa

Un Page Object conoce los controles y las acciones de una pantalla. El escenario conserva la intención y decide qué resultado de negocio esperar; esta separación permite cambiar un formulario sin reescribir sus casos.

**Ejemplo aplicado**

- Situación: Cinco pruebas utilizan el mismo formulario de acceso y cambia el campo de usuario.
- Qué hace QA: Actualiza el locator en LoginPage y conserva en cada test la expectativa de acceso o rechazo que le corresponde.
- Resultado: El cambio de interfaz se concentra en una clase sin borrar las diferencias entre escenarios.

Secuencia: Encapsular el formulario → Actualizar el locator → Verificar los escenarios

### Operaciones con significado de negocio

Un método como iniciarSesion explica mejor la intención que una cadena de clics dispersos. Evita esconder decisiones del caso dentro de una operación demasiado amplia que también crea datos y valida todo el producto.

**Ejemplo aplicado**

- Situación: El escenario de usuario bloqueado comparte formulario con el login exitoso.
- Qué hace QA: Expón una acción de ingreso reutilizable y comprueba el mensaje de bloqueo desde el escenario correspondiente.
- Resultado: La acción se reutiliza y el resultado esperado de cada usuario sigue visible al leer el test.

Secuencia: Nombrar la operación → Reutilizar la interacción → Conservar la expectativa

- Una LoginPage conoce usuario, contraseña y botón de acceso.
- El test decide qué escenario ejecutar y qué resultado de negocio comprobar.
- Evita clases gigantes que mezclen navegación, APIs, datos y todas las aserciones.

## 2. Principios de diseño aplicados

Responsabilidad única, bajo acoplamiento y nombres expresivos son más valiosos que una estructura con muchas carpetas. No conviertas cada click en una capa de abstracción vacía; reutiliza interacciones con significado de negocio.

### Responsabilidad única aplicada

Una clase pequeña resulta más fácil de cambiar cuando tiene un motivo claro para hacerlo. Divide componentes con comportamiento propio y evita una página base que termine controlando APIs, datos y todas las pantallas.

**Ejemplo aplicado**

- Situación: Una clase de tienda incluye login, pagos, inventario y creación de usuarios por API.
- Qué hace QA: Separa las interacciones por pantalla y mueve la preparación de usuarios a una fixture o cliente de API.
- Resultado: Modificar pagos ya no exige revisar responsabilidades ajenas al checkout.

Secuencia: Detectar responsabilidades → Separar las piezas → Revisar el acoplamiento

### Abstracciones que reducen mantenimiento

Una abstracción aporta valor cuando elimina duplicación relevante sin ocultar el flujo. Medirla por el número de carpetas o helpers favorece capas vacías que vuelven difícil investigar un fallo.

**Ejemplo aplicado**

- Situación: Para comprender un clic hay que abrir cinco helpers que solo reenvían argumentos.
- Qué hace QA: Conserva la API de Playwright donde es clara y extrae únicamente acciones del dominio compartidas.
- Resultado: El test se comprende desde su escenario y conserva un punto claro para cambiar la interacción.

Secuencia: Localizar la duplicación → Extraer lo significativo → Leer el escenario completo

- Prefiere loginPage.iniciarSesion(...) a util.click("#btn1").
- Declara locators dentro del Page Object.
- Mantén valores específicos del escenario en el test o los datos de prueba.

## 3. Cuándo considerar Screenplay

Screenplay describe actores, habilidades, tareas, interacciones y preguntas. Puede ayudar en procesos complejos y multiplataforma, pero añade conceptos que conviene dominar después de escribir una suite idiomática de Playwright. En un producto pequeño POM suele ser suficiente.

### Screenplay como modelo de comportamiento

Screenplay organiza actores, habilidades, tareas y preguntas. Es útil si ese vocabulario ayuda a expresar recorridos complejos; antes de adoptarlo, el equipo debe comprender el costo de sus nuevas abstracciones.

**Ejemplo aplicado**

- Situación: Un comprador consulta inventario por API y después compra mediante la interfaz.
- Qué hace QA: Modela las capacidades del actor y separa la tarea Comprar de la pregunta sobre el total mostrado.
- Resultado: El flujo expresa quién actúa, qué hace y qué estado comprueba sin mezclar esos conceptos.

Secuencia: Definir el actor → Ejecutar la tarea → Responder la pregunta

### Elegir un patrón por su contexto

POM y Screenplay son alternativas de organización, no metas de certificación del código. Compara legibilidad, experiencia del equipo y esfuerzo de cambio usando un recorrido pequeño antes de migrar toda la suite.

**Ejemplo aplicado**

- Situación: Dos personas mantienen veinte pruebas de una aplicación con tres pantallas.
- Qué hace QA: Implementa una muestra con POM y evalúa si otro patrón resuelve un problema real de esos recorridos.
- Resultado: La decisión se justifica por mantenimiento y comprensión, sin añadir conceptos que el equipo no necesita.

Secuencia: Analizar la suite → Probar una alternativa → Justificar la decisión

- Actor ejecuta una tarea del dominio.
- Pregunta evalúa un estado observable.
- Compara costo de abstracción con el valor real para el equipo.

## Ejemplo trabajado: Separación entre Page Object y test

El test determina el comportamiento esperado. La página encapsula el formulario.

### Paso 1 · Encapsular el formulario

Crea una clase para LoginPage. La clase recibe la Page y concentra el conocimiento de los controles del login.

**Ejemplo aplicado**

- Situación: El test determina el comportamiento esperado. La página encapsula el formulario.
- Qué hace QA: Crea LoginPage con su constructor y el método abrir, sin incluir expectativas de todos los escenarios.
- Resultado: La clase sabe interactuar con la pantalla y el test conserva la decisión de qué comportamiento espera.

Secuencia: Recibir la Page → Definir los controles → Abrir el formulario

### Paso 2 · Exponer iniciarSesion

Expón un método iniciarSesion(usuario, clave). El nombre expresa la intención del usuario y los parámetros mantienen los datos del escenario fuera de la clase.

**Ejemplo aplicado**

- Situación: El test determina el comportamiento esperado. La página encapsula el formulario.
- Qué hace QA: Implementa el ingreso de usuario y clave y espera el clic de acceso.
- Resultado: La misma operación puede utilizarse con usuarios válidos o inválidos sin cambiar sus datos internos.

Secuencia: Recibir las credenciales → Completar los campos → Enviar el formulario

### Paso 3 · Validar desde el test

Usa la clase desde el test y valida la URL con expect. La expectativa del catálogo pertenece al caso exitoso y no a cualquier uso de la página.

**Ejemplo aplicado**

- Situación: El test determina el comportamiento esperado. La página encapsula el formulario.
- Qué hace QA: Instancia LoginPage, ejecuta el acceso del usuario demo y comprueba inventory.html con expect.
- Resultado: La interacción se reutiliza y el resultado esperado sigue visible en el escenario.

Secuencia: Instanciar LoginPage → Ejecutar iniciarSesion → Comprobar el catálogo

```typescript
import { test, expect, type Page } from "@playwright/test";

class LoginPage {
  constructor(private page: Page) {}
  async abrir() { await this.page.goto("https://www.saucedemo.com/"); }
  async iniciarSesion(usuario: string, clave: string) {
    await this.page.getByPlaceholder("Username").fill(usuario);
    await this.page.getByPlaceholder("Password").fill(clave);
    await this.page.getByRole("button", {name:"Login"}).click();
  }
}
test("usuario entra al catálogo", async ({ page }) => {
  const login = new LoginPage(page);
  await login.abrir();
  await login.iniciarSesion("standard_user", "secret_sauce");
  await expect(page).toHaveURL(/inventory\.html/);
});
```

## Ejercicio de aplicación

Refactoriza cinco pruebas E2E para utilizar LoginPage y ProductsPage; revisa qué código se duplicó menos y dónde quedaron las validaciones.

### Respuesta orientativa

Locators y acciones de pantalla viven en Page Objects; escenarios y aserciones de negocio quedan en tests salvo justificación concreta.

### Error frecuente

Crear helpers que ocultan la intención del test y obligan a abrir cinco archivos para comprenderlo.

## Autoevaluación

**¿Qué responsabilidad corresponde normalmente a un Page Object?**

A. Decidir todos los riesgos del proyecto
B. Encapsular locators e interacciones de una pantalla
C. Gestionar la pipeline de CI

**Respuesta:** B. POM separa el cómo interactuar con la UI del escenario que se desea probar.

## Lecturas adicionales

- [Playwright – Page Object Models](https://playwright.dev/docs/pom)

---


# Semana 18 — Fixtures y datos de prueba

Módulo: Framework y automatización API · Tiempo de lectura: 40 min

> Las fixtures ayudan a aislar cada test, preparar datos y limpiar recursos de forma repetible.

## 1. Concepto de fixture

Una fixture proporciona objetos o recursos que el test necesita: página, cliente API, usuario de prueba o componente. Playwright incluye page, context, browser y request. Las fixtures personalizadas se definen con test.extend y se consumen por nombre.

### Preparación bajo demanda

Una fixture entrega una dependencia a las pruebas que la solicitan. Mantén claros sus requisitos y evita preparar todos los datos del sistema para un caso que solo necesita un usuario.

**Ejemplo aplicado**

- Situación: Un test de perfil requiere un usuario y otro de catálogo no necesita autenticación.
- Qué hace QA: Crea una fixture de usuario y úsala únicamente en los casos que necesitan esa precondición.
- Resultado: La prueba de catálogo no realiza preparaciones innecesarias ni depende del servicio de login.

Secuencia: Declarar la dependencia → Preparar lo solicitado → Ejecutar el caso

### Elegir alcance de test o worker

El alcance define cuánto vive una fixture. Compartir un recurso por worker puede ser apropiado para configuración costosa, pero los datos mutables requieren una estrategia explícita de aislamiento.

**Ejemplo aplicado**

- Situación: Varios tests de un worker agregan artículos al carrito de un mismo usuario.
- Qué hace QA: Usa un carrito propio por caso o restaura un estado conocido sin afectar los demás escenarios.
- Resultado: La ejecución paralela no cambia las precondiciones de otro test.

Secuencia: Revisar el estado compartido → Delimitar su alcance → Comprobar el aislamiento

- La fixture se crea cuando se usa (bajo demanda).
- El alcance por test favorece aislamiento.
- Puedes preparar antes de await use(...) y limpiar después.

## 2. Estado autenticado y datos

storageState permite reutilizar datos de sesión de manera controlada. Un estado de autenticación puede contener cookies o tokens sensibles: no lo subas a repositorios públicos. Para pruebas que modifican información usa usuarios distintos o restablece los datos entre ejecuciones.

### storageState acelera una precondición

Un estado de autenticación guardado puede evitar repetir el login en cada prueba. Utilízalo para casos cuyo objetivo no es el acceso y mantén pruebas específicas que sí validen el formulario de autenticación.

**Ejemplo aplicado**

- Situación: Veinte tests de pedidos solo requieren una sesión ya establecida.
- Qué hace QA: Reutiliza un estado válido para esos casos y conserva un test independiente del flujo de login.
- Resultado: La suite ahorra preparación sin dejar de comprobar el mecanismo de acceso.

Secuencia: Preparar una sesión → Reutilizarla con criterio → Probar el login aparte

### Sesiones y datos necesitan protección

El estado guardado puede contener credenciales reutilizables. Exclúyelo del repositorio, limita su vigencia y evita que una sesión compartida dé acceso a datos de producción durante las pruebas.

**Ejemplo aplicado**

- Situación: El archivo de autenticación aparece entre los cambios pendientes de Git.
- Qué hace QA: Retíralo del conjunto publicable, configura su exclusión y genera las sesiones en el entorno autorizado.
- Resultado: El repositorio contiene instrucciones de preparación y no una sesión que otra persona pueda reutilizar.

Secuencia: Inspeccionar los archivos → Excluir la sesión → Generarla por ambiente

- Guarda sesiones en carpetas ignoradas por Git.
- Usa usuarios de pruebas y ambientes no productivos.
- Evita dependencia de un registro creado por otro test.

## 3. Setup, teardown y diseño de datos

El setup crea condiciones conocidas; teardown libera recursos cuando corresponde. Para suites paralelas considera datos únicos, limpieza e idempotencia. Un test confiable no depende de residuos de ejecuciones anteriores.

### Datos únicos y limpieza propia

Una buena preparación crea registros identificables por ejecución. La limpieza debe eliminar únicamente esos datos y poder repetirse sin borrar información compartida o fallar por un registro que ya no existe.

**Ejemplo aplicado**

- Situación: Dos pipelines crean un usuario con el mismo correo fijo.
- Qué hace QA: Genera un identificador de ejecución, registra los ids creados y elimina solo esos registros al terminar.
- Resultado: Las ejecuciones no colisionan ni necesitan borrar todos los usuarios del ambiente.

Secuencia: Crear identificadores únicos → Registrar los recursos → Limpiar por identidad

### Conservar evidencia antes de limpiar

La liberación de recursos no debe borrar la única evidencia de un fallo. Recoge el estado relevante antes del teardown y registra también si la limpieza falló para no perder problemas de infraestructura.

**Ejemplo aplicado**

- Situación: Un pedido queda en estado inesperado al fallar la prueba de compra.
- Qué hace QA: Adjunta el id y el estado permitido del pedido al reporte antes de ejecutar su limpieza.
- Resultado: El equipo puede investigar lo ocurrido aunque los datos temporales ya no estén en el servidor.

Secuencia: Capturar el estado → Adjuntar la evidencia → Liberar los recursos

- Crea un pedido vía API antes del test si es posible.
- Elimina o invalida recursos al cerrar.
- Si el teardown falla, conserva evidencia para investigar.

## Ejemplo trabajado: Fixture propia para usuario de práctica

La fixture entrega credenciales no sensibles y aisladas para tests de SauceDemo.

### Paso 1 · Extender el test base

Importa test como base. El alias diferencia el test original de la versión que incorporará las dependencias de práctica.

**Ejemplo aplicado**

- Situación: La fixture entrega credenciales no sensibles y aisladas para tests de SauceDemo.
- Qué hace QA: Importa test como base y conserva expect desde el mismo paquete de Playwright.
- Resultado: La extensión parte del runner habitual sin crear un mecanismo paralelo de ejecución.

Secuencia: Importar test base → Conservar expect → Preparar la extensión

### Paso 2 · Tipar la fixture

Define el tipo de fixture. El tipo declara qué propiedades recibirá el consumidor y evita depender de nombres implícitos.

**Ejemplo aplicado**

- Situación: La fixture entrega credenciales no sensibles y aisladas para tests de SauceDemo.
- Qué hace QA: Define Fixtures con usuarioDemo y sus campos user y pass antes de llamar a base.extend.
- Resultado: El compilador puede detectar que un test intente utilizar un campo no declarado.

Secuencia: Nombrar usuarioDemo → Tipar sus propiedades → Extender el contrato

### Paso 3 · Inyectar datos de demostración

Inyecta el objeto al test mediante el argumento. El objeto local es independiente por fixture; las credenciales públicas de SauceDemo no representan cuentas remotas exclusivas por ejecución.

**Ejemplo aplicado**

- Situación: La fixture entrega credenciales no sensibles y aisladas para tests de SauceDemo.
- Qué hace QA: Recibe usuarioDemo en el test y comprueba su nombre sin publicar credenciales privadas ni asumir aislamiento del servidor demo.
- Resultado: El ejemplo ilustra la inyección tipada; una suite real necesita además usuarios o datos remotos aislados.

Secuencia: Entregar mediante use → Recibir usuarioDemo → Validar el dato inyectado

```typescript
import { test as base, expect } from "@playwright/test";

type Fixtures = { usuarioDemo: {user:string; pass:string} };
export const test = base.extend<Fixtures>({
  usuarioDemo: async ({}, use) => {
    await use({user:"standard_user", pass:"secret_sauce"});
  }
});

test("datos de prueba disponibles", async ({ usuarioDemo }) => {
  expect(usuarioDemo.user).toBe("standard_user");
});
```

## Ejercicio de aplicación

Implementa una fixture para preparar una cuenta de prueba y otra para abrir una página autenticada; explica cómo gestionas la limpieza.

### Respuesta orientativa

Usa test.extend, prepara recursos antes de use y libera después; documenta riesgos si una sesión se comparte.

### Error frecuente

Guardar storageState con tokens reales en GitHub o crear pruebas que compitan por modificar el mismo usuario.

## Autoevaluación

**¿Qué ventaja aportan fixtures con alcance por test?**

A. Estado mutable compartido
B. Preparación y aislamiento controlados
C. Eliminar las aserciones

**Respuesta:** B. Evitan acoplamientos y pueden gestionar recursos antes y después de cada ejecución.

## Lecturas adicionales

- [Playwright – Test fixtures](https://playwright.dev/docs/test-fixtures)
- [Playwright – Authentication](https://playwright.dev/docs/auth)

---


# Semana 19 — Automatización API con Playwright

Módulo: Framework y automatización API · Tiempo de lectura: 40 min

> Playwright permite probar API REST y usar la API para preparar datos de pruebas UI.

## 1. APIRequestContext en Playwright

La fixture request ofrece un cliente HTTP para hacer peticiones GET, POST, PUT, PATCH y DELETE desde tests. Puedes validar estado, encabezados y cuerpo JSON con expect. Las respuestas y sus datos deben interpretarse según el contrato publicado, no según suposiciones.

### Petición y respuesta completas

Una prueba de API valida el estado, las cabeceras relevantes y el cuerpo según el contrato. Obtener JSON sin revisar el código puede tratar una respuesta de error como si fuera una entidad correcta.

**Ejemplo aplicado**

- Situación: GET de un usuario existente debe responder 200 con su identificador.
- Qué hace QA: Ejecuta la petición, comprueba el estado esperado y después valida los campos del JSON.
- Resultado: El caso detecta tanto una respuesta HTTP incorrecta como un usuario distinto al solicitado.

Secuencia: Enviar la petición → Comprobar el estado → Validar el cuerpo

### Autenticación y autorización diferenciadas

Autenticarse indica quién realiza la petición; la autorización decide qué puede hacer. Diseña variantes por rol y recurso para evitar que un token válido se convierta en acceso a datos de otras cuentas.

**Ejemplo aplicado**

- Situación: Un estudiante intenta consultar por API el perfil privado de otro estudiante.
- Qué hace QA: Usa usuarios controlados y comprueba que el contrato rechaza el acceso al recurso ajeno.
- Resultado: El caso descubre exposición de datos aunque el token del solicitante sea válido.

Secuencia: Preparar dos usuarios → Solicitar un recurso ajeno → Verificar el rechazo

- request.get("/recurso") envía una consulta.
- request.post("/recurso", {data:{...}}) envía JSON.
- response.ok() indica estado exitoso 2xx.
- response.json() es asíncrono: utiliza await.

## 2. Separar contratos de comportamiento

Una prueba de API puede cubrir autenticación, validación, reglas del dominio y estados de error. Las validaciones de esquema no reemplazan escenarios de negocio: un saldo numérico puede ser incorrecto aunque pase el contrato.

### Estructura y reglas de negocio

Un esquema puede comprobar tipos y campos, pero no siempre expresa relaciones de negocio. Complementa la estructura con invariantes que comparen importes, estados y datos relacionados.

**Ejemplo aplicado**

- Situación: Un pedido incluye subtotal 100, impuesto 19 y total 100.
- Qué hace QA: Valida que los campos son numéricos y que el total cumple la regla subtotal más impuesto.
- Resultado: La prueba identifica un total incorrecto aunque el JSON tenga todos sus campos y tipos.

Secuencia: Validar la estructura → Calcular lo esperado → Comparar el total

### Variantes y efectos secundarios

Una respuesta correcta no basta si la operación deja un estado incorrecto. Cuando el contrato lo exige, consulta el recurso afectado y comprueba también que las entradas inválidas no hayan creado registros parciales.

**Ejemplo aplicado**

- Situación: Crear un pedido sin productos debe rechazarse y no persistir un pedido vacío.
- Qué hace QA: Envía la entrada inválida y comprueba, con los medios autorizados, que no existe un registro asociado al intento.
- Resultado: El caso detecta escrituras parciales que una comprobación exclusiva del status no mostraría.

Secuencia: Enviar datos inválidos → Verificar la respuesta → Revisar el efecto

- Prueba respuestas 2xx y los errores documentados.
- Comprueba tipos, límites y relaciones entre propiedades.
- Verifica efectos persistentes cuando es relevante.

## 3. API como herramienta de preparación de UI

Crear un usuario, pedido o carrito vía API suele ser más rápido que recorrer la interfaz para cada precondición. Reserva la UI para el comportamiento que realmente quieres verificar. Elimina los datos al terminar si aplica.

### Preparar por API para probar la UI

Crear precondiciones por API reduce pasos de interfaz cuando el objetivo del caso está después de la creación. Mantén el flujo de creación por UI en sus propios tests si también necesita cobertura.

**Ejemplo aplicado**

- Situación: El caso debe verificar que un pedido enviado aparece en el historial.
- Qué hace QA: Crea un pedido de prueba por API y abre el historial para validar el estado y el id.
- Resultado: El escenario comprueba el historial sin depender de completar el checkout en cada ejecución.

Secuencia: Crear la precondición → Abrir el historial → Contrastar el pedido

### Ambiente y limpieza explícitos

Un cliente de API de pruebas debe usar un destino permitido, credenciales de prueba y datos identificables. Documenta las dependencias externas para distinguir un fallo del producto de una caída del servicio de ejemplo.

**Ejemplo aplicado**

- Situación: Un tutorial consulta JSONPlaceholder y requiere acceso a Internet.
- Qué hace QA: Declara esa dependencia, valida el usuario esperado y evita usar el mismo cliente para modificar sistemas reales.
- Resultado: La ejecución informa si el servicio de ejemplo no está accesible y mantiene separado el ambiente del producto.

Secuencia: Identificar el destino → Ejecutar con datos de prueba → Informar la dependencia

- Usa datos únicos por test.
- Aísla tokens y URLs de ambiente.
- Documenta cualquier dependencia de servicio externo.

## Ejemplo trabajado: Prueba API sencilla con request

Una API pública de ejemplo devuelve registros de usuarios por identificador; en un proyecto real verifica el contrato.

### Paso 1 · Consultar el recurso

Envía un GET. El destino es un servicio público de práctica y su disponibilidad es una dependencia externa del ejemplo.

**Ejemplo aplicado**

- Situación: Una API pública de ejemplo devuelve registros de usuarios por identificador; en un proyecto real verifica el contrato.
- Qué hace QA: Envía request.get a users/1 de JSONPlaceholder y conserva la respuesta para las comprobaciones.
- Resultado: La petición se dirige al usuario de ejemplo y no a un recurso de producción propio.

Secuencia: Elegir users/1 → Enviar el GET → Recibir la respuesta

### Paso 2 · Revisar éxito HTTP

Comprueba estado exitoso. ok comprueba el rango exitoso; si el contrato exige exactamente 200, añade una aserción específica de ese estado.

**Ejemplo aplicado**

- Situación: Una API pública de ejemplo devuelve registros de usuarios por identificador; en un proyecto real verifica el contrato.
- Qué hace QA: Evalúa respuesta.ok y distingue un fallo HTTP de una diferencia del usuario retornado.
- Resultado: El reporte identifica si la petición fue exitosa antes de evaluar las propiedades del cuerpo.

Secuencia: Leer el estado → Comprobar el rango → Continuar con el cuerpo

### Paso 3 · Comprobar identidad y campos

Lee JSON y valida campos relevantes. La presencia de un objeto no asegura que corresponda al usuario solicitado.

**Ejemplo aplicado**

- Situación: Una API pública de ejemplo devuelve registros de usuarios por identificador; en un proyecto real verifica el contrato.
- Qué hace QA: Espera respuesta.json y comprueba id igual a 1 y email de tipo string según el ejemplo.
- Resultado: Una respuesta de otro usuario o sin correo con el tipo acordado hace fallar la prueba.

Secuencia: Interpretar el JSON → Comparar el id → Verificar el tipo de email

```typescript
import { test, expect } from "@playwright/test";

test("GET usuario de práctica", async ({ request }) => {
  const respuesta = await request.get(
    "https://jsonplaceholder.typicode.com/users/1"
  );
  expect(respuesta.ok()).toBeTruthy();
  const body = await respuesta.json();
  expect(body).toMatchObject({ id: 1 });
  expect(typeof body.email).toBe("string");
});
// El ejemplo requiere conexión a internet.
```

## Ejercicio de aplicación

Crea ocho pruebas API sobre un servicio de práctica: positivos, no encontrado, estructura y entradas inválidas, más una preparación API→UI.

### Respuesta orientativa

Adapta respuestas esperadas a la documentación del servicio. Para los datos UI, prepara la entidad por API y valida su representación posterior.

### Error frecuente

Depender de APIs públicas para toda tu suite CI: su disponibilidad y datos no están bajo tu control.

## Autoevaluación

**¿Para qué sirve la fixture request?**

A. Controlar únicamente el DOM
B. Realizar peticiones HTTP desde pruebas Playwright
C. Diseñar mockups visuales

**Respuesta:** B. Proporciona un APIRequestContext para validar servicios y preparar datos.

## Lecturas adicionales

- [Playwright – API testing](https://playwright.dev/docs/api-testing)

---


# Semana 20 — Mocks, ambientes y arquitectura avanzada

Módulo: Framework y automatización API · Tiempo de lectura: 40 min

> Usa mocks de manera deliberada, configura ambientes y protege secretos sin perder representatividad de las pruebas.

## 1. Intercepción y mocking de red

page.route permite interceptar solicitudes y responder con datos simulados. Es útil para reproducir fallos del servidor, listas vacías o errores difíciles de crear. Pero una prueba con mock no demuestra integración real: necesitas un conjunto complementario de pruebas contra servicios reales.

### Mocks para controlar condiciones

Una respuesta simulada permite reproducir un estado difícil o costoso de preparar. Debe representar un contrato conocido y su resultado demuestra cómo responde la UI a esa simulación, no la salud del servicio real.

**Ejemplo aplicado**

- Situación: El catálogo necesita probar su aviso cuando la API devuelve una lista vacía.
- Qué hace QA: Intercepta la petición antes de navegar y devuelve una lista vacía conforme al contrato.
- Resultado: La interfaz muestra el estado vacío, mientras la integración real requiere otra prueba.

Secuencia: Definir la condición → Interceptar la petición → Comprobar el estado vacío

### fulfill, continue y abort según el objetivo

Las rutas pueden responder con datos simulados, dejar continuar la petición o provocar un fallo de transporte. Elige la variante que corresponda al comportamiento que deseas ejercitar y evita simular un error distinto del real.

**Ejemplo aplicado**

- Situación: El producto debe mostrar un mensaje recuperable ante una desconexión.
- Qué hace QA: Simula el fallo de red y comprueba la opción de reintentar, diferenciándolo de un 500 HTTP.
- Resultado: El test verifica el manejo de desconexión con un estímulo que representa esa condición.

Secuencia: Elegir el fallo → Simular la condición → Verificar la recuperación

- route.fulfill puede suministrar un body controlado.
- route.continue permite seguir con la petición.
- route.abort simula ciertas fallas de red.
- Documenta claramente qué pruebas usan mocks.

## 2. Configuración por ambientes

Separa URLs, usuarios y parámetros de ejecución entre local, QA y staging. Aplica variables de entorno y validaciones de configuración. No hardcodees secretos en archivos de pruebas o logs de la pipeline.

### Configuración sin secretos incrustados

Las variables separan el ambiente del código. Valida las obligatorias al iniciar y proporciona un ejemplo con nombres y valores ficticios para que otra persona configure el entorno correctamente.

**Ejemplo aplicado**

- Situación: La suite necesita una baseURL y un token del ambiente de QA.
- Qué hace QA: Lee los valores desde la configuración y rechaza la ejecución si falta el destino requerido.
- Resultado: El test no cae por accidente en producción ni publica un token dentro del repositorio.

Secuencia: Declarar variables → Validar el destino → Ejecutar con configuración

### Datos y configuración por separado

El destino del servidor pertenece al ambiente; los productos y resultados esperados pertenecen al escenario. Mezclarlos dificulta cambiar de entorno y puede hacer que el test valide su propio mock sin intención clara.

**Ejemplo aplicado**

- Situación: Un mismo caso de catálogo debe ejecutarse localmente y en QA con un producto conocido.
- Qué hace QA: Mantén la URL configurable y documenta qué producto controlado necesita la precondición del caso.
- Resultado: Cambiar el ambiente no modifica la regla de negocio que comprueba el escenario.

Secuencia: Separar destino y datos → Preparar el producto → Mantener la expectativa

- process.env.BASE_URL ?? "http://localhost:3000"
- Falla temprano si falta una variable obligatoria.
- Nunca imprimas Authorization o cookies en evidencias públicas.

## 3. Elegir abstracciones avanzadas

Antes de agregar capas, pregunta qué repetición eliminarán, cuánto costará mantenerlas y quién las comprenderá. POM es una buena base; Screenplay puede aportar valor en dominios con interacciones de negocio reutilizadas, pero no es un requisito de Playwright.

### Abstracciones ajustadas a la suite

La arquitectura debe facilitar cambios y diagnóstico. Empieza con piezas reconocibles y añade patrones cuando aparezca un problema concreto de duplicación, dependencia o legibilidad.

**Ejemplo aplicado**

- Situación: La suite tiene cinco casos sencillos y una capa adicional oculta cada llamada a Playwright.
- Qué hace QA: Revisa el flujo completo y conserva solo las abstracciones que agrupan una operación significativa.
- Resultado: El equipo puede localizar una interacción fallida sin recorrer capas que no añaden comportamiento.

Secuencia: Leer el recorrido → Evaluar cada capa → Simplificar la estructura

### Equilibrar simulación e integración

Una suite completamente simulada puede seguir verde aunque cambie el backend. Combina pruebas de UI con mocks controlados y un conjunto de integraciones reales que compruebe contratos y recorridos críticos.

**Ejemplo aplicado**

- Situación: El mock de productos devuelve precio, pero el servicio real cambió ese campo por amount.
- Qué hace QA: Mantén una prueba de contrato real y revisa la fidelidad de los mocks cuando cambie la respuesta.
- Resultado: La divergencia se detecta antes de confiar en una suite visual basada en datos obsoletos.

Secuencia: Comparar contratos → Actualizar las simulaciones → Ejecutar la integración

- Empieza pequeño, refactoriza con evidencia de duplicación.
- Prefiere convenciones y ejemplos coherentes en el README.
- Añade mocks sin convertir toda la suite en una simulación.

## Ejemplo trabajado: Mock controlado de catálogo

Una prueba necesita mostrar un solo producto sin depender del backend de inventario.

### Paso 1 · Interceptar el endpoint

Intercepta solo el endpoint relevante. La ruta debe registrarse antes de la acción que dispara la petición para controlar la condición de prueba.

**Ejemplo aplicado**

- Situación: Una prueba necesita mostrar un solo producto sin depender del backend de inventario.
- Qué hace QA: Registra page.route para api/products antes de abrir el catálogo.
- Resultado: La petición relevante puede resolverse con el mock sin interceptar recursos ajenos al caso.

Secuencia: Definir el patrón → Registrar la ruta → Abrir el catálogo

### Paso 2 · Responder según el contrato

Entrega un JSON válido según contrato. El mock debe tener status, tipo de contenido y estructura que la aplicación realmente entienda.

**Ejemplo aplicado**

- Situación: Una prueba necesita mostrar un solo producto sin depender del backend de inventario.
- Qué hace QA: Entrega HTTP 200, application/json y la lista con id 1 y nombre Producto demo.
- Resultado: El frontend recibe una respuesta controlada compatible con el contrato elegido para este ejemplo.

Secuencia: Elegir el status → Construir el JSON → Entregar la respuesta

### Paso 3 · Validar lo que muestra la UI

Valida que la UI muestre el producto. La aserción demuestra la respuesta visual ante el mock y no la disponibilidad del inventario real.

**Ejemplo aplicado**

- Situación: Una prueba necesita mostrar un solo producto sin depender del backend de inventario.
- Qué hace QA: Comprueba que Producto demo aparece en el catálogo y documenta que el backend está simulado.
- Resultado: El caso confirma el renderizado del producto bajo esta condición controlada.

Secuencia: Esperar el renderizado → Localizar Producto demo → Comprobar su visibilidad

```typescript
await page.route("**/api/products", async route => {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify([{ id: 1, name: "Producto demo" }])
  });
});
await page.goto("/catalogo");
await expect(page.getByText("Producto demo")).toBeVisible();
// Fragmento conceptual: requiere una aplicación que consuma /api/products.
```

## Ejercicio de aplicación

Diseña tres pruebas con mocks (éxito, vacío y error 500), una contra API real y la estrategia de secretos por ambiente.

### Respuesta orientativa

Documenta la diferencia entre comprobar renderización aislada y verificar integración real, y cómo mantendrás ambos tipos de prueba.

### Error frecuente

Concluir que una integración funciona correctamente porque todas sus pruebas usan respuestas simuladas.

## Autoevaluación

**¿Qué NO demuestra una prueba con route.fulfill?**

A. Cómo reacciona la UI a una respuesta simulada
B. Que el backend real está disponible y cumple el contrato
C. Un mensaje de error controlado

**Respuesta:** B. El mock sustituye la respuesta real; la integración debe comprobarse por separado.

## Lecturas adicionales

- [Playwright – Mock APIs](https://playwright.dev/docs/mock)
- [Playwright – Network](https://playwright.dev/docs/network)

---


# Semana 21 — Pipeline QA con GitHub Actions

Módulo: CI/CD y calidad de la suite · Tiempo de lectura: 40 min

> Con CI cada cambio recibe feedback automático y evidencia consultable, no una ejecución manual ocasional.

## 1. Conceptos de integración continua

La integración continua busca validar cambios frecuentemente. Una pipeline puede ejecutar instalación, chequeos estáticos, tests, recolección de evidencias y publicación de estado en un pull request. Un pipeline verde solo representa las verificaciones que configuraste.

### CI convierte cambios en evidencia

La integración continua ejecuta comprobaciones frecuentes sobre cambios concretos. Una ejecución verde solo informa de lo que cubren sus validaciones en ese ambiente; no demuestra ausencia de defectos.

**Ejemplo aplicado**

- Situación: Un pull request modifica la validación de precios del checkout.
- Qué hace QA: Ejecuta compilación y pruebas relevantes en CI y revisa qué casos cubren los riesgos del cambio.
- Resultado: La revisión dispone de evidencia del commit propuesto y de los límites de esa cobertura.

Secuencia: Recibir el cambio → Ejecutar las comprobaciones → Revisar la evidencia

### Jobs y permisos mínimos

Un workflow organiza jobs y pasos con requisitos definidos. Asigna los permisos que necesita cada operación y evita entregar credenciales de despliegue a una tarea que únicamente compila o prueba.

**Ejemplo aplicado**

- Situación: El workflow de un pull request solo necesita descargar el código y ejecutar la suite.
- Qué hace QA: Configura permisos de lectura y separa cualquier operación de publicación en el flujo autorizado correspondiente.
- Resultado: La validación funciona sin ampliar innecesariamente el acceso de sus procesos.

Secuencia: Definir la tarea → Limitar sus permisos → Ejecutar la validación

- push ejecuta al actualizar una rama según condiciones.
- pull_request valida antes de integrar contribuciones.
- jobs y steps organizan las acciones.
- Usa permisos mínimos para tokens y secretos.

## 2. Workflow para Playwright

En GitHub Actions, el runner instala Node, dependencias y navegadores compatibles antes de ejecutar Playwright. npm ci requiere lockfile reproducible. Los artefactos conservan reportes y trazas para investigar fallos.

### Instalación consistente en CI

El runner comienza sin tu entorno local. Instala la versión de Node acordada, las dependencias según el lockfile y los navegadores requeridos antes de ejecutar Playwright.

**Ejemplo aplicado**

- Situación: Una prueba pasa localmente pero CI falla porque no encuentra el ejecutable del navegador.
- Qué hace QA: Revisa el orden de checkout, preparación de Node, instalación y preparación de navegadores.
- Resultado: El fallo de infraestructura se resuelve antes de atribuirlo al comportamiento del producto.

Secuencia: Preparar el runtime → Instalar dependencias y navegador → Ejecutar la suite

### Artefactos incluso cuando falla

El reporte y las trazas son especialmente útiles en una ejecución fallida. Configura su publicación bajo la condición apropiada del workflow y define una retención razonable sin exponer datos sensibles.

**Ejemplo aplicado**

- Situación: El job falla y finaliza sin que el equipo pueda abrir el reporte HTML.
- Qué hace QA: Añade la carga de artefactos al terminar la ejecución, incluida la ruta de fallo prevista.
- Resultado: La investigación dispone del reporte correspondiente al commit sin tener que reproducir primero el error.

Secuencia: Conservar el reporte → Publicar el artefacto → Investigar el fallo

- actions/checkout obtiene el código.
- actions/setup-node configura Node.
- npx playwright install --with-deps instala browsers y dependencias del sistema.
- upload-artifact conserva el reporte incluso con fallos (if: always()).

## 3. Diagnóstico y seguridad en CI

Aislar secretos, documentar dependencias y evitar pruebas que modifican producción son requisitos básicos. Si la suite falla solo en CI, compara variables de ambiente, baseURL, tiempos, concurrencia y dependencias.

### Diagnosticar diferencias de ambiente

CI puede cambiar la baseURL, recursos, zona horaria, paralelismo o datos disponibles. Contrasta las condiciones antes de añadir reintentos o asumir que el runner es demasiado lento.

**Ejemplo aplicado**

- Situación: La suite intenta usar localhost aunque el servidor de pruebas no fue iniciado en CI.
- Qué hace QA: Revisa el arranque y disponibilidad del servidor y valida el destino configurado antes de ejecutar los tests.
- Resultado: El problema queda identificado como una precondición del ambiente y no como un fallo del login.

Secuencia: Revisar el destino → Confirmar disponibilidad → Ejecutar con precondiciones

### Secretos y concurrencia controlados

Las variables sensibles deben llegar por los mecanismos de secretos y no aparecer en logs. Además, cada ejecución necesita datos propios para que dos pipelines no alteren el mismo recurso al mismo tiempo.

**Ejemplo aplicado**

- Situación: Dos pull requests ejecutan pruebas de perfil con una cuenta compartida.
- Qué hace QA: Proporciona credenciales autorizadas sin imprimirlas y asigna cuentas o datos independientes por ejecución.
- Resultado: Las pruebas conservan aislamiento y los registros no publican valores que permitan iniciar sesión.

Secuencia: Inyectar credenciales → Separar los datos → Revisar los registros

- No incluyas tokens en archivos de reporte compartidos.
- No ejecutes destructivos en producción.
- Agrega un README con pasos para reproducir localmente.

## Ejemplo trabajado: Workflow mínimo GitHub Actions

Ejecuta los tests en cambios y guarda el HTML report.

### Paso 1 · Crear el workflow

Crear .github/workflows/playwright.yml. El archivo debe quedar en la ruta que reconoce GitHub y definir el orden de preparación y prueba.

**Ejemplo aplicado**

- Situación: Ejecuta los tests en cambios y guarda el HTML report.
- Qué hace QA: Crea playwright.yml con checkout, Node, instalación, navegadores, tests y carga del reporte.
- Resultado: GitHub puede identificar la automatización y sus pasos al recibir los eventos configurados.

Secuencia: Crear la ruta workflows → Definir los pasos → Revisar los eventos

### Paso 2 · Conservar el lockfile

Confirmar package-lock.json con npm install. Este ejemplo usa npm y requiere su archivo de bloqueo; no mezcles gestores sin adaptar comandos y caché.

**Ejemplo aplicado**

- Situación: Ejecuta los tests en cambios y guarda el HTML report.
- Qué hace QA: Genera package-lock.json con npm en el proyecto de práctica y conserva el archivo con el workflow.
- Resultado: npm ci dispone del contrato de dependencias necesario para una instalación consistente.

Secuencia: Instalar con npm → Revisar package-lock → Confirmar ambos archivos

### Paso 3 · Validar el cambio propuesto

Subir cambios y abrir pull request. La ejecución debe corresponder al commit que se revisa y tener disponibles las variables de prueba autorizadas.

**Ejemplo aplicado**

- Situación: Ejecuta los tests en cambios y guarda el HTML report.
- Qué hace QA: Publica la rama del proyecto de práctica, abre su pull request y revisa el workflow asociado.
- Resultado: El revisor puede relacionar el resultado automático con el cambio concreto que desea integrar.

Secuencia: Publicar la rama → Abrir el pull request → Relacionar el workflow

### Paso 4 · Consultar la evidencia

Consultar artefacto y ejecución. Un job exitoso o fallido necesita resultados interpretables y artefactos del mismo intento.

**Ejemplo aplicado**

- Situación: Ejecuta los tests en cambios y guarda el HTML report.
- Qué hace QA: Abre la ejecución, descarga el reporte cuando esté disponible e identifica la prueba y proyecto afectados.
- Resultado: La investigación utiliza evidencia del runner sin depender de la instalación local del autor.

Secuencia: Abrir la ejecución → Recuperar el reporte → Revisar el resultado

```yaml
name: Playwright
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
```

## Ejercicio de aplicación

Configura un workflow para PR que ejecute un proyecto de navegador y publique reportes, tanto con éxito como con fallo.

### Respuesta orientativa

Debe haber lockfile, un script de prueba conocido y un artefacto de reporte visible en la ejecución. Prueba el flujo con un fallo controlado.

### Error frecuente

Publicar una pipeline “verde” cuyo comando de tests no encontró ningún test o cuya etapa de fallo se ignora silenciosamente.

## Autoevaluación

**¿Para qué se usa if: always() al publicar reportes?**

A. Publicar incluso si los tests fallaron
B. Hacer que todas las pruebas pasen
C. Reemplazar npm ci

**Respuesta:** A. Permite conservar evidencias incluso cuando la etapa de ejecución termina con error.

## Lecturas adicionales

- [Playwright – CI](https://playwright.dev/docs/ci)
- [GitHub Actions – Documentación](https://docs.github.com/en/actions)

---


# Semana 22 — Estabilidad, métricas y ejecución eficiente

Módulo: CI/CD y calidad de la suite · Tiempo de lectura: 35 min

> Una suite profesional ofrece señal confiable y rápida. Mide inestabilidad, investiga causas y controla costos de ejecución.

## 1. Qué es un test flaky

Es una prueba cuyo resultado cambia entre ejecuciones equivalentes sin cambios relevantes del producto. Suele deberse a esperas, datos compartidos, orden de tests, servicios no deterministas o selectores frágiles. No lo “corrijas” ocultando el error mediante retries ilimitados.

### Flaky requiere una investigación

Una prueba intermitente alterna resultados sin un cambio relevante que lo justifique. Clasifica si la variación viene del producto, los datos, la sincronización o la infraestructura antes de modificar el test.

**Ejemplo aplicado**

- Situación: El login falla una vez de cada diez porque el botón aún está deshabilitado.
- Qué hace QA: Repite el caso con evidencia y revisa la condición del control y sus dependencias de red.
- Resultado: El equipo puede reproducir la diferencia y corregir su causa con un cambio comprobable.

Secuencia: Repetir con evidencia → Encontrar la variación → Corregir la causa

### Reintentar no equivale a corregir

Los retries ayudan a conservar información de fallos intermitentes, pero una suite que siempre acaba verde puede ocultar señales importantes. Registra el primer resultado y asigna seguimiento a la inestabilidad.

**Ejemplo aplicado**

- Situación: Una aserción falla y el workflow la repite hasta obtener una ejecución exitosa.
- Qué hace QA: Limita los reintentos y conserva el resultado inicial, la traza y una clasificación del fallo.
- Resultado: El indicador de inestabilidad sigue visible aunque el último intento pase.

Secuencia: Registrar el fallo inicial → Comparar los intentos → Dar seguimiento

- Reproduce varias veces y registra condiciones.
- Compara ejecución local, CI y navegador.
- Clasifica causa: test, datos, ambiente, producto o dependencia externa.

## 2. Paralelización y sharding

Playwright puede distribuir tests entre workers y fragmentos de suite. Cuanta más concurrencia, más importante es aislar cuentas, pedidos, archivos temporales y estados de infraestructura. Mide el beneficio real; más workers no siempre significan menos tiempo.

### Workers con recursos suficientes

Aumentar workers incrementa concurrencia, pero puede saturar el servidor o generar colisiones. Mide duración y estabilidad con datos independientes antes de decidir el número adecuado.

**Ejemplo aplicado**

- Situación: La suite tarda ocho minutos con dos workers y falla más al subir a ocho.
- Qué hace QA: Compara consumo, tiempos de respuesta y colisiones de datos con distintos niveles de concurrencia.
- Resultado: La configuración se elige por resultados medidos y no por el mayor número disponible.

Secuencia: Medir la línea base → Variar la concurrencia → Comparar estabilidad

### Sharding reparte la suite

El sharding divide pruebas entre ejecuciones para reducir el tiempo total. Cada parte debe preparar sus dependencias y producir evidencia identificable, sin asumir que otra parte creó sus datos primero.

**Ejemplo aplicado**

- Situación: Una suite se reparte entre tres runners de CI.
- Qué hace QA: Asigna identificadores por shard y reúne los reportes sin compartir registros mutables entre ellos.
- Resultado: Los tres grupos pueden ejecutarse por separado y sus resultados se interpretan como una ejecución completa.

Secuencia: Dividir las pruebas → Aislar cada parte → Reunir la evidencia

- Evita fixtures globales mutables.
- Usa recursos únicos por test o por worker.
- Define un límite razonable de concurrencia para el ambiente.

## 3. Métricas que aportan valor

Tiempo total de suite, porcentaje de ejecuciones inestables, fallos por causa, cobertura de riesgos y tiempo de recuperación ayudan a tomar decisiones. El número bruto de tests por sí solo no refleja protección ante fallos críticos.

### Métricas con denominador y contexto

Un porcentaje necesita una definición y un período. Distingue casos fallidos, ejecuciones fallidas e intentos para que los reintentos no alteren el significado de la tasa de aprobación o inestabilidad.

**Ejemplo aplicado**

- Situación: De cien casos, cinco fallan inicialmente y pasan al repetirlos.
- Qué hace QA: Informa tanto los cinco casos inestables como el resultado final y explica cómo calculaste cada indicador.
- Resultado: El equipo no interpreta un 100 % final como ausencia de fallos intermitentes.

Secuencia: Definir el indicador → Contar con criterio → Explicar el resultado

### Mantenimiento dirigido por riesgo

Usa duración, causas de fallo y valor de cobertura para decidir qué mejorar. Eliminar la prueba más molesta puede reducir el ruido y también dejar sin evidencia un riesgo crítico.

**Ejemplo aplicado**

- Situación: Un test de cobro falla con frecuencia y consume gran parte del diagnóstico semanal.
- Qué hace QA: Clasifica sus fallos, asigna un responsable y conserva cobertura equivalente mientras se corrige.
- Resultado: La mejora reduce el costo de mantenimiento sin abandonar silenciosamente el riesgo de cobros incorrectos.

Secuencia: Identificar el costo → Priorizar por riesgo → Comprobar la mejora

- Conserva tendencias comparables a lo largo del tiempo.
- Separa fallo del producto de fallo del test.
- Asigna responsables a la corrección de inestabilidad.

## Ejemplo trabajado: Investigar un flaky login

Un test falla 1 de cada 10 ejecuciones: se intenta hacer click antes de que el botón esté habilitado.

### Paso 1 · Repetir para reunir evidencia

Reproduce con repeat-each y guarda trazas. Repetir sirve para observar la variación, no para declarar resuelto el caso cuando una ejecución pasa.

**Ejemplo aplicado**

- Situación: Un test falla 1 de cada 10 ejecuciones: se intenta hacer click antes de que el botón esté habilitado.
- Qué hace QA: Ejecuta repeat-each=10 y conserva trazas de las ejecuciones fallidas con su configuración.
- Resultado: El conjunto permite identificar en qué condiciones el botón aún no estaba habilitado.

Secuencia: Configurar repeticiones → Capturar los fallos → Comparar las condiciones

### Paso 2 · Descartar estado compartido

Descarta datos de sesión compartidos. La sesión de otro caso puede cambiar la pantalla y producir síntomas similares a una espera incorrecta.

**Ejemplo aplicado**

- Situación: Un test falla 1 de cada 10 ejecuciones: se intenta hacer click antes de que el botón esté habilitado.
- Qué hace QA: Ejecuta el test aislado y revisa cookies y datos propios de la cuenta de prueba.
- Resultado: La hipótesis de contaminación queda confirmada o descartada con una comparación reproducible.

Secuencia: Aislar el caso → Revisar la sesión → Contrastar con la suite

### Paso 3 · Esperar la condición relevante

Usa un locator semántico y espera el estado habilitado si corresponde. El clic ya espera condiciones de interacción; la aserción explícita puede ayudar a describir y diagnosticar la precondición prevista.

**Ejemplo aplicado**

- Situación: Un test falla 1 de cada 10 ejecuciones: se intenta hacer click antes de que el botón esté habilitado.
- Qué hace QA: Usa el locator por rol y nombre y comprueba toBeEnabled cuando esa condición forma parte del caso.
- Resultado: El test expresa qué condición esperaba sin introducir una pausa fija ni ocultar un bloqueo permanente.

Secuencia: Localizar Ingresar → Comprobar habilitación → Ejecutar el clic

### Paso 4 · Verificar el comportamiento real

Verifica si el comportamiento del producto realmente cambia. Una diferencia de respuesta del producto puede ser el defecto a reportar y no un problema de la automatización.

**Ejemplo aplicado**

- Situación: Un test falla 1 de cada 10 ejecuciones: se intenta hacer click antes de que el botón esté habilitado.
- Qué hace QA: Relaciona el estado del botón con las peticiones y repite la investigación después de corregir la causa.
- Resultado: La conclusión distingue un cambio legítimo de tiempos de un defecto o una dependencia no disponible.

Secuencia: Relacionar UI y red → Revisar la causa → Confirmar la corrección

```typescript
// Diagnóstico, no solución automática
// npx playwright test tests/login.spec.ts --repeat-each=10

await expect(page.getByRole("button", {name:"Ingresar"}))
  .toBeEnabled();
await page.getByRole("button", {name:"Ingresar"}).click();
// El botón y la ruta son ejemplos de una app hipotética.
```

## Ejercicio de aplicación

Genera un fallo intermitente de forma controlada, rastrea su causa y documenta el antes/después con una métrica de ejecución.

### Respuesta orientativa

La mejora debe basarse en una condición observable o en datos aislados, no en incrementar arbitrariamente los segundos.

### Error frecuente

Ocultar pruebas flaky detrás de varios retries y reportar “100 % verde” sin transparencia.

## Autoevaluación

**¿Qué acción resuelve mejor un test flaky por datos compartidos?**

A. Agregar waitForTimeout(60000)
B. Aislar los datos por test
C. Quitar todas las aserciones

**Respuesta:** B. La independencia elimina colisiones no deterministas entre ejecuciones.

## Lecturas adicionales

- [Playwright – Parallelism](https://playwright.dev/docs/test-parallel)
- [Playwright – Best Practices](https://playwright.dev/docs/best-practices)

---


# Semana 23 — Proyecto E2E integrador

Módulo: Proyecto final y portafolio · Tiempo de lectura: 45 min

> Construye un proyecto que conecte riesgo, requisitos, casos, automatización y evidencia de ejecución.

## 1. Definir un alcance realizable

Selecciona un producto demo con rutas de usuario claras. Elige entre 3 y 5 historias: login, consulta de productos, carrito, checkout y API de pedidos. Evita automatizar funciones sin un criterio de aceptación o con ambientes inestables no controlados.

### Alcance ejecutable del proyecto

Un proyecto de portafolio debe tener un producto y un alcance que puedas explicar y validar. Selecciona pocas historias relevantes y define qué queda fuera para evitar una suite extensa sin objetivo común.

**Ejemplo aplicado**

- Situación: El proyecto incluye login, catálogo, carrito y checkout de una tienda de demostración.
- Qué hace QA: Selecciona criterios y riesgos de esas cuatro historias y documenta las exclusiones conocidas.
- Resultado: El alcance permite justificar cada caso y reconocer qué comportamientos todavía no están cubiertos.

Secuencia: Elegir las historias → Delimitar la cobertura → Declarar las exclusiones

### Entrada y salida con evidencia

Los criterios de entrada indican si es posible comenzar; los de salida ayudan a decidir si la evidencia es suficiente. No conviertas el porcentaje de pruebas aprobadas en el único criterio cuando existen defectos críticos.

**Ejemplo aplicado**

- Situación: La demo de checkout tiene datos disponibles, pero mantiene un defecto de doble cobro.
- Qué hace QA: Documenta la precondición satisfecha y evalúa el defecto frente al riesgo y al criterio de salida.
- Resultado: El reporte distingue que la prueba puede ejecutarse de que el producto esté listo para liberarse.

Secuencia: Revisar precondiciones → Ejecutar la cobertura → Valorar el riesgo pendiente

- Identifica actores, reglas críticas y datos.
- Establece criterios de entrada/salida y fuera de alcance.
- Prioriza por impacto y probabilidad.

## 2. Matriz de trazabilidad

Relaciona cada historia y criterio con el caso manual, la prueba automatizada y el resultado de ejecución. Esto hace visible qué reglas están protegidas y cuáles no. Mantén IDs estables y específicos.

### Trazabilidad con identificadores estables

Relaciona la historia, el criterio, el caso y la ejecución para saber qué evidencia respalda una necesidad. Los nombres y los ids deben permitir seguir la relación aunque cambie la ubicación del archivo.

**Ejemplo aplicado**

- Situación: La historia HU-04 exige que el total de checkout incluya los impuestos acordados.
- Qué hace QA: Vincula su criterio con CP-014, el test automatizado y el reporte del commit ejecutado.
- Resultado: Un revisor puede ir de la necesidad al resultado sin reconstruir el contexto por mensajes privados.

Secuencia: Identificar el criterio → Vincular caso y test → Adjuntar la ejecución

### Matriz que refleja cobertura real

El número de scripts no equivale a criterios cubiertos. Una matriz útil señala variantes, nivel de prueba y estado de ejecución, además de huecos conocidos y resultados pendientes.

**Ejemplo aplicado**

- Situación: Hay veinte casos manuales y veinticinco pruebas automáticas para cuatro historias.
- Qué hace QA: Distribuye cada caso por criterio y riesgo y señala dónde varias pruebas cubren la misma variante.
- Resultado: El reporte muestra cobertura y duplicaciones sin sumar cantidades como si fueran riesgos diferentes.

Secuencia: Mapear los criterios → Asignar cada evidencia → Detectar los huecos

- HU-01 / CA-01 → CP-001 → login.spec.ts → Passed.
- HU-02 / CA-03 → CP-011 → checkout.spec.ts → Failed.
- Riesgo de pago duplicado → test crítico prioritario.

## 3. Diseñar una combinación UI + API

La UI comprueba flujos visibles y experiencia de usuario; la API valida reglas a nivel servicio y puede preparar datos. Evita duplicar idénticas comprobaciones en cada capa sin justificar el riesgo. Define pruebas smoke rápidas y regresión más extensa.

### UI y API con objetivos complementarios

Las pruebas de API aportan evidencia directa de contratos y reglas; la UI verifica el recorrido que usa la persona. Combínalas según el riesgo y evita replicar por interfaz todas las combinaciones ya cubiertas en otro nivel.

**Ejemplo aplicado**

- Situación: El checkout necesita revisar cálculos de diez combinaciones y una compra completa.
- Qué hace QA: Prueba las combinaciones por API y reserva un flujo UI para verificar que el total y la confirmación son visibles.
- Resultado: La suite demuestra la regla y su integración sin inflar el costo de cada ejecución.

Secuencia: Separar objetivos → Elegir el nivel adecuado → Revisar la evidencia conjunta

### Entregables que otra persona puede revisar

El proyecto debe permitir ejecutar y entender los resultados. Conserva configuración de ejemplo, datos controlados y reportes, explicando cualquier dependencia externa que limite la reproducibilidad.

**Ejemplo aplicado**

- Situación: Un revisor clona el proyecto en un equipo que nunca ejecutó la suite.
- Qué hace QA: Prueba las instrucciones desde una instalación limpia y corrige pasos o variables que dependían de tu equipo.
- Resultado: La evaluación puede reproducirse con el README y las credenciales de prueba autorizadas.

Secuencia: Clonar desde cero → Seguir las instrucciones → Revisar los resultados

- Construye tests independientes y reproducibles.
- Mantén datos fuera de credenciales reales.
- Recoge traces y reportes desde el inicio.

## Ejemplo trabajado: Plan de proyecto integrador

Proyecto de tienda web demo: 4 historias, 20 casos manuales y 25 tests automatizados.

### Paso 1 · Casos de login

Login: 6 casos (incluye bloqueo y credenciales erróneas si la demo los soporta). La cobertura depende de las funciones que realmente admita la demo elegida y debe declarar cualquier exclusión.

**Ejemplo aplicado**

- Situación: Proyecto de tienda web demo: 4 historias, 20 casos manuales y 25 tests automatizados.
- Qué hace QA: Diseña seis casos de acceso y verifica qué variantes de bloqueo y credencial errónea soporta el sitio.
- Resultado: La matriz de login tiene expectativas ejecutables y no casos para funciones inexistentes.

Secuencia: Revisar el alcance → Diseñar seis casos → Confirmar las variantes

### Paso 2 · Casos de catálogo

Catálogo: 5 casos (listado, detalle y búsqueda). Listado, detalle y búsqueda pueden tener riesgos y datos distintos; define los criterios antes de repartir cantidades.

**Ejemplo aplicado**

- Situación: Proyecto de tienda web demo: 4 historias, 20 casos manuales y 25 tests automatizados.
- Qué hace QA: Distribuye cinco casos según las capacidades del catálogo de práctica y sus criterios acordados.
- Resultado: Los casos comprueban comportamientos del catálogo y no solo que la página cargue.

Secuencia: Identificar funciones → Elegir variantes → Asignar cinco casos

### Paso 3 · Casos de carrito

Carrito: 5 casos (agregar, retirar, totales). Las operaciones de agregar y retirar deben relacionarse con cantidades y total para detectar inconsistencias.

**Ejemplo aplicado**

- Situación: Proyecto de tienda web demo: 4 historias, 20 casos manuales y 25 tests automatizados.
- Qué hace QA: Diseña cinco casos con productos controlados y calcula el total esperado antes de ejecutar.
- Resultado: La evidencia distingue cambios correctos de cantidad de errores en el importe final.

Secuencia: Preparar productos → Modificar el carrito → Comparar cantidades y total

### Paso 4 · Casos de checkout

Checkout: 4 casos (datos válidos e inválidos). Los datos inválidos deben tener un rechazo definido y los válidos una confirmación observable.

**Ejemplo aplicado**

- Situación: Proyecto de tienda web demo: 4 historias, 20 casos manuales y 25 tests automatizados.
- Qué hace QA: Diseña cuatro casos que cubran el recorrido principal y las validaciones críticas admitidas por la demo.
- Resultado: El checkout cuenta con evidencia de éxito y de rechazo controlado para sus variantes seleccionadas.

Secuencia: Definir los datos → Ejecutar las variantes → Revisar la confirmación

### Paso 5 · Distribuir automatización

Automatización: distribuir 25 pruebas justificando capa UI/API y disponibilidad de servicios. La meta de veinticinco tests requiere justificar niveles y no forzar APIs que el sistema de demostración no ofrece.

**Ejemplo aplicado**

- Situación: Proyecto de tienda web demo: 4 historias, 20 casos manuales y 25 tests automatizados.
- Qué hace QA: Relaciona cada test con un criterio, decide UI o API según disponibilidad y documenta cualquier restricción.
- Resultado: El plan explica qué evidencia aporta cada automatización y qué cobertura sigue pendiente.

Secuencia: Mapear los criterios → Elegir UI o API → Declarar las limitaciones

## Ejercicio de aplicación

Prepara la matriz de trazabilidad, desarrolla 20 casos manuales y al menos 20 tests UI/API de los escenarios que estén disponibles.

### Respuesta orientativa

La evidencia debe permitir navegar requisito → caso → automatización → reporte; si la app no ofrece cierta regla, marca el escenario fuera de alcance.

### Error frecuente

Agregar 30 tests de ejemplo sin trazabilidad, sin reglas de negocio y con datos compartidos.

## Autoevaluación

**¿Qué conecta una matriz de trazabilidad?**

A. Solo nombres de archivos
B. Requisitos, casos de prueba, ejecuciones y defectos
C. Únicamente capturas de pantalla

**Respuesta:** B. Permite comprobar cobertura y localizar el impacto de requisitos cambiados.

## Lecturas adicionales

- [Playwright – Best Practices](https://playwright.dev/docs/best-practices)
- [Playwright – Reporters](https://playwright.dev/docs/test-reporters)

---


# Semana 24 — Portafolio y presentación técnica

Módulo: Proyecto final y portafolio · Tiempo de lectura: 40 min

> Un portafolio convincente demuestra criterio QA, decisiones de ingeniería, resultados y limitaciones, no solo código.

## 1. README reproducible

Un README profesional explica el objetivo, el alcance, arquitectura, requisitos, configuración de ambiente, comandos de instalación, ejecución por navegador, reportes, datos de prueba, decisiones técnicas y limitaciones conocidas.

### README como guía de ejecución

El README explica objetivo, requisitos, instalación, ambiente y comandos verificables. Escríbelo pensando en alguien que no conoce tu equipo y diferencia ejemplos de configuración de secretos reales.

**Ejemplo aplicado**

- Situación: Un evaluador necesita ejecutar solo el proyecto Chromium y abrir el reporte HTML.
- Qué hace QA: Documenta los comandos exactos, las variables requeridas y dónde encontrar el reporte.
- Resultado: El evaluador puede repetir la ejecución y reconocer sus límites sin solicitar pasos adicionales.

Secuencia: Documentar requisitos → Ejecutar los comandos → Abrir la evidencia

### Decisiones y limitaciones visibles

Una documentación profesional explica por qué elegiste la estructura y qué riesgos quedan pendientes. Declarar una limitación conocida resulta más útil que presentar toda la cobertura como completa.

**Ejemplo aplicado**

- Situación: La suite usa mocks para errores de red y un servicio real para el recorrido principal.
- Qué hace QA: Explica esa decisión y señala qué integraciones no se comprueban con los escenarios simulados.
- Resultado: El lector interpreta correctamente la evidencia y sabe qué validaciones siguen siendo necesarias.

Secuencia: Describir la decisión → Delimitar lo comprobado → Declarar lo pendiente

- Describe qué funcionalidades se prueban y cuáles no.
- Incluye pasos exactos para ejecutar localmente y en CI.
- Explica la política de secretos y cómo configurarlos.
- Agrega ejemplos visuales de reportes sin datos sensibles.

## 2. Presentar decisiones de calidad

En una demo no recorras archivo por archivo. Cuenta un problema: cuál era el riesgo, qué escenario lo cubre, qué arquitectura elegiste, cómo se ejecuta automáticamente y qué indica el resultado. Incluye fallos controlados y evidencia.

### Demo que cuenta una decisión de QA

Una presentación de cinco minutos debe conectar problema, riesgo, caso y evidencia. El recorrido por archivos tiene sentido solo cuando ayuda a entender una decisión de calidad.

**Ejemplo aplicado**

- Situación: El proyecto pretende detectar cobros incorrectos al cambiar el checkout.
- Qué hace QA: Comienza con el riesgo, muestra CP-014 y ejecuta la prueba que comprueba el total.
- Resultado: La audiencia entiende por qué existe el test antes de ver sus detalles técnicos.

Secuencia: Presentar el riesgo → Mostrar el caso → Ejecutar la comprobación

### Diagnóstico como parte de la demostración

Una suite profesional también explica sus fallos. Usa una traza de ejemplo claramente identificada y muestra qué evidencia permite diferenciar un defecto del producto de un problema del test.

**Ejemplo aplicado**

- Situación: La demo incluye una ejecución capturada donde el total mostrado era incorrecto.
- Qué hace QA: Abre la traza, relaciona la petición con la pantalla y señala el resultado esperado y el obtenido.
- Resultado: La presentación demuestra capacidad de investigación y no solo una lista de tests aprobados.

Secuencia: Abrir la traza → Comparar los resultados → Explicar el diagnóstico

- Minuto 1: producto, objetivo y riesgos.
- Minutos 2–3: caso manual, prueba y arquitectura.
- Minuto 4: pipeline y trace de un fallo.
- Minuto 5: resultados, limitaciones y próximos pasos.

## 3. Evaluación final del nivel QA Automation

Demuestra pensamiento de riesgo, diseño de pruebas, TypeScript legible, locators semánticos, tests aislados, datos, API, CI y diagnóstico. El certificado personal de aprendizaje no sustituye una certificación externa ni experiencia laboral real.

### Evaluar competencia por evidencia

La evaluación final combina criterio de riesgo, diseño, código, aislamiento, contratos y diagnóstico. La cantidad de scripts por sí sola no demuestra que la suite detecte problemas importantes o sea mantenible.

**Ejemplo aplicado**

- Situación: Un repositorio tiene cincuenta tests, pero todos verifican el mismo login exitoso.
- Qué hace QA: Revisa su trazabilidad y solicita evidencia de variantes, datos y recorridos críticos antes de valorar la cobertura.
- Resultado: La evaluación reconoce capacidades demostradas y evita confundir volumen con calidad.

Secuencia: Revisar la cobertura → Contrastar los riesgos → Valorar la evidencia

### Aprendizaje y siguiente mejora

Un portafolio es una muestra de trabajo con límites, no una garantía de experiencia ni una certificación externa. Cierra con una mejora priorizada y una forma de comprobar si aportó valor.

**Ejemplo aplicado**

- Situación: El proyecto termina con una prueba inestable y cobertura limitada de accesibilidad.
- Qué hace QA: Documenta ambos pendientes y elige el siguiente trabajo según impacto, esfuerzo y evidencia necesaria.
- Resultado: El plan de mejora muestra criterio profesional y una evaluación honesta de lo que se logró.

Secuencia: Reconocer los límites → Priorizar el siguiente paso → Definir su evidencia

- Una prueba que falla informa algo relevante y diagnosticable.
- La cobertura responde a riesgos conocidos.
- La documentación permite que otra persona ejecute la suite.

## Ejemplo trabajado: Guion de demostración de cinco minutos

Escenario: cambios en checkout no deben introducir cobros o totales incorrectos.

### Paso 1 · Presentar el riesgo

Abre matriz de riesgos y explica la prioridad. La matriz permite explicar por qué el caso de checkout merece atención antes de mostrar su código.

**Ejemplo aplicado**

- Situación: Escenario: cambios en checkout no deben introducir cobros o totales incorrectos.
- Qué hace QA: Indica el impacto de un cobro incorrecto y la probabilidad estimada con su escala y justificación.
- Resultado: La audiencia comprende el criterio usado para priorizar la comprobación del total.

Secuencia: Identificar el impacto → Explicar la estimación → Justificar la prioridad

### Paso 2 · Relacionar caso y test

Muestra CP-014 y su implementación automatizada. La trazabilidad muestra que el código automatizado responde a una necesidad de prueba documentada.

**Ejemplo aplicado**

- Situación: Escenario: cambios en checkout no deben introducir cobros o totales incorrectos.
- Qué hace QA: Abre CP-014 con su esperado y señala las acciones y aserciones que lo implementan.
- Resultado: El revisor puede reconocer la misma regla de negocio en la especificación y en el test.

Secuencia: Abrir CP-014 → Localizar su implementación → Comparar las expectativas

### Paso 3 · Mostrar la ejecución

Ejecuta la prueba y enseña el reporte. El reporte debe identificar la configuración y el commit para que el resultado tenga contexto reproducible.

**Ejemplo aplicado**

- Situación: Escenario: cambios en checkout no deben introducir cobros o totales incorrectos.
- Qué hace QA: Ejecuta el caso previsto, abre el HTML report y explica el resultado de sus aserciones.
- Resultado: La demo presenta evidencia de una ejecución concreta y no solo una captura de pruebas aprobadas.

Secuencia: Ejecutar el caso → Abrir el reporte → Interpretar el resultado

### Paso 4 · Demostrar diagnóstico

Abre una traza previamente capturada para mostrar diagnóstico. Una traza preparada debe identificarse como evidencia anterior para no confundirla con la ejecución actual.

**Ejemplo aplicado**

- Situación: Escenario: cambios en checkout no deben introducir cobros o totales incorrectos.
- Qué hace QA: Abre la traza capturada, señala la acción fallida y relaciona su petición con el resultado obtenido.
- Resultado: La audiencia observa cómo se investiga una diferencia y cuál es la evidencia que respalda la causa.

Secuencia: Identificar la traza → Relacionar acción y respuesta → Explicar la causa

### Paso 5 · Cerrar con límites y mejoras

Concluye con cobertura y riesgos pendientes. La conclusión debe informar qué se comprobó y qué riesgo queda abierto en lugar de prometer calidad absoluta.

**Ejemplo aplicado**

- Situación: Escenario: cambios en checkout no deben introducir cobros o totales incorrectos.
- Qué hace QA: Resume cobertura, limitaciones y el siguiente trabajo priorizado para mejorar la suite.
- Resultado: El cierre permite valorar el resultado del proyecto y sus próximos pasos con expectativas realistas.

Secuencia: Resumir la cobertura → Declarar los pendientes → Priorizar la mejora

## Ejercicio de aplicación

Publica un repositorio sin secretos, revisa el README con otra persona, prepara una demo de cinco minutos y evalúa los diez entregables finales.

### Respuesta orientativa

El proyecto está listo cuando otra persona puede clonar, configurar, ejecutar, revisar reportes y entender decisiones sin solicitar una explicación privada.

### Error frecuente

Mostrar únicamente “tests passed” sin evidencias de riesgos, alcance, mantenimiento o trazabilidad.

## Autoevaluación

**¿Qué caracteriza a un portafolio QA Automation sólido?**

A. La mayor cantidad posible de scripts
B. Decisiones justificadas, suite reproducible y reporte de riesgos
C. Un repositorio sin instrucciones

**Respuesta:** B. Demuestra competencia técnica y criterio de calidad aplicable al trabajo real.

## Lecturas adicionales

- [Playwright – Documentación](https://playwright.dev/docs/intro)
- [GitHub – README y repositorios](https://docs.github.com/en/repositories)

---

