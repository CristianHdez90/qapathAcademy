# SPEC-UX-310 — Home de cursos configurable desde ADMIN

> **Producto:** QAPath Academy  
> **Tipo:** Especificación funcional y de experiencia de usuario — TO-BE  
> **Estado:** Autorización de implementación en entorno de desarrollo, sujeta a pruebas y revisión previa al despliegue  
> **Versión del SPEC:** 1.0.0 · **Fecha:** 2026-10-29  
> **Prioridad:** Alta · **Responsables propuestos:** Product Owner, UX/UI, Frontend, Backend, QA  
> **Referencia visual:** captura adjunta por el solicitante (Home oscuro, cabecera compacta y ocho tarjetas de cursos)  
> **Relacionado:** `SPEC-CATALOG-300-cursos-y-rutas-personalizadas-TO-BE.md`, SPEC de UX y contenido existentes.

## 0. Contexto y diagnóstico AS-IS

### Fuente de verdad

- **Referencia de diseño:** la imagen proporcionada. Es una **guía visual**, no una maqueta editable ni un inventario de imágenes de producción.
- **Código inspeccionado:** rama `main` de `CristianHdez90/qapathAcademy`, árbol revisado con SHA `83769adadca6314898a47a9871d0825a6a0c6d99`. La rama publicada puede estar detrás de la versión local mostrada en la captura: **reconciliar los cambios locales antes de implementar**.
- En el código público inspeccionado, `Dashboard` todavía contiene un hero grande, métricas, un banner de Scrum y `modules.slice(0,4)`. Esto **no coincide** con la nueva captura de ocho cursos. No restablecer componentes antiguos si la implementación local ya los sustituyó.
- `ModuleBrowser` tiene filtros y búsqueda; `ModuleCard` usa el contrato `Module`; `Sidebar` contiene navegación antigua; `globals.css` utiliza variables CSS y numerosos colores hexadecimales fijos.
- El panel `AdminDashboard` gestiona estudiantes y configuración de IA, **pero no consta en ese snapshot un editor de apariencia publicado**.
- La API publica el catálogo legado como `/api/v1/modules`; cualquier transición a `/courses` debe respetar contratos existentes o disponer de una capa de compatibilidad.

### Problema de experiencia

La intención del estudiante es **descubrir y abrir cursos**, pero una cabecera demasiado alta, tarjetas desplazadas debajo del primer pantallazo, filtros redundantes y un diseño de curso poco diferenciador dificultan el descubrimiento. El diseño propuesto de la captura muestra una solución: encabezado compacto, búsqueda única, filtros, ocho tarjetas identificables, navegación sobria y CTA para crear rutas.

### Decisiones fijadas

1. **El Home es un catálogo, no una landing de marketing:** no volver al hero gigante ni a las tarjetas estadísticas.
2. **El diseño visual es administrable desde ADMIN:** configuración global por organización/plataforma, no edición arbitraria por cada estudiante.
3. **Configuración separada de contenido:** colores, imágenes y orden de presentación no pueden modificar identidades de cursos, notas, progresos ni evaluaciones.
4. **Se utilizan componentes y tokens reutilizables**, con previsualización, publicación controlada y restauración de la última versión válida.

---

## 1. INTENCIÓN

### Historia de usuario: estudiante

**Como** estudiante o visitante de QAPath Academy,  
**quiero** encontrar todos los cursos de inmediato en un Home limpio, visual y responsive,  
**para** elegir qué estudiar, continuar mi aprendizaje y crear mi ruta sin distracciones.

### Historia de usuario: administrador

**Como** usuario ADMIN autorizado,  
**quiero** configurar de forma segura la identidad visual y la presentación del Home desde un panel,  
**para** evolucionar el diseño de QAPath Academy sin modificar manualmente el código ni afectar la experiencia de los estudiantes.

### Resultados medibles propuestos

- A **1440 × 900 px** con navegador al 100 %, título, buscador, filtros y **parte sustancial de la primera fila de tarjetas** deben ser visibles sin desplazamiento vertical.
- El Home debe mostrar los **ocho cursos publicados del catálogo objetivo** sin truncar el listado artificialmente. No se exige mostrar las ocho tarjetas completas en un único viewport.
- Toda función disponible mediante el Home también debe poder ejecutarse por teclado.
- Los cambios visuales guardados como borrador **no afectan** al Home público hasta publicarlos.
- El cambio de apariencia **no exige un nuevo despliegue** de la aplicación y no altera el contenido académico.

