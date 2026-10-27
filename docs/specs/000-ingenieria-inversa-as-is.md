# SPEC-000 — Resultado de ingeniería inversa AS-IS

> Ejecutado conforme a [SPEC-000-ingenieria-inversa-as-is.md](SPEC-000-ingenieria-inversa-as-is.md), conservado sin edición. Solo documentación. No se inició fase TO-BE.

## 01. Intención
Reconstruir capacidades y límites de QAPath Academy con evidencia verificable del workspace, separando código, pruebas existentes, inferencias y configuración externa desconocida.

## 02. Comportamiento

### Línea base y procedencia
| Dato | Observación |
|---|---|
| Fecha local de análisis | 26 de octubre de 2026, America/Bogota; la revisión cruza fecha UTC |
| Captura inicial UTC | 2026-10-27T00:02:40.715Z |
| Rama inicial | main |
| HEAD inicial | 437b2df3951daebeae289eed5511fe7da8d41892 |
| Estado inicial | 86 rutas con cambios locales fuera de docs/specs/: 19 modificadas y 67 sin seguimiento; el Spec de entrada también estaba sin seguimiento |
| Origen de esos cambios | Tareas anteriores de laboratorios en esta conversación, existentes antes de esta fase |
| HEAD observado al cierre | b7a1cdaaf37f06cac2a5008158bd3fabc411c865 — “Mejora laboratorios de los Modulos” |
| Cambio de HEAD durante análisis | Observado externamente a los comandos de esta fase; incorporó cambios locales preexistentes. No se ejecutó git commit, push ni reset |
| Equivalencia con producción | NO VERIFICADO; no se consultaron Vercel, GitHub remoto, Firebase ni bases externas |

**La fuente analizada es el contenido inicial del workspace, no solo el árbol del SHA inicial.** El segundo commit no altera la huella del contenido fuera de docs/specs/ respecto de la captura inicial. Por eso las referencias incluyen archivos que al inicio eran locales y después quedaron incorporados a HEAD.

### Índice de Markdown creados
| Documento | Cobertura |
|---|---|
| [000-ingenieria-inversa-as-is.md](000-ingenieria-inversa-as-is.md) | Línea base, método, índice y verificación |
| [001-arquitectura-actual.md](001-arquitectura-actual.md) | Aplicaciones, bibliotecas, contratos y composición |
| [002-identidad-y-sesiones.md](002-identidad-y-sesiones.md) | Registro, etapas, verificación y sesiones |
| [003-mfa-y-recuperacion.md](003-mfa-y-recuperacion.md) | Enrolamiento, TOTP y recovery codes |
| [004-usuarios-y-autorizacion.md](004-usuarios-y-autorizacion.md) | Roles, guards y matriz de acceso |
| [005-progreso-academico.md](005-progreso-academico.md) | Reglas, persistencia, importación y aislamiento |
| [006-contenidos-y-evaluaciones.md](006-contenidos-y-evaluaciones.md) | Catálogo, semanas, guías y quizzes |
| [007-administracion-y-auditoria.md](007-administracion-y-auditoria.md) | Gestión de estudiantes y eventos |
| [008-integraciones-y-despliegue.md](008-integraciones-y-despliegue.md) | PostgreSQL, Firebase, correo, variables y Vercel |
| [009-funcionalidades-adicionales.md](009-funcionalidades-adicionales.md) | Motores de prácticas, IA, historial y CTFL |
| [010-calidad-y-cobertura.md](010-calidad-y-cobertura.md) | Suites, dobles, omisiones y CI declarado |
| [011-inventario-deuda-tecnica.md](011-inventario-deuda-tecnica.md) | 16 hallazgos priorizados, sin correcciones |
| [012-matriz-trazabilidad.md](012-matriz-trazabilidad.md) | Requisito ↔ entrada/UI ↔ código ↔ prueba ↔ estado |

