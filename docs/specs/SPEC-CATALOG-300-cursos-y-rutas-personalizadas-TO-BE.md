# SPEC-CATALOG-300 — Catálogo de cursos, rutas personalizadas y gestión ADMIN

> **Producto:** QAPath Academy  
> **Tipo:** SPEC TO-BE — cambio funcional y de experiencia de usuario  
> **Estado:** **IMPLEMENTACIÓN AUTORIZADA** por solicitud del responsable del producto; sujeta a controles de calidad y liberación  
> **Versión del SPEC:** 1.0.0  
> **Fecha de elaboración:** 2026-10-29  
> **Repositorio:** https://github.com/CristianHdez90/qapathAcademy  
> **Rama de referencia inspeccionada:** `main`; SHA `83769adadca6314898a47a9871d0825a6a0c6d99`  
> **Referencia de diseño:** captura suministrada de Home en `localhost:3012`  
> **Entorno afectado:** Next.js, API NestJS, dominio de aprendizaje, catálogo y PostgreSQL  
> **Autorización y alcance:** implementar en rama de funcionalidad, migraciones aditivas, UI, APIs, pruebas y documentación. **No realizar despliegue productivo ni migraciones en producción sin cumplir las puertas de liberación de este SPEC.**

## 01. Intención

Transformar QAPath Academy de un esquema visual de **«8 módulos y una ruta fija»** a una **plataforma de cursos**, donde:

1. El estudiante descubre cursos mediante un catálogo de tarjetas en el **Home**.
2. Cada estudiante registrado puede **crear y ordenar su propia ruta de aprendizaje**, seleccionando los cursos que desea estudiar; no se impone una secuencia única.
3. El administrador puede **crear, consultar, actualizar, publicar, despublicar, archivar y restaurar cursos** desde un panel protegido.
4. La navegación principal se simplifica: **Cursos**, **Mi cuenta** y un **buscador de cursos**, sin árbol curricular ni accesos laterales a Scrum, proyecto final o recursos.
5. Los contenidos vigentes siguen funcionando. El progreso histórico, las evaluaciones, la identidad, MFA, las notas y la trazabilidad no se borran ni se reinician.

**Éxito esperado:** un catálogo **de ocho cursos visibles** en su estado inicial —seis procedentes de la oferta actual, más Scrum y preparación CTFL—, administrable y apto para rutas personales, sin pérdida de funcionalidad educativa.

### 1.1. Roles

- **Visitante:** puede buscar, filtrar, explorar el catálogo y abrir contenido que hoy sea público; para guardar una ruta personal inicia sesión.
- **STUDENT:** además de lo anterior, crea, consulta y reordena sus rutas, retira cursos de ellas y conserva su progreso por identidad.
- **ADMIN:** administra cursos y su disponibilidad, con auditoría; puede visualizar el catálogo con la misma experiencia que el estudiante.
- **INSTRUCTOR:** conservar los permisos que ya existan; esta SPEC **no crea privilegios de administración para INSTRUCTOR**.

### 1.2. Línea base AS-IS verificada

| Evidencia del código | Situación actual | Implicación |
|---|---|---|
| `apps/web/src/components/academy/dashboard.tsx` | Home incluye siguiente actividad, hero «Domina el testing», cuatro métricas, sección «Tu hoja de ruta», cuatro tarjetas y banner Scrum | Reemplazar composición de Home por catálogo completo; preservar siguiente actividad como utilidad contextual, sin hacerla protagonista |
| `apps/web/src/components/layout/sidebar.tsx` | Menú incluye árbol `LearningTree`, Scrum, proyecto, recursos, cuenta, enlace de login y tarjeta «Tu formación» | Simplificar menú y su versión móvil, eliminando únicamente estas superficies de navegación |
| `apps/web/src/app/modules/page.tsx` y `module-browser.tsx` | Catálogo secundario de ocho módulos con búsqueda existente | Reutilizar la lógica útil de búsqueda y tarjetas, renombrando y conectando a cursos |
| `libs/content/src/data/catalog.json` | Ocho módulos estáticos, semanas 1–24 y sus quizzes | Seis cursos visibles derivados de IDs existentes; mantener datos históricos de los otros dos |
| `apps/web/src/app/scrum/page.tsx` | Lección Scrum independiente | Integrarla como curso con destino válido, sin duplicar contenido |
| `apps/web/src/app/certification/istqb/page.tsx` | Preparación CTFL independiente con estudio/simulacro | Integrarla como curso con destino válido, sin duplicar contenido |
| `packages/database/sql/001_initial.sql` | Existe tabla `courses(id, slug, title, published)` y `lessons` | Evolucionar **aditivamente** el esquema, verificando contenido real antes de migrar |
| `apps/api/src/presentation/controllers/catalog.controller.ts` | API pública `/api/v1/modules` y `/api/v1/modules/:id`, sin CRUD de cursos | Añadir rutas de cursos y mantener compatibilidad transitoria |
| `apps/api/src/presentation/controllers/admin.controller.ts` | Rol ADMIN protege operaciones de estudiantes; no hay CRUD de cursos | Crear administración de cursos reutilizando patrón de autorización y auditoría |
| `libs/progress/src/domain/progress.ts` | Progreso v2 con semanas 1–24, IDs históricos y notas | Desacoplar selección de cursos del progreso; preservar estado existente |

