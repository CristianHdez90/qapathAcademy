# SPEC-112 — Registro explícito de laboratorios por semana

> Estado: **PROPUESTA — SIN AUTORIZACIÓN DE IMPLEMENTACIÓN**
> Tipo: refactor transparente, acotado a WeekLaboratory.
> Línea base: main / b7a1cdaaf37f06cac2a5008158bd3fabc411c865.
> Hallazgo: TD-013 ↔ DT-13, reducción parcial. Propietario/aprobación PENDIENTE.
> Marco: [SPEC-100](SPEC-100-fase-2-reduccion-deuda-tecnica-to-be.md), [backlog](100-backlog-deuda-tecnica-priorizado.md), [R13/C07](102-matriz-riesgos-regresion.md).

## 01. Intención
Separar la selección de laboratorio de su contenedor visual para extender y revisar semanas sin añadir una cadena de ternarios al contenedor. El objetivo es mantenibilidad verificable, no una mejora de rendimiento no medida.

Resultado: registro explícito con cobertura de las 24 semanas, mismo componente y preparación de initial por caso, sin cambio de contenido, ayudas, navegación ni estado del estudiante. Los asistentes de evidencia de PracticeActivity permanecen como deuda residual.

## 02. Comportamiento

### AS-IS preservado
WeekLaboratory recibe week,title,initial,onResult,children; presenta details abierto con summary y selecciona laboratorio. Semana 1 muestra orientación y conserva FoundationWorkbook dentro de children, gestionado por PracticeActivity.
La función permitted filtra por modo en muchas semanas; 7 y 9 reciben initial completo. 23 actualmente recibe initial solo scenario aunque su proyecto incluya varios motores. Eso se conserva; corregirlo sería otro cambio.
Fallback conserva guidance y PracticeExecution cuando no existe rama. No se sustituyen callbacks ni se crea estado duplicado de evidencia.

### Matriz de selección que se debe caracterizar
| Semana | Renderizador actual | Preparación de initial |
|---|---|---|
| 1 | Párrafo de orientación; children externos | Sin reinterpretación de evidencia |
| 2 / 3 / 4 / 5 / 6 | RiskMissionLab / GherkinLab / PasswordLab / BugLab / SprintLab | topic |
| 7 | ToolsMissionLab | Completo, sin filtrar |
| 8 | SqlMissionLab | sql |
| 9 | ProgrammingLab | Completo, sin filtrar |
| 10 / 11 / 12 | JsonReportLab / TypeScriptLab / AsyncLab | code |
| 13 | FirstUiLab | scenario |
| 14 | LocatorMissionLab | topic |
| 15 / 16 | TraceMissionLab / MatrixMissionLab | scenario |
| 17 / 18 | PageObjectLab / FixtureMissionLab | topic |
| 19 | ApiContractLab | http |
| 20 | RecoveryMissionLab | scenario |
| 21 / 22 | PipelineMissionLab / FlakinessMissionLab | pipeline |
| 23 | ProjectMissionLab | scenario |
| 24 | PresentationMissionLab | topic |
| Sin entrada | guidance + PracticeExecution | Misma exclusión actual de topic/git |

### TO-BE y alternativas
Antes: selección, imports y presentación en WeekLaboratory.
Después: módulo local con funciones de render declaradas a nivel de módulo, entradas explícitas y helper de initial, consumido por el contenedor. El contenedor conserva details/summary/children/fallback.
- Elegido: registro tipado local, imports estáticos existentes, sin nueva abstracción de dominio.
- Alternativa: switch legible dentro del mismo componente, menor extracción pero misma concentración; aceptable si la caracterización detecta problemas de registry.
- Rechazado en esta SPEC: import dinámico, plugin framework, fusión de asistentes y laboratorio, o reescritura de todas las props. Cambian carga/estado/SSR y amplían regresión.

Funciones estables no deben convertirse en nuevos tipos de componente definidos durante cada render. No añadir keys de sesión ni wrappers que provoquen remount al actualizar una ejecución o la nota. La identidad React y el orden de children se validan por comportamiento, no solo por snapshot.

### Alcance exacto futuro
| Ruta | Cambio previsto |
|---|---|
| `apps/web/src/components/academy/week-laboratory.tsx` | Delegar selección y conservar contenedor/fallback |
| `apps/web/src/components/academy/laboratory-registry.tsx` — NUEVO PROPUESTO | Registro local estable, tipos y preparación equivalente |
| `apps/web/tests/e2e/topic-laboratories.spec.ts` | Caracterización/selección de semanas con el esquema de pruebas existente |
| `apps/web/tests/e2e/laboratory-registry.spec.ts` — NUEVO PROPUESTO | Re-render, restauración, callbacks/children y matriz 24/24 |
| Este Markdown | Evidencia/decisión de ejecución si se aprueba |

No tocar PracticeActivity, asistentes, laboratorios individuales, motores, CSS, contenido JSON, snapshots de datos, dependencias ni configuración Playwright. Si probar identidad React necesita otra ruta, solicitar ampliación documentada antes de escribirla; no añadir una dependencia de tests por defecto.

