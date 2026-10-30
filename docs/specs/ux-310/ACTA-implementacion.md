# SPEC-UX-310 · Acta de implementación local

Fecha: 2026-10-29. Trabajo local, sin commit, push, migración productiva ni despliegue.

## Decisión de diseño

El Home actual queda como preset **«QAPath Original»**. Mientras ese preset se publique sin cambiar sus tokens, el Home y el menú lateral se pintan exactamente igual que antes: no se aplica ningún override.

## Qué se implementó

| Fase | Entregable | Archivos |
|---|---|---|
| F1 Contratos | Esquema Zod estricto: 12 tokens hexadecimales, textos planos acotados, presentación por curso (orden, texto, etiquetas, acento y una ilustración de la biblioteca). 4 presets y validación de contraste WCAG 2.2 AA | `packages/contracts/src/appearance.ts` |
| F2 Dominio y persistencia | `ManageAppearance` (borrador, publicación, versiones, restauración, fallback). Migración aditiva `010_site_appearance.sql`. Adaptador PostgreSQL transaccional con concurrencia optimista y auditoría `APPEARANCE_DRAFT_SAVED / APPEARANCE_THEME_PUBLISHED / APPEARANCE_THEME_RESTORED` | `libs/administration/src/application/manage-appearance.ts`, `apps/api/src/infrastructure/adapters/postgres-appearance.adapter.ts` |
| API | `GET /appearance/home` (público, solo publicado). Bajo `/admin/appearance/home` (ADMIN): `GET`, `PATCH draft`, `POST publish`, `GET versions`, `POST restore`. Respuestas 400 / 401 / 403 / 409 / 422 | `apps/api/src/presentation/controllers/appearance.controller.ts` |
| F3 Admin | `Administración › Apariencia › Home de cursos` (`/admin/appearance`), con cuatro pestañas: Paleta y tema (presets, tokens, tabla de contraste), Tarjetas, Textos del Home, y Vista previa y publicación (escritorio, tablet y móvil; progreso simulado; guardar, publicar, versiones y restaurar) | `apps/web/src/components/admin/appearance-editor.tsx` |
| F4 Home | El Home recibe la apariencia publicada por SSR, con fallback al preset inicial. Tokens con ámbito `data-home-theme` (Home y menú lateral). Orden, textos, etiquetas, acentos e ilustraciones por curso | `apps/web/src/components/courses/course-catalog.tsx`, `home-theme.css`, `features/appearance/*` |

## Validación

| Verificación | Resultado |
|---|---|
| Pruebas Node | 242/242 (4 nuevas en `tests/appearance.test.mjs`) |
| Integración API + PostgreSQL (script local) | 23/23: fallback, 401, 403, borrador no público, 409, 400 por HTML/CSS/campos desconocidos, 422 por contraste, publicación, restauración, auditoría sin secretos |
| UI de punta a punta (script local) | Original sin overrides; borrador privado; publicación desde la UI; tema claro, textos y orden aplicados; sin scroll horizontal a 320, 390, 834 y 1280 px; el tema no sale del Home |
| E2E del repositorio | `home-courses-appearance.spec.ts` 3/3, `catalog-300` 7/7, Fundamentos v2 10/10, focused-study 6/6 |
| Typecheck y lint | Correctos |

## Pendiente o fuera del alcance de esta entrega

- **F5 Figma:** desde este entorno no se puede crear la página Figma. Los tokens tienen nombres directamente mapeables (`color/background` → `background`…).
- **Subida de imágenes:** no hay servicio de almacenamiento validado, así que las ilustraciones se eligen de la biblioteca interna de SVG originales.
- **Tema global:** lecciones, MFA y ADMIN siguen con su diseño propio, como indica el SPEC.
- **Antes de producción:** ejecutar `pnpm db:migrate` (migración 010) en desarrollo, staging y producción con respaldo, y revisar las pruebas visuales por tema.

## Reversión

- Restaurar una versión anterior desde el editor (crea una nueva publicación auditada).
- O dejar la tabla sin publicación: el Home vuelve a «QAPath Original».
- Las tablas nuevas no se relacionan con progreso ni contenido académico.

## Ampliación: tema en toda la plataforma (solicitud del responsable)

- El layout raíz lee por SSR la apariencia publicada y la aplica a **todas las pantallas**: Home, cursos, lecciones, lectura enfocada, prácticas, cuenta y administración. No hay parpadeo y no requiere redeploy.
- Un plugin de PostCSS (`apps/web/scripts/theme-colors.cjs`) convierte, en la compilación, cada color hexadecimal de las hojas de estilo en `var(--q-<hex>,<hex>)`. El código fuente no se modifica.
- `site-theme.ts` reasigna esos colores según los tokens publicados:
  - Conserva la posición de cada color entre fondo y texto (luminancia OKLab).
  - Los tonos fríos pasan al primario o al foco del tema.
  - Los cálidos (errores y avisos) conservan su tono.
  - Los colores exactos de «QAPath Original» se mapean token a token.
- Con «QAPath Original» publicado sin cambios no se emiten variables, así que el diseño queda idéntico.
- El inventario de colores lo genera `prepare-theme-colors.mjs` en `dev` y `build`; la prueba `tests/theme-colors.test.mjs` verifica que no falte ninguno.
- Validación:
  - 244/244 pruebas Node.
  - E2E: 61/61 entre Home, Fundamentos, lectura enfocada y lectura; 7/7 en catálogo.
  - Recorrido visual con Coral Studio y Midnight Violet en Home, curso, lección, lectura enfocada, cuenta y práctica.
- Límite conocido: los colores definidos en línea dentro de componentes (por ejemplo, las ilustraciones SVG o el color de módulo) conservan su valor.
