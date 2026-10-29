# Catálogo y rutas · API y operación

SPEC-CATALOG-300 · Implementación local · 2026-10-29. No se ha autorizado ni realizado publicación productiva.

## Arquitectura

- Dominio: `libs/learning/src/domain/course-catalog.ts`, invariantes de curso, publicación, referencias y rutas.
- Aplicación: `ManageCourseCatalog`, con puertos `CourseRepositoryPort` / `LearningPathRepositoryPort`. No importa React, NestJS, PostgreSQL ni contenido JSON.
- Infraestructura: `PostgresCourseCatalogAdapter` y `PersonalLearningPaths`. Curso/relaciones/auditoría y selección/orden/activación se modifican en transacciones.
- Presentación: controladores independientes en `course-catalog.controller.ts`, DTO y esquemas estrictos en `packages/contracts/src/course-catalog.ts`.
- El registro de composición agrega proveedores/controladores a `AppModule`; conserva controladores y reglas actuales de Fundamentos, identidad y progreso.

## Contratos HTTP

Todas las respuestas satisfactorias utilizan `{data: ...}`. Listados de cursos: `{items,total,page,limit}`. Query: `search` máximo 120 caracteres, `category` máximo 80, `page` 1–10000, `limit` 1–50. El estado es filtro exclusivo ADMIN. Payloads con campos ajenos al contrato se rechazan.

| Método / ruta bajo `/api/v1` | Permiso | Operación |
|---|---|---|
| GET `/courses` | Público | Solo publicados y gestionados por el catálogo |
| GET `/courses/:slug` | Público | 404 para borradores, archivados o slug inexistente |
| GET `/admin/courses` | ADMIN | Publicados, borradores, archivados y registros previos |
| GET `/admin/courses/:id` | ADMIN | Detalle y número agregado de rutas que lo contienen |
| POST `/admin/courses` | ADMIN | Crea DRAFT; no admite publicar en la creación |
| PATCH `/admin/courses/:id` | ADMIN | Metadatos completos, `revision` y estado DRAFT/PUBLISHED |
| DELETE `/admin/courses/:id` | ADMIN | `{revision}`; archiva, nunca borra curso ni lecciones |
| POST `/admin/courses/:id/restore` | ADMIN | `{revision}`; restaura como DRAFT |
| GET `/me/learning-paths` | STUDENT | Rutas del actor de sesión, activa primero |
| GET `/me/learning-paths/:id` | STUDENT propietario | 404 seguro para una ruta ajena |
| POST `/me/learning-paths` | STUDENT | `{title,courseIds,active}` |
| PATCH `/me/learning-paths/:id` | STUDENT propietario | Mismo payload más `revision` |
| DELETE `/me/learning-paths/:id` | STUDENT propietario | `{revision}`; solo elimina selección y orden |

Errores: 400 validación; 401 sin sesión; 403 rol/origen; 404 recurso no disponible o ajeno; 409 revisión obsoleta, slug duplicado o límite de rutas; 429 límite de escrituras; 500/503 se presentan como fallo con posibilidad de reintento, nunca catálogo vacío exitoso.

## Datos de curso

Campos editables: `title`, `summary`, `description`, `category`, `skills`, `position`, `cover`, `contentKind`, `assignments`. `slug` se elige al crear y permanece estable; `id` es UUID inmutable. `revision` sube en cada escritura. `published` histórico se mantiene sincronizado con `status` para compatibilidad.

`contentKind`: LEGACY_MODULE / SCRUM / CTFL / CURATED. Las asignaciones tienen `{kind,ref}` y apuntan a módulos existentes, `equipo-scrum` o `istqb-ctfl`. Un curso CURATED admite varias asignaciones sin duplicados. Publicar requiere resumen y al menos una referencia válida/navegable. No se copian ni editan clases desde este panel.

Portadas: únicamente paths locales `/course-covers/<nombre>.(svg|png|webp|jpg)`; sin URLs remotas arbitrarias. La primera entrega usa un recurso visual de fallback en las tarjetas. Los textos se renderizan escapados por React; no se permite HTML ejecutable.

## Seguridad y concurrencia