### Método
1. Lectura del Spec de entrada, rama/SHA/status y captura de huella de contenido.
2. Inventario mediante git ls-files/rg y lectura estática de fuentes, JSON, contratos, SQL, configuración y pruebas seleccionadas.
3. Seguimiento de rutas desde controlador/guard a caso de uso/adaptador, y desde UI a motor y guardado.
4. Contraste de validaciones UI, contrato, dominio y persistencia; registro de divergencias.
5. Creación exclusiva de estos 13 Markdown, revisión de secciones/referencias y nueva huella.
6. No se importó la aplicación ni se ejecutaron sus scripts. Los conteos JSON y verificaciones de referencias son lecturas estáticas, no pruebas funcionales.

### Niveles de evidencia
- **CONFIRMADO**: estructura o regla comprobada por lectura del código disponible.
- **INFERIDO**: interpretación o riesgo derivado de ese código, sin reproducirlo.
- **NO VERIFICADO**: falta ejecución, acceso autorizado o evidencia suficiente.
- **CONTRADICTORIO**: dos fuentes actuales expresan reglas/valores incompatibles.
- Los resultados históricos que el usuario comunicó no se reutilizan como validación de este workspace. Si se usaran en el futuro deberán rotularse REPORTADO POR USUARIO.

### Cobertura lograda
| Área | Alcance |
|---|---|
| Arquitectura y API | Wiring, controladores, guards y fronteras principales revisados |
| Identidad/MFA/roles | Flujos de aplicación y adaptadores de seguridad revisados estáticamente |
| Progreso | Contrato, normalización, reglas, cola UI, persistencia e importación revisados |
| Contenido | Conteo de 8 módulos, 24 semanas/guías/ejercicios, 12 labs, 12 recursos; rutas y evaluación |
| Laboratorios | Dispatch de 24 semanas, guardado y motores JS/SQL/Git/escenario; inspección parcial de misiones particulares |
| IA | Configuración admin, precedencias/cifrado, proveedores, cuota, propiedad/revisión de historial |
| Calidad | 57 archivos unitarios estándar y 54 E2E inventariados; lectura selectiva de aserciones, doubles y skips |
| Infraestructura | SQL001–007, cliente, arranque, proxy, configs Vercel y workflow; sin despliegue ni migración ejecutada |

### Pendiente de evidencia
- Ejecución integral de todas las misiones, accesibilidad con tecnologías asistivas y comportamiento visual en tamaños/navegadores reales.
- Revisión editorial de todas las guías y vigencia de sus enlaces, compatibilidad actual y disponibilidad de modelos IA.
- Resultado actual de tests/lint/build/CI; cobertura porcentual y ejecuciones omitidas por configuración.
- Estado de migraciones desplegadas, backups/restauración, TLS efectivo, límites de plataforma, TTL Firestore y retención de auditoría.
- Identidad del commit realmente desplegado, configuración de proveedores y entrega SMTP efectiva.
- Procedimientos manuales de recuperación de cuenta y rotación de claves. No se confunde ausencia en rutas revisadas con inexistencia de operación externa.

### Conclusiones y prioridades
El sistema tiene ruta académica pública, identidad propia con proveedor opcional, progreso por cuenta, administración, motores de entrenamiento e IA configurable. Los límites reales están en contrato/dominio/adaptadores y no siempre coinciden con la interfaz.

**Backlog: 16 hallazgos, 3 P1, 11 P2 y 2 P3.** Prioridad propuesta: DT-01 (tamaño de evidencia), DT-02 (validación académica) y DT-05 (coherencia de correo PostgreSQL/Firebase). Evidencia y recomendaciones candidatas en el inventario; ningún arreglo implementado.

## 03. Restricciones

### Verificación de integridad y alcance
Se calculó SHA-256 agregado de ruta + hash del contenido de **596 archivos regulares** versionados o no ignorados fuera de docs/specs/, ordenados y sin duplicados. Se excluyeron .env reales y extensiones de claves privadas; .env.example se permitió como plantilla. Los ignorados, directorios internos de Git y secretos excluidos no forman parte de esta comparación y no fueron modificados por esta fase.

