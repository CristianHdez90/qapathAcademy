# 04 · Contenido de los 8 capítulos

Fase G1 · solo documentación · 2026-10-29. Todos los textos son originales y el caso es ReservaYa (01 §3).

**Cómo leer este documento:**

- El capítulo 01 está completo en [03](03-piloto-capitulo-01.md); aquí solo se resume.
- Cada tarjeta se presenta en formato compacto: **explicación** · *ejemplo (situación → decisión → evidencia)* · **minitest**.
- En cada minitest, ✓ marca la opción correcta y ✗ los distractores, todos con su feedback.
- Los globos y diagramas de cada capítulo están en [05](05-grafos-y-demostraciones.md).

---

## Semana 1

### CAPÍTULO 01 · Tipos de pruebas: qué evaluamos y cómo

Ver piloto (03).

| Tarjetas | Interacción | Entregable |
|---|---|---|
| T01 Probar es obtener información · T02 Funcionales · T03 No funcionales (ISO 25010:2023) · T04 Caja negra · T05 Caja blanca · T06 Basadas en experiencia · T07 Estáticas y dinámicas · T08 Combinar dimensiones | Clasificador de 6 pruebas en 3 ejes | Tabla de 6 pruebas |

### CAPÍTULO 02 · Enfoques y estrategias: cuándo, para qué y de qué modo

**Situación inicial.** Viernes, 16:30. Andrés corrigió la doble reserva. La demo con Valeria es a las 17:00. Tomás tiene 30 minutos: ¿qué prueba primero?

**Objetivos:**

1. Separar alcance, propósito, relación con cambios, estilo y forma de ejecución.
2. Diferenciar re-test de regresión.
3. Elegir comprobaciones según tiempo y riesgo, y justificar el riesgo residual.

**FND-W01-C02-T01 · Una estrategia combina ejes.** «E2E», «smoke», «regresión», «exploratoria» y «automatizada» responden a preguntas distintas: hasta dónde llega la prueba, para qué se ejecuta ahora, qué relación tiene con un cambio, cómo se diseña y quién o qué la ejecuta. *Ejemplo: un recorrido E2E automatizado puede formar parte del smoke → se etiqueta en tres ejes → la etiqueta aparece en el plan.*
Minitest: «Smoke» describe…
- ✓ El propósito de una ejecución rápida tras una build: comprobar que lo crítico funciona antes de seguir.
- ✗ Un nivel de prueba: smoke no es un nivel ISTQB.
- ✗ Una técnica de caja blanca: smoke no dice cómo se diseña.

**T02 · E2E: alcance de punta a punta.** Recorre un flujo completo del usuario a través de las capas e integraciones: interfaz → API → base → notificación. No es un nivel ISTQB ni equivale a «todas las pruebas de sistema». *Ejemplo: iniciar sesión → elegir un bloque → confirmar → recibir correo simulado → evidencia: traza de Playwright y correo en el buzón falso.*
Minitest: ¿Qué afirmación es correcta?
- ✓ Una prueba E2E suele ejecutarse en el nivel de sistema o de integración de sistemas, pero E2E describe su alcance.
- ✗ E2E es el sexto nivel ISTQB: el CTFL define cinco.
- ✗ Toda prueba de sistema es E2E: puedes probar una sola función del sistema completo.

**T03 · Smoke: ¿vale la pena seguir?** Es un subconjunto pequeño de comprobaciones críticas que se ejecuta tras una build o un despliegue. Es un término de práctica, con alcance definido por cada equipo. *Ejemplo: tras desplegar en QA → login, listar turnos, reservar uno → si algo falla, la build se rechaza → evidencia: informe de 3 pruebas en verde con hora.*
Minitest: El smoke de QA falla en «listar turnos». ¿Qué haces?
- ✓ Detener las pruebas detalladas y avisar: la build no es apta para seguir.
- ✗ Ejecutar toda la regresión igualmente: gastarías tiempo en una build rota.
- ✗ Marcar el sprint como fallido: la decisión es sobre la build, no sobre el sprint.

**T04 · Sanity: revisión focalizada.** Es una comprobación rápida y acotada de que un cambio concreto parece razonable antes de invertir más esfuerzo. Su significado **varía entre equipos**: el glosario del equipo debe definirlo. *Ejemplo: tras cambiar el texto del mensaje de conflicto → verificar solo ese mensaje en 2 navegadores → evidencia: 2 capturas.*
Minitest: ¿Qué es lo más honesto decir sobre «sanity»?
- ✓ Que es un término de práctica cuyo alcance se acuerda en cada equipo.
- ✗ Que el CTFL lo define como nivel: no lo hace.
- ✗ Que es igual que la regresión completa: la regresión es amplia y la sanity, focalizada.

**T05 · Re-test o prueba de confirmación.** Confirma que **el defecto original** se corrigió (CTFL §2.2.3). Se repiten los pasos del reporte, con los mismos datos si es posible. *Ejemplo: reproducir dos confirmaciones simultáneas de las 10:00 → solo una queda confirmada y la otra recibe conflicto → evidencia: reporte cerrado con resultado y build.*
Minitest: Andrés corrigió la doble reserva. ¿Qué es el re-test?
- ✓ Ejecutar el escenario del reporte para confirmar que ese defecto ya no ocurre.
- ✗ Ejecutar toda la suite: eso es (parte de) la regresión.
- ✗ Explorar zonas nuevas: es exploratoria, con otro objetivo.

