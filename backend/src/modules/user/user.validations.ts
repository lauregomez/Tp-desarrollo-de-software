export const MAX_NAME_LENGTH = 191;

export const MIN_NAME_LENGTH = 2;

const NAME_PATTERN = /^[\p{L}][\p{L}\s'’.-]*$/u;

export function isValidName(value: string): boolean {
  const trimmed = value.trim();

  if (trimmed.length < MIN_NAME_LENGTH) return false;
  if (trimmed.length > MAX_NAME_LENGTH) return false;

  return NAME_PATTERN.test(trimmed);
}

export function keepsAtLeastOneAdmin(
  targetIsAdmin: boolean,
  adminCount: number,
): boolean {
  if (!targetIsAdmin) return true;
  return adminCount > 1;
}

export function canDeactivateUser(pendingOrActiveTickets: number): boolean {
  return pendingOrActiveTickets === 0;
}