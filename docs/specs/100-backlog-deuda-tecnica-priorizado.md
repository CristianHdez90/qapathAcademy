# Fase 2 — Backlog de deuda técnica priorizado

> Estado: PROPUESTO · Solo documentación · G0/G1 documental, sin autorización G4.
> Marco: [SPEC-100](SPEC-100-fase-2-reduccion-deuda-tecnica-to-be.md).
> Fuente: [inventario AS-IS](011-inventario-deuda-tecnica.md) y [trazabilidad](012-matriz-trazabilidad.md).

## 01. Intención
Convertir los hallazgos AS-IS en decisiones pequeñas y trazables, sin convertir inferencias en defectos comprobados ni autorizar implementaciones.

## 02. Comportamiento

### G0: línea base y contraste
- Rama **main**, SHA **b7a1cdaaf37f06cac2a5008158bd3fabc411c865**, captura UTC **2026-10-27T00:33:29.477Z**. Producción y remoto no comparados.
- 596 archivos fuera de docs/specs/ incluidos en huella; SHA-256 agregado **90c67e8ffc757c4e22ef4d6c1ea005da30cc78aa6663f0765b78f5651d83ac58**, idéntico al cierre AS-IS. Se reutiliza esa inspección y se contrastaron nuevamente las rutas decisivas de los 16 hallazgos.
- Existían 14 Markdown sin seguimiento bajo docs/specs/: los 13 entregables AS-IS y SPEC-100; el Spec inicial estaba versionado. Ningún cambio fuera de esa carpeta en el status inicial.
- Los documentos AS-IS son fuentes locales revisables, no una afirmación de que estén publicados en GitHub ni desplegados. No se editarán en esta fase.
- Referencias de Fase 1 DT-01…DT-16 se conservan; aquí se mapean 1:1 a TD-001…TD-016. La forma de evidencia CONTRADICTORIO pasa a CONFIRMADO cuando se comprueba la incompatibilidad; se mantiene la distinción entre regla y efecto operativo.

### Política de prioridad y decisión
P0 exige exposición/incidente crítico demostrado; **no se identificó evidencia para P0**. P1 trata integridad importante demostrable; P2 fiabilidad/mantenimiento; P3 consistencia nominal. La severidad de una consecuencia hipotética es provisional, no una vulnerabilidad confirmada.
Exposición Baja/Media/Alta es valoración ordinal razonada, no frecuencia medida. S/M/L/XL expresa esfuerzo relativo y no días/coste.
Se ordena por severidad, luego riesgo evitado frente a esfuerzo y dependencias. Investigar un P1 provisional no autoriza remediarlo. Las mejoras de CI pequeñas pueden preceder un refactor grande una vez tengan su propia SPEC aprobada.