**T06 · Regresión.** Confirma que un cambio **no causó efectos adversos** en lo que ya funcionaba (§2.2.3). Se elige por impacto: zonas cercanas al cambio y flujos críticos. Repetirla es valioso; lo que se desgasta son pruebas que nunca evolucionan (C05). *Ejemplo: tras corregir la concurrencia → cancelar reserva, reprogramar, notificaciones → evidencia: suite de regresión con resultados.*
Minitest: ¿Por qué hacer regresión si el re-test pasó?
- ✓ Porque el arreglo pudo romper otras funciones, como cancelar o reprogramar.
- ✗ Porque el re-test no sirve: sí sirve, pero para otra pregunta.
- ✗ Por costumbre, sin criterio: se selecciona por riesgo.

**T07 · Exploratoria con misión y pruebas basadas en casos.** La exploratoria diseña, ejecuta y aprende a la vez, guiada por una misión (*charter*) y con notas. Las pruebas basadas en casos siguen pasos y resultados documentados antes. Ambas conviven. *Ejemplo: misión «explorar reservas cuando la conexión se corta al confirmar, 20 min» → notas con 2 hallazgos → evidencia: hoja de sesión.*
Minitest: ¿Qué hace profesional a una sesión exploratoria?
- ✓ Una misión, un tiempo acotado y notas de lo probado y hallado.
- ✗ Hacer clics al azar sin registro: sin misión ni notas no hay evidencia.
- ✗ Convertirla siempre en casos escritos antes: entonces deja de ser exploratoria.

**T08 · Manual y automatizada.** Es la forma de ejecución, independiente del objetivo: hay pruebas funcionales y no funcionales en ambos modos. Automatizar conviene cuando la prueba se repite, es estable y su valor supera el costo de mantenerla. *Ejemplo: el re-test de concurrencia se automatiza a nivel de API, mientras la evaluación de la claridad del mensaje sigue siendo manual → evidencia: PR de la prueba y nota de la revisión manual.*
Minitest: ¿Qué candidata conviene automatizar primero?
- ✓ La comprobación de conflicto por API, que se repetirá en cada build.
- ✗ Juzgar si el texto del mensaje es amable: es una valoración humana.
- ✗ Una pantalla que cambiará la semana próxima: es inestable y el mantenimiento sería alto.

**T09 · Priorizar por riesgo.** El riesgo combina la **probabilidad** de un problema y su **impacto**. Con poco tiempo se prueba primero lo de mayor riesgo y se declara qué queda sin cubrir (riesgo residual). *Ejemplo: 30 minutos → re-test (10), smoke (5), regresión de cancelación (10), exploratoria de la red (5) → la reprogramación queda sin probar y se informa → evidencia: plan con el riesgo residual escrito.*
Minitest: Con 30 minutos, ¿qué es imprescindible comunicar?
- ✓ Qué no se probó y qué riesgo queda.
- ✗ Que se probó todo: es imposible y además falso.
- ✗ Solo el número de casos ejecutados: la cantidad no informa del riesgo.

**Interacción · simulador «tienes 30 minutos»:** el alumno elige entre 8 comprobaciones con un costo en minutos y redacta en una línea el riesgo residual. Hay feedback por cada elección. Se aceptan combinaciones distintas si incluyen re-test y una regresión justificada (AC-08). Incluye un árbol de decisión (05 §C02).
**Entregable:** mini plan con smoke, re-test, regresión, una misión exploratoria y un candidato a automatización.

### CAPÍTULO 03 · Cinco niveles ISTQB: qué pieza o integración observamos

**Situación inicial.** El correo de confirmación no llega. ¿Falla nuestro servicio de reservas, la base de datos o el proveedor externo de notificaciones? Para saberlo hay que elegir **qué pieza o qué integración** observar.

**Objetivos:**

1. Nombrar los cinco niveles del CTFL v4.0.1.
2. Distinguir integración de componentes de integración de sistemas.
3. Explicar la simplificación de cuatro niveles.
4. Asignar responsabilidades compartidas.

**T01 · Nivel no es tipo.** Un **nivel** agrupa actividades de prueba según el **objeto** (de un componente al sistema en su entorno) y tiene sus propios objetivos y base de prueba. Un **tipo** dice qué característica se evalúa. Se combinan: una prueba de sistema puede ser funcional o no funcional. *Ejemplo: «carga en staging del sistema completo» → nivel: sistema · tipo: no funcional.*
Minitest: ¿Cuál es un nivel de prueba según el CTFL?
- ✓ Integración de componentes.
- ✗ Regresión: es un tipo de prueba relacionado con cambios.
- ✗ Smoke: es un propósito de ejecución.

**T02 · Componente (unitaria).** Prueba componentes aislados; suele necesitar dobles de prueba. *Ejemplo: `isPastSlot(fecha)` con hoy y ayer → evidencia: prueba de componente en el PR.*
Minitest: Probar `isPastSlot` sin base de datos ni red es…
- ✓ De componente.
- ✗ De sistema: no participa el sistema completo.
- ✗ De aceptación: no la valida el negocio.