---

## 2. COMPORTAMIENTO

### 2.1. Estructura visual del Home (referencia obligatoria: captura)

**Jerarquía de arriba hacia abajo:**

1. **Menú lateral compacto:** logo QAPath Academy; un buscador o acceso a búsqueda coherente; navegación `Cursos` y `Mi cuenta`; el rol ADMIN conserva acceso a `Administración`. No agregar de nuevo un árbol de módulos.
2. **Cabecera compacta:** breadcrumb opcional `QAPath Academy > Cursos`, título **«Explora cursos»**, subtítulo corto y botón primario **«Crear mi ruta»**.
3. **Buscador de cursos** prominente, con etiqueta accesible, por título, habilidad o categoría.
4. **Filtros/chips**: `Todos`, `QA Manual`, `QA Técnico`, `Programación`, `Automation`, `Trabajo en equipo`, `Certificación` o las categorías publicadas de forma real.
5. **Listado completo:** `N cursos disponibles`, contador dinámico y tarjetas ordenadas según configuración publicada; las tarjetas deben ser el foco principal.
6. **Tarjetas** con categoría, ilustración pertinente, título, descripción corta, duración real, etiquetas, estado/progreso si el estudiante está identificado y CTA `Ver curso`/`Continuar curso`.
7. CTA secundarios y elementos decorativos **nunca** desplazan las tarjetas detrás de un hero alto.

**No se mostrarán** la pieza publicitaria «Domina el testing», las cuatro métricas antiguas, «Tu hoja de ruta» ni el banner de Scrum fuera del catálogo de cursos. Si estos bloques ya fueron retirados localmente, **no reintroducirlos**.

### 2.2. Reglas de densidad y responsive

| Pantalla | Distribución objetivo | Reglas |
|---|---|---|
| Escritorio amplio (≥1440 px) | 4 columnas de tarjetas | Menú lateral ≈ 240–270 px, contenido fluido; primera fila empieza idealmente antes de 320 px del documento; cabecera condensada. |
| Escritorio medio (1024–1439 px) | 3 columnas, o 2 si el ancho útil resulta insuficiente | Nunca cortar títulos ni botones. |
| Tablet (768–1023 px) | 2 columnas | Menú compacto o modal, filtros con wrap o desplazamiento controlado. |
| Móvil (<768 px) | 1 columna | Búsqueda visible, CTA accesible y tarjetas completas. |

**Reglas adicionales:**

- Evitar `height` rígido en la tarjeta; usar diseño flexible para acomodar descripciones variables.
- Mantener imagen/ilustración en un área de proporción estable, sin que tape información ni controles.
- No ocultar cursos por `overflow:hidden` del contenedor principal, scroll horizontal forzado, `slice`, paginación artificial ni un carrusel que sustituya el catálogo.
- Si hay filtros activos, mostrar contador filtrado y acción **«Limpiar filtros»**. Diferenciar resultado vacío real de fallo de API.
- Un solo campo de búsqueda funcional en el Home; el buscador del lateral puede ser el mismo control compartido o un atajo que enfoque el buscador principal. **No mantener dos formularios independientes con estados distintos**.
- Conserve el orden de tabulación y el indicador de foco visible; no usar color como único indicador de selección.

### 2.3. Los ocho cursos iniciales

El Home debe mostrar, si están publicados, los siguientes cursos del catálogo aprobado:

| Código ilustrativo | Curso | Categoría recomendada |
|---|---|---|
| C01 | Fundamentos del Testing | QA Manual |
| C02 | QA Manual profesional | QA Manual |
| C03 | HTTP, REST, Postman, DevTools y SQL | QA Técnico |
| C04 | JavaScript, TypeScript y Git | Programación |
| C05 | Automatización con Playwright | Automation |
| C06 | Framework y automatización API | Automation / QA Técnico |
| C07 | Equipo y Scrum | Trabajo en equipo |
| C08 | Preparación para certificación ISTQB Foundation Level · CTFL | Certificación |

**Importante:** estos nombres son requisito inicial del producto, pero los IDs, slugs, cantidad real de lecciones y duración se obtienen del catálogo activo; **no inventar semanas ni porcentajes**. Mantener IDs existentes y mapeos históricos. La gestión del contenido y el CRUD de cursos corresponden a `SPEC-CATALOG-300`: integrar la capacidad existente o implementarla si aún está pendiente, sin duplicar modelos de datos.

### 2.4. Tarjeta de curso reutilizable

