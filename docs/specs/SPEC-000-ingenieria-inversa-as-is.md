# SPEC-000 — Ingeniería inversa AS-IS de QAPath Academy

> **Tipo:** Especificación de documentación / reducción de deuda técnica de Vibe Coding  
> **Estado:** Propuesta para ejecutar en Codex  
> **Versión del Spec:** 1.0.0  
> **Modo de ejecución:** **SOLO LECTURA DEL CÓDIGO + ESCRITURA EXCLUSIVA DE MARKDOWN EN `docs/specs/`**  
> **Repositorio de referencia:** https://github.com/CristianHdez90/qapathAcademy  
> **Fuente de verdad:** la revisión/commit efectivamente disponible en el workspace al iniciar la ejecución  
> **Estrategia:** AS-IS (lo que existe) → inventario de deuda técnica → TO-BE mediante Specs futuros, separados y aprobados

## 01. Intención

Reconstruir las especificaciones funcionales y técnicas de **QAPath Academy** a partir de su implementación actual, porque el proyecto se inició desde el código (Vibe Coding) antes de consolidar requisitos verificables.

Esta primera fase tiene como finalidad:

- Registrar **qué hace hoy el sistema**, qué reglas de negocio aplica, cómo se relacionan sus módulos y dónde está implementado cada comportamiento.
- Producir una base documental de **Spec-Driven Development (SDD)** que permita que los futuros cambios comiencen con una especificación revisable antes de modificar código.
- Hacer visible la deuda técnica, las discrepancias entre código, documentación y pruebas, y los comportamientos que necesitan confirmación.
- Preservar íntegramente el comportamiento existente en los entornos locales, CI y producción.

**Resultado esperado:** un conjunto de documentos `.md` verificables, trazables al repositorio y separados de cualquier propuesta de implementación.

## 02. Comportamiento

### 2.1. Alcance del análisis

Codex **DEBE inspeccionar** el repositorio disponible y documentar los elementos que encuentre, sin presuponer que la lista es exhaustiva:

| Dominio / capacidad | Evidencia a buscar | Documentación propuesta |
|---|---|---|
| Visión y arquitectura | `README.md`, `docs/`, `apps/`, `libs/`, `packages/`, archivos de configuración | `001-arquitectura-actual.md` |
| Identidad y sesiones | Servicios de identidad, rutas `/auth`, guards, cookies, persistencia | `002-identidad-y-sesiones.md` |
| MFA y recuperación | TOTP, QR, desafíos, códigos de recuperación y su rotación, cuando existan | `003-mfa-y-recuperacion.md` |
| Estudiantes y roles | Registro, administración, RBAC, permisos de ADMIN/STUDENT/otros roles implementados | `004-usuarios-y-autorizacion.md` |
| Progreso académico | Casos de uso, API `/me/progress`, calificaciones, persistencia y aislamiento | `005-progreso-academico.md` |
| Contenido de aprendizaje | Módulos, semanas, lecciones, guías, laboratorios y evaluaciones existentes | `006-contenidos-y-evaluaciones.md` |
| Administración y auditoría | Controladores, operaciones administrativas, eventos y tablas | `007-administracion-y-auditoria.md` |
| Infraestructura e integraciones | Next.js, NestJS, PostgreSQL/Drizzle, Firebase, proveedores externos y Vercel | `008-integraciones-y-despliegue.md` |
| Funcionalidades adicionales | Asistente de QA, prácticas, misiones y otras capacidades detectadas en el código actual | `009-funcionalidades-adicionales.md` |
| Calidad y pruebas | Tests unitarios, arquitectura, integración, E2E, CI/CD y evidencias existentes | `010-calidad-y-cobertura.md` |
| Deuda técnica AS-IS | Hallazgos demostrables, impacto, riesgo y propuesta futura **sin ejecutarla** | `011-inventario-deuda-tecnica.md` |
| Mapa de trazabilidad | Requisito → archivos → endpoints/UI → tests → estado de evidencia | `012-matriz-trazabilidad.md` |

Los nombres anteriores son una propuesta de salida. Si un dominio no existe o no se encuentra evidencia, indicarlo expresamente; no inventar su implementación. Si aparecen nuevos dominios, añadir un documento `.md` de forma consistente.

### 2.2. Proceso de ingeniería inversa

