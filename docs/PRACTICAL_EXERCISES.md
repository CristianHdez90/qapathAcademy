# Ejercicios prácticos adicionales

Se añade un ejercicio por cada una de las 24 semanas. El catálogo, las lecturas, los ejemplos de práctica guiada, las preguntas de selección, los retos, los laboratorios y sus reglas de finalización anteriores permanecen sin cambios.

Los ejercicios viven en `libs/content/src/data/practical-exercises.json` y se combinan con la guía al consultar una lección. Cada módulo enlaza a las prácticas de sus semanas. La clase permite expandir el ejercicio y descargar el material; su exportación Markdown incluye también los pasos adicionales.

| Semanas | Ejecución y entregables |
| --- | --- |
| 1–2 | Resultados esperados/observados, matriz de casos y priorización por riesgo. |
| 3–6 | Criterios verificables, límites, decisiones, bug reproducible, retest y trabajo de Sprint. |
| 7 | Postman: códigos HTTP, permisos ficticios, contrato, errores y CSV. |
| 8 | SQL con tablas temporales, JOIN, agregaciones, DevTools y Git. |
| 9–12 | Unit tests, JSON, TypeScript estricto, validación runtime y errores asíncronos. |
| 13–16 | Playwright UI, locators accesibles, debugging y matriz de navegadores. |
| 17–20 | Page Objects, fixtures, aislamiento, API y mocks con recuperación. |
| 21–24 | Pipeline, artifacts, métricas, trazabilidad, proyecto integrador y demo profesional. |

## Entorno ejecutable

`/practice` ofrece QA Store: cotizador ficticio y explorador HTTP. `/api/v1/practice/*` es un sandbox público y stateless, separado de usuarios y pedidos reales. Solo devuelve fixtures y cálculos; no consulta PostgreSQL ni procesa pagos. No acepta una URL de destino, código o SQL para ejecutar en el servidor.

- `GET products`: tres productos ficticios.
- `POST quotes`: 200 para cotizaciones válidas, 400 para tipos/campos inválidos, 404 para producto inexistente, 409 para agotado y 422 para reglas de negocio.
- `GET status/:code`: simulación controlada de 200/201/202/204/400/401/403/404/409/422/429/500/503. 204 sin cuerpo; 429/503 con Retry-After: 5. 201 no crea un recurso persistente.
- `GET access?scope=read|write`: los tokens públicos `demo-reader` y `demo-admin` ilustran 401/403/200. No son JWT, sesiones ni permisos reales de la academia.

El defecto opcional afecta solo al total mostrado en la UI del cotizador. Para basic × 3 + QA10 + delivery, la API calcula 104500 COP; la variante defectuosa muestra 103500 COP. Se puede desactivar para realizar el retest.

## Kit descargable

`apps/web/public/practice/kit/` contiene una colección Postman de 27 solicitudes, 8 filas CSV/JSON, plantillas de casos, resultados sintéticos, SQL, funciones Node.js, pruebas unitarias, specs UI/API/network, Page Object, fixture, configuración de tres navegadores, README y workflow de GitHub Actions.

La colección descargada desde el entorno web utiliza el origen actual como baseUrl. El kit estático usa el dominio de QAPath como ejemplo y explica cómo cambiar BASE_URL. La instalación del alumno genera su package-lock.json; debe versionarlo para usar npm ci en CI.

Tras editar los archivos del kit, regenerar el ZIP desde PowerShell en la raíz:

```powershell
Compress-Archive -Path apps/web/public/practice/kit/* -DestinationPath apps/web/public/practice/qapath-practice-kit.zip -Force
```

## Evidencia y compatibilidad

Se guarda mediante `submit-evidence`, `kind: exercise`, ID de semana 1–24, en `evidence["exercise:7"]`. Se reutilizan almacenamiento JSONB, guardado/reintento y separación por cuenta existentes. No requiere migraciones SQL.

La evidencia adicional tiene un contador propio por módulo y no cambia el porcentaje ni los requisitos de semanas completadas anteriormente. Las evidencias task/lab y las cinco etapas actuales conservan su comportamiento. Importar un respaldo autenticado continúa recuperando solo notas, sin otorgar finalización ni evidencia no verificada.

La plataforma registra lo entregado; no certifica automáticamente que un estudiante ejecutó Postman o una terminal externa. Los criterios de calidad y entregables permiten revisar ese trabajo.

## Validación

- `node --test tests/*.test.mjs`: cobertura, contratos, preservación de avance y reglas existentes.
- `pnpm test:e2e:firebase`: base local desechable, persistencia en PostgreSQL, regresiones y pruebas Chromium/WebKit.
- `pnpm test:e2e:firebase --practice-only`: colección Postman contra HTTP real local, fixtures de datos, evidencia, responsive y ejecución de los propios specs descargables del kit.

El runner rechaza Neon y producción. Los fixtures SQL se ejecutan en una base de práctica con tablas TEMP y ROLLBACK; no son tablas de la academia.

Referencias: [Postman scripts](https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-examples/), [Playwright assertions](https://playwright.dev/docs/test-assertions), [GitHub Actions con Node.js](https://docs.github.com/en/actions/tutorials/build-and-test-code/nodejs).