**T03 · Integración de componentes.** Prueba las interfaces e interacciones **entre componentes del mismo sistema**. *Ejemplo: el servicio de reservas guarda en el repositorio y una segunda inserción del mismo bloque se rechaza por la restricción única → evidencia: prueba con una base efímera.*
Minitest: Servicio de reservas + repositorio de PostgreSQL de ReservaYa:
- ✓ Integración de componentes.
- ✗ Integración de sistemas: ambos son parte de ReservaYa.
- ✗ Componente: participan dos piezas.

**T04 · Sistema.** Evalúa el comportamiento y las capacidades del **sistema completo**, a menudo extremo a extremo, incluidas sus características no funcionales. *Ejemplo: reservar desde la interfaz en el ambiente QA → evidencia: casos ejecutados con capturas.*
Minitest: ¿Qué prueba es de nivel sistema?
- ✓ Reservar, cancelar y ver el historial en la aplicación completa en QA.
- ✗ Probar solo `isPastSlot`: es de componente.
- ✗ Que Valeria valide la necesidad: es de aceptación.

**T05 · Integración de sistemas.** Prueba las interfaces entre el sistema y **otros sistemas o servicios externos**. *Ejemplo: el proveedor de notificaciones responde 503 → reintento controlado y la reserva queda consistente → evidencia: contrato y traza anonimizada (globos en 05 §C03).*
Minitest: ReservaYa ↔ proveedor externo de notificaciones:
- ✓ Integración de sistemas.
- ✗ Integración de componentes: el proveedor no es parte del sistema.
- ✗ Aceptación: no se valida la necesidad del usuario.

**T06 · Aceptación: ¿construimos lo correcto?** Valida que el sistema satisface necesidades y está listo para usarse. La **verificación** pregunta «¿cumple lo especificado?»; la **validación**, «¿sirve a quien lo usa?». Existen variantes: de usuario, operacional, contractual, alfa/beta. *Ejemplo: Valeria y dos usuarios piloto reservan su turno real ficticio → «sí, resuelve nuestro problema» → evidencia: acta de aceptación.*
Minitest: La aceptación responde principalmente a…
- ✓ ¿El producto resuelve la necesidad del negocio o del usuario?
- ✗ ¿Cada función cumple su especificación técnica? Eso es sobre todo verificación.
- ✗ ¿Qué porcentaje de código se cubrió? Es una métrica de caja blanca.

**T07 · ¿Por qué algunos cursos enseñan 4 niveles?** Muchas introducciones agrupan las dos integraciones en un único nivel de integración. Es una **simplificación tradicional**; el CTFL v4.0.1 enumera cinco. *Ejemplo: en un curso aparece «unitaria, integración, sistema, aceptación» → se traduce a los cinco del CTFL.*
Minitest: Un curso muestra cuatro niveles. ¿Qué haces?
- ✓ Reconocer que agrupa las dos integraciones y usar los cinco del CTFL v4.0.1.
- ✗ Asumir que el CTFL tiene cuatro: enumera cinco.
- ✗ Descartar el curso: la simplificación es útil si se explica.

**T08 · Responsabilidad compartida.** No hay niveles «de DEV» ni «de QA». Hay participaciones habituales: DEV escribe la mayoría de las pruebas de componente, QA aporta ideas de casos, y negocio lidera la aceptación con apoyo del equipo. *Ejemplo: Tomás revisa los casos límite de la prueba de componente de Andrés → evidencia: comentario en el PR.*
Minitest: ¿Qué afirmación es correcta?
- ✓ La calidad es responsabilidad de todo el equipo; los roles describen participaciones habituales.
- ✗ Las unitarias son exclusivamente de DEV: QA también aporta casos.
- ✗ La aceptación es exclusivamente de QA: la lidera negocio.

**Interacción:** asignar 7 ejemplos al nivel más representativo, con una lista de selección accesible y la opción de arrastrar como alternativa (AC-19). El feedback explica los matices de contexto.
**Entregable:** matriz nivel / objetivo / responsable habitual / evidencia para HU-RES-01.

### CAPÍTULO 04 · Pirámide de Cohn: cartera, costo y responsabilidades

**Situación inicial.** La suite de ReservaYa tiene 70 E2E. Tarda 50 minutos y falla 1 de cada 5 veces sin cambios (cifras **ficticias**). Nadie confía en el rojo.

**Objetivos:**

1. Explicar la forma de la pirámide sin porcentajes obligatorios.
2. Mover pruebas a la capa adecuada.
3. Distinguir la pirámide de los niveles ISTQB y de los cuadrantes.

**T01 · Origen y forma.** Mike Cohn propuso la pirámide (*Succeeding with Agile*) con capas de unidad, servicio e interfaz: **muchas pruebas rápidas y aisladas abajo, pocas pruebas amplias arriba** (F02 §5.1.6, F08). Los nombres de las capas varían. *Ejemplo: dibujar la suite actual → resulta un cono invertido.*
Minitest: La pirámide recomienda…
- ✓ Más pruebas pequeñas y rápidas y menos recorridos amplios.
- ✗ Exactamente 70/20/10: no hay proporciones obligatorias.
- ✗ Eliminar los E2E: se mantienen pocos y de alto valor.