Se reutilizan SessionGuard, RolesGuard y OriginGuard. No se acepta `userId` en payloads de rutas. La corrección de MFA y la identidad del actor siguen dependiendo de la autenticación existente. Cambiar la URL de retorno no autentica: solo se permite `/learning-paths` con un `add` UUID opcional; dominios externos, rutas ADMIN y parámetros arbitrarios se descartan. Los desafíos de MFA/contraseña continúan antes de la redirección final.

Las escrituras se limitan adicionalmente a 60/minuto por actor y proceso. Es una protección local acotada; para un límite distribuido global se necesita la política de infraestructura correspondiente, fuera de esta entrega.

ADMIN bloquea la fila y comprueba `revision`; una edición vieja devuelve 409. Una ruta bloquea a su propietario antes de cambiar orden o activación. Solo una ruta puede estar activa por usuario, respaldado por índice único parcial. Añadir requiere curso publicado; un curso ya asociado que luego se archiva puede conservarse o retirarse, siempre rotulado «No disponible».

Auditoría: `admin_audit_events`, actor, acción COURSE_*, fecha y metadatos permitidos antes/después. No se guardan credenciales, cookies, respuestas MFA ni tokens.

## Guía ADMIN

1. Entrar mediante el flujo actual, incluido MFA cuando corresponda.
2. Abrir **Mi cuenta → Gestionar cursos**. La gestión de estudiantes existente sigue accesible desde Mi cuenta.
3. Agregar título/slug/resumen/categoría y referencias; guardar borrador.
4. Revisar el contenido asignado; elegir Publicado y confirmar el cambio de visibilidad.
5. Editar y guardar. Ante 409, recargar y revisar los cambios de la otra edición; no reintentar automáticamente una sobrescritura.
6. Archivar requiere confirmación y conserva relaciones/progreso. Restaurar deja el curso en borrador; publicar es otra decisión explícita.

## Rutas personales y navegación

Home y `/courses` comparten `CourseCatalog`. El menú muestra Cursos, Mi cuenta y búsqueda; la búsqueda móvil usa diálogo nativo con Escape y retorno de foco. No hay árbol, CTA persistente de login ni porcentaje de 24 semanas en el menú.

Desde una ficha se añade un curso a `/learning-paths`; un visitante pasa por login con retorno permitido. El estudiante crea varias rutas, usa botones Subir/Bajar accesibles, retira cursos sin borrar progreso y decide cuál activar. Por defecto hay hasta 10 rutas; `CATALOG_MAX_PATHS` permite entre 1 y 50. Cada ruta admite 1–24 cursos sin duplicados.

No se inventa un porcentaje global para mezclar Scrum, CTFL y semanas. Los cursos de módulos muestran su propio avance; Scrum conserva introducción/quiz y CTFL remite a sus resultados reales. La siguiente actividad del Home se limita a un curso publicado de la ruta activa, nunca a una secuencia fija ni a cursos retirados.

## Compatibilidad

- `/modules` redirige a `/courses`; los seis IDs conservados redirigen a su ficha publicada.
- Los módulos retirados o un curso heredado no publicado llevan a `/legacy/modules/:id`, no indexable y con control de sesión/historial. ADMIN puede revisar; estudiantes necesitan formación previa registrada.
- `/api/v1/modules*` permanece; no se renumeran semanas ni claves de quizzes.
- `/study/*`, `/practice/*`, `/scrum`, `/certification/istqb`, MFA y guardado siguen usando sus experiencias existentes.
- Mi cuenta conserva acceso a recursos/progreso histórico y a los módulos retirados para cuentas con historial.

## Pruebas y entorno

Las pruebas de catálogo utilizan PGlite, PostgreSQL embebido local, y los controladores/guards/repositorios reales. El servidor de `tests/fixtures/catalog-server.mjs` contiene identidades y sesiones sintéticas solo para pruebas; no está registrado en `AppModule`, escucha en loopback y rechaza modo producción. No representa validación de credenciales reales ni sustituye una revisión de staging.

Comandos: `pnpm check`; `pnpm --filter @qapath/web exec playwright test -c playwright.catalog.config.ts`. La campaña de navegador utiliza puertos 3017/4017 y un build local con `API_INTERNAL_URL` / `API_PROXY_TARGET` apuntando al fixture. No reutilizar esas variables de prueba en un despliegue real.
