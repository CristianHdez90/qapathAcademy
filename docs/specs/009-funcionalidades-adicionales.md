# SPEC-009 — Laboratorios, asistente QA y preparación CTFL

## 01. Intención
Aprender mediante experimentos guiados y evidencia, consultar a MariBug y practicar CTFL sin presentarlo como certificación oficial.

## 02. Comportamiento
### Laboratorios por semana
WeekLaboratory selecciona un componente por semana; PracticeActivity coordina datos, última ejecución, estado validated/draft y asistente de evidencia.
| Semanas | Experimento / componentes observados |
|---|---|
| 1–2 | Matriz/HU y misión de riesgos; FoundationWorkbook, RiskMissionLab |
| 3–6 | Gherkin, contraseña, bug y sprint; GherkinLab, PasswordLab, BugLab, SprintLab |
| 7–8 | HTTP/Postman/DevTools y SQL; ToolsMissionLab, SqlMissionLab |
| 9–12 | JavaScript/Git, JSON, TypeScript, asincronía; ProgrammingLab, JsonReportLab, TypeScriptLab, AsyncLab |
| 13–16 | Primera UI, locators, trace y matriz; FirstUiLab, LocatorMissionLab, TraceMissionLab, MatrixMissionLab |
| 17–20 | Page Object, fixtures, API y recuperación; PageObjectLab, FixtureMissionLab, ApiContractLab, RecoveryMissionLab |
| 21–24 | Pipeline, flakiness, proyecto y presentación; PipelineMissionLab, FlakinessMissionLab, ProjectMissionLab, PresentationMissionLab |

Es inventario de dispatch/componentes, no prueba de que cada misión complete su flujo. Hay código local pendiente de commit en 1 y 17–24: forma parte de esta línea base.

### Motores y límites comprobados
- JS/TS: executeCode transpila cuando corresponde, ejecuta worker dentro de iframe con origen opaco, CSP sin conexiones de red y allow-scripts sin same-origin. assert falla al ser falsa; console se captura. Worker se termina a los 3 s y el contenedor tiene timeout 3,5 s. La transpilación por sí sola no acredita comprobación semántica TypeScript; existen workers de comprobación aparte.
- SQL: sql.worker crea PGlite nuevo, carga training.sql anterior a -- Q1, establece statement_timeout 3000 ms, ejecuta query, devuelve columnas y hasta 100 registros; cierra base en finally. La UI usa SqlResultTable; la salida serializada interna no implica mostrar JSON al estudiante.
- Git: isomorphic-git/LightningFS; origin de entrenamiento es qapath-local://origin, no GitHub. publishTrainingBranch exige rama actual, commit, igualdad editor/archivo/commit/índice, fast-forward y verifica SHA/contenido remoto local. fetchTrainingMain copia objetos y actualiza origin/main sin cambiar el archivo de trabajo.
- UI: runBrowserScenario opera sobre iframe, configura datos y compara interfaz; scenarioSpec genera spec descargable. No se debe equiparar una ejecución DOM en navegador con ejecutar Playwright contra todos los navegadores.
- Sandbox API público: GET practice/products, status/:code, access y POST quotes, datos ficticios sin persistencia comercial. Códigos controlados: 200,201,202,204,400,401,403,404,409,422,429,500,503. access diferencia falta de credencial ficticia (401) y reader escribiendo (403).
- practiceQuote valida tipo/campos, producto/disponibilidad, cantidad entera 1–5, cupón QA10 y mínimo de subtotal; calcula descuento 10% y envío de entrega. Errores 400/404/409/422 según causa. No cobra ni crea un pedido.

### IA: configuración, consulta e historial
1. ADMIN puede GET/PATCH admin/ai-settings y POST admin/ai-settings/test. Esquema estricto: provider groq/gemini, URL oficial fija por proveedor, modelo, enabled, temperatura 0–1, tokens 256–8192, revisión y reemplazo/eliminación de clave.
2. Fila singleton qa_ai_settings con revisión, bloqueo advisory y de fila; cambio concurrente responde conflicto. Claves AES-256-GCM, AAD propia, separadas por proveedor. view solo revela presencia/origen, no clave.
3. Defaults usan entorno si no hay fila; fila existente prevalece. Una clave de base tiene prioridad frente a la variable del proveedor. Prueba administrativa usa configuración guardada y reserva cuota; permite probar aunque enabled=false.
4. AssistantController requiere sesión, sin rol concreto. POST assistant/chat valida historial alterno user/assistant (1–11 mensajes, cada uno <=4000, total <=16000), página de una lista y relación conversationId/revision/keepHistory.
5. QaQuotaAdapter reserva en PostgreSQL: 100/día global UTC, 20/día por usuario y 5/minuto. Una llamada al proveedor fallida después de reservar no tiene devolución implementada en este flujo.
6. QaAiAdapter despacha: Groq Responses /responses; Gemini generateContent. Prompt QA controlado por servidor y contexto de página; timeout 25 s, manejo explícito de errores y respuesta limitada a 12000 caracteres. El sistema no expone herramientas para modificar usuarios/progreso.
7. keepHistory solicita persistencia; conversaciones propias filtradas por user_id, paginadas 50, archivar/restaurar con revisión y máximo 200 mensajes. Al continuar, el servidor usa últimos cuatro mensajes almacenados recortados y pregunta actual. Conflicto durante append puede ocurrir después del coste de la consulta externa.
8. La lista permitida de page no incluye /practice/[week]; no se concluye que todo el chat en prácticas falle, porque page es opcional y depende del payload UI.