La línea base debe verificarse de nuevo en la copia local de Codex antes de modificar código, especialmente si hay commits posteriores a este SHA.

---

## 02. Comportamiento

### 2.1. Catálogo inicial obligatorio

Tras la migración y publicación inicial, el listado público debe contener **exactamente los siguientes ocho cursos**, respetando títulos y orden editorial inicial:

| Posición | Título visible | Origen del contenido actual | ID/slug recomendado |
|---:|---|---|---|
| 1 | Fundamentos del Testing | Módulo `fundamentos` | `fundamentos` |
| 2 | QA Manual profesional | Módulo `manual` | `manual` |
| 3 | HTTP, REST, Postman, DevTools y SQL | Módulo `herramientas` | `herramientas` |
| 4 | JavaScript, TypeScript y Git | Módulo `typescript` | `typescript` |
| 5 | Automatización con Playwright | Módulo `playwright` | `playwright` |
| 6 | Framework y automatización API | Módulo `arquitectura` | `arquitectura` |
| 7 | Equipo y Scrum | Página y datos Scrum existentes | `equipo-scrum` |
| 8 | PREPARACIÓN PARA CERTIFICACIÓN — ISTQB Foundation Level · CTFL | Página de certificación existente | `istqb-ctfl` |

**No aparecerán en el catálogo público como cursos:**

- `CI/CD y calidad de la suite` (legado `cicd`, semanas 21–22).
- `Proyecto final y portafolio` (legado `portafolio`, semanas 23–24).

**Regla esencial:** “quitar del catálogo” **no equivale a borrar material académico ni progreso**. Preservar registros, calificaciones, actividades, notas, referencias y acceso de compatibilidad para estudiantes con avances anteriores. La eventual eliminación definitiva de contenido legado pertenece a otra SPEC, con plan de retención.

### 2.2. Home centrado en cursos

**Ruta `/`:** renderiza un catálogo completo de cursos publicados; `Cursos` del menú abre `/courses`, que comparte el mismo componente/consulta de catálogo. Se recomienda una ruta canónica consistente y evitar duplicar lógica. El Home ya no muestra un subconjunto de cuatro cursos.

**Eliminar del Home** los siguientes bloques visuales, con su contenido textual y espacio reservado:

1. Hero «UNA RUTA. UN NUEVO NIVEL. / Domina el testing. Construye calidad».
2. Las cuatro tarjetas **MÓDULOS**, **LECCIONES**, **PROGRESO**, **LABORATORIOS**.
3. Encabezado «TU HOJA DE RUTA», título «Aprende a tu ritmo» y su párrafo descriptivo actual.
4. Tarjeta/banda «CLASE INTRODUCTORIA · SCRUM / Antes del primer test, entiende cómo trabaja tu equipo».

**Conservar, pero adaptar cuando sea pertinente,** la funcionalidad «Tu siguiente actividad»: puede mostrarse como un CTA secundario, compacto y contextual para usuarios que ya siguen un curso. No debe imponerse una ruta de 24 semanas ni redirigir a cursos retirados. Para visitantes sin sesión, no se muestra información de progreso privado.

**Nuevo layout esperado:**

- Encabezado `Explora nuestros cursos` y una breve descripción centrada en elección del estudiante.
- Cuadrícula responsive de **todas** las tarjetas publicadas. Cada tarjeta presenta título, resumen, categoría, estado (si aplica), avance individual (si existe), CTA `Ver curso` / `Continuar`.
- Búsqueda de cursos coherente con la búsqueda del menú; estado de “sin resultados”, carga, error y reintento.
- Acciones visibles para STUDENT: `Crear mi ruta` y `Ver mi ruta`, sin introducir una nueva entrada al menú lateral.
- Opcional: filtros por categoría **solo si ya existen datos válidos**; no bloquear el lanzamiento por filtros.
- Mantener marca e identidad de QAPath Academy y uso coherente de tokens existentes.

