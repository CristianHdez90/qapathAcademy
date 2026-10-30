# SPEC-CONTENT-330 · Contenido del curso en modo enfocado (crear, editar, eliminar con vista previa)

## Qué resuelve
El ADMIN arma y mantiene el contenido de cualquier curso como **Semanas → Capítulos → Tarjetas**, con un **minitest opcional por capítulo**, y ve en vivo cómo lo verá el estudiante. Fundamentos puede importarse como **copia editable**: lo publicado actual no cambia hasta publicar la nueva versión.

## Administración (`/admin/courses/:id/content`)
- Árbol a la izquierda: ＋ Semana / ＋ Capítulo / ＋ Tarjeta, subir/bajar y eliminar (con confirmación).
- Tarjeta: título, texto Markdown (izquierda) y gráficas .mmd/.json/.svg (derecha) por arrastre o selección; un .md arrastrado se agrega al texto. Vista previa en vivo.
- Minitest: preguntas de opción múltiple (2–6 opciones), respuesta correcta y explicación. Aprobación 70 %.
- Borrador con revisión optimista (409 si cambió), **Guardar borrador** (Ctrl+S), **Publicar**, **Vista previa del curso** (lector completo, sin guardar avance), **Deshacer cambios**, **Descartar borrador**, **Despublicar** (el borrador se conserva) e **Importar copia de Fundamentos**.
- Accesos: «Contenido» en Gestionar cursos, botón en el editor del curso y «Editar contenido» en la página del curso (ADMIN).

## Estudiante
- `/courses/:slug`: si hay contenido publicado, el índice «Clases y actividades» muestra semanas y capítulos con avance y el botón Comenzar/Continuar.
- `/courses/:slug/learn?chapter=…`: una tarjeta a la vez (texto izquierda, gráficas derecha), ← → del teclado, Menú del curso, Avance del curso y MariBug (abre el asistente con el contexto de la tarjeta). Al final de cada capítulo, su minitest con retroalimentación.
- El avance (tarjetas leídas y mejor nota por capítulo) se guarda solo para estudiantes con sesión; las respuestas correctas nunca se envían antes de calificar.

## API
- ADMIN: `GET /admin/courses/:id/outline`, `PUT …/outline/draft`, `POST …/outline/publish|unpublish|discard|import-fundamentals`.
- Público: `GET /courses/:slug/outline` (sin respuestas), `POST /courses/:slug/outline/chapters/:chapterId/grade` (sin guardar).
- Estudiante: `GET /me/courses/:slug/outline-progress`, `POST …/read`, `POST …/chapters/:chapterId/grade`.
- Auditoría: `OUTLINE_DRAFT_SAVED`, `OUTLINE_PUBLISHED`, `OUTLINE_UNPUBLISHED`, `OUTLINE_DRAFT_DISCARDED`, `OUTLINE_FUNDAMENTALS_IMPORTED`.

## Datos
Migración aditiva `014_course_outlines.sql`: `course_outlines` (borrador/publicado por curso) y `course_outline_progress`. No modifica el progreso existente; al publicar el contenido de Fundamentos, su avance anterior no se transfiere (el editor lo advierte).

## Verificación
`tests/course-outline.test.mjs`, `tests/course-outline.integration.test.mjs`, `apps/web/tests/e2e/outline-330.spec.ts`.
