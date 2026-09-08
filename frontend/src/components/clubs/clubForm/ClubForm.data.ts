// Valores iniciales del formulario, separados del componente
// según la convención de la cátedra (Componente.data.ts).
// Al vivir afuera no se recrean en cada render.
export const initialClubData = {
  name: '',
}

// Un booleano por campo. Cuando pasa a true, el className del input
// aplica la clase de error: el estilizado escucha este estado.
export const initialClubErrors = {
  name: false,
}