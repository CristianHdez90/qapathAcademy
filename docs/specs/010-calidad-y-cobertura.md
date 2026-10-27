# SPEC-010 — Calidad y cobertura observables

## 01. Intención
Identificar qué verificaciones existen y qué acreditan realmente, sin presentar nombres de tests o resultados históricos como una ejecución actual.

## 02. Comportamiento
### Inventario estático
Se contaron **57 archivos tests/*.test.mjs** y **54 apps/web/tests/e2e/*.spec.ts** en archivos versionados o no ignorados del workspace. No es cantidad de casos ni porcentaje de cobertura. También existen tests de Firebase Functions y un integration.mjs de emulador fuera del patrón unitario estándar.

### Capas y alcance leído
| Capa | Evidencia | Qué comprueba / qué no demuestra |
|---|---|---|
| Dominio | tests/domain.test.mjs, account-security.test.mjs, administration.test.mjs, automatic-progress.test.mjs | Reglas y casos de uso; no certifica SQL productivo |
| Arquitectura | tests/architecture.test.mjs | Regex de imports en cuatro contextos y web; no análisis completo del grafo |
| Frontera Drizzle | tests/drizzle-single-boundary.test.mjs | Imports/dependencias y exports estáticos |
| Contratos HTTP IA | tests/ai-settings-http.test.mjs | Nest real y guards; persistencia, identidad y proveedor sustituidos por dobles |
| Proveedores/cuotas IA | tests/qa-assistant.test.mjs | Payloads, errores y reservas con dependencias controladas; no disponibilidad comercial |
| Progreso de prácticas | tests/practice-completion.test.mjs | Valida fixtures para 24 semanas; no recorre 24 motores reales |
| UI y misiones | apps/web/tests/e2e/*-mission.spec.ts | Flujos de interfaz definidos; muchos usan interceptación |
| Historial IA | apps/web/tests/e2e/qa-history.spec.ts | route.fulfill y Map simulan usuarios/historial; no prueba persistencia PostgreSQL |
| Seguridad/persistencia real | apps/web/tests/e2e/security-comprehensive.spec.ts | Casos condicionales de base/test-inbox y ADMIN; pueden omitirse sin variables |
| Emulador Firebase | scripts/test-firebase-auth.mjs; tests/firebase-auth-emulator.integration.mjs | Ruta separada; no prueba Firebase producción |

### Scripts y CI
package.json: test compila bibliotecas y ejecuta node --test; check encadena test, typecheck, lint y build. No se ejecutó ninguno aquí.
quality.yml: en main y PR ejecuta instalación, test, typecheck, lint y build; job e2e separado necesita quality, levanta PostgreSQL desechable, migra, compila e instala Chromium/WebKit y ejecuta E2E y Firebase. Instalación --no-frozen-lockfile pese a existir pnpm-lock.yaml.
Playwright: fullyParallel, dos proyectos (Chromium y WebKit), dos retries en CI, trace retain-on-failure. CI/E2E_PRODUCTION usa servicios compilados; local usa dev y puede reutilizar servidor.
La suite security-comprehensive exige E2E_ALLOW_DB_WRITES, TEST_INBOX_DIR y credenciales específicas para ciertos casos; no basta con que el job e2e exista para acreditar que se ejecutan todos.

### Criterios de aceptación derivados
- Q-001: un documento de verificación debe identificar commit/workspace, comando y resultado antes de afirmar que un test pasó.
- Q-002: un test que intercepta HTTP se etiqueta como prueba de UI con dobles, no de base real.
- Q-003: las omisiones condicionales deben diferenciarse de pruebas satisfactorias.
- Q-004: las reglas estáticas de arquitectura se documentan con su alcance literal.

## 03. Restricciones
**Ninguna suite, build, lint, instalación o integración fue ejecutada durante esta ingeniería inversa.** No se usaron reportes generados previamente como validación del workspace actual. El examen de pruebas fue selectivo; los conteos son exhaustivos respecto de los patrones indicados, no una revisión individual de todas las aserciones.

## 04. No-Objetivos
No añadir tests, medir cobertura dinámica, corregir fallos ni declarar conformidad de seguridad/accesibilidad. No afirmar que CI remoto esté verde.

## Evidencia y trazabilidad
| Afirmación | Evidencia (ruta + símbolo) | Test/observación | Estado |
|---|---|---|---|
| Scripts | `package.json` — scripts.test/check/test:e2e | Solo lectura | CONFIRMADO |
| Pipeline declarado | `.github/workflows/quality.yml` — jobs quality/e2e | No se consultó ejecución GitHub | CONFIRMADO |
| Navegadores y servicios | `apps/web/playwright.config.ts` — defineConfig | Configuración leída | CONFIRMADO |
| Casos saltables | `apps/web/tests/e2e/security-comprehensive.spec.ts:72` y :158 — test.skip | Variables efectivas no leídas | CONFIRMADO |
| Test de API con dobles | `tests/ai-settings-http.test.mjs:9` — TestModule,useValue | Código leído, no ejecutado | CONFIRMADO |
| Historial simulado | `apps/web/tests/e2e/qa-history.spec.ts:3` — page.route | Código leído | CONFIRMADO |
| Estado verde / porcentaje cobertura | Sin nueva ejecución | Pendiente de evidencia | NO VERIFICADO |

## Preguntas abiertas y deuda técnica
DT-07/08: reproducibilidad de instalación y cobertura efectiva de casos condicionados. Un Spec futuro de calidad debe definir suites obligatorias, omisiones admisibles y evidencia por revisión.

