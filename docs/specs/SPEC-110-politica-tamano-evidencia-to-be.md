# SPEC-110 — Política coherente de tamaño de evidencia

> Estado: **IMPLEMENTADA EN LOCAL — NO LIBERADA; INTEGRACIÓN SQL EXTERNA PENDIENTE**
> Tipo: corrección funcional acotada de contrato, con extracción de política; **no es refactor transparente**.
> Línea base: main / b7a1cdaaf37f06cac2a5008158bd3fabc411c865.
> Hallazgo: TD-001 ↔ DT-01. Aprobación explícita del propietario en esta conversación: «Apruebo implementar SPEC-110 únicamente en local».
> Marco: [SPEC-100](SPEC-100-fase-2-reduccion-deuda-tecnica-to-be.md); [backlog](100-backlog-deuda-tecnica-priorizado.md); [riesgos R01/C01–C05](102-matriz-riesgos-regresion.md).

## 01. Intención
Eliminar la diferencia que permite preparar hasta 32000 caracteres para ejercicios 23/24, mientras API, dominio y lectura solo conservan 8000. Resultado deseado: el tamaño que la UI permite guardar se acepta y se recupera íntegro, sin ampliar los demás límites.

No se ha observado pérdida productiva ni se conoce la distribución de tamaños real. La incompatibilidad está demostrada por código. Métrica de aceptación: **cero diferencias de política en la tabla de casos aprobada y cero truncamientos en roundtrip de evidencia sintética**.

## 02. Comportamiento

### AS-IS que debe preservarse
PATCH /api/v1/me/progress recibe submit-evidence con kind/id/text, solo STUDENT propio, vía guards actuales. Texto mínimo 40, normalización y validación de identificadores vigentes. Guardado atómico con evento; importación autenticada solo notas. Leer visitante y leer estado remoto pasan por fromUnknown. No se cambia qué significa draft/validated, la finalización de práctica ni la nota académica.

### TO-BE propuesto: antes → después
| Caso | Antes UI / backend-lector | Después propuesto |
|---|---|---|
| exercise 1,5,7,8,9 | 32000 / 32000 | 32000 en todas las capas |
| exercise 23,24 | 32000 / 8000 | **32000 en todas las capas** |
| exercise restantes | 8000 / 8000 | 8000 en todas las capas |
| task/lab/certification válidos | 8000 / 8000 | 8000 |
| notas, source/output y archivo importado | Límites independientes existentes | Sin cambios |

Tamaño significa **String.length (unidades UTF-16)** de la evidencia JSON serializada, no bytes de red ni caracteres Unicode percibidos. Se conserva dónde el flujo actual aplica trim; no se introduce normalización nueva. No truncar, comprimir ni omitir datos para “hacerlos caber”.

### Alternativas
1. Bajar UI de 23/24 a 8000: conserva backend pero restringe el trabajo ya permitido en pantalla; no elegida.
2. Subir a 32000 para todas las evidencias: simple, pero amplía contrato sin necesidad; no elegida.
3. Política pura del dominio para máximos por kind/id, compartida con UI y lector; API llama esa política tras validación estructural. **Elegida como propuesta**, sin dependencia nueva ni ciclo entre contratos y dominio.
4. Agregar paquete shared o hacer contracts dependiente de progress: incrementa superficie de build/manifests; no necesario en esta iteración.

### Diseño y contratos
- Nuevo módulo puro evidence-policy en @qapath/progress expone límite por kind/id; no importa React, Nest, Zod, SQL ni contenido.
- Dominio de comandos, fromUnknown y UI llaman la misma política. Las claves desconocidas en normalización conservan comportamiento por defecto; no se endurecen identificadores de lectura aquí.
- progressCommandSchema conserva tipos, strict, trim, mínimo y tope estructural global 32000; retira solo el refinamiento por id. La política semántica por kind/id se comprueba antes de apply en ProgressController usando el mismo helper.
- Los cuerpos excesivos para su id siguen respondiendo **400 con el mismo mensaje de entrada inválida de ProgressController** que el refinamiento actual; no se expone un error interno nuevo. El dominio también verifica tamaño para consumidores fuera de HTTP.
- Formato de request/response, métodos, permisos, cookies, revisión SQL y contenido de eventos no cambian. Única expansión de aceptación: 23/24 entre 8001 y 32000.
- La ampliación de lectura puede conservar textos largos preexistentes en un estado local que antes se descartaban; es efecto deliberado. No reconstruye datos ya perdidos ni acredita validez académica.

