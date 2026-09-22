import { GENERIC_CLUB_WORDS, MAX_INITIALS } from './ClubLogo.const'

export function getClubInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  const meaningful = words.filter(
    (word) => !GENERIC_CLUB_WORDS.has(word.toLowerCase()),
  )

  // Si todas las palabras son genéricas, usamos el nombre completo
  // para no devolver un badge vacío.
  const source = meaningful.length > 0 ? meaningful : words

  // Con una sola palabra, una inicial suelta no identifica al club:
  // mostramos sus primeras letras (Echesortu → ECH).
  if (source.length === 1) {
    return source[0].slice(0, MAX_INITIALS).toUpperCase()
  }

  return source
    .slice(0, MAX_INITIALS)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}