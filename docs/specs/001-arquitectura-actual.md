# SPEC-001 — Arquitectura actual

> AS-IS del workspace descrito en [la línea base](000-ingenieria-inversa-as-is.md). CONFIRMADO significa inspección estática, no ejecución satisfactoria.

## 01. Intención
Servir una academia de QA con catálogo público, prácticas, identidad y progreso por estudiante. La separación en aplicaciones, bibliotecas y paquetes está implementada en el monorepo; no se presupone una arquitectura ideal ni aislamiento total entre contextos.

## 02. Comportamiento
- `apps/web`: Next.js/React, páginas App Router, componentes cliente para interacción y clientes HTTP para API. `academyApi` usa `API_INTERNAL_URL`, envoltura `data` y `cache:no-store`.
- `apps/api`: NestJS, prefijo `/api/v1`, composición en `AppModule`, controladores, guards y adaptadores.
- `libs/learning`: modelos, puertos y casos de uso del catálogo/evaluación. `libs/content`: snapshot JSON importado por el adaptador de contenido, no por el cliente HTTP web.
- `libs/identity`: identidad, autenticación segura y puertos; `libs/administration`: consultas/mutaciones de estudiantes; `libs/progress`: normalización, reglas y validadores compartidos con el navegador.
- `packages/contracts`: DTO y validación Zod. `packages/database`: conexión PostgreSQL, esquema Drizzle y migraciones SQL.
- `AppModule` enlaza puertos mediante tokens y factories; los adaptadores de IA y sandbox tienen lógica en `apps/api/src/application`. El nombre de esa carpeta no implica el mismo aislamiento que `libs/*/application`.
- Persistencia operativa observada: identidad/sesiones/seguridad, progreso JSONB con revisión y eventos, auditoría, conversaciones y configuración de IA. El catálogo sigue en JSON; las tablas `courses`, `lessons`, `learning_progress` declaradas no son la fuente del adaptador del catálogo inspeccionado.

### Flujo entre fronteras
Navegador → proxy Next `/api/v1/*` → OriginGuard → SessionGuard → RolesGuard → controlador/caso de uso → adaptador PostgreSQL o proveedor. Las páginas servidor consultan el API con `academyApi`; los endpoints públicos omiten sesión/roles, no el guard de origen.

### Criterios de aceptación derivados
- A-001: al solicitar un módulo existente, el API compone semanas, preguntas públicas, laboratorios y recursos desde el snapshot.
- A-002: ante una mutación de progreso, el controlador obtiene la identidad del request autenticado y usa el puerto de progreso.
- A-003: el código de dominio/aplicación de las cuatro bibliotecas cubiertas por el test arquitectónico no debe importar los frameworks que dicho test enumera. Es una regla comprobable por ese test, no certificación de toda la arquitectura.

## 03. Restricciones
Node declarado >=22.12, pnpm 10.18.2; versión de paquete raíz 6.1.0. PostgreSQL requerido al iniciar el API; el modo visitante web no elimina esa dependencia del backend para catálogo. No se inspeccionaron instalaciones efectivas ni el despliegue remoto.

## 04. No-Objetivos
No rediseñar contextos, extraer servicios ni migrar catálogo a SQL. No afirmar que todas las carpetas cumplen DDD/Clean Architecture por su nombre.

## Evidencia y trazabilidad
| Afirmación | Evidencia (ruta + símbolo) | Test/observación | Estado |
|---|---|---|---|
| Composición y guards | `apps/api/src/app.module.ts` — AppModule, APP_GUARD | `tests/architecture.test.mjs`, lectura | CONFIRMADO |
| Cliente y proxy | `apps/web/src/lib/academy-api.ts` — academyApi; `apps/web/next.config.ts` — rewrites | Sin petición ejecutada | CONFIRMADO |
| Catálogo JSON | `apps/api/src/infrastructure/adapters/json-content.adapter.ts` — JsonContentAdapter; `libs/content/src/index.ts` — contentSnapshot | `tests/content.test.mjs` existente | CONFIRMADO |
| Dependencia de base | `apps/api/src/infrastructure/database.provider.ts` — constructor, onModuleInit | Sin conexión abierta | CONFIRMADO |
| Límites de imports | `tests/architecture.test.mjs`; `tests/drizzle-single-boundary.test.mjs` | Leídos, no ejecutados | CONFIRMADO |
| Correspondencia con producción | Ningún commit remoto/despliegue comparado | Pendiente de evidencia | NO VERIFICADO |

## Preguntas abiertas y deuda técnica
DT-03 y DT-11: varias representaciones de esquema/reglas; DT-13: concentración de coordinación en componentes. Uso productivo de las tablas iniciales de cursos: NO VERIFICADO; no hay consumo en los adaptadores de catálogo revisados.

