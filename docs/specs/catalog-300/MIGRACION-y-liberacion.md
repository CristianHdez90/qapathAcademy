# Migración 008 y liberación controlada

Estado: preparada para revisión; ejecutada únicamente en PostgreSQL embebido de pruebas. No se consultó ni migró producción y no se creó un despliegue.

## Cambios aditivos

`008_course_catalog.sql` agrega metadatos, estado, revisión y marcadores de catálogo/semilla a `courses`. Conserva UUID, slug, filas y relaciones anteriores. Añade `course_content`, `learning_paths` y `learning_path_courses`; no modifica `student_progress.state`, lecciones, historial ni las migraciones 001–007.

La semilla crea los ocho cursos cuando faltan. `ON CONFLICT(slug) DO NOTHING` conserva títulos y decisiones administrativas existentes. `catalog_seeded` evita restaurar asignaciones iniciales cuando se repite la semilla después de una edición ADMIN. `cicd`/`portafolio` se retiran del catálogo mediante archivado inicial, sin borrar sus materiales o avances. Registros desconocidos anteriores no se publican automáticamente en la nueva superficie; siguen disponibles para inventario ADMIN.

## Revisión previa obligatoria en una copia de preproducción

1. Confirmar migraciones aplicadas y obtener respaldo verificable de `courses`, `lessons`, `learning_progress`, `student_progress`, usuarios y auditoría. No se ha realizado ese respaldo en esta tarea por no disponer de una copia autorizada de preproducción.
2. Inventariar IDs/slugs, `published` y relaciones existentes. Resolver colisiones y revisar cursos con metadatos personalizados; la semilla no los sobrescribe para forzar una apariencia inicial.
3. Revisar SQL y checksum del nuevo archivo. Ejecutar el runner solo en la copia autorizada, repetir semilla y comparar conteos/IDs y huellas de estados académicos.
4. Verificar ocho publicaciones iniciales, asignaciones y rutas navegables. Si existían cursos homónimos despublicados o con títulos distintos, revisar sus metadatos/publicación explícitamente mediante ADMIN; no sobrescribirlos a ciegas.
5. Probar concurrencia, archivo/restauración, aislamiento y acceso histórico con cuentas de prueba y sesiones/MFA reales de staging.
6. Revisar evidencias automatizadas, capturas, accesibilidad humana y limitaciones de la línea base de Claude. Integrar cambios compartidos por revisión, no copiando todo el checkout ni restaurando archivos desde HEAD.
7. Aprobar PR, preview y posteriormente producción mediante decisiones separadas. El servidor no autoejecuta esta migración al iniciar.

## Reversión

Revertir presentación/endpoints a la versión anterior si se detecta regresión. Conservar columnas, tablas y selecciones nuevas; no usar DROP, truncado o restauración indiscriminada de `student_progress`. El contenido legacy JSON y sus APIs permanecen para compatibilidad. Al reactivar el catálogo nuevo, los datos administrativos y rutas siguen presentes.

La revisión de una reversión debe considerar visibilidad de cursos y clientes de ambas versiones. No prometer reversión automática de cambios administrativos o de escrituras de alumnos. Mantener el respaldo y registrar actor/decisión.

## Coordinación con Fundamentos

El worktree contiene una copia local para comprobar coexistencia; no se modificó la carpeta donde trabaja Claude. No se editaron `foundation-study`, el contenido de sus tarjetas, reglas académicas ni su motor de minitests. Los cambios compartidos se limitan al catálogo/navegación, exportaciones y composición API. Se incorporó únicamente la corrección exacta de una aserción ya hecha por Claude y se regeneró el árbol a partir de sus datos actuales.

Antes de integrar, comparar nuevamente la línea base porque Claude continúa trabajando. No atribuir los 111 archivos locales preexistentes a SPEC-CATALOG-300 ni incluirlos indiscriminadamente en un commit. Los manifiestos de esta carpeta permiten distinguir su origen.
