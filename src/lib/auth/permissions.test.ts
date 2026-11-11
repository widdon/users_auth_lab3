import { describe, expect, it } from 'vitest';
import { can, canAssignRole, toAccessRole } from './permissions';

describe('права ролей', () => {
  it.each([
    [null, 'user:read', true],
    [null, 'user:create', false],
    [null, 'user:delete', false],
    ['user', 'user:create', true],
    ['user', 'user:update', true],
    ['user', 'user:delete', false],
    ['admin', 'user:delete', true],
  ] as const)('%s → %s: %s', (role, action, expected) => {
    expect(can(role, action)).toBe(expected);
  });

  it('роль DummyJSON переводится в роль приложения', () => {
    expect(toAccessRole('admin')).toBe('admin');
    expect(toAccessRole('moderator')).toBe('user');
    expect(toAccessRole('user')).toBe('user');
  });

  it('роль «Администратор» назначает и снимает только администратор', () => {
    expect(canAssignRole('user', null, 'admin')).toBe(false);
    expect(canAssignRole('user', 'user', 'admin')).toBe(false);
    expect(canAssignRole('user', 'admin', 'user')).toBe(false);
    expect(canAssignRole('user', 'admin', 'admin')).toBe(true);
    expect(canAssignRole('user', 'user', 'moderator')).toBe(true);
    expect(canAssignRole('admin', 'user', 'admin')).toBe(true);
  });
});
