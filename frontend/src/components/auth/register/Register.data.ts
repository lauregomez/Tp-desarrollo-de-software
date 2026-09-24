// Valores iniciales del formulario, separados del componente
// según la convención de la cátedra (Componente.data.ts).
export const initialRegisterData = {
  name: '',
  lastName: '',
  email: '',
  password: '',
}

// Un booleano por campo: el estilizado del input escucha este estado.
export const initialRegisterErrors = {
  name: false,
  lastName: false,
  email: false,
  password: false,
}