import { describe, it, expect } from 'vitest';
import {isValidName, MAX_NAME_LENGTH, keepsAtLeastOneAdmin, canDeactivateUser } from '../../src/modules/user/user.validations';
describe('isValidName', () => {
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
    expect(isValidName('a'.repeat(MAX_NAME_LENGTH + 1))).toBe(false);
  });
});

describe('keepsAtLeastOneAdmin', () => {
  it('permite la operación si el usuario afectado no es admin', () => {
    expect(keepsAtLeastOneAdmin(false, 1)).toBe(true);
  });

  it('permite sacar a un admin si hay más de uno', () => {
    expect(keepsAtLeastOneAdmin(true, 3)).toBe(true);
    expect(keepsAtLeastOneAdmin(true, 2)).toBe(true);
  });

  it('no deja sacar al último admin', () => {
    expect(keepsAtLeastOneAdmin(true, 1)).toBe(false);
  });
});

describe('canDeactivateUser', () => {
  it('permite la baja si no quedan entradas sin usar', () => {
    expect(canDeactivateUser(0)).toBe(true);
  });

  it('no deja dar de baja con entradas sin usar', () => {
    expect(canDeactivateUser(1)).toBe(false);
    expect(canDeactivateUser(5)).toBe(false);
  });
});