### Resumen ordenado
| Orden | ID Fase 2 / origen | Dominio | Severidad | Estado de evidencia | Esfuerzo | Decisión |
|---|---|---|---|---|---|---|
| 1 | TD-001 / DT-01 | Progreso / contratos | P1 | CONFIRMADO | M | PROPUESTO |
| 2 | TD-002 / DT-02 | Integridad académica | P1 | CONFIRMADO | XL para remediación completa; M para extracción acotada | PROPUESTO; no cerrar el hallazgo con la extracción |
| 3 | TD-005 / DT-05 | Identidad / Firebase | P1 provisional | INFERIDO | L, a refinar después de evidencia | APLAZADO para implementación; investigación prioritaria |
| 4 | TD-007 / DT-07 | CI / dependencias | P2 | CONFIRMADO | S | PROPUESTO |
| 5 | TD-008 / DT-08 | Calidad / regresión | P2 | CONFIRMADO | M | PROPUESTO |
| 6 | TD-004 / DT-04 | Persistencia / operación | P2 | CONFIRMADO | M | PROPUESTO |
| 7 | TD-003 / DT-03 | Base de datos / autoridad de esquema | P2 | CONFIRMADO | M | PROPUESTO |
| 8 | TD-016 / DT-16 | Lectura / confianza del progreso | P2 | CONFIRMADO | M para definición de política; L si hay cambio funcional | PROPUESTO solo para decisión de producto |
| 9 | TD-013 / DT-13 | Frontend / mantenibilidad | P2 | CONFIRMADO | M por iteración acotada | PROPUESTO |
| 10 | TD-011 / DT-11 | Contenido / consistencia | P2 | INFERIDO | L | APLAZADO hasta evidencia de invariantes faltantes |
| 11 | TD-006 / DT-06 | Seguridad / límites | P2 provisional | PENDIENTE DE EVIDENCIA | L provisional | APLAZADO; solo recopilación de evidencia |
| 12 | TD-015 / DT-15 | Correo / integración | P2 provisional | PENDIENTE DE EVIDENCIA | S/M tras evidencia | APLAZADO; solo evidencia |
| 13 | TD-009 / DT-09 | Privacidad / operación | P2 provisional | PENDIENTE DE EVIDENCIA | L/XL según retención | APLAZADO |
| 14 | TD-014 / DT-14 | Seguridad / recuperación | P2 provisional | PENDIENTE DE EVIDENCIA | L/XL | APLAZADO |
| 15 | TD-012 / DT-12 | Observabilidad / versión | P3 | CONFIRMADO | S | PROPUESTO |
| 16 | TD-010 / DT-10 | Roles / alcance editorial | P3 | CONFIRMADO | S para aclaración, XL si se decide CMS | APLAZADO |

**Balance:** 16 fichas, 3 P1 (una provisional), 11 P2 (cuatro provisionales), 2 P3; 10 CONFIRMADO, 2 INFERIDO y 4 PENDIENTE DE EVIDENCIA. Ningún hallazgo aprobado, completado o implementado.

### Fichas de decisión
#### TD-001 — Progreso / contratos
- **Origen:** DT-01 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** Límite 32000 en UI para 23/24 frente a 8000 en contrato, dominio y normalización.
- **Evidencia:** `apps/web/src/components/academy/practice-activity.tsx:58` — limit; `packages/contracts/src/auth.ts:8` — progressCommandSchema; `libs/progress/src/domain/progress-commands.ts:40` — limit; `libs/progress/src/domain/progress.ts:18` — objStrings.
- **Prueba/observación:** `tests/automatic-progress.test.mjs`, `tests/practice-completion.test.mjs`; falta caracterización de bordes 23/24. Ninguna ejecutada en esta fase.
- **Estado / severidad:** CONFIRMADO / P1.
- **Impacto:** Rechazo de guardado y descarte durante normalización; es consecuencia estática, no pérdida productiva observada.
- **Probabilidad/exposición:** Alta: dos semanas ofrecen en UI un tamaño que las otras capas rechazan; no hay volumen de usuarios medido.
- **Beneficio esperado:** Una política pura compartida por dominio/normalización/UI; contrato Zod estructural con guard de tamaño API que conserva errores. Cero discrepancias en tabla de bordes.
- **Esfuerzo / regresión:** M. PATCH me/progress, visitantes, lectura local/remota, importación y preservación de evidencia existente.
- **Dependencias:** Aprobar tabla de límites y compatibilidad de rollback; corpus sintético de evidencias.
- **Alternativas:** Reducir la UI a 8000 preservaría backend pero limitaría el contenido que hoy permite preparar. Preferida: 32000 también en 23/24, pendiente de aprobación explícita.
- **SPEC de cambio:** [SPEC-110](SPEC-110-politica-tamano-evidencia-to-be.md).
- **Decisión:** PROPUESTO; aprobación humana PENDIENTE.

