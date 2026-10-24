# QAPath Academy 6.1 — Identidad, verificación y MFA

> Monorepo Next.js + NestJS + PostgreSQL con Clean Architecture, Hexagonal y DDD.

## Novedades de seguridad

- Verificación de correo con enlace de un solo uso y vencimiento de 24 h.
- ADMIN con MFA TOTP obligatorio; STUDENT puede habilitarlo desde `/account`.
- Cambio obligatorio de contraseñas iniciales para cuentas creadas por administradores y bootstrap.
- Desafíos temporales con hash y límite de intentos; nunca crean una sesión completa antes de cumplir los requisitos.
- Códigos de recuperación de un solo uso; secretos MFA cifrados con AES-256-GCM.
- Historial de auditoría de eventos de seguridad en PostgreSQL.

**Correo con Firebase (v6.1):** [docs/FIREBASE_EMAIL_V61.md](docs/FIREBASE_EMAIL_V61.md) explica cuenta de servicio, Cloud Function propia, configuración SMTP, IAM y verificación de entrega.

**Lee [docs/SEGURIDAD_V6.md](docs/SEGURIDAD_V6.md) para instrucciones completas de actualización, configuración del correo, modelo de seguridad, consultas y pruebas.**

## Actualización rápida desde QAPath Academy 5.0 (Windows PowerShell)

1. Realiza copia de seguridad de PostgreSQL y de tus archivos `.env`.
2. Aplica el parche v5 → v6 conservando `.env` y las tablas actuales.
3. Agrega a `apps/api/.env` las variables `APP_URL`, `EMAIL_TRANSPORT` o `RESEND_API_KEY` + `EMAIL_FROM` y `MFA_ENCRYPTION_KEY`.
4. Genera clave con `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`; guárdala de manera segura y no la cambies sin procedimiento de rotación.
5. Ejecuta:

```powershell
pnpm.cmd install
pnpm.cmd db:migrate
pnpm.cmd check
pnpm.cmd dev
```

La migración `004_account_security.sql` **no borra registros ni calificaciones**, pero obliga a que los usuarios preexistentes verifiquen la propiedad de su correo antes de autenticarse. También fuerza cambio de clave a ADMIN y a estudiantes creados desde el panel anterior.

En desarrollo, `EMAIL_TRANSPORT=console` imprime en la terminal los enlaces de verificación **únicamente para pruebas locales**. Para enviar correos reales configura Resend o el adaptador Firebase + Cloud Function + SMTP; el proyecto falla cerrado en producción si falta configuración.

## Acceso local

- Web: `http://localhost:3000`
- API Health: `http://localhost:4000/api/v1/health`
- Registro: `http://localhost:3000/register`
- Verificación: `http://localhost:3000/verify-email`
- MFA/contraseña inicial: `http://localhost:3000/auth/continue`
- Panel admin: `http://localhost:3000/admin`

## Calidades

`pnpm.cmd check` ejecuta las pruebas, TypeScript, lint y build. `pnpm.cmd test:e2e` ejecuta Playwright con ambos servicios y PostgreSQL. Las pruebas de correo requieren `EMAIL_TRANSPORT=test-inbox` y `TEST_INBOX_DIR` compartido: consulta el documento de seguridad.

**Validación local del paquete en este entorno:** compilación del contexto `libs/identity`, 20 pruebas con Node aprobadas y revisión sintáctica de 97 archivos TypeScript/TSX. La compilación completa, migración real y E2E requieren ejecutarse en Windows con dependencias pnpm y PostgreSQL operativos; no están verificadas aquí.

**No publicar como producción aún:** agregar controles distribuidos de rate limiting, políticas de recuperación de MFA y correo, pruebas de integración reales, monitoreo y revisión de seguridad. TOTP no proporciona resistencia al phishing.

---

# QAPath Academy 4.0 — Identity, Authorization y PostgreSQL

Plataforma educativa QA Manual → Playwright/TypeScript con **Clean Architecture + Arquitectura Hexagonal + DDD**. Esta iteración **implementa** el módulo Identity, sesiones, RBAC y progreso persistente por estudiante.

