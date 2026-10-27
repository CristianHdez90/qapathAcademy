# SPEC-111 — Separar validadores de prácticas por estrategia

> Estado: **PROPUESTA — SIN AUTORIZACIÓN DE IMPLEMENTACIÓN**
> Tipo: refactor interno con caracterización; preservación de comportamiento.
> Línea base: main / b7a1cdaaf37f06cac2a5008158bd3fabc411c865.
> Hallazgo: TD-002 ↔ DT-02, reducción preparatoria parcial; propietario/aprobación PENDIENTE.
> Marco: [SPEC-100](SPEC-100-fase-2-reduccion-deuda-tecnica-to-be.md), [backlog](100-backlog-deuda-tecnica-priorizado.md), [R02/C05–C06](102-matriz-riesgos-regresion.md).

## 01. Intención
Hacer explícitas las estrategias de finalización de prácticas y caracterizar su compatibilidad para que una futura política de integridad pueda cambiarse con evidencia.

**Esta propuesta no endurece validaciones ni resuelve la confianza en el cliente.** Resultado medible: para un corpus sintético aprobado, mismo resultado booleano, mismo porcentaje y mismo tratamiento de errores antes/después, con despacho interno legible y sin framework en dominio.

## 02. Comportamiento

### AS-IS y contrato preservado
practiceCompleted(evidence, week): boolean lee exercise:week y JSON; solo validated puede completar. Retorna false ante errores.
- Semana 1 retorna directamente assessFoundationEvidence, antes de la comprobación genérica final.
- 4/5/6 validan estructuras específicas; 6 también requiere validatedAt.
- 8/9 aplican sus validadores especializados **solo cuando existe el notebook** correspondiente; si falta, pueden completar por el sobre genérico.
- El sobre exige data.week===week, ejecución, ok=true, modo permitido, source no vacío <=6000, output no vacío <=2500 y fecha parseable.
- Semana 8 permite sql/git; 9 code/git; la tabla de modos de todas las demás semanas se conserva literalmente.
- Se mantienen lectura de formatos antiguos, draft, normalización y cálculo automático. Un cambio aquí afecta carga de progreso guardado, no solo entregas nuevas.

Esta compatibilidad incluye casos débiles conocidos; se registra para no ocultar cambios funcionales bajo una extracción. No se presenta como objetivo de seguridad satisfactorio.

### Diseño TO-BE: antes → después
Antes: parseo, reglas por semana, modos y checks comunes mezclados en una función.
Después: misma fachada exportada, parseo/guardas comunes explícitos y registro interno de validadores especializados. Cada estrategia expresa si es terminal (semana 1) o agrega validación antes del sobre genérico. Ausencia/presencia de notebooks conserva exactamente la semántica actual.

No se crea un contrato público nuevo de error ni de versión; no se agrega un campo a la evidencia. Funciones auxiliares son internas y puras. No ejecutar código SQL/JS/Git remitido desde evidencia para validarla.

### Alternativas
1. Hacer obligatorios notebooks de 8/9: cambia aceptación y puede quitar progreso histórico; **fuera de alcance**, requiere SPEC funcional y aprobación de política/migración.
2. Crear motor de plugins extensible para 24 prácticas: demasiada superficie y nuevos contratos; no elegido.
3. Extraer estrategias internas conservando fachada y resultados: **elegida** por alcance acotado y reversión simple.
4. No refactorizar y solo añadir tests: alternativa válida si la caracterización muestra que la extracción no aporta claridad. En ese caso no ampliar implementación para justificar el cambio; reportar decisión.

### Alcance exacto futuro
| Ruta | Cambio previsto |
|---|---|
| `libs/progress/src/domain/practice-completion.ts` | Fachada, parseo y combinación de resultados, sin cambio de firma |
| `libs/progress/src/domain/practice-validation-strategies.ts` — NUEVO PROPUESTO | Estrategias puras internas y tabla de modos equivalente |
| `tests/practice-completion-characterization.test.mjs` — NUEVO PROPUESTO | Casos positivos/negativos, errores y porcentajes |
| `tests/helpers/practice-characterization.mjs` — NUEVO PROPUESTO | Corpus sintético legible sin datos reales ni copia paralela del algoritmo |
| Este Markdown | Evidencia/decisión de ejecución si se aprueba |

Los lectores y assess* de foundation/password/bug/sprint/sql/programming se consumen sin modificarlos. index.ts, contratos HTTP, normalizador, UI, tests antiguos y fixtures existentes se conservan. Si una prueba existente revela una necesidad fuera de lista, volver a G2/G3.

### Plan incremental futuro
1. Capturar casos esperados del comportamiento actual mediante fachada pública y datos sintéticos; revisar los casos débiles explícitamente.
2. Ejecutar caracterización antes del refactor en revisión conocida, tras autorización. Registrar resultados y skips, no asumir verde inicial.
3. Extraer el registro/estrategias sin mejorar expresiones, normalización, orden de checks ni límites.
4. Ejecutar el mismo corpus y suites especializadas; comparar los resultados y porcentaje derivado.
5. Revisar imports, API pública, diff y excepciones; mantener TD-002 abierto y proponer política funcional futura por separado.