### Alcance aprobado para implementación local
| Ruta | Cambio previsto |
|---|---|
| `libs/progress/src/domain/evidence-policy.ts` — NUEVO PROPUESTO | Función pura de máximos |
| `libs/progress/src/index.ts` | Exportar helper |
| `libs/progress/src/domain/progress-commands.ts` | Reutilizar máximo, conservar otras validaciones |
| `libs/progress/src/domain/progress.ts` | Lectura compatible por política, sin truncar |
| `packages/contracts/src/auth.ts` | Esquema estructural sin refinamiento de máximo por id |
| `apps/api/src/presentation/controllers/progress.controller.ts` | Guard semántico con la política y mismo error de entrada |
| `apps/web/src/components/academy/practice-activity.tsx` | Usar máximo compartido, sin tocar asistentes |
| `tests/evidence-policy.test.mjs` — NUEVO PROPUESTO | Tabla de bordes y roundtrip puro |
| `tests/evidence-policy-http.test.mjs` — NUEVO PROPUESTO | Contrato/guards/controlador con dobles de puerto; no prueba SQL |
| `tests/programming-practice.test.mjs` | Ampliación autorizada: una aserción de tamaño en el dominio en lugar de Zod |
| `tests/tool-evidence.test.mjs` | Ampliación autorizada: una aserción de tamaño en el dominio en lugar de Zod |
| `apps/web/tests/e2e/evidence-policy.spec.ts` — NUEVO PROPUESTO | Persistencia y recarga con fixtures de cuenta/DB desechable autorizada |
| Este Markdown | Evidencias/estado, solo si se aprueba su actualización de ejecución |

No se prevén cambios de manifiestos, lockfile, esquemas SQL, scripts, pipelines o dependencias. Si el desarrollo requiere otra ruta, vuelve a G2/G3.

### Secuencia futura
1. Caracterizar matriz actual, errores y datos históricos sintéticos; documentar las dos diferencias deliberadas.
2. Preparar lector compatible para 23/24 y comprobar que no pierde estado, sin habilitar aún nuevos tamaños en backend.
3. Con autorización de liberación, publicar primero ese lector compatible (API y web), verificar versión y caché de clientes; no declarar compatibilidad con pestañas antiguas sin evidencia.
4. Habilitar política de escritura/API y consumo UI sin otros cambios. Tras publicación, clientes viejos pueden seguir descartando los nuevos textos: acordar recarga/mínima versión antes de G6.
5. Completar roundtrip, aislamiento y revisión de eventos/diff; documentar limitaciones y artefacto de reversión.

Los pasos 3/4 describen despliegue futuro con aprobación separada, no una acción de esta tarea ni de una aprobación solo local.

### Criterios de aceptación
- CA-110-01: para todo id 1–24 y kind válido, el límite final de API/dominio/lector/UI coincide con tabla aprobada; desconocidos conservan rechazo por id.
- CA-110-02: en 23/24, guardar 8001 y 32000 unidades produce éxito y recuperación exacta para estudiante y visitante; 32001 falla sin mutar estado.
- CA-110-03: en tipos/id limitados a 8000, 8000 sigue aceptado y 8001 devuelve el mismo 400 de entrada y ningún evento de guardado.
- CA-110-04: 39 falla, 40 válido pasa tamaño; otras reglas de negocio siguen decidiendo su validez. Casos con espacios/emoji conservan semántica UTF-16/trim.
- CA-110-05: evidencia completa de 23/24 a longitud máxima incluye todos los campos, no recorta notas o ejecuciones; sin truncamiento ni pérdida tras recarga.
- CA-110-06: lectura y guardado de formatos históricos sintéticos conservan texto; no se migran ni borran registros.
- CA-110-07: controles de origen, rol, propiedad y transacción se mantienen; otra cuenta no recupera la evidencia.
- CA-110-08: importar backup autenticado no concede evidencia/avance, ni siquiera con texto largo.
- CA-110-09: rollback compatible ensayado antes de G6; no se acepta revertir a un lector que descarte textos nuevos.

### Plan de pruebas futuro
Caracterización de contrato y errores; unitarias de política/comandos/fromUnknown; HTTP con puerto simulado para alcance de validación; integración con PostgreSQL efímero para comprobar texto/revisión/eventos y cuentas A/B; E2E de 23/24 + error/reintento. Reutilizar pruebas de progreso/porcentaje y arquitectura del repositorio. Los resultados locales ejecutados y las omisiones se registran al final de este documento. DB writes, instalación de entorno o migraciones de prueba requieren autorización de esa modalidad, nunca producción.

