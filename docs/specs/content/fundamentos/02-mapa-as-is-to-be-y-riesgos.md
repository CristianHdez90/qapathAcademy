# 02 · Mapa AS-IS → TO-BE, incompatibilidades y riesgos

Fase G1 · solo documentación · 2026-10-29

## 1. Principio rector

**El estudio de Fundamentos se reemplaza por completo** (RQ-01). No hay «vista anterior» ni «contenido histórico» visible para el estudiante, a diferencia de la implementación de Codex que se rechazó. Lo que se conserva del AS-IS son **ideas correctas reescritas dentro de los nuevos capítulos**, nunca bloques del texto anterior. El JSON anterior queda en el historial de git.

## 2. Correspondencia de contenidos

| AS-IS (tarjeta o región) | Acción | Destino TO-BE |
|---|---|---|
| S1 `qa`, `qc`, `testing` | Reescribir | `FND-W01-C01-T01` «Probar es obtener información» (QA ≠ QC ≠ testing) |
| S1 `error`, `defect`, `failure` | Reescribir | `FND-W01-C01-T01` (cadena error → defecto → fallo con la doble reserva) y C06 P1 |
| S1 `verification`, `validation` | Reescribir | `FND-W01-C03-T06` Aceptación («¿construimos lo correcto?») y C07 |
| S1 `sdlc`, `stlc`, `iteration`, `refinement`, `development`, `release` | Reubicar | Actividades de prueba en el sprint: C04-T08 (feedback en el PR), C05-T08 (testing temprano en refinamiento), C07 (refinamiento con ejemplos) y C08 (antes de liberar) |
| S1 siete principios (7) | Reescribir con la terminología v4.0.1 | Capítulo 05 completo |
| S1 caso guiado «saldo bancario» | **Retirar** | Lo sustituye ReservaYa |
| S2 `unit`, `integration`, `system`, `acceptance` | Ampliar a 5 niveles | Capítulo 03 (se añade integración de sistemas y se separan las dos integraciones) |
| S2 `functional`, `nonfunctional` | Reescribir | C01-T02, C01-T03 |
| S2 `smoke`, `sanity`, `regression`, `explore`, `e2e`, `automation` | Separar por eje | C02-T02 a T08 |
| S2 riesgo (7 tarjetas) | Condensar | C02-T09 «Priorizar por riesgo», entregable de C05 y C06 P9 |
| S2 caso guiado «priorizar cinco funcionalidades» | **Retirar** | ReservaYa |
| Autoevaluación semanal (1 pregunta) | **Sustituir** | Minitest por tarjeta (RQ-05) |
| `quizzes.fundamentos` (3 preguntas) | **Sustituir** | Minitests. Sus 3 ideas siguen evaluadas en C01-T01, C03-T01 y C02-T09 |
| Práctica S1 «De la HU al diseño de casos» | Conservar y adaptar después (no en este lote) | Debe usar HU-RES-01 (decisión D-09) |
| Práctica S2 «Riesgos y niveles · misión de lanzamiento» | Conservar y adaptar después | Ampliar a 5 niveles (D-09) |
| Laboratorio `l1` «Detective de defectos» | Sin cambio | Opcional, ya no cuenta para completar |

## 3. Incompatibilidades estructurales

| # | AS-IS | TO-BE | Impacto |
|---|---|---|---|
| I-01 | 3 secciones + 1 ejemplo por semana (`sections: 4`) | 4 capítulos por semana, sin ejemplo guiado aparte | `learning-rules.ts`, `tests/automatic-progress.test.mjs:15` |
| I-02 | 48 tarjetas fijas | 68 tarjetas + elementos de capítulo | `tests/reading-concepts.test.mjs:5–24` |
| I-03 | `ReadingConcept` solo tiene `example` y `demonstration.steps[]` | Tarjetas con objetivo, contexto, evidencia, minitest, globos (acciones/responsable/evidencia por estado) y grafo | Contrato nuevo y versionado (07 §2) |
| I-04 | Completitud: lectura + autoevaluación + práctica + test del módulo ≥ 70 % | Lectura de la tarjeta + minitest aprobado + práctica | `automatic-completion.ts`, `learning-navigation.ts`, API de corrección |
| I-05 | Hashes `#chapter-0..3`, `#self-check` | `#FND-W01-C01-T03` y similares | Enlaces guardados, `learning-tree.json`, sesiones de reanudación |
| I-06 | La vista de módulo muestra resumen, guía, test y MariBug (8 módulos) | Se retiran esos bloques en los 8 módulos | Los otros 7 módulos pierden el lugar de su test del módulo (R-09) |
| I-07 | En el árbol aparecen «Test del módulo» y «CONSOLIDA LO APRENDIDO · Evaluación del módulo» | Se retiran; en Fundamentos se muestran capítulos y tarjetas | `learning-tree.tsx`, `prepare-learning-navigation.mjs` |
| I-08 | «Así se aplica» retirado globalmente (cambio sin commit) | Globos por estado solo en Fundamentos | Componente nuevo (D-07) |

