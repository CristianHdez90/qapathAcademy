# QAPath Academy 6.1 — Verificación de correo mediante Firebase

## Decisión arquitectónica

- **PostgreSQL** es la fuente de verdad para cuentas, contraseñas, sesiones, tokens de verificación, estado `email_verified_at` y auditoría. **No migrar cuentas a Firebase Authentication** para este flujo.
- `VerificationMailer` es el **puerto de salida** de Identity (DDD). `VerificationEmailAdapter` selecciona el proveedor con `EMAIL_TRANSPORT` (patrón Strategy); `FirebaseEmailAdapter` es el adaptador de infraestructura que publica mensajes en Firestore.
- Una **Cloud Function propia** observa la colección `mail` y realiza el envío mediante SMTP, con credenciales en Google Secret Manager.
- `FIREBASE_SERVICE_ACCOUNT_EMAIL` es `client_email` del JSON de la cuenta de servicio y **NO es la dirección remitente**. El remitente real (`QAPATH_SMTP_FROM`) pertenece al SMTP verificado.
- La escritura en Firestore significa «solicitud encolada», **no** «correo entregado». Para comprobar entrega consulta `mail/<documento>/delivery.state` (`SUCCESS` o `ERROR`).
- **No usamos Firebase Trigger Email Extension como dependencia obligatoria** porque el directorio oficial anuncia el cierre de Firebase Extensions el **31 de marzo de 2027**. La Cloud Function es propiedad del repositorio y mantiene la portabilidad del adaptador.

## Requisitos

