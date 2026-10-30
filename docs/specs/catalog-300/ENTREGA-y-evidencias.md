# SPEC-CATALOG-300 · Implementación local y evidencias

Fecha: 2026-10-29. Rama: `codex/catalog-300`.

Worktree: `C:/Users/ingcr/.codex/worktrees/catalog-300/qapath-academy`.

## Resultado implementado

Home y `/courses` comparten catálogo público, búsqueda, paginación y estados de carga/error/vacío. La semilla inicial ofrece seis cursos heredados, Scrum y CTFL. La navegación principal se limita a Cursos, Mi cuenta y búsqueda, con diálogo móvil accesible. El acceso a recursos, administración e historial permanece en Mi cuenta.

ADMIN puede crear borradores, editar metadatos/asignaciones, publicar, despublicar, archivar y restaurar. El slug permanece estable. Publicar requiere contenido reconocido y resumen; restaurar vuelve a borrador. Las escrituras usan revisión optimista y auditoría transaccional, y conservan las referencias académicas.

STUDENT puede crear varias rutas privadas, seleccionar cursos, retirarlos, reordenarlos, eliminarlas y elegir una activa. La persistencia es independiente del progreso académico. Cursos archivados de una selección anterior conservan su nombre y se muestran como no disponibles. La vuelta desde login admite únicamente el destino local de rutas; no salta los estados de MFA/verificación existentes.

## Arquitectura y archivos principales

| Capa | Archivos |
|---|---|
| Dominio y puertos | `libs/learning/src/domain/course-catalog.ts` |
| Aplicación | `libs/learning/src/application/manage-course-catalog.ts` |
| PostgreSQL | `apps/api/src/infrastructure/adapters/postgres-course-catalog.adapter.ts` |
| Presentación API | `apps/api/src/presentation/controllers/course-catalog.controller.ts` |
| Contratos | `packages/contracts/src/course-catalog.ts` |
| Migración aditiva | `packages/database/sql/008_course_catalog.sql` |
| Esquema | `packages/database/src/catalog-schema.ts`, ampliación de `schema.ts` |
| UI | `apps/web/src/components/courses/`, navegación en `components/layout/sidebar.tsx` |
| Rutas web | `/`, `/courses`, `/courses/[slug]`, `/admin/courses`, `/learning-paths`, `/legacy/modules/[moduleId]` |
| Pruebas | `tests/course-catalog*.test.mjs`, `tests/course-return.test.mjs`, `apps/web/tests/e2e/catalog-300.spec.ts` |

## Ejecución reproducible

En este worktree, con dependencias instaladas mediante `pnpm install --offline --frozen-lockfile`:

```powershell
# API sintética local para la compilación y los navegadores; ninguna conexión productiva.
$env:API_PROXY_TARGET = 'http://127.0.0.1:4017'
$env:API_INTERNAL_URL = 'http://127.0.0.1:4017'
pnpm.cmd check
node --test tests/course-catalog.integration.test.mjs
pnpm.cmd --filter @qapath/web exec playwright test -c playwright.catalog.config.ts
```

Playwright inicia Next compilado en `127.0.0.1:3017` y una API Nest de pruebas en `127.0.0.1:4017`. La API utiliza PGlite con el SQL real, repositorio PostgreSQL real y guards de sesión/rol/Origin reales. Solo las identidades/sesiones son sintéticas. Esos endpoints de sesión no se registran en el módulo productivo. No son una validación E2E del proveedor real de correo o TOTP.

La integración aplica SQL 001–003 y 008 en una base embebida efímera. Conserva y compara lecciones, progreso por lección, notas, quizzes y semanas históricas 21–24; verifica semilla repetida, cambios ADMIN, auditoría, propietario, revisiones obsoletas, una sola ruta activa y límite de rutas.

## Trazabilidad de aceptación

| Criterio | Implementación y evidencia |
|---|---|
| CA-01–04 | Semilla/listado público, Home depurado, búsqueda con acentos; Node integración y Playwright Home/búsqueda |
| CA-05–07 | Referencias válidas, detalle y enlaces legacy/Scrum/CTFL; pruebas de contenido Node y Playwright navegación |
| CA-08–11 | Crear/editar/publicar/archivar/restaurar; integración SQL/HTTP y flujo ADMIN en ambos motores |
| CA-12 | Guards existentes, roles 401/403/INSTRUCTOR, Origin, comprobación de interfaz; integración y Playwright |
| CA-13 | Eventos con actor/curso/cambios anteriores y posteriores, sin credenciales; integración PostgreSQL |
| CA-14–16 | Selección privada, orden, activa, retiro no destructivo, persistencia tras sesión; integración y Playwright |
| CA-17–18 | APIs legacy mantenidas, redirecciones de cursos y acceso histórico; huellas académicas e integración/Playwright |
| CA-19 | Porcentaje por semanas del propio curso; Scrum/CTFL usan sus experiencias/resultados, sin porcentaje sobre 24 semanas |
| CA-20 | Foco visible, búsqueda con teclado, Escape y retorno de foco, 320 px sin overflow; capturas y Playwright. La revisión humana con lector de pantalla queda pendiente |
| CA-21 | Error explícito y botón Reintentar, sin falso vacío; Playwright intercepta un 503 |
| CA-22 | Validación de dominio/contratos y publicación, semilla repetible sin sobreescritura ADMIN; unitarias/integración |
| CA-23 | Suite Node académica/identidad, comparación de fuentes protegidas y estados históricos. MFA real, correo y todo el currículo en staging requieren revisión adicional |
| CA-24 | Resultados exactos y logs al final de este documento; habilita revisión local, no liberación productiva automática |