**T02 · Base: reglas puras, feedback en segundos.** Las reglas como RES-R1 o RES-R2 se prueban en la capa de componente. *Ejemplo: 12 E2E de validación de fechas → 12 pruebas de componente en 0,5 s → evidencia: tiempo antes y después.*
Minitest: «No reservar en el pasado» probado 12 veces por la interfaz. ¿Qué propones?
- ✓ Moverlo a pruebas de componente y dejar como mucho un E2E representativo.
- ✗ Añadir más E2E: más lentitud.
- ✗ Dejar de probarlo: es una regla de negocio.

**T03 · Medio: servicios y contratos.** Las interacciones entre API, base y proveedores se prueban en la capa de servicio o integración, por ejemplo con pruebas de contrato. *Ejemplo: contrato del proveedor de notificaciones verificado sin interfaz → evidencia: prueba de contrato en CI.*
Minitest: ¿Dónde pruebas mejor que la API devuelve 409 en un conflicto?
- ✓ En la capa de servicio o API.
- ✗ Solo por la interfaz: es más lento y frágil.
- ✗ En una prueba de componente sin API: no ejercita el contrato HTTP.

**T04 · Cima: pocos E2E de alto valor.** Se reservan para los recorridos críticos del usuario. *Ejemplo: quedan 6 E2E (reservar, cancelar, reprogramar, login, notificación y pago, si existiera) → evidencia: lista de recorridos críticos.*
Minitest: ¿Qué recorrido merece un E2E?
- ✓ Reservar un turno de punta a punta.
- ✗ El color del botón en cada página: se verifica de forma más barata.
- ✗ Cada validación de campo: va en la base.

**T05 · Antipatrón: cono de helado.** Pasa cuando hay muchas pruebas manuales o E2E arriba y pocas abajo. El síntoma es un feedback lento y pruebas inestables (*flaky*). *Ejemplo: el estado actual de ReservaYa → plan de 3 sprints para invertirlo.*
Minitest: El síntoma típico del cono de helado es…
- ✓ Un feedback lento y fallos intermitentes difíciles de diagnosticar.
- ✗ Demasiadas pruebas de componente: es el patrón opuesto.
- ✗ Ningún E2E: no es el cono.

**T06 · Pirámide ≠ niveles ISTQB.** La pirámide es un **modelo de cartera de automatización**; los niveles son una clasificación de actividades de prueba. No coinciden uno a uno: la capa «servicio» puede abarcar integración de componentes y de sistemas. *Ejemplo: el contrato con el proveedor es integración de sistemas y vive en la capa media.*
Minitest: ¿Qué afirmación es correcta?
- ✓ La pirámide orienta la automatización; los niveles describen qué objeto se prueba.
- ✗ Cada capa es un nivel: no hay correspondencia uno a uno.
- ✗ La pirámide sustituye a los niveles: se complementan.

**T07 · Cuadrantes: otro mapa.** Los cuadrantes de prueba (F02 §5.1.7) clasifican las pruebas según estén orientadas al negocio o a la tecnología y según apoyen al equipo o critiquen el producto. Ayudan a no olvidar las pruebas no funcionales ni las exploratorias. No reemplazan la pirámide. *Ejemplo: la carga y la accesibilidad aparecen en el cuadrante de crítica tecnológica.*
Minitest: ¿Para qué sirven los cuadrantes?
- ✓ Para revisar que la estrategia cubre distintas perspectivas, como negocio, tecnología, apoyo y crítica.
- ✗ Para fijar cuántas pruebas automatizar: eso no lo dicen.
- ✗ Para reemplazar la pirámide: es un mapa complementario.

**T08 · Feedback en el PR.** En cada PR se ejecutan primero las pruebas rápidas, luego las de integración y después los flujos críticos. Así el testing acompaña cada fase del ciclo de vida (relación SDLC/STLC del AS-IS) y no queda solo para el final. *Ejemplo: el pipeline de ReservaYa (05 §C04) → evidencia: tiempos por etapa.*
Minitest: ¿Qué orden de ejecución da el feedback más rápido?
- ✓ Componente → integración/servicio → E2E críticos.
- ✗ Primero los E2E: son lo más lento.
- ✗ Todo al final del sprint: el feedback llega tarde.

**Interacción:** distribuir 12 escenarios por capa y por participación habitual (QA, DEV, negocio, colaborativo). El feedback muestra que la etiqueta de rol no sustituye la responsabilidad compartida (AC-05).
**Entregable:** propuesta de suite por riesgo y tiempo, con al menos una prueba por capa y una justificación.

---

## Semana 2

### CAPÍTULO 05 · Los siete principios del testing

**Situación inicial.** El equipo probó 40 variaciones del color de los botones y ninguna de concurrencia. El viernes apareció la doble reserva. Después corrigieron el módulo, pero siguieron usando los mismos datos de prueba de siempre.

**Objetivos:**

