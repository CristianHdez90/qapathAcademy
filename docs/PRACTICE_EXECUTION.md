# Ejecución integrada de prácticas

Todas las semanas conservan preparación, instrucciones, kit de apoyo y evidencia. El ejecutor se elige por tema:

| Semanas | Ejecución integrada |
| --- | --- |
| 1–6 | Transferencia y análisis de fallos; riesgos y niveles; historia/Gherkin/regla de acceso; contraseñas y fronteras; ciclo del bug con retest; Sprint/DoD/métricas. Cada semana tiene su propio laboratorio. |
| 7 | Dentro de «Laboratorio de apoyo para esta actividad · QA Store»: Postman/HTTP, PostgreSQL en WebAssembly y comandos Git con respuesta y explicación. |
| 8 | SQL y Git para profundizar en consultas y control de versiones. |
| 9–12 | JavaScript y TypeScript, aserciones y dobles asíncronos. |
| 13–18 | Primer escenario UI; inspección de locators reales; diagnóstico de fallo; vista móvil; constructor de operación Page Object; ejecución de datasets con una vista nueva por caso. |
| 19 | Solicitudes API con métodos, datos, autorización ficticia y status esperado. |
| 20 | Respuesta 503 controlada en la vista UI y recuperación al retirar la simulación. |
| 21–22 | Suite de comprobaciones unitarias, API y UI; repeticiones, resultados y duración observada. |
| 23–24 | Combinación de ejecutores para el proyecto y revisión interactiva del guion del portafolio. |

El contenedor se llama «Laboratorio interactivo · tema de la semana» fuera de la semana 7. No monta el cotizador genérico como laboratorio de fundamentos o QA manual. En automatización, QA Store puede servir como aplicación bajo prueba dentro de la actividad específica.

Git utiliza isomorphic-git y un filesystem IndexedDB aislado por semana. init, status, add, commit, log, creación de rama y comparación de versiones consultan o cambian un repositorio real del navegador. No es un shell ni modifica el checkout de la academia. Solo se admiten los comandos ofrecidos, sin remotos, y cada respuesta explica su propósito. El commit produce un SHA real.

SQL ejecuta PostgreSQL PGlite en un worker del navegador: no usa DATABASE_URL ni cuentas de la academia. Se inicializa una base en memoria por ejecución a partir del fixture SQL del kit. La salida muestra hasta 100 filas; el worker termina a los 30 segundos. Los recursos WASM se preparan automáticamente antes de dev y build, desde la dependencia instalada, sin CDN.

El código del estudiante corre en un worker de un iframe con origen opaco y CSP sin red. El límite es de tres segundos. Solo se admiten JavaScript y TypeScript autónomos, no imports de Node o Playwright. TypeScript se transpila; el chequeo semántico strict completo sigue disponible en el kit mediante tsc. Las aserciones y errores de ejecución son reales.

Los escenarios UI actúan sobre una instancia de QA Store y hacen peticiones al sandbox. La simulación 503 se limita a la ventana de prueba y se retira al finalizar. El motor es el navegador de la persona: no se presenta como el runner Playwright ni como GitHub Actions. El spec exportado permite ejecutar el mismo caso en Playwright con el kit. Los jobs remotos, trazas de Playwright, Git y pipelines externos continúan con las herramientas del kit.

Guardar evidencia conserva la configuración y el último resultado, con fecha, en el mecanismo existente de progreso. Puede guardarse una ejecución fallida para documentar un defecto. Eso no otorga aprobación automática de la semana. La descarga de resultados mantiene la salida completa; la evidencia limita la salida a 2500 caracteres y conserva el límite existente de 8000 caracteres del documento.

Verificación: `practice-execution.spec.ts` prueba SQL real, errores, aserciones, aislamiento de red, límites de tiempo, restauración, ejecución UI, descargas y conservación de preparación e instrucciones en las 24 semanas.
