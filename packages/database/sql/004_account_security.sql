-- Security hardening is ADDITIVE; pre-existing accounts must verify email.
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified_at timestamptz;
ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled boolean NOT NULL DEFAULT false;
-- Cuentas existentes con contraseñas entregadas por administrador deberán cambiarlas.
UPDATE users SET must_change_password = true, updated_at = now()
WHERE role = 'ADMIN' OR (role = 'STUDENT' AND id IN (SELECT target_user_id FROM admin_audit_events WHERE action = 'STUDENT_CREATED'));
-- Secure login/2FA challenges. No raw tokens stored.
CREATE TABLE IF NOT EXISTS auth_challenges (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 token_hash varchar(64) NOT NULL UNIQUE,expires_at timestamptz NOT NULL,
 attempts integer NOT NULL DEFAULT 0,consumed_at timestamptz,created_at timestamptz NOT NULL DEFAULT now(),
 CONSTRAINT challenge_attempts CHECK(attempts BETWEEN 0 AND 5)
);
CREATE INDEX IF NOT EXISTS auth_challenges_user_idx ON auth_challenges(user_id,expires_at);
CREATE TABLE IF NOT EXISTS email_verification_tokens (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 token_hash varchar(64) NOT NULL UNIQUE,expires_at timestamptz NOT NULL,
 consumed_at timestamptz,created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS verify_tokens_user_idx ON email_verification_tokens(user_id,created_at DESC);
CREATE TABLE IF NOT EXISTS user_mfa_credentials (
 user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
 secret_ciphertext text,pending_ciphertext text,pending_until timestamptz,
 last_used_step bigint NOT NULL DEFAULT -1,enabled_at timestamptz,
 updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE IF NOT EXISTS mfa_recovery_codes (
 user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 code_hash varchar(64) NOT NULL,used_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,code_hash)
);
CREATE INDEX IF NOT EXISTS mfa_recovery_unused_idx ON mfa_recovery_codes(user_id) WHERE used_at IS NULL;
-- Never store passwords, raw OTP, raw tokens or raw recovery codes in audit details.
CREATE INDEX IF NOT EXISTS users_email_verified_idx ON users(email_verified_at);
CREATE OR REPLACE VIEW vw_student_security_status AS
SELECT id AS student_id,email,is_active,email_verified_at IS NOT NULL AS email_verified,
 must_change_password,mfa_enabled,created_at FROM users WHERE role='STUDENT';
