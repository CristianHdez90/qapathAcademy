# CONTENT-210 · G0–G2 · Baseline y fuentes

Fecha de consulta: **2026-10-28, America/Bogota**. Estado: DOCUMENTATION_ONLY, propuesta para G3. Autoriza únicamente documentos en `docs/specs/content/`. No es autorización de implementación ni publicación.

## 1. Alcance y método

Se leyó SPEC-CONTENT-210 v1.0.0 y se contrastaron catálogo, las 24 guías completas por secciones/conceptos y ejemplos guiados, contratos públicos, componentes, rastreadores, exportación y archivos de pruebas. Se hicieron lecturas y recuentos estáticos; **no se ejecutaron tests, compilación, lint, SQL, navegadores de prueba, instalación ni migración**. Por instrucción del propietario, la ejecución de pruebas queda para el final de la implementación aprobada del SPEC. El plan describe esas pruebas, no certifica resultados.

G0: baseline y evidencia de código documentados. G1: auditoría preliminar completa del inventario, fuentes y brechas documentada; falta revisión humana independiente. G2: capítulo, contrato y experiencia propuestos. G3–G7: no ejecutados. Los ejemplos y resultados calculados del piloto son ficticios y no son ejecuciones de QAPath.

### Identidad del workspace

- HEAD: `5dcbdf45b5b21b43d8f99ae01e0e62dbaa6c60c2`, rama `codex/fix-ci-lint`.
- Hay modificaciones y archivos locales de UX-120 anteriores a esta tarea. **HEAD no representa por sí solo el código auditado**: se leyó también el árbol de trabajo, incluyendo `focused-study`, `reading-reference` y `reading-text-map`.
- No se comprobó sincronización con GitHub o producción. El SPEC de entrada está sin seguimiento en esta captura; no se modifica.
- SPEC-CONTENT-200, su plantilla independiente y SPEC-UX-140 **no se localizaron** mediante búsqueda de nombres en `docs/specs/`. No se atribuye aprobación ni contenido a documentos ausentes; véase D01 de [decisiones](00-decisiones-pendientes.md).
- Se tomó una huella inicial de **647 archivos** presentes, versionados o no ignorados por Git, excluyendo `docs/specs/content/`; no incluye dependencias, builds ni archivos ignorados como secretos. El cierre registra la comparación sobre ese mismo conjunto.

### Dependencias observadas, sin actualizarlas

| Elemento | Declaración | Instalación observada |
|---|---|---|
| Gestor | `pnpm@10.18.2`, packageManager raíz | No se invocó el gestor |
| Node | `>=22.12.0`, engines raíz | No se cambió runtime |
| Next | `^16.3.6` | 16.4.3 |
| React | `^19.3.0` | 19.3.1 |
| Playwright Test | `^1.56.0` | 1.64.1 |
| TypeScript | `^5.9.0` | 5.9.3 |
| Git | Herramienta local | 2.53.0.windows.1 |

Las versiones instaladas se leyeron de sus `package.json`; no se ejecutó el producto. La documentación pública puede describir APIs posteriores al mínimo del manifiesto: fijar la versión del lote antes de escribir ejemplos ejecutables.

## 2. Inventario confirmado

| Elemento | Cantidad / observación |
|---|---|
| Módulos / semanas / guías / ejercicios adicionales | 8 / 24 / 24 / 24 |
| Capítulos `sections` | 74: semanas 7 y 9 tienen cuatro, las otras tres |
| Conceptos de capítulos | 178 |
| Conceptos de ejemplos guiados | 88, repartidos en 24 ejemplos; **no son otros 24 capítulos** |
| Total de conceptos / demostraciones | 266 / 266 |
| Estados de demostración | 798; tres por concepto en el inventario actual |
| `stepDetails` / diagramas estructurados de capítulo | 0 / 0 |
| Títulos o descripciones exactamente repetidos | 0 / 0; esto no prueba ausencia de repetición semántica |

Los 74 capítulos y los 266 conceptos tienen registro en [matriz curricular](00-matriz-auditoria-curricular.md), con punteros JSON y huellas por concepto. Los IDs editoriales `Wxx-Cyy` identifican la propuesta; no sustituyen índices, IDs ni hashes actuales.

## 3. Contraste de requisitos con el código

