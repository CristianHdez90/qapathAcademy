export const bugReportSuggestions = {
 title: [
  'La transferencia de 50 deja un saldo de 195 en lugar de 150',
  'El saldo se descuenta incorrectamente al realizar una transferencia'
 ],
 description: [
  'Al transferir 50 desde una cuenta con saldo de 200, la aplicación muestra 195 en lugar de 150. El titular ve un saldo incorrecto.',
  'El servicio resta 5 cuando se solicita transferir 50. La operación termina mostrando 195; según la regla, debería mostrar 150.'
 ],
 environment: ['QA Store de entrenamiento · versión v1', 'Simulador local de transferencias · versión v1'],
 preconditions: [
  'Cuenta activa con saldo disponible de 200, sin otras operaciones en curso.',
  'Titular con acceso a una cuenta activa y saldo inicial de 200. Servicio de entrenamiento en versión v1.'
 ],
 steps: [
  '1. Preparar una cuenta activa con saldo de 200.\n2. Solicitar una transferencia de 50.\n3. Consultar el saldo mostrado y compararlo con el esperado: 150.',
  '1. Abrir el simulador con saldo inicial de 200.\n2. Ejecutar la transferencia ficticia de 50.\n3. Registrar el saldo obtenido: 195, y contrastarlo con el esperado: 150.'
 ]
} as const;