### Observabilidad y riesgos
Comparar matriz de aceptados/rechazados y longitudes antes/después; objetivo cero truncamientos, no una tasa inventada de producción. Registrar kind/id/tamaño y categoría de resultado solo si ya existe mecanismo permitido; no añadir telemetría, endpoints o logs de contenido bajo esta SPEC.
Riesgos: R01 (compatibilidad de lectores), R02 (tamaño no acredita validez), R08 (entorno de prueba), R13 (componente concentrado). TD-002 sigue abierto.

### Rollback
Antes de nuevos datos largos: revertir cambios de código mediante nueva revisión, sin reescribir historia. Después de aceptar datos largos: **no volver al normalizador antiguo**. Utilizar build compatible que mantenga lectura de 32000 en 23/24 y, si se decide pausar nuevas escrituras largas, las rechace sin truncar ni sobrescribir la evidencia previa. Ese artefacto y mecanismo de pausa deben probarse y aprobarse antes de liberar.
Sin DDL ni migración, pero con compatibilidad de datos real: revertir binario no equivale a revertir el contrato de datos. Si no hay rollback seguro ensayado, G6 bloqueado.

## 03. Restricciones
Máximo y alcance aprobados únicamente para implementación local. No modificar notas, evaluación, cifrado, cuotas IA, permisos ni formatos persistidos. Preservar imports y dependencias; PR, merge, DB y despliegue siguen sin autorización.
Aprobación de esta SPEC debe indicar solo local o modalidad adicional; no autoriza PR, merge, migración, secreto o producción por implicación.

## 04. No-Objetivos
No ampliar a todos los ids, resolver autenticidad de ejecución, refactorizar toda PracticeActivity, recuperar datos ya descartados ni instalar servicios.

## Evidencia AS-IS y trazabilidad
| Afirmación | Archivo/símbolo | Prueba/observación | Estado |
|---|---|---|---|
| Disparidad 23/24 | `apps/web/src/components/academy/practice-activity.tsx:58` vs `packages/contracts/src/auth.ts:8` | Código y DT-01 | CONFIRMADO |
| Normalizador descarta por longitud | `libs/progress/src/domain/progress.ts:18` — objStrings | Lectura, no incidente real | CONFIRMADO |
| Comandos y política actual | `libs/progress/src/domain/progress-commands.ts:40` | Límite duplicado | CONFIRMADO |
| Persistencia y controles | `apps/api/src/presentation/controllers/progress.controller.ts`; `apps/api/src/infrastructure/adapters/postgres-progress.adapter.ts` — transact/import | SQL leído; test runtime pendiente | CONFIRMADO |
| Paquetes sin dependencia cruzada requerida | `packages/contracts/package.json`; `libs/progress/package.json` | Evitar nueva arista contracts→progress | CONFIRMADO |
| Beneficio/rollback real | Nuevo diseño, no ejecutado | Criterios futuros | PENDIENTE DE EVIDENCIA |

## Aprobación de ejecución
Estado: **APROBADA PARA IMPLEMENTACIÓN LOCAL**
Alcance y riesgos revisados por: propietario del proyecto, en esta conversación.
Fecha / decisión explícita: 2026-10-26 (America/Bogota), «Apruebo implementar SPEC-110 únicamente en local».
Decisiones obligatorias: D-01/D-02 del roadmap, tabla de límites y error HTTP preservado.
Modalidad autorizada: implementación local en rama separada y validación local pertinente; ningún PR/merge/deploy implícito. Preparación/uso de DB efímera y sus migraciones se autoriza aparte.

Ampliación de alcance aprobada explícitamente por el propietario en esta conversación: «Sí, autorizar esos dos ajustes de pruebas», para tests/programming-practice.test.mjs y tests/tool-evidence.test.mjs. Se modifica únicamente una aserción por archivo: el rechazo de evidencia de más de 8000 en práctica 10 se comprueba en el dominio. No se amplía la aceptación de esa práctica ni se modifican las demás pruebas existentes.

## Evidencia de implementación y validación local

### Procedencia y cambios
- Rama local: `codex/spec-110-evidence-policy`. HEAD base permanece en `b7a1cdaaf37f06cac2a5008158bd3fabc411c865`; sin commit/push/PR/merge ni despliegue.
- Se implementó `evidenceTextLimit(kind,id)` en el dominio, sin nuevas dependencias. Comandos, normalizador y UI usan esa política; ProgressController conserva el 400 y su mensaje previo cuando el tamaño supera el máximo del id.
- Zod mantiene validación estructural. En Zod instalado, los límites de cadenas cuentan puntos de código; el guard semántico y el dominio verifican String.length UTF-16. Se añadió un caso HTTP de 32001 unidades con emoji para comprobar ese borde, conservando la semántica estructural previa.
- Caracterización anterior al cambio: para 22,23,24, un texto de 8001 fallaba en contrato/dominio/lector. Después: 22 sigue rechazado; 23/24 se aceptan y recuperan íntegros. El esquema estructural ya no decide el límite por id; lo hace la política semántica aprobada.
- Control de alcance mediante hash de archivos regulares versionados/no ignorados, excluyendo .env reales y extensiones de claves: solo 13 rutas cambiadas o nuevas, las 11 del alcance inicial (incluido este Markdown) más las dos pruebas expresamente añadidas. Ninguna ruta inesperada. Los otros documentos se conservaron.

