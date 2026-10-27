# Fase 2 — Roadmap técnico TO-BE

> Estado: PROPUESTO. Línea base: main / b7a1cdaaf37f06cac2a5008158bd3fabc411c865.
> Marco obligatorio: [SPEC-100](SPEC-100-fase-2-reduccion-deuda-tecnica-to-be.md). Implementación, PR, merge, migración y producción requieren decisiones separadas.

## 01. Intención
Secuenciar reducción de riesgo y cambios pequeños conservando funcionalidades. Este roadmap es por dependencias y evidencias; **no es calendario ni autorización de ejecución**.

## 02. Comportamiento

### Entregables de esta planificación
| Archivo | Resultado |
|---|---|
| [100-backlog-deuda-tecnica-priorizado.md](100-backlog-deuda-tecnica-priorizado.md) | 16 fichas, correspondencia con Fase 1, prioridad y evidencia |
| [101-roadmap-tecnico-to-be.md](101-roadmap-tecnico-to-be.md) | Secuencia, gates, decisiones y control de esta entrega |
| [102-matriz-riesgos-regresion.md](102-matriz-riesgos-regresion.md) | Regresión, riesgos de cambio, mitigación y reversión |
| [SPEC-110-politica-tamano-evidencia-to-be.md](SPEC-110-politica-tamano-evidencia-to-be.md) | Corrección de contrato y política de tamaño; PROPUESTA |
| [SPEC-111-validadores-practicas-por-estrategia-to-be.md](SPEC-111-validadores-practicas-por-estrategia-to-be.md) | Refactor de validador sin cambio de semántica; PROPUESTA |
| [SPEC-112-registro-laboratorios-to-be.md](SPEC-112-registro-laboratorios-to-be.md) | Refactor acotado del dispatch de laboratorio; PROPUESTA |

La segunda y tercera propuesta reducen mantenibilidad/riesgo de cambio; no cierran por sí solas la debilidad de confianza TD-002 ni todo TD-013. La primera cambia deliberadamente el máximo aceptado para 23/24 y necesita aprobación de ese contrato concreto.

### Gates y estado actual
| Gate | Condición | Estado de esta fase |
|---|---|---|
| G0 | Revisar AS-IS, SHA y evidencia local | Revisión estática realizada; runtime/producción no verificados |
| G1 | Backlog y riesgos con justificación | Elaborados para revisión humana |
| G2 | Alternativas, alcance, aceptación, pruebas y rollback | Tres borradores; ninguna solución implementada |
| G3 | Aprobar UNA SPEC, alcance de archivos y modalidad | **PENDIENTE en las tres** |
| G4 | Rama/PR de una responsabilidad, cambio mínimo | NO INICIADO |
| G5 | Evidencia por revisión, suites relevantes y skips evaluados | NO EJECUTADO |
| G6 | Decisión separada de merge/release, smoke y seguimiento | NO AUTORIZADO |
| G7 | Aceptación, deuda residual y reversión documentadas | NO INICIADO |

La revisión estática de G0 no da por aprobados los tests AS-IS. Antes de G4 debe reconfirmarse el SHA y una línea base ejecutable autorizada. Si falla, se registra y vuelve a G2, sin arreglos adyacentes automáticos.

### Oleadas por dependencias
| Oleada | Trabajo propuesto | Dependencias / decisión | Evidencia para salir | Regla de avance |
|---|---|---|---|---|
| O0 — Decisiones y caracterización | Ratificar límites 23/24; aclarar confianza académica; ordenar evidencia TD-005/006/009/014/015 | Propietario del producto y responsable técnico, por asignar | Política de tamaño; formatos sintéticos; controles externos acreditados solo donde se autorice | Ninguna hipótesis se convierte sola en remediación |
| O1 — Integridad de evidencia | SPEC-110, primera candidata por TD-001 | G3 individual; plan de rollback compatible con evidencia larga | Bordes 39/40/8000/8001/32000/32001, guardado/recarga real en base desechable, invariantes académicas sin cambios | No liberar antes de comprobar lector compatible |
| O2 — Base de calidad | Futura SPEC de TD-007 y TD-008 | Validar lockfile/suites sin cambiar dependencias por conveniencia | CI reproducible, informe de ejecutados/omitidos, cero skips críticos no aceptados | Requiere su propia SPEC; no se incluye en 110–112 |
| O3 — Refactors delimitados | SPEC-111; después SPEC-112 o independiente según capacidad | Caracterización aprobada; TD-001 estabilizado recomendable, no dependencia lógica rígida | Cero diferencias en corpus de validador; matriz 24/24 de dispatch/estado | No combinar ambos en un PR; no endurecer reglas |
| O4 — Persistencia y operación | TD-003/004/012; investigar TD-005/015 | Elegir autoridad de esquema y capacidades requeridas; evidencia de proveedor | Diseño de readiness compatible y escenarios de falla reproducibles | DDL, si se propone, necesita aprobación y reversión específicas |
| O5 — Seguridad, políticas y contenido | TD-002 funcional, TD-006/009/011/014/016, aclarar TD-010 | Confianza académica, recuperación, retención, operación externa y revisión editorial | Specs funcionales con compatibilidad histórica y pruebas negativas | Ningún borrado, recálculo de avance o nuevo permiso por refactor |

