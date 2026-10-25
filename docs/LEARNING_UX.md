# Recorrido de aprendizaje y patrones UX/UI

## Inicio y módulos

La tarjeta «Tu siguiente actividad» busca el primer requisito pendiente de la ruta: capítulo por leer, práctica validada, autoevaluación o test del módulo. Se calcula con las mismas evidencias del progreso automático. Si todo está completo, ofrece revisar los recursos. Las cuentas docentes no reciben recomendaciones basadas en un progreso de estudiante vacío.

Las tarjetas de módulo distinguen «Sin iniciar», «En curso» y «Completado» mediante texto e icono, además del color. Muestran la próxima actividad y la semana, incluso cuando ya hay lecturas registradas pero aún no se ha terminado ninguna semana.

## Página de estudio

- Cuatro etapas con estado, detalle y enlaces al requisito correspondiente. En móvil se desplazan horizontalmente sin ensanchar la página.
- Índice enlazado que destaca la sección visible. En escritorio queda al lado de la lectura; en móvil se convierte en navegación horizontal.
- Notas, ejercicio práctico y recursos son desplegables nativos. Un enlace directo al ejercicio lo abre automáticamente. Los capítulos permanecen visibles para su seguimiento de lectura.
- Lectura con texto más amplio, mayor interlineado y menos elementos compitiendo en la barra lateral.
- Un acceso a MariBug prepara una pregunta sobre el tema seleccionado en el índice. No envía consultas automáticamente ni comparte notas/evidencias. Al cerrar, el foco regresa al botón de ayuda.

## Guardado y accesibilidad

Cada nota, respuesta o evidencia presenta su estado local: guardando, guardado o error. Un fallo mantiene el texto y permite reenviar la misma operación. Las operaciones se serializan y un guardado antiguo no debe marcar como guardada una versión nueva pendiente. Los mensajes distinguen entre el navegador invitado y la cuenta autenticada.

La página incluye un enlace para saltar al contenido, foco visible, navegación semántica, desplegables operables con teclado, estados textuales y respeto por la preferencia de movimiento reducido. MariBug se cierra cuando el foco sale del panel hacia la página y oculta temporalmente el icono si cubriría un control enfocado. Los errores de sincronización ya no son un recuadro flotante sobre las acciones.

Las pruebas de navegador verifican siguiente acción, enlaces a desplegables, recuperación ante un fallo de guardado, conservación de notas, ayuda contextual sin envío automático, salto al contenido y ausencia de desbordamiento a 320/390 px. Las capturas de las pruebas usan datos ficticios. No se declara conformidad completa con WCAG sin una auditoría específica.

## Porcentaje de avance por actividades

El porcentaje del módulo y de la ruta incorpora avances parciales. Cada semana aporta cuatro etapas con el mismo peso: lectura, práctica validada en /practice/{semana}, autoevaluación y test aprobado (70 % mínimo). Las secciones leídas incrementan su etapa proporcionalmente. Los borradores, entregables antiguos y laboratorios no otorgan la etapa Práctica. Se muestra un decimal para conservar avances pequeños en la ruta de 24 semanas.

La tarjeta, el detalle del módulo, el panel, la barra lateral y el administrador utilizan el mismo cálculo. El contador de semanas completadas sigue exigiendo todos los requisitos; puede mostrar 0/2 junto a un porcentaje parcial mayor que cero. No se necesitan migraciones ni volver a completar actividades guardadas.

## Árbol de la ruta de aprendizaje

La opción «Ruta de 8 módulos» del menú lateral expande módulos, semanas y actividades. «Lectura» muestra los capítulos reales y la práctica guiada. Cada semana enlaza a su ejercicio práctico, autoevaluación y test del módulo. Las prácticas con herramientas reales enlazan directamente a `/practice/{semana}`. La rama de la semana actual se abre automáticamente y las actividades realizadas muestran una marca de avance.

En móvil, «Ruta» abre un diálogo con el mismo árbol, desplazamiento propio, cierre con Escape, devolución del foco y cierre al elegir un destino. Las ramas usan `details/summary` nativos y se pueden abrir con teclado.

Los laboratorios se retiran del recorrido, del índice y del árbol. Su evidencia anterior se conserva, sin exigirla para completar semanas. La etapa Práctica muestra únicamente la tarjeta del ejercicio y el acceso a /practice/{semana}; las instrucciones y entregas se realizan dentro de esa actividad. La evaluación continúa en /modules/{id}#module-quiz.

El índice público `apps/web/src/features/navigation/learning-tree.json` se genera desde los títulos del catálogo y las guías mediante `apps/web/scripts/prepare-learning-navigation.mjs`, que se ejecuta antes de `dev` y `build`. No incluye respuestas de evaluaciones ni cuerpos de lecturas.

### Marcas de cumplimiento del árbol

El signo + / − solo expande o contrae ramas. El ✓ utiliza el progreso cargado y guardado: los capítulos requieren su registro de lectura, «Lectura» requiere todos los capítulos y el ejemplo guiado, las prácticas su actividad validada y guardada, la autoevaluación una respuesta correcta y el test al menos el porcentaje de aprobación. Visitar una opción no la completa.

Para nuevos registros de lectura, el tracker combina el tiempo mínimo de atención existente con intervalos de contenido visto: cobertura acumulada de al menos el 80 % y llegada al 98 % final del capítulo. Saltar directamente del encabezado al final no cubre el contenido intermedio. No contabiliza tiempo con la pestaña oculta, sin foco o con un diálogo abierto. Los registros de progreso anteriores se conservan.

## Paginación de la clase

Cada semana muestra un solo apartado: capítulos, práctica guiada, ejercicio práctico, autoevaluación, notas y recursos. Los controles Anterior/Siguiente y el selector indican la posición y permiten recorrer la clase sin acumular todas sus secciones en una página larga.

Se mantienen las anclas #chapter-N, #practical-exercise y #self-check. Reto, entregables y laboratorios dejan de ser apartados del recorrido. Recargar o usar Atrás/Adelante recupera el apartado de la URL. Las secciones inactivas permanecen ocultas para conservar borradores y respuestas; no se contabilizan como lectura visible. Cambiar de página no concede progreso ni sustituye las reglas de finalización.