### Plan incremental futuro
1. Caracterizar la selección actual para 24 semanas y fallback, modos initial coincidentes/no coincidentes, children y callback.
2. Registrar interacción que conserva un borrador al re-render del padre por nuevo resultado; comprobar navegación/foco donde el componente actual los preserva.
3. Extraer registro con imports estáticos; conservar firma WeekLaboratory sin adaptaciones del consumidor.
4. Reejecutar matriz y E2E de rutas específicas; revisar nombres accesibles/texto y diff.
5. Documentar deuda residual en los asistentes. No medir éxito por número de líneas movidas ni cerrar todo TD-013.

### Criterios de aceptación
- CA-112-01: 24/24 semanas seleccionan mismo laboratorio o párrafo que en la matriz, mismo título/summary y details abierto.
- CA-112-02: 7/9 conservan initial completo; resto y fallback filtran igual que antes, incluyendo 23. No reutilizar un “modo por defecto” que cambie esa regla.
- CA-112-03: onResult recibe la misma ejecución sin transformación y sin llamadas duplicadas; children aparecen una vez y en mismo orden.
- CA-112-04: re-render de WeekLaboratory/PracticeActivity no borra notas, selección de desafío, borrador ni última ejecución por cambio de identidad de componente.
- CA-112-05: FoundationWorkbook y matriz de referencia de semana 1 siguen disponibles desde su propietario actual; no mover su estado al registro.
- CA-112-06: nombres accesibles, textos, botones de pistas, descargas, paginación y estados completos no cambian; teclado y foco no empeoran respecto de caracterización.
- CA-112-07: no se modifica persistencia, endpoint, permisos, porcentajes, modo de ejecución ni catálogo.
- CA-112-08: imports no añaden dependencia ni lazy loading; build/typecheck y suites relevantes documentan resultado futuro.
- CA-112-09: si una mejora requiere cambiar contenido o un initial actualmente filtrado, queda fuera y vuelve a nueva SPEC.

### Plan de pruebas y observabilidad futuras
Caracterización Playwright de dispatch con API simulada para catálogo/auth/progreso, identificando que esos tests solo acreditan UI. E2E selectiva con motores reales de navegador para 1/7/8/9/17/23/24, conservando pruebas de las demás misiones. Una regresión de persistencia propia requiere DB de prueba autorizada; no atribuirla al test con route.fulfill.
Verificar snapshots semánticos (componente/heading/props observables) y acciones con teclado, no grandes snapshots visuales como única prueba. Reutilizar practice-layout, topic-laboratories y suites por misión; comprobar architecture y build pertinentes.
Métrica: tabla de 24 entradas verificadas y cero cambios de comportamiento detectados en corpus de estados; no hay objetivo de milisegundos o bundle. No añadir telemetría ni logs.

### Riesgos y dependencias
R13: remount y pérdida de estado; R02: alterar initial puede modificar finalización; R08: fixtures no prueban servidor. Caracterización es requisito, no resolver TD-001/002.
Puede implementarse de forma independiente tras G3. Si la base cambia por 110/111, revalidar SHA y los archivos compartidos; no combinar aprobaciones ni PR por conveniencia.

### Rollback
Restaurar el despacho anterior por una nueva revisión y retirar registry, manteniendo fachada y datos. Como no se cambian formatos ni base, no hay migración inversa. Validar de nuevo carga/selección/children y restauración de borrador. No borrar progreso ni reiniciar ejercicios de los estudiantes para corregir un remount.

## 03. Restricciones
Refactor transparente; cualquier cambio de comportamiento exige nueva revisión G2/G3. No tocar lógica de laboratorios individuales, CSS/contenidos ni el bloque de evidencia.
Solo implementación local si se aprueba expresamente; PR/merge/deploy y uso de datos/infraestructura son autorizaciones separadas.

## 04. No-Objetivos
No rediseñar UX, optimizar carga, añadir iconos, quitar matrices, crear plugins de laboratorio ni resolver toda PracticeActivity. No “arreglar de paso” restauración o modos que el AS-IS filtra.

## Evidencia AS-IS y trazabilidad
| Afirmación | Archivo/símbolo | Prueba/observación | Estado |
|---|---|---|---|
| Dispatch/modes/children | `apps/web/src/components/academy/week-laboratory.tsx` — WeekLaboratory, permitted | Inspección de ramas | CONFIRMADO |
| Evidencia y matriz fuera de alcance | `apps/web/src/components/academy/practice-activity.tsx` — PracticeActivity, labEvidence | Mantener propietario/estado | CONFIRMADO |
| Suites de UI disponibles | `apps/web/tests/e2e/topic-laboratories.spec.ts`; `apps/web/tests/e2e/practice-layout.spec.ts` | Existentes, no ejecutadas | CONFIRMADO |
| Equivalencia y ausencia de remount | Futuro registro | Caracterización propuesta | PENDIENTE DE EVIDENCIA |

## Aprobación de ejecución
Estado: **PENDIENTE**
Alcance y riesgos revisados por: PENDIENTE
Fecha / decisión explícita: PENDIENTE
Decisión requerida: D-04; aceptar alcance parcial, sin tocar asistentes ni corregir otras reglas.
Modalidad propuesta: implementación local y pruebas autorizadas; sin PR/merge/migraciones/despliegue.

