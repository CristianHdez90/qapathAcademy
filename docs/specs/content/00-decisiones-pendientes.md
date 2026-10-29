# G2 → G3 · Decisiones, riesgos y seguimiento

2026-10-28 · El registro inicial G0–G2 autorizaba solo documentación. **Actualización posterior:** el usuario aprobó implementar **todo W01-C01: ocho tarjetas y 24 fichas**, registrado en [acta local](W01-C01-acta-implementacion-local.md). Se ha implementado ese alcance local, con pruebas diferidas. No autoriza otros capítulos, commit, push o producción. La tabla siguiente conserva las decisiones planteadas en G2; su disposición actual consta al final.

## 1. Decisiones concretas para el acta G3

| ID | Decisión y evidencia | Propuesta para revisar | Estado / efecto |
|---|---|---|---|
| D01 | SPEC 200, plantilla independiente y UX-140 no localizadas en `docs/specs/` | Solicitar sus versiones si deben ser contractuales; mientras tanto usar 210 como propuesta y registrar su ausencia, sin declarar consistencia verificada con textos no disponibles | PENDIENTE; no impide entregar G0–G2, sí impide afirmar reconciliación completa de los tres contratos |
| D02 | «Capítulo completo» y «piloto QC» tienen alcances distintos | Aprobar editorialmente ocho tarjetas/24 fichas, pero delimitar primera implementación a `qc` y sus tres detalles. Los otros 21 y el mapa conceptual requieren aprobación separada si se desean en el mismo lote | PENDIENTE; definir rutas exactas y consumidores antes de tocar tipos/datos/UI |
| D03 | La apertura por foco y el toggle Enter del §2.7 pueden contradecir el BDD Tab+Enter del §2.13 | Foco abre; primer Enter/Espacio fija selección manual; siguiente activación manual alterna. Alternativa: foco solo anuncia disponibilidad y Enter abre, cambiando la expectativa de apertura al foco | PENDIENTE; no implementar una combinación ambigua ni marcar CA-11 aprobado |
| D04 | «Una vez» y «una invitación por entrada a vista como máximo» pueden generar reaperturas al volver | Una invitación por demostración/sesión/semana/identidad, tras scroll deliberado y ≥60 %/350 ms. Sin reapertura tras dismiss; manual siempre disponible. Representación web semántica estática; sin motor Mermaid para QC | PENDIENTE; límite más conservador y comportamiento de entrada inicial deben constar en acta |
| D05 | Un popover no modal no queda cubierto necesariamente por `dialog[open]`; nuevos botones/textos afectan D1 | Señal compartida de consulta de detalle que pause atención; overlay fuera del eje medido, referencia pasiva sin efectos. Preservar cola/ACK y umbrales. Enumerar rutas frontend necesarias en SPEC individual | PENDIENTE; bloquea aceptar una implementación que cambie lectura silenciosamente; no autoriza dominio/API |
| D06 | B03 datos SQL y B04 métricas no concuerdan con prácticas actuales; B05 expectativas de tests están obsoletas | Preferir fuente actual del kit/definición del laboratorio y ajustar lectura solo en lote aprobado; si se desea otra regla de métricas, SPEC de dominio separada. Mantener fuentes versionadas y distinguir estándar publicado de borrador/documentación viva | PENDIENTE para lotes afectados; no corregir ahora ni bloquear innecesariamente un QC aislado que no toca esas reglas |
| D07 | El propietario exige pruebas al final de toda la implementación, frente a G5 antes de lotes en el SPEC; CI existente se dispara en PR/push | Registrar esa secuencia solicitada, mantener cambios pequeños/revisión de diff y aceptación final antes de liberar. No ejecutar pruebas ahora, no desactivar CI ni iniciar operaciones que lo disparen. Antes de entregas intermedias, acordar cómo preservar controles existentes | Instrucción temporal actual clara; detalle de entregas futuras PENDIENTE. No es autorización de omitir controles de rama |

No se resuelven discrepancias modificando el SPEC de entrada. Esta tabla es una propuesta de decisión visible, no un acta firmada.

Para D06 existe otra opción editorial válida: conservar un mini-dataset de tres clientes como ejemplo independiente, pero publicar sus registros y rotularlo explícitamente como distinto del kit expandido. Lo que debe evitarse es atribuirle al kit actual resultados del conjunto antiguo. La propuesta preferida mantiene una fuente de datos común para reducir esa confusión; no se ha aplicado ninguna de las opciones.

## 2. Riesgos y mitigaciones propuestas

