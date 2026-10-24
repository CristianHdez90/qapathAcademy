# MariBug — asistente de QA Engineer

Botón de mariquita SVG en todas las páginas, esquina inferior derecha; en móvil queda sobre la navegación inferior. Chat para estudiantes, instructores y administradores con sesión completa. Los invitados pueden abrirlo y acceder a iniciar sesión.

## Activar en Vercel

1. Crea una clave de Gemini API en https://aistudio.google.com/api-keys con un proyecto en modalidad gratuita. Esta clave es distinta de `FIREBASE_WEB_API_KEY`. No actives facturación para este despliegue si deseas mantener el uso gratuito.
2. En el proyecto **API / NestJS**, Environment Variables → Production, agrega:

```dotenv
QA_AI_ENABLED=true
GEMINI_API_KEY=tu_clave_privada_de_gemini
QA_AI_MODEL=gemini-2.5-flash
```

3. Despliega nuevamente la API y el frontend con los cambios del repositorio. La clave nunca debe tener prefijo `NEXT_PUBLIC_`, ir a Git ni compartirse en el chat.
4. Inicia sesión y pulsa la mariquita «MariBug». Pregunta, por ejemplo: «Diseña casos de prueba para un login con bloqueo tras cinco intentos».

Sin clave o con el servicio desactivado la academia funciona normalmente y el chat informa que falta configurar la IA. No hay respuestas simuladas. Para desactivar basta establecer `QA_AI_ENABLED=false` y redesplegar la API.

Si el proyecto responde `NOT_FOUND`, consulta `models.list` con la misma clave y elige un modelo que admita `generateContent` y tenga cuota gratuita para tu proyecto. Por ejemplo, `QA_AI_MODEL=gemini-3.8-flash` si está disponible. Cambiar la variable requiere redesplegar la API. El código solo envía `thinkingBudget: 0` a Gemini 2.5 Flash/Flash-Lite; para otros modelos mantiene la configuración de razonamiento predeterminada del proveedor. Una consulta de metadatos con `models.get` no confirma cuota ni generación de respuestas.

Gemini ofrece acceso gratuito limitado según modelo, región y proyecto. Las cuotas reales se consultan en AI Studio y pueden ser menores que los límites de la aplicación. No se configura una cuenta de pago, no se habilita facturación y no se cambia automáticamente a modelos de pago desde el código. Documentación: https://ai.google.dev/gemini-api/docs/pricing y https://ai.google.dev/gemini-api/docs/rate-limits.

## Funcionamiento y límites

- `POST /api/v1/assistant/chat`, protegido por los guardas existentes de sesión completa y origen. Los desafíos pendientes de MFA no dan acceso. El frontend usa el proxy existente, sin nuevas URLs públicas.
- Instrucción de sistema: QA manual, técnicas de diseño, bugs, API, SQL, Scrum, accesibilidad, Playwright, TypeScript y CI/CD. No ejecuta código ni modifica usuarios, progreso o calificaciones. No dispone de navegación ni de acceso automático al contenido de las lecciones.
- Hasta 2000 caracteres por pregunta desde la UI, con dos intercambios previos acotados como contexto. Solo se envía una ruta conocida sin query ni hash. La IA puede equivocarse: hay que revisar el resultado antes de usarlo.
- Reservas persistentes en `admin_audit_events`: 5 consultas por minuto y 20 al día por usuario, máximo 100 diarias en toda la academia. El día reinicia a las 00:00 UTC. Las reservas se serializan en PostgreSQL para funcionar con múltiples instancias de Vercel; los intentos fallidos también consumen reserva. Se reutiliza el esquema existente, sin migraciones.
- Se guarda únicamente quién solicitó una consulta y cuándo. No se guardan preguntas ni respuestas en PostgreSQL, logs propios o localStorage; la conversación vive en memoria y desaparece al recargar, limpiar o cambiar de identidad.
- Las preguntas y el contexto de conversación se envían a Google Gemini. En modalidad gratuita Google indica que el contenido puede usarse para mejorar sus productos. No enviar secretos, datos personales ni información confidencial de clientes.
- Renderizado como texto y bloques de código, sin HTML generado ni enlaces ejecutables. Timeout de proveedor de 25 segundos; errores de configuración, red, cuota y respuestas vacías se muestran sin revelar claves o respuestas crudas del proveedor.

## Validación

`node --test tests/qa-assistant.test.mjs` cubre validación de entradas, límites, integración HTTP del adaptador con proveedor simulado, errores y reserva de cuota. La clave real se configura por el propietario en Vercel: las pruebas locales no consumen tokens de una cuenta real.
