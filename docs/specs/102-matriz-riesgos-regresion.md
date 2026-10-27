# Fase 2 — Matriz de riesgos y regresión

> Estado: PROPUESTA; todas las ejecuciones de prueba descritas son futuras.
> Línea base: main / b7a1cdaaf37f06cac2a5008158bd3fabc411c865. Fuente: [AS-IS](012-matriz-trazabilidad.md), [backlog](100-backlog-deuda-tecnica-priorizado.md) y [SPEC-100](SPEC-100-fase-2-reduccion-deuda-tecnica-to-be.md).

## 01. Intención
Separar riesgo actual de riesgo introducido por corregir/refactorizar, definiendo controles observables antes de autorizar cambios.

## 02. Comportamiento
Probabilidad/exposición es juicio ordinal B/M/A basado en código; no tasas de incidentes. Severidad provisional no demuestra defecto productivo. Riesgo residual es una estimación pendiente de G5 y no resultado de una mitigación aplicada.

### Riesgos por hallazgo
| Riesgo / deuda | Situación actual y exposición | Riesgo al cambiar | Barrera propuesta | Evidencia/regresión futura | Residual / reversión |
|---|---|---|---|---|---|
| R01 / TD-001 | P1; A: UI/backend/lector dispares en 23/24 | Descartar evidencia nueva al volver a lector antiguo; aceptar demasiado en otros ids | Tabla explícita; lector antes de escritor; no truncar | Bordes por kind/id + roundtrip local/SQL + otra cuenta | M hasta verificar; rollback lector compatible, no restauración destructiva |
| R02 / TD-002 | P1; M: sobre cliente no prueba cada objetivo | Recalcular prácticas históricas y quitar avance; falsa promesa anti-fraude | 111 conserva semántica; endurecer requiere otra SPEC | Corpus con/sin notebooks, draft/validated, porcentaje antes/después | Confianza funcional sigue abierta; revertir solo extracción |
| R03 / TD-003 | P2; M: autoridad de esquema múltiple | DDL accidental o pérdida de tablas/datos | Elegir autoridad; no db:generate/migrate en planificación | Comparación en base desechable + checksum; migraciones futuras con aprobación | Desconocido; rollback DDL requiere diseño específico |
| R04 / TD-004 | P2; M: chequeos parciales de arranque | Bloquear toda academia por capacidad IA opcional | Distinguir liveness/readiness y requisitos por capacidad | Base con/sin 006/007, IA activa/inactiva, errores acotados | M hasta política; revertir chequeo no sustituye migración |
| R05 / TD-005 | P1 provisional; M condicionada a fallo externo | Duplicar side effects, pérdida de correo verificado o sesiones | Falla controlada + estrategia idempotente antes de solución | Dobles Firebase con falla antes/después y SQL desechable | No evaluado; ningún rollback “atómico” entre servicios supuesto |
| R06 / TD-006 | P2 provisional; exposición externa desconocida | Bloquear estudiantes legítimos o permitir abuso distribuido | Inventario de controles y modelo de amenazas | Límites/recuperación con reloj controlado y carga sintética aprobada | No evaluado; reversión de política separada |
| R07 / TD-007 | P2; A en ambos jobs | CI deja de instalar por lockfile desalineado | Validar árbol exacto sin actualizar paquetes de paso | Instalación congelada reproducible en entorno aprobado | B/M pendiente; revertir política CI sin tocar versiones |
| R08 / TD-008 | P2; A de omisión posible | Tests escriben datos reales o aparentan pasar por mocks | DB efímera, test-inbox, reporte de skips, sin claves reales | RBAC/MFA/progreso real separado de UI simulada | M; borrar únicamente entorno desechable autorizado |
| R09 / TD-009 | P2 provisional; volumen/política desconocidos | Borrado irreversible de auditoría o historial | Política de conservación y ensayo de restauración | Casos de propiedad/archive y retención futura con datos sintéticos | No evaluado; no borrar sin aprobación independiente |
| R10 / TD-010 | P3; B: permiso nominal | Conceder capacidad editorial/roles no aprobados | Mantener status y permisos mientras se decide | STUDENT 403, INSTRUCTOR/ADMIN status, sin CRUD añadido | B; restaurar endpoint sin cambio de roles |
| R11 / TD-011 | P2; M: fuentes repetidas | Alterar currículo/quiz por “unificación” | Invariantes editoriales y fuente elegida antes de generación | 24 semanas, distribución, preguntas, guías/kit | M; reversión de contenido exige preservar progreso |
| R12 / TD-012 | P3; A: versión discrepante | Romper monitor por nueva forma de health | Aprobar contrato de versión/build-id y readiness | Misma ruta/status/envelope; valores esperados aprobados | B/M; revertir indicador sin modificar checks de auth |
| R13 / TD-013 | P2; A para mantenimiento | Remounts, pérdida de borrador o inicialización de motor incorrecta | Registry estable y caracterización; 112 no toca asistentes | Matriz 24/24 + estados restaurados + paginación/foco | M hasta G5; revertir registry a dispatch previo |
| R14 / TD-014 | P2 provisional; proceso externo desconocido | Recuperación débil permite toma de cuenta | No añadir bypass; política segura con aprobación específica | TOTP replay, recovery de un uso, revocación y nuevo enrolamiento solo si existe | No evaluado; rotar claves no es rollback técnico |
| R15 / TD-015 | P2 provisional; colección/transporte desconocidos | Mensajes sin procesar o verificación duplicada | Inventariar configuración; probar productor/trigger con dobles | Colección correcta/incorrecta, estados y retry; sin SMTP real | No evaluado; retorno de configuración aprobado, sin reenviar a ciegas |
| R16 / TD-016 | P2; M: lectura declarada por cliente | Excluir accesibilidad, pantallas pequeñas o quitar lectura guardada | Definir confianza; mantener rastreo actual en refactors | Foco/visibilidad/capítulos en pantallas pequeñas, comandos por sección | Política abierta; no retrocalificar como medida técnica |