### 2.3. Navegación simplificada (escritorio y móvil)

**Menú principal permitido:**

1. **Cursos** → `/courses`.
2. **Mi cuenta** → `/account` (con el control de autenticación actual).
3. **Buscar cursos** → entrada de búsqueda visible en el lateral; en móvil, botón de búsqueda que abre una interfaz accesible. **No es una tercera ruta de menú**, sino una herramienta.

**Eliminar del lateral y navegación móvil:**

- `Panel de aprendizaje` como opción independiente (el logotipo sigue llevando al Home).
- `Ruta de 8 módulos` y el árbol expansible `LearningTree`.
- `Equipo y Scrum` como entrada independiente.
- `Proyecto final`.
- `Recursos y progreso`.
- `Entrar / Crear cuenta` como acceso persistente del lateral.
- Tarjeta `TU FORMACIÓN` y su porcentaje global de 24 semanas.
- Ítem independiente `Administración` del menú lateral; **la administración se accede para ADMIN mediante Mi cuenta → Gestionar cursos** y se mantiene la ruta protegida de administración.

**Autenticación:** no eliminar las rutas `/login`, `/register`, `/verify-email` ni el flujo MFA. El acceso a login sigue disponible desde su página y desde redirecciones legítimas al intentar guardar una ruta o acceder a `Mi cuenta` sin sesión. La eliminación solicitada es **solo del enlace persistente en el menú**, no del proceso de autenticación.

**Comportamiento de búsqueda:**

- Coincidencia por título, descripción, habilidades y categoría; sin distinción de mayúsculas/minúsculas ni tildes cuando sea viable.
- El resultado debe reflejar solo cursos publicados para visitantes y estudiantes.
- Al seleccionar un resultado, navegar a `/courses/:slug`; mantener término al regresar si el estado permanece en la misma sesión de navegación.
- Navegación por teclado, `aria-label`, botón para borrar texto, estados vacíos y `Escape` para cerrar sugerencias móviles.
- No exponer cursos archivados o borradores mediante autocompletado.

### 2.4. Detalle de curso y compatibilidad de rutas

- Nuevas rutas públicas: `/courses` y `/courses/[slug]` (el Home `/` usa el mismo catálogo).
- La ficha incluye objetivos, descripción, clases disponibles, actividades, recursos contextuales y estado de avance **del curso**, no un supuesto porcentaje general.
- Los seis cursos heredados siguen utilizando las clases y prácticas `study/[week]`, `practice/[week]`, quizzes y materiales existentes.
- Curso **Equipo y Scrum** reutiliza la experiencia de `/scrum` mediante enlace de entrada desde su ficha; preferiblemente integrar el componente en la ficha sin duplicar datos. Mantener URL histórica accesible.
- Curso **ISTQB Foundation Level · CTFL** reutiliza `/certification/istqb` y sus ejercicios/simulacros, preservando su funcionamiento y referencias. Mantener URL histórica accesible.
- Mantener `/modules` y `/modules/[moduleId]` como rutas de compatibilidad mediante redirección a sus equivalentes públicos **cuando exista mapeo**, y un mecanismo de acceso legado protegido/no indexable para los dos módulos retirados con registros históricos.
- Mantener temporalmente `/api/v1/modules` y `/api/v1/modules/:moduleId` como contratos compatibles, sin eliminarlos mientras existan dependencias o pruebas. El endpoint nuevo `/api/v1/courses` será el utilizado por la UI nueva.
- No reescribir IDs de semana, claves de `state.quizzes`, identificadores de actividades o `student_progress.state` durante una migración de presentación.

### 2.5. Modelo de cursos administrables

**Un curso** es una entidad de catálogo versionable, con al menos:

| Campo | Regla |
|---|---|
| `id` | UUID inmutable de DB |
| `slug` | Único, estable, minúsculas y guiones; no sustituir silenciosamente slugs históricos |
| `title` | Requerido, 3–250 caracteres |
| `summary` / `description` | Texto legible; sanitizar/escapar para evitar XSS |
| `category` / `track` | Metadatos de agrupación consistentes |
| `cover` | Recurso opcional con lista de dominios/paths seguros; fallback visual |
| `position` | Orden editorial inicial modificable por ADMIN |
| `status` | `DRAFT`, `PUBLISHED`, `ARCHIVED` |
| `contentKind` | `LEGACY_MODULE`, `SCRUM`, `CTFL`, `CURATED` |
| `contentRef` | ID interno/slug del contenido fuente o asignación administrada |
| `createdAt`, `updatedAt` | Trazabilidad |