Campos visuales esperados:

```text
CourseCard
  id, slug, title, summary, category, tags[]
  durationLabel (derivada de la oferta real)
  illustrationAssetId | illustrationUrl (permitida y validada)
  visualAccentToken (token semántico; no CSS libre)
  publicationStatus, displayOrder
  progressPercent? (solo calculado desde datos del estudiante)
  nextAction? (desde el progreso existente)
```

Estados visuales: `default`, `hover`, `focus-visible`, `in-progress`, `completed`, `unavailable`, `loading`, `error`; si una tarjeta no tiene imagen debe mostrar ilustración genérica del curso. El CTA no promete «Continuar» si no existe progreso válido. No copiar métricas inventadas de la imagen.

### 2.5. Panel ADMIN > Apariencia y Home

Agregar una sección visible únicamente para ADMIN: **`Administración > Apariencia > Home de cursos`**.

**Pestaña A — Paleta y tema**

- Selector de presets de diseño:
  - `QAPath Original`: azul noche + turquesa (referencia de la imagen).
  - `Midnight Violet`: fondo oscuro + violeta + acento aqua.
  - `Indigo Digital`: fondo claro + índigo + lima como acento.
  - `Coral Studio`: fondo claro cálido + coral + dorado.
- Permitir ajustes manuales únicamente de **tokens autorizados**: fondo, superficie, texto principal, texto secundario, borde, primario, acento, foco, estado de éxito, error y fondo de CTA; no aceptar CSS arbitrario.
- Previsualizar combinaciones a la vista, con validación de contraste, y ofrecer `Restablecer preset`.
- Los ajustes se aplican al **Home y navegación común** en la primera entrega. Cambiar todo el diseño de lecciones, MFA y ADMIN requiere SPEC independiente para evitar regresiones.

**Pestaña B — Tarjetas y contenido visual**

- Seleccionar ilustración por curso desde una biblioteca de activos aprobada (o subir imágenes con validaciones estrictas, solo si existe un servicio de almacenamiento adecuado).
- Configurar un color de categoría / acento por curso utilizando tokens compatibles con el tema.
- Editar **presentación** de los cursos: orden de aparición, texto corto de exhibición y etiquetas; evitar crear una segunda fuente de verdad para el título oficial, el slug, el currículo o el progreso.
- Vista previa de tarjetas sin progreso y con progreso **simulado de diseño**; los datos ficticios no se guardan como progreso de estudiantes.
- El curso no publicado no aparece en el Home; el orden es el de `displayOrder`, con desempate determinista por título/ID.

**Pestaña C — Disposición y textos del Home**

- Campos editables: título del Home, subtítulo corto, texto de botón `Crear mi ruta`, etiqueta de búsqueda y texto de estado vacío.
- Opciones limitadas: mostrar/ocultar breadcrumb, mostrar/ocultar subtítulo, disposición `grid` como opción estable. No ofrecer drag-and-drop arbitrario de regiones ni tamaños de tarjetas individuales.
- No permitir desactivar la sección de cursos, el campo principal de búsqueda, la navegación, ni el acceso a `Mi cuenta`.
- El número de columnas es responsive y no debe quedar fijado por ADMIN en valores que rompan el móvil.

**Pestaña D — Vista previa, publicación y versiones**

Flujo obligatorio:

```text
Abrir configuración publicada
    ↓
Editar borrador (revision N)
    ↓
Validar tokens, contraste, imágenes y estructura
    ↓
Vista previa privada en desktop / tablet / mobile
    ↓
Guardar borrador (sin afectar sitio público)
    ↓
Publicar [confirmación explícita ADMIN]
    ↓
Revisión N+1 visible en público + auditoría
    ↘
Restaurar publicación anterior (ADMIN, auditada)
```

- Diferenciar botones **Guardar borrador**, **Previsualizar**, **Publicar** y **Restaurar versión**.
- La publicación será atómica; si falla la validación, permanece la última versión publicada.
- Concurrencia optimista: si otro ADMIN publicó entretanto, responder `409 Conflict` con opción de recargar; no sobrescribir silenciosamente.
- Mostrar `Última publicación`, usuario que la realizó y número de versión, sin exponer datos sensibles.
- La vista previa no debe ser accesible para visitantes anónimos ni mostrar borradores en rutas públicas.

### 2.6. Contrato de tema (propuesta orientativa)

**Modelo lógico ilustrativo — definir tipos y validación con Zod; no aceptar estilos arbitrarios:**