| Requisito CONTENT-210 | Evidencia AS-IS verificable | Brecha / tratamiento G2 |
|---|---|---|
| Una explicación, caso y secuencia por concepto | `reading-concepts.tsx`, `ReadingConcept.example`, 266 demostraciones | Conservar; no afirmar que falta todo el contenido interactivo |
| Acciones/insumo/evidencia por nodo | `packages/contracts/src/index.ts:19–28` y `libs/learning/src/domain/models.ts:19–28`: solo `steps` e `icons` | Contrato opcional `stepDetails`; contenido editorial, no texto inventado por frontend |
| Hover/foco/toque de cada estado | `concept-demonstration.tsx`, `DemonstrationFrame`: nodos son spans; el botón controla reproducción | Hace falta un disparador accesible por nodo y un coordinador de globos |
| Scroll estable ≥60 %, 350 ms | `ConceptDemonstration`: IntersectionObserver al 25 % para reproducción | No reutilizar ese umbral ni ese evento como apertura del globo |
| Estados / movimiento reducido | Unión almacenada idle/playing/paused/done; reduced se deriva de media query | Conservar ambos niveles; detalles siguen disponibles aunque reproducción esté deshabilitada |
| Grafos con alternativa | No hay `diagram` en tipos/datos/renderizador | Elegir representación semántica estática; Mermaid es fuente editorial, no una librería web ya disponible |
| Evaluación por capítulo | Pregunta/actividad a nivel de guía; ejercicios adicionales por semana | Microactividad nueva propuesta, sin reemplazar evaluación, rúbrica o finalización existente |
| UX-120 | `LessonStudy` alterna lector previo y opt-in `?view=focused`; monta el paso activo | Conservar navegación libre, caché por identidad y tres modales |
| No dar progreso por globos | Rastreadores previos y enfocados emiten `reading-section`; pausan por `dialog[open]` | Un popover no modal no queda cubierto necesariamente por esa guarda: diseñar pausa de atención explícita |
| D1 con ancho completo | `use-focused-reading.ts`, `reading-text-map.ts`, `reading-reference.tsx` locales | No introducir texto/controles auxiliares en el eje académico ni controladores vivos en la referencia pasiva |
| Descarga completa | `lesson-download.ts`, `conceptMarkdown`: descripción, ejemplo, secuencia | Faltan acciones/evidencias; ampliación opcional y coherente con fallback |
| Regresión y precisión | Archivos de tests presentes, leídos; no ejecutados | Hay expectativas obsoletas de cantidades y de lectura; no declararlos verdes |

Rutas de esta tabla son relativas al repositorio. `lesson-study.tsx` ya es un selector; la composición anterior vive en `lesson-study-legacy.tsx`. El listado de rutas del SPEC necesita incorporar esta separación local.

El adaptador `apps/api/src/infrastructure/adapters/json-content.adapter.ts:10` obtiene la guía por ID y combina `...guide` con el ejercicio adicional. Esa propagación no valida por sí sola longitud/orden de futuros `stepDetails`; tipado opcional y validación editorial requieren una implementación aprobada. No se propone cambiar el API por la existencia de un campo editorial opcional.

### Huellas de archivos de entrada (SHA-256)

| Ruta | Huella |
|---|---|
| `libs/content/src/data/catalog.json` | `5beb75407a432e5ad1483b9115edd189a3e8ec579df047daa5fedbb497b98ce4` |
| `libs/content/src/data/study-guides.json` | `db9293b9ea905f9a5d48ed72daedfab9a31ca97890dd40551a830b3ed7a6c136` |
| `libs/content/src/data/practical-exercises.json` | `c2e8f2698de837b4685fae42a87f7cb1a101c17b7f410d1980ff31467248baa3` |
| `packages/contracts/src/index.ts` | `9e8d0a0e9589233bea723123b98198464b5ef1de17ee6da7bff6bedcbb8a04a8` |
| `apps/web/src/components/academy/concept-demonstration.tsx` | `e2237c80558c4c551bb9f9b3bd963936a01deb351bce9c1504cd0733d79de914` |

## 4. Registro de fuentes oficiales

Fecha de consulta de **todas** las entradas: 2026-10-28. VERIFICADA significa que se accedió a la página/documento primario y se comprobó la afirmación indicada; no acredita el curso ni certifica todos los ejemplos. VERIFICADA-FICHA limita el alcance a metadatos/resumen público. PENDIENTE exige nueva evidencia o revisión especializada antes del lote.

