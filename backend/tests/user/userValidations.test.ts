import { describe, it, expect } from 'vitest';
import { isValidName, MAX_NAME_LENGTH } from '../../src/modules/user/user.validations';

describe('isValidName', () => {
  // it.each corre el mismo test una vez por cada valor de la lista.
  it.each([
    'Juan',
    'María José',
    'Ñoño',
    "O'Connor",
    'García-López',
    'St. John',
    'Li',
  ])('acepta "%s"', (name) => {
    expect(isValidName(name)).toBe(true);
  });

  it.each([
    ['111', 'sólo números'],
    ['Juan3', 'números mezclados'],
    ['@@@', 'sólo símbolos'],
    ['A', 'una sola letra'],
    ['', 'vacío'],
    ['   ', 'sólo espacios'],
    ["-Juan", 'empieza con separador'],
  ])('rechaza "%s" (%s)', (name) => {
    expect(isValidName(name)).toBe(false);
  });

  it('ignora los espacios de los extremos', () => {
    expect(isValidName('  Juan  ')).toBe(true);
  });

  it('rechaza un nombre más largo que la columna de la base', () => {
    // MySQL cortaría o fallaría con un error poco claro: mejor un 400
    // con un mensaje que el usuario entienda.
    expect(isValidName('a'.repeat(MAX_NAME_LENGTH + 1))).toBe(false);
  });
});