#### TD-002 — Integridad académica
- **Origen:** DT-02 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** La validación genérica usa datos declarados y solo aplica notebooks 8/9 cuando existen.
- **Evidencia:** `libs/progress/src/domain/practice-completion.ts:9` — practiceCompleted, condiciones de líneas 14–15; `libs/progress/src/domain/programming-practice.ts` — assessProgrammingPractice; `libs/progress/src/domain/sql-practice.ts` — assessSqlPractice.
- **Prueba/observación:** `tests/practice-completion.test.mjs:6` y `tests/helpers/practice-evidence.mjs`: fixtures genéricos para algunas semanas. Ninguna ejecutada en esta fase.
- **Estado / severidad:** CONFIRMADO / P1.
- **Impacto:** El avance no acredita todos los objetivos UI ni autenticidad de ejecución. No equivale a elusión de RBAC.
- **Probabilidad/exposición:** Media: los comandos son accesibles a estudiantes y el estado invitado es editable; no se ha observado abuso.
- **Beneficio esperado:** Primero caracterizar y separar estrategias manteniendo resultados; después una SPEC funcional independiente para política de validación versionada.
- **Esfuerzo / regresión:** XL para remediación completa; M para extracción acotada. Finalización y porcentajes de las 24 semanas, borradores y evidencias históricas.
- **Dependencias:** Decisión pedagógica sobre confianza; inventario de formatos históricos antes de endurecer. Separar extracción de cambio funcional.
- **Alternativas:** Hacer obligatorios notebooks ahora rompería evidencia histórica y recalcularía progreso; se descarta dentro del refactor transparente.
- **SPEC de cambio:** [SPEC-111](SPEC-111-validadores-practicas-por-estrategia-to-be.md), reducción parcial.
- **Decisión:** PROPUESTO; no cerrar el hallazgo con la extracción; aprobación humana PENDIENTE.

#### TD-005 — Identidad / Firebase
- **Origen:** DT-05 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** El cambio SQL termina antes de updateExternalEmail; una falla posterior podría dejar identidades divergentes.
- **Evidencia:** `apps/api/src/presentation/controllers/admin.controller.ts:25` — modify; `apps/api/src/infrastructure/adapters/postgres-administration.adapter.ts` — change; `libs/identity/src/application/account-security.ts` — updateExternalEmail.
- **Prueba/observación:** `tests/administration.test.mjs`, `tests/firebase-identity.test.mjs`; no se identificó una prueba del fallo entre ambos commits externos. Ninguna ejecutada en esta fase.
- **Estado / severidad:** INFERIDO / P1 provisional.
- **Impacto:** Posible bloqueo de acceso/coherencia parcial; no se demostró incidente.
- **Probabilidad/exposición:** Media condicionada: exige AUTH_PROVIDER=firebase, cambio de correo y fallo externo; configuración real desconocida.
- **Beneficio esperado:** Demostrar secuencia de fallo y diseñar reconciliación/idempotencia sin hacer promesas de atomicidad distribuida.
- **Esfuerzo / regresión:** L, a refinar después de evidencia. ADMIN modifica STUDENT, verificación, revocación de sesiones, proveedor local y externo.
- **Dependencias:** Reproducir con adaptador fallido y base desechable tras autorización; acordar contrato de estado pendiente/compensación.
- **Alternativas:** Outbox frente a estado pendiente/reintento o compensación; ninguna elegida sin revisar contratos y privacidad.
- **SPEC de cambio:** No creado; futura SPEC funcional tras evidencia.
- **Decisión:** APLAZADO para implementación; investigación prioritaria; aprobación humana PENDIENTE.

#### TD-007 — CI / dependencias
- **Origen:** DT-07 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** --no-frozen-lockfile con lockfile presente.
- **Evidencia:** `.github/workflows/quality.yml` — instalación de quality/e2e; `pnpm-lock.yaml`; `package.json` — packageManager.
- **Prueba/observación:** Workflow leído; resultado de CI remoto NO VERIFICADO. Ninguna ejecutada en esta fase.
- **Estado / severidad:** CONFIRMADO / P2.
- **Impacto:** Debilita la comprobación de reproducibilidad de dependencias.
- **Probabilidad/exposición:** Alta: ambos jobs declaran instalación no congelada; no se observó deriva efectiva.
- **Beneficio esperado:** Instalaciones reproducibles con lockfile validado; mismo árbol resuelto para una revisión.
- **Esfuerzo / regresión:** S. Instalación, jobs, builds y script Firebase en CI.
- **Dependencias:** Validar sincronía de manifests/lockfile en entorno aislado aprobado; TD-008 para evidenciar skips.
- **Alternativas:** Congelar lockfile frente a justificar excepciones explícitas; no cambiar versiones para conseguir verde.
- **SPEC de cambio:** No creado; futura SPEC de CI independiente.
- **Decisión:** PROPUESTO; aprobación humana PENDIENTE.

