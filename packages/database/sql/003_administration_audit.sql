-- QAPath Academy v5: histórico aditivo. Nunca modificar 001/002 ya aplicadas.
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE users ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();
CREATE INDEX IF NOT EXISTS users_role_status_idx ON users(role,is_active,created_at DESC);
CREATE INDEX IF NOT EXISTS student_progress_updated_idx ON student_progress(updated_at DESC);

-- Auditoría de identidad/administración: jamás almacenar contraseñas ni tokens.
CREATE TABLE IF NOT EXISTS admin_audit_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
 target_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
 action varchar(64) NOT NULL,
 details jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT admin_audit_details_object CHECK (jsonb_typeof(details)='object')
);
CREATE INDEX IF NOT EXISTS admin_audit_target_idx ON admin_audit_events(target_user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS admin_audit_actor_idx ON admin_audit_events(actor_user_id,created_at DESC);

-- Event log de progreso; el JSON actual sigue en student_progress como estado canónico.
CREATE TABLE IF NOT EXISTS student_progress_events (
 id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
 user_id uuid NOT NULL REFERENCES users(id) ON DELETE RESTRICT,
 revision integer NOT NULL,
 action varchar(40) NOT NULL,
 details jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT progress_events_revision_positive CHECK (revision >= 1),
 CONSTRAINT progress_events_details_object CHECK (jsonb_typeof(details)='object'),
 CONSTRAINT progress_events_unique_revision UNIQUE(user_id,revision)
);
CREATE INDEX IF NOT EXISTS student_progress_events_user_idx ON student_progress_events(user_id,created_at DESC);

-- Vista operativa con conteo de avance de 24 semanas, sin exponer notas ni hashes.
CREATE OR REPLACE VIEW vw_student_progress_summary AS
SELECT u.id AS student_id,u.email,u.is_active,u.created_at,
       COALESCE(jsonb_array_length(CASE WHEN jsonb_typeof(sp.state->'weeks')='array' THEN sp.state->'weeks' ELSE '[]'::jsonb END),0) AS completed_weeks,
       COALESCE(jsonb_array_length(CASE WHEN jsonb_typeof(sp.state->'read')='array' THEN sp.state->'read' ELSE '[]'::jsonb END),0) AS read_weeks,
       LEAST(100,ROUND(COALESCE(jsonb_array_length(CASE WHEN jsonb_typeof(sp.state->'weeks')='array' THEN sp.state->'weeks' ELSE '[]'::jsonb END),0)*100.0/24))::integer AS progress_percent,
       COALESCE(sp.revision,0) AS revision,sp.updated_at AS last_progress_at
FROM users u LEFT JOIN student_progress sp ON sp.user_id=u.id
WHERE u.role='STUDENT';

-- Proyección relacional consultable de semanas completadas.
CREATE OR REPLACE VIEW vw_student_completed_weeks AS
SELECT u.id AS student_id,u.email,week.number::integer AS week_number,sp.updated_at
FROM users u JOIN student_progress sp ON sp.user_id=u.id
CROSS JOIN LATERAL jsonb_array_elements_text(
 CASE WHEN jsonb_typeof(sp.state->'weeks')='array' THEN sp.state->'weeks' ELSE '[]'::jsonb END
) AS week(number)
WHERE u.role='STUDENT' AND week.number ~ '^[0-9]+$' AND week.number::integer BETWEEN 1 AND 24;

-- Proyección consultable de las mejores notas guardadas por módulo.
CREATE OR REPLACE VIEW vw_student_quiz_scores AS
SELECT u.id AS student_id,u.email,score.key AS module_id,score.value::numeric AS score
FROM users u JOIN student_progress sp ON sp.user_id=u.id
CROSS JOIN LATERAL jsonb_each_text(
 CASE WHEN jsonb_typeof(sp.state->'quizzes')='object' THEN sp.state->'quizzes' ELSE '{}'::jsonb END
) AS score(key,value)
WHERE u.role='STUDENT' AND score.value ~ '^[0-9]+([.][0-9]+)?$';
