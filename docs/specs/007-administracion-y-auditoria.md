# SPEC-007 — Administración y auditoría

## 01. Intención
Permitir a ADMIN consultar y gestionar estudiantes, revisar avance y conservar eventos de operaciones sensibles.

## 02. Comportamiento
### API administrativa
Bajo `/api/v1/admin`: GET status, summary, students, students/:id, students/:id/events, audit; POST students; PATCH students/:id. IDs individuales se validan con ParseUUIDPipe; consultas/cuerpos mediante contratos estrictos.

- Listado de STUDENT con búsqueda de hasta 120 caracteres, paginación page>=1/limit<=50; búsqueda ilike escapando comodines. Orden por creación descendente y correo.
- Detalle incluye estado/avance. Historial de progreso: últimas 50 entradas. Auditoría paginada, límite por defecto 30.
- Resumen calcula métricas de estudiantes y progreso; el adaptador obtiene estados para agregarlos en memoria.
- Crear estudiante: contraseña inicial de 12–128, mustChangePassword=true, sin verificar, evento STUDENT_CREATED y posterior solicitud de verificación.
- Modificar: solo email/isActive, sobre STUDENT y sin autoedición. Bloquea fila; cambio de correo reinicia verificación y consume tokens/desafíos; baja o cambio de correo revoca sesiones.
- Duplicidad de correo se traduce a conflicto; inexistente a no encontrado.
- En modo Firebase, después de la mutación SQL el controlador llama updateExternalEmail. No hay una transacción distribuida con el proveedor.

### Auditoría
admin_audit_events recoge actor/destino/acción/details/fecha para administración, login/logout, seguridad, reservas IA y cambios de configuración IA. student_progress_events conserva usuario, revisión, acción y metadatos sin texto de evidencia/notas. No se localizaron endpoints de edición de eventos; esto no prueba inmutabilidad frente a un operador de base de datos.

### Criterios de aceptación derivados
- A-001: STUDENT e INSTRUCTOR no consultan administración; ADMIN sí tras autenticar.
- A-002: editar rol mediante PATCH se rechaza; cambiar otro tipo de usuario se impide en dominio.
- A-003: una mutación de progreso y su evento se confirman juntos.
- A-004: no se incluyen contraseñas, secretos MFA ni claves IA en los detalles de eventos revisados.
- A-005: si falla sincronización externa tras cambiar correo, SQL puede haber quedado actualizado; registrar fallo y discrepancia, no suponer rollback global.

## 03. Restricciones
Sin eliminación de estudiantes observada en AdminController. Las acciones públicas de registro y las administrativas son flujos diferentes. Auditoría contiene metadatos de cuenta: no debe confundirse “sin secretos” con “sin datos personales”. No se consultaron registros reales.

## 04. No-Objetivos
No crear reconciliación entre proveedores, eliminación/anonimización de cuentas, exportación administrativa ni controles adicionales de retención.

## Evidencia y trazabilidad
| Afirmación | Evidencia (ruta + símbolo) | Test/observación | Estado |
|---|---|---|---|
| Endpoints y orden de sincronización | `apps/api/src/presentation/controllers/admin.controller.ts` — AdminController | `apps/web/tests/e2e/admin.spec.ts` existente | CONFIRMADO |
| Casos de uso | `libs/administration/src/application/manage-students.ts` | `tests/administration.test.mjs` | CONFIRMADO |
| Filtros, transacciones y resumen | `apps/api/src/infrastructure/adapters/postgres-administration.adapter.ts` — PostgresAdministrationAdapter | Lectura, sin base conectada | CONFIRMADO |
| Contratos de administración | `packages/contracts/src/admin.ts` | Validación Zod estática | CONFIRMADO |
| Tablas de eventos | `packages/database/src/schema.ts` — adminAuditEvents,studentProgressEvents | `packages/database/sql/003_administration_audit.sql` | CONFIRMADO |
| Riesgo de divergencia externa | AdminController + `libs/identity/src/application/account-security.ts` — updateExternalEmail | Orden confirmado; fallo no reproducido | INFERIDO |
| Retención e inmutabilidad operativa | Ninguna política operativa verificada | Pendiente de evidencia | NO VERIFICADO |

## Preguntas abiertas y deuda técnica
DT-05: coherencia email PostgreSQL/Firebase. DT-09: retención y acceso operativo a auditoría. Escalabilidad del resumen en memoria: hipótesis a medir en un Spec posterior; no se inventan volúmenes ni tiempos.

