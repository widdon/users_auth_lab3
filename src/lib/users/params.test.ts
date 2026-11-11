import { describe, expect, it } from 'vitest';
import { safeCallbackUrl } from '../auth/login-schema';
import { parseUserId } from './params';
import { parseUsersQuery } from './query';

describe('внешние границы: параметры URL', () => {
  it('id пользователя — только целое положительное число', () => {
    expect(parseUserId('12')).toBe(12);
    expect(parseUserId(5)).toBe(5);
    for (const bad of ['', 'abc', '-1', '0', '1.5', null, undefined]) expect(parseUserId(bad)).toBeNull();
  });

  it('неизвестные значения фильтров заменяются значениями по умолчанию', () => {
    expect(parseUsersQuery({ role: 'root', sort: 'random' })).toEqual({ q: '', role: 'all', sort: 'default' });
    expect(parseUsersQuery(new URLSearchParams('role=admin&sort=name'))).toEqual({ q: '', role: 'admin', sort: 'name' });
    // при поиске фильтр по роли сбрасывается: DummyJSON не умеет и то и другое
    expect(parseUsersQuery({ q: ' emily ', role: 'admin' })).toEqual({ q: 'emily', role: 'all', sort: 'default' });
  });

  it('callbackUrl после входа — только путь внутри приложения', () => {
    expect(safeCallbackUrl('/users/new')).toBe('/users/new');
    expect(safeCallbackUrl('https://evil.example')).toBe('/users');
    expect(safeCallbackUrl('//evil.example')).toBe('/users');
    expect(safeCallbackUrl(undefined)).toBe('/users');
  });
});