## 4. Decisiones de G3

**Estado: aprobadas por el responsable el 2026-10-29** («Sí, acepto tu recomendación»). Implementación local L0–L2 en [10](10-acta-implementacion-l0-l2.md).

| ID | Decisión | Recomendación |
|---|---|---|
| D-01 | Estructura | **Cuatro capítulos reales por semana** (no subcapítulos dentro de las 3 secciones). Se mantienen `week.id` 1 y 2 y el módulo `fundamentos` |
| D-02 | Contenido anterior | Retirarlo de la interfaz (sin vista *legacy*) y mantenerlo solo en git |
| D-03 | Progreso histórico | Las semanas ya completadas **siguen completadas**. La lectura parcial anterior no se convierte en lectura nueva porque el contenido es distinto. Notas, evidencias de práctica y la nota histórica `quizzes.fundamentos` se conservan sin borrar |
| D-04 | Minitest por tarjeta | 1–2 preguntas al terminar la lectura de cada tarjeta. **Corrección en el servidor**, respuestas ocultas hasta enviar, reintentos ilimitados con feedback, cuenta el mejor intento |
| D-05 | Regla de completitud de Fundamentos | Semana completa = todas sus tarjetas leídas + **cada capítulo con ≥ 70 % de minitests correctos** + práctica validada. Desaparecen la autoevaluación semanal y el test del módulo |
| D-06 | Vista de módulo (8 módulos) | Quitar `module-summary`, el estado «Completado», `AskLia` y el `Quiz`. Mantener «Continuar» junto a «CONTENIDO DE ESTUDIO» |
| D-07 | Globos | Componente nuevo `StateBalloons`, solo para Fundamentos. No restaura la animación global retirada |
| D-08 | Diagramas | Mermaid como **fuente** versionable. En la aplicación se muestran como SVG pregenerado en el build o como lista estructurada, sin ejecutar Mermaid en el navegador (sin HTML ni scripts de contenido) |
| D-09 | Prácticas semanales y Plan QA | Fuera de este lote: SPEC de práctica aparte. El Plan QA es un entregable formativo de C08, no un requisito nuevo |
| D-10 | Test de los otros 7 módulos | Mientras no tengan su propia SPEC, su test del módulo se **traslada al final de la última semana del módulo**, como tarjeta «Test de cierre», con las mismas preguntas y la misma regla del 70 % |
| D-11 | Código de Codex sin commit | Retirarlo antes de implementar (07 §7) |

## 5. Riesgos

| ID | Riesgo | Prob. | Impacto | Mitigación |
|---|---|---|---|---|
| R-01 | Un alumno con la semana 1 a medias pierde la lectura parcial | Alta | Medio | Aviso único «El contenido se renovó; tus notas y prácticas siguen aquí» y D-03 (las semanas completadas no se revierten) |
| R-02 | Los enlaces antiguos `#chapter-N` llevan a una tarjeta incorrecta | Media | Bajo | Redirigir los hashes antiguos a la portada del capítulo equivalente (07 §4) |
| R-03 | Minitests corregidos en el cliente permiten fabricar el aprobado | Media | Alto | Corrección en el servidor, como `/me/quizzes/:id/grade`; el esquema rechaza notas del cliente |
| R-04 | Abrir globos o recorrer tarjetas cuenta como estudio | Media | Alto | AC-16: los globos no emiten comandos. La lectura usa el rastreador existente |
| R-05 | Error normativo (4 niveles, «sanity» como norma, E2E como nivel) | Media | Alto | Revisión con 01 §4 y minitests que lo evalúan |
| R-06 | Desbordamiento en móvil con diagramas o globos | Media | Medio | Panel bajo el flujo por debajo de 768 px. E2E a 320 px |
| R-07 | Las pruebas acopladas (48 tarjetas, `#self-check`) se borran para «poner verde» el CI | Media | Alto | 07 §6 lista cada prueba y la expectativa nueva |
| R-08 | Diferencias entre ISO/IEC 25010 y la traducción editorial | Baja | Medio | V-01 antes de publicar |
| **R-09** | Al quitar «Evaluación del módulo» en 8 módulos, **ningún alumno de los otros 7 módulos podría completar semanas** (el test es requisito) | **Alta si no se mitiga** | **Crítico** | D-10 traslada el test, no lo borra. E2E de completitud en un módulo no Fundamentos (`learning-tree-completion`) |
| R-10 | Choque con la retirada global de «Así se aplica» | Media | Bajo | Componente distinto y limitado a Fundamentos. Se documenta como excepción aprobada |
| R-11 | Mezclar el código de Codex con la nueva implementación | Media | Medio | D-11 y un PR propio de reversión |