#### TD-008 — Calidad / regresión
- **Origen:** DT-08 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** Casos de seguridad requieren variables; historial IA E2E simula persistencia.
- **Evidencia:** `apps/web/tests/e2e/security-comprehensive.spec.ts:72` y :158 — test.skip; `apps/web/tests/e2e/qa-history.spec.ts:3` — page.route/Map; `.github/workflows/quality.yml`.
- **Prueba/observación:** Las pruebas se inspeccionaron, ninguna se ejecutó. Ninguna ejecutada en esta fase.
- **Estado / severidad:** CONFIRMADO / P2.
- **Impacto:** Un CI verde por sí solo no acredita MFA/aislamiento SQL real.
- **Probabilidad/exposición:** Alta para cobertura declarada: existen skips condicionales y mocks. Ejecución efectiva desconocida.
- **Beneficio esperado:** Matriz de suites obligatorias: resultado por caso y motivo de skip; cero skips críticos no aceptados.
- **Esfuerzo / regresión:** M. Seguridad, sesiones, MFA, historial IA, artefactos y exposición de datos de prueba.
- **Dependencias:** Entorno desechable, test-inbox y cuentas sintéticas; no usar credenciales de producción.
- **Alternativas:** Mantener mocks de UI más suite SQL real separada; no sustituir todos los dobles ni llamar a IA comercial.
- **SPEC de cambio:** No creado; controles transversales en matriz 102.
- **Decisión:** PROPUESTO; aprobación humana PENDIENTE.

#### TD-004 — Persistencia / operación
- **Origen:** DT-04 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** onModuleInit no verifica explícitamente tablas 006/007.
- **Evidencia:** `apps/api/src/infrastructure/database.provider.ts` — onModuleInit; `apps/api/src/infrastructure/adapters/ai-settings.adapter.ts` — read; `packages/database/sql/006_qa_conversations.sql`; `packages/database/sql/007_qa_ai_settings.sql`.
- **Prueba/observación:** Chequeos estáticos; no readiness contra base. Ninguna ejecutada en esta fase.
- **Estado / severidad:** CONFIRMADO / P2.
- **Impacto:** Fallo tardío de historial/settings o fallback sin detectar desalineación completa.
- **Probabilidad/exposición:** Media: ocurre si despliegue/base no están sincronizados; ese estado no fue observado.
- **Beneficio esperado:** Tabla de capacidades requeridas y señales verificables sin hacer migraciones automáticas.
- **Esfuerzo / regresión:** M. Arranque API, health, capacidad IA y despliegue con servicio desactivado.
- **Dependencias:** TD-003, política de capacidades opcionales y contrato separado liveness/readiness.
- **Alternativas:** Readiness separado frente a fallo de arranque obligatorio; decisión pendiente según disponibilidad requerida.
- **SPEC de cambio:** No creado.
- **Decisión:** PROPUESTO; aprobación humana PENDIENTE.