La tabla histórica `courses` tiene `published`; diseñar **migración aditiva** hacia el nuevo estado, sin reinicializar la tabla ni asumir que está vacía. Revisar los registros reales de producción antes de sembrar el catálogo.

**Alcance del editor ADMIN (primera entrega):** gestionar metadatos, estado de publicación, orden y asignación a contenido ya existente. Un curso nuevo puede permanecer en `DRAFT` sin contenido. Para publicar, exigir contenido/recurso de aprendizaje válido y navegable. **No se incluye construir un CMS completo ni un editor visual de capítulos** en esta SPEC.

### 2.6. CRUD ADMIN de cursos

Acceso desde `Mi cuenta → Gestionar cursos` para ADMIN, con formulario accesible y listado paginado.

| Acción | Requisito | Resultado |
|---|---|---|
| **Agregar** | Formulario de título, slug, resumen, categoría, orden, origen de contenido, estado | Crea `DRAFT` por defecto; muestra confirmación |
| **Consultar** | Listar, buscar y filtrar por estado, ver detalles y uso | Incluye borradores y archivados solo para ADMIN |
| **Actualizar** | Editar campos permitidos con validación y control de concurrencia | Cambios auditados; la publicación no reinicia progreso |
| **Eliminar** | Confirmación explícita; **archivado lógico** por defecto | Sale del catálogo público sin borrar progreso ni relaciones |
| **Restaurar** | Acción disponible a ADMIN | Recupera como `DRAFT` hasta republicación explícita |
| **Publicar/despublicar** | Validar curso utilizable, confirmar cambios de visibilidad | Visible/invisible en catálogo público; rutas históricas protegidas según reglas |

**Seguridad:** cada operación de escritura y lectura administrativa se valida en NestJS con `@Roles('ADMIN')`; nunca depender únicamente de ocultar el botón en Next.js. Registro de auditoría con actor, curso, acción, fecha y diferencias no sensibles. Un `STUDENT` obtiene `403`, una sesión inexistente `401`. Validar payload en backend y tratar versiones obsoletas de edición (`409`) para evitar sobrescrituras.

### 2.7. APIs propuestas

**Catálogo y detalle público** (solo cursos `PUBLISHED`):

```http
GET    /api/v1/courses?search=&category=&page=&limit=
GET    /api/v1/courses/:slug
```

**Administración protegida** (`ADMIN`):

```http
GET    /api/v1/admin/courses?search=&status=&page=&limit=
POST   /api/v1/admin/courses
GET    /api/v1/admin/courses/:id
PATCH  /api/v1/admin/courses/:id
DELETE /api/v1/admin/courses/:id           # archivado lógico
POST   /api/v1/admin/courses/:id/restore
```

**Rutas de aprendizaje personales** (`STUDENT` autenticado):

```http
GET    /api/v1/me/learning-paths
POST   /api/v1/me/learning-paths
GET    /api/v1/me/learning-paths/:id
PATCH  /api/v1/me/learning-paths/:id       # título, orden y cursos seleccionados
DELETE /api/v1/me/learning-paths/:id        # elimina la selección personal, NO el progreso
```

Definir DTOs y validaciones de `search`, límites de paginación, campos permitidos, `slug`, roles y estados. Convención de respuestas consistente con `{data: ...}` y códigos HTTP adecuados. No confiar en el `userId` enviado por el cliente para las rutas personales; derivarlo de la sesión del servidor.

### 2.8. Rutas personalizadas por estudiante

- El estudiante autenticado puede crear una ruta con **nombre**, selección de uno o varios cursos publicados y orden manual.
- Debe poder **agregar, retirar y reordenar** cursos sin borrar sus calificaciones ni notas; si un curso se retira de la ruta, conserva progreso en su cuenta.
- Puede crear varias rutas, definir una **ruta activa** y reanudar cualquier curso publicado; controles de límites razonables configurables.
- No permitir cursos duplicados en la misma ruta. La ruta personal solo puede ser consultada/modificada por su propietario, excepto mecanismos administrativos futuros expresamente definidos.
- Para usuarios anónimos, `Crear mi ruta` dirige a `/login` preservando un destino de retorno seguro; consultar cursos sigue siendo público.
- Cursos archivados que ya pertenecen a una ruta se muestran como **No disponible**, no desaparecen silenciosamente; no se permite iniciarlos de nuevo si no aplica una ruta histórica válida.
- El progreso de una ruta se calcula a partir de los cursos que la integran y de sus métricas reales; para Scrum y CTFL no inventar “semanas” inexistentes. Si no hay una medida comparable, mostrar estado o avance por curso antes que un porcentaje engañoso.
- Una ruta personal **es una selección ordenada**, no una migración de las reglas históricas `learningRules` ni un compromiso de estudiar 24 semanas.

