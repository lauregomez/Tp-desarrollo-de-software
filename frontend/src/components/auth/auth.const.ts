// Constantes compartidas por login y registro.
// Vive acá y no dentro de uno de los dos para que ninguno dependa de
// un archivo interno del otro.
//
// Coincide con la validación del backend en auth.controller.register.
export const MIN_PASSWORD_LENGTH = 8

// Espejo de user.validations.ts en el backend: si el front deja pasar
// algo que el back rechaza, el usuario recién se entera al enviar.
export const MIN_NAME_LENGTH = 2

// Al menos una letra, y sólo letras, espacios, apóstrofos, guiones y
// puntos. \p{L} cubre tildes y ñ; el flag u es obligatorio para usarlo.
export const NAME_PATTERN = /^[\p{L}][\p{L}\s'’.-]*$/u

export function isValidName(value: string): boolean {
  const trimmed = value.trim()
  return trimmed.length >= MIN_NAME_LENGTH && NAME_PATTERN.test(trimmed)
}