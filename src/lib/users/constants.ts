/**
 * Справочники предметной области. Списки объявлены как `as const`-кортежи:
 * из них строятся и TypeScript-типы, и Zod-перечисления (z.enum), поэтому
 * набор допустимых значений описан ровно в одном месте.
 */

export const GENDERS = ['male', 'female'] as const;
export const USER_ROLES = ['admin', 'moderator', 'user'] as const;

export type Gender = (typeof GENDERS)[number];
/** Роль записи в справочнике DummyJSON (поле role у пользователя). */
export type UserRole = (typeof USER_ROLES)[number];

export const GENDER_LABELS: Record<Gender, string> = {
  male: 'Мужской',
  female: 'Женский',
};

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Администратор',
  moderator: 'Модератор',
  user: 'Пользователь',
};

/** Для совместимости со старым кодом: список ролей записей. */
export const ROLES = USER_ROLES;

/** Размер одной порции при подгрузке списка. */
export const PAGE_SIZE = 12;

/** Максимальный limit, который принимает наш Route Handler. */
export const MAX_PAGE_SIZE = 50;

/** Возрастные границы — правило предметной области. */
export const MIN_AGE = 14;
export const MAX_AGE = 120;