### 2.9. Arquitectura y persistencia

**Mantener** Clean Architecture + Hexagonal + DDD, separando:

1. **Dominio**: entidades `Course`, `LearningPath`, invariantes y políticas (estados, unicidad, pertenencia, publicación).
2. **Aplicación**: casos de uso `ListCourses`, `GetCourse`, `CreateCourse`, `UpdateCourse`, `ArchiveCourse`, `RestoreCourse`, `ManageLearningPath`.
3. **Puertos**: `CourseRepositoryPort` y `LearningPathRepositoryPort`, adaptadores aislados de PostgreSQL/Drizzle.
4. **Infraestructura**: migraciones SQL aditivas, adaptadores PostgreSQL y semilla idempotente.
5. **Presentación**: controladores NestJS, contratos tipados y páginas Next.js.

**Persistencia sugerida:** reutilizar/ampliar `courses` de `001_initial.sql`, definir tabla de asociación estable entre curso y referencias de contenido (sin duplicar lecciones), `learning_paths` y `learning_path_courses` con claves únicas y posiciones; crear índices para estado/orden/búsqueda. Puede ajustarse el diseño físico si la inspección real revela dependencias adicionales; registrar la decisión en ADR.

**Semilla idempotente:** incluir seis cursos con IDs de contenido legacy `fundamentos`, `manual`, `herramientas`, `typescript`, `playwright`, `arquitectura`; más `equipo-scrum` e `istqb-ctfl`. Marcar los dos legacy `cicd` y `portafolio` como no publicados/archivados en el nuevo catálogo **sin borrar sus materiales originales**. Ejecutar la semilla sin sobrescribir cambios ADMIN existentes; migración y semilla deben poder repetirse sin duplicados.

### 2.10. UX, Figma y accesibilidad

- Conservar identidad visual (modo oscuro, tipografía y acentos) y rediseñar composición, no la marca.
- Responsive desde **320 px** hasta escritorio ancho; cards con altura flexible y títulos largos sin recorte.
- Componentes reutilizables: `CourseCard`, `CourseCatalog`, `CourseSearch`, `LearningPathBuilder`, `AdminCourseTable`, `CourseEditorForm`, `StatusTag`.
- Controles con estados normal, hover, foco visible, loading, error, vacío, deshabilitado y confirmación.
- Búsqueda usable con teclado, objetivos táctiles al menos 24 × 24 px según WCAG 2.2 AA (preferir 44 × 44 px), contraste comprobado, landmarks semánticos, textos alternativos, modales con foco gestionado y movimiento reducido.
- Evitar navegación anidada o tarjetas con botones accionables dentro de enlaces envolventes; definir jerarquía clara de CTA.
- En Figma: Auto Layout, variables/tokens, variantes de componentes, marcos de escritorio/tableta/móvil y prototipo del flujo `Buscar curso → Ver detalle → Añadir a mi ruta → Reordenar → Continuar`.
- Mantener componentes de asistencia contextual como MariBug cuando ya existan, sin que obstruyan acciones móviles.

### 2.11. Secuencia de implementación autorizada

La autorización corresponde a **implementar el alcance completo de esta SPEC en una rama**, no a publicar automáticamente cada cambio:

**Fase I — Preparar línea base y datos:**

- Crear rama de trabajo desde HEAD actualizado; comparar cambios locales.
- Respaldar esquema y datos de preproducción; inventariar cursos/progreso existentes.
- Diseñar migración aditiva y semilla idempotente; documentar reversibilidad y dependencias.

**Fase II — Catálogo y backend:**

- Implementar entidades, repositorios, casos de uso, API pública, CRUD ADMIN, auditoría y contratos tipados.
- Mantener adaptadores legacy y rutas existentes en compatibilidad.

**Fase III — Rutas personales:**

- Crear persistencia y endpoints por usuario; validar aislamiento e invariantes.
- Implementar creación, edición, orden y recuperación de ruta.

**Fase IV — Frontend:**

