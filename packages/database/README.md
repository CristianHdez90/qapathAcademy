# PostgreSQL + Drizzle — implementación activa en QAPath 4.0

`src/schema.ts`: definición de tablas Drizzle; `src/client.ts`: conexión pool limitada.

**Fuente canónica de migraciones**: SQL revisado en `sql/001_initial.sql` y `sql/002_identity_and_progress.sql`.

```powershell
# En Windows desde la raíz
Copy-Item apps/api/.env.example apps/api/.env
# Editar credenciales si corresponde
pnpm.cmd db:migrate
```

`db:migrate` ejecuta `scripts/migrate.mjs`, que hace transacciones, bloqueo PostgreSQL por migración y registra checksums. No aplicar `001_initial.sql` manualmente y después ejecutar el runner sin baselining. No utilizar `drizzle-kit push` para producción. El comando `db:generate` está disponible solo para evaluar diferencias, y no sustituye las migraciones SQL canónicas.

Progreso: `student_progress` JSONB versionado con FK a `users`, índice PK por usuario. Sesiones: tabla separada con tokens SHA-256 y vencimiento. No se incluye ninguna contraseña de producción.
