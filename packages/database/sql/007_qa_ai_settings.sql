CREATE TABLE qa_ai_settings (
 id smallint PRIMARY KEY CHECK (id = 1),
 enabled boolean NOT NULL DEFAULT false,
 provider varchar(12) NOT NULL CHECK (provider IN ('groq','gemini')),
 model varchar(120) NOT NULL,
 base_url varchar(150) NOT NULL,
 temperature double precision NOT NULL CHECK (temperature >= 0 AND temperature <= 1),
 max_output_tokens integer NOT NULL CHECK (max_output_tokens BETWEEN 256 AND 8192),
 secrets jsonb NOT NULL DEFAULT '{}'::jsonb CHECK (jsonb_typeof(secrets) = 'object'),
 revision integer NOT NULL DEFAULT 1 CHECK (revision >= 1),
 updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
 updated_at timestamptz NOT NULL DEFAULT now()
);
