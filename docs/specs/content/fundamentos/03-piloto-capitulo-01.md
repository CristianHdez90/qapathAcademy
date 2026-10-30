# 03 · Piloto editorial completo · Capítulo 01

**FND-C01 · Tipos de pruebas de software: qué evaluamos y cómo**
Semana 1 · Fase G2 · solo documentación · pendiente de revisión del responsable

| Metadato | Valor |
|---|---|
| Duración estimada | 35–45 min (lectura + minitests + actividad) |
| Requisito para avanzar | Leer las 8 tarjetas y aprobar ≥ 70 % de sus minitests (D-05) |
| Fuentes | F02 §2.2.2 (tipos), cap. 3 (estáticas), §4.2–4.4 (técnicas); F06 (ISO/IEC 25010:2023) |
| Caso | ReservaYa · HU-RES-01 |

---

## 1. Situación inicial (tarjeta de apertura, sin minitest)

> **Lunes, refinamiento del sprint 14.** Valeria (PO) lee la HU-RES-01: «quiero reservar un bloque disponible sin que el mismo turno se asigne a dos personas». Andrés (backend) dice: «Listo, lo pruebo con un par de clics». Tomás (QA) levanta la mano: «¿Probamos que reserve, que lo haga rápido con 200 personas a la vez, que se pueda usar con teclado… o todo?».
>
> Cuatro personas acaban de usar la palabra «probar» y cada una piensa en algo distinto. En este capítulo aprenderás a ponerle nombre a cada una de esas preguntas.

**Pregunta para empezar** (sin calificación): ¿cuántas *preguntas distintas* sobre calidad escuchas en la escena? *Respuesta orientativa: al menos tres. ¿Hace lo que debe? ¿Con qué calidad lo hace (rapidez, accesibilidad)? ¿Cómo diseñamos la comprobación?*

## 2. Objetivos comprobables

Al terminar podrás:

1. **Distinguir** una prueba funcional de una no funcional con un ejemplo de ReservaYa.
2. **Explicar** por qué caja negra y caja blanca son otro eje, combinable con el anterior.
3. **Diferenciar** una prueba estática de una dinámica.
4. **Clasificar** una prueba en al menos tres dimensiones y justificar cada una.

## 3. Tarjetas de concepto (una a la vez, cada una con su minitest)

> El minitest aparece cuando el rastreador de lectura verifica que la tarjeta se leyó (06 §3). Las respuestas se corrigen en el servidor. Las opciones se barajan, pero se identifican por ID estable.

### FND-W01-C01-T01 · Probar es obtener información

- **Objetivo:** reconocer que el testing aporta evidencia sobre riesgos y no solo «busca errores al final».
- **Contexto:** la reserva doble se descubrió en producción en otra app del mismo centro.
- **Explicación:** el **testing** es el conjunto de actividades que evalúan un producto y sus artefactos para encontrar defectos y obtener información sobre su calidad. **QA** (aseguramiento de calidad) mejora el *proceso* para prevenir problemas. **QC** (control de calidad) verifica el *producto*. Una persona comete un **error**, que introduce un **defecto** en el código o en un documento, y ese defecto, al ejecutarse, puede producir un **fallo** visible.
- **Ejemplo:**
  - *Situación:* Andrés olvidó bloquear el turno mientras se confirma (error). El código permite dos inserciones (defecto). Dos usuarios ven «Reserva confirmada» para las 10:00 (fallo).
  - *Decisión QA:* registrar el fallo con pasos reproducibles y preguntar en la retrospectiva qué práctica habría prevenido el error, que es una mejora de QA.
  - *Evidencia:* reporte con dos confirmaciones del mismo bloque y la hora del servidor.