## Funcionalidades incluidas
- 8 módulos, 24 semanas, 72 secciones de estudio, clase de Scrum, cuestionarios, laboratorios y proyecto final.
- Registro público **solo `STUDENT`**, inicio/cierre de sesión y `/auth/me`.
- Hash de contraseñas con `scrypt`, sesiones opacas de 256 bits guardadas como SHA-256 en PostgreSQL, con expiración y revocación.
- Cookie `HttpOnly; SameSite=Lax` y `Secure` para producción HTTPS; protección de origen en operaciones de escritura.
- RBAC real vía Guards de NestJS: endpoints públicos, autenticados y administración (`ADMIN`).
- Progreso por **identidad de la sesión**, sin permitir seleccionar el `userId` en las solicitudes. Transacciones `SELECT FOR UPDATE` para evitar pérdida de actualizaciones.
- Calificaciones de estudiantes **calculadas por el backend**, no aceptadas como porcentaje arbitrario en el API de progreso.
- Modo invitado con progreso local; al entrar, se usa la cuenta. Importación manual y voluntaria de los avances locales a PostgreSQL.
- PostgreSQL + Drizzle mediante adaptadores de infraestructura, SQL versionado y herramienta de migraciones.

## Requisitos
- Node.js 22.12+ (en tu caso Node 24.13.0 sirve), **pnpm 10.18.2**, PostgreSQL 16+, Windows PowerShell o terminal Unix.
- Docker Desktop es opcional: puedes usar un PostgreSQL administrado.

## Configuración rápida en Windows (PowerShell)

Desde la carpeta raíz `qapath-academy`:

```powershell
# 1) Si pnpm.cmd no se reconoce, habilita los shims en tu directorio
$shimDir = "$env:LOCALAPPDATA\corepack-bin"
New-Item -ItemType Directory -Force $shimDir | Out-Null
corepack enable pnpm --install-directory $shimDir
$env:Path = "$shimDir;$env:Path"
pnpm.cmd --version

# 2) Levanta PostgreSQL local, SOLO si tienes Docker Desktop
# Si tu PostgreSQL es administrado, omite esta instrucción.
docker compose up -d postgres

# 3) Configura conexión local de desarrollo
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
# Edita apps/api/.env si PostgreSQL tiene otra URL; no subas este archivo a Git.

# 4) Instala, migra y arranca
pnpm.cmd install
pnpm.cmd db:migrate
pnpm.cmd dev
```

> Importante: `db:migrate` lee `apps/api/.env` si existe; también acepta `DATABASE_URL` desde la terminal. Las migraciones son **obligatorias antes de iniciar**. Si no configuras PostgreSQL, la API fallará de forma explícita, no usará una base simulada. En su inicialización NestJS comprueba conexión y presencia de las tablas migradas.

- Frontend: http://localhost:3000
- Salud API: http://localhost:4000/api/v1/health
- Registro: http://localhost:3000/register
- Ingreso: http://localhost:3000/login
- Cuenta: http://localhost:3000/account

## API

| Método | Ruta | Acceso |
|---|---|---|
| GET | `/api/v1/health`, `/modules`, `/lessons/:week`, `/scrum` | Público |
| POST | `/api/v1/quizzes/:moduleId/grade` | Público; solo evaluación anónima |
| POST | `/api/v1/auth/register` | Público; crea `STUDENT` |
| POST | `/api/v1/auth/login` | Público; cookie de sesión |
| GET | `/api/v1/auth/me` | Autenticado |
| POST | `/api/v1/auth/logout` | Autenticado; revoca sesión |
| GET | `/api/v1/me/progress` | Autenticado; solo propio |
| PATCH | `/api/v1/me/progress` | Autenticado; actualizaciones permitidas |
| POST | `/api/v1/me/progress/import` | Autenticado; fusiona respaldo propio |
| POST | `/api/v1/me/quizzes/:moduleId/grade` | Autenticado; califica y persiste desde API |
| GET | `/api/v1/admin/status` | Solo `ADMIN` |
| GET | `/api/v1/instructor/status` | `INSTRUCTOR` o `ADMIN` |

Todos los JSON exitosos siguen el envelope `{ "data": ... }`.

### Ejemplo de actualización de progreso

```json
{ "type": "toggle", "key": "weeks", "value": 1 }
```

Se envía a `PATCH /api/v1/me/progress`; **no** contiene `userId`, porque el backend lo resuelve desde la sesión. Para notas: `{"type":"note","week":1,"text":"Mi resumen"}`.

El progreso se almacena como un snapshot versionado en `student_progress`, con una fila por estudiante y revisión incremental. La importación fusiona listas y conserva el puntaje más alto; **las importaciones manuales son respaldos personales y no acreditan certificados**.

## Pruebas

