export const MIN_PASSWORD_LENGTH = 8

export const MIN_NAME_LENGTH = 2

export const NAME_PATTERN = /^[\p{L}][\p{L}\s'’.-]*$/u

export function isValidName(value: string): boolean {
  const trimmed = value.trim()
  return trimmed.length >= MIN_NAME_LENGTH && NAME_PATTERN.test(trimmed)
}