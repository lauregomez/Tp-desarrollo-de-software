// Constantes compartidas por login y registro.
// Vive acá y no dentro de uno de los dos para que ninguno dependa de
// un archivo interno del otro.
//
// Coincide con la validación del backend en auth.controller.register.
export const MIN_PASSWORD_LENGTH = 8