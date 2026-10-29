# Estudio enfocado — riesgos y decisiones de aprobación

Estado inicial: propuesta documental. Los checkpoints conservan la historia de aprobación. **Estado D1 del 28 de octubre:** implementación local autorizada y 86 casos de navegador distintos satisfactorios; véase [validación D1](study-focused-d1-validation.md). Esto no autoriza producción. Prioridad P1 bloquea una implementación segura; P2 exige validación antes de aceptación. Son riesgos de la propuesta, no incidentes demostrados en producción.

| ID | Prioridad / riesgo | Evidencia y consecuencia | Mitigación / puerta |
|---|---|---|---|
| R1 | P1 · Cambiar significado de lectura | Cobertura del capítulo físico pasa a tarjetas; pesos o mínimos por tarjeta pueden dar crédito falso o exigir más trabajo | Correspondencia implementada y validada localmente para el catálogo actual: referencia pasiva, líneas homólogas, umbrales originales y ACK del proveedor. Evidencia y límites en D1. Cambios futuros de contenido/estilos deben repetir la validación; discrepancias bloquean el registro |
| R2 | P1 · Pérdida de estado al desmontar | selected y modos de animación son locales; hoy sobreviven porque se usa hidden | Elevar estado UI por semana/identidad antes del primer cambio de montaje; demostrar ida/vuelta |
| R3 | P1 · Notas pendientes descartadas | flushNote retorna void; debounce y red son asíncronos | Proveedor estable, SaveFeedback/reintento y guardia de salida verificable; no prometer recuperación tras recarga offline |
| R4 | P1 · Sobrescribir o duplicar chat | ASK_LIA_EVENT sustituye draft; remonte aborta petición; listeners repetidos pueden reenviar | Controlador único, confirmación antes de sustituir texto y cero POST al abrir; tests con red lenta |
| R5 | P1 · Foco/modal inaccesible | Árbol móvil tiene dialog propio; chat actual cierra por blur y no es un modal centrado completo | Coordinador único, sin nesting; inert/trap/restore; resolver Escape y salto de índice |
| R6 | P1 · Fuga entre identidades | Caché de tarjeta/chat puede sobrevivir cambio de usuario si no se define propietario | Claves por identidad/rol/semana, limpiar UI al cambiar cuenta; no serializar borradores privados en URL |
| R7 | P2 · Deep links e historial rotos | Hash antiguo no identifica concepto y destino aún no está montado | Resolver alias → montar → enfocar; popstate sin push; conservar rutas externas y modificadores |
| R8 | P2 · Pérdida o duplicación de contenido | exercise llega del adaptador, no JSON bruto; concepts/steps son alternativas | Inventario enriquecido; igualdad de textos/exportación; respetar alternativas actuales |
| R9 | P2 · Barras tapan campos | Sidebar/tabs/launcher globales y teclado móvil compiten por espacio | Alcance exclusivo study, tres controles, espacio inferior real, viewport visible y pruebas 320 px/zoom |
| R10 | P2 · Animación/lectura detrás de modal | Tracker reconoce dialog[open], demostración no lo hace | Pausar ambas explícitamente mientras hay modal; guardar pausa manual; movimiento reducido |
| R11 | P2 · Confusión entre visita y logro | Contador puede interpretarse como curso completo | Etiquetas distintas; cierre sin comandos; conservar cuatro etapas y su progreso real |
| R12 | P2 · Regresión transversal por layout | Shell global y asistentes compartidos con otras rutas | Estilos y selección de layout exclusivos de study; piloto y regresión fuera de estudio |
| R13 | P2 · Coste de secuencia extensa | Semana 1 tiene 36 pasos base más ejercicio; más clics pueden cansar | Índice libre, contador claro, reanudación; validar con estudiantes sin eliminar contenido |
| R14 | P2 · Antecedentes incompletos | SPEC-UX-001 y SPEC-UX-100 no localizadas; sin auditoría completa ejecutada | Declarar faltantes; revisar decisiones antes de aprobación; no atribuir evidencia inexistente |
| R15 | P1 para cerrar prototipo · Límites Figma | Starter rechazó reacciones múltiples y luego agotó cuota MCP; existen pantallas, sin recorrido conectado validado y con corrección móvil pendiente | Retomar desde IDs del handoff con capacidad disponible; usar acciones compatibles; no presentar maqueta como prototipo terminado ni aprobarla sin revisión |

