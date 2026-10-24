# Despliegue en Vercel: dos proyectos, mismo monorepo

## Prerrequisitos
Repositorio Git con `pnpm-lock.yaml` generado y subido, CI verde, Node 22, plan compatible con límites de Vercel Functions.

## Proyecto 1 — API (`qapath-api`)
1. Importar el repositorio en Vercel, establecer **Root Directory: `apps/api`**.
2. Framework NestJS (si no se detecta, conservar `src/main.ts`, que Vercel detecta automáticamente).
3. Instalar dependencias con pnpm. En Root Directory, habilitar **Include source files outside of the Root Directory in the Build Step** para incluir `libs/`, `packages/` y la configuración del workspace.
4. `apps/api/vercel.json` configura el Build Command: `pnpm -w run build:libs && pnpm --filter @qapath/api build`. Las bibliotecas deben compilarse antes de NestJS: sus entradas JavaScript y declaraciones de tipos están en `dist/`, que no se versiona. Ejecutar solo `pnpm run build` desde `apps/api` en un checkout limpio causa errores TS2307 al importar `@qapath/*`.
5. Configurar `WEB_ORIGIN=https://dominio-web.vercel.app` en el API y secretos solo por ambiente.
6. Validar `https://dominio-api.vercel.app/api/v1/health` y `GET /api/v1/modules`.

## Proyecto 2 — Web (`qapath-academy`)
1. Importar el mismo repositorio. **Root Directory: `apps/web`**, Framework Next.js.
2. Habilitar también la inclusión de archivos fuera de Root Directory. `apps/web/vercel.json` configura el Build Command: `pnpm -w run build:libs && pnpm --filter @qapath/web build`.
3. Configurar (solo servidor):
   - `API_INTERNAL_URL=https://dominio-api.vercel.app`
   - `API_PROXY_TARGET=https://dominio-api.vercel.app`
4. Verificar páginas SSR y `POST /api/v1/quizzes/fundamentos/grade` vía proxy.

## Consideraciones
- Primero desplegar API y luego Web. No son microservicios ni requieren sesión sticky.
- NestJS soporta Vercel Functions con `src/main.ts`; configuración específica de monorepo puede requerir ajustar builds en Vercel según lockfile y el gestor de paquetes.
- Los URLs son ejemplos, **no son dominios publicados**. Comprobar disponibilidad de `qapath-academy.vercel.app`.
- Mantener Postgres externo con pool serverless cuando se active.
- Limitar secretos y verificar rate limiting, cabeceras, observabilidad, cuotas y permisos antes de exponer escritura.
- La generación de `pnpm-lock.yaml` y prueba de despliegue solo se puede hacer en un entorno con acceso a npm y Vercel.

Referencia: https://vercel.com/docs/frameworks/backend/nestjs


---

## Actualización v4 (23-10-2026)

Se incorporó Identity + sesiones + roles (RBAC) y Progress persistente mediante adaptadores Drizzle/PostgreSQL. Las dependencias permanecen orientadas al dominio, sin NestJS ni PostgreSQL en `libs/identity` o `libs/progress`. Consulta [Implementación Identity y PostgreSQL](IMPLEMENTACION_IDENTIDAD_POSTGRES.md). El despliegue ahora **requiere** `DATABASE_URL` y migraciones previas. No abrir registro público sin verificación de email, rate limit distribuido y política de privacidad.