### Criterios de aceptación
- CA-111-01: cero diferencias en booleano y porcentaje para el corpus aprobado de 24 semanas, múltiples modos y casos negativos; no es una prueba universal sobre todo JSON.
- CA-111-02: la ausencia de evidencia/JSON inválido/draft/mode inválido/ejecución fallida siguen dando false.
- CA-111-03: 8/9 sin notebook mantienen el resultado previo; notebook presente inválido/incompleto mantiene rechazo; notebook válido sigue pasando con sobre válido.
- CA-111-04: 4/5/6 conservan reglas especializadas; semana 1 no recibe nuevas guardas del sobre genérico.
- CA-111-05: límites source/output y semántica Date.parse/trim no cambian; cubrir 6000/6001 y 2500/2501, vacío y solo espacios.
- CA-111-06: cada excepción durante parseo o evaluación se traduce al mismo false, sin errores públicos nuevos.
- CA-111-07: lectura de evidencia histórica sintética no pierde texto ni progreso; no se persiste transformación.
- CA-111-08: sin imports React/Nest/SQL/Zod ni dependencias nuevas en dominio; API pública inalterada.
- CA-111-09: no se declara TD-002 completado: solo se acredita caracterización/estructura más separada.

### Pruebas y observabilidad futuras
Reutilizar practice-completion, progress-percentage, automatic-progress y las suites de las estrategias especializadas descritas en [102](102-matriz-riesgos-regresion.md). Corpus incluye caso común, falso positivo reconocido, falso negativo evitado, notebook ausente/incompleto, formatos antiguos y un caso por modo de cada semana.
No basta con copiar el algoritmo en un test que se compare consigo mismo. Los valores esperados deben derivarse de comportamiento caracterizado antes del cambio, revisado y congelado como casos concretos.
Integración/E2E selectiva: guardar/recargar semanas 1/4/5/6/8/9 y rechazos en cuenta de prueba cuando se autorice entorno; resto cubierto por corpus y smoke de ruta. No se modifica persistencia ni permisos.
Métrica: tabla caso→resultado antes/después y número de discrepancias (objetivo 0), no mejora de rendimiento asumida. No agregar telemetría del contenido.

### Riesgos y dependencias
R02: endurecimiento accidental; R13: cambio de orden de checks; R08: confundir pruebas simuladas con integración. Depende de caracterización y aceptación explícita de mantener compatibilidad; no requiere otra SPEC para redactarse.
Si se implementa después de 110, actualizar SHA base y repetir caracterización; no mezclar ambas en una aprobación genérica. La política pedagógica TD-002/016 sigue pendiente y no se resuelve por elegir un patrón de código.

### Rollback
Revertir únicamente la extracción y los auxiliares mediante nueva revisión, conservar datos sin tocar. Como no hay contrato ni dato nuevo, la fachada anterior debe leer exactamente el mismo corpus. Si aparece una diferencia de aceptación, detener G5 y corregir solo dentro del alcance o volver a G2; no desplegarla como “mejora”.

## 03. Restricciones
Preservar respuesta booleana, nombres públicos, modos, orden semántico, finalización y porcentajes. No crear score de confianza, firma de evidencia ni ejecutar motores del estudiante. No datos/DDL/manifest/CI/secretos.
Aprobación local no incluye PR/merge/deploy ni DB de pruebas; cada modalidad se acuerda expresamente.

## 04. No-Objetivos
No hacer obligatorios notebooks, verificar autenticidad de una ejecución, resolver las 24 misiones ni modificar objetivos de aprendizaje. No rediseñar todas las bibliotecas ni introducir un framework de validación.

## Evidencia AS-IS y trazabilidad
| Afirmación | Archivo/símbolo | Prueba/observación | Estado |
|---|---|---|---|
| Fachada y orden de checks | `libs/progress/src/domain/practice-completion.ts:9` — practiceCompleted | Código inspeccionado | CONFIRMADO |
| Estrategias SQL/Git existentes | `libs/progress/src/domain/sql-practice.ts` — assessSqlPractice; `libs/progress/src/domain/programming-practice.ts` — assessProgrammingPractice | `tests/sql-practice.test.mjs`; `tests/programming-practice.test.mjs` | CONFIRMADO |
| Fixture genérico de algunas semanas | `tests/helpers/practice-evidence.mjs` — validatedPractice | `tests/practice-completion.test.mjs:6` | CONFIRMADO |
| Recalcular al cargar | `libs/progress/src/domain/progress.ts` — fromUnknown; `libs/progress/src/domain/automatic-completion.ts` — automaticCompletion | La compatibilidad histórica es requisito | CONFIRMADO |
| Equivalencia tras extracción | Aún sin implementación | Corpus/ejecución futuros | PENDIENTE DE EVIDENCIA |

## Aprobación de ejecución
Estado: **PENDIENTE**
Alcance y riesgos revisados por: PENDIENTE
Fecha / decisión explícita: PENDIENTE
Decisión requerida: D-03, conservar comportamiento existente incluso cuando se sabe que su nivel de confianza es limitado.
Modalidad propuesta: implementación local con tests autorizados; sin PR, merge, migraciones ni despliegue.

