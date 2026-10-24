# Evidencia de validación de QAPath Academy 4.0

Fecha: 2026-10-23.

## Ejecutado y aprobado en entorno de generación
- Compilación aislada TypeScript: `libs/identity`, `libs/progress`, `libs/learning`, `libs/content`.
- `node --test tests/*.test.mjs`: **14 pruebas aprobadas / 0 fallidas**. Incluyen modelo de identidad, operaciones de progreso, fusión de respaldo, reglas de arquitectura e integridad del catálogo.
- Revisión de sintaxis de todos los archivos TS/TSX mediante TypeScript `transpileModule`: **82 archivos sin errores sintácticos** antes del empaquetado.
- Validación de sintaxis del runner SQL con `node --check`.

## No ejecutado en este entorno
- `pnpm install`, `pnpm typecheck`, `pnpm lint` y `pnpm build` completos (no disponible el registro npm).
- Conexión a una base PostgreSQL real y ejecución de las migraciones.
- Pruebas de integración API/NestJS en proceso y pruebas Playwright contra una base PostgreSQL real.

## Para confirmar en Windows antes de Vercel
1. `pnpm.cmd install`
2. `pnpm.cmd db:migrate`
3. `pnpm.cmd test`
4. `pnpm.cmd typecheck`
5. `pnpm.cmd lint`
6. `pnpm.cmd build`
7. `pnpm.cmd test:e2e`
8. Revisar específicamente cookies, proxy y CORS desde `localhost` y desde el dominio preview de Vercel.

> Las pruebas de contratos y de dominio aislados no sustituyen el smoke test con la base de datos ni una auditoría de seguridad de la autenticación.

## E2E con artefactos compilados

En GitHub Actions, el job `e2e` ejecuta `pnpm build` en su propio checkout antes de Playwright. La configuración inicia la API compilada y Next.js con `next start`, espera ambos endpoints y no reutiliza servidores existentes. El backend usa `NODE_ENV=test` para probar por HTTP local; la web sirve la compilación de producción. Esta ejecución no valida la configuración HTTPS ni las credenciales del despliegue real.

Para reproducir ese modo en PowerShell, con PostgreSQL preparado y las variables de prueba configuradas:

```powershell
pnpm.cmd build
$env:E2E_PRODUCTION='true'
try { pnpm.cmd test:e2e }
finally { Remove-Item Env:E2E_PRODUCTION }
```

Los puertos 3000 y 4000 deben estar libres. Para usar otros, configura `E2E_BASE_URL`, `API_INTERNAL_URL` y `API_PROXY_TARGET` antes de compilar y conserva esos valores durante las pruebas: las reescrituras del proxy se generan en el build. El modo E2E compilado también se activa automáticamente con `CI`.

Las pruebas de seguridad que exigen `TEST_INBOX_DIR`, `E2E_ALLOW_DB_WRITES` o credenciales administrativas siguen omitiéndose si faltan sus requisitos; no deben contarse como aprobadas.