#### TD-003 — Base de datos / autoridad de esquema
- **Origen:** DT-03 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** qa_conversations y qa_ai_settings no están declaradas en schema.ts, aunque existen en SQL y adaptadores.
- **Evidencia:** `packages/database/src/schema.ts` — pgTable; `packages/database/sql/006_qa_conversations.sql`; `packages/database/sql/007_qa_ai_settings.sql`; `packages/database/scripts/migrate.mjs`.
- **Prueba/observación:** `tests/drizzle-single-boundary.test.mjs` no prueba equivalencia total de esquema. Ninguna ejecutada en esta fase.
- **Estado / severidad:** CONFIRMADO / P2.
- **Impacto:** Riesgo de deriva en generación/contratos; SQL manual no es por sí mismo un defecto.
- **Probabilidad/exposición:** Media: SQL manual y tipado evolucionan por vías distintas; no se demostró migración errónea.
- **Beneficio esperado:** Definir autoridad y verificación de equivalencia; 0 cambios DDL no aprobados.
- **Esfuerzo / regresión:** M. Migraciones, cifrado settings, historial, tablas/índices y clientes Drizzle.
- **Dependencias:** Elegir autoridad SQL o tipada; revisar scripts generate/migrate sin ejecutarlos aquí.
- **Alternativas:** Mantener SQL canónico con inventario automatizado frente a extender modelo tipado; decisión previa a código.
- **SPEC de cambio:** No creado.
- **Decisión:** PROPUESTO; aprobación humana PENDIENTE.

#### TD-016 — Lectura / confianza del progreso
- **Origen:** DT-16 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** Tiempo/exposición de lectura se verifica en UI; el servidor solo valida índice.
- **Evidencia:** `apps/web/src/features/progress/use-reading-tracker.ts` — useReadingTracker; `libs/progress/src/domain/progress-commands.ts:28` — reading-section.
- **Prueba/observación:** `tests/reading-coverage.test.mjs`, `tests/automatic-progress.test.mjs`. Ninguna ejecutada en esta fase.
- **Estado / severidad:** CONFIRMADO / P2.
- **Impacto:** La marca acredita declaración cliente, no lectura comprobada independientemente.
- **Probabilidad/exposición:** Media: endpoint recibe sección válida sin atestación de exposición; uso fraudulento no observado.
- **Beneficio esperado:** Precisar qué significa leído y qué se puede comprobar; no prometer anti-fraude con temporizadores.
- **Esfuerzo / regresión:** M para definición de política; L si hay cambio funcional. Accesibilidad, pantallas pequeñas, visitantes y avance existente.
- **Dependencias:** Decisión de confianza pedagógica, alineada con TD-002.
- **Alternativas:** Autoevaluación explícita o validación adicional; ninguna elegida en esta fase.
- **SPEC de cambio:** No creado; futura SPEC funcional si se endurece.
- **Decisión:** PROPUESTO solo para decisión de producto; aprobación humana PENDIENTE.

#### TD-013 — Frontend / mantenibilidad
- **Origen:** DT-13 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** Despacho y asistentes concentrados en WeekLaboratory/PracticeActivity.
- **Evidencia:** `apps/web/src/components/academy/week-laboratory.tsx` — WeekLaboratory; `apps/web/src/components/academy/practice-activity.tsx:70` — ramas de asistentes.
- **Prueba/observación:** `apps/web/tests/e2e/topic-laboratories.spec.ts`, `apps/web/tests/e2e/practice-layout.spec.ts` y suites por misión. Ninguna ejecutada en esta fase.
- **Estado / severidad:** CONFIRMADO / P2.
- **Impacto:** Aumenta superficie de regresión al extender laboratorios; no implica por sí mismo pérdida de rendimiento.
- **Probabilidad/exposición:** Alta para mantenimiento: cada semana agrega ramas; no hay métrica de lentitud.
- **Beneficio esperado:** Registro estable de renderizadores de laboratorio con matriz 24/24; asistentes se mantienen inicialmente.
- **Esfuerzo / regresión:** M por iteración acotada. 24 prácticas, restauración de ejecución, children, foco y estado local React.
- **Dependencias:** Caracterización de dispatch/estado; no depende de endurecer validación.
- **Alternativas:** Registry explícito frente a reescritura total o plugin dinámico; elegida extracción local, sin dependencias.
- **SPEC de cambio:** [SPEC-112](SPEC-112-registro-laboratorios-to-be.md), reducción parcial.
- **Decisión:** PROPUESTO; aprobación humana PENDIENTE.

