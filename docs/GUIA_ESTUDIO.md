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

# Semana 01 — Mentalidad QA y ciclo de vida

Módulo: Fundamentos del Testing · Tiempo de lectura: 25 min

> La calidad se construye durante el desarrollo. Testing aporta evidencia sobre riesgos; no consiste únicamente en buscar errores al final.

## 1. QA, QC y testing: conceptos diferentes

Aseguramiento de calidad (QA) se orienta a mejorar los procesos para prevenir problemas. Control de calidad (QC) evalúa características del producto. El testing es una actividad de evaluación que compara comportamientos observados con expectativas y permite descubrir fallos y riesgos.

- Error: acción humana equivocada, por ejemplo interpretar mal una regla.
- Defecto: problema introducido en un artefacto, como una condición incorrecta en código.
- Fallo: comportamiento observable que no cumple lo esperado durante la ejecución.
- Verificación: ¿construimos correctamente según lo especificado? Validación: ¿construimos el producto que realmente se necesita?

## 2. Cómo se relacionan SDLC y STLC

El SDLC describe el ciclo de vida del software: análisis, diseño, construcción, pruebas, entrega y operación. El STLC organiza actividades de pruebas: planificación, análisis, diseño, implementación, ejecución, seguimiento y cierre. En equipos ágiles estas actividades se repiten dentro de cada iteración, no forman necesariamente una fase final.

- En refinamiento: detectar criterios de aceptación ambiguos.
- Durante desarrollo: revisar ejemplos, datos, integraciones y riesgos.
- Antes de liberar: ejecutar cobertura priorizada y comunicar riesgos pendientes.

## 3. Los siete principios del testing

El testing muestra presencia de defectos, no demuestra su ausencia. Probar exhaustivamente suele ser imposible; conviene priorizar. Cuanto antes se prueba, menor puede ser el costo del defecto. Los defectos tienden a concentrarse, las pruebas pierden eficacia si nunca cambian, el contexto determina la estrategia y un producto sin fallos técnicos todavía puede no resolver la necesidad del usuario.

- Ejemplo: 200 pruebas exitosas de login no garantizan que el producto sea útil.
- Pregunta de QA: ¿cuál es el riesgo más relevante y qué evidencia lo reduciría?

## Ejemplo trabajado: Caso guiado · saldo bancario incorrecto

Requisito: al transferir $50 de una cuenta con $200, el saldo debe quedar en $150. El programador resta 5 por error.

1. Error humano: interpretar o escribir incorrectamente la operación.
2. Defecto: código que resta 5 en lugar de 50.
3. Fallo observable: la interfaz muestra $195 después de transferir.
4. Evidencia: saldo inicial, operación ejecutada, resultado esperado y resultado obtenido.

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

En componente o unidad se comprueba una función aislada. Integración comprueba contratos e intercambios entre componentes. Sistema evalúa el comportamiento integral. Aceptación verifica la satisfacción de necesidades del negocio o del usuario. Cada nivel tiene un alcance distinto y puede utilizar diferentes herramientas.

- Unidad: función que calcula impuestos.
- Integración: API que consulta inventario y aplica descuentos.
- Sistema: compra completa y confirmación de pedido.
- Aceptación: el negocio valida sus reglas de devolución.

## 2. Tipos y objetivos de pruebas

Las funcionales verifican lo que hace el sistema; las no funcionales evalúan características como rendimiento, seguridad, accesibilidad y usabilidad. Smoke comprueba que un build es suficientemente estable para continuar; regresión busca efectos inesperados de cambios. Exploratoria usa aprendizaje, diseño y ejecución de forma simultánea.

- E2E describe un alcance de flujo extremo a extremo, no reemplaza otras pruebas.
- Sanity es un término informal cuyo significado concreto se acuerda con el equipo.
- Una prueba automatizada puede ser funcional o no funcional, según su propósito.

## 3. Priorización basada en riesgos

Un riesgo combina probabilidad de un evento no deseado y su impacto. Puedes usar una matriz simple de 1 a 5 para cada dimensión; el producto es una prioridad orientativa, no una verdad matemática. Considera impacto financiero, legal, operativo, seguridad y frecuencia de uso.

- Identifica amenazas y fallos plausibles.
- Estima su impacto y probabilidad con el equipo.
- Elige controles y escenarios para reducir incertidumbre.
- Reevalúa riesgos cuando cambia el producto.

## Ejemplo trabajado: Caso guiado · priorizar cinco funcionalidades

Una tienda tendrá un lanzamiento mañana. Con poco tiempo, el equipo pondera las áreas.

1. Pago: impacto 5 × probabilidad 4 = 20. Prioridad alta.
2. Registro: impacto 3 × probabilidad 3 = 9. Prioridad media.
3. Cambio de tema: impacto 1 × probabilidad 2 = 2. Prioridad baja.
4. Ejecutar primero los flujos de pago y sus fallos negativos; documentar cobertura diferida.

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

- Rol: quién necesita el comportamiento.
- Capacidad: qué quiere lograr sin describir la implementación.
- Beneficio: por qué aporta valor.
- Preguntas abiertas: decisiones que aún debe aclarar negocio.

## 2. Criterios de aceptación comprobables

Describe condiciones observables, idealmente con entrada, regla y resultado. Given/When/Then ayuda a redactar escenarios: Dado que existe una cuenta activa, cuando ingreso credenciales válidas, entonces accedo al panel. Evita criterios vagos como “funciona rápido” o “interfaz bonita”.