```json
{
  "id": "home-appearance",
  "revision": 3,
  "status": "draft",
  "preset": "qapath-original",
  "tokens": {
    "background": "#081322",
    "surface": "#122238",
    "textPrimary": "#F4F8FF",
    "textSecondary": "#B7CAE1",
    "border": "#2B435A",
    "primary": "#47DEC1",
    "primaryText": "#071C26",
    "accent": "#73B8FF",
    "focus": "#9BD8FF"
  },
  "home": {
    "title": "Explora cursos",
    "subtitle": "Elige qué aprender y organiza una ruta que se adapte a tus objetivos.",
    "ctaLabel": "Crear mi ruta",
    "showBreadcrumb": true,
    "showSubtitle": true
  }
}
```

Estos valores **no representan una configuración existente**; son semilla propuesta y requieren verificación de contraste por combinación de tokens. Las categorías, imágenes y orden de los cursos pertenecen al catálogo/configuración de presentación de cursos, no al objeto de tema global.

### 2.7. API y seguridad (propuesta)

| Método y ruta | Uso | Autorización |
|---|---|---|
| `GET /api/v1/appearance/home` | Obtener **solo configuración publicada** (y valores por defecto si aún no existe) | Pública, lectura |
| `GET /api/v1/admin/appearance/home` | Leer borrador, versión publicada y validaciones | ADMIN |
| `PATCH /api/v1/admin/appearance/home/draft` | Guardar cambios validados en borrador | ADMIN |
| `POST /api/v1/admin/appearance/home/publish` | Publicar por número de revisión esperado | ADMIN |
| `GET /api/v1/admin/appearance/home/versions` | Historial de versiones | ADMIN |
| `POST /api/v1/admin/appearance/home/restore` | Restaurar versión previa como **nueva** publicación | ADMIN |

- Reutilizar guardas de sesión, roles y origen/CSRF existentes; aplicar validación estricta y controles de concurrencia. **Ningún cambio de apariencia mediante cookies o variables del cliente puede otorgar privilegios.**
- Evitar XSS: los textos se muestran como texto, no HTML arbitrario; URLs de ilustraciones solo HTTPS de orígenes permitidos o rutas internas; no permitir `javascript:`, SVG activo no sanitizado ni `style` libre.
- Limitar tamaños de texto, etiquetas, imágenes y cuerpos de solicitud; generar auditoría de `draft_saved`, `theme_published`, `theme_restored` y `course_presentation_changed` (sin secretos ni cookies).
- Caché: Home público con publicación coherente; invalidar/revalidar al publicar y asegurar que SSR Next.js recibe una revisión consistente. Una propagación breve debe estar documentada; nunca mezclar tokens de dos revisiones en una respuesta.

### 2.8. Arquitectura y persistencia

**Respetar Clean Architecture + Hexagonal + DDD**:

```text
apps/web (Home, CourseCard, AppearanceAdmin, preview)
      ↓ HTTP / DTO
apps/api (controladores, RBAC, validación)
      ↓ Use cases
libs/administration o dominio de apariencia (draft / publish / restore)
      ↓ puerto AppearanceRepository
PostgreSQL adapter (tablas de configuración y versiones)
```

- Crear migración **aditiva nueva**, con número siguiente al último realmente aplicado, para configuración de apariencia y sus publicaciones; no editar migraciones ya ejecutadas.
- Modelo sugerido: `site_appearance_settings` (singleton, borrador y revisión publicada), `site_appearance_versions` (snapshots validados, actor, fecha); reutilizar tabla de auditoría existente si encaja su contrato; de lo contrario crear auditoría específica.
- Ningún registro nuevo de tema debe copiar o reescribir `student_progress`, `learning_progress`, `users`, `auth_sessions`, quizzes, evidencias ni contenido académico.
- La personalización de tarjetas por curso solo debe almacenar campos de **presentación** o referenciar el catálogo persistente del `SPEC-CATALOG-300`. No crear duplicados del catálogo JSON que entren en conflicto.
- Aplicar design tokens con propiedades CSS (`--home-bg`, `--home-surface`, etc.) bajo un ámbito `data-home-theme` y tokens semánticos compatibles para sidebar; **no hacer sustitución masiva de colores globales** que rompa pantallas administrativas/de aprendizaje.
- Si la API de apariencia falla, devolver el **último tema publicado válido**; si no existe, utilizar el preset inicial en código. Evitar pantalla en blanco.
- El tema inicial debe reproducir el estilo oscuro de la referencia visual **sin depender de la imagen generada como archivo de UI**.