#### TD-011 — Contenido / consistencia
- **Origen:** DT-11 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** Reglas y contenidos se expresan en JSON, learningRules y kit.
- **Evidencia:** `libs/content/src/data/catalog.json`; `libs/content/src/data/practical-exercises.json`; `libs/progress/src/domain/learning-rules.ts`; `apps/web/public/practice/kit/guides/week-01.md`.
- **Prueba/observación:** `tests/module-topic-distribution.test.mjs`, `tests/reading-concepts.test.mjs`, `tests/practical-exercises.test.mjs`. Ninguna ejecutada en esta fase.
- **Estado / severidad:** INFERIDO / P2.
- **Impacto:** Posible divergencia de currículo, guías y progreso; no se puede cambiar material como limpieza técnica.
- **Probabilidad/exposición:** Media: múltiples fuentes requieren coordinación; no se probó deriva de todas ellas.
- **Beneficio esperado:** Comprobar invariantes entre fuentes antes de elegir generación o fuente única.
- **Esfuerzo / regresión:** L. Rutas/semanas, evaluación, descargas y contenido didáctico.
- **Dependencias:** Inventario de campos duplicados y propietario editorial; TD-002/016 para semántica de avance.
- **Alternativas:** Checks cruzados frente a generación de kit; no fusionar todos los JSON sin necesidad.
- **SPEC de cambio:** No creado.
- **Decisión:** APLAZADO hasta evidencia de invariantes faltantes; aprobación humana PENDIENTE.

#### TD-006 — Seguridad / límites
- **Origen:** DT-06 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** No se acreditó limitador global distribuido en los guards; sí hay controles por cuenta y verificación.
- **Evidencia:** `apps/api/src/presentation/security/session-security.ts`; `apps/api/src/infrastructure/adapters/postgres-identity.adapter.ts` — recordFailure; `apps/api/src/infrastructure/adapters/postgres-security.adapter.ts` — createVerification.
- **Prueba/observación:** `tests/account-security.test.mjs`; no ensayo de carga ni infraestructura externa consultada. Ninguna ejecutada en esta fase.
- **Estado / severidad:** PENDIENTE DE EVIDENCIA / P2 provisional.
- **Impacto:** Exposición potencial a abuso; no vulnerabilidad comprobada.
- **Probabilidad/exposición:** No determinada: no se revisaron límites externos de plataforma.
- **Beneficio esperado:** Decidir límites verificables tras inventariar protecciones; bloquear remediación genérica sin diagnóstico.
- **Esfuerzo / regresión:** L provisional. Registro, login, reenvío, recuperación, acceso legítimo y disponibilidad.
- **Dependencias:** Inventario autorizado de controles externos; modelo de amenazas y carga legítima.
- **Alternativas:** Control de plataforma o aplicación/coordinación; no elegir proveedor nuevo por defecto.
- **SPEC de cambio:** No creado.
- **Decisión:** APLAZADO; solo recopilación de evidencia; aprobación humana PENDIENTE.

#### TD-015 — Correo / integración
- **Origen:** DT-15 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** Colección del productor configurable y trigger propio fijo en mail.
- **Evidencia:** `apps/api/src/infrastructure/adapters/firebase-email.adapter.ts` — readFirebaseMailConfig; `firebase/functions/index.js:25` — onDocumentCreated.
- **Prueba/observación:** `tests/firebase-email.test.mjs`, `firebase/functions/test/send-email.test.cjs`; no envío real. Ninguna ejecutada en esta fase.
- **Estado / severidad:** PENDIENTE DE EVIDENCIA / P2 provisional.
- **Impacto:** Si existe esa combinación, podría haber mensajes no procesados; encolar no acredita envío.
- **Probabilidad/exposición:** Condicionada a función propia y colección no predeterminada; configuración real desconocida.
- **Beneficio esperado:** Demostrar compatibilidad por configuración antes de cambiar productor/consumidor.
- **Esfuerzo / regresión:** S/M tras evidencia. Verificación de correo, reintentos, duplicación y TTL de enlaces.
- **Dependencias:** Confirmar transporte, trigger y colección efectivos sin copiar secretos.
- **Alternativas:** Validar combinación o parametrizar trigger mediante cambio aprobado; no cambiar SMTP/Firebase ahora.
- **SPEC de cambio:** No creado.
- **Decisión:** APLAZADO; solo evidencia; aprobación humana PENDIENTE.