- Incluye escenarios felices y alternativos.
- Establece mensajes, límites, restricciones y estados.
- Aclara comportamientos de seguridad sin exponer información sensible.
- Define qué queda fuera del alcance de la HU.

## 3. Revisión temprana y refinamiento

QA examina las historias antes del desarrollo: ambigüedad, omisiones, inconsistencias, casos negativos y dependencias. Una pregunta a tiempo evita que cada miembro implemente una regla diferente.

- ¿Se bloquea la cuenta tras intentos fallidos?
- ¿El correo distingue mayúsculas y minúsculas?
- ¿La sesión expira? ¿En cuánto tiempo?
- ¿Cómo se comporta el sistema cuando la API no responde?

## Ejemplo trabajado: Ejemplo trabajado · acceso a una plataforma

HU: Como cliente registrado quiero iniciar sesión para revisar mis pedidos.

1. CA-01: Dado usuario activo y credenciales correctas, al enviar el formulario se muestra el panel.
2. CA-02: Con contraseña incorrecta se rechaza el acceso sin revelar cuál dato fue incorrecto.
3. CA-03: Si falta un campo requerido, se presenta una validación comprensible.
4. CA-04: La sesión respeta las políticas de expiración definidas.

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

- Partición inválida inferior: 0, 17.
- Partición válida: 18, 32, 65.
- Partición inválida superior: 66, 100.
- Añade entradas vacías y no numéricas si el contrato lo requiere.

## 2. Análisis de valores límite

Muchos defectos aparecen en los bordes: usar < en vez de <= o viceversa. Con límites inclusivos de 18 y 65, prueba 17, 18, 19 y 64, 65, 66. El método exacto (dos o tres valores por límite) depende de la estrategia.

- 17 debe rechazarse; 18 y 19 aceptarse.
- 64 y 65 deben aceptarse; 66 rechazarse.
- Los valores esperados son parte del oráculo: deben respaldarse con reglas de negocio.

## 3. Tablas de decisión y transiciones

Una tabla de decisión conecta combinaciones de condiciones y acciones. Es útil en descuentos, autorizaciones y promociones. Una transición de estados valida cambios permitidos o prohibidos: nuevo → activo → bloqueado → rehabilitado.

- Tabla: usuario activo y contraseña correcta → acceso permitido.
- Tabla: usuario bloqueado, aunque la clave sea correcta → acceso denegado.
- Estado: bloqueado → acceso no debe reactivar la cuenta.

## Ejemplo trabajado: Tabla de decisión · inicio de sesión

El acceso depende del estado de la cuenta y de la validez de la contraseña.

1. Regla 1: Activo=SÍ y Clave válida=SÍ → permitir.
2. Regla 2: Activo=SÍ y Clave válida=NO → rechazar.
3. Regla 3: Activo=NO y Clave válida=SÍ → rechazar.
4. Regla 4: Activo=NO y Clave válida=NO → rechazar.

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

- Precondición: usuario activo con carrito vacío.
- Paso: agregar un producto de $50.
- Esperado: carrito muestra cantidad 1 y subtotal $50.
- Obtenido: se registra con fecha, ambiente y versión.

## 2. Ciclo de vida del defecto

Un reporte atraviesa normalmente estados como nuevo, triage, asignado, en curso, resuelto, reabierto y cerrado. La nomenclatura exacta es del equipo. Cada reporte debe incluir título específico, ambiente, versión, pasos, esperado, actual, evidencia y condiciones para reproducir.

- Severidad: impacto del defecto en la funcionalidad o negocio.
- Prioridad: urgencia de atención relativa a otros trabajos.
- Si no puedes reproducirlo, registra frecuencia y condiciones observadas.

## 3. Evidencias y trazabilidad

Relaciona historia → criterio → caso → ejecución → defecto. La evidencia debe aportar contexto sin exponer secretos, datos personales ni tokens. Una captura de pantalla sola casi nunca reemplaza pasos reproducibles.

- Adjunta una captura o trace cuando aplique.
- Menciona navegador, ambiente y build.
- Anonimiza datos y elimina tokens o contraseñas de capturas.

## Ejemplo trabajado: Bug escrito correctamente

Título: “Checkout aplica doble descuento al seleccionar cupón NUEVO10 en carrito de $120”.

1. Ambiente: QA, build 1.4.2, Chromium.
2. Precondición: usuario elegible con carrito de $120.
3. Pasos: abrir checkout, ingresar NUEVO10, aplicar una vez.
4. Esperado: descuento de $12; total $108. Actual: descuento $24; total $96.
5. Severidad: alta por diferencia económica; prioridad a acordar en triage.

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

- No esperes a que el desarrollador “termine todo” para iniciar QA.
- Invita a conversaciones de tres amigos: negocio, desarrollo y QA.
- La definición de terminado debe ser conocida antes de ejecutar.

## 2. Diseña una estrategia ligera

Un plan útil incluye objetivo, alcance, supuestos, riesgos, ambiente, datos, enfoque, tipos de prueba, responsables, criterios de entrada/salida y evidencias. No tiene que ser largo; debe permitir que el equipo tome decisiones.

- Incluye smoke para detectar problemas críticos rápidamente.
- Selecciona regresión a partir de cambios y dependencias.
- Reserva sesiones exploratorias para escenarios no previstos.

