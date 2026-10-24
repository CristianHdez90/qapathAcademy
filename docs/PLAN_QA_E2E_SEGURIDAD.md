# QAPath Academy 6.1 — Plan QA de identidad, RBAC, MFA y persistencia

## Alcance y criterios de salida

Basado en los controladores y contratos reales de QAPath Academy 6.1.

- Backend NestJS expone `/api/v1/auth/*`, `/api/v1/admin/*`, `/api/v1/me/progress`.
- `SessionGuard` valida sesiones en PostgreSQL; `RolesGuard` aplica RBAC sobre los endpoints.
- `PostgresProgressAdapter` aplica cambios y registra eventos en una transacción.
- MFA usa TOTP de 6 dígitos y códigos de recuperación de un solo uso.
- Firebase encola en `mail`; una Cloud Function SMTP es necesaria para enviar el correo.

**No ejecutar contra producción:** el conjunto automatizado crea usuarios y registros de auditoría. Usa una base de desarrollo respaldada. Los tests no borran usuarios por diseño (conserva trazabilidad).

## Matriz de escenarios

| ID | Riesgo | Escenario | Resultado esperado | Medio |
|----|--------|-----------|--------------------|-------|
| SEC-001 | Crítico | Sin sesión `GET /admin/status` | 401 | Playwright |
| SEC-002 | Crítico | STUDENT `GET /admin/students` | 403 | Playwright |
| SEC-003 | Crítico | STUDENT `POST /admin/students` | 403, no crea cuenta | Playwright |
| SEC-004 | Alto | STUDENT `PATCH /me/progress` con `userId` ajeno | 400 por DTO estricto | Playwright |
| SEC-005 | Crítico | ADMIN con correo y contraseña sin MFA | No recibe sesión completa | Manual / tests de dominio existentes |
| SEC-006 | Alto | ADMIN con MFA `GET /admin/summary` | 200 | Playwright opcional |
| SEC-007 | Alto | ADMIN `GET /me/progress` | 403 | Playwright opcional |
| SEC-008 | Crítico | Estudiante marca semana, cierra sesión e inicia de nuevo | Recupera semana/lectura | Playwright |
| SEC-009 | Crítico | Estudiante B consulta progreso | No ve avance de A | Playwright |
| SEC-010 | Alto | Uso del primer código de recuperación | Inicia sesión una vez | Playwright |
| SEC-011 | Crítico | Reutilización del mismo código | 401 y no crea sesión | Playwright |
| SEC-012 | Alto | Otro código de recuperación no usado | Permite acceso | Playwright |
| SEC-013 | Alto | Historial de progreso y sesiones | Revisiones y eventos consultables | SQL |
| SEC-014 | Alto | Solicitud email llega a Firestore | Documento nuevo en `mail` | Firebase manual |
| SEC-015 | Alto | Envío real SMTP | `delivery.state=SUCCESS` + mensaje recibido | Firebase manual |
| SEC-016 | Crítico | Regeneración de códigos expuestos | Anteriores se invalidan todos | **No disponible en v6.1; funcionalidad pendiente** |
| SEC-017 | Alto | Revocación de sesión de estudiante desactivado | 401 luego de desactivar | E2E previo `admin.spec.ts` |

## Ejecución en Windows PowerShell

1. Configura una **base PostgreSQL de pruebas**. Verifica `DATABASE_URL` y respalda los datos antes de iniciar.
2. Detén instancias existentes de `pnpm dev` con `Ctrl+C` (evita que Next reuse otro backend con Firebase).
3. Abre PowerShell en la raíz `qapath-academy` y configura solo en esa terminal:

```powershell
$env:NODE_ENV = 'development'
$env:EMAIL_TRANSPORT = 'test-inbox'
$env:TEST_INBOX_DIR = Join-Path $env:TEMP 'qapath-e2e-inbox'
$env:E2E_ALLOW_DB_WRITES = 'true'
New-Item -ItemType Directory -Force $env:TEST_INBOX_DIR | Out-Null
pnpm.cmd run build:libs
pnpm.cmd --filter @qapath/web exec playwright install chromium
pnpm.cmd --filter @qapath/web exec playwright test tests/e2e/security-comprehensive.spec.ts --project=chromium
```

El `webServer` de Playwright iniciará web y API si el puerto 3000 está libre. **No uses `EMAIL_TRANSPORT=firebase` para estas pruebas automatizadas**: el backend debe escribir tokens temporales en `TEST_INBOX_DIR`, sin salir a un correo real.

Para ejecutar el test ADMIN positivo, proporciona tres variables *solo en la terminal de pruebas* de una cuenta administrativa exclusiva de QA:

