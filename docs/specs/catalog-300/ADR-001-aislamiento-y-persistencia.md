# ADR-001 · SPEC-CATALOG-300

Estado: implementación local autorizada, 2026-10-29. Rama `codex/catalog-300`, worktree aislado. El checkout de Claude no se modifica.

Se conserva una copia de la línea base local de 111 archivos modificados/nuevos; sus huellas figuran en `baseline-local.json`. No son cambios de esta SPEC ni deben atribuirse a ella en un commit o PR. La comparación de entrega distinguirá la línea base de las modificaciones del catálogo.

El catálogo es un contexto separado de las reglas de progreso. No cambia tarjetas, claves, MFA, semanas, notas ni minitests de Fundamentos. Los cursos referencian contenido existente; las rutas personales solo guardan selección y orden.

Las migraciones son aditivas y las escrituras administrativas usan revisión optimista y auditoría en la misma transacción. Archivar no borra contenido ni progreso. Restaurar devuelve a DRAFT. El entorno productivo no se consulta ni migra en esta tarea.