### CTFL
CtflModule: seis capítulos, banco de 40 preguntas, autoevaluación y simulacro con 60/75 minutos; respuestas se corrigen en cliente mediante gradeCtfl. Meta 65%; al entregar conserva mejor resultado desde UI como evidencia certification:ctfl-*. El dominio acepta id/texto, no recalcula ese examen. Es complemento independiente de las 24 semanas, no certificación oficial; intento en curso se pierde al salir.

### Criterios de aceptación derivados
- F-001: un push del ejercicio Git sin origin configurado o con contenido distinto del commit falla, sin publicar externamente.
- F-002: SQL devuelve tabla de columnas/filas del dataset de entrenamiento, sin conexión a la base de usuarios.
- F-003: guardar IA con URL ajena al proveedor es inválido; vista de settings no devuelve la clave.
- F-004: consultar una conversación ajena devuelve no encontrado por filtro de propiedad.
- F-005: al agotar cuota, se rechaza antes de llamar al proveedor.
- F-006: CTFL no cambia por sí solo la finalización de las 24 semanas.

## 03. Restricciones
Simulaciones, código generado, solicitudes HTTP reales al sandbox y motores de navegador son mecanismos distintos. La existencia de descargas .spec.ts no acredita ejecución de Playwright en servidor. Validación académica más débil que algunos asistentes UI: DT-02. No se llamó a IA ni se ejecutó código de estudiante.

## 04. No-Objetivos
No rediseñar laboratorios, cambiar sus textos ni completar flujos faltantes. No verificar versiones actuales de servicios externos, costes, cuotas comerciales o estándares CTFL: solo se describe lo incluido en el repositorio.

## Evidencia y trazabilidad
| Afirmación | Evidencia (ruta + símbolo) | Test/observación | Estado |
|---|---|---|---|
| Despacho y evidencia | `apps/web/src/components/academy/week-laboratory.tsx` — WeekLaboratory; `apps/web/src/components/academy/practice-activity.tsx` — PracticeActivity | Tests *-mission.spec.ts existentes; lectura parcial | CONFIRMADO |
| Aislamiento de código | `apps/web/src/features/practice/runtime/code-sandbox.ts:1` — executeCode | Código leído, sin ejecutar | CONFIRMADO |
| SQL y tabla | `apps/web/src/features/practice/runtime/sql.worker.ts:1`; `apps/web/src/components/academy/sql-result-table.tsx` | `tests/sql-result.test.mjs`; `apps/web/tests/e2e/sql-results.spec.ts` | CONFIRMADO |
| Git local verificado | `apps/web/src/features/practice/runtime/git-training-remote.ts:23` — publishTrainingBranch | `apps/web/tests/e2e/programming-mission.spec.ts` existente | CONFIRMADO |
| DOM frente a spec | `apps/web/src/features/practice/runtime/browser-scenario.ts:4` — runBrowserScenario,scenarioSpec | Lectura del motor | CONFIRMADO |
| Sandbox HTTP | `apps/api/src/presentation/controllers/practice.controller.ts`; `apps/api/src/application/practice-sandbox.ts` — practiceQuote | `tests/api-contract-practice.test.mjs` existente | CONFIRMADO |
| Configuración IA | `apps/api/src/application/ai-settings.ts` — aiSettingsSchema; `apps/api/src/infrastructure/adapters/ai-settings.adapter.ts` — runtime,save | `tests/ai-settings.test.mjs`; `tests/ai-settings-http.test.mjs` | CONFIRMADO |
| Proveedores | `apps/api/src/infrastructure/adapters/groq-qa.adapter.ts` — answer; `apps/api/src/infrastructure/adapters/gemini-qa.adapter.ts` — answer | `tests/qa-assistant.test.mjs` con proveedores simulados | CONFIRMADO |
| Cuota e historial | `apps/api/src/infrastructure/adapters/qa-quota.adapter.ts` — reserve; `apps/api/src/infrastructure/adapters/qa-conversations.adapter.ts` — prepare,append | `apps/web/tests/e2e/qa-history.spec.ts:3` intercepta API | CONFIRMADO |
| CTFL | `apps/web/src/components/academy/ctfl-module.tsx` — CtflModule,CtflQuiz; `apps/web/src/features/certification/ctfl-content.ts` — gradeCtfl | `tests/ctfl.test.mjs`; `apps/web/tests/e2e/ctfl.spec.ts` | CONFIRMADO |
| Funcionamiento completo de cada misión | Inspección de dispatch y motores, sin recorrido de todas las misiones | Pendiente de evidencia de ejecución | NO VERIFICADO |

## Preguntas abiertas y deuda técnica
DT-02, DT-09, DT-13: integridad académica, conservación de conversaciones y mantenimiento del dispatch. Evaluar en TO-BE si es intencional gastar cuota en errores externos/pruebas y si la calificación CTFL debe seguir siendo autoevaluación cliente.

