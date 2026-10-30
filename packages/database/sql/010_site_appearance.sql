-- SPEC-UX-310 · Apariencia del Home administrable. Aditiva: no toca usuarios, progreso ni contenido académico.
CREATE TABLE IF NOT EXISTS site_appearance_settings (
  id varchar(32) PRIMARY KEY CHECK (id = 'home'),
  draft jsonb CHECK (draft IS NULL OR jsonb_typeof(draft) = 'object'),
  draft_revision integer NOT NULL DEFAULT 0 CHECK (draft_revision >= 0),
  draft_updated_at timestamptz,
  draft_updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  published jsonb CHECK (published IS NULL OR jsonb_typeof(published) = 'object'),
  published_revision integer NOT NULL DEFAULT 0 CHECK (published_revision >= 0),
  published_at timestamptz,
  published_by uuid REFERENCES users(id) ON DELETE SET NULL
);
INSERT INTO site_appearance_settings (id) VALUES ('home') ON CONFLICT (id) DO NOTHING;
CREATE TABLE IF NOT EXISTS site_appearance_versions (
  setting_id varchar(32) NOT NULL REFERENCES site_appearance_settings(id) ON DELETE CASCADE,
  version integer NOT NULL CHECK (version >= 1),
  action varchar(16) NOT NULL CHECK (action IN ('PUBLISHED','RESTORED')),
  config jsonb NOT NULL CHECK (jsonb_typeof(config) = 'object'),
  actor_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (setting_id, version)
);
