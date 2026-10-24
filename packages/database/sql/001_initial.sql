-- Migración canónica 001 para el ejecutor scripts/migrate.mjs.
-- No aplicar manualmente si se utilizará el ejecutor sin realizar baselining.
CREATE TYPE user_role AS ENUM ('STUDENT','INSTRUCTOR','ADMIN');
CREATE TABLE users (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 email varchar(254) NOT NULL UNIQUE,
 role user_role NOT NULL DEFAULT 'STUDENT',
 created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE courses (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 slug varchar(100) NOT NULL UNIQUE,
 title varchar(250) NOT NULL,
 published boolean NOT NULL DEFAULT false
);
CREATE TABLE lessons (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 course_id uuid NOT NULL REFERENCES courses(id),
 week integer NOT NULL,
 title varchar(250) NOT NULL,
 body text NOT NULL DEFAULT '',
 CONSTRAINT lesson_course_week_idx UNIQUE(course_id,week)
);
CREATE TABLE learning_progress (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 user_id uuid NOT NULL REFERENCES users(id),
 lesson_id uuid NOT NULL REFERENCES lessons(id),
 completed boolean NOT NULL DEFAULT false,
 completed_at timestamptz,
 CONSTRAINT progress_user_lesson_idx UNIQUE(user_id,lesson_id)
);