### 2.9. Assets visuales y rendimiento

- Usar ilustraciones originales o con licencia adecuada. El archivo de referencia visual no equivale a ocho ilustraciones separadas y reutilizables.
- Preferir SVG confiable (pasado por revisión/sanitización) o WebP/AVIF; utilizar `next/image` con `sizes`, dimensiones y `alt` cuando corresponda.
- Nunca subir GIF de 50–100 MB para animaciones de tarjetas; usar archivos ligeros o animaciones CSS moderadas. Definir presupuesto inicial de **≤150 KB por ilustración optimizada** (ajustable tras medición) y evitar layout shift.
- Evitar fondos animados pesados, parallax agresivo o efectos que reduzcan la legibilidad.
- El primer lote de tarjetas podrá cargar sus ilustraciones de forma prioritaria si la medición lo justifica; el resto usa carga diferida.

### 2.10. Sistema visual y Figma

Entregar una página Figma: **`QAPath / Home Cursos / Design System & Responsive`** con:

- Frames: `Desktop 1440`, `Laptop 1280`, `Tablet 834`, `Mobile 390` y estado de accesibilidad a 320 px.
- **Auto Layout** para sidebar, cabecera, buscador, filtros, CourseCard y grid.
- Componentes con variantes: `CourseCard` (default/hover/focus/in-progress/completed), `CategoryChip`, `SearchField`, `PrimaryButton`, `NavigationItem`, `ProgressBar`, `EmptyState`, `ErrorState`, `AdminThemeEditor`.
- Variables Figma agrupadas: `color/background`, `color/surface`, `color/text/*`, `color/border`, `color/action/*`, `color/feedback/*`, `spacing/*`, `radius/*` y modos/presets. Los nombres deben mapear claramente a los tokens del frontend.
- Documentar propiedades de componentes, estados, constraints, tipografía, espaciados, márgenes y comportamiento de contenido largo.
- Vista de ADMIN con selector de paleta, edición restringida, contraste, vista previa en 3 dispositivos, estado de borrador y botones de publicación/restauración.

### 2.11. Accesibilidad y calidad de interfaz

- Objetivo: **WCAG 2.2 AA**; contraste de texto normal **≥4.5:1** y texto grande **≥3:1**. Componentes y focos deben seguir los criterios pertinentes de contraste y navegación; no confiar en una verificación automática como única prueba.
- Ratón, teclado y táctil; feedback de resultados de búsqueda con regiones anunciables; chips semánticos con `aria-pressed` o patrón equivalente.
- `prefers-reduced-motion`, textos escalables, manejo de errores y `focus-visible`. No usar etiquetas de categorías por color solamente.
- Evitar modales de publicación que pierdan el foco, y garantizar que al cerrarlos se restaure al control invocador.

---

## 3. RESTRICCIONES

1. **Reconciliación previa obligatoria.** La imagen muestra avances más nuevos que el snapshot público revisado; Codex debe inspeccionar el working tree, los parches locales, los SPEC aprobados y la rama efectiva. Nunca sobrescribir el Home nuevo con `Dashboard` antiguo.
2. **No cambiar el negocio ni las rutas académicas.** Mantener identificadores estables de cursos, lecciones, progreso y pruebas. Compatibilidad con rutas previas mediante redirección/alias cuando aplique.
3. **No perder cursos ni estudiantes.** `Cursos` es la opción primaria del Home; archivar o publicar cursos se gestiona en el catálogo, no mediante la personalización visual.
4. **ADMIN exclusivamente en backend** para mutaciones; la UI oculta botones pero jamás sustituye al guard de roles. Un estudiante debe recibir `403`, un visitante `401` en endpoints administrativos.
5. **Borrador ≠ publicado.** Las ediciones privadas no deben ser observables en la web pública hasta confirmación explícita.
6. **No introducir HTML/CSS arbitrario ni URLs sin controlar.** Contratos estrictos, saneamiento, límites y revisión de imágenes.
7. **No modificar la base productiva directamente.** Migración en PostgreSQL de desarrollo → pruebas → staging → producción solo con respaldo, aprobación y plan de reversión.
8. **No desplegar automáticamente** al aprobar este SPEC. Autoriza implementar en rama de funcionalidad y ejecutar QA; merge/deploy requieren validación posterior.
9. **No afectar login, MFA, sesiones, notas, quizzes, evidencias, progresos ni auditoría existente.**
10. Si otro SPEC está implementando `SPEC-CATALOG-300`, **integrar** y no crear un segundo CRUD/tabla incompatible.
11. El tema debe continuar legible si fallan imágenes o la API. No depender de contenido generado en caliente para pintar el Home.
12. Mantener el proceso de construcción y las pruebas del monorepo (`pnpm check` más Playwright/SQL en entorno seguro) sin omitir fallos legítimos.

