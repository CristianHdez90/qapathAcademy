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
