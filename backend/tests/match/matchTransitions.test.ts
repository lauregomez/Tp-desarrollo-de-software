import { describe, it, expect } from 'vitest';
import { MatchStatus } from '@prisma/client';
import { isValidTransition } from '../../src/modules/match/match.types';

describe('isValidTransition', () => {
  it('permite publicar o cancelar un borrador', () => {
    expect(isValidTransition(MatchStatus.DRAFT, MatchStatus.PUBLISHED)).toBe(true);
    expect(isValidTransition(MatchStatus.DRAFT, MatchStatus.CANCELLED)).toBe(true);
  });

  it('permite finalizar o cancelar un partido publicado', () => {
    expect(isValidTransition(MatchStatus.PUBLISHED, MatchStatus.FINISHED)).toBe(true);
    expect(isValidTransition(MatchStatus.PUBLISHED, MatchStatus.CANCELLED)).toBe(true);
  });

  it('no deja volver un partido publicado a borrador', () => {
    // Un partido publicado ya puede tener entradas vendidas.
    expect(isValidTransition(MatchStatus.PUBLISHED, MatchStatus.DRAFT)).toBe(false);
  });

  it('no deja finalizar un borrador sin publicarlo', () => {
    expect(isValidTransition(MatchStatus.DRAFT, MatchStatus.FINISHED)).toBe(false);
  });

  // it.each corre el mismo test una vez por cada valor de la lista.
  it.each([MatchStatus.FINISHED, MatchStatus.CANCELLED])(
    '%s es un estado final: no admite ninguna transición',
    (from) => {
      for (const to of Object.values(MatchStatus)) {
        expect(isValidTransition(from, to)).toBe(false);
      }
    },
  );
});