1. Enunciar los 7 principios con la terminología del CTFL v4.0.1.
2. Aplicar cada uno a una decisión del sprint.

**T01 · Presencia, no ausencia.** Las pruebas pueden mostrar que hay defectos; no pueden demostrar que no los hay. *Ejemplo: «0 fallos» en el informe → se comunica «sin fallos en los 45 casos ejecutados».*
Minitest: ¿Qué frase respeta el principio?
- ✓ «No encontramos fallos en los casos ejecutados.»
- ✗ «El sistema no tiene errores»: no se puede demostrar.
- ✗ «Si pasó todo, no hay riesgo»: siempre queda riesgo residual.

**T02 · Exhaustivas imposibles.** Salvo en casos triviales no se puede probar todo: se usan técnicas y prioridades. *Ejemplo: 365 días × 14 bloques × 3 sedes → particiones y valores límite.*
Minitest: ¿Qué haces frente a miles de combinaciones de fecha y hora?
- ✓ Particiones y valores límite priorizados por riesgo.
- ✗ Probarlas todas a mano: es inviable.
- ✗ No probar fechas: es una regla crítica.

**T03 · Pruebas tempranas.** Probar o revisar pronto ahorra tiempo y dinero. *Ejemplo: la revisión de la HU (C01-T07) evitó programar la regla equivocada de «se libera».*
Minitest: ¿Cuál es la actividad más temprana?
- ✓ Revisar la HU en refinamiento.
- ✗ El E2E tras el despliegue.
- ✗ La encuesta a los usuarios en producción.

**T04 · Los defectos se agrupan.** Pocos módulos suelen concentrar muchos defectos; ayuda a enfocar el esfuerzo. *Ejemplo: 6 de 8 defectos del trimestre están en concurrencia y fechas (datos ficticios) → más pruebas ahí.*
Minitest: Los datos muestran muchos defectos en «reprogramar». ¿Qué haces?
- ✓ Intensificar pruebas y revisiones en esa zona sin abandonar las demás.
- ✗ Probar todos los módulos por igual: ignora la evidencia.
- ✗ Solo probar «reprogramar»: los otros módulos siguen teniendo riesgo.

**T05 · Las pruebas se desgastan.** Si repites siempre las mismas pruebas con los mismos datos, dejan de encontrar defectos nuevos. Su nombre tradicional es «paradoja del pesticida». **Repetir la regresión sigue siendo valioso**: lo que hay que hacer es actualizarla. *Ejemplo: añadir datos de cambio horario y dos usuarios simultáneos a la suite.*
Minitest: La regresión lleva 6 meses sin encontrar nada. ¿Qué haces?
- ✓ Revisarla y añadir casos y datos nuevos, sin eliminar la protección existente.
- ✗ Borrarla: perderías protección ante cambios.
- ✗ Dejarla igual: se desgasta.

**T06 · Depende del contexto.** No se prueba igual una app de reservas, un videojuego o un marcapasos. *Ejemplo: ReservaYa prioriza concurrencia y accesibilidad; una landing page, la compatibilidad de navegadores.*
Minitest: ¿Qué estrategia es correcta?
- ✓ Adaptar técnicas y rigor al dominio, al riesgo y al equipo.
- ✗ Usar la misma checklist para cualquier producto.
- ✗ Copiar la estrategia de otra empresa sin analizarla.

**T07 · Falacia de la ausencia de defectos.** Un producto sin fallos detectados puede no servir a sus usuarios. *Ejemplo: la reserva funciona, pero exige 9 pasos y los usuarios llaman por teléfono → validar con usuarios (C03-T06).*
Minitest: Cero defectos y nadie usa la función. ¿Qué principio se ilustra?
- ✓ La falacia de la ausencia de defectos.
- ✗ Los defectos se agrupan.
- ✗ Las pruebas exhaustivas son imposibles.

**T08 · Los principios en el sprint.** Los principios no son una secuencia, sino criterios para decidir en cada actividad del sprint (refinamiento, desarrollo, antes de liberar). *Ejemplo: el grafo de 05 §C05 conecta cada principio con una decisión.*
Minitest: ¿Cómo se usan mejor los siete principios?
- ✓ Como criterios para justificar decisiones de prueba en cada momento del sprint.
- ✗ Como pasos obligatorios del 1 al 7.
- ✗ Solo para el examen: pierden su valor práctico.

**Interacción · «Decide con criterio»:** 7 microescenarios, uno por principio. El alumno elige el principio y la acción, y el feedback explica por qué las otras opciones son menos convenientes (AC-06).
**Entregable:** priorización de 5 riesgos de ReservaYa (probabilidad × impacto, con escala ficticia de 1 a 3) y una propuesta de mejora temprana de requisitos.

### CAPÍTULO 06 · Resolviendo dudas: mapa definitivo de clasificaciones

**Situación inicial.** Entra al equipo Sofía (QA junior, ficticia) y pregunta: «¿la prueba de Playwright del despliegue es E2E, smoke, de sistema o automatizada?». Respuesta: puede ser todo a la vez.

Cada tarjeta responde una pregunta obligatoria del SPEC §2.4 con redacción propia. Cada respuesta tiene 3–5 líneas y un ejemplo de ReservaYa.

