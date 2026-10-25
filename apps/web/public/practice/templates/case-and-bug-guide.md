# Del caso de prueba al ciclo de vida del bug

1. Define ID, título, precondiciones, datos y pasos Given/When/Then.
2. Escribe el esperado desde la regla antes de ejecutar. Registra el obtenido después, junto con estado, fecha y evidencia.
3. Si difiere, verifica datos y ambiente y reproduce. Un rechazo esperado no es un bug.
4. Reporta con título, descripción, precondiciones, pasos, esperado, obtenido, ambiente y evidencia. Vincula caso y bug.
5. Realiza triage, asigna, inicia corrección y marca listo para retest. Si persiste, reabre con evidencia; si pasa, cierra y ejecuta regresión.

## Ejercicio de fundamentos y QA manual
En el laboratorio de transferencia de las semanas 1 y 5, usa saldo 200 e importe 50. Esperado: 150. Con el defecto activo, se restan 5 y se obtiene 195. El saldo incorrecto es el fallo observable. Reporta el bug, recorre sus estados y ejecuta retest. Desactiva el defecto para obtener 150 y cerrar con evidencia.

## Actividad propia de cada tema
Semana 2: riesgos y niveles. Semana 3: historia y regla de acceso. Semana 4: contraseñas y fronteras. Semana 6: Sprint, métricas y DoD. Cada una tiene controles y ejecución específicos. No sustituyas estas actividades por el cotizador del módulo de herramientas.

Las plantillas son hojas de trabajo; la plantilla de importación Xray está disponible por separado.