| Momento | Archivos | Huella SHA-256 agregada |
|---|---|---|
| Inicio | 596 | 90c67e8ffc757c4e22ef4d6c1ea005da30cc78aa6663f0765b78f5651d83ac58 |
| Verificación de cierre | 596 | 90c67e8ffc757c4e22ef4d6c1ea005da30cc78aa6663f0765b78f5651d83ac58 |

Resultado: contenido incluido fuera del área autorizada **idéntico**. El estado Git cambió al incorporar externamente los cambios previos; no se atribuye esa transición a esta tarea. La comprobación documental encontró las seis secciones requeridas en los 13 archivos, verificó 240 referencias explícitas a rutas locales y los enlaces internos, sin referencias inexistentes ni coincidencias de los patrones sensibles revisados. Esta comprobación no sustituye una auditoría de secretos ni una ejecución funcional.

Diff equivalente de la entrega: 13 archivos nuevos con extensión .md bajo docs/specs/. git status --short --untracked-files=all, tras el commit observado externamente, muestra únicamente esos documentos como nuevos:
```text
?? docs/specs/000-ingenieria-inversa-as-is.md
?? docs/specs/001-arquitectura-actual.md
?? docs/specs/002-identidad-y-sesiones.md
?? docs/specs/003-mfa-y-recuperacion.md
?? docs/specs/004-usuarios-y-autorizacion.md
?? docs/specs/005-progreso-academico.md
?? docs/specs/006-contenidos-y-evaluaciones.md
?? docs/specs/007-administracion-y-auditoria.md
?? docs/specs/008-integraciones-y-despliegue.md
?? docs/specs/009-funcionalidades-adicionales.md
?? docs/specs/010-calidad-y-cobertura.md
?? docs/specs/011-inventario-deuda-tecnica.md
?? docs/specs/012-matriz-trazabilidad.md
```

No se ejecutaron tests, builds, instalaciones, migraciones, seeds, commits, push, deploys ni llamadas HTTP. No se leyeron .env reales ni datos productivos. Los nombres de variables documentados proceden del código y plantillas, nunca de sus valores reales.

## 04. No-Objetivos
No refactorizar, corregir deuda, editar UI/contenidos/pruebas/configuración ni validar producción. No presentar este conjunto como especificación exhaustiva de cada detalle ni como certificación de seguridad.

## Evidencia y trazabilidad
| Afirmación | Evidencia (ruta + símbolo) | Test/observación | Estado |
|---|---|---|---|
| Contrato documental | `docs/specs/SPEC-000-ingenieria-inversa-as-is.md` — R-CRIT-001, R-006 y CA-01…07 | Lectura completa; original sin edición | CONFIRMADO |
| Capacidades reconstruidas | Specs 001–010 y matriz 012 | Referencias al código y pruebas, sin ejecución | CONFIRMADO |
| Deuda registrada | Spec 011 — DT-01…16 | Hallazgos y prioridades candidatas | CONFIRMADO |
| Integridad de fuentes incluidas | Comparación de dos huellas y estado Git | 596 archivos; huellas iguales | CONFIRMADO |
| Equivalencia con producción | Sin comparación autorizada de despliegue | Pendiente | NO VERIFICADO |

## Preguntas abiertas y deuda técnica
¿Qué controles y procesos existen fuera del repositorio? ¿Qué nivel de confianza requiere el avance académico? ¿Cuáles suites deben bloquear entrega sin skips? ¿Qué políticas de retención y recuperación deben quedar explícitas?

Specs TO-BE candidatos, **no creados ni aprobados**: unificar evidencia; integridad de validación académica; coherencia de identidad; autoridad de esquema/readiness; calidad reproducible; recuperación y retención. Cada uno necesita alcance, regresión, riesgos, reversión y aprobación antes de implementar.