| ID | Fuente primaria, versión / localización | Afirmación y uso | Estado / límite |
|---|---|---|---|
| S01 | [CTFL](https://istqb.org/certifications/certified-tester-foundation-level-ctfl-v4-0/) y [syllabus 4.0.1](https://istqb.org/?download_id=3345&sdm_process_download=1), errata 2024-09-15, §§1.1–1.4, 2.2.1, 4 y 5 | Distinción QA/testing, conceptos, técnicas y cinco niveles; referente principal módulos 1–2 | VERIFICADA; no equivale a acreditación ISTQB |
| S02 | [Scrum Guide, noviembre 2020](https://scrumguides.org/scrum-guide.html), [versión oficial actual](https://scrumguides.org/download.html) | Accountabilities, Increment y Definition of Done; QA como especialidad del caso, no accountability nueva | VERIFICADA; conversación, HU, triage y release del piloto son decisiones ficticias del equipo |
| S03 | [ISO/IEC 25010:2023](https://www.iso.org/standard/78176.html), edición 2, publicada | Modelo de calidad de producto de nueve características; referencia no funcional | VERIFICADA-FICHA; no se accedió al texto licenciado completo ni se certifican cláusulas |
| S04 | [ISO/IEC/IEEE 29119-1:2022](https://www.iso.org/es/contents/data/standard/08/12/81291.html), edición 2, publicada | Conceptos generales de pruebas | VERIFICADA-FICHA; no atribuirle una plantilla exacta de matriz, plan o ciclo de defectos |
| S05 | [CTAL-AT](https://istqb.org/certifications/certified-tester-advanced-level-agile-tester-ctal-at/) y [syllabus 2.0](https://istqb.org/?download_id=9324&sdm_process_download=1), 2026-04-17 | Referente avanzado de colaboración y estrategias ágiles | VERIFICADA; lectura optativa, no prerrequisito nuevo de semana 1 |
| S06 | [CTAL-TAE 2.0](https://istqb.org/wp-content/uploads/2024/11/ISTQB_CTAL-TAE_Syllabus_v2.0.pdf), 2024-05-03 | Mantenimiento y arquitectura de automatización; módulos 5–7 | VERIFICADA; no impone Screenplay/POM ni una estructura única |
| S07 | [OWASP ASVS](https://asvs.owasp.org/), 5.0.0 estable, 2025-05-30 | Seleccionar requisitos de seguridad versionados según riesgo | VERIFICADA; no basta un login negativo para declarar cumplimiento ASVS |
| S08 | [WCAG 2.2](https://www.w3.org/TR/WCAG22/), Recommendation 2024-12-12 | Objetivo AA; referencia normativa para la futura aceptación | VERIFICADA; conformidad del producto NO evaluada ahora |
| S09 | [Contenido en hover/focus](https://www.w3.org/WAI/WCAG22/Understanding/content-on-hover-or-focus.html), Understanding 1.4.13 | Descartable, hoverable y persistente | VERIFICADA; guía informativa que acompaña el criterio |
| S10 | [APG tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/) y [disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) | Tooltip no contiene controles enfocables; alternativas de mostrar/ocultar | VERIFICADA; APG es orientación, no certificación automática de accesibilidad |
| S11 | [RFC 9110](https://www.rfc-editor.org/rfc/rfc9110.html), 2022, y [RFC 5789](https://www.rfc-editor.org/rfc/rfc5789.html), 2010 | Semántica HTTP, autenticación/autorización y PATCH | VERIFICADA; 403 no exige que toda petición esté autenticada; el contrato de la app se distingue de la semántica del protocolo |
| S12 | [Postman post-response](https://learning.postman.com/docs/tests-and-scripts/write-scripts/test-scripts/), documentación Latest v12 | Scripts > Post-response, estado y aserciones | VERIFICADA; comprobar interfaz/versión del estudiante antes del lote |
| S13 | [Chrome DevTools Network](https://developer.chrome.com/docs/devtools/network), documentación viva | Investigación de solicitud/respuesta y relación con acción UI | VERIFICADA; un screenshot UI no localiza por sí solo el defecto |
| S14 | [PostgreSQL 18: relaciones](https://www.postgresql.org/docs/18/queries-table-expressions.html), [agregados](https://www.postgresql.org/docs/18/functions-aggregate.html) | JOIN, NULL, COUNT, WHERE/HAVING | VERIFICADA; web actual identifica 18 estable y 19 RC. CI declara postgres:16-alpine; motor local/PGlite y Neon no se ejecutaron ni comprobaron |
| S15 | [ECMA-262, edición 17, junio 2026](https://ecma-international.org/publications-and-standards/standards/ecma-262/) | Base de JavaScript; no presentar el borrador 2027 como edición publicada | VERIFICADA; [arrays](https://tc39.es/ecma262/multipage/indexed-collections.html), [Promise](https://tc39.es/ecma262/multipage/control-abstraction-objects.html) y [JSON](https://tc39.es/ecma262/multipage/structured-data.html) consultados son borrador vivo, referencia auxiliar |
| S16 | TypeScript Handbook: [tipos](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html), [objetos](https://www.typescriptlang.org/docs/handbook/2/objects.html), [generics](https://www.typescriptlang.org/docs/handbook/2/generics.html), [clases](https://www.typescriptlang.org/docs/handbook/2/classes.html) | Comprobación estática y modelos reutilizables | VERIFICADA; documentación viva ya enlaza TS 6.0, proyecto instalado 5.9.3; no se autoriza upgrade |
| S17 | Git: [add](https://git-scm.com/docs/git-add), [push](https://git-scm.com/docs/git-push) | Índice, commit y publicación son operaciones distintas | VERIFICADA; simulador/remoto local de práctica no demuestra un push a GitHub |
| S18 | Playwright: [release notes 1.64](https://playwright.dev/docs/release-notes), [best practices](https://playwright.dev/docs/best-practices), [locators](https://playwright.dev/docs/locators), [actionability](https://playwright.dev/docs/actionability), [instalación](https://playwright.dev/docs/intro) | Locator por intención, esperas y dependencia paquete/navegadores; instalación observada 1.64.1 | VERIFICADA; docs vivas, sin ejecutar ejemplos en esta fase |
| S19 | Playwright: [POM](https://playwright.dev/docs/pom), [fixtures](https://playwright.dev/docs/test-fixtures), [auth](https://playwright.dev/docs/auth), [API](https://playwright.dev/docs/api-testing), [network](https://playwright.dev/docs/network), [CI](https://playwright.dev/docs/ci), [retries](https://playwright.dev/docs/test-retries), [sharding](https://playwright.dev/docs/test-sharding) | Referencias especializadas módulos 6–7 | VERIFICADA; la ruta abreviada `/docs/fixtures` no fue accesible, se usó `/docs/test-fixtures` |
| S20 | [GitHub Actions Secure use](https://docs.github.com/en/actions/reference/security/secure-use) | Permisos, secretos y tratamiento de código no confiable | VERIFICADA; no se afirma vigencia de cada tag `@v4` del ejemplo sin revisar sus releases |
| S21 | [Serenity/JS Screenplay](https://serenity-js.org/handbook/design/screenplay-pattern/) | Vocabulario del patrón como referencia de su proveedor | VERIFICADA; alternativa pedagógica, no requisito de Playwright ni norma universal |
| S22 | [HTML popover](https://html.spec.whatwg.org/multipage/popover.html), Living Standard mostrado 2026-10-26 | Superposición no modal y dismiss; diseño de compatibilidad | VERIFICADA; no presupone soporte o comportamiento idéntico sin futura prueba en navegadores |
| S23 | WAI: [focus not obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html), [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html), [reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) | Objetivos visibles, tamaño y presentación a 320 CSS px | VERIFICADA; objetivo táctil de 44 px del diseño es decisión de academia, no confundirlo con el mínimo AA de 24 px y sus excepciones |
| S24 | [WHATWG Fetch](https://fetch.spec.whatwg.org/#dom-response-ok), Living Standard mostrado 2026-10-19 | Response.ok y separación de estado HTTP/lectura de cuerpo respecto a promesas JavaScript | VERIFICADA; no atribuir fetch al estándar ECMA ni confundirlo con APIResponse.ok() de Playwright |

El acceso al documento TC39 monolítico superó el límite del lector; se consultaron sus páginas multipágina y la edición publicada de Ecma. No se usaron blogs, material de Platzi/EDteam ni respuestas generadas como autoridad normativa. SQLBolt y MDN pueden conservarse como apoyo, pero no sustituyen las fuentes normativas/técnicas indicadas.

## 5. Guía de lectura y cierre

1. [Auditoría del currículo](00-matriz-auditoria-curricular.md): inventario y deuda concreta.
2. [W01-C01 completo](W01-C01-propuesta-capitulo.md): contenido propuesto y globos.
3. [Contrato e interacción](00-contrato-grafos-y-globos.md): compatibilidad y decisiones de UX.
4. [Plan de validación futura](00-plan-pruebas-contenido-y-ux.md): no ejecutado.
5. [Roadmap](00-roadmap-por-modulos.md) y [decisiones para G3](00-decisiones-pendientes.md).

La revisión documental no acredita accesibilidad, aprendizaje efectivo, CI verde o funcionamiento en producción. G3 debe aprobar una SPEC individual y rutas concretas antes de modificar código/datos; no existe aprobación implícita de los otros 73 capítulos.

### Comprobación de alcance al cierre

Se comparó SHA-256 antes/después de los **647 archivos** del conjunto Git visible definido en §1: **0 modificados, 0 añadidos y 0 eliminados fuera de `docs/specs/content/`**. Se crearon únicamente los siete Markdown enlazados aquí. Se revisaron estáticamente sus enlaces locales y los registros de inventario: 74 capítulos, 24 ejemplos y 266 conceptos, sin enlaces Markdown locales faltantes. Esto es control documental de entrega, no ejecución de pruebas del producto. Las modificaciones locales anteriores a esta tarea permanecen con su contenido inicial; no se hizo commit, push o despliegue.
