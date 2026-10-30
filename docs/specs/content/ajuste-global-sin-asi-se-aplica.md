# Retirada global de «Así se aplica»

2026-10-29 · Instrucción explícita del usuario: quitar esa sección de todas las tarjetas y todos los módulos. Sustituye las decisiones anteriores de conservar la secuencia animada o sus globos.

## Cambio

Se retiró la sección completa del componente compartido `ReadingConcepts`: título, estados visuales, animación, mensajes y controles Ver/Pausar/Continuar/Repetir. Aplica a las tarjetas de conceptos y ejemplos guiados de las 24 semanas / ocho módulos, tanto por capítulos como en el modo enfocado. Se retiraron también el componente/CSS de demostración y su estado de reproducción en el lector y la referencia pasiva.

Se conservan títulos, descripciones, iconos de cabecera, ejemplos y contraejemplos. Sus estilos se mantienen en `reading-concepts.css`. Los datos originales de secuencia y fichas se conservan en la fuente y descarga; no se editó el JSON curricular por este ajuste. Notas, evaluación, guardado, IDs, navegación y reglas académicas no se modificaron.

## Validación local

- **226/226 pruebas Node aprobadas**, incluida una nueva prueba de renderizado real con React de los **266 conceptos** de las 24 guías: conserva todos sus ejemplos y no genera «Así se aplica», controles de animación ni la sección de demostración.
- Tipos API/web aprobados. La primera ejecución de lint detectó el nombre de variable `module` en la prueba nueva; se corrigió a `curriculumModule`. `pnpm lint` y `pnpm build` finalizaron después con salida 0.
- **24/24 pruebas de navegador aprobadas**, 12 por motor Chromium/WebKit, en servidores compilados aislados 3013/4013. Incluyen una clase de cada módulo, vista enfocada y referencia de lectura, ausencia de elementos flotantes, conservación de descargas y lectura de un capítulo largo en móvil tras recorrer su contenido.
- Se retiraron las expectativas de animación, cuya funcionalidad fue cancelada por el usuario. Se conservaron las pruebas de descarga y lectura; el test de capítulo largo ahora recorre el contenido completo en lugar de esperar crédito al mirar únicamente la primera tarjeta. No se relajaron umbrales de lectura.

Evidencias en `C:/Users/ingcr/.codex/visualizations/2026/10/24/01a16b4f-61a0-7942-86a7-5e0a94117322/`: `tarjetas-sin-asi-se-aplica.png`, `sin-asi-se-aplica-node-tipos.log`, `sin-asi-se-aplica-lint-build.log`, `sin-asi-se-aplica-e2e.log`.

Trabajo local: sin commit, push ni despliegue. No constituye una auditoría completa de accesibilidad o rendimiento ni una validación pedagógica independiente.