- Rediseñar Home y `/courses`; reusar experiencias de Scrum y CTFL.
- Sustituir navegación lateral y móvil; implementar búsqueda y editor ADMIN.
- Retirar los bloques visuales especificados y verificar estados especiales.

**Fase V — Calidad y despliegue controlado:**

- Ejecutar unitarias, API, migración, regresión, E2E, accesibilidad y `pnpm check`.
- Implementar mediante PR y revisión; desplegar primero a preview/staging.
- Con evidencia satisfactoria, aprobar deploy productivo separado; observabilidad y rollback previstos.

### 2.12. Criterios de aceptación BDD / QA

**CA-01 — Catálogo inicial.** Dado un usuario público, cuando abre `/`, entonces visualiza las ocho tarjetas de la tabla §2.1, sin `cicd` ni `portafolio`.

**CA-02 — Menú simplificado.** Dado escritorio o móvil, cuando muestra el menú, entonces solo aparecen `Cursos`, `Mi cuenta` y la búsqueda como control; no aparece el árbol ni las entradas retiradas.

**CA-03 — Home depurado.** El Home no renderiza el hero, cuatro métricas, hoja de ruta ni banner Scrum descritos en §2.2.

**CA-04 — Búsqueda.** Buscar `playwright`, con diferencias de mayúsculas o tildes, devuelve el curso esperado y no incluye borradores/archivados.

**CA-05 — Navegación.** Al abrir cualquier curso visible se obtiene un detalle válido, con acceso a sus clases o contenido existente, sin enlaces rotos.

**CA-06 — Scrum.** `Equipo y Scrum` abre la experiencia Scrum actual desde su ficha de curso y mantiene quiz/progreso.

**CA-07 — CTFL.** `ISTQB Foundation Level · CTFL` conserva capítulos, simulacro y resultados existentes.

**CA-08 — ADMIN crea.** `POST /admin/courses` con credenciales ADMIN y datos correctos crea borrador; el curso no aparece públicamente antes de publicar.

**CA-09 — ADMIN actualiza.** Editar título/resumen/orden se refleja en el catálogo publicado sin alterar progresos históricos.

**CA-10 — ADMIN elimina.** `DELETE` archiva el curso y lo oculta públicamente, preservando relaciones, notas y calificaciones.

**CA-11 — Restauración.** ADMIN restaura un curso archivado como borrador y lo publica luego de validar contenido.

**CA-12 — Seguridad.** Anónimo recibe `401` y STUDENT `403` en endpoints ADMIN; la interfaz oculta acciones, pero el backend sigue siendo la autoridad.

**CA-13 — Auditoría.** Cada operación administrativa relevante registra actor, curso, acción, fecha y cambios permitidos; jamás credenciales o tokens.

**CA-14 — Ruta personalizada.** STUDENT agrega cursos publicados a su ruta, los reordena y vuelve a consultar el mismo orden tras logout/login.

**CA-15 — Aislamiento de rutas.** Un estudiante no puede leer/editar la ruta de otro (respuesta segura `403`/`404`, según política documentada).

**CA-16 — Retiro no destructivo.** Quitar un curso de la ruta personal no borra avance, notas ni calificaciones.

**CA-17 — Compatibilidad.** URLs y endpoints antiguos exigidos por marcadores o tests no fallan por el cambio; se redirigen o siguen disponibles conforme a §2.4.

**CA-18 — Progreso histórico.** Un estudiante con semanas 21–24 completadas conserva su estado y la consulta de evidencias; no se reescribe silenciosamente `state.version=2`.

**CA-19 — Métricas honestas.** Ninguna ficha de Scrum/CTFL muestra un porcentaje basado en 24 semanas ajenas al curso.

**CA-20 — Accesibilidad.** El catálogo y menú son navegables por teclado, funcionan a 320 px sin desbordamiento horizontal y cumplen los requisitos evaluables de WCAG 2.2 AA relevantes.

**CA-21 — Estado de error.** Ante error del API el usuario ve una explicación y puede reintentar, sin mostrar un catálogo vacío como si no existieran cursos.

**CA-22 — Validación de publicación.** No se puede publicar un curso sin contenido navegable ni slug válido; la semilla no duplica cursos cuando se ejecuta otra vez.

**CA-23 — Regresión de aprendizaje.** Lectura, prácticas, quizzes, notas, asistencia contextual, login/MFA y guardado de progreso siguen operativos.

**CA-24 — Pruebas técnicas.** `pnpm check` y la suite E2E relevante pasan en un entorno limpio antes de solicitar liberación productiva.

### 2.13. Matriz mínima de pruebas automatizadas

