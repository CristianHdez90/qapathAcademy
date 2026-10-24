# Firebase Authentication + NestJS + PostgreSQL (Spark)

## Responsabilidades

Con `AUTH_PROVIDER=firebase`, Firebase Authentication administra contraseñas y envía sus propios correos de verificación. NestJS usa la API REST oficial para registro e inicio de sesión y valida los ID tokens mediante Admin SDK con comprobación de revocación. Los tokens Firebase y refresh tokens no se entregan al navegador ni se guardan en PostgreSQL.

PostgreSQL mantiene el UUID original, roles, progreso, auditoría, sesiones HttpOnly y el MFA TOTP de QAPath. La cookie de sesión completa solo se emite tras verificar correo, cambiar la contraseña temporal si corresponde y superar MFA. Un token Firebase por sí solo no otorga acceso a los endpoints privados de QAPath. Los roles se leen de PostgreSQL, nunca del cliente.

Este flujo no usa Cloud Functions, SMTP, la colección Firestore `mail` ni el MFA nativo de Firebase. Funciona sujeto a las cuotas de Authentication del plan Spark; no se activa Blaze ni Identity Platform. No es un servicio de envío ilimitado.

## Preparar Firebase Console

1. En el proyecto `qapath-academy`, abre **Authentication → Sign-in method / Método de acceso** y habilita **Correo electrónico/contraseña**. No es necesario habilitar enlaces de acceso sin contraseña ni SMS.
2. En **Authentication → Settings → Authorized domains**, agrega el dominio real del frontend (sin `https://`). Para desarrollo agrega `localhost` y `127.0.0.1` si los utilizas.
3. En **Project settings → General**, copia la **Web API Key**. Si todavía no existe una aplicación web, registra una para obtener su configuración. Esta clave no es la clave privada de la cuenta de servicio.
4. La cuenta de servicio de NestJS debe pertenecer al mismo proyecto y tener permisos de Firebase Authentication para consultar, crear y actualizar usuarios y revocar tokens. Si antes solo tenía permisos de Firestore, esos permisos no bastan; asigna un rol adecuado de Firebase Authentication, por ejemplo `Firebase Authentication Admin`, a esa identidad técnica.
5. Puedes conservar el manejador predeterminado del enlace de Firebase. Al regresar e iniciar sesión, NestJS comprueba el estado verificado y lo sincroniza con PostgreSQL. Opcionalmente configura en **Authentication → Templates → Email address verification** una URL de acción personalizada `https://DOMINIO-WEB/verify-email`: esa página procesa `mode=verifyEmail&oobCode=...`. No configures el dominio de la API como destino de la interfaz.

## Variables del proyecto Vercel API (`apps/api`)

```dotenv
AUTH_PROVIDER=firebase
NODE_ENV=production
FIREBASE_PROJECT_ID=qapath-academy
FIREBASE_WEB_API_KEY=API_KEY_WEB_DEL_MISMO_PROYECTO
FIREBASE_SERVICE_ACCOUNT_EMAIL=CLIENT_EMAIL_DE_LA_CUENTA_DE_SERVICIO
FIREBASE_PRIVATE_KEY=CLAVE_PRIVADA_DE_LA_MISMA_CUENTA
DATABASE_URL=CONEXION_NEON_CON_POOLING
APP_URL=https://DOMINIO-WEB
WEB_ORIGIN=https://DOMINIO-WEB
MFA_ENCRYPTION_KEY=CONSERVAR_LA_CLAVE_EXISTENTE_DE_64_HEXADECIMALES
```

Conserva correctamente los saltos de línea de `FIREBASE_PRIVATE_KEY` (se aceptan `\n` literales). Usa credenciales del mismo proyecto. No configures `FIREBASE_AUTH_EMULATOR_HOST` en Vercel; la aplicación lo rechaza en producción.

`EMAIL_TRANSPORT` y las credenciales SMTP/Resend no se consultan en este modo. Las variables `FIREBASE_MAIL_COLLECTION`, `QAPATH_SMTP_URL` y `QAPATH_SMTP_FROM` tampoco se necesitan. El frontend sigue utilizando únicamente `API_INTERNAL_URL` y `API_PROXY_TARGET` apuntando al backend; no necesita un SDK Firebase ni secretos Firebase.

