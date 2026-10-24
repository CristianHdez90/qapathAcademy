# Historial de Lía QA

Cada cuenta conserva sus conversaciones en PostgreSQL y puede recuperarlas desde otros dispositivos. Al volver a la aplicación se abre la conversación activa más reciente.

- Nueva: inicia un hilo independiente; el anterior permanece en el historial.
- Historial: permite abrir conversaciones activas o archivadas y cargar más páginas.
- Archivar: conserva los mensajes y deja el hilo disponible para consulta.
- Restaurar: permite seguir escribiendo en una conversación archivada.
- Maximizar chat: amplía la ventana sin perder mensajes, borrador ni la vista del historial. En móvil ocupa toda la pantalla. El botón Restaurar tamaño devuelve la ventana flotante; Escape restaura primero el tamaño y, en modo normal, cierra el asistente.

Se conservan hasta 100 pares de pregunta/respuesta por conversación. Solo se guarda una pareja completa tras una respuesta exitosa. Los errores mantienen el borrador en el formulario. Gemini recibe un contexto reciente acotado; el transcript completo permanece en el historial. Consultar, archivar y restaurar no llama a Gemini.

Todos los endpoints requieren sesión y filtran por el usuario autenticado. Las revisiones impiden sobrescribir respuestas desde pestañas concurrentes. Los mensajes no se guardan en localStorage ni se incluyen en logs.

## Despliegue

Antes de desplegar API y frontend, ejecutar `pnpm.cmd db:migrate` con DATABASE_URL apuntando a la misma base Neon de la API. Se aplicará 006_qa_conversations.sql. No se necesitan nuevas claves ni servicios externos. Las conversaciones anteriores que ya se perdieron al recargar no pueden recuperarse.

## Verificación

`pnpm.cmd test:e2e:firebase` crea una base local desechable, aplica las migraciones, compila ambos proyectos y ejecuta pruebas de persistencia y permisos, Firebase emulado y Chromium/WebKit. Rechaza conexiones a Neon o producción. Gemini se sustituye por respuestas de prueba.
