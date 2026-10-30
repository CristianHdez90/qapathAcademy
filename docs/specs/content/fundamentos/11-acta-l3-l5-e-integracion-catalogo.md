# 11 · Acta L3–L5, L2b e integración con SPEC-CATALOG-300

Fecha: 2026-10-29. Trabajo local, sin commit, sin push y sin despliegue.

## L3–L5 (Fundamentos v2)

| Lote | Resultado |
|---|---|
| L3 | Globos por estado (`state-balloons.tsx`) con puntero, teclado, toque y apertura única al quedar visibles. Con `prefers-reduced-motion` se muestran como lista. Diagramas SVG en `public/fundamentos/diagrams/` con alternativa textual. Resuelve T-01 y T-02 |
| L4 | Vista de módulo sin «Objetivo del módulo / Avance», sin «Completado ✦ Preguntar a MariBug» y sin «Consolida lo aprendido» en los 8 módulos. D-10: los otros 7 módulos cierran con «Test de cierre» al final de su última semana (`#closing-test`). Resuelve T-03 |
| L5 | Capítulos C02–C08 publicados. Las semanas 1–2 ya pueden completarse con la regla nueva. Resuelve T-04 |
| L2b | 14 especificaciones E2E migradas para que no recorran la vista antigua de las semanas 1–2 |

## Integración con SPEC-CATALOG-300 (Codex)

- Origen: worktree `codex/catalog-300`. Se compararon `delta-local.json` y `baseline-local.json` archivo por archivo.
- Los archivos compartidos que solo había cambiado Codex se tomaron de su versión. `packages/contracts/src/index.ts`, cambiado por ambos, se fusionó a mano: conserva `closingTest` y agrega `export * from './course-catalog'`.
- Ajuste a la vista de curso de Codex (`course-detail.tsx`): se quitó el quiz del módulo (contradecía D-10) y se reemplazó por el enlace «Test de cierre del módulo ↗» a `/study/<última semana>#closing-test`. «Preguntar a MariBug» se mantiene en la vista de curso porque forma parte de SPEC-CATALOG-300.
- `next.config.ts`: `allowedDevOrigins` para que `pnpm dev` funcione también en `127.0.0.1`.
- Copia de seguridad previa: `.git/claude-backup-pre-catalog.tgz`.
- El responsable aplicó las migraciones 006, 007 y 008 en la base local con `pnpm db:migrate`. `/courses` muestra los 8 cursos.

## Validación

| Verificación | Resultado |
|---|---|
| Pruebas Node | 235/235 |
| Typecheck, lint y build | Correctos |
| E2E `catalog-300.spec.ts` (Chromium) | 7/7 |
| E2E `foundation-v2.spec.ts` (Chromium) | 8/8. La prueba de vista de módulo ahora valida `/courses/<id>` |
| E2E de las 11 especificaciones migradas (Chromium) | 69 correctas, 2 omitidas, 9 fallidas |

### Fallos pendientes

- **Obsoletos por SPEC-CATALOG-300 (7):** el catálogo reemplazó el Home, el panel y el árbol de la ruta del menú lateral. Fallan `academy:3`, `focused-study:56`, `learning-tree:4`, `learning-tree:18`, `learning-tree-completion:2`, `learning-ux:8` y `lesson-pagination:3`. Hay que decidir si se retiran o se reescriben para la navegación por cursos.
- **`practice-progress:15` y `:20`:** fallan igual sin el catálogo. La migración a las semanas 9 y 7 no cumple las reglas de práctica de esas semanas (la 9 exige el cuaderno de programación completo). Hay que elegir otra semana o completar la actividad específica.

## Fuera de alcance, observado en el entorno local

- El registro devuelve 500 con `EMAIL_TRANSPORT=firebase`. Para pruebas locales conviene `console`.
- La cuenta se bloquea 15 minutos tras 5 intentos fallidos. Es el comportamiento esperado.
