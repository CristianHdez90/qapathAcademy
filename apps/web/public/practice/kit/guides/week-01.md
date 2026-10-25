# Semana 1 · De la HU al caso de prueba

Analizar una HU con criterios y escenarios BDD, diseñar una matriz de casos con acciones secuenciales y ejecutar un caso por cada ejemplo de técnica.

1. Analiza la HU: identifica reglas, entradas, estados y resultados que permitan decidir si una transferencia es correcta.
   Resultado esperado: Trazabilidad entre CA-01 a CA-04 y las condiciones que se deben probar.

2. Revisa los cinco ejemplos: partición válida, partición inválida, valores límite, tabla de decisión y transición de estado.
   Resultado esperado: Un objetivo de prueba y datos representativos por ejemplo; amplía los casos si necesitas más cobertura.

3. Completa al menos un caso por cada ejemplo en la tabla: técnica, criterio, título, precondiciones, datos JSON, acciones numeradas y resultado esperado.
   Resultado esperado: Cinco casos distintos como mínimo. Los pasos indican cómo preparar, ejecutar y comprobar; no son Given/When/Then.

4. Ejecuta los casos. Opcionalmente simula el defecto; si un caso falla, vincula un bug y repite después de desactivar el defecto.
   Resultado esperado: El obtenido y el estado provienen de la ejecución. El reporte de bug conserva pasos, esperado y obtenido.

5. Pulsa Validar práctica cuando cada ejemplo tenga un caso completo y ejecutado.
   Resultado esperado: Cobertura 5/5 y validación guardada; los borradores incompletos se pueden guardar sin completar la práctica.

La HU, sus criterios y los cinco ejemplos completos se encuentran en /practice/1. Conserva cada caso fallido y el bug asociado antes del retest.
