# Preparación ISTQB Foundation Level

Módulo complementario en `/certification/istqb`, accesible desde Ruta de aprendizaje y Recursos. Conserva los ocho módulos y las 24 semanas existentes.

## Contenido

Seis capítulos de repaso con lecturas, práctica guiada, solución razonada y confusiones habituales. Banco original de 40 preguntas, con referencia de objetivo de aprendizaje y nivel cognitivo: 8 K1, 24 K2 y 8 K3. Las preguntas son ejercicios de QAPath; no se copian preguntas de exámenes oficiales y no se afirma acreditación.

El simulacro utiliza el mismo banco que las autoevaluaciones, aleatoriza el orden y distribuye las preguntas por capítulos en 8/6/4/11/9/2. Una respuesta por pregunta, un punto por acierto, objetivo de 26/40 (65%), 60 minutos y entrega automática al agotarse el tiempo. Se ofrece una opción de práctica de 75 minutos; la elegibilidad oficial para tiempo adicional debe confirmarse con el proveedor del examen.

Se pueden revisar y cambiar respuestas antes de entregar. Las omisiones cuentan como incorrectas; la entrega manual con omisiones requiere confirmación. Después aparecen explicaciones, respuesta elegida, respuesta correcta y desempeño por capítulo. Un intento en curso se reinicia al abandonar la página.

## Persistencia

Los mejores resultados se guardan automáticamente al entregar mediante el comando existente `submit-evidence`, con `kind: certification` e identificadores `ctfl-chapter-1` a `ctfl-chapter-6` y `ctfl-mock`. Se aprovecha el JSONB existente de progreso; no se requiere migración SQL. Los estudiantes sincronizan con su cuenta, los invitados guardan en su navegador y los otros roles pueden practicar sin registrar progreso estudiantil.

Son resultados de autoestudio calculados en el cliente, no calificaciones certificadas. No incrementan semanas completas ni el porcentaje de la ruta profesional. El contador complementario cuenta capítulos cuya autoevaluación alcanza 65% sin redondear el umbral. Para activar persistencia en producción se debe publicar tanto la API (nuevo tipo permitido de evidencia) como el frontend.

## Referencias oficiales

Verificadas el 24 de octubre de 2026:

- [CTFL: estructura y exámenes de muestra](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/).
- [Temario CTFL v4.0.1](https://istqb.org/?download_id=3345&sdm_process_download=1). El temario y sus derechos pertenecen a ISTQB y sus autores.
- [Estructura y reglas de examen, tablas v1.19](https://istqb.org/?download_id=3832&sdm_process_download=1).
- [Glosario ISTQB](https://glossary.istqb.org/).

El contenido propio es un repaso con ejemplos; se enlaza el material oficial para consultar todos los objetivos examinables y practicar con sus muestras.

## Validación

`tests/ctfl.test.mjs` comprueba distribución, integridad del banco, umbral de aprobación, omisiones y compatibilidad de la persistencia con la ruta existente. `apps/web/tests/e2e/ctfl.spec.ts` comprueba autoevaluación, restauración de resultados, reintento de sincronización, entrega por tiempo y diseño a 320px en Chromium y WebKit. `tests/ctfl-persistence.integration.mjs` verifica escritura y recuperación con PostgreSQL temporal local, sin modificar Neon; está incluido en el runner de integración existente.