---

## 4. NO-OBJETIVOS

- No crear una segunda plataforma de cursos, LMS o CMS generalista.
- No reescribir los ocho cursos, sus módulos internos, prácticas ni materiales pedagógicos.
- No eliminar datos históricos por cambios visuales ni alterar reglas de progreso.
- No permitir a estudiantes cambiar el tema global para todos; preferencias individuales requerirán otro SPEC.
- No permitir edición arbitraria de HTML, CSS, JavaScript, SQL, layouts por drag-and-drop ni plugins de diseño desde ADMIN.
- No implementar un tema global obligatorio en la pantalla de estudio, la cuenta MFA, el panel ADMIN o todo el sitio sin pruebas dedicadas; primera entrega prioriza Home y navegación.
- No añadir un hero publicitario alto que desplace las tarjetas.
- No exigir uso de imágenes de la captura como recursos de producción sin disponer de originales y derechos.
- No publicar automáticamente en Vercel al guardar un borrador.

---

## 5. CRITERIOS DE ACEPTACIÓN (BDD)

| ID | Dado / Cuando / Entonces |
|---|---|
| AC-01 | Dado un visitante en escritorio 1440×900, cuando abre `/`, entonces ve cabecera breve, buscador, filtros y parte sustancial de la primera fila de tarjetas sin scroll. |
| AC-02 | Dado el catálogo con ocho cursos publicados, cuando abre el Home sin filtro, entonces se muestran ocho tarjetas en total y ninguna desaparece por un `slice`/overflow. |
| AC-03 | Dado un término de búsqueda, cuando lo introduce, entonces se filtran cursos por título/habilidad/categoría sin diferencias entre búsqueda lateral y principal. |
| AC-04 | Dado un filtro de categoría, cuando lo selecciona, entonces solo aparecen cursos correspondientes y el contador se actualiza; puede limpiar los filtros. |
| AC-05 | Dado un estudiante con progreso, cuando ve un curso, entonces aparecen porcentaje y CTA reales; jamás porcentajes de demostración. |
| AC-06 | Dado un curso sin imagen, cuando carga la tarjeta, entonces aparece placeholder estable y el botón sigue operativo. |
| AC-07 | Dado un ancho 320/390/834/1280/1440, cuando navega, entonces no hay scroll horizontal forzado ni tarjetas recortadas. |
| AC-08 | Dado un visitante o estudiante, cuando consulta endpoints ADMIN de apariencia, entonces recibe 401 o 403 conforme a su estado. |
| AC-09 | Dado un ADMIN, cuando selecciona el preset `Indigo Digital` y guarda borrador, entonces el Home público permanece con el tema publicado anterior. |
| AC-10 | Dado un ADMIN con borrador válido, cuando abre la vista previa, entonces ve desktop/tablet/móvil sin publicar cambios. |
| AC-11 | Dado un ADMIN, cuando intenta publicar colores sin contraste mínimo, entonces la API rechaza la publicación con feedback accionable y mantiene la versión anterior. |
| AC-12 | Dado un ADMIN con revisión N, cuando publica, entonces se crea revisión N+1, queda un único tema publicado y se genera auditoría sin secretos. |
| AC-13 | Dados dos administradores editando la misma revisión, cuando el segundo intenta sobrescribir una revisión obsoleta, entonces recibe HTTP 409. |
| AC-14 | Dado un tema nuevo publicado, cuando un visitante recarga, entonces ve los nuevos tokens de forma consistente sin necesidad de redeploy. |
| AC-15 | Dado un ADMIN, cuando restaura una versión previa, entonces se registra una nueva publicación auditable y el Home adopta la configuración restaurada. |
| AC-16 | Dado un fallo al leer el tema, cuando carga el Home, entonces se presenta un fallback legible y la lista de cursos sigue disponible si la API de catálogo funciona. |
| AC-17 | Dado un payload con CSS, script, URLs peligrosas o tokens desconocidos, cuando se envía, entonces la API responde 400 y no persiste esos campos. |
| AC-18 | Dado un cambio exclusivo de apariencia, cuando un estudiante retoma su curso, entonces progreso, sesiones, notas, quizzes y rutas mantienen su comportamiento previo. |
| AC-19 | Dado un usuario de teclado, cuando usa búsqueda, chips, tarjetas y CTA, entonces puede completar todas las acciones y distinguir el foco. |
| AC-20 | Dado `prefers-reduced-motion: reduce`, cuando abre el Home, entonces no hay animaciones distractoras ni pérdida de información. |
| AC-21 | Dado un curso archivado desde el catálogo autorizado, cuando abre el Home, entonces no aparece como publicado, pero su histórico académico no se elimina. |
| AC-22 | Dado un ADMIN que cambia solo la ilustración de una tarjeta, cuando publica, entonces la imagen conserva proporción, fuente autorizada, texto alternativo y peso dentro del presupuesto acordado. |
| AC-23 | Dado un diseño en Figma, cuando se revisa el handoff, entonces cada token y componente tiene mapeo explícito a frontend, variante y comportamiento responsive. |
| AC-24 | Dado un cambio listo para release, cuando se ejecuta CI y la suite Playwright de UI y RBAC, entonces los casos críticos pasan antes de cualquier despliegue. |