| Riesgo | Nivel | Consecuencia | Mitigación / puerta futura |
|---|---|---|---|
| Lectura ganada por consultar globo o bloqueada por firma nueva | P1 | Cambia significado del progreso | D05 y escenarios D1; si falla equivalencia, no activar ni bajar umbrales |
| Pausa temporal sustituye pausa manual | P1 | Animación se reinicia contra la voluntad del estudiante | Razones de pausa independientes; preservar done/reduced y fase |
| Foco robado o Escape que reabre | P1 | Barrera de teclado/lector de pantalla | Resolver D03; suprimir reapertura del mismo trigger tras dismiss; revisar orden real al final |
| Texto incorrecto que parece ejecución real | P1 | Enseña causalidad o conformidad sin evidencia | Etiquetar E01–E04 y relatos ficticios; no mostrar confirmación pendiente como realizada |
| Propagar datos SQL/métricas antiguos | P1 | Esperados contradictorios y feedback erróneo | Fuente única de dataset/definición y cambio editorial aprobado; no manipular datos para pasar |
| Pruebas diferidas concentran incompatibilidades al final | P1 entrega | Aumentan retrabajo y tiempo de diagnóstico | D07, lotes pequeños con revisión documental, sin publicación previa a aceptación final |
| Fuentes de norma con acceso limitado | P2 | Atribución normativa no demostrada | ISO verificada solo por ficha; revisión autorizada de cláusulas si el lote requiere detalle |
| Copia involuntaria de cursos o syllabi | P2 | Problema de propiedad intelectual | Redacción/casos/grafos originales y citas breves; no acreditación ficticia |
| Dos globos, hover fugaz o panel cortado | P2 | Interrumpe lectura y oculta Cerrar | Coordinador único, persistencia, posicionamiento responsive y consulta manual equivalente |
| Texto auxiliar hace crecer la referencia pasiva o añade listeners | P2 | Lectura/rendimiento degradados | Mantener componente puro, datos opcionales y panel fuera del árbol medido; no dependencia gráfica pesada |
| Confundir WebKit, mock o sandbox con producto/dispositivo real | P2 | Sobreestima cobertura | Etiquetar motor/simulación/entorno y registrar límites de cada evidencia |
| Presentar inspección estática de tests como CI verde | P1 aceptación | Aprobación infundada | Estado NO EJECUTADO; no ocultar B05 ni reutilizar reportes de otra fase |

## 3. Condiciones previas de una SPEC individual

Antes de implementar: aprobar cuáles contenidos concretos de W01-C01 se publicarán, el comportamiento D03/D04, tratamiento D1, tipo opcional y fallback, exportación, rutas exactas y consumidores. Enumerar pruebas futuras sin ejecutarlas antes del momento indicado. No incluir actualización de paquetes, backend, esquema de datos o navegación global por conveniencia.

Propuesta mínima de rutas a revisar en esa SPEC: `packages/contracts/src/index.ts`, `libs/learning/src/domain/models.ts`, entrada `qc` de `study-guides.json`, `reading-concepts.tsx`, controlador/vista/CSS de demostración y `lesson-download.ts`. La coordinación/guardas D1 y cualquier archivo nuevo deben nombrarse expresamente antes de aprobación; no dar por implícito un permiso global en `apps/web/`.

Si se aprueba solo la fuente editorial, todavía no hay permiso de código. Si se aprueba código local, todavía no hay permiso de publicación. La revisión y el feedback de una actividad no crean una nueva evaluación académica.

## 4. Registro de revisión

| Campo | Estado |
|---|---|
| Baseline / SHA y árbol local | Documentados en G0 |
| Auditoría de inventario | 74 capítulos, 24 ejemplos y 266 instancias de concepto trazables |
| Fuentes oficiales | Registro consultado; ISO limitada a ficha; revisión humana pendiente |
| Propuesta W01-C01 | Redactada, con rúbrica sin puntaje de conformidad atribuido |
| QA técnico independiente | PENDIENTE |
| Revisión pedagógica | PENDIENTE |
| UX/accesibilidad | PENDIENTE; no pruebas en esta fase |
| Aprobación de implementación CONTENT-210 | NO OTORGADA |
| Autorización de producción | NO OTORGADA |
| Tests / build / CI de esta tarea | NO EJECUTADOS |

## 5. Cierre de G0–G2

Entregables: baseline/fuentes, matriz completa, W01-C01, contrato, plan de validación futura, roadmap y estas decisiones. Los siete son documentos nuevos en el directorio autorizado. Ningún globo, grafo o microactividad de esta propuesta está implementado por su creación. El siguiente trabajo requiere la aprobación explícita del alcance individual; no se inicia aquí.

## 6. Disposición posterior a la aprobación del usuario

| Decisión | Estado actual |
|---|---|
| D01 | Sigue pendiente; no se afirma haber leído documentos no disponibles |
| D02 | Resuelta por aprobación explícita de las ocho tarjetas, 24 fichas, caso, grafos y microactividad de W01-C01 |
| D03 | Implementada la alternativa recomendada: foco transitorio, primera activación fija, segunda cierra; pendiente comprobar teclado/foco |
| D04 | Implementada una invitación por demostración/semana/identidad/sesión en memoria; requiere intención de desplazamiento, scroll y reposo visible. Pendiente validar en navegador |
| D05 | Implementados portal, referencia pasiva y guardas en ambos lectores. La selección automatizada local D1 pasó en ambos motores; ver [alcance y resultados](W01-C01-validacion-local.md). No equivale a aprobación de todo el currículo o auditoría independiente |
| D06 | Fuera del lote; no cambios SQL/métricas |
| D07 | El usuario autorizó después «ejecuta pruebas y revisa». Esa autorización sustituye la espera: ver [validación local](W01-C01-validacion-local.md). No autoriza commit, push ni despliegue |

Revisiones docente, técnica independiente y de accesibilidad, aceptación de resultados y autorización de producción siguen pendientes. Ver [entrega local](W01-C01-entrega-local.md).