### Resultados ejecutados
Entorno: Windows, Node.js v24.13.0, dependencias locales instaladas; validación con archivos sin commit sobre el SHA indicado, no una validación de producción.

| Comprobación | Comando/método local | Resultado |
|---|---|---|
| Bibliotecas afectadas | `node node_modules/typescript/bin/tsc -p libs/progress/tsconfig.json` y equivalente con `packages/contracts/tsconfig.json` | Compilación correcta |
| Suite completa de tests Node | `node --test tests/*.test.mjs` | **212 aprobadas, 0 fallidas, 0 omitidas** |
| Typecheck API y web | `node node_modules/typescript/bin/tsc -p apps/api/tsconfig.json --noEmit --incremental false` y equivalente web | 0 diagnósticos |
| Compilación API y tipos del nuevo E2E | TypeScript local con emisión del API; programa TypeScript específico para el archivo Playwright (excluido del tsconfig web habitual) | Correctos; E2E con 0 diagnósticos |
| Lint de rutas TS/TSX afectadas | ESLint instalado en cada app: controlador de progreso, PracticeActivity y el nuevo E2E | Sin errores |
| Chromium: visitante 23/24, 8001/32000 | Playwright `tests/e2e/evidence-policy.spec.ts --project=chromium --workers=1 --reporter=list`, E2E_BASE_URL local 3120 | **4 aprobadas; conservación exacta tras guardar y recargar** |
| Integración PostgreSQL externa | Mismo archivo, caso opt-in `SPEC110_ALLOW_ISOLATED_DB` | **1 omitida expresamente; sin autorización de esa modalidad** |
| Reversión compatible | Test unitario de pausa de escritura manteniendo lectura de evidencia larga | Aprobado como simulación; no acredita un artefacto de rollback desplegable |
| Higiene del diff | `git diff --check` y hashes contra captura inicial | Sin errores de diff ni cambios de fuente fuera del alcance |

Las pruebas HTTP ejecutan Nest/guards/controlador reales con usuarios y persistencia simulados; verifican 401/403, error 400, límites, lectura y aislamiento de ese puerto. La prueba de importación usa el método import real del adaptador, sustituyendo solo la transacción; no acredita PostgreSQL externo, revisiones SQL ni atomicidad de una base real. Los tests existentes que usan PGlite operan en un motor aislado en proceso, sin conexión productiva.

### Incidencias de validación resueltas y límites
- El launcher de `pnpm run build:libs` intentó obtener su runtime y falló por red. Se usó TypeScript ya instalado para compilar las bibliotecas afectadas; no se cambiaron manifests, lockfile ni versiones.
- La primera ejecución general dio 210/212: dos aserciones antiguas comprobaban el límite semántico en Zod. Con la ampliación explícita del propietario se ajustó una por archivo; la repetición completa dio 212/212.
- El servidor preexistente de localhost:3000 servía una compilación anterior. Se preparó una copia de código bajo una carpeta de compilación ignorada y un servidor temporal en 3120. Se corrigieron exclusivamente detalles de ese entorno de prueba (carpeta no eliminable por Playwright, tsconfig y puerto/origen de desarrollo) antes de la ejecución final satisfactoria. La configuración del producto no se modificó.
- No se ejecutaron migraciones ni pruebas contra PostgreSQL externo. El caso de integración está preparado y desactivado por defecto; exige base desechable, test-inbox y autorización independiente. No se ejecutó la suite E2E completa ni otros navegadores, ni se acredita un build de producción del frontend.
- G4 local completado y comprobaciones locales anteriores satisfactorias; **no se declara liberación ni cierre integral de G5/G6**. Falta integración externa autorizada, decisión de versiones/recarga de clientes y artefacto de rollback compatible ensayado antes de cualquier publicación.
- Para visualizar el cambio en los servicios locales preexistentes se necesita recompilar/reiniciar esos servicios con esta rama; no se los reemplazó por el servidor temporal de pruebas.

