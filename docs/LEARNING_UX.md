# Recorrido de aprendizaje y patrones UX/UI

## Inicio y módulos

La tarjeta «Tu siguiente actividad» busca el primer requisito pendiente de la ruta: capítulo por leer, entregables, autoevaluación, laboratorio o test del módulo. Se calcula con las mismas evidencias del progreso automático. Si todo está completo, ofrece revisar los recursos. Las cuentas docentes no reciben recomendaciones basadas en un progreso de estudiante vacío.

Las tarjetas de módulo distinguen «Sin iniciar», «En curso» y «Completado» mediante texto e icono, además del color. Muestran la próxima actividad y la semana, incluso cuando ya hay lecturas registradas pero aún no se ha terminado ninguna semana.

## Página de estudio

- Cinco etapas con estado, detalle y enlaces al requisito correspondiente. En móvil se desplazan horizontalmente sin ensanchar la página.
- Índice enlazado que destaca la sección visible. En escritorio queda al lado de la lectura; en móvil se convierte en navegación horizontal.
- Notas, entregables y recursos son desplegables nativos. Un enlace directo al bloque de entregables lo abre automáticamente. Los capítulos permanecen visibles para su seguimiento de lectura.
- Lectura con texto más amplio, mayor interlineado y menos elementos compitiendo en la barra lateral.
- Un acceso a Lía prepara una pregunta sobre el tema seleccionado en el índice. No envía consultas automáticamente ni comparte notas/evidencias. Al cerrar, el foco regresa al botón de ayuda.

## Guardado y accesibilidad

Cada nota, respuesta o evidencia presenta su estado local: guardando, guardado o error. Un fallo mantiene el texto y permite reenviar la misma operación. Las operaciones se serializan y un guardado antiguo no debe marcar como guardada una versión nueva pendiente. Los mensajes distinguen entre el navegador invitado y la cuenta autenticada.

La página incluye un enlace para saltar al contenido, foco visible, navegación semántica, desplegables operables con teclado, estados textuales y respeto por la preferencia de movimiento reducido. Lía se cierra cuando el foco sale del panel hacia la página y oculta temporalmente el icono si cubriría un control enfocado. Los errores de sincronización ya no son un recuadro flotante sobre las acciones.

Las pruebas de navegador verifican siguiente acción, enlaces a desplegables, recuperación ante un fallo de guardado, conservación de notas, ayuda contextual sin envío automático, salto al contenido y ausencia de desbordamiento a 320/390 px. Las capturas de las pruebas usan datos ficticios. No se declara conformidad completa con WCAG sin una auditoría específica.

## Porcentaje de avance por actividades

El porcentaje del módulo y de la ruta incorpora avances parciales. Cada semana aporta cinco etapas con el mismo peso: lectura, práctica, autoevaluación, laboratorios y test aprobado (70 % mínimo). Las secciones leídas y los entregables registrados incrementan su etapa proporcionalmente. Los laboratorios y el test del módulo satisfacen la etapa correspondiente de sus semanas. Se muestra un decimal para conservar avances pequeños en la ruta de 24 semanas.

La tarjeta, el detalle del módulo, el panel, la barra lateral y el administrador utilizan el mismo cálculo. El contador de semanas completadas sigue exigiendo todos los requisitos; puede mostrar 0/2 junto a un porcentaje parcial mayor que cero. No se necesitan migraciones ni volver a completar actividades guardadas.
