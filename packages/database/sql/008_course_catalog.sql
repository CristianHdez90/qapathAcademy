-- SPEC-CATALOG-300. Additive; never deletes lessons, users, progress or historical course IDs.
ALTER TABLE courses ADD COLUMN IF NOT EXISTS summary text NOT NULL DEFAULT '';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS description text NOT NULL DEFAULT '';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS category varchar(80) NOT NULL DEFAULT 'QA';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS skills jsonb NOT NULL DEFAULT '[]';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS cover text;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS status varchar(16);
UPDATE courses SET status=CASE WHEN published THEN 'PUBLISHED' ELSE 'DRAFT' END WHERE status IS NULL;
ALTER TABLE courses ALTER COLUMN status SET DEFAULT 'DRAFT';
ALTER TABLE courses ALTER COLUMN status SET NOT NULL;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS content_kind varchar(24) NOT NULL DEFAULT 'CURATED';
ALTER TABLE courses ADD COLUMN IF NOT EXISTS catalog_managed boolean NOT NULL DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS catalog_seeded boolean NOT NULL DEFAULT false;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS revision integer NOT NULL DEFAULT 1;
ALTER TABLE courses ADD COLUMN IF NOT EXISTS created_at timestamptz NOT NULL DEFAULT now();
ALTER TABLE courses ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
DO $$ BEGIN
 IF NOT EXISTS(SELECT 1 FROM pg_constraint WHERE conname='courses_catalog_status_check') THEN
  ALTER TABLE courses ADD CONSTRAINT courses_catalog_status_check CHECK(status IN ('DRAFT','PUBLISHED','ARCHIVED'));
 END IF;
END $$;
CREATE INDEX IF NOT EXISTS courses_catalog_order_idx ON courses(catalog_managed,status,position,slug);
CREATE TABLE IF NOT EXISTS course_content (
 course_id uuid NOT NULL REFERENCES courses(id),
 kind varchar(24) NOT NULL CHECK(kind IN ('LEGACY_MODULE','SCRUM','CTFL')),
 content_ref varchar(100) NOT NULL,
 position integer NOT NULL DEFAULT 0,
 PRIMARY KEY(course_id,kind,content_ref)
);
CREATE TABLE IF NOT EXISTS learning_paths (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES users(id),
 title varchar(120) NOT NULL,
 active boolean NOT NULL DEFAULT false,
 revision integer NOT NULL DEFAULT 1,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS learning_paths_one_active_idx ON learning_paths(user_id) WHERE active;
CREATE INDEX IF NOT EXISTS learning_paths_owner_idx ON learning_paths(user_id,created_at);
CREATE TABLE IF NOT EXISTS learning_path_courses (
 path_id uuid NOT NULL REFERENCES learning_paths(id),
 course_id uuid NOT NULL REFERENCES courses(id),
 position integer NOT NULL,
 PRIMARY KEY(path_id,course_id),UNIQUE(path_id,position)
);
-- A one-time idempotent seed. Existing administrative metadata is never overwritten.
WITH seed(slug,title,summary,category,position,kind,ref) AS (VALUES
 ('fundamentos','Fundamentos del Testing','Comprende calidad, pruebas y decisiones basadas en evidencia.','QA Manual',1,'LEGACY_MODULE','fundamentos'),
 ('manual','QA Manual profesional','Diseña casos, explora riesgos y comunica defectos reproducibles.','QA Manual',2,'LEGACY_MODULE','manual'),
 ('herramientas','HTTP, REST, Postman, DevTools y SQL','Investiga servicios, respuestas y datos con herramientas de QA.','QA Técnico',3,'LEGACY_MODULE','herramientas'),
 ('typescript','JavaScript, TypeScript y Git','Programa comprobaciones y conserva entregas reproducibles.','Programación',4,'LEGACY_MODULE','typescript'),
 ('playwright','Automatización con Playwright','Construye pruebas de navegador mantenibles.','Automatización',5,'LEGACY_MODULE','playwright'),
 ('arquitectura','Framework y automatización API','Organiza un framework y automatiza contratos de servicios.','Automatización',6,'LEGACY_MODULE','arquitectura'),
 ('equipo-scrum','Equipo y Scrum','Aprende cómo colaborar y aportar evidencia en un equipo Scrum.','Trabajo en equipo',7,'SCRUM','equipo-scrum'),
 ('istqb-ctfl','PREPARACIÓN PARA CERTIFICACIÓN — ISTQB Foundation Level · CTFL','Estudia los capítulos y practica con el simulacro de CTFL.','Certificación',8,'CTFL','istqb-ctfl')
)
 INSERT INTO courses(slug,title,summary,description,category,position,content_kind,status,published,catalog_managed)
 SELECT slug,title,summary,summary,category,position,kind,'PUBLISHED',true,true FROM seed
 ON CONFLICT(slug) DO NOTHING;
WITH seed(slug,kind,ref) AS (VALUES
 ('fundamentos','LEGACY_MODULE','fundamentos'),('manual','LEGACY_MODULE','manual'),
 ('herramientas','LEGACY_MODULE','herramientas'),('typescript','LEGACY_MODULE','typescript'),
 ('playwright','LEGACY_MODULE','playwright'),('arquitectura','LEGACY_MODULE','arquitectura'),
 ('equipo-scrum','SCRUM','equipo-scrum'),('istqb-ctfl','CTFL','istqb-ctfl')
)
INSERT INTO course_content(course_id,kind,content_ref,position)
SELECT c.id,s.kind,s.ref,0 FROM seed s JOIN courses c ON c.slug=s.slug WHERE NOT c.catalog_seeded
ON CONFLICT DO NOTHING;
-- Bring existing matching historical courses into the managed catalog without renaming them.
UPDATE courses SET catalog_managed=true WHERE slug IN ('fundamentos','manual','herramientas','typescript','playwright','arquitectura','equipo-scrum','istqb-ctfl') AND NOT catalog_managed;
UPDATE courses SET catalog_seeded=true WHERE slug IN ('fundamentos','manual','herramientas','typescript','playwright','arquitectura','equipo-scrum','istqb-ctfl') AND NOT catalog_seeded;
UPDATE courses SET status='ARCHIVED',published=false,catalog_managed=true WHERE slug IN ('cicd','portafolio') AND NOT catalog_managed;