| Nivel | Casos |
|---|---|
| Unitarias de dominio | Estado del curso; slug; transición publicación/archivo; curso duplicado en ruta; orden; permisos |
| Integración de repositorios | Semilla idempotente; concurrencia; persistencia; archivado y restauración; relación con contenido legado |
| API | Público vs borrador; ADMIN 200/201/204; STUDENT 403; anónimo 401; validaciones 400/409/404 |
| E2E Playwright | Home 8 tarjetas; búsqueda; menús desktop y móvil; Scrum; CTFL; CRUD ADMIN; crear/reordenar ruta; logout/login |
| Regresión histórica | Estudios, prácticas, calificaciones y notas de semanas 1–24; descarga; acceso mediante URL antigua |
| Accesibilidad y responsive | 320/390/768/1280/1920 px; teclado; lector de pantalla manual; contraste; sin overflow |

**Consideración de tests existentes:** `tests/content.test.mjs` verifica ocho módulos en el JSON legado. No “arreglarlo” borrando esos dos módulos: conservar contrato histórico o actualizar las pruebas de manera explícita para distinguir inventario legacy de catálogo público de cursos. `learningRules` y vistas SQL contienen referencias de 24 semanas: no usarlas como total universal de los cursos nuevos.

---

## 03. Restricciones

**R-01 — Integridad del estudiante.** No destruir ni reiniciar `student_progress`, notas, calificaciones, registro de lectura, retos, historial de auditoría ni sesiones.

**R-02 — Eliminación lógica.** La orden “Eliminar curso” en la primera versión significa **archivar**; no permitir `DELETE FROM courses` en cascada ni migraciones destructivas de contenido/progreso.

**R-03 — Compatibilidad.** Conservar slugs/IDs de los seis cursos heredados y las claves internas de semanas y quizzes, incluso si el texto visible cambia de “módulo” a “curso”.

**R-04 — Seguridad de aplicación.** ADMIN y STUDENT autorizados por backend; controlar CSRF según el modelo de cookies de sesión existente, validación, rate limiting y protección frente a XSS. No exponer datos personales en catálogo público.

**R-05 — Modelo actual.** Mantener Next.js + NestJS + PostgreSQL/Drizzle, separación Clean/Hexagonal/DDD, Firebase, MFA y Vercel. No introducir un CMS externo sin decisión arquitectónica expresa.

**R-06 — Concurrencia.** Actualizaciones ADMIN y ediciones de ruta deben ser atómicas y tolerar reintentos, con versión/fecha de actualización para conflictos.

**R-07 — Migraciones.** Crear nuevas migraciones versionadas e idempotencia de semillas; no editar `001_initial.sql` ni otras migraciones aplicadas. Preparar backup y rollback antes de intervenir producción.

**R-08 — Documentación.** Actualizar OpenAPI/README/SPEC de API, matriz de trazabilidad, listado de rutas, guía de administración y documentación de cambios de contenido.

**R-09 — Diseño accesible.** Objetivo WCAG 2.2 AA; búsqueda, formularios, modales, tarjetas y botones funcionales con teclado y touch; foco visible y navegación sin trampas.

**R-10 — Derechos y contenido.** No copiar estructuras gráficas, textos ni componentes propietarios de EDTeam o Platzi. Inspirarse en patrones generales de catálogos de cursos y aprendizaje a elección.

**R-11 — Rendimiento.** No descargar todas las lecciones de todos los cursos para renderizar tarjetas del Home; servir metadatos resumidos, pagina y aplica caché coherente con publicación.

**R-12 — Autorización de implementación.** El solicitante autoriza implementar el alcance en rama/PR y realizar pruebas. **El merge o despliegue a producción requiere evidencia de CA-01..CA-24, plan de reversión y revisión humana del resultado**, no una autorización implícita para operar sobre la base productiva.

**R-13 — Evidencia.** Registrar commit base, migraciones, decisiones de IDs, capturas antes/después, pruebas fallidas/corregidas y limitaciones; no afirmar que una funcionalidad pasó QA sin ejecutarla.

**R-14 — Mantener acceso académico.** Quitar vínculos del menú no debe dejar sin acceso funciones necesarias para continuar clases, revisar recursos contextuales o recuperar notas existentes.

---

## 04. No-Objetivos

