Feature: Acceso a mis pedidos
  Como cliente registrado
  Quiero acceder a mis pedidos con mi cuenta
  Para consultar mis compras de forma segura

  Scenario: Acceder a mis pedidos con una cuenta activa
    Given tengo una cuenta activa con credenciales correctas
    When solicito acceder a mis pedidos
    Then veo el panel Mis pedidos

  Scenario: Rechazar credenciales incorrectas
    Given tengo una cuenta activa con credenciales incorrectas
    When solicito acceder a mis pedidos
    Then veo el mensaje Credenciales incorrectas y no accedo a mis pedidos

  Scenario: Rechazar el acceso de una cuenta inactiva
    Given tengo una cuenta inactiva con credenciales correctas
    When solicito acceder a mis pedidos
    Then veo el mensaje Cuenta inactiva y no accedo a mis pedidos