#### TD-009 — Privacidad / operación
- **Origen:** DT-09 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** No se acreditó política de conservación/borrado de conversaciones y auditoría en superficie revisada.
- **Evidencia:** `apps/api/src/presentation/controllers/qa-assistant.controller.ts`; `apps/api/src/infrastructure/adapters/qa-conversations.adapter.ts` — archive; `packages/database/src/schema.ts` — eventos.
- **Prueba/observación:** `apps/web/tests/e2e/qa-history.spec.ts` con dobles; no evidencia de proceso operativo. Ninguna ejecutada en esta fase.
- **Estado / severidad:** PENDIENTE DE EVIDENCIA / P2 provisional.
- **Impacto:** Retención y crecimiento sin contrato acreditado, no incumplimiento legal demostrado.
- **Probabilidad/exposición:** No determinada: no se verificó política externa ni volumen.
- **Beneficio esperado:** Documentar conservación/eliminación y validar restauración antes de cualquier operación destructiva.
- **Esfuerzo / regresión:** L/XL según retención. Historial, auditoría, referencias de usuarios y trazabilidad académica.
- **Dependencias:** Definir política con propietario, responsabilidades y datos que deben preservarse.
- **Alternativas:** Retención operacional o mecanismo específico con política aprobada; no borrar por limpieza.
- **SPEC de cambio:** No creado; eventual SPEC funcional y migración separada.
- **Decisión:** APLAZADO; aprobación humana PENDIENTE.

#### TD-014 — Seguridad / recuperación
- **Origen:** DT-14 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** No se localizaron rutas de rotación/desactivación MFA ni contraseña olvidada; operación manual desconocida.
- **Evidencia:** `apps/api/src/presentation/controllers/auth.controller.ts`; `libs/identity/src/application/account-security.ts` — beginMfa,activateMfa,verifyMfa.
- **Prueba/observación:** `tests/account-security.test.mjs`; `apps/web/tests/e2e/security-comprehensive.spec.ts` recovery de un uso, no rotación. Ninguna ejecutada en esta fase.
- **Estado / severidad:** PENDIENTE DE EVIDENCIA / P2 provisional.
- **Impacto:** Posible dificultad de recuperación sin proceso acreditado; añadir recuperación puede ampliar riesgo de toma de cuenta.
- **Probabilidad/exposición:** Condicionada a pérdida de factores/clave; procedimientos externos no revisados.
- **Beneficio esperado:** Acreditar proceso actual y definir recuperación segura antes de programar rutas.
- **Esfuerzo / regresión:** L/XL. MFA ADMIN, sesión, QR, recovery de un uso y revocaciones.
- **Dependencias:** Política de recuperación e identificación segura del propietario; no rotar claves.
- **Alternativas:** Proceso administrativo controlado o self-service; no asumir preferencia ni existencia.
- **SPEC de cambio:** No creado; requeriría SPEC funcional independiente.
- **Decisión:** APLAZADO; aprobación humana PENDIENTE.

#### TD-012 — Observabilidad / versión
- **Origen:** DT-12 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** health reporta 4.0.0 frente a paquetes raíz/API 6.1.0.
- **Evidencia:** `apps/api/src/presentation/controllers/health.controller.ts:6` — getHealth; `package.json`; `apps/api/package.json`.
- **Prueba/observación:** Respuesta declarada en código, no HTTP ejecutado. Ninguna ejecutada en esta fase.
- **Estado / severidad:** CONFIRMADO / P3.
- **Impacto:** Diagnóstico ambiguo de versión; no demuestra despliegue incorrecto.
- **Probabilidad/exposición:** Alta: indicador divergente en toda respuesta health; no se probó incidente operativo.
- **Beneficio esperado:** Definir versión y readiness separados antes de modificar respuesta pública.
- **Esfuerzo / regresión:** S. Formato de health y consumidores de monitorización.
- **Dependencias:** Contrato de build-id/versión, coordinado con TD-004; no incluir identificadores sensibles.
- **Alternativas:** Versión de paquete o build-id explícito; requiere decisión de contrato.
- **SPEC de cambio:** No creado.
- **Decisión:** PROPUESTO; aprobación humana PENDIENTE.