Las restricciones de la API key deben permitir la API Authentication desde el backend; una restricción de HTTP referrer exclusiva para navegador no corresponde a estas llamadas de servidor. Nunca cambies a una clave de otro proyecto para resolver un error.

## Migración y orden del despliegue

1. Haz copia de seguridad de PostgreSQL y aplica `pnpm.cmd db:migrate` contra Neon con su conexión directa, asignada temporalmente a `DATABASE_URL`. Debe aplicar `005_firebase_identity.sql` además de reconocer 001–004. La nueva columna nullable y el índice no eliminan cuentas ni progreso.
2. Configura las variables anteriores en Production de la API y publica este código. Luego publica la web.
3. Las cuentas existentes se vinculan la primera vez que inician sesión o solicitan reenvío con su contraseña anterior. No se vinculan solo por coincidencia de correo. Conservan UUID, rol, progreso y configuración MFA. La contraseña local se reemplaza por un marcador después de vincularlas.
4. Una cuenta migrada recibe una verificación nueva de Firebase. Si ya existe una identidad Firebase con ese correo y otra contraseña, la vinculación se rechaza: resuelve el conflicto de forma administrativa, sin borrar usuarios ni elevar roles automáticamente.
5. Un estudiante nuevo se registra, recibe el correo de Firebase, verifica y luego inicia sesión. El reenvío requiere correo y contraseña; conocer solo el correo no permite solicitar operaciones autenticadas de Firebase. Hay una espera mínima entre envíos y se aplican las cuotas del proveedor.
6. ADMIN sigue exigiendo cambio inicial y TOTP; estudiantes mantienen TOTP voluntario y códigos de recuperación de un solo uso. Conserva la clave de cifrado MFA existente.
7. El panel ADMIN crea estudiantes con contraseña temporal; se vinculan con Firebase al solicitar el primer correo. Si cambia el correo de un estudiante ya vinculado, se revocan sesiones y se sincroniza Firebase. El estudiante inicia sesión con el correo nuevo para recibir una nueva verificación. Si Firebase falla durante la sincronización, reintenta guardar ese correo; el acceso queda denegado mientras hay discrepancias.

No vuelvas a `AUTH_PROVIDER=local` para recuperar acceso de cuentas ya vinculadas: sus contraseñas dejan de estar en PostgreSQL. Los administradores iniciales creados con `db:create-admin` también se vinculan con su contraseña temporal al iniciar sesión.

## Verificación

`pnpm.cmd check` prueba reglas de identidad, vinculación segura, correo obligatorio, MFA, revocación y arquitectura, además de TypeScript, ESLint y build.

`pnpm.cmd test:e2e:firebase` requiere PostgreSQL **local**, permisos para crear una base temporal, navegadores Playwright instalados y puertos 9099/3100/4100 libres. Crea una base desechable, aplica 001–005, compila API/Web y ejecuta Firebase Auth Emulator con un proyecto `demo-`. Verifica el correo simulado, las sesiones, el progreso y MFA. El runner rechaza conexiones remotas y elimina su propia base al terminar. No envía correos reales ni utiliza Blaze. No comparte la base del entorno de desarrollo.

Para instalar navegadores si faltan: `pnpm.cmd --filter @qapath/web exec playwright install chromium webkit`.

La entrega real y la carpeta spam deben comprobarse después de configurar el proyecto Firebase real. Un test del emulador no demuestra entrega al buzón ni configura IAM, dominios o cuotas de producción.

## Fuentes

- [Firebase Authentication REST API](https://firebase.google.com/docs/reference/rest/auth)
- [Validar ID tokens](https://firebase.google.com/docs/auth/admin/verify-id-tokens)
- [Límites de Authentication](https://firebase.google.com/docs/auth/limits)
- [TOTP nativo de Firebase y requisitos Identity Platform](https://firebase.google.com/docs/auth/web/totp-mfa)
