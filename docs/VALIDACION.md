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