## Decisiones propuestas para revisión

| Decisión | Recomendación | Estado |
|---|---|---|
| D1 · Lectura | Proyección de exposición real a referencia estática del capítulo; unión de intervalos, mismos umbrales/índices y guardado confirmado. Véase resolución detallada en el mapa de pasos | **Implementada localmente**. La actualización de ancho completo sustituye la restricción visual de columnas por un mapeo de glifos hacia bandas de la referencia original. Véase registro D1 para resultados por versión. No certifica equivalencia física de scroll ni toda accesibilidad. Continúa optativa; producción y activación general requieren las puertas restantes |
| D2 · Nivel de partición | Body/contexto, cada concepto, puntos, código y pasos funcionales según mapa; mantener orden | Propuesta pendiente de aprobación y prueba de carga de navegación |
| D3 · Estado | Propietario estable sobre tarjeta; proveedor y chat únicos; caché UI separada del logro | Propuesta pendiente de prueba de desmontaje |
| D4 · Reanudación | sessionStorage solo posición por identidad/semana, precedida por enlace directo | Propuesta, capacidad nueva de interfaz |
| D5 · Notas y salida | Permanecer/reintentar ante fallo; nunca tratar flushNote como ACK; definir salida explícita con cambios pendientes | Pendiente de microtexto y validación; recarga dura offline fuera de garantía actual |
| D6 · Modales | Native dialog o equivalente probado, un coordinador; chat sin cierre por blur; Escape cierra incluso maximizado | Propuesta; revisar diferencia respecto al chat actual |
| D7 · Contenido alternativo | No revelar automáticamente activity/answer ni steps sustituidos por concepts; mantener descarga actual | Propuesta de compatibilidad |
| D8 · Prototipo | Completar correcciones, conexiones y revisión de frames según handoff antes de implementación | Archivo Figma creado por autorización del usuario; aprobación pendiente; conexiones bloqueadas por límites del servicio |

Responsables por acordar: producto/pedagogía aprueba partición y mensajes; frontend/accesibilidad demuestra estado/modal; responsable de progreso verifica equivalencia académica; QA valida regresiones. No se asignan personas o aprobaciones inexistentes.

## Plan gradual posterior a aprobación

1. Cerrar D1–D8 y aprobar diseño/prototipo. Documentar cualquier desviación respecto a SPEC-UX-120.
2. Preparar modelo determinista y pruebas de inventario/aliases; todavía sin cambiar reglas académicas.
3. Resolver propiedad de estado y caracterizar lectura en una implementación aislada autorizada. No desplegar un piloto que regale o bloquee progreso.
4. Piloto semana 1 y semana avanzada con código; verificar notas, autoevaluación, descarga, historial y anclas.
5. Layout exclusivo study y modales; regresión a otras rutas y todas las semanas.
6. Preview con aceptación humana; publicación requiere autorización separada. Esta tarea no crea flags, ramas ni despliegues.

Si la estrategia necesita tocar `@qapath/progress`, migración o API, detener ese trabajo y tramitar SPEC individual; la aprobación de UX por sí sola no amplía ese alcance.

## Rollback propuesto

Conservar disponible la composición anterior durante el desarrollo aprobado. Preferir un selector reversible del layout en frontend, sujeto a revisión de implementación; no existe un flag creado por estos documentos. Ante pérdida de notas, crédito incorrecto, fallo de accesibilidad o identidad, detener rollout y restaurar la presentación anterior mediante cambio revisado, sin resetear progreso ni borrar datos de usuario.

La reversión conserva contratos y comandos académicos existentes. Una nota que solo vive en memoria debe guardarse o mantenerse antes de recargar para aplicar rollback. No prometer que un rollback recupera datos ya descartados. Verificar de nuevo hashes, /study/{week}#chapter-i, notas, autoevaluación, ejercicios y chat antes de reabrir. No usar force-push ni revertir cambios ajenos para restaurar UX.

## Cierre de esta fase

Entregables: cinco Markdown, evidencia del SHA, inventario de contenido, mapa de enlaces, handoff visual, matriz completa REQ/CA y riesgos. Implementación, pruebas ejecutables nuevas y publicación permanecen pendientes. Existe archivo Figma con pantallas editables; el recorrido clickable y validación final no están terminados. La entrega documental y las pantallas no equivalen a Definition of Ready ni Done: D1 y la revisión de diseño/prototipo siguen abiertos.

