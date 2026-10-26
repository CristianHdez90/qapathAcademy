# Configuración de MariBug: Groq y Gemini

Administración → Configuración de IA permite activar el servicio, seleccionar proveedor, modelo, URL base, temperatura y máximo de tokens. Guarda los cambios antes de pulsar **Probar conexión de IA**. La prueba envía una pregunta breve sobre QA y usa una consulta de la cuota existente; también funciona con MariBug desactivada.

## Preparación del servidor

1. Aplica la migración aditiva `007_qa_ai_settings.sql` con `pnpm db:migrate` en la base de datos del entorno que despliegues.
2. Define `QA_AI_ENCRYPTION_KEY` como 32 bytes aleatorios representados por 64 caracteres hexadecimales. Si se omite, se usa la clave existente `MFA_ENCRYPTION_KEY`. No publiques esas variables ni las cambies sin volver a guardar las credenciales cifradas. La clave debe ser estable entre despliegues e instancias.
3. Despliega API y web. Inicia sesión con una cuenta ADMIN (incluye MFA según las reglas existentes).
4. Selecciona Groq. Usa URL `https://api.groq.com/openai/v1` y modelo `openai/gpt-oss-20b`. Introduce la clave en el campo protegido o configura `GROQ_API_KEY` únicamente en el servidor. Guarda y prueba la conexión.

Sin configuración guardada, se usan `QA_AI_ENABLED`, `QA_AI_PROVIDER`, `QA_AI_MODEL`, `QA_AI_BASE_URL` y la clave del proveedor. El proveedor por defecto sigue siendo Gemini para conservar la instalación anterior. Ejemplo para iniciar con Groq:

```dotenv
QA_AI_ENABLED=true
QA_AI_PROVIDER=groq
QA_AI_MODEL=openai/gpt-oss-20b
QA_AI_BASE_URL=https://api.groq.com/openai/v1
# GROQ_API_KEY: definir como secreto del entorno, nunca en el repositorio.
```

La configuración guardada en PostgreSQL tiene precedencia. Las claves guardadas se cifran con AES-256-GCM y no se devuelven por la API. Un campo vacío conserva la clave de ese proveedor. Quitar la clave guardada recupera el uso de su variable del servidor, si existe. Las claves de Groq y Gemini se conservan por separado al cambiar de proveedor. La revisión de configuración evita sobrescribir cambios de otra sesión; recarga si ocurre un conflicto.

La API permite exclusivamente las URL oficiales indicadas para evitar enviar claves a otros destinos. La prueba usa la configuración guardada, no valores sin guardar. Se registran cambios administrativos y reservas de cuota, sin claves, texto de preguntas ni respuestas del proveedor en la auditoría de configuración.

Groq usa `POST /openai/v1/responses`, con instrucciones de MariBug y conversación completa. El servidor agrega únicamente bloques `message / assistant / output_text`; los bloques de razonamiento no se exponen. No usa `previous_response_id`, herramientas ni el parámetro `store`, que Groq no admite actualmente. Gemini conserva `generateContent`.

Documentación del proveedor: https://console.groq.com/docs/responses-api
