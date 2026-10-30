# 01 · Matriz curricular y fuentes

Fase G1 · solo documentación · 2026-10-29

## 1. Estructura TO-BE: 8 capítulos, 4 por semana

| Semana | Cap. | ID | Título | Resultado observable | Tarjetas | Preguntas de minitest | Interacción principal | Entregable |
|---|---|---|---|---|---|---|---|---|
| 1 | 01 | `FND-C01` | Tipos de pruebas: qué evaluamos y cómo | Clasifica una prueba por objetivo, técnica y ejecución sin confundir las dimensiones | 8 | 9 | Clasificador de 6 tarjetas en 3 dimensiones | Tabla de 6 pruebas de ReservaYa |
| 1 | 02 | `FND-C02` | Enfoques y estrategias de pruebas | Elige smoke, re-test, regresión, exploratoria y automatización tras un cambio | 9 | 9 | Simulador «tienes 30 minutos» | Mini plan de pruebas |
| 1 | 03 | `FND-C03` | Cinco niveles de prueba según ISTQB | Asigna 7 ejemplos al nivel CTFL más representativo, distinguiendo las dos integraciones | 8 | 8 | Selector de nivel (con alternativa a arrastrar) | Matriz nivel / objetivo / responsabilidad / evidencia |
| 1 | 04 | `FND-C04` | Pirámide de Cohn y trabajo conjunto QA–DEV | Rediseña una suite de 70 E2E en una cartera equilibrada | 8 | 8 | Distribuir 12 escenarios por capa | Propuesta de suite por riesgo y tiempo |
| 2 | 05 | `FND-C05` | Los siete principios del testing | Justifica decisiones del sprint con el principio que aplica | 8 | 8 | «Decide con criterio»: 7 microescenarios | Priorización de 5 riesgos + mejora temprana |
| 2 | 06 | `FND-C06` | Mapa definitivo de clasificaciones | Describe una misma prueba con varias etiquetas simultáneas y justifica cada una | 10 | 10 | Clasificador multidimensional | Chuleta propia |
| 2 | 07 | `FND-C07` | Behavior-Driven Development (BDD) | Redacta escenarios Dado/Cuando/Entonces a partir de ejemplos descubiertos en equipo | 8 | 8 | Constructor de Gherkin | 3 escenarios + preguntas al PO |
| 2 | 08 | `FND-C08` | Deployment, release y ambientes | Decide entre release, mantener el flag desactivado o hacer rollback a partir de evidencia | 9 | 9 | Simulador «release o rollback» | Checklist de salida + **Plan QA final** |
| | | | **Total** | | **68** | **69** | 8 | 8 + Plan QA |

Cada capítulo sigue la secuencia SPEC §2.1: situación inicial → objetivos → tarjetas (cada una con su minitest) → caso de equipo → grafo → «Así se aplica» con globos → interacción → transferencia → cierre del capítulo. La «Comprueba lo aprendido» del SPEC se convierte en **minitest por tarjeta** (RQ-05, ver 06 §3).

## 2. Resultados de aprendizaje (SPEC §1.2) por capítulo

| Resultado | C01 | C02 | C03 | C04 | C05 | C06 | C07 | C08 |
|---|---|---|---|---|---|---|---|---|
| 1. Clasificar por dimensiones independientes | ● | ● | ○ | | | ● | | |
| 2. Cinco niveles CTFL y la simplificación de cuatro | | | ● | ○ | | ● | | |
| 3. Seleccionar comprobaciones por nivel | | ○ | ● | ● | | ○ | | |
| 4. Pirámide como heurística de cartera | | | ○ | ● | | ● | | |
| 5. Siete principios, incluida la actualización de pruebas | | ○ | | | ● | | | |
| 6. Escenarios BDD | | | ○ | | | | ● | |
| 7. Deployment ≠ release; ambientes y datos | | | | ○ | | | | ● |
| 8. Recomendación de entrega basada en riesgo | | ● | | ● | ● | ○ | | ● |

● objetivo principal · ○ refuerzo

## 3. Caso transversal ReservaYa

| Elemento | Definición |
|---|---|
| Producto | ReservaYa, una **aplicación ficticia** de reserva de turnos para un centro de servicios. No usa datos personales ni médicos reales |
| Equipo Scrum | Valeria (PO), Tomás (QA), Lucía (frontend), Andrés (backend), Marta (DevOps). Todos los nombres son ficticios |
| HU-RES-01 | «Como usuario autenticado, quiero reservar un bloque disponible para obtener una cita sin que el mismo turno sea asignado a dos personas.» |
| Reglas | RES-R1: no reservar en el pasado · RES-R2: bloques de una hora · RES-R3: conflicto si otro usuario reservó antes · RES-R4: confirmación visible en la interfaz |
| Hilo del sprint | C01 se pregunta qué evaluar → C02 el defecto de doble reserva y su corrección → C03 el proveedor de notificaciones responde 503 → C04 70 E2E lentos → C05 se prueban botones y no la concurrencia → C06 dudas del equipo nuevo → C07 refinamiento con ejemplos → C08 despliegue el jueves con flag OFF y release el lunes al 10 % |

