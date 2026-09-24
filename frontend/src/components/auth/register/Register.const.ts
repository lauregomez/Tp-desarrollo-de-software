// Se importa del login en vez de redefinirla: es la misma regla del
// backend (auth.controller.register), y duplicarla abre la puerta a que
// una quede desactualizada.
export { MIN_PASSWORD_LENGTH } from '../login/Login.const'