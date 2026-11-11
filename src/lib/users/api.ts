import 'server-only';

import { cacheLife, cacheTag } from 'next/cache';
import { cache } from 'react';
import type { z } from 'zod';
import { apiEnv } from '../env';
import {
  apiDeletedUserSchema,
  apiErrorSchema,
  apiPostsResponseSchema,
  apiUserSchema,
  apiUsersResponseSchema,
  type ApiUserPayload,
} from './api-schemas';
import { mapApiPost, mapApiUser } from './mappers';
import { sortToApi, type UsersQuery } from './query';
import type { PostsPage, User, UsersPage } from './types';

/**
 * Слой доступа к DummyJSON. Работает только на сервере:
 * `import 'server-only'` даёт ошибку сборки, если модуль случайно
 * импортировать в клиентский компонент. Адрес API берётся из переменной
 * окружения без префикса NEXT_PUBLIC_, поэтому в браузер он не попадает.
 *
 * Чтение кэшируется директивой 'use cache' (Cache Components):
 *  - cacheLife задаёт, сколько живёт запись;
 *  - cacheTag помечает запись тегом, по которому её можно сбросить после мутации.
 * Мутации не кэшируются никогда.
 */

export const USERS_TAG = 'users';
export const userTag = (id: number) => `user-${id}`;

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<S extends z.ZodType>(path: string, schema: S, init?: RequestInit): Promise<z.infer<S>> {
  let response: Response;
  try {
    response = await fetch(`${apiEnv().DUMMYJSON_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError('Сервис DummyJSON недоступен', 503);
  }

  const body: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const error = apiErrorSchema.safeParse(body);
    throw new ApiError(error.success ? error.data.message : `DummyJSON ответил ошибкой ${response.status}`, response.status);
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    console.error(`Неожиданный ответ DummyJSON на ${path}:`, parsed.error.issues);
    throw new ApiError('DummyJSON вернул данные в неожиданном формате', 502);
  }
  return parsed.data;
}

// ---------- чтение ----------

/** Поля, нужные для карточки в списке (?select= уменьшает размер ответа). */
const LIST_FIELDS = [
  'firstName', 'lastName', 'age', 'gender', 'email', 'phone', 'username',
  'birthDate', 'image', 'role', 'address', 'company',
].join(',');

export interface UsersPageRequest extends UsersQuery {
  skip: number;
  limit: number;
}

/** Выбор эндпоинта: /users, /users/search или /users/filter. */
function buildListPath({ q, role, sort, skip, limit }: UsersPageRequest): string {
  const params = new URLSearchParams({ limit: String(limit), skip: String(skip), select: LIST_FIELDS });

  const order = sortToApi(sort);
  if (order) {
    params.set('sortBy', order.sortBy);
    params.set('order', order.order);
  }

  if (q) {
    params.set('q', q);
    return `/users/search?${params}`;
  }
  if (role !== 'all') {
    params.set('key', 'role');
    params.set('value', role);
    return `/users/filter?${params}`;
  }
  return `/users?${params}`;
}

/** Одна страница списка пользователей. */
export async function getUsersPage(params: UsersPageRequest): Promise<UsersPage> {
  'use cache';
  cacheLife('minutes');
  cacheTag(USERS_TAG);

  const data = await request(buildListPath(params), apiUsersResponseSchema);
  return {
    users: data.users.map(mapApiUser),
    total: data.total,
    skip: data.skip,
    limit: data.limit,
  };
}

async function fetchUser(id: number): Promise<User | null> {
  'use cache';
  cacheLife('hours');
  cacheTag(USERS_TAG, userTag(id));

  try {
    return mapApiUser(await request(`/users/${id}`, apiUserSchema));
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/**
 * Пользователь по id или null, если его нет.
 * React.cache дедуплицирует вызовы в рамках одного запроса к странице:
 * generateMetadata и сама страница получат один и тот же результат.
 */
export const getUser = cache(fetchUser);

/** Последние посты пользователя (для секции на странице профиля). */
export async function getUserPosts(userId: number, limit = 5): Promise<PostsPage> {
  'use cache';
  cacheLife('hours');
  cacheTag(userTag(userId));

  const params = new URLSearchParams({ limit: String(limit), select: 'title,body,tags,reactions,views' });
  const data = await request(`/users/${userId}/posts?${params}`, apiPostsResponseSchema);
  return { posts: data.posts.map(mapApiPost), total: data.total };
}

// ---------- мутации (DummyJSON их только имитирует) ----------

export async function createUser(payload: ApiUserPayload): Promise<User> {
  const created = await request('/users/add', apiUserSchema, { method: 'POST', body: JSON.stringify(payload) });
  return mapApiUser(created);
}

export async function updateUser(id: number, payload: ApiUserPayload): Promise<User> {
  const updated = await request(`/users/${id}`, apiUserSchema, { method: 'PUT', body: JSON.stringify(payload) });
  return mapApiUser(updated);
}

export async function deleteUser(id: number): Promise<{ id: number; deletedOn: string }> {
  const deleted = await request(`/users/${id}`, apiDeletedUserSchema, { method: 'DELETE' });
  return { id: deleted.id, deletedOn: deleted.deletedOn };
}
