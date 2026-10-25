# Semana 1 · Mentalidad QA: transferencia, defecto y fallo

Ejecutar una transferencia bancaria de entrenamiento, distinguir error, defecto y fallo, y documentar casos con esperado y obtenido.

Herramientas: Laboratorio de transferencia, Matriz de casos

## Preparación

- Abre el laboratorio interactivo de esta semana y configura sus datos ficticios. No requiere instalar herramientas.
- Conserva el kit de apoyo como alternativa y registra evidencias de ejecución en la matriz y el espacio de esta actividad.

## Ejecución

1. Configura saldo inicial 200, importe 50 y saldo esperado 150. Ejecuta la actividad del tema.
   Resultado esperado: La implementación correcta devuelve 150 y el caso se aprueba.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

2. Activa Mantener defecto de transferencia y vuelve a ejecutar sin modificar el esperado.
   Resultado esperado: La implementación defectuosa resta 5 y devuelve 195: el caso falla; se distingue el código defectuoso del saldo incorrecto observado.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

3. Completa cuatro casos en la matriz con título, precondiciones, pasos Given/When/Then, resultado esperado y resultado obtenido.
   Resultado esperado: El esperado se define antes de ejecutar; cada registro incluye estado y evidencia de su ejecución.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

4. Desactiva el defecto, repite el caso y explica qué documentarías en el reporte del bug.
   Resultado esperado: El retest devuelve 150; el reporte enlaza el caso, los pasos, el esperado 150 y el obtenido 195 de la ejecución fallida.
   Resultado obtenido: completar después de ejecutar; incluir estado, fecha y evidencia.

## Entregables

- Casos o configuraciones ejecutados con resultado esperado, obtenido, estado y fecha.
- Conclusión sobre el tema de la semana, errores encontrados y evidencia que permita reproducirlos.

## Criterios

- La actividad usa los conceptos y herramientas de esta semana.
- Las conclusiones se sustentan en resultados ejecutados, sin inventar evidencia.
- Se mantiene separado el resultado esperado del obtenido.