## 3. Métricas para decidir

Reporta pruebas planificadas, ejecutadas, aprobadas, fallidas y bloqueadas; defectos por severidad; cobertura de riesgos y limitaciones. Una cifra alta de “pasó” no compensa que no se hayan probado funciones críticas.

- Tasa de ejecución = ejecutadas / planificadas × 100.
- Tasa de aprobación = aprobadas / ejecutadas × 100 (si define estados coherentes).
- Nombra bloqueos, exclusiones y riesgos aceptados.

## Ejemplo trabajado: Informe de cierre de sprint

Plan: 25 casos, ejecutados: 20, aprobados: 17, fallidos: 2 y bloqueado: 1.

1. Ejecución: 20/25 = 80 %.
2. Aprobación sobre ejecutadas: 17/20 = 85 %.
3. Riesgo: no se pudo validar un pago real por falta de ambiente.
4. Decisión: no afirmar “listo para producción” sin que el responsable acepte el riesgo.

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


# Semana 07 — HTTP, REST y pruebas API con Postman

Módulo: API, SQL, Git y herramientas · Tiempo de lectura: 35 min

> Un QA de API valida contratos, datos y reglas de negocio incluso cuando la interfaz todavía no existe.

## 1. Piezas de una petición HTTP

Una petición incluye método, URL, headers y opcionalmente body. Una respuesta incluye estado, headers y cuerpo. GET consulta recursos; POST suele crear o iniciar operaciones; PUT suele reemplazar; PATCH modifica parcialmente; DELETE solicita eliminación. Los contratos concretos dependen de la API.

- 2xx: éxito según el método y contrato.
- 4xx: problema atribuible a la solicitud (400, 401, 403, 404, 409, 422...).
- 5xx: fallo de servidor o intermediario; investiga contexto.
- No basta validar código 200: comprueba campos y reglas.

## 2. Casos positivos y negativos de API

Prueba payload válido, propiedades faltantes, tipos incorrectos, límites, acceso sin token, recurso inexistente, duplicados e idempotencia cuando corresponda. Verifica schema, estructura de errores, correlación y datos persistidos.

- 401: no autenticado; 403: autenticado pero sin permisos, según el diseño.
- Evita suponer que cada API usa los mismos mensajes o 422 ante validación.
- Usa colecciones de Postman y variables de ambiente sin compartir secretos.

## 3. Validaciones automatizadas en Postman

En scripts post-response puedes inspeccionar el código y el JSON. Aísla los datos en ambientes y documenta el orden de ejecución cuando una prueba crea información que otra consume.

- Comprueba tipos y campos obligatorios.
- Prueba negativas y límites, no solo happy path.
- No confíes en servicios de práctica para datos sensibles.

## Ejemplo trabajado: Script de Postman para validar respuesta

Ejemplo para un endpoint que promete HTTP 200 y un objeto con propiedad id numérica.

1. Enviar petición GET desde Postman.
2. Abrir Scripts → Post-response.
3. Agregar aserciones de estado y contenido.
4. Adaptar atributos a un contrato real y documentar lo esperado.

```javascript
pm.test("Responde 200", () => {
  pm.response.to.have.status(200);
});
pm.test("Incluye identificador numérico", () => {
  const body = pm.response.json();
  pm.expect(body).to.have.property("id");
  pm.expect(body.id).to.be.a("number");
});
```

## Ejercicio de aplicación

Crea una colección de 15 validaciones para una API de práctica: métodos, estado, estructura, autenticación y escenarios negativos.

### Respuesta orientativa

Una propuesta: 4 casos positivos, 4 de validación, 3 de autenticación, 2 de no encontrado y 2 de reglas de negocio. Ajusta según el contrato real.

### Error frecuente

Dar por correcta una API solo porque devuelve 200; un body incorrecto también representa fallo.

## Autoevaluación

**¿Qué aporta una comprobación adicional al código HTTP?**

A. Verificar campos JSON y reglas del contrato
B. Eliminar el entorno de pruebas
C. Reemplazar toda prueba negativa

**Respuesta:** A. Un estado exitoso puede acompañarse de datos o reglas incorrectos.

## Lecturas adicionales

