# Semana 5 · Reporte, triage y ciclo de vida del bug

Completar un reporte reproducible y recorrer asignación, corrección, retest, reapertura y cierre con evidencia.

Herramientas: Reporte de bug, Tablero de estados, Retest de transferencia

## Preparación

- Abre el laboratorio interactivo de esta semana y configura sus datos ficticios. No requiere instalar herramientas.
- Conserva el kit de apoyo como alternativa y registra evidencias de ejecución en la matriz y el espacio de esta actividad.

## Ejecución

1. Completa título, precondiciones, pasos, esperado 150 y obtenido 195 del defecto de transferencia. Reporta el bug.
   Resultado esperado: El bug pasa de Sin reportar a Nuevo y conserva los datos para reproducirlo.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Realiza triage, asigna un responsable, inicia la corrección y marca listo para retest.
   Resultado esperado: El historial contiene cada transición, responsable, fecha y motivo; no se salta directamente al cierre.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Mantén el defecto activo y ejecuta el retest.
   Resultado esperado: La transferencia sigue devolviendo 195 frente a 150; el estado cambia a Reabierto.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Inicia otra corrección, marca listo para retest, desactiva el defecto y vuelve a ejecutar.
   Resultado esperado: El resultado es 150 y el bug se cierra con evidencia; añade regresión de otros importes en tu matriz.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Casos o configuraciones ejecutados con resultado esperado, obtenido, estado y fecha.
- Conclusión sobre el tema de la semana, errores encontrados y evidencia que permita reproducirlos.

## Criterios

- La actividad usa los conceptos y herramientas de esta semana.
- Las conclusiones se sustentan en resultados ejecutados, sin inventar evidencia.
- Se mantiene separado el resultado esperado del obtenido.
