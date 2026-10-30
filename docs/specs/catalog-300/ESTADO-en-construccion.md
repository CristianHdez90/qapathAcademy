# Estado «En construcción» de los cursos

Fecha: 2026-10-29. Solicitud del responsable: Fundamentos del Testing es el único curso con el contenido terminado. El resto debe mostrarse como «En construcción, muy pronto estará listo…».

## Comportamiento

- La migración aditiva `011_course_coming_soon.sql` agrega `courses.coming_soon` (por defecto `false`). Deja marcados los cursos publicados del catálogo **excepto `fundamentos`**.
- **Catálogo:** el curso sigue visible y aparece en la búsqueda y en los filtros. Muestra el aviso «En construcción · Muy pronto estará listo…» y el botón «Muy pronto».
- **Índice del curso:** muestra un panel «En construcción» y oculta las clases, las prácticas y los accesos a Scrum o CTFL. Se puede añadir a la ruta.
- **Administración:** en `Gestionar cursos → Editar`, la casilla «En construcción» activa o desactiva el estado. Se guarda con la auditoría y la revisión optimista existentes, y la tabla muestra la etiqueta «En construcción».
- **Lo que no cambia:** el progreso, las notas, las rutas y las URLs `/study/N` existentes. Ninguna se borra ni se bloquea.

## Validación

- Pruebas Node: 244/244, con la integración del catálogo verificando qué cursos están en construcción.
- `catalog-300` 7/7 y Fundamentos v2 10/10. Se ajustaron las aserciones para los cursos en construcción.
- Recorrido manual: 7 cursos en construcción y Fundamentos disponible. Al desmarcar QA Manual desde ADMIN, el curso muestra sus clases.