- **Minitest 1:** Dos usuarios reciben la confirmación del mismo turno. ¿Qué observaste?
  - A) Un error · *Feedback: el error es la acción humana que lo originó (olvidar el bloqueo). Lo que tú viste es su consecuencia.*
  - **B) Un fallo** ✓ · *Feedback: correcto. Es el comportamiento incorrecto observable al ejecutar. El defecto está en el código y el error fue humano.*
  - C) Una mejora de QA · *Feedback: una mejora de QA actuaría sobre el proceso, por ejemplo con revisiones de concurrencia. No es lo que se observa.*
- **Minitest 2:** La suite de ReservaYa pasa al 100 %. ¿Qué puedes afirmar?
  - A) Que no hay defectos · *Feedback: las pruebas muestran presencia, no ausencia, de defectos (lo verás en C05).*
  - **B) Que los casos ejecutados no encontraron fallos y el riesgo cubierto bajó** ✓ · *Feedback: la información vale para lo que probaste, no para todo el producto.*
  - C) Que ya no hace falta revisar requisitos · *Feedback: las revisiones encuentran defectos que la ejecución no ve.*

### FND-W01-C01-T02 · Pruebas funcionales: ¿hace lo que debe?

- **Objetivo:** identificar pruebas que evalúan comportamiento frente a requisitos.
- **Contexto:** reglas RES-R1 a RES-R4.
- **Explicación:** una prueba **funcional** evalúa *qué* hace el sistema: sus funciones frente a lo especificado o esperado (CTFL §2.2.2). Responde a «¿cumple la regla?».
- **Ejemplo:**
  - *Situación:* reservar el martes a las 09:00 cuando hoy es miércoles.
  - *Decisión QA:* esperar el rechazo con el mensaje «No puedes reservar en el pasado» (RES-R1).
  - *Evidencia:* captura del mensaje y respuesta API `422` con el código `PAST_SLOT`.
- **Minitest:** ¿Cuál es una prueba funcional de ReservaYa?
  - **A) Verificar que un segundo usuario recibe «conflicto» si el turno ya fue tomado** ✓ · *Feedback: evalúa la regla RES-R3, es decir, qué debe hacer el sistema.*
  - B) Medir que la confirmación tarde menos de 2 s con 200 usuarios · *Feedback: eso mide con qué rapidez lo hace. Es no funcional (eficiencia de desempeño).*
  - C) Revisar que el código use transacciones · *Feedback: es una revisión basada en la estructura (y estática), no una evaluación del comportamiento.*

### FND-W01-C01-T03 · Pruebas no funcionales: ¿con qué calidad lo hace?

- **Objetivo:** relacionar las pruebas no funcionales con características de calidad.
- **Contexto:** el lunes a las 8:00 se abren los turnos de la semana y entran cientos de personas.
- **Explicación:** una prueba **no funcional** evalúa *cómo de bien* se comporta el sistema. El modelo ISO/IEC 25010:2023 organiza la calidad del producto en nueve características: adecuación funcional, eficiencia de desempeño, compatibilidad, capacidad de interacción, fiabilidad, seguridad, mantenibilidad, flexibilidad y protección (*traducción editorial, verificación V-01*). La adecuación funcional se cubre con pruebas funcionales; las otras se evalúan con no funcionales.
- **Ejemplo:**
  - *Situación:* 200 solicitudes simultáneas de reserva.
  - *Decisión QA:* acordar con Valeria un objetivo medible (por ejemplo, el 95 % de las confirmaciones en menos de 2 s, cifra **ficticia del caso**) y medirlo en staging.
  - *Evidencia:* informe de la herramienta de carga con percentiles y errores.
- **Minitest:** «La pantalla de reserva se puede completar solo con teclado y un lector de pantalla anuncia el turno elegido». ¿Qué característica evalúa?
  - A) Adecuación funcional · *Feedback: la reserva funciona igual; lo que cambia es cómo interactúa la persona con ella.*
  - **B) Capacidad de interacción (accesibilidad)** ✓ · *Feedback: es una característica no funcional del modelo 25010:2023, que antes se llamaba usabilidad.*
  - C) Mantenibilidad · *Feedback: la mantenibilidad se refiere a modificar el producto, no a usarlo.*

