# SPEC-CONTENT-321 · Biblioteca de contenido y «Contenido asignado»

- Las lecciones son independientes del curso: se crean, editan, publican, eliminan (recuperable) y restauran en **Administración → Contenido** (`/admin/content`).
- En **Gestionar cursos → Editar curso → Contenido asignado** se combinan los módulos existentes y las lecciones de la biblioteca (`kind: LESSON`, `ref: id`). Desde ahí también se crea («＋ Crear lección nueva», se agrega al índice), edita o elimina una lección.
- **Índice del curso:** el orden de «Contenido asignado» es el que ve el estudiante (↑ ↓, Quitar). Se aplica al guardar el curso.
- Una lección puede asignarse a varios cursos y a cualquier tipo de curso (heredado, Scrum, CTFL o selección).
- Los estudiantes solo ven lecciones **publicadas**, **no eliminadas** y asignadas a un curso visible (no «En construcción»).
- **Eliminar** marca `deleted_at`, quita la lección de los cursos (queda en auditoría `LESSON_DELETED` con los cursos afectados) y la mueve a «Eliminadas». **Restaurar** la devuelve como borrador sin asignar.
- Publicar un curso exige un módulo asignado o al menos una lección publicada.

## Migración
`013_lesson_library.sql` (aditiva): `course_id` pasa a opcional, añade `deleted_at`, permite `LESSON` en `course_content` y convierte las lecciones creadas por curso (012) en contenido asignado de ese curso.

## API
- ADMIN: `GET/POST /admin/lessons`, `GET/PATCH/DELETE /admin/lessons/:id`, `POST /admin/lessons/:id/restore`, `?deleted=true&search=`.
- Público: `GET /courses/:slug/lessons` y `GET /courses/:slug/lessons/:id` (orden del índice).
