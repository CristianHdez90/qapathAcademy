-- QAPath Academy v5 — consultas para pgAdmin o psql.
-- Solo una cuenta de base de datos de REPORTES con permisos SELECT.
-- No consultar password_hash ni token_hash.

-- 1. Listar estudiantes y estado (sin secretos).
SELECT id,email,is_active,created_at,updated_at
FROM users WHERE role='STUDENT' ORDER BY created_at DESC LIMIT 50;

-- 2. Vista canónica de progreso por estudiante (0 a 24 semanas).
SELECT email,is_active,completed_weeks,read_weeks,progress_percent,revision,last_progress_at
FROM vw_student_progress_summary ORDER BY progress_percent DESC,email;

-- 3. Estudiantes sin avance registrado.
SELECT email,created_at FROM vw_student_progress_summary
WHERE completed_weeks=0 ORDER BY created_at DESC;

-- 4. Promedio y cobertura del programa.
SELECT COUNT(*) AS estudiantes,
 SUM(is_active::int) AS activos,
 ROUND(AVG(progress_percent),1) AS promedio_avance,
 COUNT(*) FILTER (WHERE completed_weeks=24) AS ruta_completa
FROM vw_student_progress_summary;

-- 5. Consultar avance de un estudiante por correo.
SELECT email,completed_weeks,read_weeks,progress_percent,last_progress_at
FROM vw_student_progress_summary WHERE email='estudiante@ejemplo.com';

-- 6. Historial de eventos académicos sin notas privadas.
SELECT u.email,e.revision,e.action,e.details,e.created_at
FROM student_progress_events e JOIN users u ON u.id=e.user_id
WHERE u.email='estudiante@ejemplo.com'
ORDER BY e.id DESC LIMIT 100;

-- 7. Última actividad por estudiante.
SELECT u.email,COUNT(e.id) AS cantidad_eventos,MAX(e.created_at) AS ultimo_evento
FROM users u LEFT JOIN student_progress_events e ON e.user_id=u.id
WHERE u.role='STUDENT' GROUP BY u.id,u.email ORDER BY ultimo_evento DESC NULLS LAST;

-- 8. Historial de cambios administrativos y actor responsable.
SELECT a.id,a.created_at,a.action,
 actor.email AS realizado_por,objetivo.email AS estudiante,a.details
FROM admin_audit_events a
LEFT JOIN users actor ON actor.id=a.actor_user_id
LEFT JOIN users objetivo ON objetivo.id=a.target_user_id
ORDER BY a.id DESC LIMIT 100;

-- 9. Cuentas desactivadas y fecha del último cambio.
SELECT email,updated_at FROM users WHERE role='STUDENT' AND is_active=false ORDER BY updated_at DESC;

-- 10. Actividad académica por día, últimos 30 días.
SELECT date_trunc('day',created_at)::date AS fecha,COUNT(*) AS eventos
FROM student_progress_events
WHERE created_at>=now()-INTERVAL '30 days'
GROUP BY 1 ORDER BY 1 DESC;

-- 11. Puntajes actuales por módulo (las mejores notas).
SELECT u.email,q.key AS modulo,q.value::numeric AS calificacion
FROM student_progress sp JOIN users u ON u.id=sp.user_id,
 LATERAL jsonb_each_text(COALESCE(sp.state->'quizzes','{}'::jsonb)) AS q(key,value)
WHERE u.role='STUDENT' ORDER BY u.email,modulo;

-- 12. Evolución del avance: eventos de cambios de semana por estudiante.
SELECT u.email,e.created_at,e.details->>'value' AS semana,
 e.revision
FROM student_progress_events e JOIN users u ON u.id=e.user_id
WHERE e.action='TOGGLE' AND e.details->>'key'='weeks'
ORDER BY e.created_at DESC LIMIT 100;

-- 13. Semanas completadas por estudiante (vista relacional para JOIN/GROUP BY).
SELECT email,week_number,updated_at FROM vw_student_completed_weeks
WHERE email='estudiante@ejemplo.com' ORDER BY week_number;

-- 14. Calificaciones usando vista de reporte sin consultar JSONB directamente.
SELECT email,module_id,score FROM vw_student_quiz_scores
ORDER BY email,module_id;
