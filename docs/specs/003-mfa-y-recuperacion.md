# SPEC-003 — MFA y recuperación

## 01. Intención
Exigir segundo factor a ADMIN y permitirlo de forma voluntaria a otras cuentas verificadas, con códigos de recuperación de un uso.

## 02. Comportamiento
- Inscripción mediante POST `/api/v1/auth/mfa/setup`: usa desafío de enrolamiento o sesión completa y reautenticación por contraseña. Rechaza MFA ya activo.
- Genera secreto pendiente cifrado con caducidad de diez minutos. La tarjeta web presenta datos de inscripción y QR.
- POST `auth/mfa/activate`: comprueba TOTP, activa credencial pendiente y genera ocho recovery codes; se guardan únicamente sus hashes. Revoca sesiones anteriores y devuelve el resultado de autenticación.
- POST `auth/mfa/verify`: acepta TOTP o un recovery code, reclama atómicamente el paso/código y consume el desafío para completar login.
- TOTP: seis dígitos, periodos de 30 segundos, SHA-1 y tolerancia de un paso a ambos lados. El último paso usado se guarda para impedir replay.
- Fallos incrementan los intentos del desafío; su vida es diez minutos y el máximo es cinco. Un recovery code consumido no vuelve a ser aceptado.
- Cifrado del secreto: AES-256-GCM con IV aleatorio; requiere MFA_ENCRYPTION_KEY válida de 32 bytes hexadecimales. La disponibilidad de esa variable real no fue consultada.

### Criterios de aceptación derivados
- M-001: un TOTP válido ya utilizado debe fallar en su siguiente reclamación.
- M-002: un recovery code permite como máximo un consumo.
- M-003: una inscripción pendiente vencida no activa MFA.
- M-004: completar contraseña sin completar MFA no habilita sesión de ADMIN.

## 03. Restricciones
La clave de cifrado reside en configuración del servidor. No se registran secretos, URI otpauth, QR reales ni recovery codes. La lectura demuestra el mecanismo de reclamación SQL; no demuestra que haya sido ejercitado contra una base en esta fase.

## 04. No-Objetivos
No introducir MFA por SMS, WebAuthn ni nuevos factores. No crear rotación, desactivación o recuperación administrativa: no se localizaron esas rutas en la superficie AuthController revisada.

## Evidencia y trazabilidad
| Afirmación | Evidencia (ruta + símbolo) | Test/observación | Estado |
|---|---|---|---|
| Inscripción y verificación | `libs/identity/src/application/account-security.ts` — beginMfa, activateMfa, verifyMfa | `tests/account-security.test.mjs` | CONFIRMADO |
| Algoritmo y cifrado | `apps/api/src/infrastructure/adapters/totp.adapter.ts` — adaptador TOTP | Lectura, sin generar secreto | CONFIRMADO |
| Antirreplay y un uso | `apps/api/src/infrastructure/adapters/postgres-security.adapter.ts` — claimMfaStep, claimRecoveryCode, consumeChallenge | SQL condicional | CONFIRMADO |
| Presentación del QR | `apps/web/src/components/security/mfa-enrollment-card.tsx`; `tests/mfa-qr.test.mjs` | Artefactos localizados; render no observado | CONFIRMADO |
| Recovery end-to-end | `apps/web/tests/e2e/security-comprehensive.spec.ts:122` — prueba recovery | Condicionada por variables; no ejecutada | NO VERIFICADO |
| Rotación/desactivación self-service | `apps/api/src/presentation/controllers/auth.controller.ts` — superficie de rutas | No localizada en esta superficie | NO VERIFICADO |

## Preguntas abiertas y deuda técnica
DT-14: definir proceso de pérdida de factores y de rotación de claves/códigos mediante Spec TO-BE. Cambiar la clave sin migrar secretos cifrados puede impedir descifrado; no se ejecutó ningún cambio de configuración.

