# SPEC-008 — Integraciones y despliegue

## 01. Intención
Conectar la academia con PostgreSQL, correo, identidad externa e IA, y declarar su ejecución local/CI/Vercel.

## 02. Comportamiento
### Infraestructura
- Next rewrites envía /api/v1/* a API_PROXY_TARGET; páginas servidor usan API_INTERNAL_URL. Ambas rutas de conexión son distintas y requieren configuración coherente.
- Nest escucha PORT (4000 por defecto), prefijo /api/v1 y CORS con credenciales según WEB_ORIGIN. Middleware añade Cache-Control:no-store y X-Content-Type-Options:nosniff.
- En producción exige APP_URL HTTPS, MFA_ENCRYPTION_KEY válida y configuración de transporte de correo cuando corresponde. AUTH_PROVIDER admite local/firebase.
- createDatabase usa pg.Pool máximo 2, timeout de conexión 5 s e idle 30 s; Drizzle comparte esa conexión.
- onModuleInit comprueba cuatro tablas operativas y users.firebase_uid. No verifica explícitamente tablas de migraciones 006/007.
- El runner de migraciones lee SQL numerados ordenados, guarda checksum SHA-256 por archivo y bloquea con advisory lock dentro de cada transacción. Rechaza checksum alterado; confirma o revierte cada archivo. No se ejecutó.

### Persistencia encontrada
SQL 001–007 define evolución desde cursos/lecciones, identidad y progreso, auditoría, seguridad/MFA, vínculo Firebase, conversaciones e IA. schema.ts contiene 12 declaraciones pgTable: users, auth_sessions, student_progress, courses, lessons, learning_progress, admin_audit_events, student_progress_events, email_verification_tokens, auth_challenges, user_mfa_credentials, mfa_recovery_codes. Las otras dos tablas qa_conversations y qa_ai_settings existen en SQL006/007 y se usan mediante SQL directo. No debe equipararse el esquema tipado con todas las tablas SQL. qapath_schema_migrations la crea el runner.

### Correo e identidad externa
AUTH_PROVIDER=firebase autentica mediante Firebase Auth y valida firma/revocación con Admin SDK. EMAIL_TRANSPORT=firebase es otra capacidad: encola mensajes en Firestore, manteniendo token de verificación local en PostgreSQL.
VerificationEmailAdapter admite resend, firebase, console/test-inbox solo fuera de producción. FirebaseEmailAdapter marca expireAt a 48 horas: el TTL real requiere configuración externa. La función sendAcademyVerificationEmail escucha mail/{mailId}, usa SMTP, guarda PROCESSING/SUCCESS/ERROR, retry=false; encolar no acredita entrega.

### Variables (solo nombres; valores reales no leídos)
| Área | Variables identificadas en código/configuración |
|---|---|
| API/base/red | DATABASE_URL, PORT, NODE_ENV, APP_URL, WEB_ORIGIN |
| Web | API_INTERNAL_URL, API_PROXY_TARGET |
| Identidad | AUTH_PROVIDER, MFA_ENCRYPTION_KEY |
| Correo | EMAIL_TRANSPORT, EMAIL_FROM, RESEND_API_KEY, TEST_INBOX_DIR |
| Firebase | FIREBASE_PROJECT_ID, FIREBASE_WEB_API_KEY, FIREBASE_SERVICE_ACCOUNT_EMAIL, FIREBASE_PRIVATE_KEY, GOOGLE_APPLICATION_CREDENTIALS, FIREBASE_AUTH_EMULATOR_HOST, FIREBASE_MAIL_COLLECTION |
| Función SMTP | QAPATH_SMTP_URL, QAPATH_SMTP_FROM |
| IA | QA_AI_ENABLED, QA_AI_PROVIDER, QA_AI_MODEL, QA_AI_BASE_URL, QA_AI_ENCRYPTION_KEY, GROQ_API_KEY, GEMINI_API_KEY |

IA: defaults de entorno si no hay fila; configuración persistida manda cuando existe. Modelo/baseUrl son del proveedor activo, no una configuración paralela por modelo. Credenciales guardadas por proveedor cifradas; fallback de cifrado a MFA_ENCRYPTION_KEY. Véase SPEC-009.

### Despliegue y criterios de aceptación derivados
apps/web/vercel.json y apps/api/vercel.json declaran builds separados. El start API apunta a dist/main.js; no se identificó un archivo api/index.ts en el árbol inspeccionado. Que Vercel descubra/ejecute correctamente Nest: NO VERIFICADO.
- D-001: sin DATABASE_URL, DatabaseProvider falla al construir.
- D-002: una migración aplicada con checksum diferente debe detener el runner.
- D-003: emulador Firebase se rechaza con NODE_ENV production o VERCEL=1.
- D-004: fallos de proveedor no deben exponer cuerpos arbitrarios con credenciales.

## 03. Restricciones
No se inspeccionó ninguna variable real, consola de proveedor ni base externa. Disponibilidad, región, coste, TLS efectivo, TTL, backups y commit desplegado: NO VERIFICADO. No se asume paridad entre local, CI y producción.

## 04. No-Objetivos
No migrar, configurar proveedores, desplegar ni cambiar claves. No validar documentación externa como si fuera evidencia del despliegue.

## Evidencia y trazabilidad
| Afirmación | Evidencia (ruta + símbolo) | Test/observación | Estado |
|---|---|---|---|
| Arranque/red | `apps/api/src/main.ts` — bootstrap; `apps/web/next.config.ts` — rewrites | Configuración leída | CONFIRMADO |
| Conexión y chequeo | `packages/database/src/client.ts` — createDatabase; `apps/api/src/infrastructure/database.provider.ts` — onModuleInit | Sin conexión abierta | CONFIRMADO |
| Migraciones y divergencia tipada | `packages/database/scripts/migrate.mjs`; `packages/database/src/schema.ts`; `packages/database/sql/006_qa_conversations.sql`; `packages/database/sql/007_qa_ai_settings.sql` | Inspección estática | CONFIRMADO |
| Firebase y correo | `apps/api/src/infrastructure/adapters/firebase-auth.adapter.ts` — readFirebaseAuthConfig; `apps/api/src/infrastructure/adapters/firebase-email.adapter.ts` — queueVerification; `firebase/functions/index.js` — sendAcademyVerificationEmail | `tests/firebase-email.test.mjs`; `firebase/functions/test/send-email.test.cjs` | CONFIRMADO |
| Vercel | `apps/web/vercel.json`; `apps/api/vercel.json` | Solo intención de build, sin despliegue consultado | NO VERIFICADO |

## Preguntas abiertas y deuda técnica
DT-03/04: deriva de esquema y chequeo parcial; DT-15: colección de correo parametrizable frente a trigger fijo. Confirmar configuración efectiva mediante futura revisión autorizada de infraestructura.

