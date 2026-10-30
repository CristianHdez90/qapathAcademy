-- SPEC-CONTENT-331 · Módulos propios: contenido reutilizable (Semanas → Capítulos → Tarjetas) asignable a cualquier curso.
-- Aditiva y recuperable: eliminar un módulo marca deleted_at y lo quita de los cursos; no toca progreso ni notas.
CREATE TABLE IF NOT EXISTS content_modules (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 title varchar(160) NOT NULL,
 summary varchar(1000) NOT NULL DEFAULT '',
 track varchar(80) NOT NULL DEFAULT 'QA',
 revision integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 deleted_at timestamptz
);
CREATE TABLE IF NOT EXISTS module_outlines (
 module_id uuid PRIMARY KEY REFERENCES content_modules(id),
 draft jsonb,
 draft_revision integer NOT NULL DEFAULT 0,
 draft_updated_at timestamptz,
 draft_updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
 published jsonb,
 published_revision integer NOT NULL DEFAULT 0,
 published_at timestamptz
);
ALTER TABLE course_content DROP CONSTRAINT IF EXISTS course_content_kind_check;
ALTER TABLE course_content ADD CONSTRAINT course_content_kind_check CHECK(kind IN ('LEGACY_MODULE','SCRUM','CTFL','LESSON','MODULE'));