## Coexistencia con Claude

`baseline-local.json` identifica 111 archivos locales preexistentes copiados para comprobar coexistencia. El catálogo no reintroduce el currículo anterior ni modifica los componentes, datos o reglas de Fundamentos v2 respecto de esa copia. `inventario-local.json` registra las huellas y el estado Git para revisión; no atribuir la totalidad de `git diff` a esta SPEC.

Los archivos compartidos requieren integración revisada: composición `app.module.ts`, exportaciones de contratos/aprendizaje y sustitución de navegación. El árbol generado se regeneró desde la copia de contenido, `next-env.d.ts` es generado por Next y una aserción de `foundation-v2.test.mjs` incorpora la corrección exacta ya realizada por Claude (`T99` como tarjeta inexistente). Dos recursos del kit se normalizaron CRLF→LF para sus comparaciones de contenido sin cambio semántico.

No se realizó commit global de la copia de Claude ni push. Antes de integrar, contrastar nuevamente su trabajo vigente; este worktree prueba una instantánea, no bloquea sus modificaciones posteriores.

## Límites y revisión previa a liberar

- No se desplegó ni ejecutó migración en producción; tampoco se usó `DATABASE_URL` productiva.
- La prueba SQL embebida no sustituye ejecutar la migración en una copia autorizada de PostgreSQL con inventario y respaldo verificable. El procedimiento y reversión están en `MIGRACION-y-liberacion.md`.
- La semilla conserva metadatos existentes con el mismo slug; un despliegue sobre datos reales requiere reconciliar visibilidad/títulos, sin sobrescribir decisiones anteriores.
- El límite de escrituras es un respaldo por proceso; un despliegue distribuido requiere revisar el límite compartido de infraestructura.
- Las imágenes de portadas aceptadas están restringidas a recursos locales permitidos. Las tarjetas utilizan una ilustración geométrica de reserva.
- No se generó un archivo Figma nuevo. Las capturas del resultado implementado permiten revisar escritorio y móvil.
- La liberación exige revisión humana de accesibilidad, sesiones/MFA reales de staging y conciliación con los últimos cambios de Claude.

## Resultados de validación

| Ejecución | Resultado | Evidencia |
|---|---|---|
| `pnpm check` | Exit 0: 235/235 pruebas Node, tipos, lint y build API/web correctos | `pnpm-check-final.log` |
| Integración ampliada tras añadir los casos de activa/límite/revisión | Exit 0: 1/1 prueba con aserciones SQL/HTTP | `integracion-final.log` |
| Playwright catálogo | Exit 0: 14/14, siete escenarios en Chromium y siete en WebKit; 3,2 minutos, sin reintentos | `playwright-catalog-final.log` |
| `git diff --check` | Exit 0, sin errores de espacios; advertencias de conversión LF/CRLF de Git | Comprobación local al cierre |
| Revisión visual | Capturas de Home, móvil y ADMIN inspeccionadas; títulos y formularios ADMIN ajustados | `evidence/home-*.png`, `mobile-*.png`, `admin-*.png` |
| Integridad de Fundamentos/progreso | Ocho archivos centrales comparados por SHA-256 con la instantánea inicial, sin cambios | `delta-local.json`, `inventario-local.json` |

La primera ejecución de `pnpm check` encontró cuatro incompatibilidades de la copia local: una aserción desactualizada que Claude ya había corregido, el árbol generado y dos comparaciones sensibles a CRLF del kit. Se corrigieron de forma acotada; no se cambió su contenido académico. El log inicial se conserva en `pnpm-check.log`.

La primera campaña Playwright terminó con 9/14: dos expectativas seleccionaban también el anunciador de rutas de Next y WebKit necesitó más tiempo para completar cambios de sesión/navegación. Se limitaron las alertas al landmark `main` y se configuraron expectativas de hasta 15 segundos, sin pausas fijas ni reintentos. La campaña final verificó logout/login, persistencia, permisos y ambos motores. Se conserva el resultado inicial en `playwright-catalog.log`; no se ocultan los fallos previos.

`huellas-evidencias.json` permite comprobar la migración, logs finales y capturas. La validación es local y autoriza presentar el cambio a revisión; los pendientes de staging/producción anteriores siguen siendo condiciones de liberación.
