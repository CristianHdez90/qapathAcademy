# G2 · Roadmap editorial por módulos

Fecha: 2026-10-28. Propuesta documental, sin ejecución G3–G7. Recuento: 74 capítulos + 24 ejemplos guiados = 266 conceptos; no son 98 capítulos.

## 1. Prioridad y secuencia autorizable

Primero se revisa W01-C01/QC y se resuelven las decisiones de G3. Después, cada lote necesita aprobación de rutas/contenido concreta; la existencia de este roadmap no autoriza reescribir 24 guías ni ampliar contratos por adelantado.

El propietario pide **pruebas al final de toda la implementación del SPEC**. En consecuencia, este roadmap distingue revisión documental/diff durante lotes de ejecución de pruebas al final. No se inicia G5 ahora ni se altera CI. D07 registra la diferencia con la secuencia piloto-QA-lotes del SPEC y el riesgo de descubrir incompatibilidades tarde.

| Orden / lote propuesto | Alcance | Prioridad y objetivo | Dependencias | Responsable por rol (sin asignación personal) | Entregable / puerta |
|---|---|---|---|---|---|
| 0 · G3 | Revisión de estos siete documentos | P1: resolver alcance, fuentes ausentes, foco, scroll, D1 y pruebas al final | D01–D07 | Producto + QA + edición + UX | Acta explícita y SPEC individual; aún no código |
| 1 · Piloto | QC de W01-C01: 3 nodos, fuente única | P1: establecer contrato opcional, fallback y pausa | Aprobación de lote, UX-120/D1 local | Edición redacta; QA contrasta; frontend implementa solo lo aprobado | Cambio local/PR concreto según autorización; no release |
| 2 · M01 | W1–2: 6 capítulos, 48 conceptos contando guiados | P2: ocho focos de W01-C01 y fundamentos; cinco niveles CTFL | Piloto y decisiones revisadas, S01–S04 | Docencia + QA | Propuestas por unidad, 3 estados/detalles coherentes |
| 3 · M02 | W3–6: 12 capítulos, 42 conceptos | P1 para métricas W6; P2 resto. HU/CA, técnicas, defectos, Scrum y riesgo | S01/S02/S05; convención B04 aprobada | QA de dominio + edición | Resolver lectura/práctica sin cambiar dominio por inferencia |
| 4 · M03 | W7–8: 7 capítulos, 22 conceptos | P1 para datos SQL; P2 HTTP/403 y fuentes. Preservar DevTools en W7 | S11–S14; seed actual identificado | QA API/SQL + edición | Resultados acordes al dataset y acciones con evidencias depuradas |
| 5 · M04 | W9–12: 13 capítulos, 39 conceptos | P2: JS, JSON, TS, async y Git; no promover contraseña ficticia como norma | S15–S17/S24; versiones instaladas | QA programación + edición | Ejemplos identificados por runtime/lenguaje, sin upgrade automático |
| 6 · M05 | W13–16: 12 capítulos, 37 conceptos | P2: locators, actionability, traza y motores | S18/S19; navegador/Node/paquete por lote | QA automation + UX | Actividades de diagnóstico con límites explícitos de los demos |
| 7 · M06 | W17–20: 12 capítulos, 36 conceptos | P2: patrón por necesidad, fixtures, API y mocks | S06/S07/S19/S21 | QA arquitectura + edición | Progresión sobre W16/W17, integración real distinguida de mock |
| 8 · M07 | W21–22: 6 capítulos, 20 conceptos | P2: CI, permisos, inestabilidad y denominadores | S19/S20; gestor y workflows del proyecto | QA CI + edición | No confundir npm tutorial y pnpm QAPath; evidencia de causa |
| 9 · M08 | W23–24: 6 capítulos, 22 conceptos | P2: trazabilidad, README, demo y evaluación honesta | Material previo y criterios de competencias | QA/docencia + producto | Proyecto y portafolio con límites, sin promesas de certificación externa |
| 10 · Validación final | Toda la implementación explícitamente aprobada | P1: ejecutar el plan completo y resolver defectos | Finalización del alcance, fuentes reconsultadas | QA técnico + UX/accesibilidad + docencia | Evidencia por CA y revisión humana; no basta revisar este documento |
| 11 · Liberación G7 | Solo lo que tenga aceptación final | Requiere CI, preproducción, rollback y permiso de despliegue | Cero críticos abiertos y autorizaciones | Producto + operación autorizada | Decisión de producción separada; ninguna otorgada aquí |

Las cantidades por módulo proceden del catálogo real, incluidos ejemplos guiados. Son inventario, no número de PRs ni estimaciones de entrega. No asignar fechas sin conocer capacidad y revisores.

## 2. Hilo narrativo sin homogeneizar artificialmente

Brisa Tienda conecta descuentos, pedidos y riesgos. M01 entiende la diferencia entre proceso/producto/evaluación; M02 refina reglas y conserva evidencia; M03 investiga UI/API/datos; M04 crea utilidades y versiona; M05 automatiza viajes; M06 organiza dependencias y contratos; M07 investiga CI; M08 comunica una entrega reproducible.

Cambiar de contexto cuando facilite transferencia: el ejemplo bancario actual de W1 sigue siendo un ejemplo posterior, las reservas del piloto evalúan utilidad y los servicios públicos de muestra se rotulan como externos. No reemplazar todos los datos por el mismo cupón ni inventar endpoints para una aplicación que no los ofrece.

## 3. Política por lote

Cada propuesta identifica IDs/índices actuales, fuentes consultadas con fecha/versión, brecha G1, objetivo, grafo equivalente, estados, actividad, riesgos y rutas futuras. La revisión editorial se firma por otra persona/rol; no se obtiene una aprobación automática por generar documentos.

Una aprobación de contenido no autoriza cambiar calificación, lecturas, notas, autenticación, esquema de base o límites de evidencia. Si hace falta tocar dominio, presentar una SPEC separada. No añadir IA a la generación/runtime de globos: el contenido revisado reside en datos académicos.

Durante implementación futura, cambios pequeños y revisables con fallback opcional; no rellenado automático masivo. Las pruebas se diseñan en documentación ahora y se ejecutan al final según instrucción. Registrar como riesgo la distancia entre diseño, implementación y feedback, sin desactivar checks existentes.

## 4. Rollback propuesto, no ejecutado

- Antes de cada lote aprobado, identificar commit y huella de contenido/UI. Mantener cambios separados de datos de alumnos.
- Fallback sin `stepDetails` conserva la demostración anterior. Si hay defecto, volver al contenido/componente del lote mediante revisión autorizada; no borrar progreso, notas ni evidencias.
- Una reversión de JSX/datos no garantiza recuperar borradores descartados. Preservar el proveedor/cola y comprobar estado al final con el plan de regresión.
- Si una ampliación de tipo rompe otro consumidor, detener la promoción y presentar corrección; no hacer obligatorio el campo opcional en todo el catálogo para ocultar la incompatibilidad.
- No usar force-push, reset destructivo, eliminación de trabajo ajeno ni despliegue automático. CI/PR aceptados no equivalen a permiso de producción.

## 5. Cierre de esta fase

G0–G2 dejan evidencia y propuestas. Próxima decisión: G3, con un alcance individual de QC claramente delimitado. No iniciar G4 porque el capítulo esté redactado; aprobación de implementación, aceptación de resultados y publicación son decisiones distintas.