### FND-W01-C01-T04 · Caja negra: diseño desde la especificación

- **Objetivo:** reconocer pruebas diseñadas sin mirar la estructura interna.
- **Contexto:** Tomás solo tiene la HU y sus reglas.
- **Explicación:** en una prueba de **caja negra** los casos se derivan de la especificación o del comportamiento esperado, sin usar la estructura interna (CTFL §2.2.2 y técnicas en §4.2, como particiones de equivalencia o valores límite). Sirve tanto para objetivos funcionales como no funcionales.
- **Ejemplo:**
  - *Situación:* RES-R2 dice «bloques de una hora».
  - *Decisión QA:* valores límite: 09:00 (válido), 09:30 (inválido), 23:00 (último bloque si el centro cierra a medianoche).
  - *Evidencia:* tabla entrada → resultado esperado → obtenido.
- **Minitest:** Una prueba de carga que solo envía peticiones HTTP a la API de reservas y mide tiempos, sin mirar el código, es…
  - **A) No funcional y de caja negra** ✓ · *Feedback: evalúa desempeño (no funcional) y se diseña desde la interfaz externa (caja negra). Los dos ejes se combinan.*
  - B) Funcional y de caja negra · *Feedback: no comprueba reglas de negocio, sino tiempos.*
  - C) No funcional y de caja blanca · *Feedback: no usa la estructura interna para diseñar el caso.*

### FND-W01-C01-T05 · Caja blanca: diseño desde la estructura

- **Objetivo:** reconocer pruebas basadas en el código, la arquitectura o el flujo interno.
- **Contexto:** Andrés escribió `if (slot.taken) return CONFLICT`.
- **Explicación:** en la **caja blanca** los casos se derivan de la estructura interna: sentencias, ramas o flujos de datos (CTFL §2.2.2 y §4.3). La cobertura mide cuánto de esa estructura ejercitaron las pruebas. Tampoco equivale a «no funcional»: puedes cubrir ramas de una regla de negocio.
- **Ejemplo:**
  - *Situación:* la función tiene dos ramas: libre → reservar; ocupado → conflicto.
  - *Decisión QA/DEV:* un caso por rama y revisar el informe de cobertura de ramas.
  - *Evidencia:* informe con el 100 % de las ramas de `reserveSlot` cubiertas. Eso no significa que esté libre de defectos.
- **Minitest:** ¿Qué afirmación es correcta?
  - A) La caja blanca solo la hace DEV · *Feedback: suele hacerla DEV, pero QA también puede diseñar casos desde la estructura. La responsabilidad es del equipo.*
  - **B) Una prueba de caja blanca puede comprobar una regla funcional** ✓ · *Feedback: cubrir la rama «ocupado → conflicto» verifica RES-R3 con un diseño basado en la estructura.*
  - C) 100 % de cobertura significa que no hay defectos · *Feedback: la cobertura mide qué se ejecutó, no si todo es correcto.*

### FND-W01-C01-T06 · Técnicas basadas en la experiencia

- **Objetivo:** valorar el conocimiento del probador como fuente de casos.
- **Contexto:** Tomás recuerda que en otra app los turnos fallaban al cambiar de horario de verano.
- **Explicación:** las técnicas **basadas en la experiencia** (CTFL §4.4) usan el conocimiento y la intuición del equipo: predicción de errores, prueba exploratoria y listas de comprobación. Complementan, no sustituyen, a las técnicas sistemáticas.
- **Ejemplo:**
  - *Situación:* predicción de errores sobre fechas.
  - *Decisión QA:* probar la reserva a las 23:00 del día previo al cambio horario y con la zona horaria del navegador distinta a la del servidor.
  - *Evidencia:* nota de exploración con hallazgos y datos usados.
- **Minitest:** ¿Qué es predicción de errores?
  - **A) Anticipar defectos probables a partir de experiencia y fallos conocidos** ✓ · *Feedback: es una técnica basada en experiencia (§4.4).*
  - B) Calcular la probabilidad de fallo con estadística · *Feedback: eso se parece a análisis de riesgo, no a esta técnica.*
  - C) Ejecutar todos los casos posibles · *Feedback: las pruebas exhaustivas son imposibles (C05).*

