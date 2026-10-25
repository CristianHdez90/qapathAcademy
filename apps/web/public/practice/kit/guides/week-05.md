# Semana 5 · Reporte, triage y ciclo de vida del bug

Abre /practice/5. Es una misión local de entrenamiento: no transfiere dinero ni crea tickets externos.

## 1. Reproduce el fallo

Saldo inicial 200, transferencia de 50. Pulsa Reproducir fallo: el esperado es 150 y el obtenido es 195. La operación que resta 5 es el defecto; el saldo incorrecto visible es el fallo observable.

## 2. Arma un reporte reproducible

- Resumen: título concreto y descripción del error.
- Reproducción: entorno/versión, precondiciones y al menos tres acciones numeradas, una por línea.
- Clasificación: severidad según impacto y prioridad según urgencia.

El esperado y el obtenido se incorporan automáticamente desde la reproducción. Las pistas orientan; no rellenan los campos. Después de reportarlo, el reporte queda disponible para consulta y las nuevas acciones se registran en el historial.

## 3. Sigue el ciclo

1. Reportar bug → Nuevo.
2. Realizar triage → En análisis.
3. Seleccionar equipo y asignar corrección → Asignado.
4. Iniciar corrección → En corrección.
5. Marcar listo para retest → Listo para retest.
6. Ejecutar retest de la versión inicial → obtiene 195 en vez de 150; Reabierto.
7. Iniciar corrección y aplicar la corrección simulada: saldo − importe.
8. Entregar v2 y ejecutar retest → obtiene 150; Verificado.
9. Elegir otro importe, predecir su saldo y comprobar regresión.
10. Cerrar bug con evidencia → Cerrado.

En la primera entrega el fallo persiste deliberadamente para aprender la reapertura. El retest repite los datos originales; la regresión comprueba otro importe después de corregir.

## Tu evidencia

La bitácora muestra el reporte, el historial, los dos retests y la regresión. Las reflexiones son opcionales y se pueden guardar como borrador. Descarga el informe Markdown para conservar tu trabajo.

Reportar, asignar o guardar un borrador no completa el recorrido. Cierra la misión y pulsa Finalizar práctica. Esta actividad no utiliza una matriz de casos de prueba.
