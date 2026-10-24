# Avance automático de aprendizaje

Una semana se completa únicamente cuando se registran todos estos requisitos:

1. Lectura de los tres capítulos y el ejemplo guiado: cada sección debe estar visible durante al menos tres segundos, con pestaña visible y ventana enfocada. El tiempo se acumula solo mientras la sección está visible. Es un indicador de recorrido del contenido, no una prueba de comprensión.
2. Respuesta correcta a la autoevaluación de la clase. La API compara la respuesta con las reglas académicas; no recibe una calificación enviada por el estudiante.
3. Evidencia textual de cada entregable de la semana (40–8000 caracteres).
4. Evidencias de los laboratorios asociados al módulo.
5. Evaluación del módulo con una calificación mínima del 70 %, calculada en el backend para las cuentas de estudiantes. Se conserva la mejor calificación.

Los entregables y laboratorios abiertos se registran como **entregados**, no como corregidos ni aprobados automáticamente. El sistema comprueba presencia y longitud de la evidencia, no su calidad académica. No ejecuta repositorios, código ni enlaces enviados. La lectura es telemetría del navegador, por lo que no certifica identidad ni evita una manipulación deliberada del cliente.

El cálculo es compartido por el dominio de progreso, el navegador invitado, PostgreSQL y el panel administrativo. La API rechaza la marcación manual de semanas, lecturas, tareas y laboratorios. El checklist organizativo del proyecto final se mantiene independiente del porcentaje de la ruta.

## Datos existentes

No se necesita una migración SQL: los nuevos campos se almacenan en el estado JSONB existente. Al leer y actualizar se recalculan los campos derivados. Las antiguas casillas manuales dejan de otorgar avance; se conservan las notas y calificaciones existentes, pero será necesario registrar las nuevas evidencias y lecturas. El porcentaje puede bajar al aplicar estas reglas.

Las importaciones a una cuenta autenticada recuperan **solo las notas**. Un archivo del navegador no puede otorgar semanas, lecturas, entregables o calificaciones. Los invitados pueden mantener un respaldo local, pero su importación no se considera evidencia válida para una cuenta autenticada.

Los textos de evidencias se guardan en el estado de progreso de la cuenta; no deben contener secretos ni datos personales de terceros. Los eventos de auditoría guardan identificadores de actividad, sin copiar el texto enviado.

Las reglas en `libs/progress/src/domain/learning-rules.ts` se verifican contra el catálogo y las guías en las pruebas. Si cambian los módulos, tareas, capítulos o respuestas, deben actualizarse estas reglas junto al contenido.
