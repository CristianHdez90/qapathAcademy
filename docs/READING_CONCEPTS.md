# Tarjetas de la ruta de aprendizaje

Las 24 semanas de los ocho módulos incluyen 262 tarjetas entre lecturas y casos guiados. Cada tarjeta contiene una explicación ampliada, un ejemplo original de situación laboral (contexto, acción QA y resultado) y una secuencia de tres pasos que representa el concepto. Las 48 tarjetas originales de Fundamentos se conservan. Son situaciones ilustrativas, no atribuciones de incidentes a empresas reales.

El contenido vive en `study-guides.json` mediante `ReadingConcept`. Los ejemplos y las secuencias también se incluyen en la descarga Markdown y en la guía de estudio. No cambia el número de capítulos ni los requisitos de finalización del módulo.

Cada paso de la secuencia tiene un icono SVG correspondiente a su acción y una etiqueta con su número. La paleta se define en `concept-step-icon.tsx`: por ejemplo, SDLC utiliza diseño/código/lanzamiento y STLC planificación/ejecución/evaluación. Las nuevas tarjetas declaran `demonstration.icons`, una lista de tres claves de la paleta, para adaptar su secuencia al tema sin añadir identificadores al componente. Los iconos complementan las descripciones, no las sustituyen, y heredan el estado visual de la animación.

## Movimiento

La animación comienza automáticamente cuando su secuencia entra en la zona visible al desplazarse, o al acercar el puntero o dar foco de teclado a la tarjeta visible. Dura seis segundos y se puede pausar, continuar y repetir. Se pausa al salir de pantalla o al ocultarse la pestaña; vuelve a activarse al regresar. La pausa manual se respeta hasta pulsar Continuar. No se repite indefinidamente mientras la tarjeta permanece visible, pero puede repetirse al volver a ella con el puntero, foco o desplazamiento. Los pasos siempre permanecen legibles. Con `prefers-reduced-motion: reduce` se presenta la secuencia estática y se desactiva el control de movimiento. Las animaciones usan CSS local, sin servicios externos.

Reproducir una animación no otorga avance de una semana. El seguimiento conserva el tiempo de lectura y, para capítulos más altos que la pantalla, calcula visibilidad respecto a la altura visible en lugar de exigir mostrar un porcentaje imposible del capítulo completo.

## Comprobación

- `tests/reading-concepts.test.mjs`: todas las tarjetas tienen contenido y ejemplos propios y secuencias de tres pasos.
- `apps/web/tests/e2e/reading-concepts.spec.ts`: controles, movimiento reducido, descarga, presentación móvil y seguimiento de capítulos largos en Chromium y WebKit.

Para revisar localmente: `/study/1` a `/study/24`, desde fundamentos y QA manual hasta API, JavaScript, TypeScript, Playwright, arquitectura, CI y proyecto final. El caso guiado conserva sus pasos originales ampliados y sus muestras de código. Publicar API y frontend actualizados; no se requiere migración SQL ni variables adicionales.