### FND-W01-C01-T07 · Estáticas y dinámicas: ¿ejecutamos o no?

- **Objetivo:** diferenciar evaluar sin ejecutar de evaluar ejecutando.
- **Contexto:** la HU dice «el turno se libera si no se confirma».
- **Explicación:** las **pruebas estáticas** examinan productos de trabajo (requisitos, historias, código) **sin ejecutarlos**, mediante revisiones o análisis estático (CTFL cap. 3). Las **dinámicas** ejecutan el software. Las estáticas encuentran defectos antes y más barato, como ambigüedades en un requisito.
- **Ejemplo:**
  - *Situación:* en la revisión, Tomás pregunta: «¿se libera en cuánto tiempo?».
  - *Decisión QA:* registrar la ambigüedad antes de que se escriba código. Valeria fija 5 minutos.
  - *Evidencia:* comentario en la HU con la regla nueva RES-R5.
- **Minitest:** Revisar la HU-RES-01 y descubrir que «se libera» no tiene tiempo definido es…
  - **A) Una prueba estática** ✓ · *Feedback: encontraste un defecto en un requisito sin ejecutar nada.*
  - B) Una prueba dinámica · *Feedback: no se ejecutó software.*
  - C) No es testing · *Feedback: la revisión es una actividad de testing (cap. 3 del CTFL).*

### FND-W01-C01-T08 · Combinar dimensiones sin confundirlas

- **Objetivo:** describir una prueba con varias dimensiones simultáneas.
- **Contexto:** el equipo prepara el sprint y anota cada prueba en el tablero.
- **Explicación:** una misma prueba puede describirse por su **objetivo** (funcional / no funcional), su **base de diseño** (caja negra / caja blanca / experiencia) y su **ejecución** (estática / dinámica). No son sinónimos ni opuestos: «funcional = caja negra» es falso como regla general.
- **Ejemplo:**
  - *Situación:* «comprobar con un lector de pantalla que el mensaje de conflicto se anuncia».
  - *Decisión QA:* etiquetarla como no funcional (capacidad de interacción) · caja negra · dinámica.
  - *Evidencia:* grabación del lector de pantalla y criterio WCAG de referencia.
- **Minitest:** Selecciona la clasificación correcta para «revisar el código de `reserveSlot` buscando una condición de carrera».
  - A) Funcional · caja negra · dinámica · *Feedback: no se ejecuta y se mira el interior.*
  - **B) Funcional · caja blanca · estática** ✓ · *Feedback: busca un defecto en el comportamiento esperado (RES-R3), usando la estructura y sin ejecutar.*
  - C) No funcional · caja negra · estática · *Feedback: sí es estática, pero mira el interior, y la condición de carrera rompe una regla funcional.*

## 4. Caso de equipo (tarjeta de cierre narrativo)

| Paso | Quién | Qué ocurre | Evidencia |
|---|---|---|---|
| 1 | Valeria (PO) | Presenta HU-RES-01 con sus reglas | HU en el tablero |
| 2 | Tomás (QA) | Revisión estática: detecta la ambigüedad «se libera» | Comentario y RES-R5 |
| 3 | Andrés (backend) | Diseña la reserva atómica | PR con la prueba de componente por rama |
| 4 | Lucía (frontend) | Pregunta cómo validar la accesibilidad del mensaje de conflicto | Criterio de aceptación añadido |
| 5 | Equipo | Clasifica 6 pruebas en el tablero con las 3 dimensiones | Tabla del entregable |

## 5. Grafo de relaciones

