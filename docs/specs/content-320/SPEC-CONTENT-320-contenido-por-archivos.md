# SPEC-CONTENT-320 · Contenido de estudio cargado por archivos

## Alcance
Cada curso (nuevo o existente) tiene una sección **Contenido de estudio** con lecciones que el ADMIN carga como archivos. Fundamentos conserva su contenido actual; las lecciones cargadas se muestran además, debajo de él.

| Formato | Uso | Render |
|---|---|---|
| `.md` | Lectura (GFM: tablas, listas, citas; bloques ```` ```mermaid ````) | react-markdown + remark-gfm; HTML crudo se descarta |
| `.mmd` | Diagrama Mermaid | mermaid 12 (`securityLevel: strict`, sin `%%{init}` ni `click`) |
| `.json` `type: "graph"` | Mapa interactivo con globos | React Flow (@xyflow/react 12) + panel «globo» + botones accesibles |
| `.json` `type: "chart"` | Gráfica bar/line/area/pie | Recharts 3 + tooltip, leyenda y «Ver tabla» |
| `.svg` | Imagen estática | `<img>` (sin scripts ni recursos externos) |
| `.drawio` / `.puml` | No se aceptan | Mensaje: exportar a SVG y cargar el `.svg` |

Límites: md/json 200 KB, mmd 50 KB, svg 300 KB; 30 archivos por lección; 60 lecciones activas por curso.

## Esquemas JSON
```json
{"type":"graph","title":"Niveles de prueba","direction":"LR",
 "nodes":[{"id":"sistema","label":"Sistema","group":"accent","detail":{"title":"Prueba de sistema","text":"…","bullets":["…"]}}],
 "edges":[{"from":"componente","to":"sistema","label":"opcional","animated":true}]}
```
`group`: primary | accent | info | warning | neutral. `x`/`y` opcionales (si faltan, se calcula el diseño por niveles).
```json
{"type":"chart","title":"Defectos por sprint","chart":"bar","xKey":"sprint","unit":"defectos",
 "series":[{"key":"abiertos","label":"Abiertos"}],"data":[{"sprint":"S1","abiertos":12}]}
```
El editor ofrece plantillas descargables de los cuatro tipos.

## Flujo
1. Administración → Gestionar cursos → Editar curso → **Lecciones de «curso»** → ＋ Nueva lección.
2. Arrastrar o seleccionar archivos; cada uno se valida al instante (mismo validador que la API).
3. Ordenar (↑ ↓), retirar, **Vista previa**, crear (borrador) y publicar.
4. El estudiante ve «Lecciones del curso» en `/courses/[slug]` y lee `/courses/[slug]/lessons/[id]`.

Un curso **En construcción** no muestra lecciones a estudiantes. Un curso «Selección de contenido existente» sin contenido asignado puede publicarse si tiene al menos una lección publicada.

## Datos y seguridad
- Migración aditiva `012_course_lessons.sql`: `course_lessons`, `course_lesson_files`. Archivar lecciones y retirar archivos nunca borra filas; progreso y rutas no se tocan.
- API: `GET /courses/:slug/lessons[/:id]` (público, solo publicadas); `/admin/courses/:id/lessons` (ADMIN: GET, POST, PATCH con `revision`, DELETE=archivar, POST `/restore`, PUT `/order`). Concurrencia optimista (409) y auditoría `LESSON_*`.
- Límite JSON de la API: 2 MB (`API_JSON_LIMIT`).

## Verificación
- `tests/course-lessons.test.mjs`, `tests/course-lessons.integration.test.mjs`, `apps/web/tests/e2e/study-content-320.spec.ts`.
