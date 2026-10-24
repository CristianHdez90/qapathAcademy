-- QAPath Academy 6.1 - Consultas SOLO LECTURA para pgAdmin/psql.
-- Ejecutar sobre base de desarrollo; reemplazar el correo de prueba en WHERE.
-- NO seleccionar password_hash, token_hash, secret_ciphertext ni code_hash.

-- 1. Progreso por estudiante, de mayor a menor porcentaje.
SELECT email, is_active, completed_weeks, read_weeks, progress_percent,
       revision, last_progress_at
FROM vw_student_progress_summary
WHERE email LIKE 'qa-e2e-%@example.test'
ORDER BY last_progress_at DESC NULLS LAST;

-- 2. Persistencia JSONB y revisión (solo métricas, sin texto de notas).
SELECT u.email, p.revision, p.updated_at,
       jsonb_array_length(COALESCE(p.state->'weeks','[]'::jsonb)) AS completed_weeks,
       jsonb_array_length(COALESCE(p.state->'read','[]'::jsonb)) AS read_weeks
FROM student_progress p JOIN users u ON u.id=p.user_id
WHERE u.email LIKE 'qa-e2e-%@example.test'
ORDER BY p.updated_at DESC LIMIT 25;

-- 3. Historial de operaciones, preserva secuencia por revisión.
SELECT u.email,e.revision,e.action,e.created_at
FROM student_progress_events e JOIN users u ON u.id=e.user_id
WHERE u.email LIKE 'qa-e2e-%@example.test'
ORDER BY e.created_at DESC,e.id DESC LIMIT 50;

-- 4. Accesos, verificación y eventos administrativos sin secretos.
SELECT coalesce(u.email,'[usuario no disponible]') AS usuario,
       e.action,e.created_at
FROM admin_audit_events e
LEFT JOIN users u ON u.id=e.target_user_id
WHERE u.email LIKE 'qa-e2e-%@example.test'
ORDER BY e.created_at DESC,e.id DESC LIMIT 50;

-- 5. Sesiones por usuario: activas, cerradas o expiradas.
SELECT u.email,
       COUNT(*) FILTER (WHERE s.revoked_at IS NULL AND s.expires_at>now()) AS sesiones_vigentes,
       COUNT(*) FILTER (WHERE s.revoked_at IS NOT NULL) AS sesiones_revocadas,
       COUNT(*) FILTER (WHERE s.expires_at<=now()) AS sesiones_expiradas
FROM users u LEFT JOIN auth_sessions s ON s.user_id=u.id
WHERE u.email LIKE 'qa-e2e-%@example.test'
GROUP BY u.email ORDER BY u.email;

-- 6. MFA y recuperación: únicamente cantidades, nunca códigos ni hashes.
SELECT u.email,u.mfa_enabled,
       COUNT(rc.user_id) FILTER (WHERE rc.used_at IS NULL) AS codigos_disponibles,
       COUNT(rc.user_id) FILTER (WHERE rc.used_at IS NOT NULL) AS codigos_utilizados
FROM users u LEFT JOIN mfa_recovery_codes rc ON rc.user_id=u.id
WHERE u.email LIKE 'qa-e2e-%@example.test'
GROUP BY u.email,u.mfa_enabled ORDER BY u.email;

-- 7. Listado de tablas relevantes del esquema público.
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public' AND table_type='BASE TABLE'
  AND table_name IN ('users','auth_sessions','student_progress','student_progress_events',
                     'admin_audit_events','mfa_recovery_codes','user_mfa_credentials',
                     'auth_challenges','email_verification_tokens')
ORDER BY table_name;
