# Corrección Drizzle ORM / pnpm — QAPath Academy 6.1

## Síntoma

132 errores de TypeScript en cuatro adaptadores PostgreSQL por incompatibilidad entre instancias de `drizzle-orm@0.45.4`, con diferentes dependencias peer (`@types/pg`, OpenTelemetry).

## Cambio de arquitectura

- `@qapath/database` exporta el esquema, el cliente y los operadores Drizzle que utiliza el API.
- Cuatro adaptadores importan los operadores desde `@qapath/database`.
- `apps/api/package.json` deja de declarar `drizzle-orm` directamente.
- Se agrega un test para evitar regresiones.

## Instalación

1. Respaldar código y detener `pnpm dev`.
2. Extraer el parche en la **carpeta padre de `qapath-academy`** (el ZIP incluye esta carpeta raíz).
3. Desde la raíz del proyecto:

```powershell
pnpm.cmd install
pnpm.cmd run build:libs
pnpm.cmd --filter @qapath/api typecheck
pnpm.cmd check
pnpm.cmd dev
```

Si aparecen errores de caché, primero detener los procesos Node del proyecto, eliminar solo `apps/api/dist` y `packages/database/dist` (no tocar los datos de PostgreSQL) y reconstruir las librerías. No eliminar `pnpm-lock.yaml` de forma preventiva.

## Alcance

No modifica `.env`, migraciones SQL, credenciales, registros PostgreSQL ni la lógica de seguridad. La prueba de tipado completa requiere ejecutar `pnpm install` en el entorno local del usuario.
