-- «¿Olvidaste tu contraseña?»: enlaces de un solo uso (y control de 1 solicitud por minuto). Aditiva.
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash varchar(64) NOT NULL UNIQUE,
  expires_at timestamptz NOT NULL,
  consumed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS password_reset_tokens_user_idx ON password_reset_tokens(user_id, created_at);
