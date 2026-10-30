-- SPEC-CONTENT-330 · Contenido del curso en modo enfocado (Semanas → Capítulos → Tarjetas + minitests).
-- Aditiva: borrador y publicado por curso; avance propio por estudiante. No modifica el progreso existente.
CREATE TABLE IF NOT EXISTS course_outlines (
 course_id uuid PRIMARY KEY REFERENCES courses(id),
 draft jsonb,
 draft_revision integer NOT NULL DEFAULT 0,
 draft_updated_at timestamptz,
 draft_updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
 published jsonb,
 published_revision integer NOT NULL DEFAULT 0,
 published_at timestamptz
);
CREATE TABLE IF NOT EXISTS course_outline_progress (
 user_id uuid NOT NULL REFERENCES users(id),
 course_id uuid NOT NULL REFERENCES courses(id),
 read_cards jsonb NOT NULL DEFAULT '[]',
 passed_chapters jsonb NOT NULL DEFAULT '{}',
 updated_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY (user_id,course_id)
);
