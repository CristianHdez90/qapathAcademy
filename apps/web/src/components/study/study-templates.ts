/** Plantillas descargables desde el editor de lecciones (SPEC-CONTENT-320). */
export const STUDY_TEMPLATES:{label:string;filename:string;content:string}[]=[
 {
  "label": "Lección .md",
  "filename": "01-ciclo-de-vida-defecto.md",
  "content": "# Ciclo de vida de un defecto\n\nUn **defecto** es una diferencia entre el resultado esperado y el obtenido. Esta lección explica cómo registrarlo y darle seguimiento.\n\n## Objetivos\n\n- Reconocer los estados de un defecto.\n- Escribir un reporte reproducible.\n- Distinguir **severidad** de **prioridad**.\n\n## Estados más usados\n\n| Estado | Quién lo cambia | Evidencia |\n|---|---|---|\n| Nuevo | QA | Pasos, resultado esperado y obtenido |\n| En corrección | Desarrollo | Rama o commit asociado |\n| Verificado | QA | Re-prueba y regresión |\n\n```mermaid\nflowchart LR\n  N[Nuevo] --> A[Asignado] --> C[En corrección] --> V{¿Verificado?}\n  V -- Sí --> X[Cerrado]\n  V -- No --> R[Reabierto] --> C\n```\n\n> **Consejo:** un buen reporte permite que otra persona reproduzca el problema sin preguntarte nada.\n"
 },
 {
  "label": "Diagrama .mmd",
  "filename": "02-flujo-reserva.mmd",
  "content": "%% Diagrama Mermaid: cada .mmd se muestra como una figura de la lección.\nsequenceDiagram\n  actor QA\n  participant App as Aplicación\n  participant API\n  QA->>App: Reserva el turno \"lunes 09:00\"\n  App->>API: POST /reservas\n  API-->>App: 409 Turno ocupado\n  App-->>QA: \"Este turno ya no está disponible\"\n"
 },
 {
  "label": "Mapa con globos .json",
  "filename": "03-niveles-de-prueba.json",
  "content": "{\n \"type\": \"graph\",\n \"title\": \"Niveles de prueba\",\n \"description\": \"Selecciona un nivel para ver su explicación.\",\n \"direction\": \"LR\",\n \"nodes\": [\n  {\n   \"id\": \"componente\",\n   \"label\": \"Componente\",\n   \"group\": \"primary\",\n   \"detail\": {\n    \"title\": \"Prueba de componente\",\n    \"text\": \"Verifica una unidad aislada del sistema.\",\n    \"bullets\": [\n     \"La ejecuta normalmente el equipo de desarrollo\",\n     \"Rápida y automatizable\"\n    ]\n   }\n  },\n  {\n   \"id\": \"integracion\",\n   \"label\": \"Integración\",\n   \"group\": \"info\",\n   \"detail\": {\n    \"text\": \"Verifica la comunicación entre componentes o servicios.\"\n   }\n  },\n  {\n   \"id\": \"sistema\",\n   \"label\": \"Sistema\",\n   \"group\": \"accent\",\n   \"detail\": {\n    \"text\": \"Evalúa el producto completo frente a sus requisitos.\",\n    \"bullets\": [\n     \"Funcional y no funcional\"\n    ]\n   }\n  },\n  {\n   \"id\": \"aceptacion\",\n   \"label\": \"Aceptación\",\n   \"group\": \"warning\",\n   \"detail\": {\n    \"text\": \"Confirma que el producto resuelve la necesidad del negocio y del usuario.\"\n   }\n  }\n ],\n \"edges\": [\n  {\n   \"from\": \"componente\",\n   \"to\": \"integracion\"\n  },\n  {\n   \"from\": \"integracion\",\n   \"to\": \"sistema\"\n  },\n  {\n   \"from\": \"sistema\",\n   \"to\": \"aceptacion\",\n   \"label\": \"listo para negocio\",\n   \"animated\": true\n  }\n ]\n}"
 },
 {
  "label": "Gráfica .json",
  "filename": "04-defectos-por-sprint.json",
  "content": "{\n \"type\": \"chart\",\n \"title\": \"Defectos encontrados por sprint\",\n \"description\": \"Comparación entre defectos abiertos y cerrados.\",\n \"chart\": \"bar\",\n \"xKey\": \"sprint\",\n \"series\": [\n  {\n   \"key\": \"abiertos\",\n   \"label\": \"Abiertos\"\n  },\n  {\n   \"key\": \"cerrados\",\n   \"label\": \"Cerrados\"\n  }\n ],\n \"data\": [\n  {\n   \"sprint\": \"S1\",\n   \"abiertos\": 12,\n   \"cerrados\": 7\n  },\n  {\n   \"sprint\": \"S2\",\n   \"abiertos\": 9,\n   \"cerrados\": 10\n  },\n  {\n   \"sprint\": \"S3\",\n   \"abiertos\": 5,\n   \"cerrados\": 11\n  },\n  {\n   \"sprint\": \"S4\",\n   \"abiertos\": 3,\n   \"cerrados\": 6\n  }\n ],\n \"unit\": \"defectos\"\n}"
 }
];