### Pruebas mínimas

- **Unitarias:** esquemas de token/contraste, fallback, normalización de preset, ordenamiento, filtro, mapeo de CourseCard y revisión optimista.
- **Integración API + PostgreSQL:** RBAC, lectura pública, borrador, publicación, restauración, auditoría, concurrencia y rollback transaccional.
- **E2E Playwright:** 1440×900, 1280×800, 834×1112, 390×844 y 320×720; navegación; búsqueda; filtros; cambio de tema; publicación/rollback; teclado; estado vacío y error; no regresión de cursos/progreso.
- **Accesibilidad:** axe o equivalente + validación manual de teclado, lector de pantalla, enfoque, zoom 200 % y contrastes. No interpretar «axe sin errores» como cumplimiento WCAG garantizado.
- **Visual regression:** capturas base de Home y ADMIN por tema, con datos de prueba estables.
- **Performance:** medir LCP, CLS, peso de imágenes y primer scroll en móvil y desktop; documentar resultados antes de establecer presupuestos de producción.

---

## 6. PLAN DE IMPLEMENTACIÓN AUTORIZADA

| Etapa | Entregable | Condición de salida |
|---|---|---|
| F0 — Reconocer versión | Inventario de working tree y diferencias con GitHub, rutas actuales de cursos y estado de `SPEC-CATALOG-300` | No sobrescribir cambios locales. |
| F1 — Contratos | Tokens, Zod schema, modelo y puertos de apariencia | Pruebas unitarias y revisión de seguridad. |
| F2 — Persistencia | Migración aditiva y CRUD de borrador/publicación/versiones | Integración DB y auditoría aprobadas. |
| F3 — Admin | Editor de paletas, campos, selector de imagen, preview, publish/restore | 401/403, contraste, 409 y focus tests. |
| F4 — Home | Cabecera compacta, grid responsive, ocho tarjetas, búsqueda/filtros, CTA de ruta | Validación visual y funcional sin ocultamiento. |
| F5 — Figma/handoff | Una página Figma con variantes/tokens/responsive y editor ADMIN | Mapeo diseño–código trazable. |
| F6 — QA final | `pnpm check`, Playwright, accesibilidad, rendimiento, SQL auditables | Evidencias y decisión GO/NO-GO. |
| F7 — Liberación | Pull request, revisión y despliegue separado | Solo con aprobación explícita; backup y rollback preparados. |

### Archivos candidatos (no exhaustivos; confirmar versión local)

```text
apps/web/src/app/page.tsx
apps/web/src/app/globals.css
apps/web/src/components/academy/dashboard.tsx
apps/web/src/components/academy/module-browser.tsx
apps/web/src/components/academy/module-card.tsx
apps/web/src/components/layout/sidebar.tsx
apps/web/src/components/admin/admin-dashboard.tsx
apps/web/src/components/admin/appearance-editor.tsx   # propuesto
apps/web/src/components/academy/course-card.tsx       # propuesto
apps/web/src/features/appearance/*                    # propuesto
apps/api/src/presentation/controllers/appearance.controller.ts       # propuesto
apps/api/src/presentation/controllers/admin-appearance.controller.ts # propuesto
apps/api/src/application/appearance/*                # propuesto
apps/api/src/infrastructure/adapters/postgres-appearance.adapter.ts  # propuesto
packages/contracts/src/appearance.ts                 # propuesto
packages/database/sql/0NN_site_appearance.sql       # número siguiente real
apps/web/tests/e2e/home-courses-appearance.spec.ts   # propuesto
```

