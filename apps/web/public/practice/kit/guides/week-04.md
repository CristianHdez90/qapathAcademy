# Semana 4 · Particiones y fronteras de una contraseña

Abre /practice/4. La regla de entrenamiento acepta entre 8 y 20 caracteres, ambos incluidos, y al menos un dígito de 0 a 9. No mide la seguridad de contraseñas.

## Prepara, predice y ejecuta

1. Elige un desafío y lee qué condición debes aislar.
2. Pulsa Preparar dato de este desafío o escribe letras y dígitos ficticios. Observa longitud y presencia de dígito.
3. Predice Aceptar o Rechazar antes de ejecutar.
4. Pulsa Ejecutar mi predicción. Compara esperado y obtenido; revisa la explicación y reintenta si es necesario.

## Siete desafíos

- 7 caracteres con dígito: justo por debajo del mínimo; se rechaza.
- 8 caracteres con dígito: mínimo incluido; se acepta.
- 20 caracteres con dígito: máximo incluido; se acepta.
- 21 caracteres con dígito: justo por encima del máximo; se rechaza.
- 12 caracteres con dígito: representante interior de la partición válida; se acepta.
- 12 letras sin dígito: longitud válida, pero falta un dígito; se rechaza.
- Entrada vacía: no cumple ninguna de las dos condiciones; se rechaza.

Las fronteras muestran dónde cambia el comportamiento. Las particiones agrupan entradas con condiciones comunes. Para estudiar una regla, mantén las demás condiciones controladas.

## Interpreta el resultado

Un rechazo esperado puede ser una prueba exitosa. Una predicción equivocada no demuestra un bug: revisa el requisito antes de reportarlo.

Cada desafío cuenta cuando el dato corresponde a su objetivo y la predicción coincide con el validador. Reintentar sustituye su última ejecución. Editar sin ejecutar no cambia la evidencia.

## Guarda tu bitácora

En Guardar y revisar evidencia revisa los experimentos, explica las particiones y fronteras y previsualiza el informe. Los datos, predicciones, resultados y fechas se adjuntan automáticamente. Las pistas no rellenan las respuestas.

Guarda borradores para continuar después o descarga tu informe Markdown. Al cubrir los siete desafíos, pulsa Finalizar práctica para completar la etapa del recorrido. Esta actividad no utiliza una matriz de casos de prueba.