1. No recrear desde cero todos los cursos ni reescribir sus capítulos, tarjetas, laboratorios o evaluaciones; esto pertenece a SPECs curriculares independientes.
2. No eliminar físicamente semanas 21–24, materiales CI/CD, proyecto final o evidencias históricas.
3. No convertir ADMIN en editor WYSIWYG completo o marketplace de instructores, pagos, certificados o suscripciones.
4. No cambiar el funcionamiento de MFA, verificación por correo, Firebase Authentication, política de contraseñas ni sesiones.
5. No alterar el motor de calificación ni imponer un progreso global calculado como porcentaje de ocho cursos desiguales.
6. No crear perfiles de usuario públicos ni rutas compartidas entre estudiantes; las rutas son privadas inicialmente.
7. No exigir que estudiantes existentes vuelvan a registrarse o reinicien su aprendizaje.
8. No modificar la arquitectura de despliegue Vercel por motivos puramente visuales.
9. No implementar una eliminación irreversible de cursos desde la UI en esta primera entrega.
10. No usar los catálogos externos citados como fuente de imágenes o textos sin derechos de uso.

---

## 05. Definición de terminado (DoD) y liberación

- [ ] Ocho cursos iniciales correctos, seis heredados + Scrum + CTFL, visibles como publicados.
- [ ] `cicd` y `portafolio` ocultos del nuevo catálogo, con datos intactos.
- [ ] Home muestra catálogo completo y no contiene hero/métricas/hoja de ruta/banner retirados.
- [ ] Menú desktop y móvil solo tiene `Cursos` y `Mi cuenta` más buscador; sin árbol ni tarjetas eliminadas.
- [ ] CRUD de cursos ADMIN operativo, protegido y auditado; archivado lógico y restauración.
- [ ] Creación y ordenación de rutas privadas por STUDENT persistidas en PostgreSQL.
- [ ] Búsqueda, detalle de curso y acceso a Scrum/CTFL operativos.
- [ ] Compatibilidad con rutas antiguas, notas y calificaciones confirmada.
- [ ] Migración revisada en copia de preproducción y respaldo comprobado.
- [ ] `pnpm check` aprobado y E2E/seguridad/regresión documentados.
- [ ] Figma/prototipo o capturas revisadas: escritorio, móvil, estados vacíos y formularios.
- [ ] Review de PR, checklist, despliegue preview y plan de rollback aprobados.

## 06. Instrucción ejecutable para Codex

> Actúa como Lead Software Engineer y QA Architect de QAPath Academy. Lee `docs/specs/SPEC-CATALOG-300-cursos-y-rutas-personalizadas-TO-BE.md` y contrasta cada requisito con el HEAD actual del repositorio. **El responsable del producto autoriza implementar esta SPEC** en una rama de funcionalidad. Desarrolla por fases: (1) inventario/compatibilidad; (2) migración aditiva, seed idempotente y backend catálogo/ADMIN; (3) rutas personales; (4) Home, menú y búsqueda; (5) pruebas y evidencias. Conserva IDs y progreso histórico, reutiliza Scrum y CTFL, y no borres materiales legacy. Ejecuta `pnpm check` y pruebas Playwright pertinentes. Presenta PR/resumen de cambios, capturas, riesgos, migraciones y resultados. **No ejecutes migraciones en producción, no hagas `force push`, no modifiques secretos ni despliegues a producción automáticamente**: esos pasos requieren revisión y una liberación controlada.

### Archivos clave para analizar/editar según corresponda

```text
apps/web/src/app/page.tsx
apps/web/src/app/modules/page.tsx
apps/web/src/app/modules/[moduleId]/page.tsx
apps/web/src/app/scrum/page.tsx
apps/web/src/app/certification/istqb/page.tsx
apps/web/src/components/academy/dashboard.tsx
apps/web/src/components/academy/module-card.tsx
apps/web/src/components/academy/module-browser.tsx
apps/web/src/components/academy/module-detail.tsx
apps/web/src/components/layout/sidebar.tsx
apps/web/src/components/admin/admin-dashboard.tsx
apps/web/src/lib/academy-api.ts
apps/api/src/presentation/controllers/catalog.controller.ts
apps/api/src/presentation/controllers/admin.controller.ts
apps/api/src/app.module.ts
libs/content/src/data/catalog.json
libs/learning/src/application/
libs/learning/src/domain/
libs/progress/src/domain/progress.ts
libs/progress/src/domain/learning-rules.ts
packages/contracts/src/
packages/database/sql/
packages/database/src/
apps/web/tests/e2e/
tests/
```

**Nota de trazabilidad:** las rutas y símbolos anteriores provienen de la lectura del repositorio indicada en el encabezado; si el HEAD local ya los ha renombrado, rastrear sus sucesores antes de aplicar cambios.