#### TD-010 — Roles / alcance editorial
- **Origen:** DT-10 de [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md).
- **Hallazgo:** InstructorController solo informa contentManagementAccess.
- **Evidencia:** `apps/api/src/presentation/controllers/instructor.controller.ts:6` — status; `libs/identity/src/domain/identity.ts` — canManageContent.
- **Prueba/observación:** Decoradores/endpoint inspeccionados, no CRUD localizado. Ninguna ejecutada en esta fase.
- **Estado / severidad:** CONFIRMADO / P3.
- **Impacto:** Expectativa ambigua de capacidad; crear un CMS sería funcionalidad nueva.
- **Probabilidad/exposición:** Baja: capacidad nominal de status; no editor observado.
- **Beneficio esperado:** Precisar contrato nominal; no conceder permisos nuevos como refactor.
- **Esfuerzo / regresión:** S para aclaración, XL si se decide CMS. Roles INSTRUCTOR/ADMIN, contrato status y publicación de contenidos.
- **Dependencias:** Decisión de producto: placeholder o capacidad futura.
- **Alternativas:** Documentar estado actual o abrir SPEC funcional editorial; no elegir sin aprobación.
- **SPEC de cambio:** No creado.
- **Decisión:** APLAZADO; aprobación humana PENDIENTE.


### Candidatas que no se promueven a deuda de implementación
El antecedente de GIF de ~98/100 MB es REPORTADO POR USUARIO. En esta línea base solo se encontró el GIF devtools-network-guide-v2.gif de **12 900 875 bytes** (aprox. 12,30 MiB), referenciado en DevToolsVisualGuide; la variante grande anterior no está en el árbol actual inventariado. **DESCARTADO como bloqueo actual demostrado por tamaño de publicación**, no como investigación futura de rendimiento. No hay métrica de carga/deploy que justifique sustitución de multimedia. Evidencia: `apps/web/src/components/academy/devtools-visual-guide.tsx:2`; metadatos de `apps/web/public/practice/illustrations/devtools-network-guide-v2.gif`. No se descargó ni transformó multimedia.

### Decisiones TO-BE propuestas
1. [SPEC-110](SPEC-110-politica-tamano-evidencia-to-be.md): primera candidata; corrección observable de límites con extracción de política. No es refactor transparente.
2. [SPEC-111](SPEC-111-validadores-practicas-por-estrategia-to-be.md): caracterización y refactor interno, sin endurecer validaciones ni cerrar TD-002.
3. [SPEC-112](SPEC-112-registro-laboratorios-to-be.md): extracción acotada de WeekLaboratory, sin reescribir asistentes; reducción parcial de TD-013.

No se redactan nuevas propuestas de implementación para TD-005/006/009/014/015 sin resolver su evidencia/política. Su investigación permanece en el roadmap.

## 03. Restricciones
Solo Markdown en docs/specs/. No tests/builds, instalaciones, llamadas mutativas, datos, migraciones, Git add/commit/push ni despliegues. Ningún dato de entorno real consultado. Los nombres de variables proceden de código y plantillas.
Las métricas aquí son objetivos futuros o conteos estáticos; no resultados de calidad ni rendimiento. Ninguna recomendación cambia permisos, sesiones, contenido o calificación por sí sola.

## 04. No-Objetivos
No eliminar toda la deuda ni adjudicar fechas, presupuestos o responsables humanos no asignados. No afirmar ausencia total de controles externos ni interpretar lo pendiente como aprobado.

## Verificación y próximos pasos
Ver [roadmap](101-roadmap-tecnico-to-be.md), [matriz de riesgos](102-matriz-riesgos-regresion.md) y las aprobaciones al final de cada propuesta. La comprobación de integridad final se registra en el roadmap.

