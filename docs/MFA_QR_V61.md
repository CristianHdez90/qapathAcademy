# QAPath Academy 6.1 — QR y clave secreta TOTP

## Alcance

Este parche agrega un código QR escaneable **y una clave manual opcional** a las pantallas:

- `http://localhost:3000/auth/continue`: primer acceso con MFA obligatorio.
- `http://localhost:3000/account`: activación voluntaria de MFA desde Mi cuenta.

El componente compartido `apps/web/src/components/security/mfa-enrollment-card.tsx` usa `qrcode.react` para dibujar un SVG **en el propio navegador** a partir del campo `uri` que entrega la API (`/auth/mfa/setup`). **No hay servicio de terceros que reciba el secreto**.

## Instalación PowerShell

1. Cierra `pnpm.cmd dev` (`Ctrl + C`).
2. Haz una copia de seguridad de los archivos a modificar si tienes cambios propios.
3. Descomprime el ZIP desde la carpeta raíz del repositorio en el **directorio padre** para que se fusionen las carpetas `qapath-academy/` (no extraigas otra carpeta anidada).
4. En la raíz del proyecto ejecuta:

```powershell
pnpm.cmd install
pnpm.cmd --filter @qapath/web typecheck
pnpm.cmd --filter @qapath/web lint
pnpm.cmd check
pnpm.cmd dev
```

Si `pnpm.cmd` no está disponible después de reiniciar Windows, recuerda incluir `$env:LOCALAPPDATA\corepack-bin` en `PATH`.

## Prueba manual QA

1. Usa una cuenta de prueba que todavía esté en `MFA_SETUP` (o un usuario que aún no haya activado MFA).
2. En primer acceso, pulsa **Generar clave MFA**, o en Mi cuenta pulsa **Configurar MFA**.
3. Verifica el **QR** y el botón **Mostrar clave**. La clave empieza oculta.
4. Con Google Authenticator o Microsoft Authenticator escanea el QR. El nombre debe incluir QAPath Academy y la cuenta.
5. Valida la **alternativa manual**: Mostrar clave → Copiar clave → Ingresar cuenta basada en tiempo en la app.
6. Escribe el TOTP de **6 dígitos** (vigencia habitual de 30 s) y pulsa **Activar MFA**.
7. Comprueba que aparecen los **códigos de recuperación** y que al volver a iniciar sesión se solicita MFA.
8. Regresa a Mi cuenta, verifica que un usuario con MFA activo no puede iniciar una nueva vinculación sin el flujo correspondiente.
9. En móvil comprueba contraste, scroll y dimensiones del QR.

## Seguridad

- No registres en logs, analíticas ni capturas el QR, `uri`, `secret` o los códigos TOTP.
- No subas credenciales MFA a Git ni las copies en tickets.
- El secreto se obtiene en la API y se renderiza temporalmente en el navegador, sin generador QR remoto.
- QR y secreto manual codifican la misma credencial. No utilices los dos para registrar cuentas duplicadas en la app autenticadora.
- Si un secreto de MFA fue expuesto en una captura, **rota esa credencial antes de usarla en producción**. No cambies únicamente `MFA_ENCRYPTION_KEY` en un sistema con secretos ya guardados, porque podrían quedar ilegibles.
- Ninguna migración de PostgreSQL ni cambio al backend son necesarios.

## Estructura del parche

- `apps/web/package.json`: dependencia `qrcode.react@^4.2.0`
- `apps/web/src/components/security/mfa-enrollment-card.tsx`: QR SVG, visibilidad y copia de clave
- `apps/web/src/app/auth/continue/page.tsx`: primer acceso MFA
- `apps/web/src/components/academy/account-panel.tsx`: MFA desde Mi cuenta
- `apps/web/src/app/globals.css`: estilos responsive
- `tests/mfa-qr.test.mjs`: comprobaciones de integración
