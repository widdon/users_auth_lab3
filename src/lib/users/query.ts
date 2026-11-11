import { z } from 'zod';
import { USER_ROLES } from './constants';
import type { User, UserRole } from './types';

/**
 * Параметры списка: поиск, фильтр по роли и сортировка.
 * Модуль общий для сервера и клиента: им пользуются страница /users,
 * Route Handler /api/users и клиентский список.
 */

export const SORT_LABELS: Record<SortKey, string> = {
  default: 'По умолчанию',
  name: 'По имени (А–Я)',
  'age-asc': 'Сначала младше',
  'age-desc': 'Сначала старше',
};

export const SORT_KEYS = ['default', 'name', 'age-asc', 'age-desc'] as const;
export type SortKey = (typeof SORT_KEYS)[number];

export interface UsersQuery {
  q: string;
  role: UserRole | 'all';
  sort: SortKey;
}

export const DEFAULT_QUERY: UsersQuery = { q: '', role: 'all', sort: 'default' };

type SearchParamsLike = URLSearchParams | Record<string, string | string[] | undefined>;

function readParam(params: SearchParamsLike, key: string): string | undefined {
  if (params instanceof URLSearchParams) return params.get(key) ?? undefined;
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Схема параметров списка из URL (?q=&role=&sort=).
 * .catch(значение) — «мягкая» проверка: неизвестная роль или сортировка из URL
 * не ломает страницу, а заменяется значением по умолчанию.
 */
export const roleFilterSchema = z.enum([...USER_ROLES, 'all']).catch('all');
export const sortKeySchema = z.enum(SORT_KEYS).catch('default');

export const usersQuerySchema = z
  .object({
    q: z.string().trim().max(100).catch(''),
    role: roleFilterSchema,
    sort: sortKeySchema,
  })
  // DummyJSON не умеет одновременно искать и фильтровать (/users/search и /users/filter —
  // разные эндпоинты), поэтому при наличии поискового запроса фильтр по роли сбрасывается.
  .transform((query): UsersQuery => (query.q ? { ...query, role: 'all' } : query));

/** Разбор и «очистка» параметров из URL: всё неизвестное заменяется значением по умолчанию. */
export function parseUsersQuery(params: SearchParamsLike): UsersQuery {
  return usersQuerySchema.parse({
    q: readParam(params, 'q') ?? '',
    role: readParam(params, 'role'),
    sort: readParam(params, 'sort'),
  });
}

/** Обратное преобразование: в URL попадают только значения, отличные от умолчаний. */
export function toSearchParams(query: UsersQuery): URLSearchParams {
  const params = new URLSearchParams();
  if (query.q) params.set('q', query.q);
  if (query.role !== 'all') params.set('role', query.role);
  if (query.sort !== 'default') params.set('sort', query.sort);
  return params;
}

export function isSameQuery(a: UsersQuery, b: UsersQuery): boolean {
  return a.q === b.q && a.role === b.role && a.sort === b.sort;
}

export function isDefaultQuery(query: UsersQuery): boolean {
  return isSameQuery(query, DEFAULT_QUERY);
}

/** Сортировка в терминах DummyJSON: ?sortBy=...&order=... */
export function sortToApi(sort: SortKey): { sortBy: string; order: 'asc' | 'desc' } | null {
  switch (sort) {
    case 'name':
      return { sortBy: 'firstName', order: 'asc' };
    case 'age-asc':
      return { sortBy: 'age', order: 'asc' };
    case 'age-desc':
      return { sortBy: 'age', order: 'desc' };
    case 'default':
      return null;
  }
}

/**
 * Локальная проверка «подходит ли пользователь под запрос».
 * Нужна для записей, которых нет на сервере (созданных в этой сессии),
 * и для изменённых записей, которые после правки могли перестать подходить под фильтр.
 */
export function matchesQuery(user: User, query: UsersQuery): boolean {
  if (query.role !== 'all' && user.role !== query.role) return false;
  if (!query.q) return true;
  const haystack = `${user.firstName} ${user.lastName} ${user.username} ${user.email}`.toLowerCase();
  return haystack.includes(query.q.toLowerCase());
}

/** Ключи TanStack Query собраны в одном месте, чтобы не опечататься. */
export const usersKeys = {
  all: ['users'] as const,
  list: (query: UsersQuery) => ['users', 'list', query] as const,
};
