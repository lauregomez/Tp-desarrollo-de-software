// Límites del formulario de cancha. Tienen que coincidir con los del
// backend (court.controller.ts): si el front deja pasar algo que el back
// rechaza, el usuario recién se entera después de enviar.

// Espejo de la columna VARCHAR(191) que Prisma crea por default.
export const MAX_NAME_LENGTH = 191
export const MAX_ADDRESS_LENGTH = 191

// Una dirección real tiene al menos calle y número.
export const MIN_ADDRESS_LENGTH = 5

// Tope razonable para una cancha de fútsal. La capacidad alimenta la regla
// de soldOut: con un valor absurdo, un partido nunca se agotaría.
// Acordado con el backend: tiene que ser el mismo número.
export const MAX_CAPACITY = 1000