### Línea base de regresión aplicable a propuestas 110–112
| Control | Actor / entrada | Invariante | Pruebas existentes a reutilizar | Verificación nueva propuesta |
|---|---|---|---|---|
| C01 · Acceso | Anónimo, STUDENT, INSTRUCTOR, ADMIN | Guardado solo propio STUDENT; roles y cookie/origen iguales | `apps/web/tests/e2e/student-auth.spec.ts`; `apps/web/tests/e2e/security-comprehensive.spec.ts` | Anónimo 401, roles no autorizados 403, origen ajeno 403 y sin escritura |
| C02 · Tamaño | kinds y ejercicios 1–24 | Solo 23/24 amplían contrato si se aprueba 110; otros máximos iguales | `tests/automatic-progress.test.mjs` | Longitud total serializada: 39/40/7999/8000/8001/31999/32000/32001, inválidos y Unicode |
| C03 · Persistencia | Visitante/estudiante y cuenta B | Guardar/recargar exacto sin truncar, aislamiento, evento sin texto privado | `apps/web/tests/e2e/practice-progress.spec.ts` | 23/24 largas en base efímera y localStorage; fallo/reintento |
| C04 · Importación | Backup de visitante a cuenta | Importación autenticada solo notas, no evidencia ni nota de examen | `tests/identity-progress.test.mjs` como reglas, no integración de import por sí sola | Caso HTTP real contra DB efímera comprueba no concesión |
| C05 · Práctica | 24 semanas / formatos históricos sintéticos | 111: mismo booleano y porcentaje antes/después, incluso legacy | `tests/practice-completion.test.mjs`; `tests/progress-percentage.test.mjs` | Casos adversos, ausencia de notebook y fechas/límites; sin ejecutar código remitido |
| C06 · Especializadas | 1,4,5,6,8,9 | Estrategias y orden de checks preservados | `tests/foundation-practice.test.mjs`; `tests/password-practice.test.mjs`; `tests/bug-practice.test.mjs`; `tests/sprint-practice.test.mjs`; `tests/sql-practice.test.mjs`; `tests/programming-practice.test.mjs` | Excepciones/JSON inválido devuelven false; semana 1 mantiene su excepción de flujo |
| C07 · UI | /practice/1…24 y restauración | Mismo componente/mode/initial/children y textos; no borrado de estado | `apps/web/tests/e2e/topic-laboratories.spec.ts`; `apps/web/tests/e2e/practice-layout.spec.ts` | Registry 24/24 y comportamiento de 7/9 multiherramienta, fallback y estado al volver a renderizar |
| C08 · Seguridad de cuenta | Login/MFA/recovery | No modificar código ni secretos de identidad por estas Specs | `tests/account-security.test.mjs`; `tests/mfa-qr.test.mjs` | Smoke de sesión; pruebas de identidad si dependencias reales se afectan; ampliar alcance vuelve a G2/G3 |
| C09 · Arquitectura | Imports y paquetes | Sin nuevas dependencias de frameworks en dominio ni ciclos | `tests/architecture.test.mjs`; `tests/drizzle-single-boundary.test.mjs` | Inspección de manifests/diff y tests relevantes aprobados |
| C10 · No afectados | Quizzes, contenido, IA, CTFL | No cambio de estructura, calificación, cuota ni cifrado | `tests/content.test.mjs`; `tests/ctfl.test.mjs`; `tests/qa-assistant.test.mjs` | Smoke selectivo tras build; no petición comercial o dato productivo |

Las pruebas indicadas no garantizan cobertura completa: security-comprehensive puede saltarse; qa-history usa mocks; root tests no siempre son integración. En G5 debe anotarse qué ocurrió realmente.

### Barreras transversales G4–G7
- Antes del cambio: SHA, diff y corpus de caracterización; respaldo/rollback cuando cambie la aceptación de datos.
- Durante: una SPEC/PR, sin secretos ni migraciones accidentales; no registrar source/output/campos de estudiantes.
- Calidad: resultado de cada suite y caso crítico; fallo o skip crítico sin aceptación bloquea liberación.
- Liberación: aprobación independiente, destino/commit conocidos y smoke; monitoreo sin umbrales inventados.
- Reversión: artefacto compatible y verificado; no force-push ni eliminación de datos. En 110 una reversión antigua puede ser insegura aun sin DDL.

## 03. Restricciones
Nada de esta matriz fue ejecutado. “Residual B/M” es objetivo/estimación condicionado a pruebas futuras, no riesgo reducido ya. No se inspeccionaron métricas, usuarios o configuraciones productivas.

## 04. No-Objetivos
No pentest, prueba de carga, auditoría legal ni plan genérico de rollback para todas las capacidades. No usar una suite con mocks como evidencia de integridad real de base de datos.

