-- SPEC-CONTENT-320 · Contenido de estudio cargado por archivos (.md, .mmd, .json, .svg).
-- Aditiva: no modifica clases, progreso, notas ni rutas existentes. Las lecciones se archivan; los archivos se retiran sin borrarse.
CREATE TABLE IF NOT EXISTS course_lessons (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 course_id uuid NOT NULL REFERENCES courses(id),
 position integer NOT NULL DEFAULT 0,
 title varchar(160) NOT NULL,
 summary varchar(400) NOT NULL DEFAULT '',
 status varchar(16) NOT NULL DEFAULT 'DRAFT' CHECK(status IN ('DRAFT','PUBLISHED','ARCHIVED')),
 revision integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS course_lessons_course_idx ON course_lessons(course_id,status,position);
CREATE TABLE IF NOT EXISTS course_lesson_files (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 lesson_id uuid NOT NULL REFERENCES course_lessons(id),
 kind varchar(16) NOT NULL CHECK(kind IN ('markdown','mermaid','interaction','svg')),
 filename varchar(120) NOT NULL,
 content text NOT NULL,
 size integer NOT NULL CHECK(size>0 AND size<=400000),
 position integer NOT NULL DEFAULT 0,
 created_by uuid REFERENCES users(id) ON DELETE SET NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 retired_at timestamptz
);
CREATE INDEX IF NOT EXISTS course_lesson_files_lesson_idx ON course_lesson_files(lesson_id,position) WHERE retired_at IS NULL;
