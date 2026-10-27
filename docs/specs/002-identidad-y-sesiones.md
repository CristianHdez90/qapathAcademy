# SPEC-002 — Identidad y sesiones

## 01. Intención
Registrar estudiantes y autenticar cuentas verificadas, manteniendo la sesión de la academia en PostgreSQL tanto con identidad local como con Firebase.

## 02. Comportamiento
### Actores, entradas y estados
Visitante: registro, verificación y login; cuenta existente: desafíos previos a sesión; usuario autenticado: consulta de identidad y logout. Entradas validadas por Zod con objetos estrictos. Correo normalizado mediante EmailAddress; contraseña de registro de 12 a 128 caracteres.

### Flujo principal
1. POST `/api/v1/auth/register`: crea STUDENT, nunca toma un rol del cliente; respuesta genérica para el correo existente y el nuevo. En modo local crea verificación de un uso; con Firebase registra/vincula identidad externa.
2. POST `auth/verify-email` verifica token/código; POST `auth/resend-verification` permite solicitar otro. Verificación local: hash del token, duración 24 horas, reserva con bloqueo de fila y espera mínima de 60 segundos entre solicitudes vigentes.
3. POST `auth/login`: comprueba credenciales, actividad y bloqueo. Tras cinco fallos, bloqueo de 15 minutos en el adaptador local de cuentas.
4. Orden de etapas del servicio: VERIFY_EMAIL → CHANGE_PASSWORD, si es obligatorio → MFA_SETUP para ADMIN sin MFA → MFA_VERIFY si está activo → AUTHENTICATED.
5. Solo la última etapa crea sesión completa de siete días. Las etapas intermedias usan desafío restringido de diez minutos.
6. GET `auth/me` devuelve PublicUser; POST `auth/logout` revoca la sesión y limpia cookies.

### Alternos y errores
- Credenciales inválidas o cuenta bloqueada: errores de autenticación; desafíos usados, vencidos o con cinco fallos no habilitan sesión.
- `AUTH_PROVIDER=firebase` usa FirebaseAuthAdapter para credenciales y firma/revocación de identidad externa. El servicio conserva sesión opaca propia, no convierte el JWT de Firebase en cookie de academia.
- Migración de una cuenta local a Firebase exige validar antes su contraseña local; vinculación del UID condicionada a que aún no exista.
- `sessionUser` vuelve a exigir correo verificado, cambio inicial resuelto, ADMIN con MFA y validez externa cuando corresponde.
- AuthenticationService antiguo existe, pero el wiring utiliza SecureAuthenticationService; no se describe el servicio antiguo como login productivo.

### Criterios de aceptación derivados
- I-001: un registro con rol añadido al cuerpo debe rechazarse por contrato estricto.
- I-002: un ADMIN sin segundo factor no recibe una sesión completa.
- I-003: una cuenta desactivada o sesión revocada/expirada no se resuelve como usuario válido.
- I-004: logout revoca el hash de sesión; la respuesta pública no entrega el token crudo.

## 03. Restricciones
Contraseñas locales: scrypt-v1, salt aleatorio, comparación en tiempo constante. Tokens opacos aleatorios de 32 bytes; PostgreSQL conserva SHA-256. Cookie de sesión HttpOnly, Path=/, SameSite=Lax, Secure y prefijo __Host en producción. Desafío: HttpOnly, SameSite=Strict, diez minutos. No se incluyen valores de cookies, tokens ni datos personales.

## 04. No-Objetivos
No implementar OAuth social ni recuperación general de contraseña olvidada. No probar login externo ni enviar correos en esta fase.

## Evidencia y trazabilidad
| Afirmación | Evidencia (ruta + símbolo) | Test/observación | Estado |
|---|---|---|---|
| Etapas y vigencias | `libs/identity/src/application/account-security.ts` — SecureAuthenticationService, signUp, signIn, sessionUser | `tests/account-security.test.mjs` | CONFIRMADO |
| Rutas y cookies | `apps/api/src/presentation/controllers/auth.controller.ts` — AuthController; `apps/api/src/presentation/security/session-security.ts` — cookieName | Lectura estática | CONFIRMADO |
| Hashes y derivación | `apps/api/src/infrastructure/adapters/crypto-auth.adapter.ts` — adaptadores criptográficos | `tests/account-security.test.mjs` existente | CONFIRMADO |
| Persistencia y bloqueo | `apps/api/src/infrastructure/adapters/postgres-identity.adapter.ts` — recordFailure, findUserByTokenHash | `tests/identity-progress.test.mjs` no demuestra integración SQL por sí solo | CONFIRMADO |
| Token de verificación y reserva | `apps/api/src/infrastructure/adapters/postgres-security.adapter.ts` — createVerification, consumeVerification | Lectura de transacciones | CONFIRMADO |
| Firma externa y revocación | `apps/api/src/infrastructure/adapters/firebase-auth.adapter.ts` — fromToken, validSession, migrate | `tests/firebase-identity.test.mjs`, `tests/firebase-auth-emulator.integration.mjs` existentes | CONFIRMADO |
| Entrega efectiva de correo en producción | Fuera del workspace inspeccionado | No enviada ni consultada | NO VERIFICADO |

## Preguntas abiertas y deuda técnica
DT-06: límites globales/distribuidos de autenticación no establecidos por los guards inspeccionados. DT-14: no se encontró una ruta de recuperación por contraseña olvidada ni rotación de recovery codes en AuthController. Confirmar procedimiento operativo antes de especificarlo como capacidad.

