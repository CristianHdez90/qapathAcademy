# ADR-0002: Evolución de progreso local a persistencia autenticada
Estado: Propuesto

## Decisión
Mantener el adaptador localStorage del MVP. Preparar PostgreSQL/Drizzle con tablas users, courses, lessons, learning_progress pero NO exponer operaciones de progreso por userId sin identidad verificada.

## Evolución
Implementar proveedor de identidad, verificar sesiones en backend, autorización por usuario, módulo de persistencia Postgres a través de ProgressRepository, migración versionada de JSON y tests de aislamiento multiusuario.