1. Proyecto Firebase y base Cloud Firestore `(default)` creados en [Firebase Console](https://console.firebase.google.com/).
2. Plan **Blaze** y facturación habilitados para desplegar Cloud Functions. Controla gastos y habilita alertas de presupuesto.
3. Un proveedor SMTP con permisos reales para enviar desde un dominio verificado (por ejemplo SendGrid, Amazon SES, Mailgun o una cuenta corporativa con SMTP autorizado). **La cuenta de servicio de Firebase no puede enviar emails por sí sola**.
4. Credenciales de la cuenta de servicio que tengan acceso de escritura a la colección `mail` y no permisos innecesarios en otros recursos. Limita IAM al mínimo posible.
5. `firebase-tools` CLI para desplegar la función (instalación local o mediante npx).

## 1. Variables del backend (Windows PowerShell)

Edita `apps/api/.env` **sin borrar** las existentes (`DATABASE_URL`, `MFA_ENCRYPTION_KEY`, `APP_URL`, `WEB_ORIGIN`, etc.). Opción A: credenciales explícitas para ejecución local o Vercel:

```ini
EMAIL_TRANSPORT=firebase
FIREBASE_PROJECT_ID=mi-proyecto-firebase
FIREBASE_SERVICE_ACCOUNT_EMAIL=firebase-adminsdk-xxxx@mi-proyecto-firebase.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\n...\\n-----END PRIVATE KEY-----\\n"
FIREBASE_MAIL_COLLECTION=mail
```

`FIREBASE_PRIVATE_KEY` es **la clave privada del mismo JSON que contiene `client_email`**; el código transforma `\\n` en saltos de línea reales. No es una clave generada manualmente ni la `MFA_ENCRYPTION_KEY`.

**Opción B, recomendada para pruebas locales:** guarda el JSON de la cuenta de servicio **fuera del repositorio** y apunta a su ruta absoluta mediante `GOOGLE_APPLICATION_CREDENTIALS`; no copies la clave al `.env`:

```ini
EMAIL_TRANSPORT=firebase
FIREBASE_PROJECT_ID=mi-proyecto-firebase
FIREBASE_MAIL_COLLECTION=mail
GOOGLE_APPLICATION_CREDENTIALS=C:/credenciales-privadas/qapath-firebase-admin.json
```

Con la opción B, el correo de la cuenta de servicio está dentro del JSON (`client_email`). Para Vercel utiliza un secreto seguro para la credencial, sin subir el archivo JSON al repositorio.

**NUNCA** copies la cuenta de servicio al frontend `apps/web`, código publicado, repositorio, tickets o capturas. Si se filtra la clave, revócala/rota inmediatamente. Se admite `EMAIL_TRANSPORT=console` solo en desarrollo para comprobar la generación del enlace sin Firestore ni SMTP.

## 2. Configurar Firestore y la Cloud Function propia

En la raíz de `qapath-academy` instala dependencias:

```powershell
pnpm.cmd install
```

Para desplegar el componente Firebase, abre PowerShell en `qapath-academy/firebase` y ejecuta:

```powershell
cd .\firebase
npm install --prefix functions
npx --yes firebase-tools login
npx --yes firebase-tools functions:secrets:set QAPATH_SMTP_URL --project mi-proyecto-firebase
npx --yes firebase-tools functions:secrets:set QAPATH_SMTP_FROM --project mi-proyecto-firebase
npx --yes firebase-tools deploy --only functions:qapath-mail --project mi-proyecto-firebase
```

`QAPATH_SMTP_URL` es la URL de conexión SMTP con usuario y contraseña provistos por el servicio de correos (ejemplo conceptual `smtps://USUARIO:CONTRASENA@servidor.smtp:465`). Evita escribir esta URL en mensajes de chat o terminales públicas; ingrésala al prompt de secretos. Si tiene caracteres especiales en el usuario o contraseña, codifícalos como componente de URL.

`QAPATH_SMTP_FROM` es el remitente **autorizado por el proveedor SMTP**, por ejemplo `QAPath Academy <no-reply@tudominio-verificado.com>`.

Si tu CLI no acepta el filtro `functions:qapath-mail` para el *codebase*, usa `--only functions` desde el directorio `firebase`. Estas funciones son independientes del despliegue Next.js/NestJS en Vercel.

No instales simultáneamente la extensión Trigger Email y esta función sobre la misma colección `mail`, porque podrían enviarse mensajes duplicados.

**Seguridad Firestore:** copia únicamente el bloque `match /mail/{messageId}` del archivo `firebase/firestore.rules` a tus reglas Firestore actuales, sin borrar tus otras reglas. **No** despliegues las reglas de ejemplo como reemplazo completo de una configuración existente. El backend con Admin SDK usa IAM y puede escribir aun cuando las reglas bloquean clientes web.

**TTL recomendado:** configura una política de vencimiento sobre el campo `expireAt` de la colección `mail`, que borre las solicitudes después de 48 horas. Esto reduce la retención de enlaces que contienen tokens. La duración del token PostgreSQL sigue siendo 24 horas.

## 3. Iniciar QAPath Academy y comprobar entrega

```powershell
# Desde qapath-academy\
pnpm.cmd dev
```

- Abre `http://localhost:3000/register` para crear una cuenta de prueba o `http://localhost:3000/verify-email` para solicitar un nuevo enlace.
- La API crea un token de un solo uso en PostgreSQL y escribe un documento en `mail` en Firestore.
- La Cloud Function recibe el documento nuevo y añade el estado `delivery.state` en Firestore: `PROCESSING`, `SUCCESS` o `ERROR`.
- Si está `ERROR`, revisa logs de Cloud Functions, permisos IAM y configuración SMTP; si sigue `PENDING` o no aparece `delivery`, verifica si la función está desplegada en el **mismo proyecto** y colección.
- Revisa el correo de prueba y confirma la cuenta. El token solo se consume por el endpoint original de la API; Firebase no decide si el usuario está verificado.

La ausencia del correo en el buzón no significa que Firebase falló: puede existir un error del proveedor SMTP, filtro de spam o retraso. La publicación del documento tampoco garantiza la entrega.

## 4. Pruebas y trazabilidad

```powershell
pnpm.cmd check
node --test tests/firebase-email.test.mjs
node --test firebase/functions/test/*.test.cjs
```

Se cubren la validación de configuración, el nombre de la colección, el contenido del documento, la selección del transporte y la validación del formato de correos. No se han ejecutado aquí pruebas de entrega con credenciales reales ni contra Firestore o SMTP. Para QA/E2E, conserva `EMAIL_TRANSPORT=test-inbox` y `TEST_INBOX_DIR` en el entorno de pruebas, sin necesitar una cuenta real de Firebase.

## 5. Despliegue posterior en Vercel

- `apps/api` y `apps/web` siguen siendo proyectos Vercel separados.
- Mantén `EMAIL_TRANSPORT=firebase`, `FIREBASE_PROJECT_ID`, credenciales de cuenta de servicio en **Environment Variables** seguras del backend y `APP_URL=https://...`.
- Configura el SMTP y los secretos **en Firebase** (no en Vercel).
- No uses `APP_URL=http://localhost:3000` para correos de producción.
- Monitorea el crecimiento de `mail`, estados `ERROR` y presupuesto de Firebase.
- Agrega controles distribuidos de rate limit y reintentos idempotentes antes de abrir registro público masivo.

## Referencias oficiales

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Cloud Functions triggers de Firestore](https://firebase.google.com/docs/functions/firestore-events)
- [Secret Manager en Firebase Functions](https://firebase.google.com/docs/functions/config-env)
- [Firebase Trigger Email (referencia de formato de documentos)](https://firebase.google.com/docs/extensions/official/firestore-send-email)
- [Aviso de cierre de Firebase Extensions](https://extensions.dev/extensions/firebase/firestore-send-email)