Fuente en 05 §C01. Muestra tres ejes independientes (**objetivo**, **base de diseño** y **ejecución**) con flechas desde cuatro pruebas concretas de ReservaYa hacia una opción de cada eje. **Alternativa textual:** «Prueba de carga por API → no funcional, caja negra, dinámica. Revisión de `reserveSlot` → funcional, caja blanca, estática. Valor límite 09:30 → funcional, caja negra, dinámica. Lector de pantalla → no funcional, caja negra, dinámica.»

## 6. «Así se aplica» · globos por estado

Flujo «Clasificar una prueba antes del sprint»: tres estados. Cada nodo abre su globo (interacción en 06 §2).

| Estado | Acciones del globo | Responsable posible | Evidencia | Resultado |
|---|---|---|---|---|
| 1. Leer la intención | Identificar la regla o característica afectada · preguntar «¿qué riesgo cubre?» | QA con PO | Regla RES-Rn o característica 25010 | Objetivo definido (funcional / no funcional) |
| 2. Elegir la base de diseño | Decidir si se deriva de la especificación, la estructura o la experiencia · elegir la técnica (límites, ramas, predicción) | QA y DEV | Técnica anotada en el caso | Caja negra, blanca o experiencia |
| 3. Decidir cómo se evalúa | ¿Revisión sin ejecutar o ejecución? · ¿en qué ambiente? | Equipo | Tipo de evidencia esperada | Estática o dinámica, y criterio de salida |

## 7. Interacción · clasificador de 6 tarjetas

Instrucción: «Para cada prueba elige una opción en **cada** eje.» Se usan selectores accesibles (06 §4) y no hace falta arrastrar.

| # | Prueba | Objetivo | Base | Ejecución | Feedback clave |
|---|---|---|---|---|---|
| 1 | Reservar a las 09:30 y esperar el rechazo | Funcional | Negra | Dinámica | Valor límite de RES-R2 |
| 2 | 200 reservas simultáneas midiendo percentiles | No funcional | Negra | Dinámica | Desempeño medido desde fuera |
| 3 | Revisar la HU buscando ambigüedades | Funcional | Negra (especificación) | Estática | Se revisa la especificación, sin código |
| 4 | Cubrir las ramas libre/ocupado de `reserveSlot` | Funcional | Blanca | Dinámica | Cobertura de ramas |
| 5 | Navegar la reserva solo con teclado | No funcional | Negra | Dinámica | Capacidad de interacción |
| 6 | Explorar las zonas horarias con predicción de errores | Funcional | Experiencia | Dinámica | Técnica de §4.4 |

Es formativa: no cuenta para la nota. Hay un feedback por eje y se puede reintentar. Las elecciones se guardan como borrador local (06 §5).

## 8. Transferencia · entregable

**Tabla de 6 pruebas de ReservaYa**, con estas columnas: prueba · objetivo · base de diseño · ejecución · evidencia esperada · riesgo que cubre. La rúbrica pide al menos una prueba no funcional, una estática y una de caja blanca, y una justificación de una línea por eje. Se descarga como plantilla `.md` (07 §2).

## 9. Cierre del capítulo

- **Resumen en 3 líneas:** el objetivo dice *qué* evalúas · la base de diseño dice *desde dónde* diseñas · la ejecución dice *si ejecutas*.
- **Glosario:** prueba funcional, no funcional, caja negra, caja blanca, basada en experiencia, estática, dinámica, error, defecto, fallo.
- **Resultado del capítulo:** «Minitests: x/9 correctos · Aprobado con ≥ 7» (8 tarjetas, 9 preguntas: T01 tiene 2).
- **Siguiente:** C02, donde el defecto de doble reserva ya está corregido. ¿Qué vuelves a probar?

## 10. Checklist DoR del piloto (SPEC §3.2)

- [x] Objetivos observables (4)
- [x] Terminología contrastada con F02, F06 (V-01 pendiente)
- [x] Caso con datos sintéticos
- [x] 8 tarjetas, grafo y 3 globos
- [x] Interacción con solución, distractores y feedback
- [x] Trazabilidad de progreso (06 §3, 07 §3)
- [x] Riesgos de accesibilidad identificados (06)
