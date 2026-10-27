# SPEC-005 — Progreso académico

## 01. Intención
Conservar avances y evidencias por estudiante y derivar el avance académico de actividades, sin aceptar una marca manual de semana completada.

## 02. Comportamiento
### Lectura y escritura
- GET/PATCH `/api/v1/me/progress`, POST `me/progress/import`: solo STUDENT; el usuario destino proviene de la sesión.
- Estado versión 2: weeks, read, tasks, labs, final, quizzes, notes, scrumIntro, scrumQuizScore, hours, readingSections, lessonChecks, evidence.
- El servidor aplica comandos, no reemplaza arbitrariamente el estado. Bloquea la fila de student_progress con FOR UPDATE, incrementa revisión e inserta student_progress_events en la misma transacción.
- El frontend serializa mutaciones, muestra saving/saved/error y conserva comandos fallidos para reintento. Notas de estudiantes: espera de 650 ms y flush explícito.
- Visitante: BrowserProgressRepository usa localStorage y normaliza; sesión STUDENT: API/PostgreSQL. ADMIN/INSTRUCTOR no reciben progreso personal académico mediante estos endpoints.
- El proveedor React se vuelve a crear al cambiar id/rol para separar colas y estados. La evidencia persistida visitante sigue siendo local al navegador.

### Reglas de finalización
- Una semana necesita todas sus secciones de lectura, autoevaluación de lección correcta, práctica validada y nota del quiz de módulo >=70%.
- Lectura UI: visibilidad, foco, exposición del capítulo y al menos tres segundos. El backend comprueba índices válidos, no reconstruye el tiempo/exposición.
- Porcentaje: media de cuatro etapas con igual peso por semana; lectura aporta su fracción de secciones. Solo todos los requisitos completos permiten 100%; en otro caso máximo 99,9%. Las horas y entregables finales no forman parte de esa fórmula.
- Toggle público solo para final 0–9. Las notas admiten hasta 8000 caracteres.
- Evidencia: task/lab/exercise/certification con identificadores reconocidos y mínimo 40 caracteres. Contrato y dominio admiten 32000 únicamente para ejercicios 1,5,7,8,9; los demás, 8000.
- Una evidencia de ejercicio con completion=validated debe superar practiceCompleted. Semana 1 recalcula la matriz; 4,5,6 validan el contenido especializado. Semanas 8 y 9 recalculan los notebooks solo si esos campos existen. Otras usan sobre genérico: semana, modo permitido, run.ok, source/output no vacíos con límites y fecha parseable.
- Calificación propia: POST `me/quizzes/:moduleId/grade` calcula respuestas en backend y conserva la mayor nota; no se admite grade mediante PATCH de cliente.
- Importación autenticada **solo fusiona notas**. No importa calificaciones, lectura, evidencias ni finalización; la función general mergeProgress tiene mayor capacidad, pero no es el contrato del endpoint de importación.

### Criterios de aceptación derivados
- P-001: un PATCH de STUDENT no puede escoger otro userId ni enviar directamente una nota de quiz.
- P-002: evidencia draft puede guardarse, pero no completa una práctica.
- P-003: importar un backup con quiz=100 no concede ese resultado a una cuenta.
- P-004: un fallo de guardado deja estado de error/reintento y no debe presentarse como guardado.
- P-005: evidencia de ejercicio 23/24 mayor de 8000 debe rechazarse por el contrato actual, aunque el frontend permite preparar hasta 32000: discrepancia DT-01.

## 03. Restricciones
Integridad de aprendizaje basada parcialmente en datos del cliente, no en atestación de ejecución. JSONB por usuario; eventos excluyen texto de notas/evidencias. Importación web limita el archivo a 500 KB. No se conectó PostgreSQL ni se comprobó aislamiento concurrente en ejecución.

## 04. No-Objetivos
No unificar límites ni añadir validadores. No certificar que una ejecución declarada por cliente realmente se ejecutó ni que las horas reflejan tiempo estudiado.

## Evidencia y trazabilidad
| Afirmación | Evidencia (ruta + símbolo) | Test/observación | Estado |
|---|---|---|---|
| Contrato de comandos | `packages/contracts/src/auth.ts` — progressCommandSchema | Lectura del refinamiento por id | CONFIRMADO |
| Reglas y límites | `libs/progress/src/domain/progress-commands.ts` — applyProgressCommand; `libs/progress/src/domain/progress.ts:18` — fromUnknown | `tests/automatic-progress.test.mjs`, `tests/progress-percentage.test.mjs` | CONFIRMADO |
| Sobre y notebooks condicionales | `libs/progress/src/domain/practice-completion.ts` — practiceCompleted | `tests/practice-completion.test.mjs:6` usa fixtures, no ejecución de cada laboratorio | CONFIRMADO |
| Transacción e importación | `apps/api/src/infrastructure/adapters/postgres-progress.adapter.ts` — transact, import | SQL leído; integración no ejecutada | CONFIRMADO |
| Cola, identidades y reintento | `apps/web/src/features/progress/progress-provider.tsx` — SessionProgressProvider, send, importClean | `apps/web/tests/e2e/practice-progress.spec.ts` existente | CONFIRMADO |
| Lectura | `apps/web/src/features/progress/use-reading-tracker.ts` — useReadingTracker; `libs/progress/src/domain/automatic-completion.ts` | `tests/reading-coverage.test.mjs` | CONFIRMADO |
| Límites frontend vs backend | `apps/web/src/components/academy/practice-activity.tsx:58` frente a progressCommandSchema/fromUnknown | 23/24 adicionales solo en UI | CONTRADICTORIO |

## Preguntas abiertas y deuda técnica
DT-01, DT-02 y DT-16: alineación de tamaños, profundidad de validación y frontera de confianza de lectura. La completitud de aprendizaje no equivale a autenticidad verificable de cada ejecución.