| Tarjeta | Pregunta | Idea clave de la respuesta | Minitest (✓ correcta · ✗ distractores) |
|---|---|---|---|
| T01 | ¿Qué son las pruebas y por qué no son solo ejecutar casos? | Incluyen planificar, analizar, diseñar, revisar (estáticas), ejecutar y reportar | «Revisar una HU es testing» ✓ · «Solo cuenta ejecutar» ✗ · «Testing es solo automatizar» ✗ |
| T02 | ¿Qué diferencia nivel, tipo, técnica y estrategia? | Nivel = objeto · tipo = característica evaluada · técnica = cómo derivar casos · estrategia = plan combinado | «Valores límite es una técnica» ✓ · «es un nivel» ✗ · «es un tipo» ✗ |
| T03 | ¿4 o 5 niveles? | El CTFL v4.0.1 tiene 5; 4 es una simplificación tradicional | «Agrupa las dos integraciones» ✓ · «El CTFL eliminó aceptación» ✗ · «Son 6 con E2E» ✗ |
| T04 | ¿Por qué se combinan funcional/no funcional y caja negra/blanca? | Uno es *qué* se evalúa y el otro *desde dónde* se diseña | «Carga por API = no funcional + caja negra» ✓ · «funcional = negra siempre» ✗ · «no funcional = blanca» ✗ |
| T05 | ¿Re-test o regresión? | Re-test: el defecto original · regresión: los efectos del cambio | «Ambas tras un arreglo, con objetivos distintos» ✓ · «son sinónimos» ✗ · «solo regresión» ✗ |
| T06 | ¿Estática o dinámica? | Estática: antes y sin ejecutar · dinámica: el comportamiento real | «Revisar el contrato API antes de codificar = estática» ✓ · «una revisión es dinámica» ✗ · «las estáticas no encuentran defectos» ✗ |
| T07 | ¿En qué categoría están E2E, smoke, sanity y exploratoria? | E2E = alcance · smoke/sanity = propósito · exploratoria = estilo de diseño y ejecución | «Ninguna es un nivel ISTQB» ✓ · «E2E es un nivel» ✗ · «smoke es una técnica de caja blanca» ✗ |
| T08 | ¿Pirámide o cuadrantes? | La pirámide orienta la cartera automatizada; los cuadrantes, la cobertura de perspectivas | «Se complementan» ✓ · «son lo mismo» ✗ · «los cuadrantes fijan proporciones» ✗ |
| T09 | ¿Cómo selecciono por riesgo y capacidad? | Probabilidad × impacto, tiempo disponible, habilidades y herramientas, y declarar el riesgo residual | «Primero alto impacto y alta probabilidad» ✓ · «lo más fácil primero» ✗ · «por orden alfabético» ✗ |
| T10 | ¿Qué automatizo y qué dejo manual o exploratorio? | Automatizar lo repetitivo, estable y valioso; mantener manual o exploratorio lo que requiere juicio o cambia mucho | «Automatizar el conflicto 409 por API» ✓ · «automatizar el juicio de usabilidad» ✗ · «nada se automatiza» ✗ |

Cada distractor lleva un feedback de una línea, redactado como en el piloto.

**Interacción · clasificador multidimensional:** escenarios con **varias etiquetas simultáneas** por eje: nivel, objetivo, base, alcance, propósito, estilo y ejecución. Ejemplo: «Playwright comprueba la reserva de punta a punta tras un despliegue» → sistema · funcional · caja negra · E2E · smoke (si pertenece al subconjunto crítico) · automatizada. Si se marca una etiqueta condicional, el feedback explica la condición (AC-07).
**Entregable:** chuleta propia con glosario, tabla comparativa y 5 ejemplos de ReservaYa.

### CAPÍTULO 07 · Behavior-Driven Development (BDD)

**Situación inicial.** En el refinamiento, Valeria dice: «Dos usuarios no pueden tomar el mismo turno». Tomás pregunta: «¿Y si confirman en el mismo segundo?». Andrés se queda callado: acaba de ver la condición de carrera.

**Objetivos:**

1. Describir BDD como colaboración con ejemplos.
2. Formular escenarios Dado/Cuando/Entonces comprensibles y verificables.
3. Distinguir un escenario de negocio de un caso manual y de una aserción técnica.

**T01 · BDD es conversación, no sintaxis.** BDD es un proceso colaborativo de **descubrimiento**, **formulación** y **automatización** basado en ejemplos concretos (F04). Participan negocio, QA y desarrollo. No exige Cucumber. *Ejemplo: 20 minutos de conversación con Valeria antes de escribir nada.*
Minitest: ¿Qué es lo esencial de BDD?
- ✓ Acordar el comportamiento con ejemplos concretos entre negocio, QA y desarrollo.
- ✗ Escribir archivos `.feature`: es solo la formulación.
- ✗ Usar Cucumber: es una herramienta, no un requisito.

