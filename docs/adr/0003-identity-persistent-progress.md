# ADR-0003 — Identidad, sesiones y persistencia del progreso

**Estado:** Aceptada, 2026-10-23.

## Contexto
El progreso de QAPath 3.0 era local. Era necesario agregar estudiantes autenticados, RBAC y sincronización multidispositivo sin acoplar Domain a Nest/Drizzle.

## Decisión
- Registro público solo STUDENT; otros roles se asignan mediante operaciones administrativas auditadas (pendiente de interfaz).
- Sesiones opacas, revocables, hash de token persistido en PostgreSQL y cookie HttpOnly del origen web; no JWT auto-contenido para el navegador.
- `student_progress` JSONB por estudiante con comandos atómicos en transacciones SQL; los grades se calculan en servidor.
- Frontend separado por API REST; el dominio expone interfaces, infra implementa adaptadores.

## Consecuencias
- Una lectura adicional a PostgreSQL por petición autenticada; usar pooler y observabilidad.
- El progreso anterior del navegador solo se migra con confirmación del estudiante.
- Se requiere gestionar migraciones, correos verificados, rate limit distribuido y privacidad antes de lanzamiento público.