1. **Fijar línea base.** Registrar la fecha de análisis, rama y SHA (`git rev-parse HEAD`), el árbol relevante y cualquier diferencia local conocida. No alterar el estado del repositorio.
2. **Inventariar.** Identificar paquetes, responsabilidades, entidades de dominio, casos de uso, puertos, adaptadores, controladores, rutas, pantallas, persistencia e integraciones.
3. **Reconstruir flujos.** Describir precondiciones, evento disparador, actor, pasos, postcondiciones, errores, permisos y efectos persistentes tal como están implementados.
4. **Extraer reglas e invariantes.** Priorizar validaciones de backend y dominio; distinguirlas de validaciones de UI, comentarios, documentos históricos o supuestos.
5. **Relacionar código y pruebas.** Para cada afirmación material, registrar la ruta de archivo y, cuando sea posible, símbolo/función, endpoint y prueba vinculada.
6. **Contrastar sin intervenir.** Comparar documentación, tests y código. Registrar diferencias como `CONFIRMADO`, `INFERIDO`, `NO VERIFICADO` o `CONTRADICTORIO`.
7. **Documentar deuda técnica.** Añadir hallazgos con evidencia, riesgo y prioridad sugerida. Ningún hallazgo autoriza una modificación.
8. **Cerrar con resumen.** Publicar en `docs/specs/000-ingenieria-inversa-as-is.md` el índice de Specs, cobertura lograda, incertidumbres y próximos Specs TO-BE propuestos.

### 2.3. Contrato de cada Spec funcional

Cada documento de capacidad **DEBE contener**, como mínimo, estas cuatro secciones con el mismo nombre:

```markdown
# SPEC-XXX — Nombre de la capacidad

## 01. Intención
¿Por qué existe esta capacidad y qué problema resuelve hoy?

## 02. Comportamiento
- Actores, entradas, flujo principal y alternos.
- Estados, resultados, reglas de negocio y errores implementados.
- Criterios de aceptación observables, derivados del código.

## 03. Restricciones
- Seguridad, permisos, validaciones, persistencia, integridad, integración.
- Evidencia: rutas de archivos, símbolos, endpoints y pruebas.
- Indicar CONFIRMADO / INFERIDO / NO VERIFICADO / CONTRADICTORIO.

## 04. No-Objetivos
- Qué NO cubre la capacidad actual.
- Qué NO se implementará durante esta ingeniería inversa.

## Evidencia y trazabilidad
| Afirmación | Evidencia (ruta + símbolo) | Test/observación | Estado |
|---|---|---|---|

## Preguntas abiertas y deuda técnica
- Hallazgos sin solución implementada.
```

### 2.4. Criterios de aceptación de esta tarea documental

**CA-01 — Integridad funcional:** dado el proyecto actual, cuando Codex finalice, el código fuente, las dependencias, configuraciones, migraciones y pruebas preexistentes deben permanecer intactos.

**CA-02 — Uniformidad:** todos los Specs funcionales generados contienen `Intención`, `Comportamiento`, `Restricciones` y `No-Objetivos`.

**CA-03 — Trazabilidad:** cada regla material incluye al menos una referencia verificable a un archivo/símbolo; si no hay evidencia suficiente, queda etiquetada `NO VERIFICADO`.

**CA-04 — Cobertura:** existe un índice de capacidades descubiertas y de las capacidades todavía no estudiadas, sin confundir ausencia de evidencia con ausencia de funcionalidad.

**CA-05 — Deuda técnica:** todo hallazgo documenta síntoma, evidencia, impacto, criticidad y recomendación candidata; **no se modifica el sistema**.

**CA-06 — Confidencialidad:** ningún documento contiene contraseñas, secretos TOTP, códigos de recuperación, tokens, cookies, URLs privadas con credenciales, claves de Firebase o datos personales reales.

**CA-07 — Revisión:** Codex presenta un resumen de documentos creados, evidencia y preguntas abiertas. Cualquier paso de implementación queda explícitamente pendiente de aprobación humana.

## 03. Restricciones

### R-CRIT-001 — MODO SOLO DOCUMENTACIÓN (obligatoria e innegociable)

> **Codex NO DEBE modificar funcionalidades existentes, código fuente, componentes, API, contratos, bases de datos, migraciones, pruebas, archivos de dependencias, configuración, infraestructura, despliegues ni pipelines.**
>
> **ÚNICOS archivos autorizados para crear o editar:** archivos Markdown (`*.md`) situados dentro de `docs/specs/`.
>
> **NO ejecutar acciones con efectos laterales:** commits, push, merges, instalaciones, builds, migraciones, seeds, tests que escriban datos, llamadas mutativas HTTP, scripts que generen archivos, deploys o cambios en GitHub/Vercel/Firebase/PostgreSQL.
>
> Los hallazgos se **registran**, no se **corrigen**. Si se requiere tocar cualquier archivo fuera de `docs/specs/`, detener esa acción y solicitar una nueva Spec TO-BE con aprobación explícita.

### R-002 — Fuente de verdad y niveles de confianza

- El comportamiento **AS-IS** del código es la referencia principal; los tests y documentación son evidencia complementaria.
- La producción puede diferir de `main`: no afirmar equivalencia sin comparar su despliegue/commit. Las validaciones que el propietario haya comunicado se marcan como `REPORTADO POR USUARIO` si no se corroboraron.
- Los nombres de tablas, rutas, permisos y capacidades se extraen del repositorio analizado; no asumir valores de versiones anteriores.
- No fabricar comportamientos, diagramas, métricas ni resultados de tests.

### R-003 — Trazabilidad verificable

