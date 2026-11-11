import { z } from 'zod';
import type { UserRole } from '../users/constants';

/**
 * Права доступа приложения — единый источник правды.
 * Модуль без побочных эффектов и без 'server-only': одну и ту же функцию can()
 * вызывают и сервер (для настоящей проверки), и клиент (чтобы скрыть кнопки).
 *
 * Роль доступа (AccessRole) — это роль того, кто вошёл в приложение.
 * Её не нужно путать с полем role записи справочника (UserRole: admin/moderator/user).
 * При входе роль DummyJSON переводится в роль приложения: admin → admin,
 * moderator и user → user.
 */

export const ACCESS_ROLES = ['user', 'admin'] as const;
export const accessRoleSchema = z.enum(ACCESS_ROLES);
export type AccessRole = z.infer<typeof accessRoleSchema>;

export const ACCESS_ROLE_LABELS: Record<AccessRole, string> = {
  user: 'Пользователь',
  admin: 'Администратор',
};

export type Action = 'user:read' | 'user:create' | 'user:update' | 'user:delete';

/** Аноним — тот, кто не вошёл; у него свой набор прав. */
type Subject = AccessRole | 'guest';

const PERMISSIONS: Record<Subject, readonly Action[]> = {
  guest: ['user:read'],
  user: ['user:read', 'user:create', 'user:update'],
  admin: ['user:read', 'user:create', 'user:update', 'user:delete'],
};

/** Может ли роль выполнить действие. null — пользователь не вошёл. */
export function can(role: AccessRole | null | undefined, action: Action): boolean {
  return PERMISSIONS[role ?? 'guest'].includes(action);
}

/** Роль пользователя DummyJSON → роль в приложении. */
export function toAccessRole(dummyRole: UserRole): AccessRole {
  return dummyRole === 'admin' ? 'admin' : 'user';
}

/**
 * Правило предметной области: назначать роль «Администратор» записи справочника
 * или снимать её может только администратор приложения. Иначе обычный пользователь
 * мог бы через форму «повысить» кого угодно до администратора.
 *
 * @param from текущая роль записи (null — запись создаётся)
 * @param to роль, которую хотят сохранить
 */
export function canAssignRole(actor: AccessRole | null | undefined, from: UserRole | null, to: UserRole): boolean {
  if (actor === 'admin') return true;
  return from !== 'admin' && to !== 'admin' ? true : from === to;
}

export const ROLE_ASSIGN_ERROR = 'Назначать или снимать роль «Администратор» может только администратор';