**T02 · Descubrimiento con ejemplos.** Se buscan reglas, ejemplos, contraejemplos y preguntas abiertas. *Ejemplo: regla RES-R3 → ejemplo «Ana reserva las 10:00 y Luis ve conflicto» → pregunta «¿se avisa a Luis de otros turnos?» → evidencia: tarjetas de la conversación.*
Minitest: ¿Qué aporta un contraejemplo en el descubrimiento?
- ✓ Revela casos límite y reglas ocultas, como la confirmación simultánea.
- ✗ Retrasa el sprint sin valor.
- ✗ Sustituye a los criterios de aceptación.

**T03 · Formulación en Gherkin.** El lenguaje Gherkin en español usa `# language: es` con Característica, Escenario, Dado, Cuando, Entonces, Y y Pero (F05). Cada escenario describe **una regla** con lenguaje de negocio. *Ejemplo: el escenario del SPEC §2.4, que se presenta como bloque de código accesible.*
Minitest: ¿Qué línea es un buen «Entonces»?
- ✓ «Entonces solo una reserva queda confirmada».
- ✗ «Entonces la tabla `bookings` tiene 1 fila»: es una aserción técnica.
- ✗ «Entonces hago clic en Aceptar»: es una acción, no un resultado.

**T04 · Automatización: el tercer paso, no el primero.** Los escenarios pueden conectarse a pruebas automatizadas. El valor empieza en el descubrimiento, y automatizar «casi al mismo tiempo» exige controlar la concurrencia y los datos. *Ejemplo: la prueba de API que lanza dos solicitudes con una barrera de sincronización.*
Minitest: ¿Qué hace falta para automatizar «ambos confirman casi al mismo tiempo»?
- ✓ Controlar la concurrencia y los datos para que la prueba sea reproducible.
- ✗ Dos personas haciendo clic a la vez: no es reproducible.
- ✗ Nada especial: el escenario no lo garantiza.

**T05 · Escenario, caso manual y aserción técnica.** El escenario expresa comportamiento de negocio. El caso manual detalla pasos de ejecución. La aserción técnica comprueba un detalle de implementación. Los tres son útiles en su lugar. *Ejemplo: la misma regla RES-R3 expresada en los tres formatos.*
Minitest: «1. Abrir /reservas · 2. Elegir 10:00 · 3. Pulsar Confirmar» es…
- ✓ Un caso manual con pasos.
- ✗ Un escenario BDD: está atado a la interfaz y no expresa la regla.
- ✗ Una aserción técnica.

**T06 · Escenarios ambiguos.** Palabras como «rápido», «correcto» o «varios» no son verificables; se sustituyen por ejemplos observables. *Ejemplo: «Entonces la reserva es rápida» → «Entonces la confirmación se muestra» más un criterio no funcional aparte.*
Minitest: ¿Cómo mejoras «Dado un turno cualquiera»?
- ✓ «Dado que el turno del martes a las 10:00 está disponible».
- ✗ Dejarlo igual: no es reproducible.
- ✗ «Dado un turno correcto»: sigue siendo ambiguo.

**T07 · Reglas y ejemplos con fecha pasada.** Se agrupan los escenarios por regla, con un ejemplo positivo, uno de conflicto y uno de fecha pasada. *Ejemplo: `Regla: no reservar en el pasado`, con su escenario.*
Minitest: ¿Qué conjunto cubre mejor HU-RES-01?
- ✓ Reserva exitosa, conflicto y fecha pasada.
- ✗ Tres variaciones de la reserva exitosa.
- ✗ Un único escenario con todas las reglas.

**T08 · Preguntas pendientes al PO.** Las dudas que surgen en el descubrimiento se registran y se resuelven antes de automatizar. *Ejemplo: «¿Cuánto dura el bloqueo temporal?», «¿Se notifica al perdedor del conflicto?».*
Minitest: ¿Qué haces con una pregunta abierta en el refinamiento?
- ✓ Registrarla y resolverla con el PO antes de comprometer el escenario.
- ✗ Inventar la respuesta.
- ✗ Ignorarla hasta producción.

**Interacción · constructor de Gherkin:** ordenar precondiciones, evento y resultados; detectar 3 escenarios ambiguos y reescribirlos con ejemplos observables. Funciona con teclado (botones «subir» y «bajar») o arrastrando (AC-19).
**Entregable:** 3 escenarios (positivo, conflicto, fecha pasada) más las preguntas al PO. Rúbrica en 06 §6 (AC-09).

### CAPÍTULO 08 · Deployment, release, feature flags y ambientes

**Situación inicial.** El jueves se **despliega** la reserva exclusiva en producción con el flag OFF. El lunes Valeria decide **lanzarla** al 10 % de los usuarios. ¿Qué pasó entre el jueves y el lunes?

**Objetivos:**

1. Diferenciar deployment de release.
2. Elegir el ambiente y los datos adecuados.
3. Decidir entre release, mantener el flag OFF o hacer rollback con evidencia.

**T01 · Deployment.** Es llevar una versión a un ambiente. *Ejemplo: v2.3 instalada en producción el jueves → evidencia: registro del pipeline.*
Minitest: El código está en producción con el flag OFF. ¿Hubo release?
- ✓ No: hubo deployment, pero los usuarios aún no tienen la función.
- ✗ Sí: deployment y release son lo mismo.
- ✗ Depende del navegador.

