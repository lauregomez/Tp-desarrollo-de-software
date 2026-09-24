import { describe, it, expect } from 'vitest';
import { canDeleteUser } from '../../src/modules/user/user.types';

describe('canDeleteUser', () => {
  it('no deja que un admin elimine su propio usuario', () => {
    // Si pudiera, quedaría sin sesión al instante y, si fuera el único
    // admin, el sistema sin nadie que administre.
    expect(canDeleteUser(1, 1)).toBe(false);
  });

  it('deja eliminar a otro usuario', () => {
    expect(canDeleteUser(2, 1)).toBe(true);
  });

  // it.each corre el mismo test una vez por cada par de la lista.
  it.each([
    [2, 1],
    [1, 2],
    [99, 3],
  ])('permite que el admin %i sea eliminado por el admin %i', (target, current) => {
    expect(canDeleteUser(target, current)).toBe(true);
  });
});