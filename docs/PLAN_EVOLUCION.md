# Hoja de ruta QAPath Academy 4.0

## Implementado como código (iteración v4)
- Clean Architecture + Hexagonal + DDD, web Next.js 16 y API NestJS 11 separadas.
- 8 módulos, 24 semanas, 72 secciones, Scrum, cuestionarios y ejercicios.
- Registro e inicio/cierre de sesión, cookies HttpOnly y RBAC STUDENT/INSTRUCTOR/ADMIN.
- PostgreSQL/Drizzle con puertos y adaptadores, migraciones versionadas.
- Progreso real por estudiante: semanas, lecturas, notas, laboratorios, evaluaciones; importación voluntaria del navegador.
- Pruebas aisladas, E2E de autenticación/progreso y pipeline con PostgreSQL en CI.

## Requisitos antes del despliegue a público
- Conectar y probar la base de datos administrada, crear política de backups/restores y observabilidad.
- Verificación de correo, restablecimiento de credenciales, antibrute force distribuido, auditoría.
- Pruebas E2E reales en Windows/CI + Pentesting OWASP ASVS/SAST antes de admitir cuentas.
- Definir términos de servicio, privacidad y retención de datos de estudiantes.

## Evolución funcional
- Backoffice de instructores, edición y publicación de cursos, certificados fiables, prerequisitos.
- Informe de aprendizaje por cohorte, accesibilidad WCAG 2.2 AA, alertas y monitoreo.
- Cache de contenido y métricas de API.