**T02 · Release.** Es poner la funcionalidad a disposición de los usuarios. Puede ocurrir después del deployment. *Ejemplo: el lunes se activa para el 10 % → evidencia: cambio del flag con hora y autor.*
Minitest: ¿Quién decide normalmente el release de negocio en ReservaYa?
- ✓ El PO, con evidencia del equipo.
- ✗ Solo QA.
- ✗ El pipeline, automáticamente, siempre.

**T03 · Feature flags.** Permiten activar, desactivar, medir y revertir funciones sin redesplegar. No son un control de seguridad por sí mismos. *Ejemplo: `reserva_exclusiva` ON para el grupo piloto.*
Minitest: ¿Qué NO garantiza un feature flag?
- ✓ Que el código oculto sea seguro frente a usuarios malintencionados.
- ✗ Que la función se pueda desactivar sin redesplegar: eso sí lo permite.
- ✗ Que se pueda lanzar a un grupo reducido: también lo permite.

**T04 · Lanzamiento progresivo.** La función se libera en porcentajes crecientes, observando métricas en cada paso. *Ejemplo: 10 % → 50 % → 100 %, condicionado a una tasa de conflictos y errores ficticia aceptable.*
Minitest: Al 10 % suben los errores 5xx. ¿Qué haces?
- ✓ Desactivar el flag y analizar antes de seguir.
- ✗ Subir al 100 % para tener más datos.
- ✗ Ignorarlo: es solo el 10 %.

**T05 · Ambientes frecuentes.** Local, QA, staging y producción, con propósitos distintos (tabla SPEC §2.4, cap. 08). **Varían según la organización.** *Ejemplo: el recorrido de ReservaYa en 05 §C08.*
Minitest: ¿Para qué sirve sobre todo staging?
- ✓ Para ensayar la configuración e integraciones cercanas a producción.
- ✗ Para atender a los usuarios reales.
- ✗ Para depurar en el portátil del desarrollador.

**T06 · Otros ambientes.** Hay sandbox, integración, UAT y entornos efímeros por PR. No todas las organizaciones los tienen. *Ejemplo: un ambiente efímero por PR para revisar la interfaz de reserva.*
Minitest: ¿Qué afirmación es correcta?
- ✓ Los ambientes dependen de cada organización y producto.
- ✗ Toda empresa tiene exactamente 4 ambientes.
- ✗ En QA solo se usan mocks.

**T07 · Datos en cada ambiente.** Se prefieren datos sintéticos. Si se copian datos reales, se enmascaran y autorizan. Nunca se exponen secretos. *Ejemplo: staging con usuarios generados como `usuario-0001@example.test`.*
Minitest: Te piden copiar la base de producción a QA. ¿Qué respondes?
- ✓ Preferir datos sintéticos; si es imprescindible copiar, enmascarar, autorizar y limitar el acceso.
- ✗ Copiar tal cual, que es más rápido.
- ✗ Compartir las credenciales de producción con el equipo.

**T08 · Smoke post-deployment y rollback.** Tras desplegar se ejecuta un smoke acotado. Si falla, se hace rollback o se mantiene el flag OFF según el riesgo. No se ejecutan pruebas destructivas en producción. *Ejemplo: smoke de lectura en producción → evidencia: resultado con hora.*
Minitest: ¿Qué prueba es aceptable en producción?
- ✓ Un smoke no destructivo y controlado.
- ✗ Una prueba de carga con reservas reales.
- ✗ Borrar reservas para probar la cancelación.

**T09 · Decisión de salida.** Se basa en evidencia: resultados, defectos abiertos, métricas, riesgo residual y plan de reversión. *Ejemplo: decidir el release al 10 % con un defecto menor conocido y documentado.*
Minitest: ¿Qué sustenta mejor la decisión de release?
- ✓ Evidencia de pruebas, métricas, riesgos aceptados y un plan de reversión.
- ✗ Que la fecha ya está comprometida.
- ✗ Que QA «tiene buena sensación».

**Interacción · simulador «release o rollback»:** 3 rondas con evidencia ficticia (resultados, errores de API, métricas). El alumno elige activar, mantener OFF o revertir y justifica en una línea. El feedback valora la justificación (AC-10).
**Entregable:** checklist de salida (ambiente, datos, smoke post-deployment, decisión de release) más el **Plan QA de ReservaYa** del módulo: matriz de 10 escenarios, 3 BDD, propuesta de pirámide, mapa de ambiente y release, y decisión de salida (AC-20). Es formativo y se descarga como plantilla. Que sea obligatorio queda en D-09.

---

## Resumen de minitests

| Cap. | Tarjetas | Preguntas | Aprobación del capítulo |
|---|---|---|---|
| C01 | 8 | 9 | ≥ 7 |
| C02 | 9 | 9 | ≥ 7 (70 % → redondeo hacia arriba) |
| C03 | 8 | 8 | ≥ 6 |
| C04 | 8 | 8 | ≥ 6 |
| C05 | 8 | 8 | ≥ 6 |
| C06 | 10 | 10 | ≥ 7 |
| C07 | 8 | 8 | ≥ 6 |
| C08 | 9 | 9 | ≥ 7 |
| **Total** | **68** | **69** | |

Umbral = ⌈0,7 × preguntas⌉.
