# SPEC-113 — Corregir lint que bloquea CI

> Tipo: corrección acotada de calidad; sin cambio funcional.
> Solicitud del propietario: «resolver fallo de CI», en esta conversación.
> Base: `origin/main` / `83769adadca6314898a47a9871d0825a6a0c6d99`.
> Rama: `codex/fix-ci-lint`.
> Estado: corrección local realizada; verificación remota pendiente. Merge no autorizado por esta solicitud.

## 01. Intención
Resolver el fallo de `quality` observado en [el job del PR #1](https://github.com/CristianHdez90/qapathAcademy/actions/runs/40440061191/job/121978010562), que detuvo el pipeline antes de E2E.

El log registra 316 diagnósticos (288 errores, 28 warnings). La mayoría corresponden a bibliotecas estándar de TypeScript distribuidas como recursos; también hay errores propios en un texto JSX y un identificador de una prueba. Son hallazgos del log de esa revisión, no métricas actuales de cobertura.

## 02. Comportamiento
### Corrección
1. Excluir de ESLint únicamente `public/practice/typescript/lib.*.d.ts`, bibliotecas estándar de terceros. El código de la aplicación, las pruebas y los demás recursos mantienen sus reglas.
2. Representar `total(3, 'QA10', 'delivery')` como expresión de cadena JSX, conservando exactamente el texto/render del componente.
3. Renombrar la variable local `module` a `courseModule` en el recorrido de semanas de una prueba, sin cambiar sus aserciones o navegación.

### Alcance
- `apps/web/eslint.config.mjs`.
- `apps/web/src/components/academy/programming-hint.tsx`.
- `apps/web/tests/e2e/learning-tree.spec.ts`.
- Este documento.

No se modifica el workflow, sus versiones de acciones, los límites de evidencia de SPEC-110, los archivos de bibliotecas de terceros ni las reglas globales de TypeScript/ESLint.

### Criterios de aceptación
- CA-01: lint completo de web y API termina con código 0.
- CA-02: ESLint ignora lib.es5.d.ts/lib.decorators.d.ts y sigue analizando ProgrammingHint y learning-tree.spec.ts.
- CA-03: el HTML de ProgrammingHint en el tema retest es idéntico antes/después.
- CA-04: no se altera la lógica del recorrido de 24 semanas; la prueba sigue siendo descubierta por Playwright.
- CA-05: tests existentes y typecheck web pasan, sin cambios de dependencias ni datos.
- CA-06: la corrección remota se verifica en el nuevo head; no se interpreta un E2E omitido como aprobado.

### Validación local
- `node node_modules/eslint/bin/eslint.js .`, desde apps/web: código 0.
- `node node_modules/eslint/bin/eslint.js src --ext .ts`, desde apps/api: código 0.
- `node node_modules/typescript/bin/tsc -p apps/web/tsconfig.json --noEmit --incremental false`: código 0.
- Comparación del render antes/después con TypeScript y ReactDOMServer instalados: HTML idéntico.
- `ESLint.isPathIgnored`: true para las bibliotecas estándar verificadas; false para el componente y la prueba propios.
- `node --test tests/*.test.mjs`: **212 aprobadas, 0 fallidas, 0 omitidas**.
- Playwright `test tests/e2e/learning-tree.spec.ts --list`: **6 pruebas descubiertas** (3 por navegador); esto comprueba carga/descubrimiento, no ejecución E2E.

### Riesgo y reversión
El riesgo principal es excluir demasiado código del lint: se limita el patrón al directorio de bibliotecas de TypeScript y a sus nombres lib.*.d.ts. No se desactiva ninguna regla sobre código propio.
Revertir este cambio de configuración/cadena/identificador restablece el fallo de lint previo, sin afectar datos, sesiones ni esquema. No requiere migración.
La corrección se publica por rama/PR para comprobar CI; no se fusiona main automáticamente. Las advertencias de runtime de acciones no son la causa del fallo y no se actualizan en esta iteración.

## 03. Restricciones
No cambiar contenido visible, comportamiento académico, guards, persistencia, secretos ni servicios. No usar --fix sobre todo el repositorio ni ocultar fallos de la aplicación con ignores generales. No migrar ni desplegar manualmente como parte de esta corrección.

## 04. No-Objetivos
No endurecer validación académica, arreglar toda la deuda técnica ni modificar políticas de skips de seguridad. La ejecución remota puede revelar fallos distintos: se deben describir con evidencia en lugar de omitirlos para conseguir verde.

## Evidencia y trazabilidad
| Afirmación | Evidencia | Estado |
|---|---|---|
| Lint bloqueó quality y E2E dependía de quality | Log del job enlazado; `.github/workflows/quality.yml` | CONFIRMADO |
| Bibliotecas estándar copiadas en recursos | `apps/web/public/practice/typescript/lib.es5.d.ts`; `apps/web/src/features/practice/runtime/typescript-check.ts` — typeLibraryNames | CONFIRMADO |
| Errores propios corregidos | ProgrammingHint: cadena retest; learning-tree.spec.ts: bucle de módulos | CONFIRMADO |
| Calidad remota tras el cambio | Nuevo PR/head, por comprobar | PENDIENTE DE EVIDENCIA |