```powershell
pnpm.cmd test      # dominio, arquitectura, autenticación con mocks, progreso y contenidos
pnpm.cmd typecheck
pnpm.cmd lint
pnpm.cmd build
pnpm.cmd test:e2e  # requiere DB configurada y navegadores instalados
```

En GitHub Actions se utiliza PostgreSQL 16 en el job E2E. Consulta [docs/IMPLEMENTACION_IDENTIDAD_POSTGRES.md](docs/IMPLEMENTACION_IDENTIDAD_POSTGRES.md) y [docs/VERCEL.md](docs/VERCEL.md).

## Despliegue y controles pendientes antes de admitir usuarios reales

**No desplegar públicamente con registro abierto todavía.** Aunque se implementaron el hash de contraseñas, sesiones, rol y persistencia, siguen pendientes correo verificado, recuperación segura de contraseña, protección antiautomatización distribuida (por IP y cuenta, en datastore compartido), auditoría centralizada, rotación de sesiones, políticas de privacidad y verificación del HTTPS/dominio definitivo. En Vercel configurar PostgreSQL administrado con pooler y el origen web HTTPS. La API no utiliza memoria local para mantener sesiones.

**Estado validado en este entorno:** reglas de dominio compiladas y pruebas aisladas ejecutadas. No se ha realizado una ejecución real contra una instancia PostgreSQL ni un build integral de Next/Nest aquí; probar en tu entorno antes del deploy.

---

## QAPath Academy 5.0 — Panel de administración, reportes y auditoría

Esta versión mantiene **Clean + Hexagonal + DDD** y añade:

- Módulo independiente `libs/administration`: reglas, puerto y casos de uso.
- Adaptador `PostgresAdministrationAdapter` en NestJS.
- `/admin`: alta y administración de estudiantes, búsqueda, avance por usuario,
  historial de eventos y auditoría.
- Migración **aditiva** `003_administration_audit.sql` con las tablas
  `admin_audit_events`, `student_progress_events` y la vista
  `vw_student_progress_summary`.
- Creación del primer administrador desde terminal sin credenciales por defecto.
- Controles de acceso: solo `ADMIN` puede administrar usuarios; solo `STUDENT`
  registra avances y calificaciones.

**Si vienes de la v4:** respalda PostgreSQL y conserva tus archivos `.env`.
Después, en la raíz:

```powershell
pnpm.cmd install
pnpm.cmd db:migrate
pnpm.cmd db:create-admin
pnpm.cmd dev
```

Entra en **http://localhost:3000/login** con el administrador que acabas de crear.
El sistema abrirá **http://localhost:3000/admin** automáticamente.
La contraseña inicial se solicita en consola y no se incluye en el ZIP.

Documentación detallada: `docs/ADMIN_POSTGRES.md` y `docs/sql/consultas_admin.sql`.

Para probar: `pnpm.cmd check`, `pnpm.cmd test:e2e`. La prueba E2E
administrativa requiere definir `E2E_ADMIN_EMAIL` y `E2E_ADMIN_PASSWORD`
como variables de entorno temporales; en su ausencia queda omitida.

> No debe activarse en producción sin completar los controles pendientes de
> MFA, verificación de correo, recuperación/rotación de contraseñas,
> protección contra abuso y validaciones E2E contra PostgreSQL real.

## Integración de correo con Firebase (v6.1)

Configura `EMAIL_TRANSPORT=firebase` y credenciales del Firebase Admin SDK **solo en la API**, instala y despliega la Cloud Function propia incluida en `firebase/functions` y define los secretos SMTP. **Una cuenta de servicio no es un remitente SMTP**. Consulta [docs/FIREBASE_EMAIL_V61.md](docs/FIREBASE_EMAIL_V61.md) para instrucciones en Windows. Esta opción conserva por completo PostgreSQL para identidad, sesiones y MFA, y no agrega migraciones SQL.

Pruebas unitarias de envío sin credenciales reales: `node --test tests/firebase-email.test.mjs firebase/functions/test/*.test.cjs`. La entrega efectiva necesita desplegar Firebase Functions y configurar el SMTP.
## Firebase Authentication sin SMTP

La integración opcional `AUTH_PROVIDER=firebase` usa Firebase Authentication para contraseñas y verificación de correo, conserva PostgreSQL para roles/progreso y mantiene el MFA TOTP de NestJS. Requiere aplicar la migración 005 antes de desplegar. Consulta [configuración y migración](docs/FIREBASE_AUTH.md). Prueba aislada con emulador: `pnpm.cmd test:e2e:firebase`.