## 4. Fuentes verificadas el 2026-10-29

| ID | Fuente | Tipo | Versión / fecha | Verificado | Uso |
|---|---|---|---|---|---|
| F01 | [ISTQB — CTFL v4.0](https://www.istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/) | Primaria | La página enlaza el **Syllabus v4.0.1** como vigente; no anuncia una versión posterior | 2026-10-29 | Marco normativo |
| F02 | [ISTQB CTFL Syllabus v4.0.1 (PDF)](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTFL_Syllabus_v4.0.1.pdf) | Primaria | Release **2024-09-15** | 2026-10-29 | §1.3 principios · §2.2.1 **cinco niveles** · §2.2.2 tipos · §2.2.3 confirmación/regresión · cap. 3 pruebas estáticas · §4.2–4.4 técnicas · §5.1.6 pirámide · §5.1.7 cuadrantes |
| F03 | [Glosario ISTQB — confirmation testing](https://glossary.istqb.org/en_US/term/confirmation-testing) | Primaria | En línea | 2026-10-29 (la página carga sus datos con JavaScript; la definición se tomó del syllabus §2.2.3) | Re-test |
| F04 | [Cucumber — BDD](https://cucumber.io/docs/bdd/) | Primaria (comunidad) | En línea | 2026-10-29 | Descubrimiento, formulación y automatización |
| F05 | [Cucumber — Gherkin reference](https://cucumber.io/docs/gherkin/reference/) y [idiomas](https://cucumber.io/docs/gherkin/languages) | Primaria | En línea | 2026-10-29 | Cabecera `# language: es`; palabras clave: Característica, Antecedentes, Regla, Escenario/Ejemplo, Esquema del escenario, Ejemplos, Dado/Dada/Dados/Dadas, Cuando, Entonces, Y, Pero |
| F06 | [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html) | Primaria (resumen público) | Ed. 2, nov. 2023, publicada | 2026-10-29 | La página confirma **nueve características**, pero no las nombra |
| F07 | [W3C WCAG 2.2](https://www.w3.org/TR/WCAG22/) | Primaria | Recommendation **2024-12-12** | 2026-10-29 | 1.4.13 (AA) · 2.2.1 (A) · 2.3.3 (AAA, objetivo deseable) · 2.4.11 (AA) · 2.5.7 (AA) · 2.5.8 (AA) · 4.1.2 |
| F08 | [Ham Vocke — The Practical Test Pyramid](https://martinfowler.com/articles/practical-test-pyramid.html) (martinfowler.com) | Secundaria explicativa | 2018-02-26 | 2026-10-29 | Origen en Cohn, *Succeeding with Agile*; capas unit/service/UI; no hay proporciones fijas; antipatrón del cono de helado |
| F09 | Atlassian, IBM, Cooltesters, TestingIT, Hiberus (enlaces en SPEC §08) | Secundaria | — | No consultadas | Inspiran solo preguntas frecuentes. No se copia texto, tablas ni gráficos (SPEC §3.1-8) |

### Precisiones normativas que el contenido debe respetar

1. **CTFL §2.2.2 llama «tipos de prueba» a funcional, no funcional, caja negra y caja blanca.** Las técnicas concretas están en el capítulo 4. Por eso C01 enseña: «el syllabus agrupa las cuatro como *tipos*. Funcional/no funcional responden a *qué* evaluamos; caja negra/blanca responden a *en qué nos basamos para diseñar* (especificación o estructura). Son ejes combinables». No es correcto afirmar que el CTFL no las considera tipos.
2. **Cinco niveles** (§2.2.1). Los cursos que enseñan cuatro agrupan las dos integraciones; se etiqueta como «simplificación tradicional».
3. **Principio 5**: el CTFL v4.0.1 lo titula «Tests wear out» (las pruebas se desgastan). «Paradoja del pesticida» es el nombre tradicional del syllabus 2018.
4. **Confirmación** = confirma que el defecto original se corrigió. **Regresión** = confirma que el cambio no causó consecuencias adversas (§2.2.3).
5. **Nombres de ISO/IEC 25010:2023.** La página pública solo confirma nueve características. La lista que se usa (adecuación funcional, eficiencia de desempeño, compatibilidad, capacidad de interacción, fiabilidad, seguridad, mantenibilidad, flexibilidad y protección) es una **traducción editorial**. Antes de publicar debe contrastarse con el texto de la norma, como verificación pendiente **V-01**.
6. **BDD**: Cucumber describe la automatización como la tercera práctica. El contenido dice «la automatización es parte habitual del proceso, pero el valor empieza en el descubrimiento, y no requiere Cucumber ni otra herramienta concreta».
7. **Smoke y sanity** son términos de práctica de la industria, sin definición normativa rígida en el syllabus. **E2E no es un nivel ISTQB.**

## 5. Originalidad y datos

- Todo el texto, ejemplo, diagrama y pregunta de esta carpeta es redacción original para QAPath Academy.
- Las citas normativas son títulos breves (≤ 8 palabras) traducidos y atribuidos.
- No se usan datos personales, credenciales ni pruebas destructivas en producción.
