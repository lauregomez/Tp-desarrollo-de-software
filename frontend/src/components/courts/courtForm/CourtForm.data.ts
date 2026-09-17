// Valores iniciales del formulario, separados del componente
// según la convención de la cátedra (Componente.data.ts).
// capacity y clubId arrancan como string vacío porque los inputs y el
// <select> siempre trabajan con texto: se convierten a número al enviar.
export const initialCourtData = {
  name: '',
  address: '',
  capacity: '',
  clubId: '',
}

// Un booleano por campo. Cuando pasa a true, el input se marca en rojo
// y se muestra el mensaje de error correspondiente.
export const initialCourtErrors = {
  name: false,
  address: false,
  capacity: false,
  clubId: false,
}