Actualización D1: se resolvió el diseño del cálculo y se distinguió expresamente equivalencia de decisión frente a equivalencia física de pantallas. No se cerró R1 mediante una declaración: su cierre exige aprobar la interpretación y validar la referencia estática sin efectos inactivos. La alternativa de medir por tarjetas visitadas, tiempo por tarjeta o pesos iguales queda descartada. Si la referencia no es viable, conservar el lector actual hasta aprobar una alternativa; no reducir restricciones para completar el rediseño.

Actualización de disponibilidad del prototipo: además de la cuota MCP, las interrupciones repetidas del editor impidieron cerrar el índice y validar la presentación. Se conservaron las conexiones configuradas y se preparó una revisión complementaria con datos de la semana 1. El servidor local de inspección no fue accesible desde el navegador integrado; solo se verificaron datos y sintaxis. Riesgo de falsa confianza: no confundir simulaciones de notas/IA ni conexiones observadas en Figma con pruebas de guardado, lectura académica, accesibilidad o funcionamiento real. Sigue pendiente el cierre del prototipo, su revisión y la aprobación previa a cualquier cambio de aplicación.

Checkpoint posterior: ya se completaron las conexiones del índice y se ejecutó una muestra de navegación y estados en presentación de Figma. Persisten riesgos observados: etiquetas largas comprimidas en el índice, avisos compartidos sin revisión móvil, contexto de MariBug todavía estático y Escape sin cerrar el historial en el visor. El conector volvió a alcanzar su límite tras una lectura y la edición por UI presentó interrupciones y ajustes de dimensionado que no se confirmaban. La definición de preparación sigue abierta; no solicitar aprobación de implementación tratando estas observaciones como resueltas. Véase el último checkpoint del handoff para lo efectivamente probado y lo pendiente.

Revisión posterior: las etiquetas largas se corrigieron y se observaron legibles en escritorio, 390 y 320; se comprobaron avisos compactos de notas y descarga en móvil. Escape tiene ahora una interacción explícita y pasa las muestras repetidas. El riesgo de contexto está confirmado como restricción del plan: Figma no permite variables de prototipado en la cuenta actual. No se modificaron plan o permisos ni se dejó una interacción incompleta.

Se caracterizó el riesgo de foco del visor con su estructura accesible activada temporalmente: permite Enter/Tab, pero no confina Tab dentro del índice ni devuelve el foco al lanzador tras Escape. Restaurada la preferencia original. No presentar esto como una corrección web ni rebajar los requisitos del diálogo de QAPath para que el prototipo parezca aprobado. Continúan abiertas la validación de foco en una implementación autorizada, el contexto por tarjeta y D1. Los nombres históricos «1440» de los ocho avisos permanecen, aunque sus dimensiones actuales son compactas (320 × 700); usar IDs y dimensiones del último checkpoint al retomar, no inferir el ancho por el nombre.

El prototipo web independiente se publicó en Sites con autorización previa de publicación y con acceso privado, conservando exactamente el adjunto y su aislamiento. No sustituye la aplicación ni prueba contratos de progreso, notas o IA. Su código permite representar contexto y foco sin depender de las variables de Figma, pero la prueba interactiva sigue abierta por el acceso SSO: el usuario autorizó OpenAI y quedó pendiente la autorización del proveedor Microsoft o inicio de sesión manual. No cambiar privacidad, eliminar CSP, usar credenciales de backend como atajo ni declarar aceptación de teclado basándose solo en inspección estática o despliegue exitoso.

### Actualización del riesgo de contexto y foco · 27 de octubre de 2026

El acceso manual permitió probar el original y detectar fallos de foco. La corrección se publicó exclusivamente en /revision del Site privado, sin cambiar el original, ambas CSP ni el iframe aislado. La versión 76159604d56633be5b9f5b0dcf7eab398bb9eff3 pasa las muestras de contexto QA/QC, borrador conservado, Tab/Shift+Tab y Escape con retorno a los tres lanzadores. Menú se comprobó con módulos cerrados y con el último expandido, excluyendo enlaces invisibles del cálculo del foco.

Esto reduce la incertidumbre del prototipo web. No elimina las restricciones del visor de Figma ni prueba lectura, notas o IA reales. Continúan pendientes aprobación humana y validación D1 antes de implementar. Véanse handoff y matriz para evidencia y alcance. No trasladar resultados del Site a producción QAPath Academy.
