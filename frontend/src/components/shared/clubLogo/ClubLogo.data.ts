import { GENERIC_CLUB_WORDS, MAX_INITIALS } from './ClubLogo.const'

export function getClubInitials(name: string): string {
  const words = name.trim().split(/\s+/)
  const meaningful = words.filter(
    (word) => !GENERIC_CLUB_WORDS.has(word.toLowerCase()),
  )

  const source = meaningful.length > 0 ? meaningful : words

  if (source.length === 1) {
    return source[0].slice(0, MAX_INITIALS).toUpperCase()
  }

  return source
    .slice(0, MAX_INITIALS)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}