- [Postman Learning Center](https://learning.postman.com/)
- [MDN – códigos de estado HTTP](https://developer.mozilla.org/es/docs/Web/HTTP/Status)

---


# Semana 08 — SQL, DevTools y Git

Módulo: API, SQL, Git y herramientas · Tiempo de lectura: 35 min

> SQL, DevTools y Git permiten investigar, comprobar datos y mantener trazabilidad técnica.

## 1. Consultas SQL esenciales

SELECT elige columnas, WHERE filtra filas, JOIN combina relaciones y GROUP BY agrega resultados. En QA se usan para preparar/verificar datos y rastrear una operación. Trabaja preferentemente en ambientes de prueba y evita modificar información sin autorización.

- SELECT id, estado FROM pedidos WHERE estado = 'PENDIENTE';
- INNER JOIN combina coincidencias en ambas tablas.
- LEFT JOIN conserva las filas de la tabla izquierda incluso sin coincidencia.
- COUNT y SUM ofrecen controles de integridad básicos.

## 2. Herramientas de desarrollo (DevTools)

Network permite identificar petición, respuesta, estado, headers y tiempos. Console muestra errores de JS y logs. Application permite revisar cookies, storage y otros estados del navegador. No copies credenciales o tokens en informes compartidos.

- Filtra Fetch/XHR para aislar llamadas API.
- Compara request payload y response body con el criterio de aceptación.
- Registra ID de correlación cuando exista.

## 3. Git como respaldo del trabajo QA

Un repositorio preserva historia de cambios y facilita revisiones. Flujo típico: clonar, crear rama, realizar cambios, git add, git commit, push y pull request. Agrega un README que explique cómo reproducir pruebas y qué archivos no se deben subir.

- git status: cambios pendientes.
- git switch -c qa/login: rama de trabajo.
- git add . && git commit -m "test: casos login": captura el cambio.
- Nunca publiques .env con secretos ni evidencia sensible.

## Ejemplo trabajado: SQL guiado · contar órdenes por estado

Tablas hipotéticas: pedidos(id, cliente_id, estado, total) y clientes(id, nombre).

1. Verifica pedidos con cliente existente mediante JOIN.
2. Cuenta pedidos por estado con GROUP BY.
3. Investiga órdenes duplicadas antes de reportar un bug.

```sql
SELECT p.estado, COUNT(*) AS cantidad, SUM(p.total) AS valor
FROM pedidos AS p
INNER JOIN clientes AS c ON c.id = p.cliente_id
GROUP BY p.estado
ORDER BY cantidad DESC;
```

## Ejercicio de aplicación

Escribe 10 consultas que combinen filtros, JOIN, conteo y suma; guarda también la explicación y un commit de Git.

### Respuesta orientativa

Cada consulta debe responder una pregunta específica. Por ejemplo: ¿cuántas órdenes pagadas existen? ¿hay pedidos huérfanos? ¿cuál es el total por cliente?

### Error frecuente

Usar una consulta SQL que cambia datos en producción solo para comprobar un resultado.

## Autoevaluación

**¿Qué logra un LEFT JOIN?**

A. Eliminar filas sin relación
B. Conservar filas de la tabla izquierda aunque no exista coincidencia
C. Ordenar los resultados

**Respuesta:** B. Permite detectar registros sin contraparte y hacer validaciones de integridad.

## Lecturas adicionales

- [SQLBolt – aprendizaje SQL](https://sqlbolt.com/)
- [Git – documentación oficial](https://git-scm.com/doc)

---


# Semana 09 — JavaScript: lógica fundamental

Módulo: JavaScript + TypeScript · Tiempo de lectura: 35 min

> Aprende a expresar reglas de negocio con variables, decisiones, iteraciones y funciones comprobables.

## 1. Variables y datos

JavaScript trabaja con valores primitivos como string, number, boolean, null y undefined. Usa const cuando no reasignas la variable y let cuando sí lo haces. Evita var en código moderno. Compara valores con === para no depender de coerciones implícitas.

- const correo = "qa@ejemplo.com";
- const intentos = 3;
- const activo = true;
- Number.isFinite(valor) ayuda a validar números reales.

## 2. Condiciones y ciclos

if/else, switch y los operadores lógicos permiten decidir qué hacer. for, for...of y while recorren datos. En pruebas, los criterios de aceptación se pueden trasladar a condiciones concretas y luego evaluar con diferentes entradas.

- && exige que ambas condiciones sean verdaderas.
- || permite que al menos una condición sea verdadera.
- ! invierte un booleano.
- Diseña primero entradas esperadas e inesperadas.

## 3. Funciones pequeñas, fáciles de probar

Una función debe comunicar un propósito y devolver resultados previsibles. Evita que una función calcule descuentos, llame APIs y modifique UI al mismo tiempo: separar responsabilidades facilita depurar y automatizar.

- Define nombre y parámetros claros.
- Incluye retorno explícito para el resultado.
- Prueba valores límite e inválidos.

## Ejemplo trabajado: Validador de contraseña

La regla de ejemplo permite contraseñas de 8 a 20 caracteres con al menos un dígito.

1. Se valida el tipo antes de leer .length.
2. Se separa validación de longitud y validación de dígito.
3. Se comprueba el resultado con varios datos.

```javascript
function claveValida(clave) {
  if (typeof clave !== "string") return false;
  return clave.length >= 8 &&
    clave.length <= 20 &&
    /\d/.test(clave);
}
console.assert(claveValida("clave1234") === true);
console.assert(claveValida("corta") === false);
```

## Ejercicio de aplicación

Implementa funciones para calcular descuentos y validar claves; realiza pruebas con entrada vacía, valores límite y tipo incorrecto.

### Respuesta orientativa

Organiza el validador como una función pura que retorne booleano. Para descuento, define por escrito si el límite es inclusivo y qué ocurre con precios negativos.

### Error frecuente

Automatizar con grabaciones antes de poder entender una condición o leer un error en consola.

## Autoevaluación

**¿Qué comparación es preferible para evitar coerción de tipo?**

A. ==
B. ===
C. =

**Respuesta:** B. === compara valor y tipo sin conversión implícita.

## Lecturas adicionales

- [MDN – Guía de JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript/Guide)

---


# Semana 10 — Objetos, arrays y JSON

Módulo: JavaScript + TypeScript · Tiempo de lectura: 35 min

> Los tests reales manipulan JSON, estructuras anidadas y listas de entidades.

## 1. Objetos y arreglos

Los objetos organizan datos por propiedades; los arrays mantienen colecciones ordenadas. Es habitual recibir un JSON con usuarios, productos o pedidos y transformar los datos para validar condiciones de negocio.

- usuario.email lee una propiedad de objeto.
- usuarios[0] obtiene el primer registro.
- El encadenamiento opcional usuario?.perfil?.nombre evita errores cuando faltan nodos.
- Desestructura const { id, estado } = pedido para código conciso.

## 2. map, filter, find y reduce

map produce una lista transformada. filter conserva los elementos que cumplen un predicado. find devuelve la primera coincidencia. reduce acumula una colección en un solo resultado. Estos métodos permiten construir verificaciones sin escribir loops manuales.

- filter(u => u.activo) devuelve solo usuarios activos.
- map(p => p.precio) obtiene lista de precios.
- find(u => u.id === 5) busca por identificador.
- reduce((acc,p) => acc+p.precio,0) suma precios.

## 3. JSON y operaciones seguras

JSON.parse convierte texto JSON válido en datos de JavaScript y puede fallar si el texto es incorrecto. JSON.stringify serializa un objeto. Recuerda que JSON no admite comentarios ni valores undefined.

- Comprueba que una respuesta tenga la forma esperada antes de acceder a campos anidados.
- Usa try/catch ante cadenas JSON de origen incierto.
- Evita modificar objetos compartidos entre pruebas independientes.

## Ejemplo trabajado: Calcular subtotal desde JSON

Una API de práctica devuelve un carrito con productos y cantidades.

1. Filtra productos disponibles.
2. Multiplica cantidad por precio.
3. Suma los subtotales y comprueba el total.

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

- string, number y boolean son tipos básicos.
- Las uniones como "pending" | "paid" restringen estados.
- Los objetos se pueden definir mediante type o interface.
- Evita any como salida fácil: pierdes garantías de tipo.

## 2. Interfaces, opcionales y nulabilidad

Una interface expresa la forma esperada de un objeto y permite documentar contratos en el proyecto. Propiedades con ? son opcionales. Diferencia una propiedad ausente de un valor null según el contrato.

- interface Usuario { id: number; nombre: string; activo: boolean }
- email?: string permite ausencia del correo.
- unknown exige comprobar el tipo antes de usarlo.

## 3. Generics y tipos reutilizables

Una función genérica conserva la relación entre sus entradas y su salida. Por ejemplo, una función para seleccionar el primer registro de cualquier arreglo puede ser genérica en lugar de usar any.

- El tipo no sustituye aserciones funcionales.
- Combina tipos con validación explícita para respuestas externas.
- Activa strict en tsconfig para encontrar problemas antes.

## Ejemplo trabajado: Modelar un resultado API

El servicio devuelve estado y un usuario con atributos conocidos.

1. Declara interfaces para la entidad y la respuesta.
2. Crea una función tipada que reciba el modelo.
3. Identifica en el IDE cuándo intentas leer una propiedad inexistente.

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

- Omitir await puede producir carreras y fallos intermitentes.
- Promise.all sirve para operaciones independientes que pueden ejecutarse simultáneamente.
- No uses esperas artificiales para “dar tiempo” si puedes observar un resultado.

## 2. Manejo de fallos asíncronos

try/catch captura rechazos de Promise esperada y otras excepciones. Es importante agregar contexto diagnóstico sin ocultar la causa original ni convertir fallos en falsos positivos.

- No coloques catch vacío en código de tests.
- Propaga errores que impiden validar el resultado.
- Diferencia errores esperados del negocio y errores inesperados del sistema.

## 3. Clases y módulos para organizar el código

export/import permite separar responsabilidades. Una clase agrupa estado y comportamiento; úsala cuando tiene sentido, por ejemplo en un Page Object. Evita abstraer cada línea en una clase solo porque estás automatizando.

- Una función pura es útil para reglas y datos.
- Una clase puede encapsular acciones de una pantalla.
- Un módulo puede exportar utilidades comunes.

## Ejemplo trabajado: Consultar un servicio con control de error

Se espera recibir una respuesta exitosa con JSON válido; en caso contrario debe informarse el problema.

1. Await sobre fetch para esperar la respuesta.
2. Comprobar status con response.ok.
3. Esperar la conversión del JSON y devolverlo.
4. Propagar un error si el servidor responde con error.

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

- npm init playwright@latest inicia un proyecto recomendado.
- tests/*.spec.ts contiene escenarios.
- playwright.config.ts define proyectos, baseURL, timeouts y reporter.
- npx playwright test ejecuta la suite.

## 2. Estructura de una prueba y aserciones

Una prueba describe escenario, preparación, acción y comprobación. test() registra el caso; page controla una pestaña; expect valida resultados. Prefiere aserciones de locator que esperan condiciones visibles o de URL.

- El test debe poder ejecutarse sin otro test previo.
- El estado inicial debe ser conocido y controlado.
- Verifica resultado de negocio y no solo que ocurrió un click.

## 3. Primer ciclo de depuración

Ejecuta una prueba, observa error, revisa locator, estado y condición esperada; corrige la causa y vuelve a ejecutar. El modo UI y las trazas facilitan comprender dónde cambió la interfaz.

- npx playwright test --ui: interfaz de ejecución.
- npx playwright test --headed: muestra navegador.
- npx playwright show-report: inspecciona los resultados.

## Ejemplo trabajado: Primera prueba con SauceDemo

El usuario de demostración inicia sesión y llega al inventario de productos.

1. Inicializa el proyecto y confirma dependencias.
2. Crea tests/login.spec.ts.
3. Ejecuta npx playwright test.
4. Verifica que la URL corresponde al inventario.

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

- getByRole("button", { name:"Guardar" }) identifica una acción clara.
- getByLabel("Correo") conecta con la etiqueta de formulario.
- getByTestId("order-total") usa un identificador destinado a pruebas.
- Refina con filter o .getByRole en un contenedor específico.

## 2. Auto-waiting y reintentos automáticos

Playwright comprueba condiciones de acción como visibilidad y posibilidad de interacción antes de actuar. Las aserciones como toBeVisible o toHaveText reintentan hasta cumplir o agotar tiempo. Esto es distinto de fijar un sleep de 5 segundos, que falla según latencia.

- No reemplaces aserciones por page.waitForTimeout().
- Espera un estado observable: URL, texto, respuesta o elemento.
- Evita comprobar detalles que no representen reglas del usuario.

## 3. Locators estrictos y debugging

Si un locator encuentra varios elementos, una acción estricta puede fallar. No lo resuelvas automáticamente con .first(): revisa si el selector expresa el elemento correcto o necesita un contenedor.

- Selecciona el botón dentro del modal correspondiente.
- Las etiquetas accesibles mejoran testing y usabilidad.
- Fallas de locator pueden revelar problemas de accesibilidad.

## Ejemplo trabajado: Esperar un mensaje de confirmación

Tras guardar un perfil aparece una alerta con el texto “Cambios guardados”.

1. Buscar botón por rol y nombre.
2. Ejecutar la acción con await.
3. Verificar alerta, no dormir el navegador.

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

- frameLocator("#checkout-frame").getByRole(...).
- page.waitForEvent("popup") junto con el click que abre la pestaña.
- locator.setInputFiles("fixtures/documento.pdf") para cargas.
- Combina comprobaciones de UI con la respuesta de API solo cuando sea útil.

## 2. Observabilidad de errores

Trace Viewer permite estudiar capturas, acciones, red y DOM durante una ejecución fallida. Un buen diagnóstico identifica el motivo: selector equivocado, estado imprevisto, datos compartidos, dependencia de ambiente o defecto del producto.

- Configura trace: "on-first-retry" si hay retries.
- Conserva reportes como evidencia, sin secretos.
- Reproduce una falla antes de aumentar timeouts sin criterio.

## 3. Diseñar un E2E de valor

Elige un viaje que importe al negocio, por ejemplo comprar un producto. Prepara sus precondiciones, utiliza datos estables, valida cada transición significativa y verifica resultado final de pedido. Evita que una sola prueba cubra todos los caminos posibles.

- Compra válida.
- Stock insuficiente o carrito vacío.
- Datos de envío inválidos.

## Ejemplo trabajado: Abrir una pestaña nueva de forma segura

Una aplicación de ejemplo abre un comprobante en una pestaña distinta.

1. Prepara la escucha del evento antes del click.
2. Realiza la acción que abre el popup.
3. Espera su carga y valida un título relevante.

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

- testDir: directorio de especificaciones.
- use.baseURL: dominio base del ambiente.
- use.trace: política de trazas.
- projects: navegadores y perfiles diferentes.

## 2. Cross-browser con sentido

Chromium, Firefox y WebKit implementan motores distintos. Prueba flujos de riesgo en navegadores relevantes para el producto. No necesitas correr cada caso trivial en cada navegador si el costo supera el valor, pero la decisión debe ser explícita.

- La matriz de cobertura depende de tus usuarios y contratos.
- Las capturas o trazas de un navegador no representan todos.
- Aísla datos que puedan colisionar en ejecuciones simultáneas.

## 3. Test isolation y retries

Cada test debe disponer de estado inicial controlado. Hooks y fixtures ayudan a prepararlo; una prueba no debe requerir que otra corra primero. Los retries ayudan a diagnosticar una falla intermitente, pero no reemplazan su corrección.

- Evita compartir el mismo usuario mutable en tests paralelos.
- Diferencia test flaky de falla reproducible del producto.
- Ejecuta casos individualmente y en conjunto para revelar acoplamientos.

## Ejemplo trabajado: Configuración multiplataforma

Una suite pequeña valida login en Chromium, Firefox y WebKit.

1. Importa defineConfig y devices.
2. Define tres projects y reporter HTML.
3. Ejecuta solo una combinación para depurar.

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

- Una LoginPage conoce usuario, contraseña y botón de acceso.
- El test decide qué escenario ejecutar y qué resultado de negocio comprobar.
- Evita clases gigantes que mezclen navegación, APIs, datos y todas las aserciones.

## 2. Principios de diseño aplicados

Responsabilidad única, bajo acoplamiento y nombres expresivos son más valiosos que una estructura con muchas carpetas. No conviertas cada click en una capa de abstracción vacía; reutiliza interacciones con significado de negocio.

- Prefiere loginPage.iniciarSesion(...) a util.click("#btn1").
- Declara locators dentro del Page Object.
- Mantén valores específicos del escenario en el test o los datos de prueba.

## 3. Cuándo considerar Screenplay

Screenplay describe actores, habilidades, tareas, interacciones y preguntas. Puede ayudar en procesos complejos y multiplataforma, pero añade conceptos que conviene dominar después de escribir una suite idiomática de Playwright. En un producto pequeño POM suele ser suficiente.

- Actor ejecuta una tarea del dominio.
- Pregunta evalúa un estado observable.
- Compara costo de abstracción con el valor real para el equipo.

## Ejemplo trabajado: Separación entre Page Object y test

El test determina el comportamiento esperado. La página encapsula el formulario.

1. Crea una clase para LoginPage.
2. Expón un método iniciarSesion(usuario, clave).
3. Usa la clase desde el test y valida la URL con expect.

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

- La fixture se crea cuando se usa (bajo demanda).
- El alcance por test favorece aislamiento.
- Puedes preparar antes de await use(...) y limpiar después.

## 2. Estado autenticado y datos

storageState permite reutilizar datos de sesión de manera controlada. Un estado de autenticación puede contener cookies o tokens sensibles: no lo subas a repositorios públicos. Para pruebas que modifican información usa usuarios distintos o restablece los datos entre ejecuciones.

- Guarda sesiones en carpetas ignoradas por Git.
- Usa usuarios de pruebas y ambientes no productivos.
- Evita dependencia de un registro creado por otro test.

## 3. Setup, teardown y diseño de datos

El setup crea condiciones conocidas; teardown libera recursos cuando corresponde. Para suites paralelas considera datos únicos, limpieza e idempotencia. Un test confiable no depende de residuos de ejecuciones anteriores.

- Crea un pedido vía API antes del test si es posible.
- Elimina o invalida recursos al cerrar.
- Si el teardown falla, conserva evidencia para investigar.

## Ejemplo trabajado: Fixture propia para usuario de práctica

La fixture entrega credenciales no sensibles y aisladas para tests de SauceDemo.

1. Importa test como base.
2. Define el tipo de fixture.
3. Inyecta el objeto al test mediante el argumento.

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

- request.get("/recurso") envía una consulta.
- request.post("/recurso", {data:{...}}) envía JSON.
- response.ok() indica estado exitoso 2xx.
- response.json() es asíncrono: utiliza await.

## 2. Separar contratos de comportamiento

Una prueba de API puede cubrir autenticación, validación, reglas del dominio y estados de error. Las validaciones de esquema no reemplazan escenarios de negocio: un saldo numérico puede ser incorrecto aunque pase el contrato.

- Prueba respuestas 2xx y los errores documentados.
- Comprueba tipos, límites y relaciones entre propiedades.
- Verifica efectos persistentes cuando es relevante.

## 3. API como herramienta de preparación de UI

Crear un usuario, pedido o carrito vía API suele ser más rápido que recorrer la interfaz para cada precondición. Reserva la UI para el comportamiento que realmente quieres verificar. Elimina los datos al terminar si aplica.

- Usa datos únicos por test.
- Aísla tokens y URLs de ambiente.
- Documenta cualquier dependencia de servicio externo.

## Ejemplo trabajado: Prueba API sencilla con request

Una API pública de ejemplo devuelve registros de usuarios por identificador; en un proyecto real verifica el contrato.

1. Envía un GET.
2. Comprueba estado exitoso.
3. Lee JSON y valida campos relevantes.

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

- route.fulfill puede suministrar un body controlado.
- route.continue permite seguir con la petición.
- route.abort simula ciertas fallas de red.
- Documenta claramente qué pruebas usan mocks.

## 2. Configuración por ambientes

Separa URLs, usuarios y parámetros de ejecución entre local, QA y staging. Aplica variables de entorno y validaciones de configuración. No hardcodees secretos en archivos de pruebas o logs de la pipeline.

- process.env.BASE_URL ?? "http://localhost:3000"
- Falla temprano si falta una variable obligatoria.
- Nunca imprimas Authorization o cookies en evidencias públicas.

## 3. Elegir abstracciones avanzadas

Antes de agregar capas, pregunta qué repetición eliminarán, cuánto costará mantenerlas y quién las comprenderá. POM es una buena base; Screenplay puede aportar valor en dominios con interacciones de negocio reutilizadas, pero no es un requisito de Playwright.

- Empieza pequeño, refactoriza con evidencia de duplicación.
- Prefiere convenciones y ejemplos coherentes en el README.
- Añade mocks sin convertir toda la suite en una simulación.

## Ejemplo trabajado: Mock controlado de catálogo

Una prueba necesita mostrar un solo producto sin depender del backend de inventario.

1. Intercepta solo el endpoint relevante.
2. Entrega un JSON válido según contrato.
3. Valida que la UI muestre el producto.

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

- push ejecuta al actualizar una rama según condiciones.
- pull_request valida antes de integrar contribuciones.
- jobs y steps organizan las acciones.
- Usa permisos mínimos para tokens y secretos.

## 2. Workflow para Playwright

En GitHub Actions, el runner instala Node, dependencias y navegadores compatibles antes de ejecutar Playwright. npm ci requiere lockfile reproducible. Los artefactos conservan reportes y trazas para investigar fallos.

- actions/checkout obtiene el código.
- actions/setup-node configura Node.
- npx playwright install --with-deps instala browsers y dependencias del sistema.
- upload-artifact conserva el reporte incluso con fallos (if: always()).

## 3. Diagnóstico y seguridad en CI

Aislar secretos, documentar dependencias y evitar pruebas que modifican producción son requisitos básicos. Si la suite falla solo en CI, compara variables de ambiente, baseURL, tiempos, concurrencia y dependencias.

- No incluyas tokens en archivos de reporte compartidos.
- No ejecutes destructivos en producción.
- Agrega un README con pasos para reproducir localmente.

## Ejemplo trabajado: Workflow mínimo GitHub Actions

Ejecuta los tests en cambios y guarda el HTML report.

1. Crear .github/workflows/playwright.yml.
2. Confirmar package-lock.json con npm install.
3. Subir cambios y abrir pull request.
4. Consultar artefacto y ejecución.

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

- Reproduce varias veces y registra condiciones.
- Compara ejecución local, CI y navegador.
- Clasifica causa: test, datos, ambiente, producto o dependencia externa.

## 2. Paralelización y sharding

Playwright puede distribuir tests entre workers y fragmentos de suite. Cuanta más concurrencia, más importante es aislar cuentas, pedidos, archivos temporales y estados de infraestructura. Mide el beneficio real; más workers no siempre significan menos tiempo.

- Evita fixtures globales mutables.
- Usa recursos únicos por test o por worker.
- Define un límite razonable de concurrencia para el ambiente.

## 3. Métricas que aportan valor

Tiempo total de suite, porcentaje de ejecuciones inestables, fallos por causa, cobertura de riesgos y tiempo de recuperación ayudan a tomar decisiones. El número bruto de tests por sí solo no refleja protección ante fallos críticos.

- Conserva tendencias comparables a lo largo del tiempo.
- Separa fallo del producto de fallo del test.
- Asigna responsables a la corrección de inestabilidad.

## Ejemplo trabajado: Investigar un flaky login

Un test falla 1 de cada 10 ejecuciones: se intenta hacer click antes de que el botón esté habilitado.

1. Reproduce con repeat-each y guarda trazas.
2. Descarta datos de sesión compartidos.
3. Usa un locator semántico y espera el estado habilitado si corresponde.
4. Verifica si el comportamiento del producto realmente cambia.

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

- Identifica actores, reglas críticas y datos.
- Establece criterios de entrada/salida y fuera de alcance.
- Prioriza por impacto y probabilidad.

## 2. Matriz de trazabilidad

Relaciona cada historia y criterio con el caso manual, la prueba automatizada y el resultado de ejecución. Esto hace visible qué reglas están protegidas y cuáles no. Mantén IDs estables y específicos.

- HU-01 / CA-01 → CP-001 → login.spec.ts → Passed.
- HU-02 / CA-03 → CP-011 → checkout.spec.ts → Failed.
- Riesgo de pago duplicado → test crítico prioritario.

## 3. Diseñar una combinación UI + API

La UI comprueba flujos visibles y experiencia de usuario; la API valida reglas a nivel servicio y puede preparar datos. Evita duplicar idénticas comprobaciones en cada capa sin justificar el riesgo. Define pruebas smoke rápidas y regresión más extensa.

- Construye tests independientes y reproducibles.
- Mantén datos fuera de credenciales reales.
- Recoge traces y reportes desde el inicio.

## Ejemplo trabajado: Plan de proyecto integrador

Proyecto de tienda web demo: 4 historias, 20 casos manuales y 25 tests automatizados.

1. Login: 6 casos (incluye bloqueo y credenciales erróneas si la demo los soporta).
2. Catálogo: 5 casos (listado, detalle y búsqueda).
3. Carrito: 5 casos (agregar, retirar, totales).
4. Checkout: 4 casos (datos válidos e inválidos).
5. Automatización: distribuir 25 pruebas justificando capa UI/API y disponibilidad de servicios.

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

- Describe qué funcionalidades se prueban y cuáles no.
- Incluye pasos exactos para ejecutar localmente y en CI.
- Explica la política de secretos y cómo configurarlos.
- Agrega ejemplos visuales de reportes sin datos sensibles.

## 2. Presentar decisiones de calidad

En una demo no recorras archivo por archivo. Cuenta un problema: cuál era el riesgo, qué escenario lo cubre, qué arquitectura elegiste, cómo se ejecuta automáticamente y qué indica el resultado. Incluye fallos controlados y evidencia.

- Minuto 1: producto, objetivo y riesgos.
- Minutos 2–3: caso manual, prueba y arquitectura.
- Minuto 4: pipeline y trace de un fallo.
- Minuto 5: resultados, limitaciones y próximos pasos.

## 3. Evaluación final del nivel QA Automation

Demuestra pensamiento de riesgo, diseño de pruebas, TypeScript legible, locators semánticos, tests aislados, datos, API, CI y diagnóstico. El certificado personal de aprendizaje no sustituye una certificación externa ni experiencia laboral real.

- Una prueba que falla informa algo relevante y diagnosticable.
- La cobertura responde a riesgos conocidos.
- La documentación permite que otra persona ejecute la suite.

## Ejemplo trabajado: Guion de demostración de cinco minutos

Escenario: cambios en checkout no deben introducir cobros o totales incorrectos.

1. Abre matriz de riesgos y explica la prioridad.
2. Muestra CP-014 y su implementación automatizada.
3. Ejecuta la prueba y enseña el reporte.
4. Abre una traza previamente capturada para mostrar diagnóstico.
5. Concluye con cobertura y riesgos pendientes.

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

