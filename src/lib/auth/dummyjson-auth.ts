import 'server-only';

import { z } from 'zod';
import { apiEnv } from '../env';
import { USER_ROLES } from '../users/constants';
import type { LoginInput } from './login-schema';
import { toAccessRole, type AccessRole } from './permissions';

/**
 * Проверка логина и пароля через DummyJSON:
 *  1. POST /auth/login — DummyJSON сверяет пароль и возвращает accessToken;
 *  2. GET  /auth/me    — по токену получаем полную запись пользователя, в том числе role.
 * Оба ответа проверяются Zod-схемами. Токен DummyJSON нужен только на время входа:
 * мы его не сохраняем ни в cookie, ни в сессии — приложению достаточно id, имени и роли.
 */

const loginResponseSchema = z.object({
  id: z.number().int().positive(),
  username: z.string(),
  accessToken: z.string().min(1),
});

const meResponseSchema = z.object({
  id: z.number().int().positive(),
  username: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.email(),
  image: z.string().optional(),
  role: z.enum(USER_ROLES),
});

export interface AuthenticatedUser {
  id: string;
  username: string;
  name: string;
  email: string;
  image: string | null;
  role: AccessRole;
}

/** DummyJSON не ответил или ответил неожиданно — это не «неверный пароль». */
export class AuthServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthServiceError';
  }
}

async function call(path: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(`${apiEnv().DUMMYJSON_URL}${path}`, { ...init, cache: 'no-store' });
  } catch {
    throw new AuthServiceError('DummyJSON недоступен');
  }
}

/** Возвращает пользователя или null, если логин/пароль неверные. */
export async function loginWithDummyJson({ username, password }: LoginInput): Promise<AuthenticatedUser | null> {
  const loginResponse = await call('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    // Токен нужен на несколько секунд — просим минимальный срок жизни
    body: JSON.stringify({ username, password, expiresInMins: 1 }),
  });

  // На неверные данные DummyJSON отвечает 400 { message: 'Invalid credentials' }
  if (loginResponse.status === 400 || loginResponse.status === 401) return null;
  if (!loginResponse.ok) throw new AuthServiceError(`DummyJSON /auth/login ответил ${loginResponse.status}`);

  const login = loginResponseSchema.safeParse(await loginResponse.json().catch(() => null));
  if (!login.success) throw new AuthServiceError('Неожиданный ответ /auth/login');

  const meResponse = await call('/auth/me', {
    headers: { Authorization: `Bearer ${login.data.accessToken}` },
  });
  if (!meResponse.ok) throw new AuthServiceError(`DummyJSON /auth/me ответил ${meResponse.status}`);

  const me = meResponseSchema.safeParse(await meResponse.json().catch(() => null));
  if (!me.success || me.data.id !== login.data.id) throw new AuthServiceError('Неожиданный ответ /auth/me');

  return {
    id: String(me.data.id),
    username: me.data.username,
    name: `${me.data.firstName} ${me.data.lastName}`.trim(),
    email: me.data.email,
    image: me.data.image ?? null,
    role: toAccessRole(me.data.role),
  };
}
