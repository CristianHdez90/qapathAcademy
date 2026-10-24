> Actualización v6.1: para usar Firebase consulta [FIREBASE_EMAIL_V61.md](FIREBASE_EMAIL_V61.md). `FIREBASE_SERVICE_ACCOUNT_EMAIL` no envía correos sin una Cloud Function y un servicio SMTP.

# QAPath Academy 6.0 — Verificación de correo, cambio inicial y MFA

## Vista de arquitectura

- **Domain / Application (`libs/identity`)**: `SecureAuthenticationService` y puertos `AccountSecurityPort`, `TotpPort`, `VerificationMailer`. Sin dependencias de Nest, Drizzle ni Node.
- **Infrastructure (`apps/api`)**: adaptador PostgreSQL, adaptador criptográfico AES-256-GCM/TOTP, adaptador correo Resend o modo local explícito.
- **Presentation**: controlador HTTP NestJS y páginas Next.js de registro, `/verify-email`, `/auth/continue` y configuración MFA en `/account`.
- **Contrato REST**: `packages/contracts/src/auth.ts` con validación Zod.

## Flujo 1: correo verificado

1. `POST /api/v1/auth/register`: crea usuario STUDENT sin sesión y con `email_verified_at=NULL`.
2. Se genera un token aleatorio: **se guarda solamente SHA-256**, con vencimiento de **24 h**. Se entrega mediante correo.
3. El enlace termina en `/verify-email#token=...`: el fragmento no va en las solicitudes GET del servidor. El frontend borra el fragmento del historial y envía `POST /auth/verify-email`.
4. El token se consume de manera atómica y se audita `EMAIL_VERIFIED`.
5. `POST /auth/resend-verification`: mensaje genérico, con enfriamiento mínimo de 60 s por usuario.

**Migración de v5:** todas las cuentas preexistentes comienzan con correo no verificado, pues la versión anterior no podía constatar su propiedad. Ninguna fila se elimina. En desarrollo, los enlaces aparecen solo si `EMAIL_TRANSPORT=console`; en producción se configura Resend.

## Flujo 2: cambio de contraseña inicial

- Creación administrativa o bootstrap ADMIN: `must_change_password=true`.
- La migración 004 marca también a los ADMIN existentes y a estudiantes previamente creados desde el panel de administración.
- Tras validar la contraseña inicial, no se crea sesión completa. Se emite una cookie `HttpOnly; SameSite=Strict` con un desafío efímero almacenado por hash en PostgreSQL.
- `POST /auth/change-initial-password` cambia la contraseña después de validar el desafío, rechaza la contraseña anterior, revoca sesiones, registra `INITIAL_PASSWORD_CHANGED` y continúa hacia MFA si aplica.
- Se utiliza scrypt y sales aleatorias; las contraseñas y los tokens no se almacenan en logs de auditoría.

## Flujo 3: MFA TOTP

- **ADMIN: obligatorio** antes de obtener sesión; **STUDENT: optativo** en `/account` con nueva comprobación de contraseña.
- 20 bytes aleatorios en Base32; TOTP de 6 dígitos, 30 s, ventana de reloj ±1 intervalo. Compatible con autenticadores estándar.
- El secreto se cifra **AES-256-GCM** en PostgreSQL; clave de 32 bytes en `MFA_ENCRYPTION_KEY`, no incluida en el repositorio.
- La inscripción solo se activa al introducir un TOTP correcto; durante el alta se muestra la clave manual para copiarla en la aplicación autenticadora.
- Evita reutilizar el mismo intervalo TOTP por actualización condicional atómica de `last_used_step`.
- Cada desafío de inicio MFA vence a los **10 minutos** y permite como máximo **5 intentos**.
- Se generan **8 códigos de recuperación** de 80 bits, guardados únicamente mediante hash SHA-256; cada código es de un solo uso y se muestra una única vez.
- Al habilitar MFA se revocan sesiones anteriores y se emite una nueva sesión tras verificación.

## Variables de entorno (apps/api/.env)

```env
DATABASE_URL=postgresql://...
NODE_ENV=development
WEB_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
APP_URL=http://localhost:3000
EMAIL_TRANSPORT=console
MFA_ENCRYPTION_KEY=<clave-hex-de-64-caracteres>
```

Generar la clave con PowerShell:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Para producción, configurar `NODE_ENV=production`, `APP_URL=https://tu-dominio`, transporte de correo válido (Resend con `RESEND_API_KEY` + `EMAIL_FROM`, o Firebase según `FIREBASE_EMAIL_V61.md`), `MFA_ENCRYPTION_KEY` persistente, `DATABASE_URL`, y `WEB_ORIGIN`. No usar `EMAIL_TRANSPORT=console` ni `test-inbox` en producción. Guardar las claves de cifrado de forma segura: si se pierde `MFA_ENCRYPTION_KEY` los secretos MFA existentes dejan de poder descifrarse. Requiere un procedimiento seguro de rotación y recuperación.

Para E2E local, establecer `EMAIL_TRANSPORT=test-inbox` y `TEST_INBOX_DIR` con la misma ruta en el servidor y Playwright. No publicar ni versionar esa carpeta, pues contiene tokens de verificación en texto claro para pruebas.

## Aplicar sobre v5

1. Detener procesos `pnpm dev`, respaldar la base PostgreSQL y los archivos `.env`.
2. Descomprimir el parche v5→v6 sobre la raíz del proyecto. No incluye `.env` ni datos de PostgreSQL.
3. Ajustar `apps/api/.env` con las variables de arriba.
4. Ejecutar `pnpm.cmd install`, `pnpm.cmd db:migrate`, `pnpm.cmd check`, `pnpm.cmd dev`.
5. Pedir verificación desde `/verify-email` para cada cuenta previa; ADMIN además debe cambiar contraseña y configurar TOTP. Para ADMIN nuevo: `pnpm.cmd db:create-admin`.
6. En panel `/admin` crear un estudiante: el sistema enviará verificación y exigirá cambiar su contraseña inicial. Nunca enviar la contraseña temporal por correo sin cifrar.

## Pruebas y criterios de aceptación

- Registro no entrega sesión hasta verificar correo.
- Token de verificación caducado o reutilizado se rechaza; un cambio de correo invalida los enlaces antiguos.
- ADMIN no obtiene sesión por solo correo/contraseña: requiere correo verificado, cambio inicial y MFA.
- El estudiante con contraseña inicial no puede usar progreso ni endpoints protegidos hasta cambiarla.
- MFA incorrecto, repetido o desafío consumido son rechazados; código de recuperación de un solo uso.
- `ADMIN` mantiene RBAC, solo administra STUDENT y las sesiones revocadas dejan de tener acceso.
- Consulta tablas `users`, `email_verification_tokens`, `auth_challenges`, `user_mfa_credentials`, `mfa_recovery_codes` y eventos de auditoría; revisar `docs/sql/consultas_seguridad.sql`.

## Requisitos adicionales antes de Internet público

**No despliegues esta entrega como sistema de producción sin pruebas adicionales.** Falta validar el conjunto completo de Next.js/NestJS y la migración contra PostgreSQL real, así como pruebas E2E en navegador. Para producción se requiere un límite de peticiones distribuido (IP y cuenta) en login, registro y MFA, SMTP/Resend operativo, SPF/DKIM/DMARC, política de recuperación de cuentas y MFA, monitoreo, rotación de secretos, backups y controles antifraude. TOTP no es resistente a phishing; para mayor aseguramiento considerar WebAuthn/passkeys.
