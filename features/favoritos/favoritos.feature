# language: es
@favoritos
Característica: Favoritos (lista de juegos guardados)
  Como niño quiero marcar juegos como favoritos y ver mi lista
  para encontrar rápido los juegos que más me gustan (US-615, US-616).
  Perfil A = customer3 (Bob Smith) · Perfil B = customer2 (Jack Howe)
  (customer / Jane Doe quedó bloqueada por intentos fallidos durante la preparación)

  # ---------------- US-615 · Marcar y quitar favoritos ----------------

  @smoke @positivo @CP-615-01
  Escenario: Marcar un producto como favorito lo agrega a la lista
    Dado que el perfil A inició sesión con la lista de favoritos vacía
    Cuando marca "Combination Pliers" como favorito
    Entonces ve el mensaje "Producto añadido a favoritos."
    Y su lista de favoritos contiene solo "Combination Pliers"

  @regresion @negativo @CP-615-02
  Escenario: Marcar de nuevo un favorito no lo duplica
    Dado que el perfil A inició sesión con "Combination Pliers" en favoritos
    Cuando marca "Combination Pliers" como favorito
    Entonces ve el mensaje "El producto ya está en tu lista de favoritos."
    Y "Combination Pliers" aparece 1 vez en su lista de favoritos

  @regresion @positivo @CP-615-03
  Escenario: Quitar un favorito lo retira de la lista
    Dado que el perfil A inició sesión con "Combination Pliers" y "Pliers" en favoritos
    Cuando elimina "Combination Pliers" de su lista de favoritos
    Y recarga la página
    Entonces su lista de favoritos contiene solo "Pliers"

  @smoke @regresion @CP-615-04
  Escenario: Cada perfil tiene su propia lista de favoritos
    Dado que el perfil B tiene la lista de favoritos vacía
    Y que el perfil A inició sesión con la lista de favoritos vacía
    Cuando marca "Bolt Cutters" como favorito
    Y cierra sesión e inicia sesión con el perfil B
    Entonces su lista de favoritos no contiene "Bolt Cutters"

  @regresion @negativo @CP-615-05
  Escenario: Sin sesión no se puede marcar un favorito
    Dado que no hay una sesión iniciada
    Cuando marca "Pliers" como favorito
    Entonces ve el mensaje "No autorizado, no se puede añadir el producto a favoritos."

  @regresion @CP-615-06
  Escenario: Marcar, quitar y volver a marcar deja el producto una sola vez
    Dado que el perfil A inició sesión con la lista de favoritos vacía
    Cuando marca "Long Nose Pliers" como favorito
    Y elimina "Long Nose Pliers" de su lista de favoritos
    Y marca "Long Nose Pliers" como favorito
    Entonces "Long Nose Pliers" aparece 1 vez en su lista de favoritos

  # ---------------- US-616 · Consultar la lista de favoritos ----------------

  @smoke @positivo @CP-616-01
  Escenario: La lista vacía muestra un mensaje amigable
    Dado que el perfil B inició sesión con la lista de favoritos vacía
    Cuando abre su lista de favoritos
    Entonces ve el mensaje de lista vacía "Aún no hay favoritos."

  @regresion @positivo @CP-616-02
  Escenario: Lista con un solo favorito
    Dado que el perfil B inició sesión con la lista de favoritos vacía
    Cuando marca "Slip Joint Pliers" como favorito
    Entonces su lista de favoritos contiene solo "Slip Joint Pliers"

  @regresion @CP-616-05
  Escenario: Al quitar el único favorito vuelve el mensaje de lista vacía
    Dado que el perfil B inició sesión con "Slip Joint Pliers" en favoritos
    Cuando elimina "Slip Joint Pliers" de su lista de favoritos
    Y recarga la página
    Entonces ve el mensaje de lista vacía "Aún no hay favoritos."

  @regresion @datos @CP-616-03
  Escenario: Lista con varios favoritos, sin repetidos ni faltantes
    Dado que el perfil A inició sesión con la lista de favoritos vacía
    Cuando marca como favoritos los productos:
      | producto           |
      | Combination Pliers |
      | Pliers             |
      | Bolt Cutters       |
      | Long Nose Pliers   |
      | Slip Joint Pliers  |
    Entonces su lista de favoritos contiene exactamente esos 5 productos