- Cada Spec debe conectar intención con comportamiento, restricciones, artefactos del código y pruebas existentes.
- Usar rutas **relativas** al repositorio y símbolos relevantes; cuando existan líneas estables, referenciarlas.
- Distinguir comportamiento existente de **recomendación futura**; el inventario de deuda técnica no es una orden de refactorización.

### R-004 — Seguridad y privacidad

- No abrir ni copiar archivos `.env` reales, llaves privadas, credenciales, bases de datos de producción ni secretos almacenados fuera del repositorio.
- Usar `.env.example` y código de lectura de configuración para documentar variables, sin registrar sus valores reales.
- No autenticar usuarios de producción ni invocar endpoints con efectos de escritura.
- Evitar registrar correos, datos personales, IDs de sesión, códigos MFA, recovery codes o tokens de verificación.

### R-005 — Preservación arquitectónica

- Documentar las dependencias y límites existentes entre `apps`, `libs` y `packages` sin forzar una interpretación idealizada de Clean Architecture, Hexagonal o DDD.
- Si una regla arquitectónica deseada contradice el código, registrar la diferencia y el riesgo; **no reorganizar carpetas ni refactorizar**.
- No introducir frameworks, patrones, paquetes ni cambios de versión en esta fase.

### R-006 — Límite de escritura y verificación final

- Antes de crear archivos, verificar que la ruta de destino esté dentro de `docs/specs/`.
- Al terminar, mostrar `git status --short` o un diff equivalente y comprobar que **solo** existan cambios permitidos de tipo `.md` bajo `docs/specs/`.
- Si aparecen cambios no autorizados, **no borrarlos ni revertirlos automáticamente**: señalarlos y detener la entrega hasta aclarar su origen.

## 04. No-Objetivos

- Reescribir o rediseñar funcionalidades de QAPath Academy.
- Refactorizar código legacy, reorganizar la arquitectura o cambiar contratos, endpoints o esquema de PostgreSQL.
- Actualizar dependencias, arreglar ESLint, modificar componentes React o mejorar rendimiento durante el análisis.
- Añadir o modificar tests automatizados, aunque se detecten huecos de cobertura.
- Rotar secretos MFA, cambiar políticas de usuarios, ejecutar migraciones o interactuar con datos reales.
- Cambiar configuración de Firebase, Vercel, GitHub Actions o dominios de producción.
- Declarar la aplicación «libre de deuda técnica», «segura para producción» o «completamente especificada» sin evidencia.
- Implementar las propuestas TO-BE identificadas: esas acciones pertenecen a Specs posteriores con revisión y aprobación.

---

## Entregables de la fase AS-IS

La ejecución deberá producir, **solo en `docs/specs/`**:

1. `000-ingenieria-inversa-as-is.md`: índice, línea base, método, cobertura, conclusiones y preguntas abiertas.
2. Specs funcionales numerados por los dominios efectivamente identificados, todos con las cuatro secciones obligatorias.
3. `011-inventario-deuda-tecnica.md` o equivalente: backlog de hallazgos trazable y sin cambios implementados.
4. `012-matriz-trazabilidad.md` o equivalente: requisito ↔ evidencia ↔ pruebas ↔ estado.

Si un entregable no puede completarse, crear una sección `Pendiente de evidencia` y explicar el bloqueo; no inventar información.

## Instrucción lista para pegar en Codex

```text
Actúa como analista de requisitos, arquitecto de software y QA Lead de QAPath Academy.

Lee docs/specs/SPEC-000-ingenieria-inversa-as-is.md y ejecútala en MODO SOLO DOCUMENTACIÓN.

1. Inspecciona el repositorio de manera no destructiva y registra rama y SHA actual.
2. Reconstruye las especificaciones AS-IS de las capacidades reales: Identity, MFA,
   roles, progreso, contenidos, administración, auditoría, integraciones,
   laboratorios/asistente QA, calidad y despliegue, únicamente si existe evidencia.
3. Crea o edita SOLAMENTE archivos .md dentro de docs/specs/.
4. Cada Spec debe incluir Intención, Comportamiento, Restricciones y No-Objetivos,
   criterios de aceptación, evidencia del código y estado de verificación.
5. Documenta contradicciones, incógnitas y deuda técnica sin implementar arreglos.
6. No modifiques ninguna funcionalidad, código, prueba, dependencia, migración,
   archivo de configuración, CI/CD, ni datos; no ejecutes comandos mutativos.
7. Cierra con el índice de Specs, matriz de trazabilidad, prioridades propuestas
   y comprobación de que el diff solo contiene Markdown dentro de docs/specs/.

Ante dudas, registra NO VERIFICADO y continúa sin inventar información.
No comiences la fase TO-BE ni hagas commits/push sin una autorización posterior.
```

## Política de evolución futura (fuera de esta Spec)

Un cambio funcional solo podrá pasar a implementación mediante una **nueva Spec TO-BE** con objetivo, alcance, restricciones, no-objetivos, pruebas de regresión, evaluación de riesgos, estrategia de reversión y aprobación explícita del propietario.
