/**
 * Reglas de validación de nombres, compartidas por el registro público
 * (auth.controller) y el ABM de usuarios (user.controller).
 *
 * Viven acá y no dentro de cada controller por dos motivos: la misma
 * regla se aplica en tres endpoints, y así se puede probar sin levantar
 * Express, igual que canDeleteUser en user.types.ts.
 */

// Espejo de la columna VARCHAR(191) que Prisma crea por default.
// Si el front deja pasar algo más largo, MySQL lo rechaza con un error
// feo en vez de un mensaje claro.
export const MAX_NAME_LENGTH = 191;

// Dos caracteres: hay apellidos reales de dos letras (Li, Ng, Ax).
export const MIN_NAME_LENGTH = 2;

/**
 * Un nombre válido tiene al menos una letra y sólo admite letras,
 * espacios, apóstrofos, guiones y puntos.
 *
 * \p{L} matchea cualquier letra Unicode, no sólo a-z: cubre tildes, ñ,
 * diéresis y alfabetos no latinos. El flag u es obligatorio para que
 * \p{L} funcione.
 *
 * Los separadores permitidos salen de nombres reales: "María José"
 * (espacio), "O'Connor" (apóstrofo), "García-López" (guion), "St. John"
 * (punto). La restricción apunta a rechazar "111" o "@@@", no a dictar
 * qué forma puede tener un nombre.
 */
const NAME_PATTERN = /^[\p{L}][\p{L}\s'’.-]*$/u;

export function isValidName(value: string): boolean {
  const trimmed = value.trim();

  if (trimmed.length < MIN_NAME_LENGTH) return false;
  if (trimmed.length > MAX_NAME_LENGTH) return false;

  return NAME_PATTERN.test(trimmed);
}

/**
 * El sistema siempre tiene que conservar al menos un ADMIN: si se van
 * todos, nadie puede entrar al panel y no hay forma de recuperarlo
 * desde la aplicación.
 *
 * Sólo importa cuando la operación saca a un ADMIN del conjunto: si el
 * usuario afectado no es admin, el conteo no cambia.
 */
export function keepsAtLeastOneAdmin(
  targetIsAdmin: boolean,
  adminCount: number,
): boolean {
  if (!targetIsAdmin) return true;
  return adminCount > 1;
}
