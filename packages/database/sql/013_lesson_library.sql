-- Biblioteca de contenido: las lecciones son independientes y se asocian a cursos como «Contenido asignado» (kind LESSON).
-- Aditiva y recuperable: eliminar una lección marca deleted_at (se puede restaurar); nunca toca progreso, notas ni rutas.
ALTER TABLE course_lessons ALTER COLUMN course_id DROP NOT NULL;
ALTER TABLE course_lessons ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE course_content DROP CONSTRAINT IF EXISTS course_content_kind_check;
ALTER TABLE course_content ADD CONSTRAINT course_content_kind_check CHECK(kind IN ('LEGACY_MODULE','SCRUM','CTFL','LESSON'));
-- Las lecciones creadas por curso (012) pasan a ser contenido asignado de ese curso, después de su contenido actual.
INSERT INTO course_content(course_id,kind,content_ref,position)
 SELECT l.course_id,'LESSON',l.id::text,1000+l.position FROM course_lessons l
 WHERE l.course_id IS NOT NULL AND l.status<>'ARCHIVED'
 ON CONFLICT (course_id,kind,content_ref) DO NOTHING;
-- Las archivadas pasan a «Eliminadas» (recuperables).
UPDATE course_lessons SET deleted_at=updated_at,status='DRAFT' WHERE status='ARCHIVED' AND deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS course_lessons_library_idx ON course_lessons(deleted_at,updated_at DESC);