O0 de identidad puede investigarse antes de cualquier oleada por su riesgo potencial. O2 no es requisito para redactar documentos ni para todos los tests locales, pero una liberación necesita evidencias fiables de G5. No hay fechas estimadas.

### Dependencias de las tres propuestas
- SPEC-110 no requiere SPEC-111/112, ni cambios de base de datos o de dependencias.
- SPEC-111 preserva las reglas actuales; no requiere resolver autenticidad de ejecución. Una futura validación estricta **sí** requiere política y datos históricos, y no está autorizada por 111.
- SPEC-112 solo extrae WeekLaboratory. PracticeActivity conserva sus asistentes, evidencia y lógica de finalización. Compartir hallazgo con otra SPEC no amplía alcance.
- TD-003 antes de diseñar migraciones; TD-004 antes de alterar contratos de readiness; TD-005 exige reproducir el fallo y elegir consistencia, no un rollback SQL ficticio de un servicio externo.

### Contrato mínimo de regresión
| Capacidad preservada | Control AS-IS / riesgo | Verificación futura exigida según alcance |
|---|---|---|
| Registro/verificación/login/logout | SPEC-002; correo y etapas antes de sesión | Casos locales y Firebase con dobles/emulador, sin proveedor productivo |
| Sesiones y RBAC | SPEC-004; STUDENT propio, ADMIN, INSTRUCTOR, OriginGuard | Anónimo/rol permitido/rol prohibido, origen ajeno, revocación y aislamiento |
| MFA/QR/recovery | SPEC-003; TOTP antirreplay, recovery un uso; no rotación implementada acreditada | Regresión si se tocan dependencias de identidad; no crear recuperación como refactor |
| Progreso/notas/evaluación | SPEC-005; transacción/revisión, importación solo notas, mayor nota | Guardar, recargar, otra cuenta, borrador/validated, error/reintento y porcentajes |
| Administración/auditoría | SPEC-007; permisos, solo STUDENT, metadatos sin secretos | Revocación y auditoría, sin texto de evidencia en logs |
| Contenidos y prácticas | SPEC-006/009; 24 semanas y motores diversos | Mismo texto, orden, ayudas, descargas, selectores accesibles y restauración |
| IA / historial | SPEC-009; cifrado, cuota, propiedad/revisión | Pruebas con dobles sin facturación ni claves reales; no tocar configuración |
| CTFL | SPEC-009; complemento independiente | No afectar porcentajes ni resultados guardados por extracción |
| Infraestructura | SPEC-008/010; Next/Nest, SQL, CI y Vercel declarados | Sin asumir commit productivo; despliegue real requiere decisión independiente |

