import { describe, expect, it } from 'vitest';
import { testUser } from '@/test/render';
import { applyLocalChanges, countLocalChanges, EMPTY_CHANGES, flattenPages } from './local-changes';
import { mapApiUser } from './mappers';
import { DEFAULT_QUERY } from './query';
import type { User } from './types';

const a: User = { ...testUser, id: 1, firstName: 'Anna', role: 'admin' };
const b: User = { ...testUser, id: 2, firstName: 'Boris', role: 'user' };

describe('локальные изменения поверх данных сервера', () => {
  it('склеивает страницы без дублей', () => {
    const page = (users: User[]) => ({ users, total: 2, skip: 0, limit: 12 });
    expect(flattenPages([page([a]), page([a, b])]).map((u) => u.id)).toEqual([1, 2]);
  });

  it('применяет созданные, изменённые и удалённые записи', () => {
    const created = { ...testUser, id: 300, firstName: 'New' };
    const changes = { created: [created], updated: { 2: { ...b, firstName: 'Борис' } }, deletedIds: [1] };

    const list = applyLocalChanges([a, b], changes, DEFAULT_QUERY);

    expect(list.map((u) => u.firstName)).toEqual(['New', 'Борис']);
    expect(countLocalChanges(changes)).toBe(3);
    expect(applyLocalChanges([a, b], EMPTY_CHANGES, DEFAULT_QUERY)).toEqual([a, b]);
  });

  it('скрывает изменённую запись, которая перестала подходить под фильтр', () => {
    const changes = { ...EMPTY_CHANGES, updated: { 2: { ...b, role: 'admin' as const } } };
    expect(applyLocalChanges([b], changes, { ...DEFAULT_QUERY, role: 'user' })).toEqual([]);
  });
});

describe('mapApiUser', () => {
  it('заполняет отсутствующие поля и отбрасывает неизвестные значения', () => {
    const user = mapApiUser({ id: 5, firstName: 'Emma', gender: 'other', role: 'root', birthDate: '1996-5-3' });
    expect(user).toMatchObject({ id: 5, firstName: 'Emma', lastName: '', gender: 'female', role: 'user', birthDate: '1996-05-03' });
    expect(user.address).toEqual({ address: '', city: '', state: '', country: '' });
  });
});
