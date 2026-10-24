-- QAPath Academy 6.0: consultas de auditoría de seguridad. Solo ADMIN/DBA autorizados.
-- 1. Estado de verificación y MFA de estudiantes
SELECT student_id,email,is_active,email_verified,must_change_password,mfa_enabled,created_at
FROM vw_student_security_status ORDER BY created_at DESC;
-- 2. Administradores sin MFA o correo verificado (deben completar el onboarding)
SELECT id,email,mfa_enabled,email_verified_at,must_change_password
FROM users WHERE role='ADMIN' AND (mfa_enabled=false OR email_verified_at IS NULL OR must_change_password=true);
-- 3. Últimos eventos de seguridad (sin secretos)
SELECT e.created_at,e.action,a.email AS actor,t.email AS objetivo
FROM admin_audit_events e
LEFT JOIN users a ON a.id=e.actor_user_id
LEFT JOIN users t ON t.id=e.target_user_id
WHERE e.action IN ('EMAIL_VERIFICATION_REQUESTED','EMAIL_VERIFIED','INITIAL_PASSWORD_CHANGED','MFA_ENABLED','LOGIN_SUCCESS','LOGIN_FAILURE','MFA_FAILURE')
ORDER BY e.created_at DESC LIMIT 100;
-- 4. Tokens de verificación pendientes, solo conteos (jamás extraer tokens crudos)
SELECT u.email,COUNT(*) FILTER (WHERE e.consumed_at IS NULL AND e.expires_at>NOW()) AS verificaciones_pendientes
FROM users u LEFT JOIN email_verification_tokens e ON e.user_id=u.id GROUP BY u.id,u.email;
-- 5. Desafíos de segundo factor vencidos o agotados
SELECT COUNT(*) AS caducados FROM auth_challenges WHERE expires_at<=NOW() OR attempts>=5;
-- 6. Sesiones activas por usuario
SELECT u.email,COUNT(*) AS sesiones_activas FROM users u JOIN auth_sessions s ON s.user_id=u.id
WHERE s.revoked_at IS NULL AND s.expires_at>NOW() GROUP BY u.id,u.email ORDER BY sesiones_activas DESC;
-- 7. MFA habilitado vs pendiente por rol
SELECT role,COUNT(*) AS total,COUNT(*) FILTER (WHERE mfa_enabled) AS con_mfa,
COUNT(*) FILTER (WHERE email_verified_at IS NULL) AS correo_pendiente
FROM users GROUP BY role ORDER BY role;
-- 8. Códigos de recuperación restantes, sin mostrar hashes
SELECT u.email,COUNT(*) FILTER (WHERE r.used_at IS NULL) AS codigos_disponibles
FROM users u JOIN mfa_recovery_codes r ON r.user_id=u.id GROUP BY u.id,u.email;
