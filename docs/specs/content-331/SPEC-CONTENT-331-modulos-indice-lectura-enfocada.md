# SPEC-CONTENT-331 · Módulos propios, índice fiel y enlaces a lectura enfocada

## Objetivo
Mejorar la creación y edición de cursos (SPEC-CONTENT-330) para que el contenido editable se vea y funcione igual que los cursos base.

## Requisitos
| # | Requisito | Implementación |
|---|-----------|----------------|
| 1 | El índice de los cursos editables es fiel a la estructura de los demás cursos (HTML, CSS, JS) | `OutlineIndex` reproduce `ModuleDetail`: `page-heading` (eyebrow `CURSO · área`, h1, resumen y píldora «N semanas»), `section-head compact` «CONTENIDO DE ESTUDIO / Clases y actividades» con «Comenzar/Continuar», `lesson-list` → `lesson-row` (estado, `SEMANA 0N`, h3 ↗, `module-chapters` con «Capítulo 0N · título» y avance). **Un solo índice**: las lecciones de la biblioteca aparecen al final como fila «Lecturas complementarias» (también en cursos con módulo base). |
| 2 | Cada capítulo de la semana enlaza a la lectura enfocada | `/courses/:slug/learn?chapter=<id>`; `?card=<id>` abre la tarjeta exacta. |
| 3 | La lectura carga en modo enfocado | El lector usa `.focused-study` (oculta la barra lateral), `focused-header`, `focused-card`, `focused-pager`, barra `focused-tools` y `StudyDialog` para «Menú del curso» y «Avance del curso» (clases de `course-study-menu`). MariBug se abre como diálogo de estudio (`useFocusedStudyMode` reconoce `/courses/*/learn`). |
| 4 | Agregar y editar Módulos y experiencias | Módulos propios (`content_modules` + `module_outlines`, migración 015): crear, renombrar, describir, eliminar (recuperable) y restaurar en **/admin/modules** y desde «Contenido asignado» del curso. Su contenido usa el mismo editor (semanas → capítulos → tarjetas → minitest). Se asignan a cualquier curso (`course_content.kind = 'MODULE'`) y se muestran después del contenido propio del curso. |
| 5 | Slug (URL) editable | Editable con confirmación (avisa que la URL anterior deja de funcionar). Los cursos del catálogo base lo conservan (la API responde 409). Slug repetido → 409. |
| 6 | Resumen de la semana desde .md con hipervínculos a capítulos/tarjetas | El resumen admite Markdown (hasta 8 000 caracteres), botón «Cargar .md del índice», ayuda de sintaxis, lista de capítulos disponibles, aviso de enlaces sin resolver y vista previa. |

## Sintaxis de enlaces (resumen de semana y tarjetas)
- `[Tema](capitulo:3)` · `[Tema](tarjeta:12)`: por número (dentro del curso o del módulo).
- `[Tema](capitulo:c1)` · `[Tema](#k4)`: por identificador.
- `[Tema](C03-tema.md)`: la tarjeta cargada desde ese .md (campo «Archivo de origen», se completa al cargar el .md). Si no hay tarjeta con ese origen, `C03` = capítulo 3.
- `[Tema](Título del capítulo)`: por título (sin tildes ni mayúsculas).
- Un enlace .md que no se resuelve se muestra como texto, nunca como enlace roto. Los enlaces http(s) se abren en otra pestaña.

## API
- `GET|POST /admin/modules`, `GET|PATCH|DELETE /admin/modules/:id`, `POST /admin/modules/:id/restore` (ADMIN, revisión optimista, auditoría `MODULE_*`).
- `/admin/modules/:id/outline` (mismas operaciones que `/admin/courses/:id/outline`, incluida la copia de Fundamentos).
- `GET /courses/:slug/outline` combina el contenido propio publicado y los módulos asignados publicados. Los ids de un módulo se prefijan (`m` + 6 hex + `_`) para que el avance no choque entre módulos.

## Datos y despliegue
- Migración **015_content_modules.sql** (aditiva). Ejecutar `pnpm db:migrate` en local y en Neon **antes** de desplegar.
- Eliminar un módulo lo quita de los cursos; su contenido y el avance de los estudiantes se conservan.

## Pruebas
- `tests/content-modules.integration.test.mjs`, `tests/course-outline*.test.mjs` (dueño curso/módulo).
- E2E `apps/web/tests/e2e/modules-331.spec.ts` (+ `outline-330`, `study-content-320` actualizados). Evidencia en `evidence/`.