---

## 7. MATRIZ DE RIESGOS Y REVERSIÓN

| Riesgo | Mitigación |
|---|---|
| GitHub detrás de la implementación local | Comparar working tree, ramas y SPEC-CATALOG-300; integrar cambios, no reemplazar. |
| Contrastes incorrectos o temas ilegibles | Validación de tokens en backend, preview accesible y fallback seguro. |
| Tema publicado se mezcla entre versiones en Next.js | Snapshots inmutables, `revision` y estrategia de caché/revalidación. |
| Un estudiante pierde acceso o progreso | No modificar esquema académico; probar regresión con dos usuarios. |
| ADMIN publica datos no seguros | RBAC, CSRF/origin, validación estricta, auditoría, límites y orígenes permitidos. |
| Imagen pesada o ausente | Presupuesto de peso, `next/image`, dimensiones, placeholders y fuente de activos controlada. |
| Figma y frontend divergen | Librería de tokens mapeada y checks visuales versionados. |
| Producción se rompe por el tema | Restaurar última configuración válida sin rollback de datos estudiantiles. |

---

## 8. DEFINITION OF DONE

- [ ] Home con los ocho cursos publicados visibles al navegar, con primera fila próxima a la cabecera y sin secciones distractoras.
- [ ] Catálogo, búsqueda, chips y rutas funcionan en desktop, tablet y móvil.
- [ ] ADMIN dispone de editor de paletas/curso/Home, borrador, preview, publicación y restauración.
- [ ] Contratos protegidos con RBAC; auditados y probados contra PostgreSQL.
- [ ] Temas no requieren redeploy y no reescriben progreso académico.
- [ ] Pruebas E2E, visuales, accesibilidad, build y revisión de seguridad aprobadas.
- [ ] Una página Figma con design tokens, Auto Layout, componentes y responsive preparada para handoff.
- [ ] Pull request con evidencias, capturas, migraciones y plan de rollback; sin despliegue automático.

---

## 9. INSTRUCCIÓN PARA CODEX / AGENTE DE DESARROLLO

> **Autorización:** implementar en una rama nueva, en desarrollo/staging, según este SPEC. **No ejecutar cambios en producción ni publicar automáticamente.**

```text
Actúa como Product Designer, Frontend Engineer, Backend Engineer y Lead QA.

Lee docs/specs/SPEC-UX-310-home-cursos-configurable-admin-TO-BE.md y
SPEC-CATALOG-300 (si existe en el repositorio). Revisa la imagen de
referencia y compárala con el working tree actual: no restaurar el Home
antiguo que aún pueda aparecer en main.

Implementa en una rama de feature:
1. Home compacto con los cursos como foco, filtros y tarjetas responsivas.
2. Design tokens y presets de apariencia configurables desde ADMIN.
3. Editor con borrador, vista previa, validación, publicar y restaurar.
4. Persistencia PostgreSQL aditiva, RBAC, auditoría y fallback público.
5. Ilustraciones optimizadas y CourseCard reutilizable.
6. Pruebas unitarias, integración, E2E, visuales y accesibilidad.

Primero entrega el diagnóstico y el plan de integración con el código local.
Después implementa de forma incremental y ejecuta pnpm check.
Conserva cursos, rutas, login, MFA, lecciones, quizzes y progreso.
NO hacer push a main, NO migrar producción, NO desplegar Vercel sin aprobación.
Reporta cambios, pruebas, limitaciones, riesgos y pasos de rollback.
```

---

## 10. REFERENCIAS

- Imagen del usuario: Home de QAPath Academy con sidebar oscuro, cabecera corta, buscador, categorías y ocho tarjetas.
- Repositorio de producto: https://github.com/CristianHdez90/qapathAcademy
- Figma Auto Layout: https://help.figma.com/hc/en-us/articles/360040451373-Guide-to-auto-layout-in-Figma
- W3C WCAG 2.2: https://www.w3.org/TR/WCAG22/
- Next.js Image: https://nextjs.org/docs/app/api-reference/components/image
- SPEC-CATALOG-300 y otros SPEC anteriores: referencia funcional del proyecto, **verificar que estén presentes y actualizados en el árbol local**.

**Fin del SPEC.**