- `E2E_ADMIN_EMAIL`
- `E2E_ADMIN_PASSWORD`
- `E2E_ADMIN_TOTP_SECRET` (secreto de prueba, NO usar una cuenta administrativa personal)

Las variables son opcionales; sin ellas el caso positivo ADMIN se omite. Los casos negativos funcionan con estudiantes efímeros. Se recomienda limpiar esas variables tras terminar: `Remove-Item Env:E2E_ADMIN_TOTP_SECRET -ErrorAction SilentlyContinue` (y las otras dos).

> Los tests no imprimen códigos ni claves, pero una traza Playwright puede contener datos sensibles de respuesta. Conserva los reportes y trazas solo en entornos controlados; no publiques las carpetas de resultados ni `TEST_INBOX_DIR`.

## Consultas SQL

Ejecuta `docs/sql/qa_security_evidence.sql` en pgAdmin Query Tool. Son SELECT de solo lectura, filtran las cuentas generadas con prefijo `qa-e2e-` y no consultan hashes ni secretos.

**Criterio de aceptación de persistencia:** tras cierre e inicio de sesión, el mismo estudiante presenta semanas y lecturas guardadas; la revisión aumenta y existe evento en `student_progress_events`.

**Criterio de aceptación de MFA:** al consumir uno de ocho códigos, la cuenta tiene un código menos disponible y uno más utilizado. Un código usado vuelve 401 al reutilizarlo; un código distinto sigue funcionando.

## Verificación manual de Firebase para correo real

Después de que los tests locales hayan finalizado:

1. Cierra los procesos web y API de prueba.
2. Elimina los overrides de shell: `Remove-Item Env:EMAIL_TRANSPORT,Env:TEST_INBOX_DIR,Env:E2E_ALLOW_DB_WRITES -ErrorAction SilentlyContinue`.
3. Comprueba que `apps/api/.env` tiene `EMAIL_TRANSPORT=firebase` y que Firestore `(default)` del proyecto `qapath-academy` está listo.
4. Asegúrate de haber desplegado **una única función** que escuche `mail/{mailId}` y tenga configurados `QAPATH_SMTP_URL`, `QAPATH_SMTP_FROM` y plan compatible.
5. Inicia `pnpm.cmd dev` y solicita verificación para una cuenta de correo de prueba que controles.
6. Firestore: debe crearse un documento en `mail`. Su presencia confirma **encolado**, no entrega.
7. Inspecciona `delivery.state`: `PROCESSING`, `SUCCESS` o `ERROR`; para `SUCCESS` confirma llegada al buzón y que el enlace verifica la cuenta.
8. Comprueba eventos `EMAIL_VERIFICATION_REQUESTED` y `EMAIL_VERIFIED` en PostgreSQL. No copies a capturas la URL de verificación (contiene el token).

Si hay documento sin `delivery.state`, revisa función, región, proyecto y activador. Si aparece `ERROR`, revisa logs de Cloud Functions y SMTP. Si hay `SUCCESS` sin correo, revisa bandeja de spam, filtros y proveedor; SMTP accepted no equivale a inbox delivered.

## Hallazgo de seguridad: secretos y códigos mostrados previamente

Se expusieron una clave MFA y códigos de recuperación en capturas de pantalla y una clave de cifrado en texto de chat. Trátalos como comprometidos.

**La v6.1 revisada no implementa un endpoint seguro para regenerar códigos de recuperación.** No se debe interpretar haber usado un código como haber invalidado los otros siete. La corrección requerida es un caso de uso `RotateRecoveryCodes`, autorización por sesión y nueva comprobación de contraseña+TOTP, actualización transaccional que invalide todos los códigos anteriores, auditoría sin secretos y tests de no reutilización. Hasta entonces, no uses códigos expuestos para proteger cuentas reales; utiliza una cuenta nueva de QA para las pruebas. No cambies `MFA_ENCRYPTION_KEY` de forma improvisada: los secretos TOTP cifrados existentes dejarían de funcionar. Requiere un procedimiento de rotación controlado.

## Evidencia y reporte

Registra por cada escenario: ID, precondiciones, datos de prueba anonimizados, solicitud/resultado, estado HTTP, hora, evidencia, resultado esperado y obtenido, decisión de aprobación, defecto si existe. Nunca incluyas secretos ni cookies en evidencias.

**Límites:** estos scripts no se han ejecutado contra tu PostgreSQL ni tus servicios locales desde este entorno. La prueba positiva de ADMIN y la entrega SMTP real requieren tus credenciales y configuración controlada.
