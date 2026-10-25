# HU-TR-01 · Transferir dinero respetando saldo y estado de la cuenta

Descripción: Una persona necesita transferir dinero desde su cuenta de entrenamiento sin dejar un saldo negativo y con información clara cuando una operación se rechaza.

**Como** titular de una cuenta,  
**quiero** transferir un importe entero positivo que no supere mi saldo disponible,  
**para** enviar dinero y conservar un saldo correcto.

## Criterios de aceptación
- CA-01: Una cuenta activa acepta importes enteros desde 1 hasta el saldo disponible, ambos incluidos, y descuenta exactamente el importe.
- CA-02: Un importe cero, negativo, fraccionario o superior al saldo se rechaza sin cambiar el saldo.
- CA-03: Una cuenta inactiva rechaza la transferencia aunque el importe sea válido; el saldo permanece igual.
- CA-04: Después de una transferencia aceptada, la siguiente utiliza el saldo actualizado, no el saldo inicial.

## Ejemplos de diseño
### EP-01 · Partición de equivalencia · válida · CA-01

Agrupa importes enteros dentro del rango válido. Elige un representante interior, sin confundirlo con una frontera.

Datos: `{"balance":200,"active":true,"amounts":[50]}`

1. Abrir la cuenta de entrenamiento con saldo 200 y estado activo.
2. Introducir el importe 50 y confirmar una transferencia.
3. Consultar el saldo y el estado de la operación.

Resultado esperado: Saldo 150; aceptada

### EP-02 · Partición de equivalencia · inválida · CA-02

Agrupa importes que no cumplen la regla. Un representante como 0 debe rechazarse sin alterar el saldo.

Datos: `{"balance":200,"active":true,"amounts":[0]}`

1. Abrir la cuenta activa con saldo 200.
2. Introducir el importe 0 y solicitar la transferencia.
3. Revisar el rechazo y consultar que el saldo no cambió.

Resultado esperado: Saldo 200; rechazada

### VL-01 · Análisis de valores límite · CA-01

Identifica la frontera mínima 1. El caso de ejemplo la comprueba; añade otros para 0, saldo y saldo + 1 si amplías la cobertura.

Datos: `{"balance":200,"active":true,"amounts":[1]}`

1. Abrir la cuenta activa con saldo 200.
2. Introducir el importe mínimo permitido 1 y confirmar.
3. Revisar aceptación y saldo restante.

Resultado esperado: Saldo 199; aceptada

### TD-01 · Tabla de decisión · CA-03

Cruza cuenta activa/inactiva e importe válido/inválido. Esta regla aísla cuenta inactiva e importe válido; el acceso a la operación debe rechazarse.

Datos: `{"balance":200,"active":false,"amounts":[50]}`

1. Preparar una cuenta inactiva con saldo 200.
2. Solicitar una transferencia de 50.
3. Revisar el rechazo por estado de cuenta y comprobar el saldo.

Resultado esperado: Saldo 200; rechazada

### TE-01 · Transición de estado · CA-04

Sigue dos operaciones consecutivas. El estado cambia de saldo 200 a 150 y después a 50; la segunda operación debe usar 150.

Datos: `{"balance":200,"active":true,"amounts":[50,100]}`

1. Abrir una cuenta activa con saldo 200.
2. Transferir 50 y consultar el saldo 150.
3. Transferir 100 desde esa misma cuenta y revisar el saldo final 50.

Resultado esperado: Saldo 50; aceptada

Completa y ejecuta un caso por ejemplo en /practice/1. Los escenarios Gherkin están en la HU de la plataforma; los pasos de ejecución son acciones secuenciales.