### Procedimiento futuro de ejecución y cierre
1. Propietario aprueba una SPEC por id, modalidad y rutas. Aprobar documentos no implica G4.
2. Revalidar base limpia o cambios previos atribuidos; rama sugerida codex/spec-110-evidence-policy (solo al autorizar 110). No crearla ahora.
3. Caracterizar antes de modificar; cada prueba registra SHA, entorno, comando, resultado y omisiones. Infraestructura desechable/DB writes requieren autorización propia.
4. Implementar únicamente archivos de la lista aprobada. Nuevas necesidades vuelven a G2/G3.
5. Ejecutar suites pertinentes y validaciones generales; no repetir suites sin motivo ni llamar a producción. G5 no se satisface con tests omitidos no evaluados.
6. Preparar diff/PR solo si se autoriza; no merge ni deploy implícitos.
7. Preproducción si existe y está autorizada; si no existe, registrar el bloqueo y acordar alternativa, no inventarla.
8. Smoke antes/después, observación de rechazos/lecturas/estado de sesión y pausa ante regresión. No fijar porcentajes de error sin medición inicial.
9. Cerrar con criterios cumplidos, deuda residual, datos preservados y rollback ensayado; una extracción no cierra un hallazgo funcional más amplio.

## 03. Restricciones
No cambios de código, funcionalidades, tests, manifests/lockfile, CI, migraciones, variables ni servicios. No se ejecutaron tests, builds, instalaciones, HTTP mutativo, commits ni despliegues. Las rutas “nuevas propuestas” en Specs son un alcance futuro, no archivos creados.

### Verificación de esta entrega
Línea base de control: 596 archivos regulares no ignorados fuera de docs/specs/, excluyendo .env reales/extensiones de claves privadas; hash agregado 90c67e8ffc757c4e22ef4d6c1ea005da30cc78aa6663f0765b78f5651d83ac58. Se capturó también hash individual de los 15 Markdown preexistentes, incluidos los dos Specs maestros. Los ignorados y secretos excluidos no son cobertura de la comparación y no fueron tocados.
Resultado de la verificación documental, 2026-10-27T00:47:32.831Z:
- **596 archivos fuera de docs/specs/ con la misma huella inicial**; HEAD permanece en b7a1cdaaf37f06cac2a5008158bd3fabc411c865.
- **15 Markdown preexistentes sin modificación**, contrastados por hash individual; se preservaron todos los documentos AS-IS y los dos Specs maestros.
- **6 Markdown nuevos**, exactamente los seis entregables del índice de esta fase. El delta de git status --short --untracked-files=all, respecto de la captura inicial, contiene solo estas rutas:

```text
?? docs/specs/100-backlog-deuda-tecnica-priorizado.md
?? docs/specs/101-roadmap-tecnico-to-be.md
?? docs/specs/102-matriz-riesgos-regresion.md
?? docs/specs/SPEC-110-politica-tamano-evidencia-to-be.md
?? docs/specs/SPEC-111-validadores-practicas-por-estrategia-to-be.md
?? docs/specs/SPEC-112-registro-laboratorios-to-be.md
```

- Se comprobaron las secciones obligatorias y enlaces internos de los seis archivos, **118 referencias a rutas existentes** y **9 rutas nuevas explícitamente propuestas**, todavía no creadas. No se encontraron referencias rotas ni coincidencias de los patrones sensibles revisados; esto no es una auditoría exhaustiva de secretos.
- Ninguna prueba funcional se ejecutó: esta validación solo comprueba documentos, rutas e integridad de contenido. Las actualizaciones de este resumen también son exclusivamente Markdown.

## 04. No-Objetivos
No presentar un plan como logro de remediación, no inventar fechas/costes ni declarar producción lista. No solicitar aprobación global para toda la deuda.

## Resumen de decisiones y aprobaciones pendientes
| Decisión | Propuesta / incertidumbre | Responsable a confirmar |
|---|---|---|
| D-01 | Aceptar 32000 en 23/24, misma estructura HTTP y mismo manejo de tamaños inválidos | Propietario del producto |
| D-02 | Aceptar limitación de rollback de lectores viejos ante nuevas evidencias largas | Propietario + responsable de operación |
| D-03 | Validador de 111 mantiene compatibilidad, incluso notebooks ausentes; endurecimiento futuro separado | Propietario + responsable académico |
| D-04 | 112 no modifica asistentes ni contenido ni estados del estudiante | Propietario |
| D-05 | Política de confianza/retención/recuperación y evidencia de configuración externa | Responsables por asignar |
| D-06 | Revisión individual G3; implementación local separada de PR, merge, DB y deploy | Propietario |

**Siguiente paso recomendado:** revisar SPEC-110 y, si se acepta su cambio de contrato y alcance, aprobar únicamente esa SPEC para implementación local. Sin esa aprobación, termina aquí la ejecución.

